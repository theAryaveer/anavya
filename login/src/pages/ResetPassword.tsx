import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PasswordInput } from '../components/PasswordInput';
import { Toast } from '../components/Toast';

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [sessionReady, setSessionReady] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const navigate = useNavigate();

    // Listen for Supabase auth state changes to detect PASSWORD_RECOVERY event
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('🔐 Auth event:', event, session ? 'Session exists' : 'No session');

                if (event === 'PASSWORD_RECOVERY') {
                    console.log('✅ Password recovery session detected');
                    setSessionReady(true);
                    setCheckingSession(false);
                } else if (event === 'SIGNED_IN' && session) {
                    // Also handle SIGNED_IN with an active session (some Supabase versions)
                    console.log('✅ Signed in session detected');
                    setSessionReady(true);
                    setCheckingSession(false);
                }
            }
        );

        // Also check if there's already an active session (page might have loaded with tokens already processed)
        const checkExistingSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log('✅ Existing session found');
                setSessionReady(true);
                setCheckingSession(false);
            } else {
                // Give Supabase a few seconds to process the URL hash tokens
                setTimeout(() => {
                    setCheckingSession(false);
                }, 3000);
            }
        };

        checkExistingSession();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleUpdatePassword = async () => {
        // Check session before attempting update
        if (!sessionReady) {
            setToast({ message: 'Auth session missing! Please use the reset link from your email.', type: 'error' });
            return;
        }

        // Validation
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        // Check password strength
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            setPasswordError('Password must contain uppercase, lowercase, number, and special character');
            return;
        }

        setLoading(true);
        setPasswordError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            console.log('✅ Password updated successfully');
            setToast({ message: 'Password updated! You can now login with your new password.', type: 'success' });

            // Sign out after password update so they login fresh
            await supabase.auth.signOut();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            console.error('❌ Password update error:', err);
            setToast({ message: err.message || 'Failed to update password', type: 'error' });
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
                    <h1 className="text-4xl font-bold text-slate-50 mb-2">Set New Password</h1>
                    <p className="text-slate-400">Choose a strong password for your account</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-midnight-100/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                >
                    {checkingSession ? (
                        /* Loading state while checking for auth session */
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                            <p className="text-slate-400 text-center">Verifying your reset link...</p>
                        </div>
                    ) : !sessionReady ? (
                        /* No session found - show error */
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <AlertTriangle className="w-12 h-12 text-amber-400" />
                            <h3 className="text-xl font-semibold text-slate-50">Session Expired or Invalid</h3>
                            <p className="text-slate-400 text-center text-sm leading-relaxed">
                                The password reset link is missing or has expired.<br />
                                Please request a new reset link from the Forgot Password page.
                            </p>
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-8 rounded-xl transition-all"
                            >
                                Request New Link
                            </button>
                        </div>
                    ) : (
                        /* Session ready - show password form */
                        <div className="space-y-6">
                            {/* New Password */}
                            <PasswordInput
                                value={password}
                                onChange={setPassword}
                                label="New Password"
                                placeholder="Create a strong password"
                                showStrengthMeter={true}
                            />

                            {/* Confirm Password */}
                            <PasswordInput
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                label="Confirm Password"
                                placeholder="Re-enter your password"
                            />

                            {/* Error Message */}
                            {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}

                            {/* Update Button */}
                            <button
                                onClick={handleUpdatePassword}
                                disabled={loading || password.length < 8 || !confirmPassword}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Footer */}
                <p className="mt-6 text-center text-slate-500 text-sm">
                    Remember your password?{' '}
                    <button
                        onClick={() => navigate('/')}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Back to Login
                    </button>
                </p>
            </div>
        </div>
    );
};
