# Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a Next.js personal blog with protected owner publishing.

**Architecture:** Use App Router pages for the public site, Route Handlers for login and publishing, filesystem Markdown for posts, and PM2 plus Nginx for self-hosting.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, gray-matter, react-markdown, Vitest, PM2, Nginx.

---

### Task 1: Content And Auth Core

**Files:**
- Create: `src/lib/posts.ts`
- Create: `src/lib/admin-auth.ts`
- Create: `src/lib/posts.test.ts`
- Create: `src/lib/admin-auth.test.ts`

- [ ] Write failing tests for parsing front matter, slug generation, post writing, and session verification.
- [ ] Implement the content and auth helpers.
- [ ] Run `pnpm test`.

### Task 2: Public Blog UI

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/components/LandingExperience.tsx`
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/PostCard.tsx`
- Create: `src/components/MarkdownArticle.tsx`
- Create: `content/posts/*.md`
- Create: `public/luffy.png`

- [ ] Build the playful landing page with an animated start button.
- [ ] Build the blog list and post detail pages.
- [ ] Add starter posts and the Luffy avatar asset.

### Task 3: Admin Publishing

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/components/AdminComposer.tsx`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`
- Create: `src/app/api/posts/route.ts`

- [ ] Implement password login with a signed HTTP-only cookie.
- [ ] Implement the article composer.
- [ ] Implement protected post creation.

### Task 4: Deploy And Publish

**Files:**
- Modify: `next.config.ts`
- Create: `.env.example`
- Create: `README.md`

- [ ] Enable standalone output.
- [ ] Verify with `pnpm test`, `pnpm lint`, and `pnpm build`.
- [ ] Deploy to `root@8.141.112.244`, configure Nginx for `xiaohua.host`, and run with PM2 on port 3000.
- [ ] Add GitHub remote `git@github.com:jiexiaohua/MyBlog.git`, commit, and push.
