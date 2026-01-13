import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession } from '../lib/api';
import { MainPage } from '../pages/MainPage';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        // Get user from localStorage
        const session = getUserSession();

        if (!session.userId) {
            // No user session, redirect to signup
            navigate('/signup', { replace: true });
            return;
        }

        setUserId(session.userId);
        setUserName(session.userName);
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-slate-50 bg-midnight">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-500">Loading...</p>
            </div>
        );
    }

    if (!userId) {
        return null; // Will redirect
    }

    return (
        <MainPage
            userEmail={userName || undefined}
            userId={userId}
            userName={userName || undefined}
        />
    );
};
