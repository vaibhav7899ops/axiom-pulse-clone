import TokenTable from "@/components/table/token-table";
import HeaderBar from "@/components/ui/header-bar";

export default async function Page() {
  return (
    <main className="space-y-4">
      <HeaderBar />
      <TokenTable />
    </main>
  );
}
