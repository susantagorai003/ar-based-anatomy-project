import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiBox, FiTarget, FiArrowRight } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { searchAnatomy, selectSearchResults, clearSearchResults } from '../../store/slices/anatomySlice';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchResults = useSelector(selectSearchResults);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            setQuery('');
            dispatch(clearSearchResults());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.length >= 2) {
                setIsSearching(true);
                dispatch(searchAnatomy(query)).finally(() => setIsSearching(false));
            } else {
                dispatch(clearSearchResults());
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query, dispatch]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // This would need to be handled by parent
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleResultClick = (type, slug) => {
        onClose();
        if (type === 'organ') {
            navigate(`/organ/${slug}`);
        } else {
            navigate(`/viewer/${slug}`);
        }
    };

    const hasResults = searchResults.organs?.length > 0 || searchResults.models?.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-2xl glass-card overflow-hidden mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <FiSearch className="w-5 h-5 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search organs, models, systems..."
                                className="flex-1 bg-transparent outline-none text-lg text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            )}
                            <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-96 overflow-y-auto scrollbar-custom">
                            {isSearching ? (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    <div className="animate-pulse">Searching...</div>
                                </div>
                            ) : hasResults ? (
                                <div className="p-4 space-y-4">
                                    {/* Organs */}
                                    {searchResults.organs?.length > 0 && (
                                        <div>
                                            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Organs
                                            </h4>
                                            <div className="space-y-1">
                                                {searchResults.organs.map((organ) => (
                                                    <button
                                                        key={organ._id}
                                                        onClick={() => handleResultClick('organ', organ.slug)}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                                    >
                                                        <FiTarget className="w-5 h-5 text-primary-500" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {organ.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {organ.system} • {organ.latinName}
                                                            </p>
                                                        </div>
                                                        <FiArrowRight className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Models */}
                                    {searchResults.models?.length > 0 && (
                                        <div>
                                            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                3D Models
                                            </h4>
                                            <div className="space-y-1">
                                                {searchResults.models.map((model) => (
                                                    <button
                                                        key={model._id}
                                                        onClick={() => handleResultClick('model', model.slug)}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                                    >
                                                        <FiBox className="w-5 h-5 text-accent-500" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {model.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {model.system}
                                                            </p>
                                                        </div>
                                                        <FiArrowRight className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : query.length >= 2 ? (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No results found for "{query}"
                                </div>
                            ) : (
                                <div className="px-6 py-8">
                                    <p className="text-center text-gray-500 mb-4">
                                        Start typing to search
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Heart', 'Brain', 'Lungs', 'Skeleton', 'Liver'].map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => setQuery(term)}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
