import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Axiom Pulse – Token Discovery (Replica)",
  description: "Pixel-perfect token discovery table replica with real-time updates."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <div className="mx-auto max-w-[1200px] px-4 py-6">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
