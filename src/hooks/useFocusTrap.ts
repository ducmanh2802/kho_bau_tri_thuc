import { useEffect, useRef } from 'react';

/** Elements that can receive keyboard focus, in DOM order. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Keeps keyboard focus inside a modal and restores it on close.
 *
 * §24 accessibility: without this, a child using Tab (or a switch-capable
 * device) can walk out of an open dialog into the page behind it, which is
 * disorienting and hides the dialog from screen-reader users.
 *
 * Usage:
 *   const ref = useFocusTrap<HTMLDivElement>(isOpen);
 *   <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}> … </div>
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    // Remember where focus came from so we can hand it back on close.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        // offsetParent === null means display:none, so it is not reachable.
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );

    // Move focus into the dialog on open. The first focusable can be painted
    // a tick later (lazy chunk, layout), so re-assert once after paint.
    const focusIntoDialog = () => {
      const items = focusables();
      const target = items[0] ?? container;
      if (document.activeElement !== target) target.focus({ preventScroll: true });
    };
    focusIntoDialog();
    const deferred = window.setTimeout(focusIntoDialog, 60);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      // Any key activity also re-asserts containment (covers focus lost to a
      // programmatic .focus() elsewhere while the dialog is open).
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.clearTimeout(deferred);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active]);

  return ref;
}