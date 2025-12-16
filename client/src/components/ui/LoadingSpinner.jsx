import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const spinner = (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`${sizes[size]} border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full`}
            style={{ borderWidth: size === 'sm' ? 2 : 3 }}
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center gap-4">
                    {spinner}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-500 dark:text-gray-400"
                    >
                        Loading...
                    </motion.p>
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
