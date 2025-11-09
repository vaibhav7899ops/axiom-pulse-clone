import TokenTable from '@/components/table/token-table';

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Axiom Pulse — Tokens</h1>
      <TokenTable />
    </main>
  );
}
