"use client";

import { FormEvent, useState } from "react";
import { LogIn, LogOut, Send, ShieldCheck } from "lucide-react";

type PublishResult = {
  url: string;
  title: string;
};

export function AdminComposer() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    tags: "",
    featured: false,
    body: "# 新文章\n\n从这里开始写。",
  });

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("正在验证");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setAuthenticated(false);
      setStatus("验证失败");
      return;
    }

    setPassword("");
    setAuthenticated(true);
    setStatus("已进入");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setStatus("已退出");
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPublishing(true);
    setStatus("正在发布");
    setResult(null);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        excerpt: form.excerpt,
        body: form.body,
        featured: form.featured,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    });

    setPublishing(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus(payload?.error ?? "发布失败");
      return;
    }

    const payload = (await response.json()) as {
      post: { title: string };
      url: string;
    };
    setStatus("已发布");
    setResult({ title: payload.post.title, url: payload.url });
    setForm({
      title: "",
      excerpt: "",
      tags: "",
      featured: false,
      body: "# 新文章\n\n从这里开始写。",
    });
  }

  if (!authenticated) {
    return (
      <form
        onSubmit={login}
        className="mx-auto w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-2 text-lg font-black">
          <ShieldCheck size={21} />
          管理员入口
        </div>
        <label className="block text-sm font-black text-[var(--foreground)]">
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] px-3 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-4 font-black text-white transition hover:bg-[var(--ocean-dark)]"
        >
          <LogIn size={18} />
          进入
        </button>
        {status ? (
          <p className="mt-4 text-sm font-bold text-[var(--muted)]">{status}</p>
        ) : null}
      </form>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-[var(--ocean-dark)]">
            已验证
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)]">
            写一篇新日志
          </h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-black text-[var(--foreground)]"
        >
          <LogOut size={17} />
          退出
        </button>
      </div>

      <form
        onSubmit={publish}
        className="grid gap-5 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black text-[var(--foreground)]">
            标题
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] px-3 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
              required
            />
          </label>

          <label className="text-sm font-black text-[var(--foreground)]">
            标签
            <input
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] px-3 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
              placeholder="Next.js, Life"
            />
          </label>
        </div>

        <label className="text-sm font-black text-[var(--foreground)]">
          摘要
          <input
            value={form.excerpt}
            onChange={(event) =>
              setForm((current) => ({ ...current, excerpt: event.target.value }))
            }
            className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] px-3 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
            required
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                featured: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-[var(--coral)]"
          />
          精选文章
        </label>

        <label className="text-sm font-black text-[var(--foreground)]">
          正文
          <textarea
            value={form.body}
            onChange={(event) =>
              setForm((current) => ({ ...current, body: event.target.value }))
            }
            className="mt-2 min-h-[420px] w-full resize-y rounded-lg border border-[var(--line)] p-3 font-mono text-sm leading-7 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
            required
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-[var(--muted)]">{status}</p>
          <button
            type="submit"
            disabled={publishing}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--coral)] px-5 font-black text-white transition hover:bg-[#c84233] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={18} />
            {publishing ? "发布中" : "发布"}
          </button>
        </div>

        {result ? (
          <a
            href={result.url}
            className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3 text-sm font-black text-[var(--ocean-dark)]"
          >
            查看：{result.title}
          </a>
        ) : null}
      </form>
    </section>
  );
}
