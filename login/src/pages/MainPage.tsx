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
        <div className="min-h-screen w-full relative" style={{ background: '#0A0A0A' }}>
            {/* Global background glow */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                     background: 'radial-gradient(circle at 50% 0%, rgba(229,9,20,0.08) 0%, transparent 60%)'
                 }}
            />

            {/* Navbar */}
            <Navbar
                userEmail={userEmail}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
            />

            {/* Main Content */}
            <main className="relative z-10 overflow-hidden">
                {/* Hero Section with Welcome Message */}
                <section className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
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
                                className="text-lg mb-6 font-medium tracking-wide"
                                style={{ color: '#E50914' }}
                            >
                                Welcome back, <span className="font-bold text-white">{userName}</span>
                            </motion.p>
                        )}

                        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tighter">
                            Your Personal <br />
                            <span style={{ color: '#E50914' }}>
                                Book Discovery
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Powered by AI-driven recommendations to find your next favourite read
                        </p>
                    </motion.div>
                </section>

                {/* Search Section */}
                <div className="relative z-10">
                    <SearchSection />
                </div>

                {/* Divider */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 my-16 flex justify-center">
                    <div className="h-[2px] w-32 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #E50914, transparent)' }} />
                </div>

                {/* Recommendations Section */}
                <div className="relative z-10">
                    <RecommendationGrid userId={userId} />
                </div>

                {/* Footer */}
                <footer className="relative z-10 max-w-7xl mx-auto px-4 py-16 text-center text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    <p>
                        © 2026 Anavya. Powered by FastAPI & React.
                    </p>
                </footer>
            </main>
        </div>
    );
};
