"use client";

import { useEffect, useRef, type RefObject } from "react";
import { FOCUSABLE_SELECTOR } from "@/domain/accessibility-system";

function listFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.tabIndex !== -1,
  );
}

/**
 * Trap Tab focus inside `containerRef` while `active`.
 * Restores previously focused element on deactivate.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const root = containerRef.current;
    if (!root) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    const focusables = listFocusable(root);
    const initial =
      root.querySelector<HTMLElement>("[data-autofocus]") ??
      focusables[0] ??
      root;
    initial.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !containerRef.current) return;
      const nodes = listFocusable(containerRef.current);
      if (nodes.length === 0) {
        event.preventDefault();
        containerRef.current.focus();
        return;
      }
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (current === first || !containerRef.current.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [active, containerRef]);
}
