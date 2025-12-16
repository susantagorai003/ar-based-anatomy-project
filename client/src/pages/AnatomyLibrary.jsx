import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiFilter, FiBox, FiEye } from 'react-icons/fi';
import { fetchModels, fetchSystems, selectModels, selectSystems, selectAnatomyLoading } from '../store/slices/anatomySlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AnatomyLibrary = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();
    const models = useSelector(selectModels);
    const systems = useSelector(selectSystems);
    const isLoading = useSelector(selectAnatomyLoading);

    const selectedSystem = searchParams.get('system') || '';
    const selectedDifficulty = searchParams.get('difficulty') || '';

    useEffect(() => {
        dispatch(fetchSystems());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchModels({
            system: selectedSystem,
            difficulty: selectedDifficulty,
            search: searchQuery,
        }));
    }, [dispatch, selectedSystem, selectedDifficulty, searchQuery]);

    const handleSystemChange = (system) => {
        if (system === selectedSystem) {
            searchParams.delete('system');
        } else {
            searchParams.set('system', system);
        }
        setSearchParams(searchParams);
    };

    const handleDifficultyChange = (difficulty) => {
        if (difficulty === selectedDifficulty) {
            searchParams.delete('difficulty');
        } else {
            searchParams.set('difficulty', difficulty);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                            Anatomy Library
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Explore interactive 3D models of human anatomy
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''
                                    }`}
                            >
                                <FiGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''
                                    }`}
                            >
                                <FiList className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and filters */}
                <div className="glass-card p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search models..."
                                    className="input-search"
                                />
                            </div>
                        </div>

                        {/* Difficulty filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Difficulty:</span>
                            {['beginner', 'intermediate', 'advanced'].map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => handleDifficultyChange(diff)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDifficulty === diff
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System filters */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {systems.map((system) => (
                            <button
                                key={system.id}
                                onClick={() => handleSystemChange(system.id)}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedSystem === system.id
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span>{system.icon}</span>
                                {system.name.split(' ')[0]}
                                <span className="text-xs opacity-70">({system.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured 3D Models Section - Always visible when no filter is selected */}
                {!selectedSystem && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                                🎯 Featured 3D Models
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Interactive Sketchfab Models
                            </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Skeleton Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="Human Skeleton Highresolution model"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/657a31ed9704423c8c4e752fb2506a74/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🦴</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Human Skeleton
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Complete skeletal system with 206 bones in high resolution detail.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium">
                                            Skeletal System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by l.kuzyakin
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Heart Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="Realistic Human Heart"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/3f8072336ce94d18b3d0d055a1ece089/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">❤️</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Human Heart
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Realistic heart model with all four chambers and major vessels.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                                            Circulatory System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by neshallads
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Muscular System Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="Muscle system in human body - Muscular system"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/7ea21567ff9942bf9511e2d99efe85d9/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">💪</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Muscular System
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Complete muscle system showing all major muscle groups.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                                            Muscular System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by srikanthsamba
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Lungs Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="Realistic Human Lungs"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/ce09f4099a68467880f46e61eb9a3531/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🫁</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Human Lungs
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Realistic lungs model showing bronchi and alveoli structure.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-medium">
                                            Respiratory System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by neshallads
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Nervous System Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="The Nervous System"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/2e6be1399756494b9f185ce8c5900911/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🧠</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Nervous System
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Complete nervous system with brain, spinal cord, and nerves.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium">
                                            Nervous System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by Univ. of Dundee
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Digestive System Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="Digestive System"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/3f598117d05044b88e95be6c5a3c59b9/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-green-50 dark:from-amber-900/20 dark:to-green-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🧠</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Digestive System
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Complete digestive tract from mouth to intestines.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                            Digestive System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by lwjcxhlsc
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Urinary System Model Card */}
                            <div className="glass-card overflow-hidden group">
                                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                                    <iframe
                                        title="Kidneys - Urinary System"
                                        className="w-full h-full absolute inset-0"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        src="https://sketchfab.com/models/03d325c81aaa4dfabb74b727fec0a1a4/embed"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🫀</span>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Urinary System
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Kidneys and urinary tract filtration system.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                                            Urinary System
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                            by Cos
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Skeletal System 3D Showcase - Shows when Skeletal is selected */}
                {selectedSystem === 'skeletal' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Skeleton Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">🦴</span>
                                    Skeletal System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    Human Skeleton
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the complete human skeletal system in stunning 3D detail.
                                    The skeleton provides structural support, protects vital organs,
                                    and works with muscles to enable movement. Rotate and zoom to
                                    examine each of the 206 bones.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                        206 Bones
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                        Full Body View
                                    </span>
                                </div>
                            </div>

                            {/* Skeleton 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="Human Skeleton Highresolution model"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/657a31ed9704423c8c4e752fb2506a74/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/human-skeleton-highresolution-model-657a31ed9704423c8c4e752fb2506a74"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Human Skeleton Highresolution model
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/l.kuzyakin"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            l.kuzyakin
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Muscular System 3D Showcase - Shows when Muscular is selected */}
                {selectedSystem === 'muscular' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Muscle Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">💪</span>
                                    Muscular System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    Human Muscular System
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the complete human muscular system in stunning 3D detail.
                                    The muscular system enables movement, maintains posture, and generates
                                    heat. Rotate and zoom to examine over 600 muscles in the human body.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-orange-200 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 text-xs">
                                        600+ Muscles
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-orange-200 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-orange-200 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300 text-xs">
                                        Full Body View
                                    </span>
                                </div>
                            </div>

                            {/* Muscle 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="Muscle system in human body - Muscular system"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/7ea21567ff9942bf9511e2d99efe85d9/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/muscle-system-in-human-body-muscular-system-7ea21567ff9942bf9511e2d99efe85d9"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Muscular System
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/srikanthsamba"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            srikanthsamba
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Circulatory System 3D Showcase - Shows when Circulatory is selected */}
                {selectedSystem === 'circulatory' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Heart Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">❤️</span>
                                    Circulatory System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    Realistic Human Heart
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the human heart in stunning 3D detail. The heart is a muscular
                                    organ that pumps blood throughout the body via the circulatory system.
                                    Rotate and zoom to examine all four chambers, major vessels, and valves.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 text-xs">
                                        4 Chambers
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 text-xs">
                                        100,000 Beats/Day
                                    </span>
                                </div>
                            </div>

                            {/* Heart 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="Realistic Human Heart"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/3f8072336ce94d18b3d0d055a1ece089/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Realistic Human Heart
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/neshallads"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            neshallads
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Respiratory System 3D Showcase - Shows when Respiratory is selected */}
                {selectedSystem === 'respiratory' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Lungs Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">🫁</span>
                                    Respiratory System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    Realistic Human Lungs
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the human respiratory system in stunning 3D detail.
                                    The lungs are essential for gas exchange, bringing oxygen into
                                    the body and removing carbon dioxide. Examine the bronchi, alveoli,
                                    and intricate vascular network.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-sky-200 dark:bg-sky-800/50 text-sky-700 dark:text-sky-300 text-xs">
                                        300M Alveoli
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-sky-200 dark:bg-sky-800/50 text-sky-700 dark:text-sky-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-sky-200 dark:bg-sky-800/50 text-sky-700 dark:text-sky-300 text-xs">
                                        Gas Exchange
                                    </span>
                                </div>
                            </div>

                            {/* Lungs 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="Realistic Human Lungs"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/ce09f4099a68467880f46e61eb9a3531/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/realistic-human-lungs-ce09f4099a68467880f46e61eb9a3531"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Realistic Human Lungs
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/neshallads"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            neshallads
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Nervous System 3D Showcase - Shows when Nervous is selected */}
                {selectedSystem === 'nervous' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Nervous Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">🧠</span>
                                    Nervous System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    The Nervous System
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the human nervous system in stunning 3D detail.
                                    The nervous system controls body functions, processes sensory
                                    information, and enables cognition and memory. Examine the brain,
                                    spinal cord, and peripheral nerves.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 text-xs">
                                        86B Neurons
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 text-xs">
                                        CNS & PNS
                                    </span>
                                </div>
                            </div>

                            {/* Nervous 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="The Nervous System"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/2e6be1399756494b9f185ce8c5900911/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/the-nervous-system-2e6be1399756494b9f185ce8c5900911"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            The Nervous System
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/anatomy_dundee"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            University of Dundee, CAHID
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Digestive System 3D Showcase - Shows when Digestive is selected */}
                {selectedSystem === 'digestive' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Digestive Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-amber-50 to-green-50 dark:from-amber-900/20 dark:to-green-900/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">🧠</span>
                                    Digestive System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    Digestive System
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the human digestive system in stunning 3D detail.
                                    The digestive system breaks down food into nutrients for energy
                                    and cell repair. Examine the esophagus, stomach, intestines,
                                    liver, and pancreas.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-xs">
                                        30ft Long
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-xs">
                                        GI Tract
                                    </span>
                                </div>
                            </div>

                            {/* Digestive 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="Digestive System"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/3f598117d05044b88e95be6c5a3c59b9/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/digestive-system-3f598117d05044b88e95be6c5a3c59b9"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Digestive System
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/lwjcxhlsc"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            lwjcxhlsc
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Urinary System 3D Showcase - Shows when Urinary is selected */}
                {selectedSystem === 'urinary' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card overflow-hidden mb-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Urinary Info Panel */}
                            <div className="p-6 lg:p-8 flex flex-col justify-center bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-4 w-fit">
                                    <span className="text-lg">🫀</span>
                                    Urinary System Overview
                                </div>
                                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                                    Kidneys - Urinary System
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base">
                                    Explore the human urinary system in stunning 3D detail.
                                    The kidneys filter blood, remove waste, and regulate fluid balance.
                                    Examine the kidneys, ureters, bladder, and urethra.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-yellow-200 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300 text-xs">
                                        2 Kidneys
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-yellow-200 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300 text-xs">
                                        Interactive 3D
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-yellow-200 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300 text-xs">
                                        Filtration
                                    </span>
                                </div>
                            </div>

                            {/* Urinary 3D Embed */}
                            <div className="relative aspect-video lg:aspect-auto lg:min-h-[350px] bg-gradient-to-br from-gray-800 to-gray-900">
                                <iframe
                                    title="Kidneys - Urinary System"
                                    className="w-full h-full absolute inset-0"
                                    frameBorder="0"
                                    allowFullScreen
                                    mozallowfullscreen="true"
                                    webkitallowfullscreen="true"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    src="https://sketchfab.com/models/03d325c81aaa4dfabb74b727fec0a1a4/embed"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-gray-300">
                                        <a
                                            href="https://sketchfab.com/3d-models/kidneys-urinary-system-03d325c81aaa4dfabb74b727fec0a1a4"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Kidneys - Urinary System
                                        </a>
                                        {' '}by{' '}
                                        <a
                                            href="https://sketchfab.com/CostaP"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Cos
                                        </a>
                                        {' '}on{' '}
                                        <a
                                            href="https://sketchfab.com"
                                            target="_blank"
                                            rel="nofollow noreferrer"
                                            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Sketchfab
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}


            </div>
        </div>
    );
};

export default AnatomyLibrary;
