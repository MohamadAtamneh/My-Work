'use strict';

const express = require('express');
const router = express.Router();
const { generateJson } = require('../models/gemini');

// Gemini-compatible schemas (subset of JSON Schema; avoid unsupported fields)

const summarySchema = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: '1–3 sentence professional summary' },
  },
  required: ['summary'],
};

const educationItemSchema = {
  type: 'object',
  properties: {
    institution: { type: 'string' },
    studyType: { type: 'string' },
    area: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    score: { type: 'string' },
    summary: { type: 'string' },
    courses: { type: 'array', items: { type: 'string' } },
  },
};

const educationSchema = {
  type: 'object',
  properties: {
    education: { type: 'array', items: educationItemSchema },
  },
  required: ['education'],
};

// Helpers

function badRequest(res, message) {
  return res.status(400).json({ message });
}

function normalizeResumeData(data = {}) {
  const empty = {
    basics: {
      name: '',
      label: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: { address: '', postalCode: '', city: '', countryCode: '', region: '' },
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

  const merged = { ...empty, ...data };
  merged.basics = { ...empty.basics, ...(data.basics || {}) };
  merged.basics.location = { ...empty.basics.location, ...((data.basics || {}).location || {}) };
  merged.basics.profiles = Array.isArray((data.basics || {}).profiles)
    ? data.basics.profiles
    : empty.basics.profiles;

  [
    'work',
    'education',
    'skills',
    'awards',
    'publications',
    'volunteer',
    'references',
    'projects',
    'interests',
    'languages',
  ].forEach((k) => {
    if (!Array.isArray(merged[k])) merged[k] = [];
  });

  return merged;
}

// Route

router.post('/', async (req, res) => {
  const { scope, prompt = '', resumeData = null, section = null, item = null } = req.body || {};
  if (!scope) return badRequest(res, 'Missing required field: scope');

  try {
    if (scope === 'summary') {
      const system =
        'You write concise, professional resume summaries (1–3 sentences). Respond strictly as JSON with key "summary".';

      const json = await generateJson({
        system,
        user: { prompt, basics: resumeData?.basics ?? null },
        schema: summarySchema,
      });

      return res.json({ summary: typeof json.summary === 'string' ? json.summary.trim() : '' });
    }

    if (scope === 'education') {
      const system = [
        'You generate resume education entries in JSON.',
        'Each item may include institution, studyType, area, startDate, endDate, score, summary, courses.',
        'Respond strictly as JSON with key "education" (array).',
      ].join(' ');

      const json = await generateJson({
        system,
        user: { prompt, currentEducation: resumeData?.education ?? [] },
        schema: educationSchema,
      });

      return res.json({ education: Array.isArray(json.education) ? json.education : [] });
    }

    if (scope === 'experience-item') {
      const system =
        'You create quantified, impact-driven bullets or a short role summary. Respond strictly as JSON with key "summary". Keep 2–5 bullets or 2–3 sentences.';

      const json = await generateJson({
        system,
        user: { prompt, item },
        schema: summarySchema,
      });

      return res.json({ summary: typeof json.summary === 'string' ? json.summary.trim() : '' });
    }

    if (scope === 'full') {
      const system = [
        'You are an expert resume writer that outputs a complete JSON resume.',
        'Use keys: basics, work, education, skills, awards, publications, volunteer, references, projects, interests, languages.',
        'Fill missing sections sensibly; do not invent personal PII beyond what is implied.',
        'Respond strictly as JSON with key "resumeData".',
      ].join(' ');

      // Important: do NOT pass responseSchema for full; Gemini rejects underspecified object arrays.
      const json = await generateJson({
        system,
        user: { prompt, existing: resumeData || {} },
        // no schema here on purpose
      });

      const output = normalizeResumeData(json?.resumeData || json);
      return res.json({ resumeData: output });
    }

    if (scope === 'section') {
      if (!section) return badRequest(res, 'Missing section for scope=section');

      const system = `Generate only the '${section}' section for a resume in JSON. Respond strictly as JSON, with only that section key at the root.`;

      const json = await generateJson({
        system,
        user: { prompt, resumeData, section },
        // no strict schema for custom sections
      });

      return res.json(json);
    }

    return badRequest(res, `Unsupported scope: ${scope}`);
  } catch (err) {
    console.error('AI route error:', err);
    const message =
      err?.response?.data?.error?.message ||
      err?.message ||
      'AI generation failed.';
    return res.status(500).json({ message });
  }
});

module.exports = router;