import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
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
        setLoading(true); setError(null); setIsModelTraining(false);
        try {
            const books = await getRecommendations(userId);
            setRecommendations(books.slice(0, 10)); // Top 10 recommendations
        } catch (err: any) {
            if (err.message === 'MODEL_NOT_READY') setIsModelTraining(true);
            else setError(err.message || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (userId) fetchRecommendations(); }, [userId]);

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8 relative">

            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                     style={{ background: 'linear-gradient(135deg,#E50914,#c1070f)', boxShadow: '0 0 20px rgba(229,9,20,0.45)' }}>
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.5px' }}>Top Picks for You</h2>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Personalised recommendations powered by AI</p>
                </div>
            </div>

            {/* Model Training State */}
            {isModelTraining && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="rounded-2xl p-8 nx-card border-l-4" style={{ borderColor: '#E50914' }}>
                        <div className="flex items-center gap-5">
                            <div className="relative flex-none">
                                <div className="w-14 h-14 rounded-full border-4 animate-spin"
                                     style={{ borderColor: 'rgba(229,9,20,0.2)', borderTopColor: '#E50914' }} />
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6" style={{ color: '#E50914' }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">AI Model Training…</h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    Our recommendation engine is learning your preferences. Check back soon!
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8"><LoadingShimmer count={5} /></div>
                </motion.div>
            )}

            {/* Error State */}
            {error && !isModelTraining && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl p-6 mb-8 nx-card border-l-4" style={{ borderColor: '#ff3b3b' }}>
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#ff3b3b' }} />
                        <div>
                            <h3 className="font-bold text-white mb-1">Unable to Load Recommendations</h3>
                            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{error}</p>
                            <button onClick={fetchRecommendations} className="text-sm font-bold uppercase tracking-widest transition-colors"
                                    style={{ color: '#E50914' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#E50914'}>
                                Try Again
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && !isModelTraining && <LoadingShimmer count={10} />}

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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 nx-card rounded-2xl">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-10 text-white" />
                    <p className="text-lg font-bold text-white mb-1">No recommendations available yet</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Start searching for books to get personalised picks!</p>
                </motion.div>
            )}
        </section>
    );
};
