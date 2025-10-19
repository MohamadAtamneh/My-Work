import React from 'react';
import { FileText, Briefcase, GraduationCap, Award, Mail, Phone, MapPin } from 'lucide-react';

const ModernTemplate = ({ data, config }) => {
  if (!data || !config) {
    return <div>Loading template...</div>;
  }
  return (
  <div className="min-h-screen" style={{ backgroundColor: config?.colors?.background, color: config?.colors?.text }}>
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="border-l-4 pl-6 mb-8" style={{ borderColor: config?.colors?.primary }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: config?.colors?.primary }}>
          {data.personalInfo.name}
        </h1>
        <p className="text-xl mb-4" style={{ color: config?.colors?.secondary }}>
          {data.personalInfo.title}
        </p>
        <div className="flex flex-wrap gap-4 text-sm" style={{ color: config?.colors?.secondary }}>
          <span className="flex items-center gap-1"><Mail size={14} />{data.personalInfo.email}</span>
          <span className="flex items-center gap-1"><Phone size={14} />{data.personalInfo.phone}</span>
          <span className="flex items-center gap-1"><MapPin size={14} />{data.personalInfo.location}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2" style={{ color: config?.colors?.primary }}>
          <FileText size={20} /> Professional Summary
        </h2>
        <p className="leading-relaxed">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: config?.colors?.primary }}>
          <Briefcase size={20} /> Experience
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} className="mb-6 border-l-2 pl-4" style={{ borderColor: config?.colors?.accent }}>
            <h3 className="text-lg font-bold">{exp.title}</h3>
            <p className="font-semibold" style={{ color: config?.colors?.secondary }}>{exp.company} | {exp.location}</p>
            <p className="text-sm mb-2" style={{ color: config?.colors?.secondary }}>{exp.startDate} - {exp.endDate}</p>
            <ul className="list-disc list-inside space-y-1">
              {Array.isArray(exp.description) ? (
                exp.description.map((desc, i) => (
                  <li key={i} className="text-sm">{desc}</li>
                ))
              ) : (
                <li className="text-sm">{exp.description}</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: config?.colors?.primary }}>
          <GraduationCap size={20} /> Education
        </h2>
        {data.education.map((edu, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="text-lg font-bold">{edu.degree}</h3>
            <p style={{ color: config?.colors?.secondary }}>{edu.institution} | {edu.location}</p>
            <p className="text-sm" style={{ color: config?.colors?.secondary }}>Graduated: {edu.year} | GPA: {edu.gpa}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: config?.colors?.primary }}>
          <Award size={20} /> Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full text-sm font-semibold" 
                  style={{ backgroundColor: config?.colors?.primary, color: 'white' }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);};

export default ModernTemplate;