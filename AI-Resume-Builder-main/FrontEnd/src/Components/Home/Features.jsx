import React from 'react';
import { Briefcase, FileText, BrainCircuit } from 'lucide-react';

const features = [
  {
    icon: <FileText size={48} className="text-purple-400" />,
    title: 'Modern Resume Templates',
    description: 'Choose from a variety of professionally designed templates that are proven to get past HR screening systems.',
  },
  {
    icon: <BrainCircuit size={48} className="text-purple-400" />,
    title: 'AI-Powered Content',
    description: 'Let our AI assistant help you craft the perfect resume summary, highlight your skills, and write compelling bullet points.',
  },
  {
    icon: <Briefcase size={48} className="text-purple-400" />,
    title: 'Job Application Tracker',
    description: 'Keep track of all your job applications in one place, from initial application to final offer.',
  },
];

export default function Features() {
  return (
    <div className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">Why Choose Our Resume Builder?</h2>
          <p className="text-lg text-gray-400 mt-4">Everything you need to create the perfect resume and land your dream job.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-lg text-center">
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}