import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import type { Genre } from '../types';

interface GenreGridProps {
    genres: Genre[];
    selectedGenreId: number | null;
    onSelectGenre: (genreId: number) => void;
    loading?: boolean;
}

// Curated Netflix-style moody gradients for genres
const genreColors: { [key: string]: string } = {
    Fiction: 'linear-gradient(135deg, #2A0845, #6441A5)',
    'Non-Fiction': 'linear-gradient(135deg, #141E30, #243B55)',
    Fantasy: 'linear-gradient(135deg, #4B1248, #F0C27B)',
    'Science Fiction': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    Mystery: 'linear-gradient(135deg, #000000, #434343)',
    Thriller: 'linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)',
    Romance: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
    Horror: 'linear-gradient(135deg, #000000, #53346D)',
    Biography: 'linear-gradient(135deg, #e65c00, #F9D423)',
    History: 'linear-gradient(135deg, #603813, #b29f94)',
    'Self-Help': 'linear-gradient(135deg, #11998e, #38ef7d)',
    Poetry: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    'Young Adult': 'linear-gradient(135deg, #43e97b, #38f9d7)',
    Children: 'linear-gradient(135deg, #fceabb, #f8b500)',
    Comics: 'linear-gradient(135deg, #ff0844, #ffb199)',
    Philosophy: 'linear-gradient(135deg, #b224ef, #7579ff)',
    Religion: 'linear-gradient(135deg, #283c86, #45a247)',
    Travel: 'linear-gradient(135deg, #02aab0, #00cdac)',
    Cooking: 'linear-gradient(135deg, #ff512f, #dd2476)',
    Art: 'linear-gradient(135deg, #ec008c, #fc6767)',
};

export const GenreGrid = ({ genres, selectedGenreId, onSelectGenre, loading }: GenreGridProps) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: '#E50914' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading genres…</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genres.map((genre, index) => {
                const isSelected = selectedGenreId === genre.id;
                const background = genreColors[genre.name] || 'linear-gradient(135deg, #1F1F1F, #0A0A0A)';

                return (
                    <motion.button
                        key={genre.id}
                        type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectGenre(genre.id)}
                        className="relative h-28 rounded-xl overflow-hidden transition-all duration-200"
                        style={{
                            background,
                            boxShadow: isSelected ? '0 0 0 3px #E50914, 0 8px 32px rgba(229,9,20,0.4)' : '0 4px 16px rgba(0,0,0,0.5)',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                    >
                        {/* Film grain / darkening overlay */}
                        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />

                        {/* Genre Name */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <span className="text-white font-bold text-base sm:text-lg text-center leading-tight drop-shadow-lg">
                                {genre.name}
                            </span>
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                style={{ background: '#E50914' }}
                            >
                                <Check size={14} className="text-white" strokeWidth={3} />
                            </motion.div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 transition-colors duration-200"
                             style={{ background: 'transparent' }}
                             onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                             onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        />
                    </motion.button>
                );
            })}
        </div>
    );
};
