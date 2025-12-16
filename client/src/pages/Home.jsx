import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBox, FiLayers, FiZap, FiAward, FiSmartphone } from 'react-icons/fi';
import { fetchSystems, selectSystems } from '../store/slices/anatomySlice';

const Home = () => {
    const dispatch = useDispatch();
    const systems = useSelector(selectSystems);

    useEffect(() => {
        dispatch(fetchSystems());
    }, [dispatch]);

    const features = [
        {
            icon: FiBox,
            title: '3D Visualization',
            description: 'Explore detailed 3D models of human anatomy with interactive hotspots.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: FiSmartphone,
            title: 'Augmented Reality',
            description: 'Place anatomical models in your real environment using WebAR technology.',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: FiLayers,
            title: 'Layer Control',
            description: 'Toggle between different body systems and control visibility of each layer.',
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: FiZap,
            title: 'Interactive Quizzes',
            description: 'Test your knowledge with organ identification and multiple-choice quizzes.',
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-500/5 to-transparent rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                                <FiZap className="w-4 h-4" />
                                Next-Gen Medical Education
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6"
                        >
                            Learn Anatomy in{' '}
                            <span className="gradient-text">Augmented Reality</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto"
                        >
                            Immersive 3D visualization of human anatomy. Place organs in your space,
                            explore layer by layer, and master medical knowledge through interactive learning.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/library" className="ar-button text-lg">
                                <FiBox className="w-5 h-5" />
                                Explore in AR
                                <FiArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/quizzes" className="btn-secondary text-lg">
                                Take a Quiz
                            </Link>
                        </motion.div>
                    </div>

                    {/* Hero image/3D model placeholder */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-16 relative max-w-4xl mx-auto"
                    >
                        <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                            <iframe
                                title="Animated Full Human Body Anatomy"
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                src="https://sketchfab.com/models/9b0b079953b840bc9a13f524b60041e4/embed"
                            />
                        </div>

                        {/* Floating badges */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -left-4 top-1/4 glass-card p-3 hidden lg:flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <FiAward className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">12+ Systems</p>
                                <p className="text-sm text-gray-500">Complete Coverage</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                            className="absolute -right-4 bottom-1/4 glass-card p-3 hidden lg:flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                <FiSmartphone className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">AR Ready</p>
                                <p className="text-sm text-gray-500">Mobile Compatible</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            Powerful Learning Features
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Everything you need to master human anatomy with cutting-edge technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card-hover p-6"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Body Systems Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            Explore Body Systems
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Comprehensive coverage of all major anatomical systems
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        {systems.slice(0, 7).map((system, index) => (
                            <motion.div
                                key={system.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    to={`/library?system=${system.id}`}
                                    className="block glass-card-hover p-4 text-center group"
                                >
                                    <div className="text-4xl mb-3">{system.icon}</div>
                                    <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-primary-500 transition-colors">
                                        {system.name.split(' ')[0]}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">{system.count} items</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>


                    <div className="text-center mt-10">
                        <Link to="/library" className="btn-secondary inline-flex items-center gap-2">
                            View All Systems
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                        Ready to Transform Your Anatomy Learning?
                    </h2>
                    <p className="text-xl text-white/80 mb-10">
                        Join thousands of medical students using AR to master human anatomy.
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl">
                        Get Started Free
                        <FiArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
