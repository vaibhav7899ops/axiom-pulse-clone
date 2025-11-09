export const metadata = {
  title: 'Axiom Pulse Clone',
  description: 'Token discovery table',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
