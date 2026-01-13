import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from '../components/Toast';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Send password reset email
    const handleSendResetEmail = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setEmailError(null);

        try {
            // Send password reset email with redirect to /reset-password
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            console.log('📧 Password reset email sent to:', email);
            setToast({
                message: `Reset link sent to ${email}! Check your inbox and click the link to reset your password.`,
                type: 'success'
            });

            // Optionally navigate back to login after showing success message
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to send reset email', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-midnight flex items-center justify-center p-6">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="w-full max-w-md">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-slate-50 mb-2">Forgot Password</h1>
                    <p className="text-slate-400">We'll send you a link to reset your password</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-midnight-100/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                >
                    <h2 className="text-2xl font-bold text-slate-50 mb-2">Reset your password</h2>
                    <p className="text-slate-400 mb-6">Enter your email to receive a password reset link</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError(null);
                                    }}
                                    placeholder="you@example.com"
                                    className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                                />
                            </div>
                            {emailError && <p className="mt-2 text-sm text-red-400">{emailError}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Back to Login
                            </button>
                            <button
                                onClick={handleSendResetEmail}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
