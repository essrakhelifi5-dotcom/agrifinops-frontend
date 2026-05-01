import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agri-FinOps - B264 Dashboard",
  description: "QuickBooks Automated Ledger & Cash Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}