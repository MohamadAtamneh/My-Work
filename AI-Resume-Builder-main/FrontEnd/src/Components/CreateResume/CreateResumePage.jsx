import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { SectionCard, ResumePreviewPanel, BlockToolbar } from "./EditorUI";
import ResumeRenderer from "../ResumeTemplates/ResumeRenderer"; // React renderer
import ReactDOMServer from "react-dom/server";

// Small UI helpers
function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}

function SmallField({ label, children }) {
  return (
    <div style={{ fontSize: "0.9em" }}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function timeAgo(date) {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "just now";
  }
}

// Map template section type to internal block type
const SECTION_TYPE_TO_BLOCK = {
  Header: "header",
  Experience: "work",
  Education: "education",
  Skills: "skills",
  Projects: "projects",
  Awards: "awards",
  Volunteer: "volunteer",
  Publications: "publications",
  Languages: "languages",
};

// Block templates
const TEMPLATES = {
  header: () => ({ type: "header", title: "Header", options: {} }),
  summary: () => ({ type: "summary", title: "Summary", content: "" }),
  work: () => ({
    type: "work",
    title: "Experience",
    entries: [{ company: "", position: "", startDate: "", endDate: "", summary: "", highlights: [] }],
  }),
  education: () => ({
    type: "education",
    title: "Education",
    entries: [{ institution: "", studyType: "", area: "", startDate: "", endDate: "", score: "", summary: "" }],
  }),
  skills: () => ({
    type: "skills",
    title: "Skills",
    groups: [{ name: "General", level: "", keywords: [] }],
  }),
  projects: () => ({
    type: "projects",
    title: "Projects",
    entries: [{ name: "", description: "", url: "", technologies: [] }],
  }),
  awards: () => ({
    type: "awards",
    title: "Awards",
    entries: [{ title: "", date: "", awarder: "", summary: "" }],
  }),
  volunteer: () => ({
    type: "volunteer",
    title: "Volunteer",
    entries: [{ organization: "", position: "", startDate: "", endDate: "", summary: "" }],
  }),
  publications: () => ({
    type: "publications",
    title: "Publications",
    entries: [{ name: "", publisher: "", releaseDate: "", url: "", summary: "" }],
  }),
  languages: () => ({
    type: "languages",
    title: "Languages",
    entries: [{ language: "", fluency: "" }],
  }),
  interests: () => ({
    type: "interests",
    title: "Interests",
    entries: [{ name: "", keywords: [] }],
  }),
};

// Defines which blocks can only be added once
const BLOCK_CONFIG = {
  header: { singleton: true },
  summary: { singleton: true },
  work: { singleton: true },
  education: { singleton: true },
  skills: { singleton: true },
  projects: { singleton: true },
  awards: { singleton: true },
  volunteer: { singleton: true },
  publications: { singleton: true },
  languages: { singleton: true },
  interests: { singleton: true },
};

// Compose JSON Resume for ResumeRenderer
function composeResumeJson(blocks, basics, template) {
  const isCreative = template?.id === 'creative-bold';

  // The creative-bold template uses a different data schema.
  // We will build the appropriate structure based on the selected template.

  const resumeData = {
    personalInfo: {
      name: basics.name || "",
      title: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location: basics.location?.city || "",
      website: basics.url || "",
      linkedin: (basics.profiles || []).find(p => p.network?.toLowerCase() === 'linkedin')?.username || '',
      github: (basics.profiles || []).find(p => p.network?.toLowerCase() === 'github')?.username || '',
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    awards: [],
    certifications: [], // For compatibility with creative template
    volunteer: [],
    publications: [],
    languages: [],
    interests: [],
  };

  // If it's the creative template, create the 'basics' and 'work' properties it expects.
  if (isCreative) {
    resumeData.basics = {
      name: basics.name || "",
      label: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location: basics.location?.city || "",
      summary: "", // will be populated below
    };
    // It expects 'work' instead of 'experience'
    resumeData.work = [];
  }


  blocks.forEach(block => {
    if (!block || !block.type) return;

    switch (block.type) {
      case 'summary':
        resumeData.personalInfo.summary = block.content || "";
        break;
      case 'work':
        const experienceData = (block.entries || []).map(entry => ({
          company: entry.company || "",
          title: entry.position || "",
          location: entry.location || "",
          startDate: entry.startDate || "",
          endDate: entry.endDate || "",
          description: entry.summary ? entry.summary.split('\n').filter(Boolean) : (entry.highlights || []),
        }));
        
        // Assign to the correct property based on the template
        if (isCreative) {
          resumeData.work = experienceData;
          // Also update the summary in the correct nested object for creative template
          if (resumeData.basics) {
            resumeData.basics.summary = resumeData.personalInfo.summary;
          }
        } else {
          resumeData.experience = experienceData;
        }
        break;
      case 'education':
        resumeData.education = (block.entries || []).map(entry => ({
          institution: entry.institution || "",
          degree: entry.studyType || "",
          area: entry.area || "",
          startDate: entry.startDate || "",
          endDate: entry.endDate || "",
          year: entry.endDate || "", // Keep for backward compatibility
          gpa: entry.score || "",
          summary: entry.summary || "",
        }));
        break;
      case 'skills':
        resumeData.skills = (block.groups || []).flatMap(g => g.keywords || []).filter(Boolean);
        break;
      case 'projects':
        resumeData.projects = (block.entries || []).map(p => ({
          name: p.name || "",
          description: p.description || "",
          url: p.url || "",
          technologies: Array.isArray(p.technologies) ? p.technologies.filter(Boolean) : [],
        })).filter(p => p.name);
        break;
      case 'awards':
        const awardsData = (block.entries || []).map(a => ({
          title: a.title || "",
          date: a.date || "",
          awarder: a.awarder || "",
          summary: a.summary || "",
        }));
        // Map to both for compatibility
        resumeData.awards = awardsData;
        resumeData.certifications = awardsData.map(a => ({ name: a.title, year: a.date, issuer: a.awarder }));
        break;
      case 'volunteer':
        resumeData.volunteer = (block.entries || []).map(v => ({
          organization: v.organization || "",
          position: v.position || "",
          startDate: v.startDate || "",
          endDate: v.endDate || "",
          summary: v.summary || "",
        }));
        break;
      case 'publications':
        resumeData.publications = (block.entries || []).map(p => ({
          name: p.name || "",
          publisher: p.publisher || "",
          releaseDate: p.releaseDate || "",
          url: p.url || "",
          summary: p.summary || "",
        }));
        break;
      case 'languages':
        resumeData.languages = (block.entries || []).map(l => ({
          language: l.language || "",
          fluency: l.fluency || "",
        }));
        break;
      case 'interests':
         resumeData.interests = (block.entries || []).map(i => ({
            name: i.name || "",
            keywords: i.keywords || [],
         }));
         break;
      default:
        break;
    }
  });

  return resumeData;
}

const blockTypeToResumeJsonSection = {
  header: 'header',
  summary: 'summary',
  work: 'experience',
  education: 'education',
  skills: 'skills',
  projects: 'projects',
  awards: 'awards',
  volunteer: 'volunteer',
  publications: 'publications',
  languages: 'languages',
  interests: 'interests',
};

// Provides default template structures for sections that might be added by the user
// but are not present in the original selected template. This makes the renderer dynamic.
const DEFAULT_SECTION_TEMPLATES = {
  projects: {
    id: "projects",
    type: "repeatable-section",
    showTitle: true,
    title: "Projects",
    dataPath: "projects",
    style: { marginBottom: "24px" },
    titleStyle: { fontSize: "20px", fontWeight: "bold", color: "primary", marginBottom: "12px" },
    itemStyle: { marginBottom: "20px" },
    elements: [
      { type: "text", dataPath: "name", style: { fontSize: "18px", fontWeight: "bold" } },
      { type: "text", dataPath: "description", style: { marginTop: "4px", marginBottom: "8px" } },
      { type: "tag-list", dataPath: "technologies", tagStyle: { backgroundColor: "#e5e7eb", color: "#374151", padding: "2px 8px", margin: "2px", borderRadius: "4px", fontSize: "12px" } }
    ]
  },
  awards: {
    id: "awards",
    type: "repeatable-section",
    showTitle: true,
    title: "Awards & Certifications",
    dataPath: "awards",
    style: { marginBottom: "24px" },
    titleStyle: { fontSize: "20px", fontWeight: "bold", color: "primary", marginBottom: "12px" },
    itemStyle: { marginBottom: "12px" },
    elements: [
      { type: "text", dataPath: "title", style: { fontWeight: "bold" } },
      { type: "text", template: "{awarder} | {date}", style: { color: "secondary", fontSize: "14px" } }
    ]
  },
  volunteer: {
    id: "volunteer",
    type: "repeatable-section",
    showTitle: true,
    title: "Volunteer Experience",
    dataPath: "volunteer",
    style: { marginBottom: "24px" },
    titleStyle: { fontSize: "20px", fontWeight: "bold", color: "primary", marginBottom: "12px" },
    itemStyle: { marginBottom: "20px" },
    elements: [
        { type: "text", dataPath: "position", style: { fontSize: "18px", fontWeight: "bold" } },
        { type: "text", dataPath: "organization", style: { fontStyle: "italic", color: "secondary" } },
        { type: "text", template: "{startDate} - {endDate}", style: { fontSize: "14px", color: "secondary", marginBottom: "8px" } },
        { type: "text", dataPath: "summary" }
    ]
  },
  publications: {
    id: "publications",
    type: "repeatable-section",
    showTitle: true,
    title: "Publications",
    dataPath: "publications",
    style: { marginBottom: "24px" },
    titleStyle: { fontSize: "20px", fontWeight: "bold", color: "primary", marginBottom: "12px" },
    itemStyle: { marginBottom: "12px" },
    elements: [
      { type: "text", dataPath: "name", style: { fontWeight: "bold" } },
      { type: "text", template: "{publisher} | {releaseDate}", style: { color: "secondary", fontSize: "14px" } }
    ]
  },
  languages: {
    id: "languages",
    type: "repeatable-section",
    showTitle: true,
    title: "Languages",
    dataPath: "languages",
    style: { marginBottom: "24px" },
    titleStyle: { fontSize: "20px", fontWeight: "bold", color: "primary", marginBottom: "12px" },
    itemStyle: { marginBottom: "8px" },
    elements: [
      { type: "text", template: "{language}: {fluency}" }
    ]
  },
  interests: {
    id: "interests",
    type: "repeatable-section",
    showTitle: true,
    title: "Interests",
    dataPath: "interests",
    style: { marginBottom: "24px" },
    titleStyle: { fontSize: "20px", fontWeight: "bold", color: "primary", marginBottom: "12px" },
    itemStyle: { marginBottom: "12px" },
    elements: [
      { type: "text", dataPath: "name", style: { fontWeight: "bold" } },
      { type: "tag-list", dataPath: "keywords", tagStyle: { backgroundColor: "#e5e7eb", color: "#374151", padding: "2px 8px", margin: "2px", borderRadius: "4px", fontSize: "12px" } }
    ]
  }
};

export default function CreateResumePage() {
  const location = useLocation();
  const [resumeName, setResumeName] = useState("New Resume");

  // Basics used by Header and renderer
  const [basics, setBasics] = useState({
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    location: { city: "", region: "", countryCode: "" },
    profiles: [],
  });

  // Template selection
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || "elegant");
  const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId || t._id === selectedTemplateId), [templates, selectedTemplateId]);

  // Blocks (created from template)
  const [blocks, setBlocks] = useState([]);

  // Preview/theme
  const [theme, setTheme] = useState("minimal");
  const [previewHtml, setPreviewHtml] = useState("");
  const [rendering, setRendering] = useState(false);
  const [pdfEngine, setPdfEngine] = useState("puppeteer"); // Add state for PDF engine

  // AI prompt (optional, used if you already integrated AI)
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);


  // Save state
  const [saving, setSaving] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Build blocks from template sections in order
  const applyTemplate = useCallback(
    (templateId) => {
      const tpl = templates.find((t) => t.id === templateId || t._id === templateId);
      if (!tpl) return;

      // Special handling for 'creative-bold' template's sidebar/main structure
      if (tpl.id === 'creative-bold') {
        setBlocks(currentBlocks => {
          const sidebarSections = ['contact', 'skills', 'awards']; // `id`s from creative-bold sidebar
          const mainSections = ['summary', 'experience', 'education', 'projects', 'volunteer', 'publications', 'languages', 'interests']; // `id`s from creative-bold main

          const sidebarBlockTypes = sidebarSections.map(id => Object.keys(blockTypeToResumeJsonSection).find(key => blockTypeToResumeJsonSection[key] === id)).filter(Boolean);
          const mainBlockTypes = mainSections.map(id => Object.keys(blockTypeToResumeJsonSection).find(key => blockTypeToResumeJsonSection[key] === id)).filter(Boolean);

          const allTemplateBlockTypes = [...sidebarBlockTypes, ...mainBlockTypes];

          return allTemplateBlockTypes.map(blockType => {
            return currentBlocks.find(b => b.type === blockType) || (TEMPLATES[blockType] ? TEMPLATES[blockType]() : null);
          }).filter(Boolean);
        });
        return;
      }

      setBlocks(currentBlocks => {
        // Get all section IDs defined in the new template's structure.
        const templateSectionIds = (tpl.structure?.sections || [])
          .flatMap(s => (s.type === 'sidebar' || s.type === 'main') ? (s.sections || []) : s)
          .map(s => s.id)
          .filter(Boolean);

        // Map these IDs to our internal block types (e.g., 'experience' -> 'work').
        const templateBlockTypes = templateSectionIds.map(id =>
          Object.keys(blockTypeToResumeJsonSection).find(key => blockTypeToResumeJsonSection[key] === id)
        ).filter(Boolean);

        // Get all block types the user currently has.
        const currentBlockTypes = currentBlocks.map(b => b.type);

        // Create a combined list of block types, preserving the template's order and appending any extra blocks from the user.
        const combinedBlockTypes = [...templateBlockTypes];
        currentBlockTypes.forEach(type => {
          if (!combinedBlockTypes.includes(type)) {
            combinedBlockTypes.push(type);
          }
        });

        // Build the next set of blocks from this combined list.
        const nextBlocks = combinedBlockTypes
          .map(blockType => {
            const existingBlock = currentBlocks.find(b => b.type === blockType);
            return existingBlock || (TEMPLATES[blockType] ? TEMPLATES[blockType]() : null);
          })
          .filter(Boolean);

        // Ensure a summary block always exists.
        if (!nextBlocks.some((b) => b.type === "summary")) {
          const existingSummary = currentBlocks.find(b => b.type === 'summary');
          nextBlocks.unshift(existingSummary || TEMPLATES.summary());
        }

        return nextBlocks;
      });
    },
    [templates]
  );

  // Fetch resume data on mount if ID is present in URL
  useEffect(() => {
    const fetchResume = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id) {
        // If no ID, it's a new resume, so ensure the template is applied.
        // We need to wait for templates to be loaded first.
        if (templates.length > 0 && !resumeId) {
          applyTemplate(selectedTemplateId || templates[0]?._id);
        }
        return; // Exit if no ID
      }

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`/api/resumes/${encodeURIComponent(id)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (data) {
          setResumeName(data.title || "Untitled Resume");
          setSelectedTemplateId(data.templateId || templates[0]?.id);
          setTheme(data.theme);
          
          // Ensure basics and its nested properties are always valid
          const fetchedBasics = data.basics || {};
          setBasics(prev => ({
            ...prev,
            ...fetchedBasics,
            location: {
              ...(prev.location || {}),
              ...(fetchedBasics.location || {}),
            },
            profiles: fetchedBasics.profiles || prev.profiles || [],
          }));

          setBlocks(data.blocks || []);
          setResumeId(data.id || data._id);
        }
      } catch (error) {
        console.error("Failed to fetch resume", error);
        // Fallback for safety
        applyTemplate(selectedTemplateId);
      }
    };

    // Only fetch if templates are loaded to avoid race conditions
    if (templates.length > 0) {
      fetchResume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]); // Re-run when templates are loaded
  // Memoize data used by both preview and print, passing the selected template
  const renderData = useMemo(() => composeResumeJson(blocks, basics, selectedTemplate), [blocks, basics, selectedTemplate]);



  // Fetch templates from the database
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("/api/templates"); // Replace "/api/templates" with your actual API endpoint
        setTemplates(response.data);

        // Check if a template was passed in the location state
        if (location.state?.template) {
          const templateFromState = location.state.template;
          setSelectedTemplateId(templateFromState.id || templateFromState._id);
        } else {
          const firstTemplate = response.data[0];
          setSelectedTemplateId(firstTemplate?.id || firstTemplate?._id || "");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, [location.state]);

  // Helpers
  const updateBlock = useCallback((index, patch) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const removeBlock = useCallback((index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const duplicateBlock = useCallback((index) => {
    const block = blocks[index];
    if (block && BLOCK_CONFIG[block.type]?.singleton) {
      alert(`The "${block.title}" section can only be added once.`);
      return;
    }
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, JSON.parse(JSON.stringify(prev[index])));
      return next;
    });
  }, [blocks]);

  const moveBlock = useCallback((from, to) => {
    setBlocks((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const item = next.splice(from, 1)[0];
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const addBlock = useCallback((type) => {
    if (BLOCK_CONFIG[type]?.singleton && blocks.some((b) => b.type === type)) {
      alert(`A "${type}" section already exists and can only be added once.`);
      return;
    }
    const tpl = TEMPLATES[type];
    if (!tpl) return;
    setBlocks((prev) => [...prev, tpl()]);
  }, [blocks]);

  // Entry editing helpers
  const updateWorkEntry = (blockIndex, entryIndex, patch) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries[entryIndex] = { ...entries[entryIndex], ...patch };
    updateBlock(blockIndex, { entries });
  };

  const addWorkEntry = (blockIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.push({ company: "", position: "", startDate: "", endDate: "", summary: "", highlights: [] });
    updateBlock(blockIndex, { entries });
  };

  const removeWorkEntry = (blockIndex, entryIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.splice(entryIndex, 1);
    updateBlock(blockIndex, { entries });
  };

  const updateEduEntry = (blockIndex, entryIndex, patch) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries[entryIndex] = { ...entries[entryIndex], ...patch };
    updateBlock(blockIndex, { entries });
  };

  const addEduEntry = (blockIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.push({ institution: "", studyType: "", area: "", startDate: "", endDate: "", score: "", summary: "" });
    updateBlock(blockIndex, { entries });
  };

  const removeEduEntry = (blockIndex, entryIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.splice(entryIndex, 1);
    updateBlock(blockIndex, { entries });
  };

  const updateSkillGroup = (blockIndex, groupIndex, patch) => {
    const blk = blocks[blockIndex];
    const groups = [...(blk.groups || [])];
    groups[groupIndex] = { ...groups[groupIndex], ...patch };
    updateBlock(blockIndex, { groups });
  };

  const addSkillGroup = (blockIndex) => {
    const blk = blocks[blockIndex];
    const groups = [...(blk.groups || [])];
    groups.push({ name: "", level: "", keywords: [] });
    updateBlock(blockIndex, { groups });
  };

  const removeSkillGroup = (blockIndex, groupIndex) => {
    const blk = blocks[blockIndex];
    const groups = [...(blk.groups || [])];
    groups.splice(groupIndex, 1);
    updateBlock(blockIndex, { groups });
  };

  const updateProjectEntry = (blockIndex, entryIndex, patch) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries[entryIndex] = { ...entries[entryIndex], ...patch };
    updateBlock(blockIndex, { entries });
  };

  const addProjectEntry = (blockIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.push({ name: "", description: "", url: "", technologies: [] });
    updateBlock(blockIndex, { entries });
  };

  const removeProjectEntry = (blockIndex, entryIndex) => {
    const blk = blocks[blockIndex];
    const entries = [...(blk.entries || [])];
    entries.splice(entryIndex, 1);
    updateBlock(blockIndex, { entries });
  };


  const handleFieldChange = useCallback((path, value) => {
    const keys = path.split('.');
    const [section, index, field] = keys;

    if (section === 'header') {
      const fieldMap = { name: 'name', title: 'label', 'contact.email': 'email', 'contact.phone': 'phone' };
      const basicsField = fieldMap[keys.slice(1).join('.')];
      if (basicsField) {
        setBasics(prev => ({ ...prev, [basicsField]: value }));
      }
    } else if (section === 'summary') {
      const blockIndex = blocks.findIndex(b => b.type === 'summary');
      if (blockIndex !== -1) {
        updateBlock(blockIndex, { content: value });
      }
    } else if (index !== undefined && field) {
      // This handles array-based sections like experience, education, etc.
      const resumeJsonSection = blockTypeToResumeJsonSection[section] || section;
      const blockIndex = blocks.findIndex(b => b.type === resumeJsonSection);
      if (blockIndex !== -1) {
        const entryIndex = parseInt(index, 10);
        const block = blocks[blockIndex];
        const entries = [...(block.entries || block.groups || [])];
        if (entries[entryIndex]) {
          entries[entryIndex] = { ...entries[entryIndex], [field]: value };
          updateBlock(blockIndex, { [block.entries ? 'entries' : 'groups']: entries });
        }
      }
    }
  }, [blocks, updateBlock]);

  // React preview element using ResumeRenderer
  const reactPreview = useMemo(() => {
    if (!selectedTemplate) {
      return <div className="p-6 text-center text-gray-500">Loading template...</div>;
    }

    // 1. Start with a deep copy of the selected template.
    const dynamicTemplate = JSON.parse(JSON.stringify(selectedTemplate));

    // 2. Helper to find all section IDs within a structure.
    const getAllSectionIds = (sections = []) => {
      return sections.flatMap(s =>
        (s.type === 'sidebar' || s.type === 'main')
          ? getAllSectionIds(s.sections)
          : s.id
      );
    };

    // 3. Get a Set of all section IDs that are explicitly defined in the template's structure.
    const templateSectionIds = new Set(getAllSectionIds(dynamicTemplate.structure.sections));

    // 4. Identify any user blocks that are NOT represented in the template's native structure.
    const unrenderedBlocks = blocks.filter(block => {
      const sectionId = blockTypeToResumeJsonSection[block.type];
      return !templateSectionIds.has(sectionId);
    });

    // 5. If there are unrendered blocks, append them to the main content area.
    if (unrenderedBlocks.length > 0) {
      // Find the main content area, or fall back to the root structure itself.
      const mainContent = dynamicTemplate.structure.sections?.find(s => s.type === 'main') || dynamicTemplate.structure;
      if (!mainContent.sections) {
        mainContent.sections = [];
      }

      unrenderedBlocks.forEach(block => {
        const sectionId = blockTypeToResumeJsonSection[block.type];
        if (sectionId) {
          // Use the default, clean layout for this extra section.
          const defaultSection = DEFAULT_SECTION_TEMPLATES[sectionId];
          if (defaultSection) {
            mainContent.sections.push(defaultSection);
          }
        }
      });
    }

    // 6. Render the final composed template. The renderer will handle showing/hiding sections based on data.
    return <ResumeRenderer template={dynamicTemplate} resumeData={renderData} />;
  }, [selectedTemplate, renderData, blocks]);

  // Save to backend
  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: resumeName,
        templateId: selectedTemplateId,
        theme,
        style: selectedTemplate?.style || {},
        blocks,
        basics,
        resumeData: renderData,
      };

      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      let resp;
      if (resumeId) {
        resp = await axios.put(`/api/resumes/${encodeURIComponent(resumeId)}`, payload, config);
      } else {
        resp = await axios.post("/api/resumes", payload, config);
      }

      const saved = resp?.data || {};
      if (saved?.id || saved?._id) {
        setResumeId(saved.id || saved._id);
      }
      setLastSavedAt(new Date());
    } catch (e) {
      // Optional fallback to localStorage if offline
      try {
        const drafts = JSON.parse(localStorage.getItem("resume_drafts") || "[]");
        const draft = {
          id: resumeId || `draft_${Date.now()}`,
          ...{
            title: resumeName,
            templateId: selectedTemplateId,
            theme,
            style: selectedTemplate?.style || {},
            blocks,
            basics,
            resumeData: renderData,
            updatedAt: new Date().toISOString(),
          },
        };
        const idx = drafts.findIndex((d) => d.id === draft.id);
        if (idx >= 0) drafts[idx] = draft;
        else drafts.push(draft);
        localStorage.setItem("resume_drafts", JSON.stringify(drafts));
        setResumeId(draft.id);
        setLastSavedAt(new Date());
        console.warn("Saved locally (offline). Backend save failed:", e?.response?.data || e?.message);
      } catch {
        alert(e?.response?.data?.message || e?.message || "Failed to save resume");
      }
    } finally {
      setSaving(false);
    }
  };

  // AI: Generate full resume content
  const onGenerateFull = async () => {
    setAiLoading(true);
    try {
      const current = renderData;
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      const { data } = await axios.post(
        "/api/ai",
        { scope: "full", prompt: aiPrompt, resumeData: current },
        config
      );


      const generated = data?.resumeData || data || {};

      // Merge basics
      const aiBasics = generated.basics || generated.personalInfo;
      if (aiBasics) {
        setBasics((prev) => ({
          ...prev,
          ...aiBasics,
          label: aiBasics.label || aiBasics.title, // Map title to label
        }));
      }
      const generatedByType = {
        summary: generated?.basics?.summary
          ? { type: "summary", title: "Summary", content: generated.basics.summary }
          : null,
        work: Array.isArray(generated?.work) && generated.work.length
          ? {
            type: "work",
            title: "Experience",
            entries: generated.work.map((w) => ({
              company: w.company || w.name || "",
              position: w.position || w.title || "",
              startDate: w.startDate || "",
              endDate: w.endDate || "",
              summary: w.summary || "",
              highlights: Array.isArray(w.highlights) ? w.highlights : [],
            })),
          }
          : null,
        education: Array.isArray(generated?.education) && generated.education.length
          ? {
            type: "education",
            title: "Education",
            entries: generated.education.map((e) => ({
              institution: e.institution || "",
              studyType: e.studyType || "",
              area: e.area || "",
              startDate: e.startDate || "",
              endDate: e.endDate || "",
              score: e.score || "",
              summary: e.summary || "",
            })),
          }
          : null,
        skills: Array.isArray(generated?.skills) && generated.skills.length
          ? {
            type: "skills",
            title: "Skills",
            groups: generated.skills.map((s) => ({
              name: s.name || "",
              level: s.level || "",
              keywords: Array.isArray(s.keywords) ? s.keywords : [],
            })),
          }
          : null,
        projects: Array.isArray(generated?.projects) && generated.projects.length
          ? {
            type: "projects",
            title: "Projects",
            entries: generated.projects.map((p) => ({
              name: p.name || "",
              description: p.description || "",
              url: p.url || "",
              technologies: Array.isArray(p.technologies) ? p.technologies.filter(Boolean) : [],
            })),
          } : null,
        awards: Array.isArray(generated?.awards) && generated.awards.length
          ? {
            type: "awards",
            title: "Awards",
            entries: generated.awards,
          } : null,
        volunteer: Array.isArray(generated?.volunteer) && generated.volunteer.length
          ? {
            type: "volunteer",
            title: "Volunteer",
            entries: generated.volunteer,
          } : null,
        publications: Array.isArray(generated?.publications) && generated.publications.length
          ? {
            type: "publications",
            title: "Publications",
            entries: generated.publications,
          } : null,
        languages: Array.isArray(generated?.languages) && generated.languages.length
          ? {
            type: "languages",
            title: "Languages",
            entries: generated.languages,
          } : null,
      };

      // Rebuild blocks from generated resume aligned with template order
      const templateOrder = (selectedTemplate?.sections || [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => SECTION_TYPE_TO_BLOCK[s.type]);

      const generatedKeys = Object.keys(generatedByType).filter(k => generatedByType[k] && k !== 'header');
      const order = [...new Set([...templateOrder, ...generatedKeys])];



      const next = order
        .map((t) => {
          if (t === "header") return TEMPLATES.header();
          if (generatedByType[t]) return generatedByType[t];
          return TEMPLATES[t]?.();
        })
        .filter(Boolean);

      if (!next.some((b) => b.type === "summary")) {
        const idxHeader = next.findIndex((b) => b.type === "header");
        next.splice(idxHeader >= 0 ? idxHeader + 1 : 0, 0, TEMPLATES.summary());
      }

      setBlocks(next);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to generate with AI");
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Generate/Improve only summary
  const onGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      const { data } = await axios.post(
        "/api/ai",
        { scope: "summary", prompt: aiPrompt, resumeData: { basics } },
        config
      );
      const summary = data?.summary || data?.basics?.summary || "";

      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.type === "summary");
        if (idx === -1) {
          return [{ type: "summary", title: "Summary", content: summary }, ...prev];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], content: summary };
        return next;
      });
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to generate summary");
    } finally {
      setAiLoading(false);
    }
  };

  // AI: Experience bullets for a specific role
  const onDownloadPdf = async () => {
    setRendering(true);
    try {
      if (!selectedTemplate) {
        alert("Please select a template before exporting.");
        setRendering(false);
        return;
      }

      // Re-use the same logic as the live preview to build the dynamic template
      // This ensures consistency between what is seen and what is exported.
      const dynamicTemplate = JSON.parse(JSON.stringify(selectedTemplate));

      const getAllSectionIds = (sections = []) => {
        return sections.flatMap(s =>
          (s.type === 'sidebar' || s.type === 'main')
            ? getAllSectionIds(s.sections)
            : s.id
        );
      };

      const templateSectionIds = new Set(getAllSectionIds(dynamicTemplate.structure.sections));

      const unrenderedBlocks = blocks.filter(block => {
        const sectionId = blockTypeToResumeJsonSection[block.type];
        return !templateSectionIds.has(sectionId);
      });

      if (unrenderedBlocks.length > 0) {
        const mainContent = dynamicTemplate.structure.sections?.find(s => s.type === 'main') || dynamicTemplate.structure;
        if (!mainContent.sections) {
          mainContent.sections = [];
        }

        unrenderedBlocks.forEach(block => {
          const sectionId = blockTypeToResumeJsonSection[block.type];
          if (sectionId) {
            const defaultSection = DEFAULT_SECTION_TEMPLATES[sectionId];
            if (defaultSection) {
              mainContent.sections.push(defaultSection);
            }
          }
        });
      }

      // The Puppeteer engine on the backend needs the rendered HTML.
      const html = ReactDOMServer.renderToStaticMarkup(
        <ResumeRenderer template={dynamicTemplate} resumeData={renderData} />
      );
      const payload = { engine: "puppeteer", html, templateId: selectedTemplateId };

      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.post(
        "/api/resumes/export-pdf",
        payload,
        { ...config, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resumeName || "resume").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to generate PDF");
    } finally {
      setRendering(false);
    }
  };
  const onGenerateWorkBullets = async (blockIndex, entryIndex) => {
    setAiLoading(true);
    try {
      const entry = blocks[blockIndex]?.entries?.[entryIndex];
      if (!entry) return;

      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      const { data } = await axios.post(
        "/api/ai",
        {
          scope: "experience-item",
          prompt: aiPrompt,
          item: {
            company: entry.company,
            position: entry.position,
            summary: entry.summary,
            startDate: entry.startDate,
            endDate: entry.endDate,
          },
        },
        config
      );

      const text = String(data?.summary || "").trim();
      const bullets = text
        .split(/\r?\n|•|- |\u2022/g)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (bullets.length >= 2) {
        updateWorkEntry(blockIndex, entryIndex, { highlights: bullets });
      } else {
        updateWorkEntry(blockIndex, entryIndex, { summary: text });
      }
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to generate experience bullets");
    } finally {
      setAiLoading(false);
    }
  };



  const input =
    "w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition";
  const inputSm =
    "w-full rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-400 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition";

  const savedLabel = lastSavedAt ? `Saved ${timeAgo(lastSavedAt)}` : "Not saved";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-purple-700/10 via-indigo-600/10 to-transparent blur-3xl" />

      {/* Header */}
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Resume</h1>
          <p className="mt-1 text-sm text-gray-400">Choose a document template, build with blocks, see changes live.</p>
          <div className="mt-1 text-xs text-gray-500">{savedLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Resume Name"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
          />
          {/* Document Template selector */}
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
            value={selectedTemplateId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedTemplateId(id); // This state update will trigger the effect below
            }}
            title="Document Template"
          >
            {templates.map((t) => (
              <option key={t.id || t._id} value={t.id || t._id}>
                {t.name}
              </option>
            ))}
          </select>



          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={rendering}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-gray-200"
            title="Export PDF"
          >
            Export PDF
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={`rounded-lg px-3 py-2 text-sm text-white ${saving ? "bg-purple-500/60 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
            title="Save resume"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Blocks list and Add */}
        <aside className="space-y-3">
          <SectionCard title="Blocks">
            <div className="space-y-2">
              {blocks.map((b, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-white/10 bg-white/5">
                  <span className="text-sm text-gray-200">{b.title || b.type}</span>
                  <BlockToolbar
                    upDisabled={i === 0}
                    downDisabled={i === blocks.length - 1}
                    onMoveUp={() => moveBlock(i, i - 1)}
                    onMoveDown={() => moveBlock(i, i + 1)}
                    onDuplicate={() => duplicateBlock(i)}
                    onDelete={() => removeBlock(i)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-400 mb-1">Add block</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TEMPLATES).filter(type => type !== 'header').map(type => {
                  const config = BLOCK_CONFIG[type] || {};
                  const tpl = TEMPLATES[type];
                  if (!tpl) return null;
                  const title = tpl().title;
                  const isDisabled = config.singleton && blocks.some(b => b.type === type);
                  return (
                    <button
                      key={type}
                      className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-1.5 text-xs text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => addBlock(type)}
                      disabled={isDisabled}
                      title={isDisabled ? `A "${title}" section already exists.` : `Add ${title} section`}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>          </SectionCard>

          <SectionCard title="AI Assistant" footer="Tip: Paste a job description or describe your target role.">
            <label className="block text-xs text-gray-400 mb-1">Prompt</label>
            <textarea
              rows={3}
              className={input}
              placeholder="Senior Frontend role in fintech (React/TS)..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                className="rounded-md bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs text-white disabled:opacity-60"
                onClick={onGenerateFull}
                disabled={aiLoading}
              >
                {aiLoading ? "Generating..." : "✨ Generate Full"}
              </button>
              <button
                className="rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-gray-200 disabled:opacity-60"
                onClick={onGenerateSummary}
                disabled={aiLoading}
              >
                ✨ Summary
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Basics">
            <div className="space-y-2">
              <Field label="Full Name">
                <input className={input} value={basics.name} onChange={(e) => setBasics({ ...basics, name: e.target.value })} />
              </Field>
              <Field label="Headline">
                <input className={input} value={basics.label} onChange={(e) => setBasics({ ...basics, label: e.target.value })} />
              </Field>
              <Field label="Email">
                <input className={input} value={basics.email} onChange={(e) => setBasics({ ...basics, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={input} value={basics.phone} onChange={(e) => setBasics({ ...basics, phone: e.target.value })} />
              </Field>
              <Field label="Website">
                <input
                  className={input}
                  value={basics.url}
                  onChange={(e) => setBasics({ ...basics, url: e.target.value })}
                  placeholder="https://your-portfolio.com"
                />
              </Field>
              <Field label="Photo URL">
                <input className={input} value={basics.photo || ''} onChange={(e) => setBasics({ ...basics, photo: e.target.value })}
                  placeholder="https://..." />
              </Field>
            </div>
          </SectionCard>
        </aside>

        {/* Main block editor */}
        <main className="space-y-4 lg:col-span-1">
          {blocks.map((b, i) => {
            if (b.type === "header") {
              return null; // Header is not an editable block in this UI, basics are handled separately
            }

            if (b.type === "summary") {
              return (
                <SectionCard key={i} title="Summary">
                  <textarea
                    rows={4}
                    className={input}
                    placeholder="Impact-focused 2–3 sentence summary..."
                    value={b.content || ""}
                    onChange={(e) => updateBlock(i, { content: e.target.value })}
                  />
                </SectionCard>
              );
            }

            if (b.type === "work") {
              return (
                <SectionCard
                  key={i}
                  title="Experience"
                  action={<button className="underline" onClick={() => addWorkEntry(i)}>+ Add Role</button>}
                  footer="Outcome-focused bullets work best."
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Company">
                            <input className={inputSm} value={e.company || ""} onChange={(ev) => updateWorkEntry(i, ei, { company: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Position">
                            <input className={inputSm} value={e.position || ""} onChange={(ev) => updateWorkEntry(i, ei, { position: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Start">
                            <input className={inputSm} placeholder="YYYY-MM" value={e.startDate || ""} onChange={(ev) => updateWorkEntry(i, ei, { startDate: ev.target.value })} />
                          </SmallField>
                          <SmallField label="End">
                            <input className={inputSm} placeholder="YYYY-MM or Present" value={e.endDate || ""} onChange={(ev) => updateWorkEntry(i, ei, { endDate: ev.target.value })} />
                          </SmallField>
                          <div className="sm:col-span-2">
                            <SmallField label="Summary">
                              <textarea className={inputSm} rows={2} value={e.summary || ""} onChange={(ev) => updateWorkEntry(i, ei, { summary: ev.target.value })} />
                            </SmallField>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Highlights</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="text-xs underline text-gray-300 hover:text-white"
                                onClick={() => {
                                  const highlights = Array.isArray(e.highlights) ? [...e.highlights] : [];
                                  highlights.push("");
                                  updateWorkEntry(i, ei, { highlights });
                                }}
                              >
                                + Add Highlight
                              </button>
                              <button
                                type="button"
                                className="text-xs underline text-purple-300 hover:text-purple-200"
                                onClick={() => onGenerateWorkBullets(i, ei)}
                                title="AI: generate bullet points"
                                disabled={aiLoading}
                              >
                                ✨ Auto bullets
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 space-y-2">
                            {(Array.isArray(e.highlights) ? e.highlights : []).map((h, hi) => (
                              <div key={hi} className="flex items-center gap-2">
                                <input
                                  className={inputSm}
                                  value={h || ""}
                                  onChange={(ev) => {
                                    const highlights = Array.isArray(e.highlights) ? [...e.highlights] : [];
                                    highlights[hi] = ev.target.value;
                                    updateWorkEntry(i, ei, { highlights });
                                  }}
                                  placeholder="Shipped feature X impacting Y users..."
                                />
                                <button
                                  type="button"
                                  className="text-xs text-red-300 hover:text-red-200"
                                  onClick={() => {
                                    const highlights = Array.isArray(e.highlights) ? [...e.highlights] : [];
                                    highlights.splice(hi, 1);
                                    updateWorkEntry(i, ei, { highlights });
                                  }}
                                  title="Remove highlight"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-xs text-red-300 hover:text-red-200"
                            onClick={() => removeWorkEntry(i, ei)}
                          >
                            Delete role
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (b.type === "education") {
              return (
                <SectionCard
                  key={i}
                  title="Education"
                  action={<button className="underline" onClick={() => addEduEntry(i)}>+ Add Education</button>}
                  footer="Latest first. Include degree, field, dates."
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Institution">
                            <input className={inputSm} value={e.institution || ""} onChange={(ev) => updateEduEntry(i, ei, { institution: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Degree">
                            <input className={inputSm} value={e.studyType || ""} onChange={(ev) => updateEduEntry(i, ei, { studyType: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Field">
                            <input className={inputSm} value={e.area || ""} onChange={(ev) => updateEduEntry(i, ei, { area: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Score/GPA">
                            <input className={inputSm} value={e.score || ""} onChange={(ev) => updateEduEntry(i, ei, { score: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Start">
                            <input className={inputSm} placeholder="YYYY" value={e.startDate || ""} onChange={(ev) => updateEduEntry(i, ei, { startDate: ev.target.value })} />
                          </SmallField>
                          <SmallField label="End">
                            <input className={inputSm} placeholder="YYYY" value={e.endDate || ""} onChange={(ev) => updateEduEntry(i, ei, { endDate: ev.target.value })} />
                          </SmallField>
                        </div>
                        <SmallField label="Summary/Courses">
                          <textarea className={inputSm} rows={2} value={e.summary || ""} onChange={(ev) => updateEduEntry(i, ei, { summary: ev.target.value })} />
                        </SmallField>
                        <div className="flex justify-end">
                          <button className="text-xs text-red-300 hover:text-red-200" onClick={() => removeEduEntry(i, ei)}>Delete education</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (b.type === "skills") {
              return (
                <SectionCard
                  key={i}
                  title="Skills"
                  action={<button className="underline" onClick={() => addSkillGroup(i)}>+ Add Group</button>}
                  footer="Group skills by category. Keep keywords scannable."
                >
                  <div className="space-y-4">
                    {(b.groups || []).map((g, gi) => (
                      <div key={gi} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <SmallField label="Category">
                            <input className={inputSm} value={g.name || ""} onChange={(ev) => updateSkillGroup(i, gi, { name: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Level">
                            <input className={inputSm} value={g.level || ""} onChange={(ev) => updateSkillGroup(i, gi, { level: ev.target.value })} />
                          </SmallField>
                          <SmallField label="Keywords (comma-separated)">
                            <input
                              className={inputSm}
                              value={(g.keywords || []).join(", ")}
                              onChange={(ev) =>
                                updateSkillGroup(i, gi, {
                                  keywords: ev.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                                })
                              }
                            />
                          </SmallField>
                        </div>
                        <div className="flex justify-end">
                          <button className="text-xs text-red-300 hover:text-red-200" onClick={() => removeSkillGroup(i, gi)}>Delete group</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }
            if (b.type === "projects") {
              return (
                <SectionCard
                  key={i}
                  title="Projects"
                  action={<button className="underline" onClick={() => addProjectEntry(i)}>+ Add Project</button>}
                  footer="Showcase your work. Include links if possible."
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Project Name">
                            <input className={inputSm} value={e.name || ""} onChange={(ev) => updateProjectEntry(i, ei, { name: ev.target.value })} />
                          </SmallField>
                          <SmallField label="URL">
                            <input className={inputSm} value={e.url || ""} onChange={(ev) => updateProjectEntry(i, ei, { url: ev.target.value })} />
                          </SmallField>
                          <div className="sm:col-span-2">
                            <SmallField label="Description">
                              <textarea className={inputSm} rows={2} value={e.description || ""} onChange={(ev) => updateProjectEntry(i, ei, { description: ev.target.value })} />
                            </SmallField>
                          </div>
                          <div className="sm:col-span-2">
                            <SmallField label="Technologies (comma-separated)">
                              <input
                                className={inputSm}
                                value={(e.technologies || []).join(", ")}
                                onChange={(ev) =>
                                  updateProjectEntry(i, ei, {
                                    technologies: ev.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                                  })
                                }
                              />
                            </SmallField>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button className="text-xs text-red-300 hover:text-red-200" onClick={() => removeProjectEntry(i, ei)}>Delete project</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }
            if (b.type === "awards") {
              return (
                <SectionCard
                  key={i}
                  title="Awards"
                  action={<button className="underline" onClick={() => updateBlock(i, { entries: [...(b.entries || []), {}] })}>+ Add Award</button>}
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Title"><input className={inputSm} value={e.title || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, title: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Awarder"><input className={inputSm} value={e.awarder || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, awarder: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Date"><input className={inputSm} value={e.date || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, date: ev.target.value } : x) })} /></SmallField>
                        </div>
                        <SmallField label="Summary"><textarea className={inputSm} value={e.summary || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, summary: ev.target.value } : x) })} /></SmallField>
                        <div className="flex justify-end"><button className="text-xs text-red-300 hover:text-red-200" onClick={() => updateBlock(i, { entries: b.entries.filter((_, xi) => xi !== ei) })}>Delete</button></div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (b.type === "volunteer") {
              return (
                <SectionCard
                  key={i}
                  title="Volunteer"
                  action={<button className="underline" onClick={() => updateBlock(i, { entries: [...(b.entries || []), {}] })}>+ Add</button>}
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Organization"><input className={inputSm} value={e.organization || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, organization: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Position"><input className={inputSm} value={e.position || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, position: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Start Date"><input className={inputSm} value={e.startDate || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, startDate: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="End Date"><input className={inputSm} value={e.endDate || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, endDate: ev.target.value } : x) })} /></SmallField>
                        </div>
                        <SmallField label="Summary"><textarea className={inputSm} value={e.summary || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, summary: ev.target.value } : x) })} /></SmallField>
                        <div className="flex justify-end"><button className="text-xs text-red-300 hover:text-red-200" onClick={() => updateBlock(i, { entries: b.entries.filter((_, xi) => xi !== ei) })}>Delete</button></div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (b.type === "publications") {
              return (
                <SectionCard
                  key={i}
                  title="Publications"
                  action={<button className="underline" onClick={() => updateBlock(i, { entries: [...(b.entries || []), {}] })}>+ Add</button>}
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Name"><input className={inputSm} value={e.name || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, name: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Publisher"><input className={inputSm} value={e.publisher || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, publisher: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Release Date"><input className={inputSm} value={e.releaseDate || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, releaseDate: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="URL"><input className={inputSm} value={e.url || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, url: ev.target.value } : x) })} /></SmallField>
                        </div>
                        <SmallField label="Summary"><textarea className={inputSm} value={e.summary || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, summary: ev.target.value } : x) })} /></SmallField>
                        <div className="flex justify-end"><button className="text-xs text-red-300 hover:text-red-200" onClick={() => updateBlock(i, { entries: b.entries.filter((_, xi) => xi !== ei) })}>Delete</button></div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            if (b.type === "languages") {
              return (
                <SectionCard
                  key={i}
                  title="Languages"
                  action={<button className="underline" onClick={() => updateBlock(i, { entries: [...(b.entries || []), {}] })}>+ Add</button>}
                >
                  <div className="space-y-4">
                    {(b.entries || []).map((e, ei) => (
                      <div key={ei} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SmallField label="Language"><input className={inputSm} value={e.language || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, language: ev.target.value } : x) })} /></SmallField>
                          <SmallField label="Fluency"><input className={inputSm} value={e.fluency || ""} onChange={ev => updateBlock(i, { entries: b.entries.map((x, xi) => xi === ei ? { ...x, fluency: ev.target.value } : x) })} /></SmallField>
                        </div>
                        <div className="flex justify-end"><button className="text-xs text-red-300 hover:text-red-200" onClick={() => updateBlock(i, { entries: b.entries.filter((_, xi) => xi !== ei) })}>Delete</button></div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            }

            return null;
          })}
        </main>


        {/* Right: live preview (print target) */}
        <section className="lg:col-span-1">
          <ResumePreviewPanel
            title="Live preview"
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">{resumeName}</span>
              </div>
            }
            loading={rendering}
            previewHtml={""}
            previewComponent={reactPreview}
            initialScale={0.95}
            minScale={0.75}
            maxScale={1.25}
            step={0.05}
          />
          {/* Off-screen print target for react-to-print (avoids printing scaled canvas) */}
          <div

            aria-hidden
            style={{
              position: "absolute",
              left: "-10000px",
              top: 0,
              // Width approximates A4; adjust to your paper size if needed
              width: "210mm",
            }}
          >
            {reactPreview}
          </div>
        </section>
      </div>
    </div>
  );
}