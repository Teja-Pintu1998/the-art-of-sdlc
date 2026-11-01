"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";

type Props = {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
  /**
   * Where focus goes on close. Safari doesn't focus a button when it's clicked, so "whatever had
   * focus when the dialog opened" isn't reliable for click-opened dialogs.
   */
  returnFocusTo?: () => HTMLElement | null | undefined;
};

/**
 * A small centred modal (celebration, reset). Traps focus, closes on Escape or a backdrop click,
 * focuses its first `[data-autofocus]` element, and returns focus to whatever opened it
 * (docs/07-ux-design.md: dialogs return focus to the control that opened them).
 */
export function ModalDialog({ labelledBy, onClose, children, testId, returnFocusTo }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const returnRef = useRef(returnFocusTo);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>("[data-autofocus]");
    (first ?? ref.current)?.focus();
    const target = returnRef.current;
    return () => (target?.() ?? opener)?.focus?.();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = ref.current?.querySelectorAll<HTMLElement>("button, [href]");
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-4" data-no-pan>
      <div className="absolute inset-0 bg-background/75" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        data-testid={testId}
        className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

export const buttonClass =
  "rounded-lg px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300";
