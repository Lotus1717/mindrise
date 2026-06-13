# 念起 · 安全运维清单

> 代码侧已做云函数限频（按 `context.auth.uid`）；以下项需在 **CloudBase 控制台** 手动完成。

---

## 1. 轮换 API Key（建议立即做）

若 `AI_API_KEY` 曾在对话、截图或 Git 历史中出现过：

1. CloudBase 控制台 → **AI+** / **API Key 管理** → 重新生成 Key
2. 云函数 `nianqi-chat` → **环境变量** → 更新 `AI_API_KEY`
3. 保存并重新部署云函数
4. 作废旧 Key

---

## 2. 混元 Token 用量告警

1. CloudBase 控制台 → **费用中心** / **资源用量**
2. 为混元模型或 AI 网关设置 **用量阈值告警**（如每日 80% 配额）
3. 绑定通知邮箱或 webhook

---

## 3. 云函数限频（代码 + 控制台）

**代码内（已内置）：** `nianqi-chat/index.js` 按用户 uid 滑动窗口限频，默认 60 秒内最多 40 次（对话 + 小结合计）。

可通过云函数环境变量调整：

| 变量 | 默认 | 说明 |
|------|------|------|
| `RATE_LIMIT_WINDOW_MS` | `60000` | 窗口毫秒 |
| `RATE_LIMIT_MAX` | `40` | 窗口内最大请求数 |

**控制台（可选叠加）：** 云函数 → `nianqi-chat` → **限频设置**，按 IP 或全局 QPS 再加一层保护。

---

## 4. 安全规则

保持 `"auth != null"`（允许匿名登录用户），不要使用「排除匿名用户」规则。

详见 [`cloudfunctions/nianqi-chat/README.md`](../cloudfunctions/nianqi-chat/README.md)。
