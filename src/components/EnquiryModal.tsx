import React, { useState } from 'react';
import { X, Mail, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { Course } from '../types';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourse?: Course | null;
  onEnquirySubmitted: (data: any) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedCourse,
  onEnquirySubmitted
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState(preselectedCourse?.gradeLevel || 'Grade 8');
  const [subject, setSubject] = useState(preselectedCourse?.subject || 'Mathematics');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnquirySubmitted({
      parentName: name,
      email,
      phone,
      gradeLevel,
      subject,
      message
    });
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#35B8A6] text-white flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#172B4D]">Send Academic Enquiry</h3>
              <p className="text-xs text-gray-500">We respond within 4 hours</p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
            <h4 className="text-2xl font-bold text-[#172B4D]">Enquiry Received!</h4>
            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out. We have received your query for <strong>{subject}</strong> and will contact you via phone or email shortly.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-[#2454A6] text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">Your Name (Parent or Student)</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">WhatsApp / Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 / +1 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Student Grade</label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#172B4D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">How can we assist you?</label>
              <textarea
                rows={3}
                required
                placeholder="Ask about batch timings, personalized 1-on-1 pacing, syllabus alignment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-xs text-[#172B4D]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
              >
                Submit Enquiry
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
