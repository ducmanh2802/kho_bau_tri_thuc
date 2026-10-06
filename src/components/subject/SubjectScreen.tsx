import React, { useState } from 'react';
import { Lesson, SubjectType, Topic } from '../../types';
import { getTopicsBySubject } from '../../data/curriculum';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import { LessonPlayerModal } from '../learning/LessonPlayerModal';
import { ArrowLeft, CheckCircle2, Star, Sparkles, Play } from 'lucide-react';

interface SubjectScreenProps {
  subject: SubjectType;
  onBack: () => void;
  onProfileUpdate: () => void;
  /** Opens the Kid's Box Companion track (English only). */
  onOpenKidBox?: () => void;
}

export const SubjectScreen: React.FC<SubjectScreenProps> = ({
  subject,
  onBack,
  onProfileUpdate,
  onOpenKidBox,
}) => {
  const topics: Topic[] = getTopicsBySubject(subject);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const profile = StorageService.getChildProfile();

  const subjectInfo = {
    'tieng-viet': {
      title: 'Vương Quốc Tiếng Việt Lớp 1',
      subtitle: 'Học chữ cái, ghép âm, vần, chính tả và đọc hiểu mẩu chuyện',
      mascotEmoji: '🐻',
      mascotName: 'Gấu Bút Chì',
      color: 'from-amber-400 to-orange-500',
      welcome: 'Chào bé đến với thế giới Tiếng Việt rực rỡ sắc màu!',
    },
    'toan': {
      title: 'Thành Phố Toán Học Lớp 1',
      subtitle: 'Đếm số, so sánh >, <, =, cộng trừ trong phạm vi 10 & 20, hình học',
      mascotEmoji: '🦊',
      mascotName: 'Cáo Toán',
      color: 'from-blue-400 to-cyan-500',
      welcome: 'Cáo Toán xin chào! Cùng nhau tính toán siêu vui nhé!',
    },
    'english': {
      title: 'English Adventure Island',
      subtitle: 'Phonics, Numbers, Colors, Animals, Family, School and Body',
      mascotEmoji: '🐰',
      mascotName: 'Thỏ English',
      color: 'from-emerald-400 to-teal-500',
      welcome: 'Welcome to English Island! Let us learn English together!',
    },
  }[subject];

  const handleStartLesson = (lesson: Lesson) => {
    sound.playClick();
    setActiveLesson(lesson);
  };

  const handleLessonComplete = () => {
    onProfileUpdate();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 select-none">
      {/* Top Bar with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl font-bold text-xs md:text-sm text-amber-950 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Lại</span>
        </button>

        <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-300">
          Chương trình Chuẩn Lớp 1 · {topics.length} Chủ Điểm
        </span>
      </div>

      {/* Hero Subject Banner */}
      <div
        className={`bg-gradient-to-r ${subjectInfo.color} rounded-3xl p-6 md:p-8 text-white shadow-xl border-4 border-white/60 flex flex-col md:flex-row items-center justify-between gap-6`}
      >
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-5xl md:text-6xl border-4 border-amber-200 animate-float shrink-0">
            {subjectInfo.mascotEmoji}
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">
              Linh vật: {subjectInfo.mascotName}
            </span>
            <h1 className="text-2xl md:text-3xl font-black font-display mt-0.5">
              {subjectInfo.title}
            </h1>
            <p className="text-xs md:text-sm text-white/90 font-bold mt-1 max-w-xl leading-relaxed">
              {subjectInfo.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => sound.speak(subjectInfo.welcome, subject === 'english' ? 'en-GB' : 'vi-VN')}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-xs flex items-center gap-2 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <span>🔊 Nghe giới thiệu</span>
        </button>
      </div>

      {/* Topics & Lessons List */}
      <div className="space-y-6">
        {/* Kid's Box Companion entry — only inside English (Learning OS → English → Kid's Box). */}
        {subject === 'english' && onOpenKidBox && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenKidBox();
            }}
            className="w-full text-left bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 md:p-6 text-white shadow-lg border-4 border-white/60 flex items-center gap-4 active:scale-[0.99] cursor-pointer"
          >
            <span className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-3xl flex items-center justify-center text-3xl md:text-4xl border-4 border-emerald-200 shrink-0">
              🐰
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-50">
                British English · en-GB
              </span>
              <span className="block text-base md:text-lg font-black font-display">Kid&apos;s Box Companion</span>
              <span className="block text-xs font-bold text-emerald-50 mt-0.5">
                Unit hiện tại · Từ vựng · Nghe · Nói · Âm thanh · Trò chơi
              </span>
            </span>
            <Play className="w-6 h-6 fill-white shrink-0" />
          </button>
        )}

        {topics.map((topic, topicIdx) => (
          <div
            key={topic.id}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-md border-3 border-amber-200 space-y-4"
          >
            {/* Topic Header */}
            <div className="flex items-start justify-between gap-3 border-b border-amber-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl border border-amber-200">
                  {topic.iconEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                      Chủ đề {topicIdx + 1}
                    </span>
                    <h2 className="text-base md:text-lg font-black text-slate-900 font-display">
                      {topic.title}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{topic.subtitle}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl">
                {topic.lessons.length} bài học
              </span>
            </div>

            {/* Lesson Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topic.lessons.map((lesson) => {
                const isCompleted = profile.completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-black text-slate-900 font-display">
                          {lesson.title}
                        </h3>
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã xong</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-black">
                        <span className="flex items-center gap-0.5 text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>+{lesson.starReward}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-purple-600">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          <span>+{lesson.xpReward} XP</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartLesson(lesson)}
                        className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{isCompleted ? 'Học lại' : 'Vào học'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lesson Runner Modal */}
      {activeLesson && (
        <LessonPlayerModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  );
};
