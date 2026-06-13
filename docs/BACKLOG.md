# 念起 · 待办与优化清单

> 最后更新：2026-06-13  
> 对话/云函数已联调通过（匿名登录 + `nianqi-chat` 代理混元）。

---

## 已完成

- [x] 图片 WebP 压缩 + 预加载 + 启动页 crossfade（dist ~3.6MB）
- [x] 卡牌切换：`img.decode()`、去掉 opacity 闪白动画
- [x] 对话接入腾讯混元（CloudBase AI 网关）
- [x] 念念人设提示词：老友风格 + 苏格拉底 / 碎片重构 / 视角转换等
- [x] API Key 迁到云函数 `nianqi-chat`，前端仅 `VITE_CLOUDBASE_ENV_ID`
- [x] 前端 `@cloudbase/js-sdk` 匿名登录 + `callFunction`（SDK 按需加载）
- [x] CloudBase 网页端：匿名登录、安全规则、`AI_API_KEY`、云端测试通过
- [x] **P0 体验三连（2026-06-13）**
  - [x] 对话 → 觉察小结：`action: summary` 云函数 + 弹窗 AI 预填
  - [x] 流式体感：混元 `stream: true` + 前端逐字展示（`revealTextProgressively`）
  - [x] 今日一卡 + 动态首页：按日种子固定卡牌、问候语/日期随系统时间
- [x] **P0 第一梯队优化（2026-06-13）**
  - [x] 今日觉察完成态：首页 banner +「回顾今天的觉察」
  - [x] 对话收束：「今天先到这里」+ 取消弹窗保留对话
  - [x] 降级文案统一：`fallback.ts` + 再试一次
  - [x] 云函数 uid 限频 + `docs/SECURITY.md` 运维清单

---

## 待办（优先）

### P0 · 代码与仓库

- [x] **提交未入库改动**：云函数、`src/ai.ts`、`src/homeUtils.ts` 等（2026-06-13）
- [x] **部署云函数**：CloudBase 控制台已更新（含 `summary` 模式与 stream 解析，联调通过）
- [ ] **部署云函数（限频版）**：控制台同步 `index.js` 限频逻辑
- [ ] **轮换 API Key**：见 [`docs/SECURITY.md`](SECURITY.md)
- [ ] **混元 Token 告警**：见 [`docs/SECURITY.md`](SECURITY.md)

### P1 · 安全与稳定性

- [x] **云函数限频**：按 `context.auth.uid` 滑动窗口（代码已内置，需重新部署）
- [ ] **控制台叠加限频**：云函数 QPS / IP 限制（可选）
- [ ] **完善 `cloudfunctions/nianqi-chat/README.md`**：补充 `action: summary` 测试事件

### P2 · 体验优化

- [ ] **真 SSE 流式**：HTTP 触发云函数 + 前端 fetch ReadableStream（进一步缩短首字等待）
- [ ] **降级文案统一**：API 失败时 `SOCRATIC` / `GUIDANCE` 本地库与念念新人设对齐
- [ ] **旧日记图片路径**：本地已存 `.png` 路径的日记项，增加 `.webp` 兼容或迁移

### P3 · 架构（可选）

- [ ] **数据上云**：日记 / 对话历史从 Capacitor Preferences 迁到 CloudBase 数据库（多设备同步）
- [ ] **用户体系**：若需绑定微信/手机号，替换纯匿名登录并收紧安全规则
- [ ] **HTTP 云函数 + 自定义域名**：若 `callFunction` 在特定环境有问题，可备 HTTP 触发方案

---

## 已知限制

| 项 | 说明 |
|----|------|
| 流式展示 | `callFunction` 不支持 SSE；当前为服务端 stream 聚合 + 前端逐字动画 |
| 匿名身份 | 换设备/清缓存后匿名 uid 变化，本地数据不自动同步 |
| 云函数冷启动 | 首条对话可能多 1～2 秒，可考虑定时预热（非必须） |
| SDK 体积 | `@cloudbase/js-sdk` 已拆独立 chunk（~742KB），仅进入对话时加载 |
| 前端 env | 仅需 `VITE_CLOUDBASE_ENV_ID`，无敏感 Key |

---

## 部署备忘

```bash
# 云函数（CLI 方式，网页端亦可手动粘贴代码）
npm i -g @cloudbase/cli && tcb login
# 控制台配置 AI_API_KEY 后：
npm run deploy:fn

# 本地开发
cp .env.example .env.local   # 填 VITE_CLOUDBASE_ENV_ID
npm run dev
```

**控制台必查：** 匿名登录已开 · 安全规则 `"auth != null"` · `nianqi-chat` 环境变量 `AI_API_KEY`

**云端测试（觉察小结）：**

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

---

## 相关文件

| 文件 | 用途 |
|------|------|
| `cloudfunctions/nianqi-chat/index.js` | 云函数入口，`chat` / `summary`，混元 stream |
| `cloudfunctions/nianqi-chat/prompt.js` | 念念系统提示词 + 觉察小结提示词 |
| `src/cloudbase.ts` | 匿名登录 + callFunction |
| `src/ai.ts` | 对话 API、觉察小结、逐字展示 |
| `src/homeUtils.ts` | 今日一卡、日期/问候语、今日日记查询 |
| `src/fallback.ts` | 离线降级与引导文案 |
| `docs/SECURITY.md` | Key 轮换、用量告警、限频说明 |
| `cloudbaserc.json` | 云函数部署配置 |
| `.env.example` | 前端环境变量模板 |
