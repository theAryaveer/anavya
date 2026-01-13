import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PasswordInput } from '../components/PasswordInput';
import { Toast } from '../components/Toast';
import { getUserSession, saveUserSession } from '../lib/api';

export const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setToast({ message: 'Please enter both email and password', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            // Authenticate with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) throw error;

            console.log('✅ Login successful:', data.user?.email);

            // Check if user exists in our backend
            const session = getUserSession();
            if (session.userId) {
                // User already in system
                setToast({ message: 'Welcome back! 🎉', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                // Need to complete profile/genre selection
                setToast({ message: 'Please complete your signup', type: 'error' });
                setTimeout(() => navigate('/signup'), 1500);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setToast({
                message: err.message || 'Invalid email or password',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Left Side - Branding */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-indigo-950 via-slate-900 to-midnight flex-col justify-center items-center p-12 overflow-hidden">
                {/* Animated orbs */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-[128px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px]"
                />

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Sparkles className="w-12 h-12 text-indigo-400 mb-6" />
                        <h1 className="text-6xl font-bold text-slate-50 mb-6 leading-tight">
                            Welcome
                            <br />
                            Back to
                            <br />
                            <span className="text-indigo-400">Anvaya.</span>
                        </h1>
                        <p className="text-xl text-slate-400">
                            Continue your journey of discovering amazing books tailored just for you.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-midnight flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h2 className="text-5xl font-bold text-slate-50 mb-2">Sign In</h2>
                        <p className="text-slate-500">Enter your credentials to access your account</p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <PasswordInput value={password} onChange={setPassword} label="Password" placeholder="Enter your password" />
                        </motion.div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide text-sm hover:shadow-indigo-500/40"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>

                    {/* Footer link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 text-center text-slate-500 text-sm"
                    >
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Sign Up
                        </button>
                    </motion.p>
                </div>
            </div>
        </div>
    );
};
