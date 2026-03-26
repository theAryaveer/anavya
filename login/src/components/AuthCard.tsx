import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    Mail, ArrowRight, Eye, EyeOff, Ghost,
    User, GraduationCap, ArrowLeft, CheckCircle2, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Dashboard } from './Dashboard';
import { Toast } from './Toast';

// --- Animation Variants ---
const formVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
        filter: "blur(4px)",
    }),
    center: {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.25,
        },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 50 : -50,
        opacity: 0,
        filter: "blur(4px)",
        transition: { duration: 0.2 },
    }),
};

export const AuthCard = () => {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [profile, setProfile] = useState({ name: '', graduationYear: '', role: 'Student', ghostMode: false });
    const [countdown, setCountdown] = useState(60);

    // Monitor Session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Navigation Logic
    const paginate = (newStep: number) => {
        setDirection(newStep > step ? 1 : -1);
        setStep(newStep);
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSendOTP = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email: email,
        });

        setLoading(false);

        if (error) {
            showToast(error.message || 'Failed to send OTP', 'error');
        } else {
            paginate(2);
            setCountdown(60);
            showToast('Check your email! OTP sent successfully.', 'success');
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        const token = otp.join('');
        try {
            const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
            if (error) throw error;
            paginate(3);
            showToast('OTP verified successfully!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Invalid OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = () => {
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        paginate(4);
    };

    const handleComplete = () => {
        showToast('Profile completed successfully!', 'success');
        console.log("Onboarding Complete", profile);
    };

    // Timer Effect
    useEffect(() => {
        let timer: any;
        if (step === 2 && countdown > 0) {
            timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    if (session && step < 3) {
        return <Dashboard />;
    }

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

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
                            <span className="text-2xl font-black tracking-tight" style={{ color: '#E50914' }}>ANAVYA</span>
                        </div>
                        <h1 className="text-6xl font-black text-white mb-6 leading-tight" style={{ letterSpacing: '-2px' }}>
                            Discover.<br />
                            <span style={{ color: '#E50914' }}>Explore.</span><br />
                            Read.
                        </h1>
                        <div className="h-1 w-16 rounded-full mb-6" style={{ background: 'linear-gradient(90deg,#E50914,transparent)' }} />
                        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Your AI-powered book platform. Find your next favourite read with personalised suggestions.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12" style={{ background: '#0A0A0A' }}>
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8">
                        {step > 1 && (
                            <button
                                onClick={() => paginate(step - 1)}
                                className="mb-4 p-2 rounded-xl inline-flex items-center gap-2 transition-all duration-200"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                            >
                                <ArrowLeft size={18} />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                        )}
                        <motion.h2
                            key={step}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-white mb-2"
                            style={{ letterSpacing: '-1.5px' }}
                        >
                            {step === 1 ? 'Welcome' : step === 2 ? 'Verify OTP' : step === 3 ? 'Secure Account' : 'Your Profile'}
                        </motion.h2>
                        <p style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {step === 1 ? 'Sign in to discover amazing books' : step === 2 ? 'Enter the code we sent' : step === 3 ? 'Create a strong password' : 'Tell us about yourself'}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="relative">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            {/* Step 1: Email */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    custom={direction}
                                    variants={formVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                        <input
                                            type="email"
                                            className="w-full rounded-2xl border pl-12 pr-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none transition-all duration-200 nx-input text-lg"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <motion.button
                                        onClick={handleSendOTP}
                                        disabled={!email || loading}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm nx-btn-primary"
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                            />
                                        ) : (
                                            <>
                                                Send OTP
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </motion.button>

                                    {/* New user signup link */}
                                    <p className="text-center text-slate-500 text-sm mt-4">
                                        New user?{' '}
                                        <a
                                            href="/signup"
                                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                        >
                                            Sign up with genre preference
                                        </a>
                                    </p>
                                </motion.div>
                            )}

                            {/* Step 2: OTP */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    custom={direction}
                                    variants={formVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <p className="text-slate-500">
                                            Code sent to <span className="text-slate-50 font-medium">{email}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                maxLength={1}
                                                className="w-14 h-16 text-center text-2xl font-bold rounded-2xl border text-slate-50 focus:outline-none transition-all duration-200 nx-input"
                                                value={digit}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const newOtp = [...otp];
                                                    newOtp[i] = e.target.value;
                                                    setOtp(newOtp);
                                                    if (e.target.value && i < 5) {
                                                        const parent = e.currentTarget.parentElement;
                                                        const next = parent?.children[i + 1] as HTMLInputElement | undefined;
                                                        next?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                                                        const parent = e.currentTarget.parentElement;
                                                        const prev = parent?.children[i - 1] as HTMLInputElement | undefined;
                                                        prev?.focus();
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Expires in 00:{countdown.toString().padStart(2, '0')}</span>
                                        <button
                                            className={`font-medium ${countdown === 0 ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-700 cursor-not-allowed'} transition-colors duration-200`}
                                            disabled={countdown > 0}
                                            onClick={(e) => {
                                                setCountdown(60);
                                                handleSendOTP(e);
                                            }}
                                        >
                                            Resend Code
                                        </button>
                                    </div>

                                    <motion.button
                                        onClick={handleVerifyOTP}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading}
                                        className="w-full text-white font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm nx-btn-primary"
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                            />
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Step 3: Password */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    custom={direction}
                                    variants={formVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full rounded-2xl border px-4 py-4 pr-12 text-slate-50 placeholder-slate-500 focus:outline-none transition-all duration-200 nx-input text-lg"
                                            placeholder="Create Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-50 transition-colors duration-200"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full rounded-2xl border px-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none transition-all duration-200 nx-input text-lg"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>

                                    <motion.button
                                        onClick={handleSetPassword}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full text-white font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm nx-btn-primary"
                                    >
                                        Continue
                                        <ArrowRight size={18} />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Step 4: Profile */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    custom={direction}
                                    variants={formVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="flex justify-center mb-6">
                                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-indigo-500/30">
                                            <User size={40} className="text-indigo-400" />
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-2xl px-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none transition-all duration-200 nx-input text-lg"
                                        placeholder="Full Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />

                                    <input
                                        type="text"
                                        className="w-full bg-midnight-100/80 border border-slate-700/50 rounded-2xl px-4 py-4 text-slate-50 placeholder-slate-500 focus:outline-none transition-all duration-200 nx-input text-lg"
                                        placeholder="Graduation Year"
                                        value={profile.graduationYear}
                                        onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        {['Student', 'Alumni'].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setProfile({ ...profile, role })}
                                                className={`py-4 rounded-2xl border flex items-center justify-center gap-2 transition-all duration-200 ${profile.role === role
                                                    ? 'bg-indigo-600/20 border-indigo-500 text-slate-50'
                                                    : 'bg-midnight-100/80 border-slate-700/50 text-slate-500 hover:bg-midnight-50 hover:text-slate-50'
                                                    }`}
                                            >
                                                {role === 'Student' ? <GraduationCap size={18} /> : <CheckCircle2 size={18} />}
                                                {role}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-midnight-100/80 rounded-2xl border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                                <Ghost size={20} />
                                            </div>
                                            <span className="text-slate-50 font-medium">Ghost Mode</span>
                                        </div>
                                        <button
                                            onClick={() => setProfile({ ...profile, ghostMode: !profile.ghostMode })}
                                            className={`w-14 h-8 rounded-full transition-colors duration-200 relative ${profile.ghostMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-200 ${profile.ghostMode ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <motion.button
                                        onClick={handleComplete}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full text-white font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest text-sm nx-btn-primary"
                                    >
                                        Complete Profile
                                        <ArrowRight size={18} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
