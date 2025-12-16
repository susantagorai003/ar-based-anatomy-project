import { Link } from 'react-router-dom';
import { FiX, FiExternalLink, FiBookmark, FiEdit3 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const OrganInfoCard = ({ hotspot, onClose }) => {
    if (!hotspot) return null;

    const organ = hotspot.linkedOrgan;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {hotspot.name || organ?.name || 'Selected Part'}
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {organ ? (
                    <div className="space-y-4">
                        {/* Organ name and system */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {organ.name}
                            </h4>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs font-medium">
                                {organ.system}
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Description
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {organ.description}
                            </p>
                        </div>

                        {/* Function */}
                        {organ.function && (
                            <div>
                                <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Function
                                </h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {organ.function}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {hotspot.description || 'No detailed information available for this part.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {organ && (
                    <Link
                        to={`/organ/${organ.slug}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        <FiExternalLink className="w-4 h-4" />
                        View Full Details
                    </Link>
                )}
                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <FiBookmark className="w-4 h-4" />
                        Bookmark
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <FiEdit3 className="w-4 h-4" />
                        Add Note
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default OrganInfoCard;
