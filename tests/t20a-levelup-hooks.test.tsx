import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { LevelUpCelebrationModal } from '../src/components/motivation/LevelUpCelebrationModal';

const emptyResult = { claimed: [], stars: 0, tickets: 0, stickerIds: [] };

function renderModal(props: Partial<React.ComponentProps<typeof LevelUpCelebrationModal>> = {}) {
  return render(
    <LevelUpCelebrationModal
      isOpen={false}
      onClose={() => {}}
      result={emptyResult}
      currentLevel={1}
      levelTitle="Tân binh"
      {...props}
    />
  );
}

describe('T20A — LevelUpCelebrationModal hook stability (bug B-02)', () => {
  afterEach(() => cleanup());

  it('opens and closes without changing the number of hooks (no React #310)', () => {
    const view = renderModal();
    const claimed = { claimed: [2], stars: 5, tickets: 1, stickerIds: ['sticker_a'] };

    // Render 1: nothing (hook #1 only). Render 2: the celebration (hook #1 + #2).
    // Before the fix this transition threw "Rendered more hooks than during the
    // previous render" and unmounted the whole app after a completed lesson.
    act(() => {
      view.rerender(
        <LevelUpCelebrationModal
          isOpen
          onClose={() => {}}
          result={claimed}
          currentLevel={2}
          levelTitle="Nhà thám hiểm"
        />
      );
    });

    expect(screen.getByRole('dialog', { name: 'Chúc mừng lên level' })).toBeTruthy();
    expect(screen.getByText(/Chúc Mừng/)).toBeTruthy();

    // Render 3: back to nothing — the hook count must shrink safely again.
    act(() => {
      view.rerender(
        <LevelUpCelebrationModal
          isOpen={false}
          onClose={() => {}}
          result={emptyResult}
          currentLevel={2}
          levelTitle="Nhà thám hiểm"
        />
      );
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders nothing until a level reward is actually claimed', () => {
    renderModal({
      isOpen: true,
      result: { claimed: [], stars: 0, tickets: 0, stickerIds: [] },
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('plays the level-up sound and confetti exactly when it opens', async () => {
    const sound = await import('../src/services/sound');
    const confetti = await import('../src/services/confetti');
    const levelUp = vi.spyOn(sound.sound, 'playLevelUp').mockImplementation(() => {});
    const fire = vi.spyOn(confetti, 'fireCelebrationConfetti').mockImplementation(() => {});

    const view = renderModal();
    expect(levelUp).not.toHaveBeenCalled();

    act(() => {
      view.rerender(
        <LevelUpCelebrationModal
          isOpen
          onClose={() => {}}
          result={{ claimed: [3], stars: 3, tickets: 0, stickerIds: [] }}
          currentLevel={3}
          levelTitle="Ca thủ"
        />
      );
    });
    expect(levelUp).toHaveBeenCalledTimes(1);
    expect(fire).toHaveBeenCalledTimes(1);
  });
});
