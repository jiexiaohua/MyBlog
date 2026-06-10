"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type LandingPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export function LandingExperience({
  latestPosts,
}: {
  latestPosts: LandingPost[];
}) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const compassStyle = useMemo(
    () => ({
      transform: `rotate(${pointer.x * 8}deg) translateY(${pointer.y * 4}px)`,
    }),
    [pointer.x, pointer.y],
  );

  return (
    <main
      className="ocean-grid relative min-h-screen overflow-hidden text-white"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        });
      }}
    >
      <div className="wave-line absolute inset-x-0 bottom-0 h-28 opacity-25 animate-drift" />
      <div className="absolute left-[8%] top-[16%] h-24 w-24 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm" />
      <div className="absolute right-[10%] top-[10%] h-16 w-40 rotate-6 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm" />
      <div className="absolute bottom-[18%] left-[22%] h-12 w-32 -rotate-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 py-8 md:grid-cols-[1.02fr_0.98fr] md:px-10">
        <div className="z-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/12 px-3 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur">
            <Sparkles size={16} />
            小花的航海日志
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            把灵感写进风里，
            <span className="block text-[#ffd166]">把日常装进口袋。</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
            这里会收集技术实践、生活片段和一些突然冒出来的想法。先登船，再慢慢翻日志。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className="animate-pulse-ring inline-flex h-12 items-center gap-2 rounded-lg bg-[#ffd166] px-5 text-base font-black text-[#172026] shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/35"
            >
              开始航行
              <ArrowRight size={19} />
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className="mt-8 grid max-w-2xl gap-2">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-lg border border-white/22 bg-[#172026]/32 px-4 py-3 text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-[#172026]/42"
                >
                  <span className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-white/70">
                    <CalendarDays size={13} />
                    {post.date}
                  </span>
                  <span className="block text-base font-black text-white group-hover:text-[#ffd166]">
                    {post.title}
                  </span>
                  <span className="mt-1 line-clamp-1 block text-sm font-semibold text-white/70">
                    {post.excerpt}
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 min-h-[520px]">
          <div
            className="absolute right-2 top-4 hidden h-24 w-24 items-center justify-center rounded-lg border border-white/35 bg-white/12 text-[#ffd166] shadow-lg backdrop-blur md:flex"
            style={compassStyle}
          >
            <Compass size={58} strokeWidth={1.4} />
          </div>
          <div className="animate-bob absolute bottom-0 left-1/2 w-[min(78vw,460px)] -translate-x-1/2 md:left-[48%]">
            <Image
              src="/luffy.png"
              alt="路飞头像"
              width={576}
              height={898}
              priority
              className="h-auto w-full drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)]"
            />
          </div>
          <div className="absolute bottom-10 left-2 rounded-lg border border-white/30 bg-[#172026]/38 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur">
            xiaohua.host
          </div>
        </div>
      </section>
    </main>
  );
}
