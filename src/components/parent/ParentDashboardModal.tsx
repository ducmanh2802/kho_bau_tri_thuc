import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { AdaptiveService, ParentDiagnosticReport, ReadingProgressReport } from '../../services/adaptive';
import { ParentSettings } from '../../types';
import { sound } from '../../services/sound';
import {
  Lock,
  X,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Settings,
  Volume2,
  Trash2,
  Download,
  BarChart3,
  ShieldCheck,
  Trophy,
  Languages,
} from 'lucide-react';
import { KidBoxParentPanel } from './KidBoxParentPanel';

interface ParentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

export const ParentDashboardModal: React.FC<ParentDashboardModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ a: 15, b: 18, ans: 33 });
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);

  const [settings, setSettings] = useState<ParentSettings>(StorageService.getParentSettings());
  const [report, setReport] = useState<ParentDiagnosticReport | null>(null);
  const [readingReport, setReadingReport] = useState<ReadingProgressReport | null>(null);
  const [activeTab, setActiveTab] = useState<
    'progress' | 'reading' | 'insights' | 'competition' | 'kidbox' | 'settings'
  >('progress');
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  // Regenerate gate challenge on open
  React.useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 20) + 12;
      const b = Math.floor(Math.random() * 20) + 11;
      setGateQuestion({ a, b, ans: a + b });
      setGateInput('');
      setGateError(false);
      setIsAuthenticated(false);
      setSettings(StorageService.getParentSettings());
    }
  }, [isOpen]);

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateInput, 10) === gateQuestion.ans) {
      sound.playCorrect();
      setIsAuthenticated(true);
      setReport(AdaptiveService.generateParentReport());
      setReadingReport(AdaptiveService.generateReadingReport());
    } else {
      sound.playWrong();
      setGateError(true);
      setGateInput('');
    }
  };

  const handleUpdateLimit = (mins: number) => {
    const next = { ...settings, dailyLimitMinutes: mins };
    setSettings(next);
    StorageService.saveParentSettings(next);
    sound.playClick();
  };

  const handleToggleVoice = () => {
    const next = { ...settings, voiceEnabled: !settings.voiceEnabled };
    setSettings(next);
    StorageService.saveParentSettings(next);
    sound.setVoiceEnabled(next.voiceEnabled);
    sound.playClick();
  };

  const handleToggleSound = () => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(next);
    StorageService.saveParentSettings(next);
    sound.setMuted(!next.soundEnabled);
    sound.playClick();
  };

  const handleExportData = () => {
    const profile = StorageService.getChildProfile();
    const analytics = StorageService.getAnalytics();
    const competitionHistory = StorageService.getCompetitionHistory();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, analytics, competitionHistory }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `kho_bau_tri_thuc_report_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
    sound.playStar();
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const handleConfirmReset = () => {
    StorageService.resetProgress();
    sound.playClick();
    setResetSuccessMessage('Đã đặt lại tiến độ về dữ liệu mới tinh ban đầu!');
    setShowResetConfirm(false);
    setReport(AdaptiveService.generateParentReport());
    setReadingReport(AdaptiveService.generateReadingReport());
    if (onDataReset) onDataReset();
    setTimeout(() => setResetSuccessMessage(null), 3000);
  };

  const handleSeedDemoData = () => {
    StorageService.seedDemoProfile();
    sound.playStar();
    setShowSeedConfirm(false);
    setResetSuccessMessage(
      'Đã nạp DỮ LIỆU THỬ NGHIỆM. Các biểu đồ đang hiển thị là số liệu mẫu, không phải tiến bộ thật của bé.'
    );
    setReport(AdaptiveService.generateParentReport());
    setReadingReport(AdaptiveService.generateReadingReport());
    if (onDataReset) onDataReset();
    setTimeout(() => setResetSuccessMessage(null), 6000);
  };

  if (!isOpen) return null;

  const analytics = StorageService.getAnalytics();
  const profile = StorageService.getChildProfile();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/80 backdrop-blur-md animate-pop">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-wide font-display">
                Khu Vực Dành Cho Phụ Huynh
              </h2>
              <p className="text-xs text-slate-300">
                Theo dõi tiến độ, phân tích kỹ năng & kiểm soát thời gian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          // Parent Gate Screen (Simple Math calculation to verify adult presence)
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cổng Xác Nhận Phụ Huynh</h3>
            <p className="text-sm text-slate-600 mb-6">
              Để bảo vệ an toàn cho bé, vui lòng trả lời phép tính dưới đây để truy cập trang quản lý:
            </p>

            <form onSubmit={handleVerifyGate} className="w-full space-y-4">
              <div className="p-4 bg-slate-100 rounded-2xl text-2xl font-black text-slate-800 tracking-wider">
                {gateQuestion.a} + {gateQuestion.b} = ?
              </div>

              <input
                type="number"
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                placeholder="Nhập kết quả..."
                autoFocus
                className="w-full py-3 px-4 text-center text-xl font-bold border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none"
              />

              {gateError && (
                <p className="text-xs text-rose-600 font-bold">
                  Kết quả chưa chính xác, ba mẹ vui lòng tính lại nhé!
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
              >
                Mở Bảng Phụ Huynh
              </button>
            </form>
          </div>
        ) : (
          // Authenticated Parent Dashboard
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* DEMO DATA BANNER (§1.2): fabricated figures must never look real */}
            {report?.isDemoData && (
              <div
                role="status"
                className="px-6 py-2.5 bg-amber-100 border-b-2 border-amber-300 text-amber-950 text-xs font-bold flex items-start gap-2"
              >
                <span className="text-base leading-none pt-0.5" aria-hidden="true">
                  ⚠️
                </span>
                <span>
                  Đang hiển thị <strong>DỮ LIỆU THỬ NGHIỆM</strong> — các con số dưới đây là số
                  liệu mẫu để minh hoạ, không phải tiến bộ thật của bé. Bấm “Đặt lại tiến độ” để
                  xoá và bắt đầu bằng hồ sơ sạch.
                </span>
              </div>
            )}

            {/* Nav Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6">
              <button
                onClick={() => setActiveTab('progress')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tiến Độ & Năng Lực</span>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'insights'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>Phân Tích & Lời Khuyên</span>
              </button>
              <button
                onClick={() => setActiveTab('reading')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'reading'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Luyện Đọc</span>
              </button>
              <button
                onClick={() => setActiveTab('competition')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'competition'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Đấu Trường Thi Thử</span>
              </button>
              <button
                onClick={() => setActiveTab('kidbox')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'kidbox'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>Kid&apos;s Box</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Cài Đặt & Thời Gian</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'progress' && (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                      <span className="text-xs text-blue-700 font-semibold block">Học hôm nay</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-black text-blue-900">{analytics.minutesToday} phút</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="text-xs text-emerald-700 font-semibold block">Độ chính xác</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-2xl font-black text-emerald-900">
                          {analytics.totalQuestionsAnswered > 0 ? `${report?.overallAccuracy ?? 0}%` : 'Chưa có'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <span className="text-xs text-amber-700 font-semibold block">Bài học xong</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                        <span className="text-2xl font-black text-amber-900">
                          {profile.completedLessons.length} bài
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                      <span className="text-xs text-purple-700 font-semibold block">Chuỗi ngày học</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xl">🔥</span>
                        <span className="text-2xl font-black text-purple-900">{profile.streak} ngày</span>
                      </div>
                    </div>
                  </div>

                  {/* Subject Mastery Progress Bars */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Mức độ nắm vững kiến thức Lớp 1
                    </h4>

                    {/* Tiếng Việt */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span>📚</span> Tiếng Việt (Chữ cái, vần, chính tả, đọc hiểu)
                        </span>
                        <span>
                          {report?.subjectMastery['tieng-viet'].percent ?? 0}% (
                          {report?.subjectMastery['tieng-viet'].label ?? 'Chưa làm bài'})
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${report?.subjectMastery['tieng-viet'].percent ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Toán */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span>🔢</span> Toán Học (Đếm 0-20, cộng trừ, hình học, lời văn)
                        </span>
                        <span>
                          {report?.subjectMastery['toan'].percent ?? 0}% (
                          {report?.subjectMastery['toan'].label ?? 'Chưa làm bài'})
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${report?.subjectMastery['toan'].percent ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Tiếng Anh */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span>🇬🇧</span> Tiếng Anh (Phonics, từ vựng, con vật, màu sắc)
                        </span>
                        <span>
                          {report?.subjectMastery['english'].percent ?? 0}% (
                          {report?.subjectMastery['english'].label ?? 'Chưa làm bài'})
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${report?.subjectMastery['english'].percent ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4">
                  {/* Pedagogical Advice */}
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                    <h4 className="text-sm font-black text-amber-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      Gợi Ý Phương Pháp Cho Ba Mẹ
                    </h4>
                    <ul className="space-y-2 text-xs md:text-sm text-amber-950 font-medium list-disc pl-5">
                      {report?.adviceList.map((adv, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weak Skills Overview */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                    <h4 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      Điểm Cần Cải Thiện Thêm
                    </h4>
                    {report && report.weakSkills.length > 0 ? (
                      <div className="space-y-2">
                        {report.weakSkills.map((sk) => (
                          <div
                            key={sk.skillId}
                            className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-rose-900">{sk.skillName}</span>
                            <span className="text-rose-700 font-semibold">
                              Làm đúng {sk.correctCount}/{sk.attempts} lần
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 font-medium">
                        Hiện tại bé chưa có kỹ năng nào bị yếu nghiêm trọng. Hệ thống sẽ tiếp tục theo dõi sát sao!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reading' && (
                <div className="space-y-5">
                  {readingReport && readingReport.totalSessions > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                          <span className="text-xs text-sky-700 font-semibold block">Chỉ số đọc</span>
                          <span className="text-2xl font-black text-sky-900 tabular-nums">
                            {readingReport.readingIndex}/100
                          </span>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                          <span className="text-xs text-emerald-700 font-semibold block">
                            Đọc chính xác
                          </span>
                          <span className="text-2xl font-black text-emerald-900 tabular-nums">
                            {readingReport.accuracyIndex}%
                          </span>
                        </div>
                        <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                          <span className="text-xs text-violet-700 font-semibold block">
                            Hiểu nội dung
                          </span>
                          <span className="text-2xl font-black text-violet-900 tabular-nums">
                            {readingReport.comprehensionIndex}%
                          </span>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                          <span className="text-xs text-amber-700 font-semibold block">
                            Tốc độ đọc
                          </span>
                          <span className="text-2xl font-black text-amber-900 tabular-nums">
                            {readingReport.wordsPerMinute > 0
                              ? `${readingReport.wordsPerMinute} từ/phút`
                              : 'Chưa đo'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl">
                        <span className="font-black text-sky-950 block">{readingReport.headline}</span>
                        <span className="text-sm text-sky-900">{readingReport.encouragement}</span>
                        <p className="text-xs text-sky-800 mt-2">
                          Bước đang luyện: <strong>{readingReport.currentStageLabel}</strong> ·{' '}
                          {readingReport.totalSessions} lượt · chính xác trung bình{' '}
                          {readingReport.averageAccuracy}%
                        </p>
                      </div>

                      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2">
                        <h4 className="text-sm font-black text-slate-900">Tiến bộ theo bậc thang</h4>
                        {readingReport.stageRows.map((row) => (
                          <div key={row.stage} className="text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className={row.unlocked ? 'text-slate-800' : 'text-slate-400'}>
                                {row.completed ? '✅' : row.unlocked ? '🔓' : '🔒'} {row.label}
                              </span>
                              <span className="tabular-nums text-slate-600">
                                {row.accuracy}% / chuẩn {row.gate}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full ${row.completed ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                style={{ width: `${Math.min(100, row.accuracy)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {readingReport.skillRows.length > 0 && (
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2">
                          <h4 className="text-sm font-black text-slate-900">Kỹ năng đọc chi tiết</h4>
                          {readingReport.skillRows.map((row) => (
                            <div
                              key={row.skillId}
                              className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                            >
                              <span className="font-bold text-slate-700">{row.skillName}</span>
                              <span className="tabular-nums text-slate-600">
                                {row.accuracy}% ({row.attempts} lượt)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                        <h4 className="text-sm font-black text-amber-900 mb-2">
                          Gợi ý cho ba mẹ về việc đọc
                        </h4>
                        <ul className="space-y-2 text-xs md:text-sm text-amber-950 list-disc pl-5">
                          {readingReport.adviceList.map((adv, i) => (
                            <li key={i}>{adv}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      Bé chưa có lượt luyện đọc nào. Mời bé mở chuyên đề “Luyện Đọc” ở trang chủ và
                      đọc một đoạn văn ngắn để bắt đầu.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'competition' && (
                <div className="space-y-5">
                  {/* Summary metric banner */}
                  {(() => {
                    const compStore = StorageService.getCompetitionHistory();
                    const exams = compStore.examResults;
                    const avgAcc =
                      exams.length > 0
                        ? Math.round(exams.reduce((sum, e) => sum + e.accuracy, 0) / exams.length)
                        : 0;

                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <span className="text-xs text-amber-700 font-bold block">Bài thi đã làm</span>
                            <span className="text-2xl font-black text-amber-950 font-display mt-0.5 block">
                              {exams.length} bài
                            </span>
                          </div>

                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                            <span className="text-xs text-emerald-700 font-bold block">Chính xác trung bình</span>
                            <span className="text-2xl font-black text-emerald-950 font-display mt-0.5 block">
                              {exams.length > 0 ? `${avgAcc}%` : 'Chưa thi'}
                            </span>
                          </div>

                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl col-span-2 sm:col-span-1">
                            <span className="text-xs text-purple-700 font-bold block">Thử thách tốc độ</span>
                            <span className="text-2xl font-black text-purple-950 font-display mt-0.5 block">
                              {compStore.speedTrialsCompleted} lượt
                            </span>
                          </div>
                        </div>

                        {/* Recent Exam History */}
                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            Nhật Ký Các Lần Thi Thử Của Bé
                          </h4>

                          {exams.length > 0 ? (
                            <div className="space-y-2">
                              {exams.map((ex, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800">{ex.examTitle}</span>
                                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-600">
                                        {new Date(ex.timestamp).toLocaleDateString('vi-VN')}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500">
                                      Thời gian: {Math.floor(ex.timeUsedSeconds / 60)}m {ex.timeUsedSeconds % 60}s • {ex.speedLabel}
                                    </span>
                                  </div>

                                  <div className="text-right">
                                    <span className="font-black text-sm text-amber-900 block font-display">
                                      {ex.score}/10
                                    </span>
                                    <span className="text-[11px] font-bold text-emerald-700">
                                      {ex.accuracy}% đúng
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">
                              Bé chưa tham gia bài thi thử nào trong Đấu Trường.
                            </p>
                          )}
                        </div>

                        {/* Psychological Guidance for Parents */}
                        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-1.5 text-xs text-sky-950">
                          <span className="font-black block text-sky-900">
                            💡 Định hướng thi thử lành mạnh cho học sinh lớp 1:
                          </span>
                          <p>
                            • Mục tiêu thi thử là giúp bé quen dần với dạng bài, rèn sự tập trung và biết cách phân bổ thời gian.
                          </p>
                          <p>
                            • Tuyệt đối không tạo áp lực điểm số hoặc so sánh thứ hạng với các bạn khác. Mỗi tiến bộ nhỏ của con đều đáng được ghi nhận!
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'kidbox' && (
                <KidBoxParentPanel onDataChanged={onDataReset} />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-5">
                  {/* Daily Screen Time Limit */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Giới Hạn Thời Gian Học Hàng Ngày
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Khuyến nghị từ chuyên gia: Trẻ 6–7 tuổi chỉ nên học trên màn hình 15–20 phút/ngày để bảo vệ mắt.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {[10, 15, 20, 30, 0].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => handleUpdateLimit(mins)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            settings.dailyLimitMinutes === mins
                              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {mins === 0 ? 'Không giới hạn' : `${mins} phút`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sound & Voice Controls */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-indigo-600" />
                      Âm Thanh & Giọng Đọc
                    </h4>

                    <div className="flex items-center justify-between py-2 border-b border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">Hiệu ứng âm thanh</span>
                        <span className="text-slate-500">Tiếng chuông khi trả lời đúng/sai</span>
                      </div>
                      <button
                        onClick={handleToggleSound}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                          settings.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {settings.soundEnabled ? 'Bật' : 'Tắt'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">Giọng đọc hỗ trợ (TTS)</span>
                        <span className="text-slate-500">Đọc to câu hỏi Tiếng Việt và Tiếng Anh</span>
                      </div>
                      <button
                        onClick={handleToggleVoice}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                          settings.voiceEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {settings.voiceEnabled ? 'Bật' : 'Tắt'}
                      </button>
                    </div>
                  </div>

                  {/* Data & Safety Management */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-sm font-black text-slate-800 mb-2">Quản Lý Dữ Liệu</h4>

                    {resetSuccessMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{resetSuccessMessage}</span>
                      </div>
                    )}

                    {showSeedConfirm ? (
                      <div className="p-3 bg-indigo-50 border border-indigo-300 rounded-xl text-xs space-y-2">
                        <p className="font-bold text-indigo-900">
                          ⚠️ Thao tác này sẽ GHI ĐÈ hồ sơ hiện tại bằng dữ liệu mẫu. Các số liệu mẫu sẽ
                          được ghi rõ là “dữ liệu thử nghiệm” trong mọi báo cáo để ba mẹ không bị nhầm
                          là tiến bộ thật của bé.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSeedDemoData}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Xác nhận nạp dữ liệu mẫu
                          </button>
                          <button
                            onClick={() => setShowSeedConfirm(false)}
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {showResetConfirm ? (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-2">
                        <p className="font-bold text-rose-800">
                          ⚠️ Ba mẹ có chắc chắn muốn đặt lại toàn bộ tiến độ học tập của bé về ban đầu?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmReset}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Xác nhận đặt lại
                          </button>
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={handleExportData}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-500" />
                          Xuất file (.json)
                        </button>

                        <button
                          onClick={() => setShowSeedConfirm(true)}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition-all cursor-pointer"
                          title="Tạo hồ sơ học mẫu để xem đầy đủ biểu đồ và khuyến nghị sư phạm"
                        >
                          <BarChart3 className="w-4 h-4 text-indigo-500" />
                          Tạo dữ liệu thử nghiệm
                        </button>

                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-700 transition-all ml-auto cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Đặt lại tiến độ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
