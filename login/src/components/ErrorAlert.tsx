import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export const ErrorAlert = ({ message, onRetry, onDismiss }: ErrorAlertProps) => {
    const isConnectionError = message.includes('Failed to connect') ||
        message.includes('backend') ||
        message.includes('ECONNREFUSED') ||
        message.includes('Network Error');

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative backdrop-blur-xl rounded-xl p-6"
            style={{
                background: 'rgba(229,9,20,0.1)',
                border: '1px solid rgba(229,9,20,0.3)',
                borderLeft: '4px solid #E50914'
            }}
        >
            <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#E50914' }} />
                <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">
                        {isConnectionError ? 'Backend Connection Error' : 'App Error'}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{message}</p>
                    {isConnectionError && (
                        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            💡 Make sure your FastAPI backend is running: <code className="px-2 py-1 rounded" style={{ background: 'rgba(229,9,20,0.2)', color: '#fff' }}>uvicorn main:app --reload --port 8000</code>
                        </p>
                    )}
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="text-xs font-bold uppercase tracking-widest transition-colors duration-200"
                            style={{ color: '#E50914' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#E50914')}
                        >
                            Try Again
                        </button>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="transition-colors duration-200"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};
