import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Pemesanan Warkop",
  description: "Pesan menu warkop dengan cepat dan praktis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans">
        <main className="min-h-screen max-w-md mx-auto bg-white shadow-md relative pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
