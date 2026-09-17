import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  GraduationCap, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  User, 
  ArrowRight 
} from 'lucide-react';
import { Course } from '../types';

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: Course | null;
  onBookingSubmitted: (bookingData: any) => void;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedCourse,
  onBookingSubmitted
}) => {
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gradeLevel, setGradeLevel] = useState(preselectedCourse?.gradeLevel || 'Grade 8');
  const [subject, setSubject] = useState(preselectedCourse?.subject || 'Mathematics');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('5:00 PM - 6:00 PM IST (Evening)');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      studentName,
      parentName,
      phone,
      email,
      gradeLevel,
      subject,
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      preferredTimeSlot
    };
    onBookingSubmitted(data);
    setSubmitted(true);
  };

  const handleCloseAndReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7C948] text-[#172B4D] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#2454A6]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2454A6]">Book a Free Demo Class</h3>
              <p className="text-xs text-gray-500">1-on-1 Concept Diagnostic Session</p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-[#172B4D]">Demo Scheduled!</h4>
            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              Thank you, <strong>{parentName || studentName}</strong>. Our faculty will reach out at <strong>{phone}</strong> to confirm your Google Meet session for <strong>{subject}</strong>.
            </p>

            <div className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#2454A6]/15 text-xs text-left space-y-2">
              <p className="font-bold text-[#2454A6]">Need immediate confirmation?</p>
              <a
                href={`https://wa.me/12133960065?text=Hello%20Raghvyon%20Academy,%20I%20just%20booked%20a%20demo%20for%20${encodeURIComponent(studentName)}%20(${encodeURIComponent(subject)})`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Faculty on WhatsApp (+1 213 396-0065)</span>
              </a>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#172B4D] font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Student's Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 / +1 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="parent@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Grade / Class Level</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                >
                  <option value="Grade 2–3">Grade 2–3 (Foundations)</option>
                  <option value="Grade 4–5">Grade 4–5 (Elementary)</option>
                  <option value="Grade 6–8">Grade 6–8 (Middle School)</option>
                  <option value="Grade 9–10">Grade 9–10 (Secondary Board)</option>
                  <option value="US Middle School">US Middle School (Common Core)</option>
                  <option value="US High School">US High School (Pre-Algebra / Alg 1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Subject of Interest</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Spoken English">Spoken English</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Computer & Skills">Computer & Skills</option>
                  <option value="Exam Preparation">Exam Preparation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Preferred Time Slot</label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                >
                  <option value="10:00 AM - 11:00 AM IST (Morning)">10:00 AM - 11:00 AM IST (Morning)</option>
                  <option value="2:00 PM - 3:00 PM IST (Afternoon)">2:00 PM - 3:00 PM IST (Afternoon)</option>
                  <option value="5:00 PM - 6:00 PM IST (Evening)">5:00 PM - 6:00 PM IST (Evening)</option>
                  <option value="7:00 PM - 8:00 PM IST (Late Evening)">7:00 PM - 8:00 PM IST (Late Evening)</option>
                  <option value="US Morning Slot (EST 9:00 AM)">US Morning Slot (EST 9:00 AM)</option>
                  <option value="US Evening Slot (EST 6:00 PM)">US Evening Slot (EST 6:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="bg-[#FFF9EE] p-3 rounded-xl border border-[#2454A6]/10 text-[11px] text-gray-600">
              ✓ Completely free 45-minute 1-on-1 diagnostic with lead instructor.<br />
              ✓ No credit card or pre-commitment required.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5"
              >
                <span>Confirm Free Demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7C948]" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
