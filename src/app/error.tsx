'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error Boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-12 space-y-6">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                        Application Error
                    </h1>

                    <p className="text-slate-400 font-medium">
                        A client-side exception has occurred. This might be due to missing configuration.
                    </p>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-left">
                        <p className="text-sm text-slate-300 font-mono break-all">
                            {error.message || 'Unknown error'}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-slate-500 mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
                    >
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-colors"
                    >
                        Return to Home
                    </button>
                </div>

                <div className="pt-6 border-t border-slate-700 space-y-3">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center">
                        Possible Causes
                    </p>
                    <ul className="text-sm text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Missing or incorrect Firebase environment variables</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Network connectivity issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Service temporarily unavailable</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
