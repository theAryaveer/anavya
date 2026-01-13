import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-md ${type === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-100'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100'
                } backdrop-blur-xl border rounded-xl p-4 shadow-2xl flex items-center gap-3`}
        >
            {type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
