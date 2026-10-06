import React, { useEffect, useState } from 'react';
import { onServiceWorkerUpdate } from '../../services/pwa';

/**
 * UPDATE BANNER (§11 — safe update model)
 *
 * The service worker activates new versions immediately (skipWaiting + claim),
 * so no user is ever trapped on an obsolete build. But the open page still
 * runs the OLD bundle until it reloads. This banner tells the page a new
 * version is live and offers a reload — at a moment the child (or parent)
 * chooses, never mid-question and never forced.
 *
 * It is deliberately a plain button a 6-year-old can understand, plus a
 * dismiss that a parent can reach later from …there is no later: dismissed
 * state is per-page-view, so the banner returns on the next visit and the
 * update can never be lost either.
 */
export const UpdateBanner: React.FC = () => {
  const [version, setVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => onServiceWorkerUpdate((v) => setVersion(v)), []);

  if (!version || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="update-banner"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pl-4 pr-2 py-2 bg-emerald-600 text-white rounded-2xl shadow-xl max-w-[calc(100vw-2rem)]"
    >
      <span className="text-sm font-bold">🎁 Có bản mới của Kho Báu!</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 min-h-[44px] bg-white text-emerald-700 font-black text-sm rounded-xl active:scale-95"
      >
        Tải lại
      </button>
      <button
        type="button"
        aria-label="Để sau"
        onClick={() => setDismissed(true)}
        className="px-3 py-2 min-h-[44px] min-w-[44px] text-emerald-100 font-black rounded-xl active:scale-95"
      >
        ✕
      </button>
    </div>
  );
};
