import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const CreativeTemplate = ({ data, config }) => (
  <div className="min-h-screen" style={{ backgroundColor: config?.colors?.background, color: config?.colors?.text }}>
    <div className="grid grid-cols-3 max-w-6xl mx-auto">
      {/* Sidebar */}
      <div className="col-span-1 p-8" style={{ backgroundColor: config?.colors?.primary, color: 'white' }}>
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full mx-auto mb-4"
               style={{ backgroundColor: config?.colors?.accent }}>
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
              {data.personalInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">{data.personalInfo.name}</h1>
          <p className="text-center text-sm opacity-90">{data.personalInfo.title}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 pb-2 border-b border-white border-opacity-30">Contact</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2"><Mail size={16} className="mt-1" /><span>{data.personalInfo.email}</span></p>
            <p className="flex items-start gap-2"><Phone size={16} className="mt-1" /><span>{data.personalInfo.phone}</span></p>
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-1" /><span>{data.personalInfo.location}</span></p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 pb-2 border-b border-white border-opacity-30">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded" 
                    style={{ backgroundColor: config?.colors?.accent }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3 pb-2 border-b border-white border-opacity-30">Certifications</h3>
          <div className="space-y-2 text-sm">
            {(data.certifications || []).map((cert, idx) => (
              <div key={idx}>
                <p className="font-semibold">{cert.name}</p>
                <p className="text-xs opacity-80">{cert.year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-2 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3" style={{ color: config?.colors?.primary }}>About Me</h2>
          <p className="leading-relaxed">{data.personalInfo.summary}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: config?.colors?.primary }}>Experience</h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-6 pb-6 border-b" style={{ borderColor: config?.colors?.secondary }}>
              <h3 className="text-lg font-bold" style={{ color: config?.colors?.primary }}>{exp.title}</h3>
              <p className="font-semibold mb-1">{exp.company}</p>
              <p className="text-sm mb-3" style={{ color: config?.colors?.secondary }}>
                {exp.startDate} - {exp.endDate} | {exp.location}
              </p>
              <ul className="space-y-1">
                {Array.isArray(exp.description) ? (
                  exp.description.map((desc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: config?.colors?.primary }}>▸</span>
                      <span>{desc}</span>
                    </li>
                  ))
                ) : (
                  <li>{exp.description}</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: config?.colors?.primary }}>Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-bold text-lg">{edu.degree}</h3>
              <p className="font-semibold">{edu.institution}</p>
              <p className="text-sm" style={{ color: config?.colors?.secondary }}>
                {edu.year} | GPA: {edu.gpa}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CreativeTemplate;