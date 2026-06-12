# 念起 · 待办与优化清单

> 最后更新：2026-06-12  
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

---

## 待办（优先）

### P0 · 代码与仓库

- [ ] **提交未入库改动**：云函数、`src/cloudbase.ts`、`src/ai.ts`、`cloudbaserc.json`、`.env.example` 等（当前工作区有未提交文件）
- [ ] **轮换 API Key**：Key 曾在对话/历史中明文出现，建议在 CloudBase 控制台重新生成并更新云函数 `AI_API_KEY`

### P1 · 安全与稳定性

- [ ] **云函数限频**：按 `auth.uid` 或 IP 限制调用频率，防止 Token 被刷（控制台限频或函数内简单计数）
- [ ] **混元 Token 告警**：CloudBase 控制台设置用量/配额告警
- [ ] **完善 `cloudfunctions/nianqi-chat/README.md`**：补充安全规则 JSON 示例（`"auth != null"` vs 排除匿名）

### P2 · 体验优化

- [ ] **流式回复**：混元 `stream: true` + 前端逐字展示，减少「等很久才出整段」的体感
- [ ] **降级文案统一**：API 失败时 `SOCRATIC` / `GUIDANCE` 本地库与念念新人设对齐
- [ ] **旧日记图片路径**：本地已存 `.png` 路径的日记项，增加 `.webp` 兼容或迁移
- [ ] **对话结束 → 觉察小结**：可选调用云函数生成今日觉察摘要，预填「生成今日觉察」弹窗

### P3 · 架构（可选）

- [ ] **数据上云**：日记 / 对话历史从 Capacitor Preferences 迁到 CloudBase 数据库（多设备同步）
- [ ] **用户体系**：若需绑定微信/手机号，替换纯匿名登录并收紧安全规则
- [ ] **HTTP 云函数 + 自定义域名**：若 `callFunction` 在特定环境有问题，可备 HTTP 触发方案

---

## 已知限制

| 项 | 说明 |
|----|------|
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

---

## 相关文件

| 文件 | 用途 |
|------|------|
| `cloudfunctions/nianqi-chat/index.js` | 云函数入口，调混元 |
| `cloudfunctions/nianqi-chat/prompt.js` | 念念系统提示词（仅服务端） |
| `src/cloudbase.ts` | 匿名登录 + callFunction |
| `src/ai.ts` | 前端对话 API 封装 |
| `cloudbaserc.json` | 云函数部署配置 |
| `.env.example` | 前端环境变量模板 |
