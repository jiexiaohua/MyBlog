# 小花的航海日志

Next.js 个人博客，包含互动首页、文章列表、Markdown 文章页和受保护的管理员发文入口。

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

访问：

- 首页：http://localhost:3000
- 博客：http://localhost:3000/blog
- 发文：http://localhost:3000/admin

## 发文权限

`/admin` 使用 `BLOG_ADMIN_PASSWORD` 登录，登录成功后由服务端设置 HTTP-only 会话 cookie。`/api/posts` 会校验签名会话和同源请求，其它访客无法直接写文章。

## 内容目录

默认文章目录是 `content/posts`。生产环境可以设置：

```bash
BLOG_CONTENT_DIR=/var/www/myblog/content/posts
```

这样后续重新部署应用代码时，不会覆盖服务器上后台发布的新文章。

## 验证

```bash
pnpm test
pnpm lint
pnpm build
```

## 部署形态

生产构建使用 Next.js `output: "standalone"`，推荐在服务器上由 PM2 运行 standalone `server.js`，Nginx 监听 80 端口并代理到 `127.0.0.1:3000`。

## 图片来源

路飞头像来自 PNG Mart：`https://www.pngmart.com/image/10185`，页面标注为个人使用图片。
