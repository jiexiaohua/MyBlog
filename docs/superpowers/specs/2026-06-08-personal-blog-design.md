# Personal Blog Design

## Goal

Build a Next.js personal blog for `xiaohua.host` with a playful landing screen, a readable blog section, and an owner-only publishing workflow.

## Research Summary

- Next.js App Router Route Handlers are the correct backend surface for the publishing API.
- Route Handlers must be treated as public endpoints and must verify authorization before returning or mutating protected data.
- Runtime content reads need request-time rendering. In Next.js 16, `connection()` is the preferred way to stop prerendering before reading request-time filesystem content.
- A self-hosted Next.js app can run as a Node process behind Nginx. Standalone output keeps the runtime small, while PM2 keeps the process alive.

## Architecture

- Public entry: `/` renders an interactive straw-hat ocean landing page. The primary action enters `/blog`.
- Blog: `/blog` reads Markdown posts from `BLOG_CONTENT_DIR` or `content/posts`, lists them by date, and highlights featured posts.
- Post details: `/blog/[slug]` reads one Markdown file by slug and renders Markdown with GFM support.
- Admin: `/admin` shows a password login and article composer. The UI never receives the admin password after login.
- API: `/api/admin/login` creates an HTTP-only signed cookie. `/api/posts` rejects unauthenticated or cross-origin writes.
- Deployment: Nginx listens on port 80 for `xiaohua.host` and proxies to a PM2-managed Next.js process on port 3000.

## Content Model

Each article is a Markdown file with front matter:

```yaml
---
title: "Article title"
date: "2026-06-08"
excerpt: "Short summary"
tags: ["Next.js", "Life"]
featured: true
---
```

The file body is regular Markdown. Slugs are generated from the title and de-duplicated on write.

## Security

- Admin password and session secret live only in environment variables.
- Sessions are signed with HMAC SHA-256 and stored in an HTTP-only cookie.
- Publishing checks the signed session, validates input with Zod, rejects path traversal by controlling slug creation, and checks request origin when an origin is present.
- This is owner-only personal publishing, not multi-user auth.

## Testing

- Unit tests cover Markdown parsing, slug generation, post writing, and session token verification.
- Production validation runs `pnpm test`, `pnpm lint`, and `pnpm build`.
