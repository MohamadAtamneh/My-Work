// src/Components/DashboardComp/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import archiveIcon from '../../assets/archive-blue.png'; // Adjust path as needed
import ResumeCard from './ResumeCard'; // Import the new component

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const StatCard = ({ icon, label, value, accent = 'bg-white/10' }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur shadow-lg hover:shadow-xl transition">
    <div className={`h-10 w-10 grid place-items-center rounded-lg ${accent} text-white/90`}>{icon}</div>
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  </div>
);

const ActionCard = ({ icon, label, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur shadow transition ${className}`}
  >
    <div className="h-10 w-10 grid place-items-center rounded-lg bg-purple-500/20">{icon}</div>
    <div className="text-left">
      <div className="text-sm font-semibold text-white">{label}</div>
      <div className="text-xs text-gray-400">Quick action</div>
    </div>
  </button>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ jobsAdded: 0, conversionRate: 0 });
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, statsRes, resumesRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/jobs/stats'),
          api.get('/resumes') // Fetch resumes from the new endpoint
        ]);
        setJobs(jobsRes.data);
        setStats(statsRes.data);
        setResumes(resumesRes.data.items || []);
      } catch (e) {
        console.error('Dashboard fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDeleteResume = async (id) => {
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      console.error('Failed to delete resume', error);
    }
  };

  const activeCount = useMemo(() => jobs.filter(j => !j.archived).length, [jobs]);
  const archivedCount = useMemo(() => jobs.filter(j => j.archived).length, [jobs]);
  const recentJobs = useMemo(() => jobs
    .filter(j => !j.archived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5), [jobs]);

  const recentResumes = useMemo(() => (
    [...resumes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)
  ), [resumes]);

  return (
    <div className="relative">
      {/* Decorative background gradient */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-purple-700/10 via-indigo-600/10 to-transparent blur-3xl" />

      {/* Top header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">Build resumes with AI and stay on top of your applications.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📁" label="Jobs added (7d)" value={stats.jobsAdded} accent="bg-purple-500/20" />
        <StatCard icon="📈" label="Interview conversion" value={`${stats.conversionRate}%`} accent="bg-teal-500/20" />
        <StatCard icon="🟢" label="Active applications" value={activeCount} accent="bg-green-500/20" />
        <StatCard icon={<img src={archiveIcon} alt="Archived" className="h-5 w-5" />}  label="Archived" value={archivedCount} accent="bg-blue-500/20" />
      </div>

      {/* Actions & recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-3">
          <ActionCard icon="✨" label="Generate Resume with AI" onClick={() => window.location.assign('/create-resume')} />
          <ActionCard icon="➕" label="New Job Application" onClick={() => window.location.assign('/JobTracker')} />
          <ActionCard icon="⬇️" label="Export Applications" onClick={() => window.location.assign('/JobTracker')} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent applications</h3>
            <a href="/JobTracker" className="text-xs text-purple-300 hover:text-purple-200">View all</a>
          </div>
          <ul className="divide-y divide-white/5">
            {loading ? (
              <li className="px-5 py-4 text-gray-400 text-sm">Loading…</li>
            ) : recentJobs.length === 0 ? (
              <li className="px-5 py-10 text-center text-gray-400 text-sm">No recent applications. Add your first job to get started.</li>
            ) : (
              recentJobs.map(job => (
                <li key={job._id} className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{job.position} <span className="text-gray-400 font-normal">· {job.company}</span></div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(job.createdAt).toLocaleDateString()} • Status: {job.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={job.jobLink || '#'} target="_blank" rel="noreferrer" className="text-xs text-purple-300 hover:text-purple-200 underline">Link</a>
                    <a href="/JobTracker" className="text-xs text-gray-300 hover:text-white">Open</a>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Recent Resumes */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Your resumes</h3>
          <a href="/resumes" className="text-xs text-purple-300 hover:text-purple-200">View all</a>
        </div>
        <ul className="divide-y divide-white/5">
          {loading ? (
            <li className="px-5 py-4 text-gray-400 text-sm">Loading…</li>
          ) : recentResumes.length === 0 ? (
            <li className="px-5 py-10 text-center text-gray-400 text-sm">No resumes yet. Create one with AI to see it here.</li>
          ) : (
            recentResumes.map(resume => (
              <ResumeCard key={resume._id} resume={resume} onDelete={handleDeleteResume} />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}