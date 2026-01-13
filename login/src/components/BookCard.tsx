import { motion } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';
import type { Book } from '../types';
import { logActivity } from '../lib/api';

interface BookCardProps {
    book: Book;
    index?: number;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
    const handleClick = async () => {
        const userId = localStorage.getItem('user_id');
        if (userId && book.book_id) {
            await logActivity({
                user_id: parseInt(userId),
                book_id: book.book_id,
                action: 'clicked'
            });
        }
    };

    const displayRating = typeof book.rating === 'number' ? book.rating : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            onClick={handleClick}
            className="group relative overflow-hidden bg-[#111827] backdrop-blur-xl border border-slate-700/40 hover:border-indigo-500/50 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10"
        >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    {/* Icon */}
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Rating Badge */}
                    {displayRating !== null && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 backdrop-blur-md border border-amber-500/30 rounded-full"
                        >
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={2} />
                            <span className="text-xs font-bold text-amber-300 tracking-wide">
                                {displayRating.toFixed(1)}
                            </span>
                        </motion.div>
                    )}

                    {/* Match Score badge if no rating */}
                    {displayRating === null && typeof book.match_score === 'number' && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 rounded-full"
                        >
                            <span className="text-xs font-bold text-emerald-300 tracking-wide">
                                {Math.round(book.match_score * 100)}%
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-50 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200 font-serif">
                    {book.title}
                </h3>

                {/* Author */}
                <div className="flex items-center gap-2">
                    <div className="h-px w-6 bg-gradient-to-r from-indigo-400/60 to-transparent" />
                    <span className="text-sm font-medium text-slate-400 line-clamp-1">
                        {book.authors || book.author || 'Unknown Author'}
                    </span>
                </div>

                {/* Description */}
                {book.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {book.description}
                    </p>
                )}

                {/* CTA Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg text-sm font-semibold text-white uppercase tracking-wide shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/30"
                >
                    View Details
                </motion.button>
            </div>
        </motion.div>
    );
}
