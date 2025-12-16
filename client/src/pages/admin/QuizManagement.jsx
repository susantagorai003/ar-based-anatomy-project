import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHelpCircle, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAward } from 'react-icons/fi';
import { adminAPI, quizAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        system: 'general',
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 70,
    });

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await quizAPI.getQuizzes();
            setQuizzes(response.data.data);
        } catch (err) {
            toast.error('Failed to load quizzes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingQuiz) {
                await adminAPI.updateQuiz(editingQuiz._id, formData);
                toast.success('Quiz updated');
            } else {
                await adminAPI.createQuiz(formData);
                toast.success('Quiz created');
            }
            fetchQuizzes();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save quiz');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await adminAPI.deleteQuiz(id);
            setQuizzes(quizzes.filter(q => q._id !== id));
            toast.success('Quiz deleted');
        } catch (err) {
            toast.error('Failed to delete quiz');
        }
    };

    const openEditModal = (quiz) => {
        setEditingQuiz(quiz);
        setFormData({
            title: quiz.title,
            description: quiz.description,
            system: quiz.system,
            difficulty: quiz.difficulty,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingQuiz(null);
        setFormData({ title: '', description: '', system: 'general', difficulty: 'beginner', timeLimit: 10, passingScore: 70 });
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                        Quiz Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create and manage anatomy quizzes ({quizzes.length} total)
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    Create Quiz
                </button>
            </div>

            {/* Search */}
            <div className="glass-card p-4 mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search quizzes..."
                        className="input-search"
                    />
                </div>
            </div>

            {/* Quizzes grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                    <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <FiHelpCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEditModal(quiz)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(quiz._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg">
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{quiz.description}</p>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {quiz.difficulty}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{quiz.system}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span>{quiz.questions?.length || 0} questions</span>
                            <span className="flex items-center gap-1">
                                <FiAward className="w-4 h-4" />
                                {quiz.averageScore || 0}% avg
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card p-6 w-full max-w-lg mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field min-h-[80px]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System</label>
                                        <select value={formData.system} onChange={e => setFormData({ ...formData, system: e.target.value })} className="input-field">
                                            <option value="general">General</option>
                                            <option value="skeletal">Skeletal</option>
                                            <option value="muscular">Muscular</option>
                                            <option value="circulatory">Circulatory</option>
                                            <option value="nervous">Nervous</option>
                                            <option value="respiratory">Respiratory</option>
                                            <option value="digestive">Digestive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                                        <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="input-field">
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (min)</label>
                                        <input
                                            type="number"
                                            value={formData.timeLimit}
                                            onChange={e => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                            className="input-field"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label>
                                        <input
                                            type="number"
                                            value={formData.passingScore}
                                            onChange={e => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                            className="input-field"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="flex-1 btn-secondary">Cancel</button>
                                    <button type="submit" className="flex-1 btn-primary">
                                        {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizManagement;
