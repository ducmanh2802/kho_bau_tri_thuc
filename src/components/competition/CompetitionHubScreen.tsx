import React, { useState, useEffect } from 'react';
import {
  CompetitionExamResult,
  CompetitionQuestion,
  ExamBlueprint,
  SubjectType,
} from '../../types';
import { EXAM_BLUEPRINTS } from '../../data/competitionBlueprints';
import { COMPETITION_SKILLS, getSkillsBySubject } from '../../data/competitionTaxonomy';
import { CompetitionEngine } from '../../services/competitionEngine';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import { CompetitionExamModal } from './CompetitionExamModal';
import { CompetitionResultModal } from './CompetitionResultModal';
import { ReadinessView } from './ReadinessView';
import {
  Trophy,
  Target,
  Zap,
  Clock,
  Star,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface CompetitionHubScreenProps {
  onBack: () => void;
  onProfileUpdate: () => void;
}

export const CompetitionHubScreen: React.FC<CompetitionHubScreenProps> = ({
  onBack,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'mock_exams' | 'skill_practice' | 'speed_trial' | 'history'>('mock_exams');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('toan');

  // Active exam session
  const [activeBlueprint, setActiveBlueprint] = useState<ExamBlueprint | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<CompetitionQuestion[]>([]);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Active result modal
  const [completedResult, setCompletedResult] = useState<CompetitionExamResult | null>(null);

  // History & Readiness
  const [historyStore, setHistoryStore] = useState(StorageService.getCompetitionHistory());

  const refreshHistory = () => {
    setHistoryStore(StorageService.getCompetitionHistory());
    onProfileUpdate();
  };

  const handleStartExam = (blueprint: ExamBlueprint) => {
    sound.playClick();
    const questions = CompetitionEngine.assembleExamQuestions(blueprint);
    setActiveBlueprint(blueprint);
    setActiveQuestions(questions);
    setIsExamModalOpen(true);
  };

  const handleStartSkillPractice = (skillId: string) => {
    sound.playClick();
    const questions = CompetitionEngine.assembleSkillPractice(skillId, 5);
    const skill = COMPETITION_SKILLS.find((s) => s.skillId === skillId);

    const practiceBlueprint: ExamBlueprint = {
      id: `practice_${skillId}`,
      title: `Luyện Kỹ Năng: ${skill?.skillName || skillId}`,
      subtitle: 'Luyện tập chuyên sâu không áp lực thời gian',
      subject: skill?.subject || selectedSubject,
      mode: 'skill_practice',
      difficulty: 'MEDIUM',
      durationSeconds: 300,
      questionCount: questions.length,
      badgeEmoji: '🎯',
      rewardXp: 40,
      rewardStars: 3,
    };

    setActiveBlueprint(practiceBlueprint);
    setActiveQuestions(questions);
    setIsExamModalOpen(true);
  };

  const handleStartRemediation = (weakSkills: string[]) => {
    sound.playClick();
    if (completedResult) setCompletedResult(null);

    // Map skill names to IDs
    const targetSkillIds = COMPETITION_SKILLS.filter((s) =>
      weakSkills.includes(s.skillName)
    ).map((s) => s.skillId);

    const questions = CompetitionEngine.assembleAdaptiveRemediation(
      targetSkillIds.length > 0 ? targetSkillIds : ['MATH-SUBTRACTION'],
      6
    );

    const remediationBlueprint: ExamBlueprint = {
      id: `remediation_${Date.now()}`,
      title: '🎯 Khóa Luyện Củng Cố Kỹ Năng Yếu',
      subtitle: 'Tập trung bù đắp các câu con chưa tự tin trong bài thi',
      subject: selectedSubject,
      mode: 'skill_practice',
      difficulty: 'MEDIUM',
      durationSeconds: 360,
      questionCount: questions.length,
      badgeEmoji: '💡',
      rewardXp: 50,
      rewardStars: 4,
    };

    setActiveBlueprint(remediationBlueprint);
    setActiveQuestions(questions);
    setIsExamModalOpen(true);
  };

  const handleFinishExam = (result: CompetitionExamResult) => {
    setIsExamModalOpen(false);
    setCompletedResult(result);
    refreshHistory();
  };

  const filteredBlueprints = EXAM_BLUEPRINTS.filter(
    (b) => b.subject === selectedSubject && b.mode !== 'speed_trial'
  );

  const speedBlueprints = EXAM_BLUEPRINTS.filter((b) => b.mode === 'speed_trial');
  const currentSkills = getSkillsBySubject(selectedSubject);
  const readiness = CompetitionEngine.assessReadiness(historyStore.examResults);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl font-bold text-xs md:text-sm text-amber-950 transition-all active:scale-95 shadow-xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100/80 rounded-full border border-amber-300">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black text-amber-950">
              Đấu trường hoàn thành: {historyStore.examResults.length}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-lg border border-amber-300">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black">
            <span>🏆</span>
            <span>RÈN LUYỆN ĐẤU TRƯỜNG LỚP 1</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white drop-shadow-xs">
            Kho Báu Đấu Trường Tri Thức
          </h1>
          <p className="text-xs md:text-sm text-amber-100 font-medium leading-relaxed">
            Học chắc kiến thức, rèn phản xạ tốc độ, thi thử tự tin và vượt qua giới hạn của chính mình!
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-amber-200">
        {[
          { id: 'mock_exams', label: 'Thi Thử Đấu Trường', icon: '🏆' },
          { id: 'skill_practice', label: 'Luyện Dạng Bài', icon: '🎯' },
          { id: 'speed_trial', label: 'Luyện Tốc Độ (3p)', icon: '⚡' },
          { id: 'history', label: 'Lịch Sử & Sẵn Sàng', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subject Filter (for Mock Exams & Skill Practice tabs) */}
      {(activeTab === 'mock_exams' || activeTab === 'skill_practice') && (
        <div className="flex items-center gap-2">
          {[
            { id: 'toan' as SubjectType, label: 'Môn Toán', emoji: '🔢' },
            { id: 'tieng-viet' as SubjectType, label: 'Môn Tiếng Việt', emoji: '📚' },
            { id: 'english' as SubjectType, label: 'Tiếng Anh', emoji: '🇬🇧' },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                sound.playClick();
                setSelectedSubject(sub.id);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                selectedSubject === sub.id
                  ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{sub.emoji}</span>
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: MOCK EXAMS */}
      {activeTab === 'mock_exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBlueprints.map((bp) => (
            <div
              key={bp.id}
              className="bg-white rounded-3xl p-5 md:p-6 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{bp.badgeEmoji}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      bp.difficulty === 'HARD'
                        ? 'bg-rose-100 text-rose-800'
                        : bp.difficulty === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {bp.difficulty === 'HARD'
                      ? 'Nâng cao'
                      : bp.difficulty === 'MEDIUM'
                      ? 'Tiêu chuẩn'
                      : 'Cơ bản'}
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-black text-slate-800 font-display">
                  {bp.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {bp.subtitle}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    {Math.round(bp.durationSeconds / 60)} phút
                  </span>
                  <span>{bp.questionCount} câu hỏi</span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    +{bp.rewardStars} sao
                  </span>
                </div>

                <button
                  onClick={() => handleStartExam(bp)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Vào Thi Thử</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SKILL PRACTICE */}
      {activeTab === 'skill_practice' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Chọn một kỹ năng cụ thể để rèn luyện 5 câu hỏi trọng tâm:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentSkills.map((sk) => {
              const stat = historyStore.practicedSkills[sk.skillId];
              return (
                <div
                  key={sk.skillId}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                      {sk.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug mt-0.5">
                      {sk.skillName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {sk.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400">
                      {stat ? `Đã luyện: ${stat.correct}/${stat.attempts}` : 'Chưa luyện'}
                    </span>

                    <button
                      onClick={() => handleStartSkillPractice(sk.skillId)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95"
                    >
                      Luyện ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SPEED TRIAL */}
      {activeTab === 'speed_trial' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-2xl flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-black text-amber-950 block">Thử Thách Tốc Độ 3 Phút</span>
              <span className="text-amber-800">
                Luyện khả năng đọc nhanh, tính nhẩm chuẩn xác và quyết đoán dưới áp lực thời gian nhẹ nhàng.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speedBlueprints.map((sbp) => (
              <div
                key={sbp.id}
                className="bg-white rounded-3xl p-5 md:p-6 border border-amber-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{sbp.badgeEmoji}</span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-xs">
                      ⚡ 3 PHÚT
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 font-display">{sbp.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sbp.subtitle}</p>
                </div>

                <button
                  onClick={() => handleStartExam(sbp)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Bắt Đầu Thử Thách Tốc Độ</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY & READINESS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Readiness Dashboard Card */}
          <ReadinessView
            readiness={readiness}
            onTakeMockExam={() => {
              setActiveTab('mock_exams');
              sound.playClick();
            }}
          />

          {/* Past Exam Attempts */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-amber-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Lịch Sử Bài Thi Gần Đây ({historyStore.examResults.length})
            </h3>

            {historyStore.examResults.length > 0 ? (
              <div className="space-y-3">
                {historyStore.examResults.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm">{exam.examTitle}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                          {exam.subject === 'tieng-viet'
                            ? 'Tiếng Việt'
                            : exam.subject === 'toan'
                            ? 'Toán'
                            : 'English'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ngày làm: {new Date(exam.timestamp).toLocaleDateString('vi-VN')} • Thời gian:{' '}
                        {Math.floor(exam.timeUsedSeconds / 60)}m {exam.timeUsedSeconds % 60}s
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-amber-950 font-display block">
                          {exam.score}/10
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {exam.accuracy}% đúng
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setCompletedResult(exam);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 transition-all cursor-pointer"
                      >
                        Xem lại
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                Bé chưa hoàn thành bài thi thử nào. Hãy chọn một bài Mini Test để bắt đầu nhé!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Exam Session */}
      {isExamModalOpen && activeBlueprint && (
        <CompetitionExamModal
          blueprint={activeBlueprint}
          questions={activeQuestions}
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          onFinish={handleFinishExam}
        />
      )}

      {/* Modal 2: Exam Result & Mistake Review */}
      {completedResult && (
        <CompetitionResultModal
          result={completedResult}
          onClose={() => setCompletedResult(null)}
          onRetake={() => {
            const bp = EXAM_BLUEPRINTS.find((b) => b.id === completedResult.blueprintId);
            if (bp) {
              setCompletedResult(null);
              handleStartExam(bp);
            }
          }}
          onStartRemediation={handleStartRemediation}
        />
      )}
    </div>
  );
};
