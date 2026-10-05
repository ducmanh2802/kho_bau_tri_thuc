import React, { useRef, useState, useEffect } from 'react';
import { GameModalWrapper } from './GameModalWrapper';
import { sound } from '../../services/sound';
import { Eraser, Trash2, CheckCircle, Palette } from 'lucide-react';

const COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#FBBF24', // Yellow
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#78350F', // Brown
  '#1F2937', // Black
];

const TEMPLATES = [
  { name: 'Ngôi Nhà Thân Thương', emoji: '🏠' },
  { name: 'Chú Gấu Nhí', emoji: '🐻' },
  { name: 'Bông Hoa Rực Rỡ', emoji: '🌸' },
  { name: 'Quả Táo Ngọt Ngào', emoji: '🍎' },
];

export const ColoringCanvasGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);

  // Canvas context setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTemplateOutline(ctx, selectedTemplate.emoji);
  }, [selectedTemplate]);

  const drawTemplateOutline = (ctx: CanvasRenderingContext2D, emoji: string) => {
    ctx.font = '120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.25;
    ctx.fillText(emoji, 250, 180);
    ctx.globalAlpha = 1.0;
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawTemplateOutline(ctx, selectedTemplate.emoji);
  };

  const stampIcon = (emoji: string) => {
    sound.playStar();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 100 + Math.random() * 300, 80 + Math.random() * 200);
  };

  const finishPainting = () => {
    sound.playCorrect();
    sound.speak('Bức tranh của bé đẹp tuyệt vời!');
    setScore(5);
    setIsGameOver(true);
  };

  const restartGame = () => {
    setScore(0);
    setIsGameOver(false);
    clearCanvas();
  };

  return (
    <GameModalWrapper
      title="Bé Tập Vẽ & Tô Màu Diệu Kỳ"
      subtitle="Thỏa sức sáng tạo sắc màu cùng cọ vẽ và hình dán đáng yêu"
      mascotEmoji="🎨"
      score={score}
      maxScore={5}
      isGameOver={isGameOver}
      onRestart={restartGame}
      onExit={onExit}
      instructions="Bé hãy chọn màu yêu thích và vẽ lên khung tranh nhé!"
      audioInstruction="Hãy chọn màu yêu thích và vẽ lên khung tranh"
    >
      <div className="w-full h-full flex flex-col justify-between items-center bg-amber-50/50 rounded-3xl p-3 md:p-5 select-none">
        {/* Template Picker & Tools Top Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-white/90 p-2.5 rounded-2xl border border-amber-200 shadow-sm">
          {/* Template select */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Mẫu:</span>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => {
                  sound.playClick();
                  setSelectedTemplate(tpl);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  selectedTemplate.name === tpl.name
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tpl.emoji}</span>
                <span className="hidden sm:inline">{tpl.name}</span>
              </button>
            ))}
          </div>

          {/* Stamps */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Dán hình:</span>
            {['⭐', '💖', '🌈', '👑'].map((icon) => (
              <button
                key={icon}
                onClick={() => stampIcon(icon)}
                className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 flex items-center justify-center text-lg active:scale-95 transition-transform"
                title="Dán hình"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Drawing Canvas Area */}
        <div className="my-auto relative rounded-2xl border-4 border-amber-300 shadow-xl overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={500}
            height={320}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-w-[500px] h-[260px] md:h-[300px] touch-none cursor-crosshair"
          />
        </div>

        {/* Colors and Brush Bottom Controls */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-white/90 p-2.5 rounded-2xl border border-amber-200 shadow-sm">
          {/* Palette */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  sound.playClick();
                  setSelectedColor(c);
                  setIsEraser(false);
                }}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  !isEraser && selectedColor === c
                    ? 'border-amber-900 scale-125 shadow-md'
                    : 'border-white hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Tools */}
          <div className="flex items-center gap-2">
            {/* Eraser */}
            <button
              onClick={() => {
                sound.playClick();
                setIsEraser(!isEraser);
              }}
              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                isEraser
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Tẩy</span>
            </button>

            {/* Clear */}
            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 text-xs font-bold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa hết</span>
            </button>

            {/* Finish */}
            <button
              onClick={finishPainting}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md font-black text-xs md:text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Hoàn thành tranh 🎨</span>
            </button>
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};
