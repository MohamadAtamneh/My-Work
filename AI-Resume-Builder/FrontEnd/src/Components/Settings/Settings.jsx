// src/Components/Settings/Settings.jsx
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.log("Token expired or invalid. Logging out.");
      localStorage.removeItem('token');
      // This assumes you have a way to globally set the user to null.
      // A more robust solution would use a global state management library.
      window.location.href = '/login'; // Force a full page reload to clear all state
    }
    return Promise.reject(error);
  }
);

export default function Settings() {
    const { user, setUser } = useContext(UserContext);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [message, setMessage] = useState({ type: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setEmail(user.email || '');
            setPhotoPreview(user.photo || '');
        }
    }, [user]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });
        setLoading(true);

        try {
            const payload = { fullName ,newPassword, currentPassword};
            if (photo) payload.photo = photo;
            if (newPassword && newPassword !== confirmPassword) {
                setMessage({ type: 'error', content: 'New passwords do not match.' });
                setLoading(false);
                return;
            }

            const response = await api.put('/settings/profile', payload);
            setUser(response.data.user);
            setMessage({ type: 'success', content: 'Profile updated successfully!' });
            setPhoto(null);
        } catch (err) {
            console.error('Profile update error:', err);
            setMessage({
                type: 'error',
                content: err.response?.data?.message || 'Failed to update profile.'
            });
        } finally {
            setLoading(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
                <div className="text-gray-400">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Decorative background gradient (matches Dashboard) */}
            <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-48 bg-gradient-to-b from-purple-700/10 via-indigo-600/10 to-transparent blur-3xl" />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-400">Manage your profile and account preferences</p>
            </div>

            {/* Status Message */}
            {message.content && (
                <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-300'
                    : 'bg-rose-900/20 border-rose-800/30 text-rose-300'
                    } flex items-start`}>
                    <div className="mr-3 mt-0.5">
                        {message.type === 'success' ? '✅' : '⚠️'}
                    </div>
                    <span>{message.content}</span>
                </div>
            )}

            {/* Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden shadow-xl">
                <form onSubmit={handleProfileUpdate}>
                    <div className="px-5 py-6 sm:px-6 sm:py-7">
                        <h2 className="text-sm font-semibold text-white mb-5 flex items-center">
                            <span className="mr-2">👤</span> Profile Information
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Avatar Section */}
                            <div className="lg:col-span-1 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl text-gray-400">
                                                {fullName.charAt(0).toUpperCase() || email.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 cursor-pointer bg-purple-600 hover:bg-purple-500 p-1.5 rounded-full shadow-md transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                </div>
                                <p className="mt-3 text-xs text-gray-400 text-center max-w-[160px]">
                                    JPG or PNG • Max 5MB
                                </p>
                            </div>

                            {/* Form Fields */}
                            <div className="lg:col-span-2 space-y-5">
                                <div>
                                    <label htmlFor="fullName" className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={loading}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 placeholder-gray-500 cursor-not-allowed"
                                            value={email}
                                            readOnly
                                            disabled
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded">
                                                Verified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-6 sm:px-6 sm:py-7 border-t border-white/10 mt-6">
                        <h2 className="text-sm font-semibold text-white mb-5 flex items-center">
                            <span className="mr-2">🔒</span> Change Password
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-400 mb-1.5">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-400 mb-1.5">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="px-5 py-4 border-t border-white/10 bg-white/5 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-70 text-white text-sm font-medium rounded-xl transition flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}