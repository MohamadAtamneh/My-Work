import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResumeExamples = () => {
    const [examples, setExamples] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExamples = async () => {
            try {
                const response = await axios.get('/api/templates');
                setExamples(response.data);
            } catch (error) {
                console.error('Error fetching resume examples:', error);
            }
        };
        fetchExamples();
    }, []);

    const handleUseTemplate = (example) => {
        navigate('/create-resume', { state: { template: example } });
    };

    return (
        <div className="relative pt-6 pb-10 px-4 sm:px-6 max-w-7xl mx-auto">
            {/* Decorative background gradient */}
            <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-purple-700/10 via-indigo-600/10 to-transparent blur-3xl" />

            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Resume Examples</h1>
                <p className="mt-1 text-sm text-gray-400">Choose a template to start building your resume.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {examples.map((example) => (
                    <div key={example._id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl p-4 flex flex-col items-center text-center transition hover:border-purple-500/50">
                        <div className="w-full h-48 bg-gray-900/60 rounded-md mb-4 overflow-hidden">
                            <img src={example.imageUrl} alt={example.name} className="w-full h-full object-cover object-top resume-example-image" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{example.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 flex-grow">{example.description}</p>
                        <button
                            onClick={() => handleUseTemplate(example)}
                            className="mt-auto px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow"
                        >
                            Use This Template
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumeExamples;