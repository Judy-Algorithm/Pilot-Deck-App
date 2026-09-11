import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Later · 在重要的时候想起来",
  description: "保存凭证，记住期限。在重要的时候，想起重要的东西。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
