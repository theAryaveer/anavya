import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anavya — Your Personal Book Stream",
  description: "Discover, search and save personalized book recommendations with a live backend and persistent reader profile.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
