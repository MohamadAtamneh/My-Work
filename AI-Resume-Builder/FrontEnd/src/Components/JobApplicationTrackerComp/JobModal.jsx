// src/Components/JobApplicationTrackerComp/JobModal.jsx
import React, { useState } from 'react';

export default function JobModal({ isOpen, job, onClose, onSave, user, visibleColumns = [] }) {
  const [formData, setFormData] = useState({
    position: job?.position || '',
    company: job?.company || '',
    location: job?.location || '',
    jobLink: job?.jobLink || '',
    status: job?.status || 'Applied',
    dateApplied: job?.dateApplied ? new Date(job.dateApplied).toISOString().split('T')[0] : '',
    deadline: job?.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    notes: job?.notes || '',
    salary: job?.salary || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const cleanedData = {
      userId: user?._id,
      ...formData
    };

    try {
      const url = job 
        ? `/api/jobs/${job._id}`
        : '/api/jobs';
      
      const method = job ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (!res.ok) throw new Error(await res.json().error);
      
      onSave();
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {job ? 'Edit Job Application' : 'Add New Job Application'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required core fields */}
              <input
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Job Position *"
                className="p-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
                required
              />
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company *"
                className="p-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
                required
              />

              {/* Optional fields follow visibility */}
              {visibleColumns.includes('location') && (
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="p-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
                />
              )}
              {visibleColumns.includes('url') && (
                <input
                  name="jobLink"
                  value={formData.jobLink}
                  onChange={handleChange}
                  placeholder="Job URL"
                  className="p-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
                />
              )}
              {visibleColumns.includes('salary') && (
                <input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Salary"
                  className="p-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
                />
              )}
              {visibleColumns.includes('dateApplied') && (
                <input
                  name="dateApplied"
                  type="date"
                  value={formData.dateApplied}
                  onChange={handleChange}
                  className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
                />
              )}
              <input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
              />
              {visibleColumns.includes('status') && (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="p-3 bg-gray-900 border border-gray-700 rounded text-white"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Ghosted">Ghosted</option>
                </select>
              )}
              </div>
            {visibleColumns.includes('notes') && (
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500"
                rows="4"
              />
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {job ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}