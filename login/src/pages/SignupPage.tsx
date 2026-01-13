import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { getGenres, signup, saveUserSession } from '../lib/api';
import type { Genre } from '../types';
import { Toast } from '../components/Toast';

export const SignupPage = () => {
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [genreId, setGenreId] = useState<number | null>(null);

    // UI state
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(false);
    const [genresLoading, setGenresLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Validation state
    const [emailError, setEmailError] = useState<string | null>(null);

    // Fetch genres on mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                setGenresLoading(true);
                const data = await getGenres();
                setGenres(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load genres');
            } finally {
                setGenresLoading(false);
            }
        };
        fetchGenres();
    }, []);

    // Email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError(null);
        return true;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!name.trim()) {
            setToast({ message: 'Please enter your name', type: 'error' });
            return;
        }
        if (!validateEmail(email)) {
            return;
        }
        if (!genreId) {
            setToast({ message: 'Please select your favorite genre', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await signup({ name: name.trim(), email: email.trim(), genre_id: genreId });

            // Store session
            saveUserSession(response.user_id, response.name);

            // Show success toast and redirect
            setToast({ message: `Welcome to Anvaya, ${response.name}! 🎉`, type: 'success' });

            // Navigate after short delay for toast visibility
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err: any) {
            setToast({ message: err.message || 'Signup failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Left Side - Branding */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-indigo-950 via-slate-900 to-midnight flex-col justify-center items-center p-12 overflow-hidden">
                {/* Animated orbs */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-[128px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px]"
                />

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Sparkles className="w-12 h-12 text-indigo-400 mb-6" />
                        <h1 className="text-6xl font-bold text-slate-50 mb-6 leading-tight">
                            Join<br />
                            Anvaya<br />
                            <span className="text-indigo-400">Today.</span>
                        </h1>
                        <p className="text-xl text-slate-400">
                            Discover your next favorite book with AI-powered personalized recommendations.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-midnight flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-5xl font-bold text-slate-50 mb-2">
                            Create Account
                        </h2>
                        <p className="text-slate-500">
                            Tell us about your reading preferences
                        </p>
                    </motion.div>

                    {/* Error message for genres */}
                    {error && !genresLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                                />
                            </div>
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) validateEmail(e.target.value);
                                    }}
                                    onBlur={() => validateEmail(email)}
                                    placeholder="you@example.com"
                                    className={`w-full bg-midnight-100/80 border rounded-xl pl-12 pr-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all duration-200 ${emailError
                                        ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30'
                                        : 'border-slate-700/50 focus:border-indigo-500/60 focus:ring-indigo-500/30'
                                        }`}
                                />
                            </div>
                            {emailError && (
                                <p className="mt-2 text-sm text-red-400">{emailError}</p>
                            )}
                        </motion.div>

                        {/* Genre Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Favorite Genre
                            </label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />

                                {genresLoading ? (
                                    <div className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl pl-12 pr-10 py-4 text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                            Loading genres...
                                        </div>
                                    </div>
                                ) : (
                                    <select
                                        value={genreId || ''}
                                        onChange={(e) => setGenreId(Number(e.target.value))}
                                        className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl pl-12 pr-10 py-4 text-slate-50 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-midnight-100 text-slate-500">
                                            Select your favorite genre
                                        </option>
                                        {Array.isArray(genres) && genres.map((genre) => (
                                            <option
                                                key={genre.id}
                                                value={genre.id}
                                                className="bg-midnight-100 text-slate-50"
                                            >
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading || genresLoading}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide text-sm hover:shadow-indigo-500/40"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center text-slate-500 text-sm"
                    >
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/')}
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Sign In
                        </button>
                    </motion.p>
                </div>
            </div>
        </div>
    );
};
