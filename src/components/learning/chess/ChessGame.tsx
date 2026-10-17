import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { sound } from '../../../services/sound';
import * as E from './chessEngine';

const PIECE_UNICODE: Record<string, string> = {
  'w-p': '♟', 'w-n': '♞', 'w-b': '♝', 'w-r': '♜', 'w-q': '♛', 'w-k': '♚',
  'b-p': '♟', 'b-n': '♞', 'b-b': '♝', 'b-r': '♜', 'b-q': '♛', 'b-k': '♚',
};

const DEPTH: Record<string, number> = { easy: 1, medium: 2, hard: 3, expert: 4 };

export const ChessGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<E.Board>(() => E.initialBoard());
  const [turn, setTurn] = useState<E.Color>('w');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legal, setLegal] = useState<E.Move[]>([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [status, setStatus] = useState('');
  const [thinking, setThinking] = useState(false);

  const reset = () => {
    setBoard(E.initialBoard());
    setTurn('w');
    setSelected(null);
    setLegal([]);
    setStatus('');
  };

  useEffect(() => {
    const over = E.isGameOver(board);
    if (over.over) setStatus(over.result);
  }, [board]);

  const doMove = (m: E.Move) => {
    const nb = E.applyMove(board, m);
    setBoard(nb);
    setSelected(null);
    setLegal([]);
    setTurn(turn === 'w' ? 'b' : 'w');
  };

  useEffect(() => {
    if (turn !== 'b' || status) return;
    setThinking(true);
    const t = setTimeout(() => {
      const mv = E.getBestMove(board, 'b', DEPTH[difficulty]);
      if (mv) doMove(mv);
      setThinking(false);
    }, 200);
    return () => clearTimeout(t);
  }, [turn, board, status, difficulty]);

  const onSquareClick = (r: number, c: number) => {
    if (status || thinking || turn !== 'w') return;
    if (selected) {
      const mv = legal.find((m) => m.to[0] === r && m.to[1] === c);
      if (mv) { sound.playClick(); doMove(mv); return; }
    }
    const p = board[r][c];
    if (p && p.color === 'w') {
      setSelected([r, c]);
      setLegal(E.legalMoves(board, [r, c]));
      sound.playClick();
    } else {
      setSelected(null);
      setLegal([]);
    }
  };

  const isLegalTarget = (r: number, c: number) => legal.some((m) => m.to[0] === r && m.to[1] === c);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { sound.playClick(); onBack(); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-2xl font-black font-display text-slate-900">♟ Chơi với máy</h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-slate-600">Độ khó:</span>
        {['easy', 'medium', 'hard', 'expert'].map((d) => (
          <button
            key={d}
            onClick={() => { sound.playClick(); setDifficulty(d); reset(); }}
            className={`px-3 py-1 rounded-xl font-bold text-sm ${difficulty === d ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Trung bình' : d === 'hard' ? 'Khó' : 'Siêu khó'}
          </button>
        ))}
        <button onClick={() => { sound.playClick(); reset(); }} className="ml-auto px-3 py-1 bg-slate-200 rounded-xl font-bold text-sm">Ván mới</button>
      </div>

      {status && <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300 font-bold text-center">{status}</div>}
      {thinking && <div className="text-center text-slate-500 font-bold">Máy đang nghĩ…</div>}

      <div className="mx-auto" style={{ width: 'min(90vw, 420px)' }}>
        <div className="grid grid-cols-8 border-4 border-slate-700 rounded-lg overflow-hidden">
          {board.map((row, r) =>
            row.map((p, c) => {
              const dark = (r + c) % 2 === 1;
              const sel = selected && selected[0] === r && selected[1] === c;
              const target = isLegalTarget(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => onSquareClick(r, c)}
                  className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl ${dark ? 'bg-slate-500' : 'bg-slate-200'} ${sel ? 'ring-4 ring-amber-400' : ''} ${target ? 'ring-4 ring-emerald-400' : ''}`}
                >
                  {p ? PIECE_UNICODE[`${p.color}-${p.type}`] : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="text-center text-sm text-slate-500 font-bold">
        Bạn chơi quân trắng. {turn === 'w' ? 'Lượt của bạn.' : 'Lượt của máy.'}
      </div>
    </div>
  );
};

export default ChessGame;
