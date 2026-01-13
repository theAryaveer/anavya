import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PasswordInput } from '../components/PasswordInput';
import { Toast } from '../components/Toast';

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleUpdatePassword = async () => {
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
