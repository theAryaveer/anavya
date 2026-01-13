import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { SearchSection } from '../components/SearchSection';
import { RecommendationGrid } from '../components/RecommendationGrid';

interface MainPageProps {
    userEmail?: string;
    userId: number;
    userName?: string;
}

export const MainPage = ({ userEmail, userId, userName }: MainPageProps) => {
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="min-h-screen w-full bg-midnight">
            {/* Navbar */}
            <Navbar
                userEmail={userEmail}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
            />

            {/* Main Content */}
            <main className="relative overflow-hidden">
                {/* Animated Background Orbs - Midnight Indigo theme, minimal for performance */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-[128px] animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/6 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

                {/* Hero Section with Welcome Message */}
                <section className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {/* Welcome message if user is logged in */}
                        {userName && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-indigo-400 mb-4"
                            >
                                Welcome back, <span className="font-semibold">{userName}</span> 👋
                            </motion.p>
                        )}

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-50 mb-6 leading-tight">
                            Your Personal
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400">
                                Book Discovery
                            </span>
                            Platform
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
                            Powered by AI-driven recommendations to find your next favorite read
                        </p>
                    </motion.div>
                </section>

                {/* Search Section */}
                <div className="relative z-10">
                    <SearchSection />
                </div>

                {/* Divider */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 my-12">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
                </div>

                {/* Recommendations Section */}
                <div className="relative z-10">
                    <RecommendationGrid userId={userId} />
                </div>

                {/* Footer */}
                <footer className="relative z-10 max-w-7xl mx-auto px-4 py-12 text-center text-slate-600 text-sm">
                    <p>
                        © 2026 Anvaya. Powered by FastAPI & React.
                    </p>
                </footer>
            </main>
        </div>
    );
};
