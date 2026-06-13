# nianqi-chat 云函数

代理前端对话请求，在服务端持有混元 API Key，前端通过 `callFunction` 调用。

更多待办与优化项见 [`docs/BACKLOG.md`](../../docs/BACKLOG.md)。

---

## 部署方式

### 方式 A：CloudBase 网页控制台（推荐新手）

1. 控制台 → **云函数** → **新建函数**
   - 函数名：`nianqi-chat`
   - 运行时：Node.js 18
   - 入口：`index.main`
2. 将本目录 `index.js`、`prompt.js` 内容粘贴到在线编辑器
3. **函数配置 → 环境变量** 添加 `AI_API_KEY`（见下表）
4. 点击 **保存并部署**

### 方式 B：CLI 部署

```bash
npm i -g @cloudbase/cli
tcb login

# 在控制台先配置 AI_API_KEY，或部署后在控制台补充
npm run deploy:fn
```

---

## 控制台必开项

### 1. 匿名登录

**路径：** 身份认证 → 登录方式 → **匿名登录** → 开启

前端 `src/cloudbase.ts` 使用 `signInAnonymously()`，未开启会导致 `callFunction` 鉴权失败。

### 2. 云函数安全规则

**路径：** 云函数 → **安全规则**

念起 Web / Capacitor 使用匿名登录，**不要**使用默认的「排除匿名用户」规则，否则表现像「必须微信登录」。

**推荐配置（允许匿名 + 其他登录方式）：**

```json
{
  "*": {
    "invoke": "auth != null"
  }
}
```

**仅对 nianqi-chat 显式声明（可选）：**

```json
{
  "*": {
    "invoke": "auth != null"
  },
  "nianqi-chat": {
    "invoke": "auth != null"
  }
}
```

**内测临时放开（安全性较低，慎用）：**

```json
{
  "nianqi-chat": {
    "invoke": true
  }
}
```

| 规则值 | 效果 |
|--------|------|
| `"auth != null"` | 任意已登录用户（**含匿名**）✅ 念起当前方案 |
| `"auth.loginType != 'ANONYMOUS' && auth != null"` | 排除匿名，需微信/邮箱等 ❌ 与当前前端不兼容 |
| `true` | 所有人可调，含未登录 ⚠️ 仅内测 |

规则修改后约 **1～3 分钟** 生效。

---

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `AI_API_KEY` | ✅ | CloudBase API Key，**仅在控制台配置，勿提交 Git** |
| `AI_BASE_URL` | 否 | 默认 `https://tanmycloud-d4gp7dm0l1aeb4fb2.api.tcloudbasegateway.com/v1/ai/cloudbase` |
| `AI_MODEL` | 否 | 默认 `hy3-preview` |

`AI_BASE_URL` / `AI_MODEL` 已在根目录 `cloudbaserc.json` 中预置，CLI 部署时会写入；网页端创建函数时需手动添加或依赖代码内默认值。

---

## 云端测试

**路径：** 云函数 → `nianqi-chat` → **云端测试**

测试事件（对话）：

```json
{
  "emotion": "焦虑",
  "guide": "此刻，你身体里有一个声音在低语……它想告诉你什么？",
  "userName": "朋友",
  "messages": []
}
```

测试事件（觉察小结）：

```json
{
  "action": "summary",
  "emotion": "焦虑",
  "guide": "此刻，你身体里有一个声音在低语……",
  "userName": "朋友",
  "messages": [
    { "role": "assistant", "content": "胸口有感觉吗？" },
    { "role": "user", "content": "有点闷，像一团灰色的乱麻。" }
  ]
}
```

预期返回：

```json
{
  "reply": "……念念的第一句提问……"
}
```

若返回 `{ "error": "云函数未配置 AI_API_KEY …" }`，请检查环境变量。

---

## 前端配置

项目根目录 `.env.local`（不提交 Git）：

```
VITE_CLOUDBASE_ENV_ID=tanmycloud-d4gp7dm0l1aeb4fb2
```

配置完成后 `npm run dev`，进入对话页验证。

---

## 常见问题

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| `unauthorized` / 权限错误 | 安全规则排除匿名 | 改为 `"auth != null"` |
| 匿名登录失败 | 控制台未开匿名登录 | 身份认证里开启 |
| `AI_API_KEY` 相关错误 | 环境变量未配或未生效 | 控制台添加后重新部署 |
| Token 配额超限 | 混元资源包用尽 | 控制台充值或换模型 |
