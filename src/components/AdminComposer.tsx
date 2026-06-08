"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import {
  FilePlus2,
  ImagePlus,
  LogIn,
  LogOut,
  Save,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

type AdminPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
  content: string;
};

type EditorMode = "create" | "edit";

type PostForm = {
  title: string;
  excerpt: string;
  tags: string;
  featured: boolean;
  body: string;
};

const emptyForm: PostForm = {
  title: "",
  excerpt: "",
  tags: "",
  featured: false,
  body: "# 新文章\n\n从这里开始写。",
};

function postToForm(post: AdminPost): PostForm {
  return {
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags.join(", "),
    featured: post.featured,
    body: post.content,
  };
}

function formToPayload(form: PostForm) {
  return {
    title: form.title,
    excerpt: form.excerpt,
    body: form.body,
    featured: form.featured,
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

export function AdminComposer() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [mode, setMode] = useState<EditorMode>("create");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);

  async function loadPosts() {
    const response = await fetch("/api/posts");

    if (!response.ok) {
      setStatus("文章列表加载失败");
      return;
    }

    const payload = (await response.json()) as { posts: AdminPost[] };
    setPosts(payload.posts);
  }

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
    await loadPosts();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setMode("create");
    setSelectedSlug(null);
    setForm(emptyForm);
    setPosts([]);
    setStatus("已退出");
  }

  function startCreate() {
    setMode("create");
    setSelectedSlug(null);
    setForm(emptyForm);
    setStatus("新文章");
  }

  function startEdit(post: AdminPost) {
    setMode("edit");
    setSelectedSlug(post.slug);
    setForm(postToForm(post));
    setStatus(`正在编辑：${post.title}`);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus(mode === "create" ? "正在发布" : "正在保存");

    const response = await fetch(
      mode === "create" ? "/api/posts" : `/api/posts/${selectedSlug}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      },
    );

    setBusy(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus(payload?.error ?? "保存失败");
      return;
    }

    const payload = (await response.json()) as {
      post: AdminPost;
      url: string;
    };

    setStatus(mode === "create" ? "已发布" : "已保存");
    await loadPosts();

    if (mode === "create") {
      setMode("edit");
      setSelectedSlug(payload.post.slug);
      setForm(postToForm(payload.post));
    }
  }

  async function deleteSelectedPost() {
    if (!selectedSlug) {
      return;
    }

    const current = posts.find((post) => post.slug === selectedSlug);
    const confirmed = window.confirm(
      `确认删除「${current?.title ?? selectedSlug}」？这个操作会删除文章文件。`,
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setStatus("正在删除");

    const response = await fetch(`/api/posts/${selectedSlug}`, {
      method: "DELETE",
    });

    setBusy(false);

    if (!response.ok) {
      setStatus("删除失败");
      return;
    }

    startCreate();
    setStatus("已删除");
    await loadPosts();
  }

  function insertMarkdown(markdown: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setForm((current) => ({
        ...current,
        body: `${current.body}\n\n${markdown}\n`,
      }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextBody = `${form.body.slice(0, start)}${markdown}${form.body.slice(end)}`;

    setForm((current) => ({ ...current, body: nextBody }));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + markdown.length;
      textarea.selectionEnd = start + markdown.length;
    });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("图片不能超过 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    setStatus("正在上传图片");

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus(payload?.error ?? "上传失败");
      return;
    }

    const payload = (await response.json()) as { markdown: string };
    insertMarkdown(payload.markdown);
    setStatus("图片已插入正文");
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
    <section className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-[var(--ocean-dark)]">
              文章管理
            </div>
            <div className="text-xs font-bold text-[var(--muted)]">
              {posts.length} 篇文章
            </div>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--foreground)] px-3 text-sm font-black text-white"
          >
            <FilePlus2 size={17} />
            新建
          </button>
        </div>

        <div className="grid max-h-[580px] gap-2 overflow-y-auto pr-1">
          {posts.map((post) => (
            <button
              key={post.slug}
              type="button"
              onClick={() => startEdit(post)}
              className={`rounded-lg border p-3 text-left transition ${
                selectedSlug === post.slug
                  ? "border-[var(--ocean)] bg-[rgba(11,114,133,0.08)]"
                  : "border-[var(--line)] bg-[var(--paper)] hover:bg-white"
              }`}
            >
              <span className="block text-sm font-black text-[var(--foreground)]">
                {post.title}
              </span>
              <span className="mt-1 block text-xs font-bold text-[var(--muted)]">
                {post.date} / {post.slug}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-[var(--ocean-dark)]">
              {mode === "create" ? "新建文章" : "编辑文章"}
            </div>
            <h1 className="text-3xl font-black text-[var(--foreground)]">
              {mode === "create" ? "写一篇新日志" : form.title || "未命名文章"}
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
          onSubmit={save}
          className="grid gap-5 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-black text-[var(--foreground)]">
              标题
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
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
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
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
                setForm((current) => ({
                  ...current,
                  excerpt: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-[var(--line)] px-3 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
              required
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
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

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={uploadImage}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-sm font-black text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImagePlus size={17} />
                {uploading ? "上传中" : "上传图片"}
              </button>
              {mode === "edit" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={deleteSelectedPost}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[rgba(228,87,69,0.35)] bg-white px-3 text-sm font-black text-[var(--coral)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={17} />
                  删除
                </button>
              ) : null}
            </div>
          </div>

          <label className="text-sm font-black text-[var(--foreground)]">
            正文
            <textarea
              ref={textareaRef}
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              className="mt-2 min-h-[460px] w-full resize-y rounded-lg border border-[var(--line)] p-3 font-mono text-sm leading-7 outline-none transition focus:border-[var(--ocean)] focus:ring-4 focus:ring-[rgba(11,114,133,0.15)]"
              required
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[var(--muted)]">{status}</p>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--coral)] px-5 font-black text-white transition hover:bg-[#c84233] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === "create" ? <Send size={18} /> : <Save size={18} />}
              {busy ? "保存中" : mode === "create" ? "发布" : "保存"}
            </button>
          </div>

          {mode === "edit" && selectedSlug ? (
            <a
              href={`/blog/${selectedSlug}`}
              className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3 text-sm font-black text-[var(--ocean-dark)]"
            >
              查看：{form.title || selectedSlug}
            </a>
          ) : null}
        </form>
      </section>
    </section>
  );
}
