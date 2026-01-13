import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getGenres, saveUserSession } from '../lib/api';
import { OtpInput } from '../components/OtpInput';
import { PasswordInput } from '../components/PasswordInput';
import { GenreGrid } from '../components/GenreGrid';
import { Toast } from '../components/Toast';
import type { Genre } from '../types';

type SignupStep = 'email' | 'otp' | 'password' | 'profile' | 'genre';

export const SignupWizard = () => {
    const navigate = useNavigate();

    // Step management
    const [currentStep, setCurrentStep] = useState<SignupStep>('email');
    const steps: SignupStep[] = ['email', 'otp', 'password', 'profile', 'genre'];
    const stepIndex = steps.indexOf(currentStep);

    // Form data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [genreId, setGenreId] = useState<number | null>(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [genresLoading, setGenresLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [otpCountdown, setOtpCountdown] = useState(0);

    // Validation errors
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Fetch genres when reaching genre step
    useEffect(() => {
        if (currentStep === 'genre' && genres.length === 0) {
            fetchGenres();
        }
    }, [currentStep]);

    // OTP countdown timer
    useEffect(() => {
        if (otpCountdown > 0) {
            const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpCountdown]);

    const fetchGenres = async () => {
        try {
            setGenresLoading(true);
            const data = await getGenres();
            console.log('✅ Genres fetched:', data.length, 'genres');
            setGenres(data);
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to load genres', type: 'error' });
        } finally {
            setGenresLoading(false);
        }
    };

    // Step 1: Send OTP to email
    const handleSendOtp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setEmailError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    shouldCreateUser: true,
                },
            });

            if (error) throw error;

            console.log('📧 OTP sent to:', email);
            setToast({ message: `Verification code sent to ${email}`, type: 'success' });
            setOtpCountdown(60);
            setCurrentStep('otp');
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to send verification code', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setToast({ message: 'Please enter the 6-digit code', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: otp,
                type: 'email',
            });

            if (error) throw error;

            console.log('✅ OTP verified successfully');
            setToast({ message: 'Email verified successfully!', type: 'success' });
            setCurrentStep('password');
        } catch (err: any) {
            setToast({ message: 'Invalid or expired code. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Create password
    const handleSetPassword = () => {
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

        setPasswordError(null);
        setCurrentStep('profile');
    };

    // Step 4: Set profile name
    const handleSetProfile = () => {
        if (!name.trim()) {
            setToast({ message: 'Please enter your name', type: 'error' });
            return;
        }
        setCurrentStep('genre');
    };

    // Step 5: Complete signup
    const handleCompleteSignup = async () => {
        if (!genreId) {
            setToast({ message: 'Please select your favorite genre', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            // Debug: Check password type
            console.log("🔍 Checking Password Type:", typeof password, password);

            // Prepare payload with all signup data
            const payload = {
                name: name.trim(),
                email: email.trim(),
                password: password,
                genre_id: Number(genreId), // Convert to number
            };

            console.log('📤 Final Signup Payload:', payload);

            // Send signup request to backend
            const response = await fetch('http://127.0.0.1:8000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Signup failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('🎉 Signup complete:', data);

            // Save session
            saveUserSession(data.user_id, data.name);

            setToast({ message: `Welcome to Anvaya, ${data.name}! 🎉`, type: 'success' });

            // Direct reload-based navigation for proper state sync with ProtectedRoute
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } catch (err: any) {
            console.error('❌ Signup error:', err);
            // Better error message extraction
            let errorMessage = 'Signup failed. Please try again.';
            if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (err?.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            }
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = {
        email: 'Enter your email',
        otp: 'Verify your email',
        password: 'Create a password',
        profile: 'Tell us your name',
        genre: 'Pick your favorite genre',
    };

    const stepDescriptions = {
        email: "We'll send you a verification code",
        otp: `Enter the 6-digit code sent to ${email}`,
        password: "Create a strong password for your account",
        profile: "How should we greet you?",
        genre: "Help us personalize your recommendations",
    };

    return (
        <div className="min-h-screen w-full bg-midnight flex items-center justify-center p-6">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="w-full max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-slate-50 mb-2">Join Anvaya</h1>
                    <p className="text-slate-400">Discover your next favorite book</p>
                </motion.div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {steps.map((step, index) => (
                            <div key={step} className="flex items-center flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${index <= stepIndex
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-700/50 text-slate-500'
                                        }`}
                                >
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded-full transition-all ${index < stepIndex ? 'bg-indigo-500' : 'bg-slate-700/50'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-3">
                        Step {stepIndex + 1} of {steps.length}
                    </p>
                </div>

                {/* Step Content */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-midnight-100/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                >
                    <h2 className="text-2xl font-bold text-slate-50 mb-2">{stepTitles[currentStep]}</h2>
                    <p className="text-slate-400 mb-6">{stepDescriptions[currentStep]}</p>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Email */}
                        {currentStep === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div>
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
                                                setEmailError(null);
                                            }}
                                            placeholder="you@example.com"
                                            className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                                        />
                                    </div>
                                    {emailError && <p className="mt-2 text-sm text-red-400">{emailError}</p>}
                                </div>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-4 rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send Code
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: OTP */}
                        {currentStep === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <OtpInput value={otp} onChange={setOtp} />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep('email')}
                                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={loading || otp.length !== 6}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Code</>}
                                    </button>
                                </div>
                                {otpCountdown > 0 ? (
                                    <p className="text-center text-sm text-slate-500">
                                        Resend code in {otpCountdown}s
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleSendOtp}
                                        className="w-full text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Didn't receive code? Resend
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Password */}
                        {currentStep === 'password' && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <PasswordInput
                                    value={password}
                                    onChange={setPassword}
                                    label="Password"
                                    placeholder="Create a strong password"
                                    showStrengthMeter={true}
                                />
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    label="Confirm Password"
                                    placeholder="Re-enter your password"
                                />
                                {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep('otp')}
                                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSetPassword}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Profile Name */}
                        {currentStep === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-xl px-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep('password')}
                                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSetProfile}
                                        disabled={!name.trim()}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Genre Selection */}
                        {currentStep === 'genre' && (
                            <motion.div
                                key="genre"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <GenreGrid
                                    genres={genres}
                                    selectedGenreId={genreId}
                                    onSelectGenre={setGenreId}
                                    loading={genresLoading}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep('profile')}
                                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft size={18} />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCompleteSignup}
                                        disabled={loading || !genreId}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Complete Signup
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <p className="mt-6 text-center text-slate-500 text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/')}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};
