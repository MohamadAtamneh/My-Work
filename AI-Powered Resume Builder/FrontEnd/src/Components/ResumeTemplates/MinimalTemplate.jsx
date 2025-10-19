import React from 'react';

const MinimalTemplate = ({ data, config }) => {
  if (!data || !config) {
    return <div>Loading template...</div>;
  }
  return (
  <div className="min-h-screen" style={{ backgroundColor: config?.colors?.background, color: config?.colors?.text }}>
    <div className="max-w-3xl mx-auto p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-semibold mb-2">{data.personalInfo.name}</h1>
        <p className="text-xl mb-6" style={{ color: config?.colors?.secondary }}>{data.personalInfo.title}</p>
        <div className="flex gap-6 text-sm" style={{ color: config?.colors?.secondary }}>
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-10">
        <p className="text-lg leading-relaxed">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-10">
        <h2 className="text-sm uppercase tracking-widest mb-6 font-semibold" style={{ color: config?.colors?.secondary }}>
          Experience
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} className="mb-8">
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{exp.title}</h3>
              <span className="text-sm" style={{ color: config?.colors?.secondary }}>{exp.startDate} — {exp.endDate}</span>
            </div>
            <p className="mb-3" style={{ color: config?.colors?.secondary }}>{exp.company}</p>
            <ul className="space-y-2">
              {Array.isArray(exp.description) ? (
                exp.description.map((desc, i) => (
                  <li key={i} className="leading-relaxed">{desc}</li>
                ))
              ) : (
                <li className="leading-relaxed">{exp.description}</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-10">
        <h2 className="text-sm uppercase tracking-widest mb-6 font-semibold" style={{ color: config?.colors?.secondary }}>
          Education
        </h2>
        {data.education.map((edu, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-lg">{edu.degree}</h3>
                <p style={{ color: config?.colors?.secondary }}>{edu.institution}</p>
              </div>
              <span className="text-sm" style={{ color: config?.colors?.secondary }}>{edu.year}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-sm uppercase tracking-widest mb-6 font-semibold" style={{ color: config?.colors?.secondary }}>
          Skills
        </h2>
        <p className="text-lg">{data.skills.join(', ')}</p>
      </div>
    </div>
  </div>
);};

export default MinimalTemplate;