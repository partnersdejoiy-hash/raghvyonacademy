import React, { useState } from 'react';
import { 
  X, 
  Brain, 
  Send, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  RefreshCw, 
  Lightbulb, 
  CheckCircle2 
} from 'lucide-react';

interface AIStudyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({
  isOpen,
  onClose,
  initialTopic
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [gradeLevel, setGradeLevel] = useState('Grade 8');
  const [subject, setSubject] = useState('Mathematics');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your RAGHVYON Concept Study Assistant. I am designed to give you step-by-step conceptual hints, visual analogies, and guided practice—without simply doing your homework for you. What concept would you like to explore today?'
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
      const response = await fetch('/api/ai/study-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userText,
          gradeLevel,
          subject
        })
      });

      const data = await response.json();
      if (data.explanation) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.explanation }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Here is a guiding hint on that concept: Break the problem down into its fundamental definitions. First identify what is given, then ask yourself which core rule applies before performing calculations.'
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Conceptual Hint: When approaching this topic, remember the primary principle taught in class. Write down the known variables and formulate the relationship step by step.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                <span className="bg-[#35B8A6]/15 text-[#218174] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Gemini Concept Model
                </span>
              </div>
              <p className="text-xs text-gray-500">Step-by-step conceptual explanations & guiding hints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pedagogical Safety & Ethics Disclaimer */}
        <div className="bg-amber-50/80 border border-amber-200/70 p-3 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Academic Integrity Standard:</strong> This tool assists conceptual understanding and breaks down challenging topics. It is programmed to provide hints and analogies rather than complete assignment answers, in alignment with RAGHVYON ACADEMY educational ethics.
          </p>
        </div>

        {/* Context Controls: Subject & Grade */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200 text-xs">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-[#172B4D]"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Spoken English">Spoken English</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Grade Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-[#172B4D]"
            >
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="US Middle School">US Middle School</option>
            </select>
          </div>
        </div>

        {/* Chat / Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#FFF9EE]/30 rounded-2xl border border-gray-200/80">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#2454A6] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                  R
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#2454A6] text-white rounded-br-xs'
                    : 'bg-white border border-gray-200 text-[#172B4D] rounded-bl-xs shadow-2xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2454A6]" />
              <span>Generating conceptual breakdown...</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <form onSubmit={handleAsk} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            placeholder="Ask a question (e.g. Why is division by zero undefined? Or how does photosynthesis work?)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#172B4D] focus:ring-1 focus:ring-[#2454A6]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[#2454A6] hover:bg-[#1d4487] disabled:opacity-50 text-white p-3 rounded-2xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
