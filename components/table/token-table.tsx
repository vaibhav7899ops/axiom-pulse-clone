'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Row = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  volume24h: number;
  segment: 'new' | 'final' | 'migrated';
};

export default function TokenTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // fetch page 1 once
  useEffect(() => {
    fetch('/api/tokens?page=1&pageSize=20', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => setRows(d.rows ?? []))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // simple “live price” mock (random walk)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!rows.length) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRows(prev =>
        prev.map(r => {
          const base = Number.isFinite(r.price) ? r.price : 0;
          const delta = (Math.random() - 0.5) * Math.max(0.005 * base, 0.02);
          const next = Math.max(0, base + delta);
          return { ...r, price: next };
        })
      );
    }, 1200);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [rows.length]);

  const table = useMemo(() => {
    if (loading) {
      return <div className="h-24 rounded-lg bg-gray-200/60 animate-pulse" />;
    }
    if (err) {
      return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
          Failed to load: {err}
        </div>
      );
    }
    return (
      <div className="overflow-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Symbol</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">1h</th>
              <th className="px-3 py-2 text-right">Vol 24h</th>
              <th className="px-3 py-2 text-left">Segment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="even:bg-gray-50/60">
                <td className="px-3 py-2">{r.symbol}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-right">{r.price.toFixed(2)}</td>
                <td className={`px-3 py-2 text-right ${r.change1h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {r.change1h.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right">{r.volume24h.toLocaleString()}</td>
                <td className="px-3 py-2">{r.segment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [loading, err, rows]);

  return table;
}
