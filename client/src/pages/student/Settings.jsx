import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBell, FiMoon, FiSun, FiVolume2, FiGlobe, FiSave, FiCamera } from 'react-icons/fi';
import { selectCurrentUser, updateProfile, updatePreferences } from '../../store/slices/authSlice';
import { selectTheme, toggleTheme } from '../../store/slices/uiSlice';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const theme = useSelector(selectTheme);

    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        institution: user?.institution || '',
        yearOfStudy: user?.yearOfStudy || '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        quizReminders: user?.preferences?.quizReminders ?? true,
        soundEffects: user?.preferences?.soundEffects ?? true,
        voiceCommands: user?.preferences?.voiceCommands ?? false,
        language: user?.preferences?.language || 'en',
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: FiUser },
        { id: 'security', label: 'Security', icon: FiLock },
        { id: 'preferences', label: 'Preferences', icon: FiBell },
    ];

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile(profileData)).unwrap();
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err || 'Failed to update profile');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            await authAPI.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password changed successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        }
    };

    const handlePreferencesSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updatePreferences(preferences)).unwrap();
            toast.success('Preferences saved');
        } catch (err) {
            toast.error('Failed to save preferences');
        }
    };

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your account and preferences
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Tabs */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                                            ? 'bg-primary-500 text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6"
                        >
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Profile Information
                                    </h2>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </div>
                                        <button type="button" className="btn-secondary flex items-center gap-2">
                                            <FiCamera className="w-4 h-4" />
                                            Change Photo
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Institution
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.institution}
                                                onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Year of Study
                                            </label>
                                            <select
                                                value={profileData.yearOfStudy}
                                                onChange={(e) => setProfileData({ ...profileData, yearOfStudy: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="">Select year</option>
                                                {[1, 2, 3, 4, 5, 6].map((year) => (
                                                    <option key={year} value={year}>Year {year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <FiSave className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Change Password
                                    </h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwords.currentPassword}
                                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <FiLock className="w-4 h-4" />
                                        Update Password
                                    </button>
                                </form>
                            )}

                            {activeTab === 'preferences' && (
                                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        App Preferences
                                    </h2>

                                    {/* Theme */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            {theme === 'dark' ? <FiMoon className="w-5 h-5 text-primary-500" /> : <FiSun className="w-5 h-5 text-yellow-500" />}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                                <p className="text-sm text-gray-500">Toggle dark/light theme</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => dispatch(toggleTheme())}
                                            className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>

                                    {/* Notifications */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>

                                        {[
                                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                                            { key: 'quizReminders', label: 'Quiz Reminders', desc: 'Get reminded about pending quizzes' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPreferences({ ...preferences, [item.key]: !preferences[item.key] })}
                                                    className={`w-12 h-6 rounded-full transition-colors ${preferences[item.key] ? 'bg-primary-500' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* App settings */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white">App Settings</h3>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FiVolume2 className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Sound Effects</p>
                                                    <p className="text-sm text-gray-500">Play sounds for interactions</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPreferences({ ...preferences, soundEffects: !preferences.soundEffects })}
                                                className={`w-12 h-6 rounded-full transition-colors ${preferences.soundEffects ? 'bg-primary-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.soundEffects ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FiGlobe className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Language</p>
                                                    <p className="text-sm text-gray-500">Choose your preferred language</p>
                                                </div>
                                            </div>
                                            <select
                                                value={preferences.language}
                                                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <FiSave className="w-4 h-4" />
                                        Save Preferences
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
