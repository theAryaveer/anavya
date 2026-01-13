import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';
import { getRecommendations } from '../lib/api';
import type { Book } from '../types';
import BookCard from './BookCard';
import { LoadingShimmer } from './LoadingShimmer';

interface RecommendationGridProps {
    userId: number;
}

export const RecommendationGrid = ({ userId }: RecommendationGridProps) => {
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModelTraining, setIsModelTraining] = useState(false);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        setIsModelTraining(false);

        try {
            const books = await getRecommendations(userId);
            setRecommendations(books.slice(0, 10)); // Top 10 recommendations
        } catch (err: any) {
            // Check for model not ready error
            if (err.message === 'MODEL_NOT_READY') {
                setIsModelTraining(true);
            } else {
                setError(err.message || 'Failed to load recommendations');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchRecommendations();
        }
    }, [userId]);

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-16 bg-gradient-to-b from-transparent to-indigo-950/10">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <Sparkles className="w-8 h-8 text-emerald-400" />
                <h2 className="text-3xl md:text-4xl font-bold text-slate-50">
                    Top Picks for You
                </h2>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 text-lg mb-8"
            >
                Personalized recommendations powered by AI
            </motion.p>

            {/* Model Training State */}
            {isModelTraining && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-300">
                                    AI Model Training...
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    Our recommendation engine is learning your preferences. Check back soon!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shimmer placeholder cards */}
                    <div className="mt-8">
                        <LoadingShimmer count={5} />
                    </div>
                </motion.div>
            )}

            {/* Error State */}
            {error && !isModelTraining && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-red-300 font-semibold mb-2">
                                Unable to Load Recommendations
                            </h3>
                            <p className="text-red-200/80 text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchRecommendations}
                                className="text-sm font-medium text-red-300 hover:text-red-100 underline transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && !isModelTraining && (
                <LoadingShimmer count={10} />
            )}

            {/* Recommendations Grid */}
            {!loading && !error && !isModelTraining && recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {recommendations.map((book, index) => (
                        <BookCard key={`rec-${book.book_id || book.title}-${index}`} book={book} index={index} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && !isModelTraining && recommendations.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-midnight-100/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl"
                >
                    <Sparkles className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No recommendations available yet</p>
                    <p className="text-slate-600 text-sm mt-2">Start searching for books to get personalized picks!</p>
                </motion.div>
            )}
        </section>
    );
};
