
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Initial empty JSON Resume structure (important to avoid errors)
const initialResumeData = {
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: {
      address: '',
      postalCode: '',
      city: '',
      countryCode: '',
      region: '',
    },
    profiles: [{ network: '', username: '', url: '' }],
  },
  work: [],
  education: [],
  skills: [],
  awards: [],
  publications: [],
  volunteer: [],
  references: [],
  projects: [],
  interests: [],
  languages: [],
};

const transformTemplateData = (template) => {
  return {
    basics: {
      name: template.personalInfo.name || '',
      label: '', // Not available in template
      email: template.personalInfo.email || '',
      phone: template.personalInfo.phone || '',
      url: template.personalInfo.website || '',
      summary: template.summary || '',
      location: {
        address: template.personalInfo.address || '',
        postalCode: '', // Not available in template
        city: '', // Not available in template
        countryCode: '', // Not available in template
        region: '', // Not available in template
      },
      profiles: template.personalInfo.linkedin ? [{ network: 'LinkedIn', username: template.personalInfo.linkedin, url: `https://www.linkedin.com/in/${template.personalInfo.linkedin}` }] : [],
    },
    work: template.experience || [],
    education: template.education || [],
    skills: template.skills ? template.skills.map(skill => ({ name: skill, level: '', keywords: [] })) : [],
    awards: template.awards || [],
    publications: template.publications || [],
    volunteer: [], // Not available in template
    references: [], // Not available in template
    projects: template.portfolio || [],
    interests: [], // Not available in template
    languages: [], // Not available in template
  };
};

function SectionCard({ title, action, footer, as: Tag = 'section', className = '', headerClassName = '', bodyClassName = '', footerClassName = '', children }) {
  return (
    <Tag className={['rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl', className].join(' ')}>
      {(title || action) && (
        <div className={['px-5 py-4 border-b border-white/10 flex items-center justify-between', headerClassName].join(' ')}>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {action ? <div className="text-xs text-purple-300 hover:text-purple-200">{action}</div> : null}
        </div>
      )}
      <div className={['p-4', bodyClassName].join(' ')}>{children}</div>
      {footer ? <div className={['px-5 py-3 border-t border-white/10 text-xs text-gray-400', footerClassName].join(' ')}>{footer}</div> : null}
    </Tag>
  );
}

function ResumePreviewPanel({ title = 'Live preview', action, loading = false, error = null, previewHtml = '', initialScale = 0.95, minScale = 0.75, maxScale = 1.25, step = 0.05, panelClassName = '', paperClassName = '', headerClassName = '', bodyClassName = '' }) {
  const [scale, setScale] = useState(initialScale);
  const presets = useMemo(() => [0.75, 0.9, 1, 1.1, 1.25], []);

  const dec = () => setScale((s) => Math.max(minScale, +(s - step).toFixed(2)));
  const inc = () => setScale((s) => Math.min(maxScale, +(s + step).toFixed(2)));

  return (
    <section className={['rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl', panelClassName].join(' ')}>
      <div className={['px-5 py-4 border-b border-white/10 flex items-center justify-between', headerClassName].join(' ')}>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {error ? <span className="text-xs text-red-300">Failed to load preview</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-300">
            <button type="button" onClick={dec} className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50" aria-label="Zoom out">−</button>
            <select value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50" aria-label="Zoom level">
              {presets.map((p) => <option key={p} value={p}>{Math.round(p * 100)}%</option>)}
            </select>
            <button type="button" onClick={inc} className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50" aria-label="Zoom in">+</button>
          </div>
          {action ? <div className="text-xs text-purple-300 hover:text-purple-200">{action}</div> : null}
        </div>
      </div>
      <div className={['p-4', bodyClassName].join(' ')}>
        {loading ? <div className="px-5 py-4 text-gray-400 text-sm">Loading…</div> : (
          <div className="w-full overflow-auto">
            <div className="mx-auto" style={{ width: 'min(100%, 720px)' }}>
              <div className="origin-top mx-auto" style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '100%' }}>
                <div className={['bg-white text-gray-900 rounded-lg shadow', 'aspect-[1/1.414] w-full', 'overflow-hidden print:shadow-none', paperClassName].join(' ')}>
                  {previewHtml ? <iframe title="Resume Preview" className="w-full h-full" srcDoc={previewHtml} sandbox="allow-same-origin" style={{ border: '0' }} /> : <div className="p-6 sm:p-8 text-sm text-gray-600">Add your resume renderer here. This canvas preserves an A4-like aspect ratio.</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [resumeName, setResumeName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('elegant');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const handleTemplateSelect = (template) => {
    setResumeData(transformTemplateData(template)); // convert DB template to resume JSON
    setSelectedTheme(template.title); // update theme selector
  };
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get('/api/templates');
        setTemplates(data.templates); // [{_id, title, sections, style}, ...]
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };
    fetchTemplates();
  }, []);
  useEffect(() => {
    const selectedTemplate = location.state?.template;
    if (id) {
      const fetchResume = async () => {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get(`/api/resumes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setResumeData(data.resumeData);
          setResumeName(data.name);
        } catch (err) {
          console.error('Failed to fetch resume:', err);
          setError('Failed to load resume.');
        }
      };
      fetchResume();
    } else if (selectedTemplate) {
      setResumeData(transformTemplateData(selectedTemplate));
      setResumeName(selectedTemplate.title || 'New Resume');
    }
  }, [id, location.state]);

  const mergeResumeData = useCallback((current, incoming) => {
    if (!incoming || typeof incoming !== 'object') return current;
    const next = { ...current };
    if (incoming.basics) {
      next.basics = { ...next.basics, ...incoming.basics };
      if (incoming.basics.location) next.basics.location = { ...next.basics.location, ...incoming.basics.location };
      if (incoming.basics.profiles) next.basics.profiles = incoming.basics.profiles;
    }
    const arrayKeys = ['work', 'education', 'skills', 'awards', 'publications', 'volunteer', 'references', 'projects', 'interests', 'languages'];
    arrayKeys.forEach((k) => { if (Array.isArray(incoming[k])) next[k] = incoming[k]; });
    return next;
  }, []);

  const fetchResumePreview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/resumes/render', { resumeData, themeName: selectedTheme });
      setPreviewHtml(response.data.html);
    } catch (err) {
      console.error('Failed to fetch resume preview:', err);
      setError('Failed to load preview. Please check your data or try another theme.');
      setPreviewHtml(`<div style="padding:16px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#B91C1C;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px"><strong>Error:</strong> ${err.response?.data?.message || err.message}</div>`);
    } finally {
      setIsLoading(false);
    }
  }, [resumeData, selectedTheme]);

  const debouncedFetchResumePreview = useMemo(() => debounce(fetchResumePreview, 700), [fetchResumePreview]);

  useEffect(() => {
    debouncedFetchResumePreview();
    return () => { if (debouncedFetchResumePreview.cancel) debouncedFetchResumePreview.cancel(); };
  }, [debouncedFetchResumePreview, resumeData, selectedTheme]);

  const handleInputChange = (section, field, value) => setResumeData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  const handleArrayItemChange = (section, index, field, value) => setResumeData((prev) => ({ ...prev, [section]: prev[section].map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));
  const handleAddArrayItem = (section, newItem) => setResumeData((prev) => ({ ...prev, [section]: [...prev[section], newItem] }));
  const handleRemoveArrayItem = (section, index) => setResumeData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  const handleThemeChange = (e) => setSelectedTheme(e.target.value);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (id) {
        await axios.put(`/api/resumes/${id}`, { name: resumeName, resumeData }, config);
      } else {
        await axios.post('/api/resumes', { name: resumeName, resumeData }, config);
      }
      alert('Resume saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save resume:', err);
      setError('Failed to save resume. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/resumes/export-pdf', { resumeData, themeName: selectedTheme }, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${selectedTheme}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
    finally {
      setIsLoading(false);
    }
  };

  const callAI = useCallback(async (scope, payload) => {
    setAiLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/ai', { scope, ...payload });
      return res.data;
    } catch (err) {
      console.error('AI generation failed:', err);
      setError(err.response?.data?.message || 'AI generation failed. Please try again.');
      return null;
    }
    finally {
      setAiLoading(false);
    }
  }, []);

  const handleGenerateFull = useCallback(async () => {
    const data = await callAI('full', { prompt: aiPrompt, resumeData });
    if (!data) return;
    setResumeData((prev) => mergeResumeData(prev, data.resumeData || data));
  }, [aiPrompt, resumeData, callAI, mergeResumeData]);

  const handleGenerateSummary = useCallback(async () => {
    const data = await callAI('summary', { prompt: aiPrompt, basics: resumeData.basics });
    if (!data) return;
    const summary = data.summary || data.text || data.result;
    if (summary) setResumeData((prev) => ({ ...prev, basics: { ...prev.basics, summary } }));
    else if (data.basics) setResumeData((prev) => mergeResumeData(prev, { basics: data.basics }));
  }, [aiPrompt, resumeData.basics, callAI, mergeResumeData]);

  const handleGenerateEducation = useCallback(async () => {
    const data = await callAI('education', { prompt: aiPrompt, education: resumeData.education });
    if (!data) return;
    if (Array.isArray(data.education)) setResumeData((prev) => ({ ...prev, education: data.education }));
    else if (data.educationItem) setResumeData((prev) => ({ ...prev, education: [...prev.education, data.educationItem] }));
    else if (data.result && typeof data.result === 'string') setResumeData((prev) => ({ ...prev, education: [...prev.education, { institution: 'University Name', studyType: 'B.Sc.', area: 'Computer Science', startDate: 'YYYY', endDate: 'YYYY', score: '', summary: data.result }] }));
  }, [aiPrompt, resumeData.education, callAI]);

  const inputClass = 'w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition';

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-purple-700/10 via-indigo-600/10 to-transparent blur-3xl" />
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Resume</h1>
          <p className="mt-1 text-sm text-gray-400">Render and refine your resume.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Resume Name" value={resumeName} onChange={(e) => setResumeName(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50" />
          <button type="button" onClick={handleSave} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-gray-200 backdrop-blur shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 disabled:opacity-50" disabled={isLoading}>Save</button>
          <label className="sr-only" htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={selectedTheme}
            onChange={(e) => {
              const theme = e.target.value;
              setSelectedTheme(theme);
              // optional: load template JSON if you want to pre-fill resumeData
              const template = templates.find(t => t.title === theme);
              if (template) setResumeData(transformTemplateData(template));
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
          >
            {templates.map((t) => (
              <option key={t._id} value={t.title}>{t.title}</option>
            ))}
          </select>

          <button type="button" onClick={handleDownloadPdf} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-gray-200 backdrop-blur shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 disabled:opacity-50" disabled={isLoading}>⬇ Download PDF</button>
        </div>
      </header>
      {error ? <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 px-4 py-2 text-sm">{error}</div> : null}
      <SectionCard title="AI Assistant" action={<button type="button" onClick={handleGenerateFull} className="underline disabled:opacity-50" disabled={aiLoading}>✨ Generate Resume</button>} footer="Tip: Paste a job description or describe your target role. AI will fill missing sections like summary, experience skeleton, and education.">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Prompt</label>
            <textarea rows={3} className={inputClass} placeholder="E.g., Senior Frontend role focusing on React/TypeScript in fintech..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleGenerateSummary} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 disabled:opacity-50" disabled={aiLoading}>✨ Generate Summary</button>
            <button type="button" onClick={handleGenerateEducation} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 disabled:opacity-50" disabled={aiLoading}>✨ Generate Education</button>
            {aiLoading ? <span className="text-xs text-gray-400">Thinking…</span> : null}
          </div>
        </div>
      </SectionCard>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <aside className="space-y-3">
          <button className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"><span>Basics</span> <span className="text-xs text-gray-400">1</span></button>
          <button className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"><span>Experience</span> <span className="text-xs text-gray-400">{resumeData.work.length}</span></button>
          <button type="button" className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"><span>Education</span> <span className="text-xs text-gray-400">{resumeData.education.length}</span></button>
        </aside>
        <main className="space-y-4">
          <SectionCard title="Basics" action={<button type="button" onClick={handleGenerateSummary} className="underline disabled:opacity-50" disabled={aiLoading}>✨ Generate Summary</button>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input type="text" className={inputClass} placeholder="Jane Doe" value={resumeData.basics.name} onChange={(e) => handleInputChange('basics', 'name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Label</label>
                <input type="text" className={inputClass} placeholder="Software Engineer" value={resumeData.basics.label} onChange={(e) => handleInputChange('basics', 'label', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input type="email" className={inputClass} placeholder="jane@example.com" value={resumeData.basics.email || ''} onChange={(e) => handleInputChange('basics', 'email', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone</label>
                <input type="tel" className={inputClass} placeholder="+1 555 123 4567" value={resumeData.basics.phone || ''} onChange={(e) => handleInputChange('basics', 'phone', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Website</label>
                <input type="url" className={inputClass} placeholder="https://example.com" value={resumeData.basics.url || ''} onChange={(e) => handleInputChange('basics', 'url', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Summary</label>
                <textarea rows={3} className={inputClass} placeholder="One or two lines about you..." value={resumeData.basics.summary || ''} onChange={(e) => handleInputChange('basics', 'summary', e.target.value)} />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Experience" footer="Tip: Keep each bullet concise and outcome-focused." action={<button type="button" onClick={() => handleAddArrayItem('work', { company: '', position: '', startDate: '', endDate: '', summary: '', highlights: [] })} className="underline">+ Add</button>}>
            <div className="space-y-4">
              {resumeData.work.length === 0 ? <div className="py-4 text-sm text-gray-400">No experience added yet.</div> : null}
              {resumeData.work.map((job, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Company</label>
                      <input type="text" className={inputClass} value={job.company || ''} onChange={(e) => handleArrayItemChange('work', index, 'company', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <input type="text" className={inputClass} value={job.position || ''} onChange={(e) => handleArrayItemChange('work', index, 'position', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                      <input type="text" className={inputClass} placeholder="YYYY-MM" value={job.startDate || ''} onChange={(e) => handleArrayItemChange('work', index, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input type="text" className={inputClass} placeholder="YYYY-MM or Present" value={job.endDate || ''} onChange={(e) => handleArrayItemChange('work', index, 'endDate', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Summary</label>
                      <textarea rows={2} className={inputClass} value={job.summary || ''} onChange={(e) => handleArrayItemChange('work', index, 'summary', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <button type="button" onClick={async () => { try { const data = await callAI('experience-item', { prompt: aiPrompt, item: job }); if (!data) return; const summary = data.summary || data.text || data.result; setResumeData((prev) => ({ ...prev, work: prev.work.map((w, i) => (i === index ? { ...w, summary: summary || w.summary } : w)) })); } catch { } }} className="text-xs text-purple-300 hover:text-purple-200 underline disabled:opacity-50" disabled={aiLoading}>✨ Generate bullets</button>
                    <button type="button" onClick={() => handleRemoveArrayItem('work', index)} className="text-xs text-gray-300 hover:text-white underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Education" action={<div className="flex items-center gap-3"><button type="button" onClick={handleGenerateEducation} className="underline disabled:opacity-50" disabled={aiLoading}>✨ Generate</button><button type="button" onClick={() => handleAddArrayItem('education', { institution: '', studyType: '', area: '', startDate: '', endDate: '', score: '', courses: [] })} className="underline">+ Add</button></div>} footer="List your most recent education first. Include study type, field, and dates.">
            <div className="space-y-4">
              {resumeData.education.length === 0 ? <div className="py-4 text-sm text-gray-400">No education added yet.</div> : null}
              {resumeData.education.map((edu, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Institution</label>
                      <input type="text" className={inputClass} value={edu.institution || ''} onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Study Type</label>
                      <input type="text" className={inputClass} placeholder="B.Sc., M.Sc., Diploma..." value={edu.studyType || ''} onChange={(e) => handleArrayItemChange('education', index, 'studyType', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Field of Study</label>
                      <input type="text" className={inputClass} placeholder="Computer Science" value={edu.area || ''} onChange={(e) => handleArrayItemChange('education', index, 'area', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Score/GPA</label>
                      <input type="text" className={inputClass} placeholder="3.8/4.0" value={edu.score || ''} onChange={(e) => handleArrayItemChange('education', index, 'score', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                      <input type="text" className={inputClass} placeholder="YYYY-MM" value={edu.startDate || ''} onChange={(e) => handleArrayItemChange('education', index, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input type="text" className={inputClass} placeholder="YYYY-MM or Present" value={edu.endDate || ''} onChange={(e) => handleArrayItemChange('education', index, 'endDate', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Summary/Courses</label>
                      <textarea rows={2} className={inputClass} placeholder="Relevant coursework or achievements" value={Array.isArray(edu.courses) ? edu.courses.join(', ') : edu.summary || ''} onChange={(e) => { handleArrayItemChange('education', index, 'summary', e.target.value); }} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => handleRemoveArrayItem('education', index)} className="text-xs text-gray-300 hover:text-white underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </main>
        <div>
          <ResumePreviewPanel action={<a href="/resumes" className="">View all</a>} loading={isLoading} error={error} previewHtml={previewHtml} />
        </div>
      </div>
    </div>
  );
}

export default ResumeEditor;
