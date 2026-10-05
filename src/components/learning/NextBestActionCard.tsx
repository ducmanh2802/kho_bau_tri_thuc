import React, { useMemo, useState } from 'react';
import { ActiveScreen, LearningAction, RecommendationExplanation } from '../../types';
import { LearningOS } from '../../services/learningOS';
import { StorageService } from '../../services/storage';
import { KidBoxStore } from '../../services/kidBoxStore';
import { buildKidBoxActions, getKnowledgeSnapshot } from '../../services/kidBoxEngine';
import { sound } from '../../services/sound';
import { ChevronRight, Lightbulb, Target, Zap } from 'lucide-react';

interface NextBestActionCardProps {
  onNavigate: (screen: ActiveScreen) => void;
}

/** Maps a Learning OS action type onto the screen that can actually run it. */
function routeFor(action: LearningAction): ActiveScreen | null {
  // A track action knows its own destination (§26: one action list, one router).
  if (action.trackId) return 'kidbox_companion';

  switch (action.type) {
    case 'LEARN':
      return action.lessonId ? 'subject' : null;
    case 'PRACTICE':
    case 'REVIEW':
    case 'SPEED_PRACTICE':
      return action.skillId?.startsWith('rf_') ? 'reading_fluency' : 'daily_review';
    case 'COMPETITION':
    case 'MOCK_EXAM':
      return 'competition';
    case 'GAME':
      return 'games';
    default:
      return null;
  }
}

const TYPE_STYLES: Record<string, string> = {
  LEARN: 'bg-blue-50 border-blue-200 text-blue-800',
  PRACTICE: 'bg-amber-50 border-amber-200 text-amber-900',
  REVIEW: 'bg-violet-50 border-violet-200 text-violet-900',
  SPEED_PRACTICE: 'bg-orange-50 border-orange-200 text-orange-900',
  GAME: 'bg-purple-50 border-purple-200 text-purple-900',
  COMPETITION: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  MOCK_EXAM: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  MAINTENANCE: 'bg-slate-50 border-slate-200 text-slate-700',
};

/**
 * "Bé nên làm gì tiếp theo?" — driven exclusively by recorded evidence via the
 * Learning OS. Never by a single score, never by an animation, never by AI.
 */
export const NextBestActionCard: React.FC<NextBestActionCardProps> = ({ onNavigate }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const store = useMemo(() => StorageService.getLearningOSStore(), []);

  const actions = useMemo(() => {
    // The Kid's Box Companion contributes its own evidence-driven actions into
    // the same ranked list — one recommendation engine, not two (§18, §26).
    const trackActions = buildKidBoxActions({
      knowledge: getKnowledgeSnapshot(),
      store: KidBoxStore.get(),
      isFatigued: store.fatigue.isFatigued,
    });
    return LearningOS.getNextBestActions(store.knowledgeStates, store.fatigue, Date.now(), trackActions).slice(0, 3);
  }, [store]);

  const explanation = useMemo<RecommendationExplanation | null>(() => {
    if (expanded === null) return null;
    const action = actions.find((a) => a.id === expanded);
    if (!action) return null;
    return LearningOS.explainRecommendation(action, store.knowledgeStates[action.skillId ?? '']);
  }, [expanded, actions, store.knowledgeStates]);

  if (actions.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl p-5 md:p-6 border-2 border-blue-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Bé Nên Làm Gì Tiếp Theo?
        </h2>
        <span className="text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
          Dựa trên {store.recentEvidences.length} lượt đã luyện
        </span>
      </div>

      <ul className="space-y-2.5">
        {actions.map((action, idx) => {
          const route = routeFor(action);
          const isOpen = expanded === action.id;
          return (
            <li
              key={action.id}
              className={`rounded-2xl border-2 ${TYPE_STYLES[action.type] ?? TYPE_STYLES.MAINTENANCE}`}
            >
              <div className="p-3.5 flex items-start gap-3">
                <span className="text-2xl shrink-0" aria-hidden="true">
                  {action.badgeEmoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                      {idx === 0 ? 'Nên làm nhất' : `Ưu tiên ${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-black bg-white/70 rounded px-1.5 py-0.5">
                      ~{action.estimatedMinutes} phút
                    </span>
                  </div>
                  <h3 className="font-black text-sm md:text-base mt-0.5">{action.title}</h3>
                  <p className="text-xs md:text-sm font-medium opacity-90 mt-0.5">
                    {action.childExplanation}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setExpanded(isOpen ? null : action.id);
                      }}
                      aria-expanded={isOpen}
                      className="min-h-[44px] px-3 rounded-xl bg-white/80 hover:bg-white text-xs font-black flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Vì sao?
                    </button>
                    {route && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onNavigate(route);
                        }}
                        className="min-h-[44px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1"
                      >
                        Bắt đầu
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isOpen && explanation && (
                <div className="px-3.5 pb-3.5">
                  <div className="rounded-xl bg-white/85 border border-black/5 p-3 text-xs space-y-1.5">
                    <p className="font-black">Lý do: {explanation.reason}</p>
                    <p className="font-bold opacity-80">Mục tiêu: {explanation.expectedGoal}</p>
                    <ul className="list-disc pl-4 space-y-0.5 opacity-80">
                      {explanation.evidence.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                    <p className="font-black flex items-center gap-1 pt-1">
                      <Zap className="w-3.5 h-3.5" />
                      Gợi ý thời lượng: {explanation.suggestedDurationMinutes} phút
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
