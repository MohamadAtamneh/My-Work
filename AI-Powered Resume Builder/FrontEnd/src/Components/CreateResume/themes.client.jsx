// Expose available visual themes for the CreateResumePage selector
  export function getClientThemes() {
    return [
      { value: "minimal", label: "Minimal (Client)" },
      { value: "elegant", label: "Elegant (Client)" },
      { value: "classic", label: "Classic (Client)" },
    ];
  }

  // style: { primaryColor?: string, font?: string, spacing?: string }
  export function renderResumeHtml(resume, theme = "minimal", style = {}) {
    const renderer = themeRenderer[theme] || themeRenderer.minimal;
    return renderer(resume || {}, style || {});
  }

  // ---------- Internal helpers ----------

  function cssBase(style = {}) {
    const accent = style.primaryColor || "#6d28d9"; // default purple
    const spacing = style.spacing || "24px";
    const fontStack = style.font
      ? `${style.font}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Segoe UI Variable"`
      : `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Segoe UI Variable"`;

    return `
      :root { --fg:#111; --muted:#555; --accent:${accent}; --spacing:${spacing}; }
      * { box-sizing: border-box; }
      body { font-family: ${fontStack}; margin: 0; color: var(--fg); line-height: 1.45; }
      a { color: var(--accent); text-decoration: none; }
      .container { max-width: 800px; margin: 0 auto; padding: var(--spacing) calc(var(--spacing) * 0.8); }
      .name { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
      .headline { color: var(--muted); margin-top: 4px; }
      .section { margin-top: calc(var(--spacing) * 0.8); }
      .section-title { font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 10px; }
      .row { display: flex; justify-content: space-between; gap: 12px; }
      .pill { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #f3f4f6; color: #111; font-size: 12px; margin: 2px 6px 2px 0; }
      ul { padding-left: 1.25rem; margin: 6px 0; }
    `;
  }

  const themeRenderer = {
    minimal: (r, style) => `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${cssBase(style)}</style>
        </head>
        <body>
          <div class="container">
            ${header(r)}
            ${sectionWork(r)}
            ${sectionEducation(r)}
            ${sectionSkills(r)}
            ${sectionProjects(r)}
            ${sectionAwards(r)}
            ${sectionVolunteer(r)}
            ${sectionLanguages(r)}
          </div>
        </body>
      </html>`,

    elegant: (r, style) => `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            ${cssBase(style)}
            body { background: linear-gradient(180deg, #faf7ff, #ffffff); }
            .name { font-size: 30px; }
            .headline { color: #6b7280; }
            .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">${header(r)}</div>
            ${r?.work?.length ? `<div class="section card">${sectionTitle("Experience")}${workItems(r)}</div>` : ""}
            ${r?.education?.length ? `<div class="section card">${sectionTitle("Education")}${educationItems(r)}</div>` : ""}
            ${r?.skills?.length ? `<div class="section card">${sectionTitle("Skills")}${skillsItems(r)}</div>` : ""}
            ${r?.projects?.length ? `<div class="section card">${sectionTitle("Projects")}${projectItems(r)}</div>` : ""}
            ${r?.awards?.length ? `<div class="section card">${sectionTitle("Awards")}${awardItems(r)}</div>` : ""}
            ${r?.volunteer?.length ? `<div class="section card">${sectionTitle("Volunteer")}${volunteerItems(r)}</div>` : ""}
            ${r?.languages?.length ? `<div class="section card">${sectionTitle("Languages")}${languageItems(r)}</div>` : ""}
          </div>
        </body>
      </html>`,

    classic: (r, style) => `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            ${cssBase(style)}
            body { background: #ffffff; }
            .divider { height: 2px; background: var(--fg); margin: 8px 0 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${header(r)}
            <div class="divider"></div>
            ${r?.work?.length ? `${sectionTitle("Professional Experience")}${workItems(r)}` : ""}
            ${r?.education?.length ? `${sectionTitle("Education")}${educationItems(r)}` : ""}
            ${r?.skills?.length ? `${sectionTitle("Skills")}${skillsItems(r)}` : ""}
            ${r?.projects?.length ? `${sectionTitle("Projects")}${projectItems(r)}` : ""}
            ${r?.awards?.length ? `${sectionTitle("Awards")}${awardItems(r)}` : ""}
            ${r?.volunteer?.length ? `${sectionTitle("Volunteer")}${volunteerItems(r)}` : ""}
            ${r?.languages?.length ? `${sectionTitle("Languages")}${languageItems(r)}` : ""}
          </div>
        </body>
      </html>`,
  };

  // ---------- Section generators ----------

  function header(r) {
    const b = r?.basics || {};
    const contact = [b.email, b.phone, b.url].filter(Boolean).join(" · ");
    return `
      <div>
        <div class="name">${esc(b.name || "")}</div>
        ${b.label ? `<div class="headline">${esc(b.label)}</div>` : ""}
        ${contact ? `<div class="headline">${esc(contact)}</div>` : ""}
        ${b.summary ? `<div class="section"><div>${esc(b.summary)}</div></div>` : ""}
      </div>`;
  }

  function sectionTitle(s) {
    return `<div class="section-title">${esc(s)}</div>`;
  }

  function sectionWork(r) {
    return (r?.work || [])?.length ? `<div class="section">${sectionTitle("Experience")}${workItems(r)}</div>` : "";
  }

  function sectionEducation(r) {
    return (r?.education || [])?.length ? `<div class="section">${sectionTitle("Education")}${educationItems(r)}</div>` : "";
  }

  function sectionSkills(r) {
    return (r?.skills || [])?.length ? `<div class="section">${sectionTitle("Skills")}${skillsItems(r)}</div>` : "";
  }

  function sectionProjects(r) {
    return (r?.projects || [])?.length ? `<div class="section">${sectionTitle("Projects")}${projectItems(r)}</div>` : "";
  }

  function sectionAwards(r) {
    return (r?.awards || [])?.length ? `<div class="section">${sectionTitle("Awards")}${awardItems(r)}</div>` : "";
  }

  function sectionVolunteer(r) {
    return (r?.volunteer || [])?.length ? `<div class="section">${sectionTitle("Volunteer")}${volunteerItems(r)}</div>` : "";
  }

  function sectionLanguages(r) {
    return (r?.languages || [])?.length ? `<div class="section">${sectionTitle("Languages")}${languageItems(r)}</div>` : "";
  }

  function workItems(r) {
    return (r?.work || [])
      .map(
        (w) => `
        <div class="section">
          <div class="row">
            <strong>${esc(w.position || "")}</strong>
            <span>${esc(w.startDate || "")} – ${esc(w.endDate || "Present")}</span>
          </div>
          <div class="headline">${esc(w.name || "")}</div>
          ${w.summary ? `<div>${esc(w.summary)}</div>` : ""}
          ${
            (w.highlights || []).length
              ? `<ul>${(w.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`
              : ""
          }
        </div>`
      )
      .join("");
  }

  function educationItems(r) {
    return (r?.education || [])
      .map(
        (e) => `
        <div class="section">
          <div class="row">
            <strong>${esc(e.studyType || "")}${e.area ? ` • ${esc(e.area)}` : ""}</strong>
            <span>${esc(e.startDate || "")} – ${esc(e.endDate || "")}</span>
          </div>
          <div class="headline">${esc(e.institution || "")}</div>
          ${e.summary ? `<div>${esc(e.summary)}</div>` : ""}
          ${e.score ? `<div class="headline">GPA: ${esc(e.score)}</div>` : ""}
        </div>`
      )
      .join("");
  }

  function skillsItems(r) {
    return (r?.skills || [])
      .map(
        (s) => `
        <div class="section">
          <strong>${esc(s.name || "")}${s.level ? ` • ${esc(s.level)}` : ""}</strong>
          <div>${(s.keywords || []).map((k) => `<span class="pill">${esc(k)}</span>`).join("")}</div>
        </div>`
      )
      .join("");
  }

  function projectItems(r) {
    return (r?.projects || [])
      .map(
        (p) => `
        <div class="section">
          <div class="row">
            <strong>${esc(p.name || "")}</strong>
            ${p.url ? `<span><a href="${esc(p.url)}" target="_blank">${esc(p.url.replace(/^https?:\/\//, ''))}</a></span>` : ""}
          </div>
          ${p.description ? `<div>${esc(p.description)}</div>` : ""}
          ${(p.technologies || []).length ? `<div>${(p.technologies || []).map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>` : ""}
        </div>`
      )
      .join("");
  }

  function awardItems(r) {
    return (r?.awards || [])
      .map(
        (a) => `
        <div class="section">
          <div class="row">
            <strong>${esc(a.title || "")}</strong>
            <span>${esc(a.date || "")}</span>
          </div>
          <div class="headline">${esc(a.awarder || "")}</div>
          ${a.summary ? `<div>${esc(a.summary)}</div>` : ""}
        </div>`
      )
      .join("");
  }

  function volunteerItems(r) {
    return (r?.volunteer || [])
      .map(
        (v) => `
        <div class="section">
          <div class="row">
            <strong>${esc(v.position || "")}</strong>
            <span>${esc(v.startDate || "")} – ${esc(v.endDate || "Present")}</span>
          </div>
          <div class="headline">${esc(v.organization || "")}</div>
          ${v.summary ? `<div>${esc(v.summary)}</div>` : ""}
        </div>`
      )
      .join("");
  }

  function languageItems(r) {
    return (r?.languages || [])
      .map(
        (l) => `
        <div class="section">
          <strong>${esc(l.language || "")}</strong>
          ${l.fluency ? `<span class="headline"> • ${esc(l.fluency)}</span>` : ""}
        </div>`
      )
      .join("");
  }

  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }