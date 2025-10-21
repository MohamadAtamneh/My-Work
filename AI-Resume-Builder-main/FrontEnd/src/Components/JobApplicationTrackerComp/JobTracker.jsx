// src/Components/JobApplicationTrackerComp/JobTracker.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import JobModal from './JobModal';
import ColumnSelector from './ColumnSelector';
import { exportToExcel } from '../../Utility/exportToExcel';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: '/api', // thanks to Vite proxy → http://localhost:3000/api
});

// Add request interceptor to attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// All possible columns
const ALL_COLUMNS = [
  { key: 'position', label: 'Position', visible: true },
  { key: 'company', label: 'Company', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'dateSaved', label: 'Date Saved', visible: true },
  { key: 'dateApplied', label: 'Date Applied', visible: true },
  { key: 'url', label: 'URL', visible: true },
  { key: 'location', label: 'Location', visible: false },
  { key: 'salary', label: 'Salary', visible: false },
  { key: 'notes', label: 'Notes', visible: true }
];

export default function JobTracker() {
  const { user } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [stats, setStats] = useState({ jobsAdded: 0, conversionRate: 0 });
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.filter(col => col.visible).map(col => col.key)
  );
  const [editingJob, setEditingJob] = useState(null);

  // Inline editing state
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editingValue, setEditingValue] = useState('');

  // Keep columns ordered as in ALL_COLUMNS
  const columnsToRender = useMemo(() => {
    const set = new Set(visibleColumns);
    return ALL_COLUMNS.filter(c => set.has(c.key));
  }, [visibleColumns]);

  const fieldKeyMap = {
    position: 'position',
    company: 'company',
    status: 'status',
    dateApplied: 'dateApplied',
    url: 'jobLink',
    location: 'location',
    salary: 'salary',
    notes: 'notes',
  };

  const beginEdit = (job, field) => {
    let currentVal = '';
    if (field === 'dateApplied') {
      currentVal = job.dateApplied ? new Date(job.dateApplied).toISOString().split('T')[0] : '';
    } else if (field === 'url') {
      currentVal = job.jobLink || '';
    } else {
      currentVal = job[field] ?? '';
    }
    setEditingCell({ id: job._id, field });
    setEditingValue(String(currentVal));
  };

  const cancelEdit = () => {
    setEditingCell({ id: null, field: null });
    setEditingValue('');
  };

  const updateJobField = async (jobId, field, value) => {
    try {
      const key = fieldKeyMap[field];
      if (!key) return;
      const payload = { [key]: value };
      await api.put(`/jobs/${jobId}`, payload);
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, [key]: value } : j));
    } catch (err) {
      alert('Update failed');
      console.error('Inline update error:', err);
    }
  };

  const commitEdit = async () => {
    const { id, field } = editingCell;
    if (!id || !field) return;
    let value = editingValue;
    if (field === 'dateApplied') {
      value = value || null;
    }
    await updateJobField(id, field, value);
    cancelEdit();
  };

  const handleEditKeyDown = async (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === 'Enter') {
      if (editingCell.field === 'notes') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          await commitEdit();
        }
      } else {
        e.preventDefault();
        await commitEdit();
      }
    }
  };

  // Derived stats
  const conversionRate = useMemo(() => {
    const total = jobs.filter(job => !job.archived).length;
    const interviews = jobs.filter(job => !job.archived && job.status === 'Interview').length;
    return total > 0 ? Math.round((interviews / total) * 100) : 0;
  }, [jobs]);

  const activeCount = useMemo(() => jobs.filter(j => !j.archived).length, [jobs]);
  const archivedCount = useMemo(() => jobs.filter(j => j.archived).length, [jobs]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedJobs([]);
  }, [showArchived]);

  const fetchData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/stats')
      ]);
      setJobs(jobsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle selection
  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job._id));
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    try {
      await api.post('/jobs/bulk', { action, jobIds: selectedJobs });
      setSelectedJobs([]);
      fetchData();
    } catch (err) {
      alert('Bulk action failed');
      console.error('Bulk action error:', err);
    }
  };

  // Single actions
  const handleArchive = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/archive`);
      fetchData();
    } catch (err) {
      alert('Archive failed');
      console.error('Archive error:', err);
    }
  };

  const handleUnarchive = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}`, { archived: false });
      fetchData();
    } catch (err) {
      alert('Restore failed');
      console.error('Unarchive error:', err);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
      console.error('Delete error:', err);
    }
  };

  // Blur buttons on release to avoid sticky hover/focus visuals
  const releaseBlur = (e) => {
    try { e.currentTarget && e.currentTarget.blur && e.currentTarget.blur(); } catch {}
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredJobs.map(job => ({
      Position: job.position,
      Company: job.company,
      Status: job.status,
      'Date Saved': new Date(job.createdAt).toLocaleDateString(),
      'Date Applied': job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : '',
      URL: job.jobLink || '',
      Location: job.location || '',
      Salary: job.salary || '',
      Notes: job.notes || ''
    }));
    exportToExcel(exportData, 'Job_Applications');
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !search || 
        job.position.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
      const matchesArchived = showArchived ? job.archived : !job.archived;
      return matchesSearch && matchesStatus && matchesArchived;
    });
  }, [jobs, search, filterStatus, showArchived]);

  if (loading) return <div className="pt-20 px-6">Loading...</div>;

  const StatCard = ({ icon, label, value, accent }) => (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur shadow-lg hover:shadow-xl transition">
      <div className={`h-10 w-10 grid place-items-center rounded-lg ${accent} text-white/90`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-lg font-semibold text-white">{value}</div>
      </div>
    </div>
  );

  const renderCell = (job, colKey) => {
    const isEditing = editingCell.id === job._id && editingCell.field === colKey;
    switch (colKey) {
      case 'position':
        return (
          <td className="px-4 py-3" onDoubleClick={() => beginEdit(job, 'position')} title="Double-click to edit">
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="font-medium text-white">{job.position}</span>
            )}
          </td>
        );
      case 'company':
        return (
          <td className="px-4 py-3" onDoubleClick={() => beginEdit(job, 'company')} title="Double-click to edit">
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-gray-200">{job.company}</span>
            )}
          </td>
        );
      case 'status':
        return (
          <td className="px-4 py-3">
            <select
              className="px-2 py-1 bg-gray-900/60 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={job.status}
              onChange={(e) => updateJobField(job._id, 'status', e.target.value)}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Ghosted">Ghosted</option>
            </select>
          </td>
        );
      case 'dateSaved':
        return <td className="px-4 py-3 text-sm text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</td>;
      case 'dateApplied':
        return (
          <td className="px-4 py-3" onDoubleClick={() => beginEdit(job, 'dateApplied')} title="Double-click to edit">
            {isEditing ? (
              <input
                type="date"
                autoFocus
                className="px-2 py-1 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-gray-200">{job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : '-'}</span>
            )}
          </td>
        );
      case 'url':
        return (
          <td className="px-4 py-3" onDoubleClick={() => beginEdit(job, 'url')} title="Double-click to edit">
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://..."
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              job.jobLink ? (
                <a href={job.jobLink} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline text-sm">Open</a>
              ) : (
                <span className="text-gray-500">-</span>
              )
            )}
          </td>
        );
      case 'location':
        return (
          <td className="px-4 py-3" onDoubleClick={() => beginEdit(job, 'location')} title="Double-click to edit">
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-gray-200">{job.location || '-'}</span>
            )}
          </td>
        );
      case 'salary':
        return (
          <td className="px-4 py-3" onDoubleClick={() => beginEdit(job, 'salary')} title="Double-click to edit">
            {isEditing ? (
              <input
                autoFocus
                className="w-full p-2 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="text-gray-200">{job.salary || '-'}</span>
            )}
          </td>
        );
      case 'notes':
        return (
          <td className="px-4 py-3 text-sm align-top" onDoubleClick={() => beginEdit(job, 'notes')} title="Double-click to edit">
            {isEditing ? (
              <textarea
                autoFocus
                rows={3}
                className="w-full p-2 bg-gray-900/60 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleEditKeyDown}
              />
            ) : (
              <span className="block max-w-xs truncate text-gray-200">{job.notes || '-'}</span>
            )}
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative pt-6 pb-10 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Decorative background gradient */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-purple-700/10 via-indigo-600/10 to-transparent blur-3xl" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Job Applications</h1>
            <p className="mt-1 text-sm text-gray-400">Track your applications, update statuses, and stay organized with a clean overview.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedJobs.length > 0 && (
              <div className="flex gap-2">
                {!showArchived && (
                  <button 
                    onClick={() => handleBulkAction('archive')}
                    onMouseUp={releaseBlur}
                    onMouseLeave={releaseBlur}
                    onTouchEnd={releaseBlur}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 bg-gray-700 hover:bg-gray-600 border border-white/10 shadow"
                  >
                    Archive ({selectedJobs.length})
                  </button>
                )}
                <button 
                  onClick={() => handleBulkAction('delete')}
                  onMouseUp={releaseBlur}
                  onMouseLeave={releaseBlur}
                  onTouchEnd={releaseBlur}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 bg-red-700 hover:bg-red-600 border border-white/10 shadow"
                >
                  Delete ({selectedJobs.length})
                </button>
              </div>
            )}
            <button 
              onClick={handleExport}
              onMouseUp={releaseBlur}
              onMouseLeave={releaseBlur}
              onTouchEnd={releaseBlur}
              className="px-4 py-2 rounded-lg text-sm font-medium text-purple-300 border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 shadow"
            >
              ⬇️ Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              onMouseUp={releaseBlur}
              onMouseLeave={releaseBlur}
              onTouchEnd={releaseBlur}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow"
            >
              ➕ New Job
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="📁" label="Jobs added (7d)" value={stats.jobsAdded} accent="bg-purple-500/20" />
        <StatCard icon="📈" label="Applications → Interview" value={`${conversionRate}%`} accent="bg-teal-500/20" />
        <button
          onClick={() => setShowArchived(prev => !prev)}
          onMouseUp={releaseBlur}
          onMouseLeave={releaseBlur}
          onTouchEnd={releaseBlur}
          className={`text-left ${showArchived ? 'ring-2 ring-purple-500/50' : ''} rounded-xl`}
        >
          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur shadow-lg hover:shadow-xl transition">
            <div className="h-10 w-10 grid place-items-center rounded-lg bg-blue-500/20 text-white/90">🗂️</div>
            <div>
              <div className="text-xs text-gray-400">{showArchived ? 'Viewing' : 'Switch to'} Archived</div>
              <div className="text-sm text-gray-300"><span className="text-white font-semibold">{archivedCount}</span> archived • <span className="text-white font-semibold">{activeCount}</span> active</div>
            </div>
          </div>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search positions or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 shadow"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900/60 border border-white/10 text-white outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Ghosted">Ghosted</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => setShowColumnSelector(true)}
            onMouseUp={releaseBlur}
            onMouseLeave={releaseBlur}
            onTouchEnd={releaseBlur}
            className="px-4 py-2 rounded-lg bg-gray-900/60 border border-white/10 text-gray-300 hover:bg-gray-900/80 shadow"
          >
            ⚙️ Columns
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 sticky top-0 backdrop-blur z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 tracking-wider w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-gray-800 border-gray-600 text-purple-500"
                  />
                </th>
                {columnsToRender.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={columnsToRender.length + 2} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="text-4xl mb-3">🗂️</div>
                      <h3 className="text-lg font-semibold text-white">No job applications found</h3>
                      <p className="mt-1 text-sm text-gray-400">Try adjusting your filters or add a new job to get started.</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <button onClick={() => { setFilterStatus('All'); setSearch(''); }} className="px-4 py-2 rounded-lg text-sm text-gray-200 bg-gray-800/80 border border-white/10 hover:bg-gray-700">Clear filters</button>
                        <button onClick={() => setShowAddForm(true)} className="px-4 py-2 rounded-lg text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">Add Job</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job._id} className="odd:bg-white/0 even:bg-white/[0.02] hover:bg-white/[0.06] transition">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedJobs.includes(job._id)}
                        onChange={() => toggleJobSelection(job._id)}
                        className="rounded bg-gray-800 border-gray-600 text-purple-500"
                      />
                    </td>

                    {columnsToRender.map(col => (
                      <React.Fragment key={col.key}>
                        {renderCell(job, col.key)}
                      </React.Fragment>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {showArchived ? (
                          <>
                            <button 
                              onClick={() => handleUnarchive(job._id)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-3 py-1.5 rounded-lg text-sm text-green-300 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
                            >
                              Restore
                            </button>
                            <button 
                              onClick={() => handleDelete(job._id)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-3 py-1.5 rounded-lg text-sm text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditingJob(job)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-3 py-1.5 rounded-lg text-sm text-blue-300 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleArchive(job._id)}
                              onMouseUp={releaseBlur}
                              onMouseLeave={releaseBlur}
                              onTouchEnd={releaseBlur}
                              className="px-3 py-1.5 rounded-lg text-sm text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10"
                            >
                              Archive
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 text-center text-gray-500 text-xs">
        <p>© {new Date().getFullYear()} ResuAI — Your AI‑Powered Career Assistant</p>
      </footer>

      {/* Modals */}
      {showAddForm && (
        <JobModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSave={fetchData}
          user={user}
          visibleColumns={visibleColumns}
        />
      )}
      
      {editingJob && (
        <JobModal
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={fetchData}
          user={user}
          visibleColumns={visibleColumns}
        />
      )}
      
      {showColumnSelector && (
        <ColumnSelector
          isOpen={showColumnSelector}
          onClose={() => setShowColumnSelector(false)}
          columns={ALL_COLUMNS}
          visibleColumns={visibleColumns}
          onToggleColumn={(columnKey) => {
            setVisibleColumns(prev => {
              const set = new Set(prev);
              if (set.has(columnKey)) set.delete(columnKey); else set.add(columnKey);
              const order = ALL_COLUMNS.map(c => c.key);
              return order.filter(k => set.has(k));
            });
          }}
        />
      )}
    </div>
  );
}
