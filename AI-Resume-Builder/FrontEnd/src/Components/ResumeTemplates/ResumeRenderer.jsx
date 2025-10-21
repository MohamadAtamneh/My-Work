import React from 'react';
import { Mail, Phone, MapPin, FileText, Briefcase, GraduationCap, Award } from 'lucide-react';

// Icon mapping
const iconMap = {
  'mail': Mail,
  'phone': Phone,
  'map-pin': MapPin,
  'file-text': FileText,
  'briefcase': Briefcase,
  'graduation-cap': GraduationCap,
  'award': Award
};

// Dynamic Template Renderer
const ResumeRenderer = ({ template, resumeData }) => {
  // Resolve theme colors
  const resolveColor = (colorKey) => {
    if (!colorKey) return undefined;
    return template.theme.colors[colorKey] || colorKey;
  };

  // Get nested data using path like "personalInfo.name"
  const getDataByPath = (path, contextData = resumeData) => {
    if (!path) return null;
    return path.split('.').reduce((obj, key) => obj?.[key], contextData);
  };

  // Apply styles with theme color resolution
  const applyStyle = (style) => {
    if (!style) return {};

    const resolved = { ...style };

    // Resolve color references
    if (style.color) resolved.color = resolveColor(style.color);
    if (style.borderColor) resolved.borderColor = resolveColor(style.borderColor);
    if (style.backgroundColor) resolved.backgroundColor = resolveColor(style.backgroundColor);

    return resolved;
  };

  // Process template strings like "{company} | {location}"
  const processTemplate = (templateStr, data) => {
    if (!templateStr || typeof templateStr !== 'string') return templateStr;

    // Handle special join operation for arrays
    if (templateStr.startsWith('{join:')) {
      const match = templateStr.match(/\{join:'(.*)'\}/);
      const separator = match?.[1] || ', ';
      return Array.isArray(data) ? data.join(separator) : data;
    }

    // Replace {field} with actual data
    return templateStr.replace(/\{(\w+)\}/g, (match, field) => {
      return data?.[field] || '';
    });
  };

  // Render icon component
  const renderIcon = (iconName, style = {}) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={style.size || 20} style={style} />;
  };

  // Render single element
  const renderElement = (element, data, index) => {
    const elementData = element.dataPath ? getDataByPath(element.dataPath, data) : data;
    const style = applyStyle(element.style);

    switch (element.type) {
      case 'text': {
        let content;
        if (element.template) {
          if (element.template.startsWith('{join:')) {
            content = processTemplate(element.template, elementData);
          } else {
            content = processTemplate(element.template, data);
          }
        } else {
          content = Array.isArray(elementData) ? elementData.join(', ') : elementData;
        }

        if (!content) return null;

        return (
          <div key={index} style={style}>
            {content}
          </div>
        );
      }

      case 'avatar': {
        const name = elementData || '';
        const initials = name
          .split(' ')
          .map(n => n[0])
          .filter(Boolean)
          .join('')
          .toUpperCase()
          .substring(0, 3); // Safeguard against empty

        return (
          <div key={index} style={style}>
            {initials}
          </div>
        );
      }

      case 'contact-row': {
        return (
          <div key={index} style={style}>
            {element.items?.map((item, i) => {
              const value = getDataByPath(item.dataPath, data);
              if (!value) return null;

              const separator = element.separator && i > 0 ? (
                <span style={{ margin: '0 8px' }}>{element.separator}</span>
              ) : null;

              return (
                <React.Fragment key={i}>
                  {separator}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.icon && renderIcon(item.icon, { size: 14 })}
                    {value}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        );
      }

      case 'contact-list': {
        return (
          <div key={index} style={style}>
            {element.items?.map((item, i) => {
              const value = getDataByPath(item.dataPath, data);
              if (!value) return null;

              return (
                <div key={i} style={element.itemStyle}>
                  {item.icon && renderIcon(item.icon, { size: 16 })}
                  <span>{value}</span>
                </div>
              );
            })}
          </div>
        );
      }

      case 'list': {
        if (!Array.isArray(elementData)) return null;

        const ListTag = element.listStyle === 'none' ? 'div' : 'ul';
        const listStyleType = element.listStyle === 'custom' ? 'none' : element.listStyle;

        return (
          <ListTag key={index} style={{ ...style, listStyleType }}>
            {elementData.map((item, i) => {
              if (element.listStyle === 'custom') {
                return (
                  <div key={i} style={element.itemStyle}>
                    <span style={element.markerStyle}>{element.listMarker}</span>
                    <span>{item}</span>
                  </div>
                );
              }
              return (
                <li key={i} style={element.itemStyle}>
                  {item}
                </li>
              );
            })}
          </ListTag>
        );
      }

      case 'tag-list': {
        if (!Array.isArray(elementData)) return null;

        return (
          <div key={index} style={style}>
            {elementData.map((tag, i) => (
              <span key={i} style={applyStyle(element.tagStyle)}>
                {tag}
              </span>
            ))}
          </div>
        );
      }

      case 'group': {
        return (
          <div key={index} style={style}>
            {element.elements?.map((el, i) => renderElement(el, data, i))}
          </div>
        );
      }

      case 'flex-row': {
        return (
          <div key={index} style={style}>
            {element.elements?.map((el, i) => renderElement(el, data, `flex-${i}`))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Render section
  const renderSection = (section, data, index) => {
    // Handle layout containers: sidebar and main (used in grid layouts)
    if (section.type === 'sidebar' || section.type === 'main') {
      const style = applyStyle(section.style);
      const className = `resume-${section.type}`;

      return (
        <div key={index} className={className} style={style}>
          {section.sections?.map((subsection, i) => renderSection(subsection, data, i))}
        </div>
      );
    }

    // Handle content sections
    const style = applyStyle(section.style);

    if (section.type === 'repeatable-section') {
      const items = getDataByPath(section.dataPath, data);
      if (!Array.isArray(items) || items.length === 0) return null;

      return (
        <div key={index} style={{display: 'inline-block', width: '100%'}}>
          <div className="resume-section" style={style}>
            {section.showTitle && section.title && (
              <div style={applyStyle(section.titleStyle)}>
                {section.titleIcon && renderIcon(section.titleIcon)}
                {section.title}
              </div>
            )}
            {items.map((item, i) => {
              const itemStyle = applyStyle(section.itemStyle); 
              return (
                <div key={i} className="repeatable-item" style={itemStyle}>
                  {section.elements?.map((el, j) => renderElement(el, item, j))}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (section.type === 'section') {
      return (
        <div key={index} style={{display: 'inline-block', width: '100%'}}>
          <div className="resume-section" style={style}>
            {section.showTitle && section.title && (
              <div style={applyStyle(section.titleStyle)}>
                {section.titleIcon && renderIcon(section.titleIcon)}
                {section.title}
              </div>
            )}
            {section.elements?.map((el, i) => renderElement(el, data, i))}
          </div>
        </div>
      );
    }

    // Unknown section type
    return null;
  };

  // Render root structure
  const renderStructure = () => {
    const { structure } = template;
    const style = applyStyle(structure.style);
    // Ensure a default white background if the theme color resolution fails
    if (!style.backgroundColor || style.backgroundColor === 'background') {
      style.backgroundColor = '#ffffff';
    }
    // Trust the theme for background; no forced override
    // (If needed, ensure your theme defines 'background')

    return (
      
      <div className="page" style={style}>
        {structure.sections?.map((section, i) => renderSection(section, resumeData, i))}
      </div>
    );
  };

  return renderStructure();
};

export default ResumeRenderer;