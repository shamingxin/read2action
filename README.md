This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## AI 分析接口（1.1 服务端）

`POST /api/analyze` 为 **服务端** OpenAI-compatible `chat/completions` 封装；密钥 **仅** 通过环境变量在服务端读取，**不会**进入客户端 bundle。

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `AI_API_KEY` | 是 | Bearer Token，对应兼容接口的 API Key |
| `AI_MODEL` | 是 | 模型 id，如 `gpt-4o-mini` |
| `AI_BASE_URL` | 否 | 兼容网关根 URL；**未设置**时默认 `https://api.openai.com/v1`（将请求 `…/chat/completions`） |

复制仓库根目录 [`.env.example`](./.env.example) 为 `.env.local` 并填写；**切勿**将含真实密钥的文件提交到 Git。

### curl 示例

```bash
curl -sS -X POST "http://localhost:3000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text":"这里是一段需要解析的纯文本……"}'
```

成功时 HTTP `200`，JSON 含 `ok: true` 与 `data`（结构化结果）。错误时见接口返回的 `ok: false` 与 `error.code`。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
