import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Moon, Sun, LogOut, User, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface NavbarProps {
    userEmail?: string;
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

export const Navbar = ({ userEmail, darkMode, onToggleDarkMode }: NavbarProps) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-midnight/80 backdrop-blur-xl border-b border-slate-700/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
                            <BookMarked className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-indigo-400">
                            Anvaya
                        </span>
                    </motion.div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleDarkMode}
                            className="p-2.5 bg-midnight-100 hover:bg-midnight-50 border border-slate-700/50 rounded-xl transition-all duration-200"
                            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-400" />
                            )}
                        </motion.button>

                        {/* User Menu */}
                        {userEmail && (
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-4 py-2 bg-midnight-100/60 hover:bg-midnight-50 border border-slate-700/40 rounded-xl transition-all duration-200"
                                >
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-300 max-w-[150px] truncate">
                                        {userEmail}
                                    </span>
                                </motion.button>

                                {/* Dropdown */}
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 mt-2 w-48 bg-midnight-100/95 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-2xl overflow-hidden"
                                    >
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-700/30 transition-colors duration-200"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm">Sign Out</span>
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-slate-400 hover:text-slate-50 transition-colors duration-200"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-700/40 py-4 space-y-4"
                    >
                        <button
                            onClick={onToggleDarkMode}
                            className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700/20 rounded-xl transition-colors duration-200"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span>Toggle Theme</span>
                        </button>

                        {userEmail && (
                            <>
                                <div className="px-4 py-2 text-sm text-slate-500 truncate">
                                    {userEmail}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700/20 rounded-xl transition-colors duration-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </nav>
    );
};
