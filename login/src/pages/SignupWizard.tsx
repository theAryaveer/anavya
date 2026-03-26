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

    useEffect(() => {
        if (currentStep === 'genre' && genres.length === 0) { fetchGenres(); }
    }, [currentStep]);

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
        if (!email || !emailRegex.test(email)) { setEmailError('Please enter a valid email address'); return; }

        setLoading(true); setEmailError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
            if (error) throw error;
            setToast({ message: `Verification code sent to ${email}`, type: 'success' });
            setOtpCountdown(60); setCurrentStep('otp');
        } catch (err: any) {
            const message = err.message || '';
            if (err.status === 429 || message.includes('rate') || message.includes('too many')) {
                setToast({ message: 'Too many requests. Please wait.', type: 'error' });
            } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
                setToast({ message: 'Cannot connect to auth server.', type: 'error' });
            } else {
                setToast({ message: message || 'Failed to send verification code', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) { setToast({ message: 'Please enter the 6-digit code', type: 'error' }); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp, type: 'email' });
            if (error) throw error;
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
        if (password.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }
        if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            setPasswordError('Password must contain uppercase, lowercase, number, and special character'); return;
        }

        setPasswordError(null); setCurrentStep('profile');
    };

    // Step 4: Set profile name
    const handleSetProfile = () => {
        if (!name.trim()) { setToast({ message: 'Please enter your name', type: 'error' }); return; }
        setCurrentStep('genre');
    };

    // Step 5: Complete signup
    const handleCompleteSignup = async () => {
        if (!genreId) { setToast({ message: 'Please select your favourite genre', type: 'error' }); return; }
        setLoading(true);
        try {
            const payload = { name: name.trim(), email: email.trim(), password: password, genre_id: Number(genreId) };
            const response = await fetch('http://127.0.0.1:8000/signup', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Signup failed with status ${response.status}`);
            }

            const data = await response.json();
            saveUserSession(data.user_id, data.name);
            setToast({ message: `Welcome to Anavya, ${data.name}! 🎉`, type: 'success' });

            setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
        } catch (err: any) {
            console.error('❌ Signup error:', err);
            let errorMessage = 'Signup failed. Please try again.';
            if (typeof err === 'string') { errorMessage = err; }
            else if (err?.message) { errorMessage = err.message; }
            else if (err?.response?.data?.detail) { errorMessage = err.response.data.detail; }
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
        genre: 'Pick your favourite genre',
    };

    const stepDescriptions = {
        email: "We'll send you a verification code",
        otp: `Enter the 6-digit code sent to ${email}`,
        password: "Create a strong password for your account",
        profile: "How should we greet you?",
        genre: "Help us personalise your recommendations",
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg,#0A0A0A 0%,#141414 100%)' }}>
            {/* Animated red orbs */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px] pointer-events-none" style={{ background: 'rgba(229,9,20,0.3)' }} />
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[128px] pointer-events-none" style={{ background: 'rgba(232,184,75,0.25)' }} />

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex justify-center items-center gap-3 mb-6 p-2.5 rounded-2xl mx-auto"
                         style={{ background: 'linear-gradient(135deg,#E50914,#c1070f)', boxShadow: '0 0 24px rgba(229,9,20,0.5)' }}>
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-2" style={{ letterSpacing: '-1.5px' }}>Join Anavya</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Discover your next favourite book</p>
                </motion.div>

                {/* Progress Indicator */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-3 px-4">
                        {steps.map((step, index) => {
                            const isActive = index <= stepIndex;
                            const isCurrent = index === stepIndex;
                            return (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${isActive ? 'text-white shadow-lg shadow-red-500/30' : 'text-white/20'}`}
                                         style={{ background: isActive ? 'linear-gradient(135deg,#E50914,#c1070f)' : 'rgba(255,255,255,0.05)',
                                                  transform: isCurrent ? 'scale(1.15)' : 'scale(1)' }}>
                                        {index + 1}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-1 mx-3 rounded-full transition-all duration-500"
                                             style={{ background: index < stepIndex ? '#E50914' : 'rgba(255,255,255,0.1)' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-center text-sm font-semibold uppercase tracking-widest mt-6" style={{ color: '#E50914' }}>
                        Step {stepIndex + 1} of {steps.length}
                    </p>
                </div>

                {/* Step Content */}
                <motion.div
                    key={currentStep} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="p-8 sm:p-10 rounded-2xl shadow-2xl nx-card"
                >
                    <h2 className="text-3xl font-black text-white mb-2">{stepTitles[currentStep]}</h2>
                    <p className="mb-8 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{stepDescriptions[currentStep]}</p>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Email */}
                        {currentStep === 'email' && (
                            <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                                            placeholder="you@example.com" className="nx-input pl-12"
                                        />
                                    </div>
                                    {emailError && <p className="mt-2 text-sm text-netflix-red">{emailError}</p>}
                                </div>
                                <button onClick={handleSendOtp} disabled={loading} className="nx-btn-primary flex items-center justify-center gap-2 mt-6">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles size={18} /> Send Code <ArrowRight size={18} /></>}
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: OTP */}
                        {currentStep === 'otp' && (
                            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <OtpInput value={otp} onChange={setOtp} />
                                <div className="flex gap-4">
                                    <button onClick={() => setCurrentStep('email')} className="nx-btn-secondary px-6 flex-none max-w-fit inline-flex gap-2">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="nx-btn-primary flex-1 inline-flex gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Code <ArrowRight size={18} /></>}
                                    </button>
                                </div>
                                {otpCountdown > 0 ? (
                                    <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Resend code in <span className="font-bold text-white">{otpCountdown}s</span></p>
                                ) : (
                                    <button onClick={handleSendOtp} className="w-full text-sm font-bold transition-colors" style={{ color: '#E50914' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#E50914')}>
                                        Didn't receive code? Resend
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Password */}
                        {currentStep === 'password' && (
                            <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <PasswordInput value={password} onChange={setPassword} label="Password" placeholder="Create a strong password" showStrengthMeter={true} />
                                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} label="Confirm Password" placeholder="Re-enter your password" />
                                {passwordError && <p className="text-sm font-medium text-netflix-red">{passwordError}</p>}
                                <div className="flex gap-4">
                                    <button onClick={() => setCurrentStep('otp')} className="nx-btn-secondary px-6 flex-none max-w-fit inline-flex gap-2">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={handleSetPassword} className="nx-btn-primary flex-1 inline-flex gap-2">
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Profile Name */}
                        {currentStep === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Full Name</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="nx-input" />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setCurrentStep('password')} className="nx-btn-secondary px-6 flex-none max-w-fit inline-flex gap-2">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={handleSetProfile} disabled={!name.trim()} className="nx-btn-primary flex-1 inline-flex gap-2">
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Genre Selection */}
                        {currentStep === 'genre' && (
                            <motion.div key="genre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <GenreGrid genres={genres} selectedGenreId={genreId} onSelectGenre={setGenreId} loading={genresLoading} />
                                <div className="flex gap-4">
                                    <button onClick={() => setCurrentStep('profile')} className="nx-btn-secondary px-6 flex-none max-w-fit inline-flex gap-2">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={handleCompleteSignup} disabled={loading || !genreId} className="nx-btn-primary flex-1 inline-flex gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Signup <Sparkles size={18} /></>}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Already have an account?{' '}
                    <button onClick={() => navigate('/')} className="font-bold transition-colors ml-1" style={{ color: '#E50914' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#E50914')}>
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};
