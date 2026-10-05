import React from 'react';
import { ActiveScreen, SubjectType } from '../../types';
import { sound } from '../../services/sound';
import { ArrowLeft, Compass } from 'lucide-react';

interface WorldMapScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSelectSubject: (sub: SubjectType) => void;
}

interface MapLocation {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  mascot: string;
  color: string;
  borderColor: string;
  action: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  onNavigate,
  onSelectSubject,
}) => {
  const LOCATIONS: MapLocation[] = [
    {
      id: 'viet',
      title: 'Vương Quốc Tiếng Việt',
      subtitle: 'Lâu đài Chữ cái & Thung lũng Âm vần',
      emoji: '🏰',
      mascot: '🐻 Gấu Bút Chì',
      color: 'from-amber-400 to-orange-500',
      borderColor: 'border-amber-300',
      action: () => onSelectSubject('tieng-viet'),
    },
    {
      id: 'toan',
      title: 'Thành Phố Toán Học',
      subtitle: 'Tòa tháp Phép tính & Công viên Hình khối',
      emoji: '🏙️',
      mascot: '🦊 Cáo Toán',
      color: 'from-blue-400 to-cyan-500',
      borderColor: 'border-blue-300',
      action: () => onSelectSubject('toan'),
    },
    {
      id: 'english',
      title: 'Đảo Thần Thoại English',
      subtitle: 'Bến cảng Phonics & Vườn thú Safari',
      emoji: '🏝️',
      mascot: '🐰 Thỏ English',
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-300',
      action: () => onSelectSubject('english'),
    },
    {
      id: 'games',
      title: 'Đấu Trường Trò Chơi',
      subtitle: '10+ Mini-Game trí tuệ bổ ích',
      emoji: '🎪',
      mascot: '🦉 Cú Thông Thái',
      color: 'from-purple-400 to-pink-500',
      borderColor: 'border-purple-300',
      action: () => onNavigate('games'),
    },
    {
      id: 'review',
      title: 'Hồ Nước Ôn Tập Thông Minh',
      subtitle: 'Luyện lại câu hỏi cần nhớ',
      emoji: '🌊',
      mascot: '💡 Ngọn Hải Đăng',
      color: 'from-yellow-400 to-amber-500',
      borderColor: 'border-yellow-300',
      action: () => onNavigate('daily_review'),
    },
    {
      id: 'garden',
      title: 'Khu Vườn Thành Tích',
      subtitle: 'Huy hiệu, cúp vàng & cây tri thức',
      emoji: '🌳',
      mascot: '🌟 Ngôi Sao May Mắn',
      color: 'from-lime-400 to-green-600',
      borderColor: 'border-lime-300',
      action: () => onNavigate('achievements'),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 select-none">
      {/* Top Bar with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl font-bold text-xs md:text-sm text-amber-950 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </button>

        <div className="flex items-center gap-2 bg-white/90 px-4 py-1.5 rounded-full border border-amber-200 shadow-xs">
          <Compass className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-black text-amber-900 font-display">
            Bản Đồ Xứ Sở Tri Thức
          </span>
        </div>
      </div>

      {/* World Map Graphical Presentation */}
      <div className="relative bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 rounded-3xl p-6 md:p-8 border-4 border-amber-300 shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between">
        {/* Sky Elements */}
        <div className="absolute top-4 left-10 text-4xl opacity-70 animate-float">☁️</div>
        <div className="absolute top-8 right-16 text-5xl opacity-60 animate-float" style={{ animationDelay: '1.2s' }}>☁️</div>
        <div className="absolute top-1/2 left-4 text-3xl opacity-40">⛵</div>
        <div className="absolute bottom-8 right-8 text-4xl opacity-60">🐬</div>

        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl md:text-4xl font-black text-amber-950 font-display">
            Cuộc Phiêu Lưu Khám Phá Lớp 1
          </h2>
          <p className="text-xs md:text-sm text-slate-700 font-bold mt-1">
            Bé hãy chọn một vùng đất diệu kỳ để bắt đầu chuyến hành trình học tập!
          </p>
        </div>

        {/* Map Grid of Magical Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10 max-w-4xl mx-auto w-full">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                sound.playClick();
                loc.action();
              }}
              className={`group bg-white/95 hover:bg-white p-5 rounded-3xl shadow-xl hover:shadow-2xl border-4 ${loc.borderColor} transition-all duration-300 hover:-translate-y-1 active:scale-95 text-left flex flex-col justify-between min-h-[160px] cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-sm">
                  {loc.emoji}
                </span>
                <span className="text-[11px] font-black px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                  {loc.mascot}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 font-display mt-2 group-hover:text-amber-600 transition-colors">
                  {loc.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{loc.subtitle}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-black text-amber-700">
                  <span>Khám phá ngay</span>
                  <span>➔</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Map Footer Note */}
        <div className="mt-6 text-center text-xs font-bold text-amber-900/80 bg-white/60 py-2 px-4 rounded-full max-w-md mx-auto relative z-10 shadow-xs">
          🧭 Học xong mỗi vùng đất sẽ tích lũy chìa khóa mở kho báu trí thức!
        </div>
      </div>
    </div>
  );
};
