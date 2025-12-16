// Module Management - Placeholder for now
import { useState } from 'react';
import { FiBook, FiPlus, FiSearch } from 'react-icons/fi';

const ModuleManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                        Module Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create and manage learning modules
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    Create Module
                </button>
            </div>

            <div className="glass-card p-4 mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search modules..."
                        className="input-search"
                    />
                </div>
            </div>

            <div className="glass-card p-12 text-center">
                <FiBook className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Module Management Coming Soon
                </h3>
                <p className="text-gray-500">
                    This feature is under development. You'll be able to create learning modules that combine organs, models, and quizzes.
                </p>
            </div>
        </div>
    );
};

export default ModuleManagement;
