import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hair Salon Color Record",
  description: "A local-first workspace for hair color formulas and customer history.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
