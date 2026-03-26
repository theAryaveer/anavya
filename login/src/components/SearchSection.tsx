import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';
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
        if (!query.trim()) { setError('Please enter a search query'); return; }
        setLoading(true); setError(null); setHasSearched(true);
        try {
            const books = await searchBooks(query);
            setResults(books);
            if (books.length === 0) setError('No books found. Try a different search term.');
        } catch (err: any) {
            setError(err.message || 'Failed to search books');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => { setQuery(''); setResults([]); setError(null); setHasSearched(false); };

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-16">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-14"
            >
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-white/10"
                     style={{ background: 'rgba(229,9,20,0.08)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#E50914' }} />
                    <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#E50914' }}>
                        AI-Powered Search
                    </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight" style={{ letterSpacing: '-1px' }}>
                    Discover Your<br />
                    <span style={{ color: '#E50914' }}>Next Read</span>
                </h2>
                <p className="text-lg text-white/40 max-w-xl mx-auto">
                    Search through thousands of books instantly with semantic AI search
                </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-3xl mx-auto mb-14"
            >
                <div className="relative flex items-center rounded-2xl overflow-hidden"
                     style={{
                         background: 'rgba(31,31,31,0.9)',
                         border: '1px solid rgba(255,255,255,0.1)',
                         boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                     }}>
                    <SearchIcon className="absolute left-6 w-5 h-5 text-white/30 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books, authors, genres…"
                        className="flex-1 bg-transparent pl-14 pr-4 py-5 text-white placeholder-white/25 text-base focus:outline-none"
                    />
                    {query && (
                        <button type="button" onClick={clearSearch}
                            className="p-2 mr-2 text-white/30 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="m-2 px-8 py-3.5 rounded-xl text-white font-bold uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg,#E50914,#c1070f)', boxShadow: '0 4px 16px rgba(229,9,20,0.4)' }}
                    >
                        Search
                    </button>
                </div>
            </motion.form>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <div className="max-w-3xl mx-auto mb-8">
                        <ErrorAlert message={error} onRetry={handleSearch} onDismiss={() => setError(null)} />
                    </div>
                )}
            </AnimatePresence>

            {/* Results */}
            {loading ? (
                <LoadingShimmer count={8} />
            ) : results.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="mb-6 text-sm text-white/30">
                        Found <span className="text-white font-bold">{results.length}</span> results for
                        {' '}<span style={{ color: '#E50914' }}>"{query}"</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((book, index) => (
                            <BookCard key={`${book.title}-${index}`} book={book} index={index} />
                        ))}
                    </div>
                </motion.div>
            ) : hasSearched && !error ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                    <SearchIcon className="w-14 h-14 mx-auto mb-4 opacity-10" />
                    <p className="text-white/30 text-lg">No results found</p>
                </motion.div>
            ) : null}
        </section>
    );
};
