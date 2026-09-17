import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { UserRole } from '../types';
import { api, ApiUser, apiUrl } from '../lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: ApiUser) => void;
  googleSignInEnabled: boolean;
  demoMode: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  googleSignInEnabled,
  demoMode,
}) => {
  const [mode, setMode] = useState<'password' | 'demo'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await api.login(email.trim(), password);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: Exclude<UserRole, 'guest'>) => {
    setError(null);
    setLoading(true);
    try {
      const { user } = await api.switchRoleDemo(role as 'student' | 'parent' | 'admin');
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2454A6] flex items-center justify-center text-[#F7C948]">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">RAGHVYON Portal</h3>
              <p className="text-xs text-gray-500">Sign in to your learning account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Close sign in dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-start space-x-2" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In (identity scopes only: openid + email + profile) */}
        {googleSignInEnabled ? (
          <a
            href={apiUrl('/auth/google?returnTo=%2Fdashboard')}
            className="w-full flex items-center justify-center space-x-3 border border-gray-300 bg-white hover:bg-gray-50 text-[#172B4D] font-semibold text-sm py-3 rounded-2xl transition-colors shadow-xs"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
            </svg>
            <span>Continue with Google</span>
          </a>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Google Sign-In is not configured on this server yet. Please use your Academy email &amp; password below.</span>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Password login */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-[#172B4D] mb-1">Academy Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172B4D] focus:ring-1 focus:ring-[#2454A6] focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-[#172B4D] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172B4D] focus:ring-1 focus:ring-[#2454A6] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="text-[11px] text-gray-500 bg-[#FFF9EE] p-3 rounded-xl border border-[#2454A6]/10">
            <strong>Safe Student Access:</strong> Minor student accounts operate under parent-verified supervision with strict role-based data isolation. Sessions are secured with httpOnly cookies.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2454A6] hover:bg-[#1d4487] disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#F7C948]" />
              </>
            )}
          </button>
        </form>

        {/* Dev-only demo accounts */}
        {demoMode && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setMode(mode === 'demo' ? 'password' : 'demo')}
              className="text-[11px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider"
            >
              {mode === 'demo' ? 'Hide' : 'Show'} demo accounts (development only)
            </button>
            {mode === 'demo' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin('student')}
                    className="p-2.5 rounded-xl border border-gray-200 text-center hover:border-[#2454A6] hover:bg-[#2454A6]/5 transition-all disabled:opacity-50"
                  >
                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-[#2454A6]" />
                    <span className="text-[11px] block font-bold text-[#172B4D]">Student</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin('parent')}
                    className="p-2.5 rounded-xl border border-gray-200 text-center hover:border-[#35B8A6] hover:bg-[#35B8A6]/5 transition-all disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4 mx-auto mb-1 text-[#35B8A6]" />
                    <span className="text-[11px] block font-bold text-[#172B4D]">Parent</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin('admin')}
                    className="p-2.5 rounded-xl border border-gray-200 text-center hover:border-[#F28C72] hover:bg-[#F28C72]/5 transition-all disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-[#F28C72]" />
                    <span className="text-[11px] block font-bold text-[#172B4D]">Admin</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Demo data — password for all demo accounts: demo1234
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
