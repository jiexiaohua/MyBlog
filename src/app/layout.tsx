import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://xiaohua.host"),
  title: {
    default: "小花的航海日志",
    template: "%s | 小花的航海日志",
  },
  description: "一个记录技术、生活和灵感的个人博客。",
  openGraph: {
    title: "小花的航海日志",
    description: "一个记录技术、生活和灵感的个人博客。",
    url: "http://xiaohua.host",
    siteName: "小花的航海日志",
    images: ["/luffy.png"],
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
