import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arrowstack Wholesale | B2B Order Management Platform",
  description: "Enterprise wholesale order management, atomic transactional inventory control, and automated billing fulfillment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
