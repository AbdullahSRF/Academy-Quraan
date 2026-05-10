"use client";

import { useCallback, useEffect, useRef } from "react";

type Options = {
  debounceMs?: number;
  onSave: (value: string) => void | Promise<void>;
};

/**
 * Auto-save for long text fields (e.g. memorization notes).
 * Debounces updates and skips identical consecutive values.
 */
export function useAutoSave(value: string, { debounceMs = 800, onSave }: Options) {
  const lastSaved = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (value === lastSaved.current) return;
    lastSaved.current = value;
    await onSave(value);
  }, [onSave, value]);

  useEffect(() => {
    if (value === lastSaved.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flush();
    }, debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, debounceMs, flush]);

  return { flush: () => void flush() };
}
