'use client';

// lib/use-price-stream.ts
import { useEffect, useRef } from 'react';

type Row = { id: string; price: number };

/**
 * Works in two ways:
 * 1) usePriceStream(rows, setRows)  // mutates prices periodically
 * 2) const { start, stop } = usePriceStream({ intervalMs, onTick })
 */
export function usePriceStream(
  rowsOrOpts?: Row[] | { intervalMs?: number; onTick?: () => void },
  maybeSetRows?: (updater: (prev: Row[]) => Row[]) => void
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const isPairForm = Array.isArray(rowsOrOpts) && typeof maybeSetRows === 'function';
    const intervalMs =
      !isPairForm && rowsOrOpts && typeof rowsOrOpts === 'object' && 'intervalMs' in rowsOrOpts
        ? rowsOrOpts.intervalMs ?? 1200
        : 1200;

    function tick() {
      if (isPairForm) {
        // Slight random walk on price for demo streaming effect
        maybeSetRows!(prev =>
          prev.map(r => {
            const base = Number.isFinite(r.price) ? r.price : 0;
            const delta = (Math.random() - 0.5) * Math.max(0.005 * base, 0.02); // ~±0.5% or a tiny bump
            const next = Math.max(0, base + delta);
            return { ...r, price: next };
          })
        );
      } else if (rowsOrOpts && typeof rowsOrOpts === 'object' && 'onTick' in rowsOrOpts && rowsOrOpts.onTick) {
        rowsOrOpts.onTick();
      }
    }

    timerRef.current = setInterval(tick, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(rowsOrOpts) ? rowsOrOpts.length : rowsOrOpts, maybeSetRows]);

  return {
    start: () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {}, 1200);
    },
    stop: () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}

export default usePriceStream;
