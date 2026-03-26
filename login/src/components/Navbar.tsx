import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, LogOut, User, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface NavbarProps {
    userEmail?: string;
    darkMode?: boolean;
    onToggleDarkMode?: () => void;
}

export const Navbar = ({ userEmail }: NavbarProps) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5"
             style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-2 rounded-xl"
                             style={{ background: 'linear-gradient(135deg,#E50914,#c1070f)', boxShadow: '0 0 16px rgba(229,9,20,0.4)' }}>
                            <BookMarked className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight" style={{ color: '#E50914' }}>
                            ANAVYA
                        </span>
                    </motion.div>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {userEmail && (
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-200"
                                    style={{ background: 'rgba(31,31,31,0.8)' }}
                                >
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                         style={{ background: 'linear-gradient(135deg,#E50914,#c1070f)' }}>
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium max-w-[140px] truncate">{userEmail}</span>
                                </motion.button>

                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                                        style={{ background: '#1F1F1F' }}
                                    >
                                        <div className="px-4 py-3 border-b border-white/8 text-xs text-white/40 truncate">{userEmail}</div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-150"
                                        >
                                            <LogOut className="w-4 h-4" style={{ color: '#E50914' }} />
                                            <span className="text-sm font-medium">Sign Out</span>
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-white/50 hover:text-white transition-colors"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="md:hidden border-t border-white/8 py-4 space-y-1"
                    >
                        {userEmail && (
                            <>
                                <div className="px-4 py-2 text-sm text-white/40 truncate">{userEmail}</div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5" style={{ color: '#E50914' }} />
                                    <span className="text-sm font-medium">Sign Out</span>
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </nav>
    );
};
