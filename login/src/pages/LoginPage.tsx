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

            {/* Left Side - Animated Background */}
            <div className="hidden lg:flex relative flex-col justify-center items-center p-12 overflow-hidden"
                 style={{ background: 'linear-gradient(135deg,#0A0A0A 0%,#141414 100%)' }}>
                {/* Animated red orbs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px]"
                    style={{ background: 'rgba(229,9,20,0.3)' }}
                />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[128px]"
                    style={{ background: 'rgba(232,184,75,0.25)' }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#E50914,#c1070f)', boxShadow: '0 0 24px rgba(229,9,20,0.5)' }}>
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight" style={{ color: '#E50914' }}>ANAVYA</span>
                        </div>
                        <h1 className="text-6xl font-black text-white mb-6 leading-tight" style={{ letterSpacing: '-2px' }}>
                            Welcome<br />
                            Back to<br />
                            <span style={{ color: '#E50914' }}>Anavya.</span>
                        </h1>
                        <div className="h-1 w-16 rounded-full mb-6" style={{ background: 'linear-gradient(90deg,#E50914,transparent)' }} />
                        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Continue your journey of discovering amazing books tailored just for you.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-6 lg:p-12" style={{ background: '#0A0A0A' }}>
                <div className="w-full max-w-md">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                        <h2 className="text-5xl font-black text-white mb-2" style={{ letterSpacing: '-1.5px' }}>Sign In</h2>
                        <p style={{ color: 'rgba(255,255,255,0.35)' }}>Enter your credentials to access your account</p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="nx-input pl-12"
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
                            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
                            <PasswordInput value={password} onChange={setPassword} label="" placeholder="Enter your password" />
                        </motion.div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-medium transition-colors"
                                style={{ color: '#E50914' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#E50914')}
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
                            className="nx-btn-primary flex justify-center items-center mt-6"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
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
                        className="mt-8 text-center text-sm"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="font-bold transition-colors ml-1"
                            style={{ color: '#E50914' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#E50914')}
                        >
                            Sign Up
                        </button>
                    </motion.p>
                </div>
            </div>
        </div>
    );
};
