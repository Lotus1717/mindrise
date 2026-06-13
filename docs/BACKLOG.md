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
- [x] **P1 第二梯队优化（2026-06-13）**
  - [x] 快捷回复 + 30 秒呼吸练习（`ChatPage` + `BreathingModal`）
  - [x] 觉察弹窗分享卡片（保存前/保存后）
  - [x] 日记增强：情绪色 7 天图、编辑/删除、`.png`→`.webp` 迁移
  - [x] 每日觉察提醒（`@capacitor/local-notifications` + Profile 开关）
  - [x] 上架向：隐私政策、危机热线、分享 App（独立弹窗）
  - [x] 代码拆分：`App.tsx` → pages / components / hooks
- [x] **P1 第三梯队 · 产品留存 + 差异化（2026-06-13）**
  - [x] 连续觉察 streak：首页展示连续天数
  - [x] 轻量「30 秒觉察」：选情绪 + 一句记录 → 日记
  - [x] 提醒时间自定义：Profile 选择时刻
  - [x] 念念本地记忆：上次觉察摘要注入对话 prompt

---

## 待办（优先）

### P0 · 运维

- [x] **部署云函数（限频版）**：CloudBase 已部署
- [x] **部署云函数（记忆版）**：CloudBase 已同步 `memory*` 字段
- [ ] **轮换 API Key**：见 [`docs/SECURITY.md`](SECURITY.md)
- [ ] **混元 Token 告警**：见 [`docs/SECURITY.md`](SECURITY.md)
- [ ] **原生打包同步**：`npm run cap:sync`（Local Notifications 权限写入 iOS/Android）

### P2 · 体验优化

- [x] **提醒时间自定义**：Profile 选择提醒时刻
- [ ] **真 SSE 流式**：HTTP 触发云函数 + 前端 fetch ReadableStream
- [ ] **分享卡片含觉察摘要**：Canvas 绘制用户小结文字

### P3 · 架构（可选）

- [ ] **数据上云**：日记 / 对话历史迁 CloudBase 数据库
- [ ] **用户体系**：微信/手机号登录
- [ ] **跨会话记忆**：念念记住历史觉察摘要

---

## 目录结构（前端）

```
src/
├── App.tsx                 # 路由与状态编排
├── hooks/
│   ├── useAppStorage.ts    # 持久化、日记、提醒
│   └── useChat.ts          # 对话逻辑
├── pages/                  # splash / home / chat / journal / profile / onboard
├── components/             # RecordModal、ShareCardModal、BreathingModal…
├── constants/              # emotions、chat、legal
├── utils/journal.ts        # 周图表、webp 迁移
└── notifications.ts        # 本地通知
```

---

## 部署备忘

```bash
npm run cap:sync    # Web 构建 + 同步原生（含 Local Notifications）
npm run deploy:fn   # 云函数
```

**控制台必查：** 匿名登录已开 · 安全规则 `"auth != null"` · `AI_API_KEY`

---

## 相关文件

| 文件 | 用途 |
|------|------|
| `cloudfunctions/nianqi-chat/index.js` | 云函数入口，`chat` / `summary`，uid 限频 |
| `src/hooks/useChat.ts` | 对话状态与 API |
| `src/hooks/useAppStorage.ts` | 本地存储与提醒设置 |
| `src/utils/streak.ts` | 连续觉察天数 |
| `src/utils/memory.ts` | 上次觉察摘要（本地记忆） |
| `src/constants/legal.ts` | 隐私政策、危机热线、分享文案 |
| `docs/SECURITY.md` | Key 轮换、用量告警 |
| `docs/PRODUCT_EVAL.md` | 产品维度打分与阶段评价（基线 vs 当前） |
