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
                    transition={{ delay: index * 0.07 }}
                    className="relative overflow-hidden rounded-2xl"
                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', height: '22rem' }}
                >
                    {/* Shimmer sweep */}
                    <div className="absolute inset-0 -translate-x-full animate-shimmer"
                         style={{ background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.04), transparent)' }} />
                    {/* Cover area */}
                    <div className="h-52 w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    {/* Text skeletons */}
                    <div className="p-5 space-y-3">
                        <div className="h-3 w-8 rounded-full" style={{ background: 'rgba(229,9,20,0.3)' }} />
                        <div className="h-4 w-3/4 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="h-3 w-1/2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="h-9 w-full rounded-xl mt-3" style={{ background: 'rgba(229,9,20,0.12)' }} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export const TextLoader = () => (
    <div className="flex items-center justify-center gap-2 py-8">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 rounded-full border-2"
            style={{ borderColor: 'rgba(229,9,20,0.2)', borderTopColor: '#E50914' }}
        />
        <span className="text-sm text-white/30">Loading…</span>
    </div>
);
