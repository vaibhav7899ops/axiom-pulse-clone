"use client";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Popover from "@radix-ui/react-popover";
import { useAppDispatch, useAppSelector } from "@/components/util/redux-hooks";
import { setQuery, setSegment } from "@/store/slices/table-slice";
import { toggleColumn } from "@/store/slices/ui-slice";

function SegButton({ id, label }: { id: "new"|"final"|"migrated"; label: string }) {
  const dispatch = useAppDispatch();
  const segment = useAppSelector(s => s.table.segment);
  const active = segment === id;
  return (
    <button
      onClick={()=>dispatch(setSegment(id))}
      className={`btn ${active ? "ring-2 ring-accent/60" : ""}`}
    >
      {label}
    </button>
  );
}

export default function HeaderBar() {
  const dispatch = useAppDispatch();
  const show = useAppSelector(s => s.ui.showColumns);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-2xl font-semibold mr-auto">Pulse</h1>
      <div className="flex gap-2">
        <SegButton id="new" label="New Pairs" />
        <SegButton id="final" label="Final Stretch" />
        <SegButton id="migrated" label="Migrated" />
      </div>
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <input
              placeholder="Search by token or CA…"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-accent/50"
              onChange={(e)=>dispatch(setQuery(e.target.value))}
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="px-2 py-1 rounded-md bg-panel border border-white/10 text-sub text-xs">
              Type symbol, name, or contract address
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Popover.Root>
        <Popover.Trigger className="btn">Columns ▾</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={8} className="card p-3 space-y-2">
            {Object.keys(show).map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={show[k]}
                  onChange={()=>dispatch(toggleColumn(k))}
                />
                <span className="capitalize">{k}</span>
              </label>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
