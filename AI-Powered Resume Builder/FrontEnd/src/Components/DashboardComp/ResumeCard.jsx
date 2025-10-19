import React from 'react';
import { Link } from 'react-router-dom';

const ResumeCard = ({ resume, onDelete }) => {
  // Defensive check for resume object
  if (!resume) {
    return null;
  }

  const handleModifyClick = () => {
    // Use window.location to navigate, passing resume ID as a query parameter
    window.location.href = `/create-resume?id=${resume.id}`;
  };

  return (
    <li className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition">
      <div className="min-w-0">
        <div className="text-sm font-medium text-white truncate">{resume.title || 'Untitled Resume'}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          Updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleModifyClick} className="text-xs text-purple-300 hover:text-purple-200">Modify</button>
        <button onClick={() => onDelete(resume.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
      </div>
    </li>
  );
};

export default ResumeCard;
