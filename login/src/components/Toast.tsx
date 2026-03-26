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
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-md backdrop-blur-xl border rounded-xl p-4 shadow-2xl flex items-center gap-3"
            style={{
                background: type === 'error' ? 'rgba(229,9,20,0.15)' : 'rgba(16,185,129,0.15)',
                borderColor: type === 'error' ? 'rgba(229,9,20,0.4)' : 'rgba(16,185,129,0.4)',
                color: 'white'
            }}
        >
            {type === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E50914' }} />
            ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#10B981' }} />
            )}
            <p className="flex-1 font-bold">{message}</p>
            <button
                onClick={onClose}
                className="p-1 rounded-lg transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
                <X className="w-5 h-5" />
            </button>
        </motion.div>
    );
};
