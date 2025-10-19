import React from "react";
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  // Fallback to modern if no match
  default: ModernTemplate,
};

export default function ResumeRenderer({ template, data: resumeData }) {
  if (!template || !resumeData) return <div>Loading...</div>;

  // The template object from the DB has an `id` (e.g., 'modern', 'classic')
  // It also contains the config data (colors, fonts, etc.)
  const TemplateComponent = templates[template.id] || templates.default;

  return <TemplateComponent data={resumeData} config={template} />;
}
