import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star } from 'lucide-react';
import type { Book } from '../types';
import { logActivity } from '../lib/api';

interface BookCardProps {
    book: Book;
    index?: number;
}

function getCoverUrl(title: string): string {
    const encoded = encodeURIComponent(title);
    return `https://covers.openlibrary.org/b/title/${encoded}-M.jpg`;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
    const [imgError, setImgError] = useState(false);

    const handleClick = async () => {
        const userId = localStorage.getItem('user_id');
        if (userId && book.book_id) {
            await logActivity({ user_id: parseInt(userId), book_id: book.book_id, action: 'clicked' });
        }
    };

    const displayRating = typeof book.rating === 'number' ? book.rating : null;
    const coverUrl = getCoverUrl(book.title);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.04, y: -4, transition: { duration: 0.2 } }}
            onClick={handleClick}
            className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300"
            style={{
                background: 'rgba(20,20,20,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
        >
            {/* Hover red glow overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                 style={{ boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.4), 0 0 32px rgba(229,9,20,0.15)' }} />

            {/* Book Cover */}
            <div className="relative w-full h-56 overflow-hidden"
                 style={{ background: 'linear-gradient(135deg,#1F1F1F,#0A0A0A)' }}>
                {!imgError ? (
                    <img
                        src={coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <BookOpen className="w-12 h-12 opacity-20" style={{ color: '#E50914' }} strokeWidth={1.5} />
                        <span className="text-xs text-white/20 font-medium tracking-widest uppercase">No Cover</span>
                    </div>
                )}

                {/* Gradient scrim at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16"
                     style={{ background: 'linear-gradient(to top, rgba(20,20,20,1), transparent)' }} />

                {/* Rating badge */}
                {displayRating !== null && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(232,184,75,0.4)', backdropFilter: 'blur(8px)' }}
                    >
                        <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#E8B84B' }} strokeWidth={0} />
                        <span className="text-xs font-bold tracking-wide" style={{ color: '#E8B84B' }}>
                            {displayRating.toFixed(1)}
                        </span>
                    </motion.div>
                )}

                {/* Match score badge */}
                {displayRating === null && typeof book.match_score === 'number' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(229,9,20,0.4)', backdropFilter: 'blur(8px)' }}
                    >
                        <span className="text-xs font-bold tracking-wide" style={{ color: '#E50914' }}>
                            {Math.round(book.match_score * 100)}% match
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 space-y-3">
                {/* Red accent line */}
                <div className="h-[2px] w-8 rounded-full" style={{ background: 'linear-gradient(90deg,#E50914,transparent)' }} />

                <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-white transition-colors font-serif">
                    {book.title}
                </h3>

                <p className="text-sm text-white/45 line-clamp-1">
                    {book.authors || book.author || 'Unknown Author'}
                </p>

                {book.description && (
                    <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">{book.description}</p>
                )}

                {/* CTA */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); handleClick(); }}
                    className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-white uppercase tracking-widest transition-all duration-200"
                    style={{
                        background: 'linear-gradient(135deg,#E50914,#c1070f)',
                        boxShadow: '0 4px 16px rgba(229,9,20,0.3)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(229,9,20,0.55)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(229,9,20,0.3)')}
                >
                    View Details
                </motion.button>
            </div>
        </motion.div>
    );
}
