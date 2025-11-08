"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, gcTime: 5 * 60 * 1000 } }
  }));
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}
