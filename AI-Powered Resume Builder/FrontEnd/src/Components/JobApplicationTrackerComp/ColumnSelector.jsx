// src/Components/JobApplicationTrackerComp/ColumnSelector.jsx
import React from 'react';

export default function ColumnSelector({ isOpen, onClose, columns, visibleColumns, onToggleColumn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Select Columns</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {columns.map(col => (
            <label key={col.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => onToggleColumn(col.key)}
                className="rounded bg-gray-700 border-gray-600 text-purple-500"
              />
              <span className="text-white">{col.label}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}