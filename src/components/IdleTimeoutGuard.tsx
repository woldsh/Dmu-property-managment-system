'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, MousePointer2 } from 'lucide-react';

const IDLE_TIMEOUT = 600; // seconds
const WARNING_AT = 30; // show warning when this many seconds remain

export default function IdleTimeoutGuard() {
  const { user, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(IDLE_TIMEOUT);
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsLeft(IDLE_TIMEOUT);
    setShowWarning(false);
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetTimer]);

  // Countdown interval
  useEffect(() => {
    if (!user) return;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(IDLE_TIMEOUT - elapsed, 0);
      setSecondsLeft(remaining);

      if (remaining <= WARNING_AT && remaining > 0) {
        setShowWarning(true);
      }

      if (remaining <= 0) {
        setShowWarning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        logout();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, logout]);

  // Don't render anything if no user or no warning needed
  if (!user || !showWarning) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full mx-4 text-center"
        >
          {/* Timer Circle */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#f1f5f9" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke={secondsLeft <= 5 ? '#ef4444' : '#6366f1'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - secondsLeft / WARNING_AT)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${secondsLeft <= 5 ? 'text-red-500' : 'text-indigo-600'}`}>
                {secondsLeft}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={18} className="text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Session Expiring</h3>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            You&apos;ve been inactive. You will be logged out in{' '}
            <span className={`font-bold ${secondsLeft <= 5 ? 'text-red-500' : 'text-indigo-600'}`}>
              {secondsLeft}s
            </span>.
          </p>

          <button
            onClick={resetTimer}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.97] transition-all"
          >
            <MousePointer2 size={16} />
            Stay Logged In
          </button>

          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-2.5 text-slate-500 text-sm font-medium hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            Logout Now
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
