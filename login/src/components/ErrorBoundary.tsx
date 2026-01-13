import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full bg-midnight flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-red-500/10 border border-red-500/30 rounded-xl p-8">
                        <h1 className="text-3xl font-bold text-red-300 mb-4">Something went wrong</h1>
                        <div className="bg-midnight-100 border border-slate-700 rounded-lg p-4 mb-4">
                            <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </p>
                            <p className="text-slate-500 font-mono text-xs mt-2">
                                {this.state.error?.stack}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-lg transition-all duration-200"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
