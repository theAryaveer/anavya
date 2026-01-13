import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import type { Genre } from '../types';

interface GenreGridProps {
    genres: Genre[];
    selectedGenreId: number | null;
    onSelectGenre: (genreId: number) => void;
    loading?: boolean;
}

// Genre color gradients (Spotify-style)
const genreColors: { [key: string]: string } = {
    Fiction: 'from-purple-600 to-purple-800',
    'Non-Fiction': 'from-blue-600 to-blue-800',
    Fantasy: 'from-pink-600 to-purple-700',
    'Science Fiction': 'from-cyan-600 to-blue-700',
    Mystery: 'from-slate-700 to-slate-900',
    Thriller: 'from-red-700 to-red-900',
    Romance: 'from-rose-500 to-pink-700',
    Horror: 'from-gray-800 to-black',
    Biography: 'from-amber-600 to-orange-700',
    History: 'from-yellow-700 to-amber-800',
    'Self-Help': 'from-emerald-600 to-green-700',
    Poetry: 'from-indigo-500 to-purple-600',
    'Young Adult': 'from-teal-600 to-cyan-700',
    Children: 'from-yellow-500 to-orange-600',
    Comics: 'from-red-500 to-pink-600',
    Philosophy: 'from-violet-700 to-purple-800',
    Religion: 'from-blue-700 to-indigo-800',
    Travel: 'from-green-600 to-teal-700',
    Cooking: 'from-orange-600 to-red-600',
    Art: 'from-fuchsia-600 to-pink-700',
};

export const GenreGrid = ({ genres, selectedGenreId, onSelectGenre, loading }: GenreGridProps) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-slate-400">Loading genres...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {genres.map((genre, index) => {
                const isSelected = selectedGenreId === genre.id;
                const gradientClass = genreColors[genre.name] || 'from-gray-600 to-gray-800';

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
                        className={`relative h-28 rounded-xl bg-gradient-to-br ${gradientClass} overflow-hidden transition-all duration-200 ${isSelected
                            ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                            : 'hover:shadow-lg'
                            }`}
                    >
                        {/* Genre Name */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <span className="text-white font-bold text-base sm:text-lg text-center leading-tight">
                                {genre.name}
                            </span>
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Check size={16} className="text-indigo-600" />
                            </motion.div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-200" />
                    </motion.button>
                );
            })}
        </div>
    );
};
