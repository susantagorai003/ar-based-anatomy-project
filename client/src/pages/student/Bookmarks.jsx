import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiBookmark, FiBox, FiTrash2, FiFolder, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { fetchBookmarks, selectBookmarks, selectAnatomyLoading } from '../../store/slices/anatomySlice';
import { bookmarkAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Bookmarks = () => {
    const dispatch = useDispatch();
    const bookmarks = useSelector(selectBookmarks);
    const isLoading = useSelector(selectAnatomyLoading);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFolder, setSelectedFolder] = useState('all');

    useEffect(() => {
        dispatch(fetchBookmarks());
    }, [dispatch]);

    const handleDelete = async (id) => {
        try {
            await bookmarkAPI.delete(id);
            dispatch(fetchBookmarks());
            toast.success('Bookmark removed');
        } catch (err) {
            toast.error('Failed to remove bookmark');
        }
    };

    const folders = ['all', ...new Set(bookmarks.map(b => b.folder).filter(Boolean))];

    const filteredBookmarks = bookmarks.filter(bookmark => {
        const matchesSearch =
            bookmark.anatomyModel?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookmark.organ?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolder === 'all' || bookmark.folder === selectedFolder;
        return matchesSearch && matchesFolder;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FiBookmark className="text-yellow-500" />
                            Bookmarks
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <FiGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <FiList className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and filters */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search bookmarks..."
                                className="input-search"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {folders.map(folder => (
                                <button
                                    key={folder}
                                    onClick={() => setSelectedFolder(folder)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFolder === folder
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <FiFolder className="w-4 h-4" />
                                    {folder === 'all' ? 'All' : folder}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bookmarks */}
                {filteredBookmarks.length === 0 ? (
                    <div className="text-center py-20">
                        <FiBookmark className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {bookmarks.length === 0 ? 'No bookmarks yet' : 'No matching bookmarks'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {bookmarks.length === 0
                                ? 'Start exploring and bookmark models you want to revisit'
                                : 'Try a different search term'}
                        </p>
                        <Link to="/library" className="btn-primary">
                            Explore Library
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                        {filteredBookmarks.map((bookmark, index) => {
                            const item = bookmark.anatomyModel || bookmark.organ;
                            const isModel = !!bookmark.anatomyModel;

                            return (
                                <motion.div
                                    key={bookmark._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={viewMode === 'grid' ? '' : 'glass-card p-4'}
                                >
                                    {viewMode === 'grid' ? (
                                        <div className="glass-card-hover overflow-hidden group">
                                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative">
                                                {item?.thumbnail ? (
                                                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FiBox className="w-12 h-12 text-gray-400" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(bookmark._id)}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <Link to={isModel ? `/viewer/${item.slug}` : `/organ/${item.slug}`}>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors">
                                                        {item?.name}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                        {isModel ? 'Model' : 'Organ'}
                                                    </span>
                                                    {bookmark.folder && (
                                                        <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded text-xs">
                                                            {bookmark.folder}
                                                        </span>
                                                    )}
                                                </div>
                                                {bookmark.notes && (
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{bookmark.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                {item?.thumbnail ? (
                                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <FiBox className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <Link to={isModel ? `/viewer/${item.slug}` : `/organ/${item.slug}`}>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-500">
                                                        {item?.name}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">{isModel ? 'Model' : 'Organ'}</span>
                                                    {bookmark.folder && (
                                                        <span className="text-xs text-primary-500">{bookmark.folder}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(bookmark._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
