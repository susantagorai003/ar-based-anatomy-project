import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    FiCheck, FiX, FiAward, FiClock, FiRefreshCw,
    FiArrowRight, FiHome, FiTarget
} from 'react-icons/fi';
import { selectLastResult, selectCurrentQuiz, clearQuizSession } from '../../store/slices/quizSlice';

const QuizResult = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const result = useSelector(selectLastResult);
    const quiz = useSelector(selectCurrentQuiz);

    useEffect(() => {
        return () => {
            dispatch(clearQuizSession());
        };
    }, [dispatch]);

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <FiTarget className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No results found
                    </h2>
                    <Link to="/quizzes" className="btn-primary">
                        Browse Quizzes
                    </Link>
                </div>
            </div>
        );
    }

    const getScoreColor = () => {
        if (result.percentage >= 80) return 'from-green-500 to-emerald-500';
        if (result.percentage >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Result card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 text-center mb-8"
                >
                    {/* Score circle */}
                    <div className="relative w-40 h-40 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <motion.circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="url(#scoreGradient)"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: '0 440' }}
                                animate={{ strokeDasharray: `${result.percentage * 4.4} 440` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" className={`text-${getScoreColor().split(' ')[0].replace('from-', '')}`} stopColor="currentColor" />
                                    <stop offset="100%" className={`text-${getScoreColor().split(' ')[1].replace('to-', '')}`} stopColor="currentColor" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-4xl font-bold text-gray-900 dark:text-white"
                                >
                                    {result.percentage}%
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    {/* Pass/Fail badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring' }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${result.passed
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                    >
                        {result.passed ? (
                            <>
                                <FiAward className="w-5 h-5" />
                                <span className="font-semibold">Passed!</span>
                            </>
                        ) : (
                            <>
                                <FiX className="w-5 h-5" />
                                <span className="font-semibold">Not Passed</span>
                            </>
                        )}
                    </motion.div>

                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                        {quiz?.title || 'Quiz Complete!'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {result.passed ? 'Great job! You passed the quiz.' : 'Keep studying and try again.'}
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="stat-card"
                    >
                        <div className="flex items-center gap-2 text-green-500 mb-2">
                            <FiCheck className="w-5 h-5" />
                            <span className="text-sm font-medium">Correct</span>
                        </div>
                        <span className="stat-value">{result.correctAnswers}</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="stat-card"
                    >
                        <div className="flex items-center gap-2 text-red-500 mb-2">
                            <FiX className="w-5 h-5" />
                            <span className="text-sm font-medium">Incorrect</span>
                        </div>
                        <span className="stat-value">{result.incorrectAnswers}</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="stat-card"
                    >
                        <div className="flex items-center gap-2 text-primary-500 mb-2">
                            <FiAward className="w-5 h-5" />
                            <span className="text-sm font-medium">Score</span>
                        </div>
                        <span className="stat-value">{result.score}/{result.totalPoints}</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="stat-card"
                    >
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <FiClock className="w-5 h-5" />
                            <span className="text-sm font-medium">Time</span>
                        </div>
                        <span className="stat-value">{formatTime(result.timeTaken)}</span>
                    </motion.div>
                </div>

                {/* Answer review */}
                {result.answers && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-6 mb-8"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Answer Review
                        </h3>
                        <div className="space-y-4">
                            {result.answers.map((answer, index) => (
                                <div
                                    key={answer.questionId}
                                    className={`p-4 rounded-xl border-2 ${answer.isCorrect
                                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                            {answer.isCorrect ? (
                                                <FiCheck className="w-4 h-4 text-white" />
                                            ) : (
                                                <FiX className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white mb-1">
                                                Question {index + 1}
                                            </p>
                                            {!answer.isCorrect && answer.correctAnswer && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Correct answer: <span className="font-medium text-green-600 dark:text-green-400">
                                                        {typeof answer.correctAnswer === 'object'
                                                            ? answer.correctAnswer.text
                                                            : answer.correctAnswer}
                                                    </span>
                                                </p>
                                            )}
                                            {answer.explanation && (
                                                <p className="text-sm text-gray-500 mt-2 italic">
                                                    {answer.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={`/quiz/${slug}`} className="btn-secondary flex items-center justify-center gap-2">
                        <FiRefreshCw className="w-5 h-5" />
                        Retake Quiz
                    </Link>
                    <Link to="/quizzes" className="btn-primary flex items-center justify-center gap-2">
                        More Quizzes
                        <FiArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/dashboard" className="btn-ghost flex items-center justify-center gap-2">
                        <FiHome className="w-5 h-5" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuizResult;
