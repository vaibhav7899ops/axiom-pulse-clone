'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

type Row = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  volume24h: number;
  segment: 'new' | 'final' | 'migrated';
};

function usePriceFlash(rows: Row[]) {
  // simple live update + flash
  const [flash, setFlash] = useState<Record<string, 'up'|'down'|undefined>>({});
  useEffect(() => {
    const t = setInterval(() => {
      const next: Record<string, 'up'|'down'|undefined> = {};
      rows.forEach(r => {
        const base = r.price ?? 0;
        const delta = (Math.random() - 0.5) * Math.max(0.005 * base, 0.02);
        const newPrice = Math.max(0, base + delta);
        next[r.id] = delta > 0 ? 'up' : 'down';
        r.price = newPrice;
      });
      setFlash(next);
      // remove flash a little later
      setTimeout(() => setFlash({}), 400);
    }, 1200);
    return () => clearInterval(t);
  }, [rows]);
  return flash;
}

export default function TokenTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const [segment, setSegment] = useState<'new'|'final'|'migrated'>('new');
  const [search, setSearch] = useState('');

  // fetch
  useEffect(() => {
    setLoading(true);
    fetch(`/api/tokens?page=1&pageSize=20`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json(): Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => setRows(d.rows ?? []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r =>
      r.segment === segment &&
      (!q || r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
    );
  }, [rows, segment, search]);

  const flash = usePriceFlash(filtered);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'volume24h', desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [modalRow, setModalRow] = useState<Row | null>(null);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: info => <span className="font-medium">{info.getValue() as string}</span>
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'price',
      header: () => <span className="inline-flex items-center gap-1 cursor-pointer">Price</span>,
      cell: info => {
        const r = info.row.original;
        const flashClass = flash[r.id] === 'up' ? 'flash-up' : flash[r.id] === 'down' ? 'flash-down' : '';
        return <div className={`text-right tabular-nums ${flashClass}`}>{(info.getValue<number>() ?? 0).toFixed(2)}</div>;
      },
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'change1h',
      header: '1h',
      cell: info => {
        const v = info.getValue<number>() ?? 0;
        const sign = v >= 0 ? '+' : '';
        return (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className={`text-right tabular-nums ${v>=0?'text-green-600':'text-red-600'}`}>
                  {sign}{v.toFixed(2)}%
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="rounded-md bg-black px-2 py-1 text-xs text-white">1h change</Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        );
      },
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'volume24h',
      header: 'Vol 24h',
      cell: info => <div className="text-right tabular-nums">{(info.getValue<number>() ?? 0).toLocaleString()}</div>,
      sortingFn: 'alphanumeric',
    },
    {
      accessorKey: 'segment',
      header: 'Segment',
      cell: info => <span className="capitalize">{info.getValue<string>()}</span>,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: info => (
        <button
          onClick={() => setModalRow(info.row.original)}
          className="rounded-md px-2 py-1 text-xs border hover:bg-gray-100"
        >
          View
        </button>
      ),
    },
  ], [flash]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Tabs + search */}
        <div className="flex w-full items-center justify-between gap-3">
          {/* segment toggles */}
          <div className="flex items-center gap-2">
            {(['new','final','migrated'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSegment(t)}
                className={`rounded-full px-3 py-1 text-sm border ${segment===t?'bg-black text-white':'hover:bg-gray-100'}`}
              >
                {t === 'new' ? 'New Pairs' : t === 'final' ? 'Final Stretch' : 'Migrated'}
              </button>
            ))}
          </div>
          {/* search */}
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search token…"
            className="w-40 md:w-72 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        {/* Columns popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="self-start md:self-auto rounded-md border px-3 py-2 text-sm hover:bg-gray-100">Columns ▾</button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="rounded-lg border bg-white p-3 shadow-lg">
              <div className="text-xs font-semibold mb-2">Toggle columns</div>
              <div className="grid grid-cols-2 gap-2">
                {table.getAllLeafColumns().filter(c=>c.id!=='actions').map(col => (
                  <label key={col.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={e => col.toggleVisibility(e.target.checked)}
                    />
                    <span className="capitalize">{col.id}</span>
                  </label>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Table / loading / error */}
      {loading ? (
        <div className="rounded-xl border p-4">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200 mb-3" />
          <div className="h-10 animate-pulse rounded bg-gray-200 mb-2" />
          <div className="h-10 animate-pulse rounded bg-gray-200 mb-2" />
          <div className="h-10 animate-pulse rounded bg-gray-200" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">Failed: {error}</div>
      ) : (
        <div className="overflow-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                      className={`px-3 py-2 text-left ${h.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === 'asc' ? ' ▲' : h.column.getIsSorted() === 'desc' ? ' ▼' : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(r => (
                <tr key={r.id} className="even:bg-gray-50/60">
                  {r.getVisibleCells().map(c => (
                    <td key={c.id} className={`px-3 py-2 ${c.column.id==='price'||c.column.id==='volume24h'||c.column.id==='change1h' ? 'text-right' : ''}`}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Row modal */}
      <Dialog.Root open={!!modalRow} onOpenChange={(o)=>!o && setModalRow(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">Token details</Dialog.Title>
            {modalRow && (
              <div className="mt-3 space-y-2 text-sm">
                <div><b>Symbol:</b> {modalRow.symbol}</div>
                <div><b>Name:</b> {modalRow.name}</div>
                <div><b>Price:</b> {modalRow.price.toFixed(2)}</div>
                <div><b>1h:</b> {modalRow.change1h.toFixed(2)}%</div>
                <div><b>Vol 24h:</b> {modalRow.volume24h.toLocaleString()}</div>
                <div><b>Segment:</b> {modalRow.segment}</div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Dialog.Close className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100">Close</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
