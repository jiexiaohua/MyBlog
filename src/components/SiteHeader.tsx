import Image from "next/image";
import Link from "next/link";
import { Sailboat } from "lucide-react";
import { getSiteHost } from "@/lib/site-config";

export function SiteHeader() {
  const siteHost = getSiteHost();

  return (
    <header className="border-b border-[var(--line)] bg-[var(--paper)]/88 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/blog" className="flex items-center gap-3">
          <span className="relative h-11 w-11 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
            <Image
              src="/luffy.png"
              alt="小花头像"
              width={58}
              height={90}
              className="absolute left-1/2 top-1 h-16 w-auto -translate-x-1/2"
            />
          </span>
          <span>
            <span className="block text-sm font-black text-[var(--foreground)]">
              小花的航海日志
            </span>
            <span className="block text-xs font-semibold text-[var(--muted)]">
              {siteHost}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[var(--foreground)] transition hover:bg-white"
          >
            <Sailboat size={17} />
            首页
          </Link>
        </nav>
      </div>
    </header>
  );
}
