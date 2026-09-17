import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CreditCard, 
  GraduationCap, 
  Info, 
  Search, 
  Sparkles, 
  Users, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { Course } from '../types';

interface SubjectsCoursesSectionProps {
  courses: Course[];
  onOpenDemoBooking: (course?: Course) => void;
  onOpenEnquiry: (course?: Course) => void;
  onSelectCourse: (course: Course) => void;
}

export const SubjectsCoursesSection: React.FC<SubjectsCoursesSectionProps> = ({
  courses,
  onOpenDemoBooking,
  onOpenEnquiry,
  onSelectCourse
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subjectsList = ['All', 'Mathematics', 'Science', 'English', 'Spoken English', 'Social Studies', 'Computer & Skills', 'Exam Preparation'];

  const filteredCourses = courses.filter((course) => {
    const matchesFilter = selectedSubjectFilter === 'All' || course.subject === selectedSubjectFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch && course.active;
  });

  // Color thematic badge helper
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return 'bg-[#2454A6]/10 text-[#2454A6] border-[#2454A6]/20';
      case 'Science':
        return 'bg-[#35B8A6]/15 text-[#218174] border-[#35B8A6]/30';
      case 'English':
      case 'Spoken English':
        return 'bg-[#F28C72]/15 text-[#b94a2f] border-[#F28C72]/30';
      case 'Computer & Skills':
        return 'bg-[#F7C948]/25 text-[#855e00] border-[#F7C948]/40';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <section id="courses" className="py-16 sm:py-24 bg-[#FFF9EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-1.5 bg-white border border-[#2454A6]/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2454A6] mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#35B8A6]" />
            <span>STRUCTURED LEARNING PATHWAYS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2454A6] tracking-tight">
            Subjects & Interactive Courses
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#172B4D]/75">
            Designed for deep conceptual clarity, interactive engagement, and academic excellence across grades.
          </p>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {subjectsList.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubjectFilter(subject)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSubjectFilter === subject
                    ? 'bg-[#2454A6] text-white shadow-xs'
                    : 'bg-white text-[#172B4D]/70 hover:text-[#2454A6] border border-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search course or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#172B4D] focus:outline-hidden focus:border-[#2454A6] focus:ring-1 focus:ring-[#2454A6]"
            />
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-[#2454A6]/30"
            >
              {/* Course Subject Cover Image */}
              {course.imageUrl && (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-gray-100">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172B4D]/60 via-transparent to-transparent pointer-events-none" />
                  <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs bg-white/95 shadow-xs border ${getSubjectColor(course.subject)}`}>
                    {course.subject}
                  </span>
                  <span className="absolute bottom-3 right-3 text-[11px] font-bold text-white bg-[#172B4D]/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    {course.gradeLevel}
                  </span>
                </div>
              )}

              <div className="p-6 sm:p-7 space-y-4">
                
                {/* Subject Badge & Age (if no image) */}
                {!course.imageUrl && (
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getSubjectColor(course.subject)}`}>
                      {course.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-[#172B4D]/60 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      {course.gradeLevel}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-[#2454A6] group-hover:text-[#1d4487] transition-colors leading-snug">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#172B4D]/75 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-[#172B4D]/60 uppercase tracking-wider block">
                    Curriculum Highlights:
                  </span>
                  {course.highlights.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-[#172B4D]/80">
                      <Sparkles className="w-3 h-3 text-[#35B8A6] shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Duration & Fee Placeholders */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-[11px] text-[#172B4D]/75">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2454A6]" />
                    <span className="truncate">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#35B8A6]" />
                    <span className="truncate">{course.fee}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="bg-[#FFF9EE]/50 px-6 py-4 border-t border-gray-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenDemoBooking(course)}
                    className="w-full bg-[#2454A6] hover:bg-[#1d4487] text-white font-bold text-xs py-2.5 rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Free Demo</span>
                  </button>
                  <button
                    onClick={() => onOpenEnquiry(course)}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-[#172B4D] font-bold text-xs py-2.5 rounded-xl transition-colors"
                  >
                    Enquire
                  </button>
                </div>
                
                <button
                  onClick={() => onSelectCourse(course)}
                  className="w-full text-center text-xs font-semibold text-[#2454A6] hover:underline pt-1 flex items-center justify-center space-x-1"
                >
                  <span>View Full Syllabus & Outcomes</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
            <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-base font-bold text-[#172B4D]">No courses found matching your filter</p>
            <button
              onClick={() => { setSelectedSubjectFilter('All'); setSearchQuery(''); }}
              className="mt-3 text-xs font-bold text-[#2454A6] underline"
            >
              Reset filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
