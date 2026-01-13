import { motion } from 'framer-motion';

interface LoadingShimmerProps {
    count?: number;
}

export const LoadingShimmer = ({ count = 5 }: LoadingShimmerProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative overflow-hidden bg-midnight-100/60 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 h-48"
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent" />

                    {/* Content skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-700/40 rounded w-3/4" />
                        <div className="h-4 bg-slate-700/40 rounded w-1/2" />
                        <div className="h-4 bg-slate-700/40 rounded w-2/3" />
                        <div className="mt-6 h-8 bg-slate-700/40 rounded w-20" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Simple text loader for inline loading states
export const TextLoader = () => {
    return (
        <div className="flex items-center justify-center gap-2 py-8">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
            />
            <span className="text-slate-500 text-sm">Loading...</span>
        </div>
    );
};
