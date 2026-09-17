import React from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { Course } from '../types';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onBookDemo: (course: Course) => void;
  onEnquire: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onBookDemo,
  onEnquire
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Course Banner Image */}
        {course.imageUrl && (
          <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-xs border border-gray-100">
            <img
              src={course.imageUrl}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 bg-[#2454A6]/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
              {course.subject}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-[#2454A6]/10 text-[#2454A6] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2454A6]/20">
                {course.subject}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {course.gradeLevel}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#2454A6]">{course.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview & Key Details */}
        <p className="text-sm sm:text-base text-[#172B4D]/85 leading-relaxed">
          {course.description}
        </p>

        {/* Duration & Fee info */}
        <div className="grid grid-cols-2 gap-4 bg-[#FFF9EE] p-4 rounded-2xl border border-[#2454A6]/15 text-xs text-[#172B4D]">
          <div>
            <span className="text-gray-500 font-bold uppercase block text-[10px]">Estimated Course Duration</span>
            <span className="font-bold text-sm text-[#2454A6] mt-0.5 block">{course.duration}</span>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase block text-[10px]">Course Fee Structure</span>
            <span className="font-bold text-sm text-[#35B8A6] mt-0.5 block">{course.fee}</span>
          </div>
        </div>

        {/* Pedagogical Highlights */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
            Pedagogical Highlights & Outcomes:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {course.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-[#172B4D] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <Sparkles className="w-4 h-4 text-[#F7C948] shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Outline Breakdown */}
        {course.curriculumOutline && course.curriculumOutline.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
              Sample Week-by-Week Conceptual Progression:
            </h4>
            <div className="space-y-3">
              {course.curriculumOutline.map((item) => (
                <div key={item.weekNumber} className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2454A6]">
                    <span>Week {item.weekNumber}: {item.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.topics.map((topic, i) => (
                      <span key={i} className="text-[11px] bg-gray-100 text-[#172B4D] px-2 py-0.5 rounded-md">
                        • {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => { onClose(); onEnquire(course); }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold border border-gray-300 text-[#172B4D] hover:bg-gray-50 rounded-xl"
          >
            Enquire for Batch Timings
          </button>
          <button
            onClick={() => { onClose(); onBookDemo(course); }}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-[#2454A6] hover:bg-[#1d4487] text-white rounded-xl shadow-xs flex items-center justify-center space-x-1.5"
          >
            <span>Book Free Demo for this Course</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F7C948]" />
          </button>
        </div>

      </div>
    </div>
  );
};
