import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export const ErrorAlert = ({ message, onRetry, onDismiss }: ErrorAlertProps) => {
    // Detect if this is a backend connection error
    const isConnectionError = message.includes('Failed to connect') ||
        message.includes('backend') ||
        message.includes('ECONNREFUSED') ||
        message.includes('Network Error');

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-6"
        >
            <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-red-300 font-semibold mb-2">
                        {isConnectionError ? 'Backend Connection Error' : 'Error'}
                    </h3>
                    <p className="text-red-200/80 text-sm mb-4">{message}</p>
                    {isConnectionError && (
                        <p className="text-red-200/60 text-xs mb-4">
                            💡 Make sure your FastAPI backend is running: <code className="bg-red-900/30 px-2 py-1 rounded">uvicorn main:app --reload --port 8000</code>
                        </p>
                    )}
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="text-xs font-medium text-red-300 hover:text-red-100 underline transition-colors duration-200"
                        >
                            Try Again
                        </button>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-red-400 hover:text-red-200 transition-colors duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};
