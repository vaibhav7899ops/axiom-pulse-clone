# Axiom Pulse – Token Discovery Table (Replica)

Pixel‑perfect (≤ 2px) replica of Axiom Trade's Pulse token discovery table using **Next.js 14 App Router + TypeScript + Tailwind**, with **Redux Toolkit** for UI state, **React Query** for data, **Radix UI** for a11y components, and a **WebSocket‑mock** for real‑time price updates.

## Features
- Segments: **New Pairs**, **Final Stretch**, **Migrated**
- Sorting via TanStack Table, column toggles (Popover), tooltips, modal row details
- Real‑time price updates with smooth **up/down flash** transitions
- Loading states: route `loading.tsx`, row **skeleton shimmer**, **progressive pagination**
- Error boundaries: route `error.tsx`
- Responsive down to **320px** (hides heavy columns), no layout shifts (fixed widths)
- Performance: memoized cells, SSR, minimal re‑renders, explicit sizes
- Visual Regression: **Playwright** `toHaveScreenshot` with **≤2px diff**

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:3000
```

## Visual Regression (≤2px)
Start dev server then run:
```bash
pnpm dev &
pnpm test:vr
```

## Lighthouse ≥90 (mobile & desktop)
- Server-rendered markup, fixed column widths to avoid CLS
- Minimal JS on first paint, tailwind JIT
- Pre-sized avatars, no blocking fonts
- Tip: Use Chrome Lighthouse (incognito) and ensure devtools throttling disabled for final score.

## Structure
```text
app/
  page.tsx            # Pulse table route
  loading.tsx, error.tsx
  api/tokens/route.ts # mock data paging
components/
  providers.tsx
  table/token-table.tsx
  ui/header-bar.tsx
  util/redux-hooks.ts
store/
  slices/ui-slice.ts, table-slice.ts
lib/
  api.ts, use-price-stream.ts
types/token.ts
```

## Swapping the WebSocket mock
Replace `usePriceStream` with a real `WebSocket('wss://your-feed')` and keep the same `onTick` payload `{ id, price, change1h }`.

## Notes on Pixel-Perfection
- Fixed column widths match Axiom layout and prevent layout shift
- Colors chosen to visually match (tune in `tailwind.config.ts`)
- Use Playwright snapshots to verify ≤2px diff
- Adjust font sizing/letter‑spacing in `globals.css` if you need tighter match
```

## Vercel Deployment
1. Push to GitHub
2. Import repo on Vercel
3. Set **Build Command**: `npm run build` and **Output**: `.next`
4. Add Playwright to dev deps (already included) for on‑PR preview VR tests (optional)
