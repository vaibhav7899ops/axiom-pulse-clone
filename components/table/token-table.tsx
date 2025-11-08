"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { TokenRow } from "@/types/token";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchTokens } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/components/util/redux-hooks";
import { setSort } from "@/store/slices/table-slice";
import { usePriceStream } from "@/lib/use-price-stream";
import * as Dialog from "@radix-ui/react-dialog";

function formatUSD(n:number) {
  return n>=1e9? `$${(n/1e9).toFixed(2)}B` : n>=1e6? `$${(n/1e6).toFixed(2)}M` : `$${n.toLocaleString()}`;
}

export default function TokenTable() {
  const [page, setPage] = useState(1);
  const { segment, sortBy, query } = useAppSelector(s=>s.table);
  const show = useAppSelector(s=>s.ui.showColumns);
  const dispatch = useAppDispatch();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["tokens", page],
    queryFn: () => fetchTokens(page, 20),
    placeholderData: keepPreviousData,
  });

  const [rows, setRows] = useState<TokenRow[]>([]);

  // Merge pages progressively
  useEffect(()=>{
    if (data?.rows) {
      setRows(prev => {
        const merged = page === 1 ? data.rows as TokenRow[] : [...prev, ...data.rows as TokenRow[]];
        return merged;
      });
    }
  }, [data, page]);

  // Realtime price flash
  const [flash, setFlash] = useState<Record<string,"up"|"down"|null>>({});
  const onTick = useCallback(({ id, price, change1h }: { id:string; price:number; change1h:number }) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const dir = price > r.price ? "up" : price < r.price ? "down" : null;
      if (dir) setFlash(f => ({...f, [id]: dir}));
      return { ...r, price, change1h };
    }));
    setTimeout(()=>setFlash(f=>({...f, [id]: null})), 500);
  }, []);
  usePriceStream(onTick);

  // Columns
  const columns = useMemo<ColumnDef<TokenRow>[]>(()=>{
    const base: ColumnDef<TokenRow>[] = [
      { accessorKey: "symbol", header: "Token", cell: ({ row }) => (
          <div className="flex items-center gap-2 col-symbol">
            <div className="size-6 rounded-full bg-white/10" />
            <div>
              <div className="font-medium">{row.original.symbol}</div>
              <div className="text-xs text-sub">{row.original.name}</div>
            </div>
          </div>
        )
      },
      show.price ? { accessorKey: "price", header: "Price", cell: ({ row }) => (
          <div className={`col-price rounded-md ${flash[row.original.id]==="up"?"flash-up":flash[row.original.id]==="down"?"flash-down":""}`}>
            ${row.original.price.toFixed(2)}
          </div>
        ) } : null,
      show.change ? { accessorKey: "change1h", header: "1h", cell: ({ row }) => (
          <span className={`col-change ${row.original.change1h>=0?"text-up":"text-down"}`}>
            {row.original.change1h>=0?"+":""}{row.original.change1h.toFixed(2)}%
          </span>
        ) } : null,
      show.volume ? { accessorKey: "volume24h", header: "Vol 24h", cell: ({ row }) => (
          <span className="col-volume">{formatUSD(row.original.volume24h)}</span>
        ) } : null,
      show.liq ? { accessorKey: "liquidity", header: "Liquidity", cell: ({ row }) => (
          <span className="col-liq">{formatUSD(row.original.liquidity)}</span>
        ) } : null,
      show.mcap ? { accessorKey: "mcap", header: "Mkt Cap", cell: ({ row }) => (
          <span className="col-mcap">{formatUSD(row.original.mcap)}</span>
        ) } : null,
      show.age ? { accessorKey: "ageMins", header: "Age", cell: ({ row }) => (
          <span className="col-age">{row.original.ageMins}m</span>
        ) } : null,
    ].filter(Boolean) as ColumnDef<TokenRow>[];
    return base;
  }, [show, flash]);

  const [sorting, setSorting] = useState<SortingState>(sortBy ? [{ id: sortBy.id, desc: sortBy.desc }] : []);
  useEffect(()=>{
    if (sorting[0]) dispatch(setSort({ id: sorting[0].id, desc: sorting[0].desc! }));
  }, [sorting, dispatch]);

  const filtered = useMemo(()=>rows.filter(r => r.segment === segment && (
    !query ||
    r.symbol.toLowerCase().includes(query.toLowerCase()) ||
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.id.toLowerCase().includes(query.toLowerCase())
  )), [rows, segment, query]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false
  });

  if (isError) {
    return <div className="card p-6 text-red-300">Error: {(error as Error).message}</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="text-sm text-sub">
          {isFetching ? "Updating…" : `${filtered.length} results`}
        </div>
        <button
          className="btn"
          disabled={!data?.nextPage}
          onClick={()=> setPage(p => data?.nextPage ? data.nextPage : p)}
        >
          {data?.nextPage ? "Load more" : "All loaded"}
        </button>
      </div>
      <div className="divide-y divide-white/5">
        <div className="grid grid-cols-[120px_120px_110px_140px_120px_140px_100px] gap-3 px-3 py-2 text-sub text-xs">
          {table.getHeaderGroups().map(hg => hg.headers.map(h => (
            <button
              key={h.id}
              className="text-left hover:text-ink/90"
              onClick={h.column.getToggleSortingHandler()}
              aria-label={`Sort by ${String(h.column.columnDef.header)}`}
            >
              {String(h.column.columnDef.header)}
              {h.column.getIsSorted() ? (h.column.getIsSorted()==="desc" ? " ▼" : " ▲") : ""}
            </button>
          )))}
        </div>
        {isLoading && Array.from({length:10}).map((_,i)=>(
          <div key={i} className="grid grid-cols-[120px_120px_110px_140px_120px_140px_100px] gap-3 px-3 py-3">
            {Array.from({length:7}).map((__,j)=>(<div key={j} className="skeleton h-8 rounded-md" />))}
          </div>
        ))}
        {!isLoading && table.getRowModel().rows.map(r => (
          <Dialog.Root key={r.id}>
            <Dialog.Trigger asChild>
              <button className="grid grid-cols-[120px_120px_110px_140px_120px_140px_100px] gap-3 px-3 py-3 w-full hover:bg-white/5 transition-colors">
                {r.getVisibleCells().map(c => (
                  <div key={c.id} className="truncate">{c.renderValue() as any}</div>
                ))}
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 card p-5 w-[520px] max-w-[95vw]">
                <Dialog.Title className="text-lg font-semibold mb-2">{r.original.name} ({r.original.symbol})</Dialog.Title>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="chip">Price: ${r.original.price.toFixed(2)}</div>
                  <div className="chip">1h: {r.original.change1h>=0?"+":""}{r.original.change1h}%</div>
                  <div className="chip">Volume 24h: {formatUSD(r.original.volume24h)}</div>
                  <div className="chip">Liquidity: {formatUSD(r.original.liquidity)}</div>
                  <div className="chip">Mkt Cap: {formatUSD(r.original.mcap)}</div>
                  <div className="chip">Age: {r.original.ageMins}m</div>
                </div>
                <div className="mt-4 text-sub text-xs">Demo modal (details / quick actions)</div>
                <div className="mt-4 flex justify-end">
                  <Dialog.Close className="btn">Close</Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        ))}
      </div>
    </div>
  );
}
