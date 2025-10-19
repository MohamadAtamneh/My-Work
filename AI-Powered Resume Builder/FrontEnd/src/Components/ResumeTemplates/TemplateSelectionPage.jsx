import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResumeRenderer from './ResumeRenderer';

const TemplateSelectionPage = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userData, setUserData] = useState(null); // We'll fetch this later
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get('/api/templates');
        setTemplates(data);
        setSelectedTemplate(data[0]); // Select the first template by default
      } catch (error) {
        console.error('Failed to fetch templates', error);
      } finally {
        setLoading(false);
      }
    };

    // In a real app, you'd fetch the user's resume data here
    // For now, we'll use some mock data
    const fetchUserData = () => {
      setUserData({
        basics: {
          name: 'John Doe',
          label: 'Software Engineer',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
        },
        work: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: '2020-01-01',
            endDate: 'Present',
            summary: 'Developing amazing things.',
          },
        ],
      });
    };

    fetchTemplates();
    fetchUserData();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      // In a real app, you'd save this to the user's profile
      console.log(`Selected template: ${selectedTemplate.name}`);
      alert(`You've selected the ${selectedTemplate.name} template!`);
    }
  };

  if (loading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Choose a Template</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ul className="space-y-2">
            {templates.map((template) => (
              <li
                key={template._id}
                className={`p-4 rounded-lg cursor-pointer ${
                  selectedTemplate?._id === template._id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <h2 className="font-bold">{template.name}</h2>
                <p>{template.description}</p>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUseTemplate}
            className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
          >
            Use This Template
          </button>
        </div>
        <div className="md:col-span-2">
          {selectedTemplate && userData ? (
            <ResumeRenderer template={selectedTemplate} data={userData} />
          ) : (
            <div>Select a template to see a preview.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectionPage;
