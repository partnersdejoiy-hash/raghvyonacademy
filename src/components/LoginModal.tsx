import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  Lock, 
  Mail,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('student@raghvyonacademy.com');
  const [password, setPassword] = useState('demo123');

  if (!isOpen) return null;

  const handlePresetSelect = (role: UserRole, presetEmail: string) => {
    setSelectedRole(role);
    setEmail(presetEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Quick Demo Accounts (Instant Switch):
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('student', 'aarav.sharma@student.raghvyon.com')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedRole === 'student'
                  ? 'border-[#2454A6] bg-[#2454A6]/10 text-[#2454A6] font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4 mx-auto mb-1 text-[#2454A6]" />
              <span className="text-[11px] block">Student</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('parent', 'sunita.sharma@parent.raghvyon.com')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedRole === 'parent'
                  ? 'border-[#35B8A6] bg-[#35B8A6]/10 text-[#35B8A6] font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="w-4 h-4 mx-auto mb-1 text-[#35B8A6]" />
              <span className="text-[11px] block">Parent</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('admin', 'admin@raghvyonacademy.com')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedRole === 'admin'
                  ? 'border-[#F28C72] bg-[#F28C72]/10 text-[#F28C72] font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-[#F28C72]" />
              <span className="text-[11px] block">Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">Email / Student ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
              />
            </div>
          </div>

          <div className="text-[11px] text-gray-500 bg-[#FFF9EE] p-3 rounded-xl border border-[#2454A6]/10">
            <strong>Safe Student Access:</strong> Minor student accounts operate under parent verified supervision with strict role-based data isolation.
          </div>

          <button
            type="submit"
            className="w-full bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Sign In to {selectedRole.toUpperCase()} View</span>
            <ArrowRight className="w-4 h-4 text-[#F7C948]" />
          </button>
        </form>

      </div>
    </div>
  );
};
