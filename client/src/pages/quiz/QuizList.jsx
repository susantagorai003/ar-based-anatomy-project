import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiClock, FiHelpCircle, FiAward, FiArrowRight, FiLock, FiPlay, FiCheckCircle } from 'react-icons/fi';
import { fetchQuizzes, selectQuizzes, selectQuizLoading } from '../../store/slices/quizSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const QuizList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const quizzes = useSelector(selectQuizzes);
    const isLoading = useSelector(selectQuizLoading);
    const user = useSelector(selectCurrentUser);

    const [selectedSystem, setSelectedSystem] = useState(null);

    // System filter configuration
    const systems = [
        { id: 'skeletal', name: 'Skeletal', icon: '🦴', color: 'from-gray-500 to-gray-700' },
        { id: 'circulatory', name: 'Circulatory', icon: '❤️', color: 'from-red-500 to-red-700' },
        { id: 'muscular', name: 'Muscular', icon: '💪', color: 'from-orange-500 to-orange-700' },
        { id: 'respiratory', name: 'Respiratory', icon: '🫁', color: 'from-sky-500 to-sky-700' },
        { id: 'nervous', name: 'Nervous', icon: '🧠', color: 'from-purple-500 to-purple-700' },
        { id: 'digestive', name: 'Digestive', icon: '🍽️', color: 'from-amber-500 to-amber-700' },
        { id: 'urinary', name: 'Urinary', icon: '🫀', color: 'from-yellow-500 to-yellow-700' },
    ];

    useEffect(() => {
        dispatch(fetchQuizzes(selectedSystem ? { system: selectedSystem } : {}));
    }, [dispatch, selectedSystem]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getSystemInfo = (systemId) => {
        return systems.find(s => s.id === systemId) || { icon: '📚', name: systemId, color: 'from-gray-500 to-gray-700' };
    };

    const handleQuizClick = (quiz, e) => {
        if (!user) {
            e.preventDefault();
            navigate('/login', { state: { from: `/quiz/${quiz.slug}`, message: 'Please login to take the quiz' } });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const filteredQuizzes = selectedSystem
        ? quizzes.filter(q => q.system === selectedSystem)
        : quizzes;

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        Anatomy Quizzes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Test your knowledge with timed quizzes. Earn points and track your progress!
                    </p>

                    {/* Login reminder for guests */}
                    {!user && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800"
                        >
                            <div className="flex items-center gap-3">
                                <FiLock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Login Required</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link> to take quizzes and earn points!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* System Filters */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedSystem(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedSystem
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            All Systems
                        </button>
                        {systems.map((system) => (
                            <button
                                key={system.id}
                                onClick={() => setSelectedSystem(system.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedSystem === system.id
                                    ? 'bg-primary-500 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span>{system.icon}</span>
                                <span className="hidden sm:inline">{system.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quiz grid */}
                {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-20">
                        <FiHelpCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No quizzes available
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {selectedSystem ? `No quizzes for ${getSystemInfo(selectedSystem).name} yet` : 'Check back later for new quizzes'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz, index) => {
                            const systemInfo = getSystemInfo(quiz.system);

                            return (
                                <motion.div
                                    key={quiz._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        to={user ? `/quiz/${quiz.slug}` : '#'}
                                        onClick={(e) => handleQuizClick(quiz, e)}
                                        className="glass-card-hover block p-6 group relative overflow-hidden"
                                    >
                                        {/* Gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${systemInfo.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

                                        {/* Quiz thumbnail or icon */}
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${systemInfo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                            <span className="text-2xl">{systemInfo.icon}</span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors mb-2">
                                            {quiz.title}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                            {quiz.description}
                                        </p>

                                        {/* Meta info */}
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                                                {quiz.difficulty}
                                            </span>
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                {systemInfo.icon} {systemInfo.name}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <FiAward className="w-4 h-4 text-yellow-500" />
                                                    {quiz.totalPoints || quiz.questions?.length * 10} pts
                                                </span>
                                                {quiz.timeLimit > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <FiClock className="w-4 h-4" />
                                                        {quiz.timeLimit} min
                                                    </span>
                                                )}
                                            </div>
                                            {quiz.questions && (
                                                <span className="flex items-center gap-1">
                                                    <FiHelpCircle className="w-4 h-4" />
                                                    {quiz.questions.length} Q
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            {user ? (
                                                <span className="flex items-center gap-2 text-primary-500 font-medium group-hover:gap-3 transition-all">
                                                    <FiPlay className="w-4 h-4" />
                                                    Start Quiz
                                                    <FiArrowRight className="w-4 h-4" />
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-gray-500 font-medium">
                                                    <FiLock className="w-4 h-4" />
                                                    Login to Start
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* User Points Display (for logged in users) */}
                {user && user.stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Your Quiz Stats
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {user.stats.totalPoints || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {user.stats.quizzesTaken || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {Math.round(user.stats.averageScore || 0)}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    <FiAward className="w-6 h-6 inline" />
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {user.stats.totalPoints >= 500 ? 'Master' :
                                        user.stats.totalPoints >= 200 ? 'Expert' :
                                            user.stats.totalPoints >= 50 ? 'Learner' : 'Beginner'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default QuizList;
