import type { Metadata } from "next";
import { getSiteOrigin, getSiteUrl } from "@/lib/site-config";
import "./globals.css";

export function generateMetadata(): Metadata {
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: "小花的航海日志",
      template: "%s | 小花的航海日志",
    },
    description: "一个记录技术、生活和灵感的个人博客。",
    openGraph: {
      title: "小花的航海日志",
      description: "一个记录技术、生活和灵感的个人博客。",
      url: getSiteOrigin(),
      siteName: "小花的航海日志",
      images: ["/luffy.png"],
      locale: "zh_CN",
      type: "website",
    },
  };
}

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
