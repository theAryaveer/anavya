import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchBooks } from '../lib/api';
import type { Book } from '../types';
import BookCard from './BookCard';
import { LoadingShimmer } from './LoadingShimmer';
import { ErrorAlert } from './ErrorAlert';

export const SearchSection = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!query.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const books = await searchBooks(query);
            setResults(books);

            if (books.length === 0) {
                setError('No books found. Try a different search term.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to search books');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setError(null);
        setHasSearched(false);
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            {/* Search Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
                    Discover Your Next Read
                </h2>
                <p className="text-xl text-slate-400">
                    Search through thousands of books to find your perfect match
                </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-3xl mx-auto mb-12"
            >
                <div className="relative">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for books, authors, or genres..."
                        className="w-full bg-midnight-100/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl pl-16 pr-32 py-5 text-slate-50 placeholder-slate-500 text-lg focus:outline-none focus:border-indigo-500/60 focus:bg-midnight-100 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-28 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-50 transition-colors duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold uppercase tracking-wide text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                    >
                        Search
                    </button>
                </div>
            </motion.form>

            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <div className="max-w-3xl mx-auto mb-8">
                        <ErrorAlert
                            message={error}
                            onRetry={handleSearch}
                            onDismiss={() => setError(null)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Results */}
            {loading ? (
                <LoadingShimmer count={8} />
            ) : results.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="mb-6 text-slate-500 text-sm">
                        Found <span className="text-slate-50 font-semibold">{results.length}</span> results for "{query}"
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((book, index) => (
                            <BookCard key={`${book.title}-${index}`} book={book} index={index} />
                        ))}
                    </div>
                </motion.div>
            ) : hasSearched && !error ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <SearchIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No results found</p>
                </motion.div>
            ) : null}
        </section>
    );
};
