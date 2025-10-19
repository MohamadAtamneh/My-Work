import React from 'react';

const ClassicTemplate = ({ data, config }) => {
  if (!data || !config) {
    return <div>Loading template...</div>;
  }
  return (
  <div className="min-h-screen" style={{ backgroundColor: config?.colors?.background, color: config?.colors?.text }}>
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: config?.colors?.primary }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: config?.colors?.primary }}>
          {data.personalInfo.name}
        </h1>
        <p className="text-lg mb-3" style={{ color: config?.colors?.secondary }}>
          {data.personalInfo.title}
        </p>
        <div className="flex justify-center gap-4 text-sm" style={{ color: config?.colors?.secondary }}>
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 uppercase tracking-wide" style={{ color: config?.colors?.primary }}>
          Summary
        </h2>
        <p className="text-justify leading-relaxed">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 uppercase tracking-wide" style={{ color: config?.colors?.primary }}>
          Professional Experience
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} className="mb-5">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-bold text-lg">{exp.title}</h3>
                <p className="italic" style={{ color: config?.colors?.secondary }}>{exp.company}, {exp.location}</p>
              </div>
              <span className="text-sm" style={{ color: config?.colors?.secondary }}>{exp.startDate} - {exp.endDate}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {Array.isArray(exp.description) ? (
                exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))
              ) : (
                <li>{exp.description}</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 uppercase tracking-wide" style={{ color: config?.colors?.primary }}>
          Education
        </h2>
        {data.education.map((edu, idx) => (
          <div key={idx} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{edu.degree}</h3>
                <p style={{ color: config?.colors?.secondary }}>{edu.institution}, {edu.location}</p>
              </div>
              <span className="text-sm" style={{ color: config?.colors?.secondary }}>{edu.year}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xl font-bold mb-3 uppercase tracking-wide" style={{ color: config?.colors?.primary }}>
          Technical Skills
        </h2>
        <p>{data.skills.join(' • ')}</p>
      </div>
    </div>
  </div>
);};

export default ClassicTemplate;