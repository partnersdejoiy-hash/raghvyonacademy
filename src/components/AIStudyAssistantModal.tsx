import React, { useState } from 'react';
import {
  X, Brain, Send, AlertCircle, RefreshCw, Loader2,
} from 'lucide-react';
import { api } from '../lib/api';

interface AIStudyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer & Skills', 'Spoken English', 'Exam Preparation'];
const GRADES = ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'US Middle School', 'US High School'];

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({ isOpen, onClose, initialTopic }) => {
  const [gradeLevel, setGradeLevel] = useState('Grade 8');
  const [subject, setSubject] = useState('Mathematics');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your RAGHVYON Concept Study Assistant. I give step-by-step conceptual hints, visual analogies, and guided practice — without simply doing your homework for you. What concept would you like to explore today?'
    }
  ]);

  if (!isOpen) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const data = await api.askAI({ question: userText, subject, gradeLevel });
      const reply = data.explanation || data.fallbackExplanation ||
        'Here is a guiding hint: identify what is given, what is asked, and which core rule connects them — then work step by step.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err instanceof Error
          ? `I couldn't answer just now: ${err.message} — please bring this question to your next RAGHVYON session, or try again shortly.`
          : 'Something went wrong. Please try again shortly.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="AI study assistant">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 h-[85vh] flex flex-col justify-between">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2454A6] text-[#F7C948] flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-[#172B4D]">RAGHVYON AI Study Mentor</h3>
                <span className="bg-[#35B8A6]/15 text-[#218174] text-[10px] font-bold px-2 py-0.5 rounded-full">Concept Model</span>
              </div>
              <p className="text-xs text-gray-500">Step-by-step conceptual explanations & guiding hints</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integrity notice */}
        <div className="bg-amber-50/80 border border-amber-200/70 p-3 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Academic Integrity Standard:</strong> This tool assists conceptual understanding — hints, analogies and worked examples, not completed homework. It complements (never replaces) your RAGHVYON mentor.
          </p>
        </div>

        {/* Context controls */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200 text-xs">
          <div>
            <label htmlFor="ai-subject" className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Subject</label>
            <select id="ai-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[#172B4D]">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ai-grade" className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Grade Level</label>
            <select id="ai-grade" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[#172B4D]">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Chat stream */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#FFF9EE]/30 rounded-2xl border border-gray-200/80">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#2454A6] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">R</div>
              )}
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-[#2454A6] text-white rounded-br-md' : 'bg-white border border-gray-200 text-[#172B4D] rounded-bl-md shadow-2xs'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#2454A6]" />
              <span>Preparing a conceptual breakdown...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleAsk} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            aria-label="Your question"
            placeholder="e.g. Why is division by zero undefined? How does photosynthesis work?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#172B4D] focus:ring-1 focus:ring-[#2454A6] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[#2454A6] hover:bg-[#1d4487] disabled:opacity-50 text-white p-3 rounded-2xl shadow-xs transition-colors shrink-0"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
