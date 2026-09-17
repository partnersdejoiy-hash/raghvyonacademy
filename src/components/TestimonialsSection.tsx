import React, { useState } from 'react';
import { Star, Quote, CheckCircle2, Globe, HeartHandshake, Sparkles } from 'lucide-react';
import { Testimonial } from '../types';

export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Sunita & Rajesh Sharma',
    role: 'Parents of Aarav (Grade 8)',
    location: 'New Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
    subject: 'Mathematics & Science',
    highlight: 'Jumped from 68% to 94% with zero anxiety',
    quote: 'Our son used to fear geometry and algebraic word problems. The lead mentor at Raghvyon doesn’t just teach formulas; he makes him visualize the proof before writing a single step. Aarav’s confidence in school exams transformed completely within three months.',
    verified: true
  },
  {
    id: 'test-2',
    author: 'Dr. Jennifer & David Miller',
    role: 'Parents of Maya (Grade 7)',
    location: 'San Jose, California, USA',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
    subject: 'Middle School Pre-Algebra & Physical Science',
    highlight: 'Adapts flawlessly to US Common Core standards',
    quote: 'Finding a tutor who truly understands the inquiry-based US Middle School curriculum and teaches with patience is rare. Maya looks forward to every session, and the live 3D models and interactive discussions make complex physics concepts easy.',
    verified: true
  },
  {
    id: 'test-3',
    author: 'Kabir Varma',
    role: 'Grade 10 Student',
    location: 'Bangalore, India',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
    subject: 'Physics, Chemistry & Advanced Math',
    highlight: 'Doubt clearing without feeling judged',
    quote: 'Sir encourages asking "silly" questions until you truly understand the logic. For the first time, Physics formulas make intuitive sense instead of feeling like mindless rote memorization. The chapter study notes are pure gold.',
    verified: true
  },
  {
    id: 'test-4',
    author: 'Priya & Alok Mukherjee',
    role: 'Parents of Ananya (Grade 5)',
    location: 'Gurugram, India',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
    subject: 'Foundational English & Mental Math',
    highlight: 'Instilled genuine curiosity in daily studies',
    quote: 'The personalized diagnostic pace is what makes Raghvyon special. Instead of rushing through textbook chapters, the teacher ensured Ananya mastered arithmetic speed drills and creative writing basics first. Her class teacher noticed the leap immediately.',
    verified: true
  },
  {
    id: 'test-5',
    author: 'Marcus Vance',
    role: 'High School Freshman (Grade 9)',
    location: 'Austin, Texas, USA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
    subject: 'Algebra I & Honors Biology',
    highlight: 'Top 5% in high school placement diagnostics',
    quote: 'Online tutoring usually feels like watching a prerecorded lecture, but at Raghvyon, it’s 100% conversational. Whenever I get stuck on quadratics, we dissect the problem visually. I aced my freshman honors placement with flying colors.',
    verified: true
  },
  {
    id: 'test-6',
    author: 'Meenakshi Sundaram',
    role: 'Parent of Rohan (Grade 9)',
    location: 'Chennai, India',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
    subject: 'CBSE Science & Competitive Foundation',
    highlight: 'Comprehensive feedback after every session',
    quote: 'The parent portal and regular feedback logs keep us completely informed about Rohan’s concept retention. The teacher’s dedication and 7+ years of experience clearly reflect in how thoroughly every homework assignment is reviewed.',
    verified: true
  }
];

interface TestimonialsSectionProps {
  onOpenDemoBooking: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onOpenDemoBooking }) => {
  const [filter, setFilter] = useState<'all' | 'parents' | 'students' | 'us' | 'india'>('all');

  const filtered = SAMPLE_TESTIMONIALS.filter(t => {
    if (filter === 'parents') return t.role.toLowerCase().includes('parent');
    if (filter === 'students') return t.role.toLowerCase().includes('student') || t.role.toLowerCase().includes('freshman');
    if (filter === 'us') return t.location.includes('USA');
    if (filter === 'india') return t.location.includes('India');
    return true;
  });

  return (
    <section id="testimonials" className="py-20 bg-[#FFF9EE]/50 border-t border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2454A6]/10 text-[#2454A6] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#2454A6]" />
              <span>Proven Academic Results</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B4D] tracking-tight">
              Trusted by Families in India & the United States
            </h2>
            <p className="text-base sm:text-lg text-[#172B4D]/75 leading-relaxed">
              Read how 7+ years of diagnostic, concept-first mentorship has built lasting academic confidence, top exam scores, and genuine love for learning.
            </p>
          </div>

          {/* Social Proof Metric Badge */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 text-[#F7C948]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F7C948]" />
                ))}
              </div>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-2xl font-black text-[#172B4D]">4.95 / 5.0</span>
                <span className="text-xs font-bold text-[#35B8A6] bg-[#35B8A6]/10 px-2 py-0.5 rounded-full">
                  100% Recommended
                </span>
              </div>
              <p className="text-xs text-[#172B4D]/60 mt-0.5">Based on 180+ student & parent reviews</p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#2454A6] text-white shadow-xs'
                : 'bg-white text-[#172B4D]/70 hover:text-[#2454A6] border border-gray-200'
            }`}
          >
            All Stories ({SAMPLE_TESTIMONIALS.length})
          </button>
          <button
            onClick={() => setFilter('parents')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'parents'
                ? 'bg-[#2454A6] text-white shadow-xs'
                : 'bg-white text-[#172B4D]/70 hover:text-[#2454A6] border border-gray-200'
            }`}
          >
            Parent Reviews
          </button>
          <button
            onClick={() => setFilter('students')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'students'
                ? 'bg-[#2454A6] text-white shadow-xs'
                : 'bg-white text-[#172B4D]/70 hover:text-[#2454A6] border border-gray-200'
            }`}
          >
            Student Experiences
          </button>
          <button
            onClick={() => setFilter('india')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'india'
                ? 'bg-[#2454A6] text-white shadow-xs'
                : 'bg-white text-[#172B4D]/70 hover:text-[#2454A6] border border-gray-200'
            }`}
          >
            India Curriculum (CBSE / ICSE)
          </button>
          <button
            onClick={() => setFilter('us')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'us'
                ? 'bg-[#2454A6] text-white shadow-xs'
                : 'bg-white text-[#172B4D]/70 hover:text-[#2454A6] border border-gray-200'
            }`}
          >
            US Common Core & Honors
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                {/* Header: Rating & Subject Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[#F7C948]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F7C948]" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-[#2454A6] bg-[#2454A6]/10 px-2.5 py-1 rounded-full">
                    {item.subject}
                  </span>
                </div>

                {/* Highlight Tag */}
                <div className="bg-[#FFF9EE] border border-[#F7C948]/40 p-3 rounded-xl">
                  <p className="text-xs font-bold text-[#172B4D] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#35B8A6] shrink-0" />
                    <span>"{item.highlight}"</span>
                  </p>
                </div>

                {/* Quote Body */}
                <div className="relative">
                  <Quote className="w-8 h-8 text-[#2454A6]/10 absolute -top-3 -left-2 -z-0" />
                  <p className="relative z-10 text-xs sm:text-sm text-[#172B4D]/85 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>
              </div>

              {/* Author & Verification Card */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center space-x-3.5">
                <img
                  src={item.avatar}
                  alt={item.author}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-bold text-[#172B4D] truncate">{item.author}</h3>
                    {item.verified && (
                      <span title="Verified Parent/Student" className="inline-flex">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#35B8A6] shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#172B4D]/70 truncate">{item.role}</p>
                  <p className="text-[11px] text-[#2454A6] font-medium flex items-center space-x-1 mt-0.5">
                    <Globe className="w-3 h-3" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-gradient-to-r from-[#2454A6] to-[#1c3f7c] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Experience the Raghvyon Difference in Person</h3>
            <p className="text-white/80 text-sm max-w-xl">
              Book a complimentary 45-minute interactive diagnostic demo session. Our lead instructor will assess your child’s conceptual foundation and outline a custom roadmap.
            </p>
          </div>
          <button
            onClick={onOpenDemoBooking}
            className="px-6 py-3.5 bg-[#F7C948] hover:bg-[#eab308] text-[#172B4D] font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 shrink-0 flex items-center space-x-2"
          >
            <HeartHandshake className="w-4 h-4 text-[#172B4D]" />
            <span>Book Free Diagnostic Demo</span>
          </button>
        </div>
      </div>
    </section>
  );
};
