# MindRise 情绪觉察 App

一款温暖治愈的心理健康类应用，专注于情绪觉察与自我疗愈。通过每日情绪卡片、苏格拉底式对话引导和日记记录，帮助用户在日常生活中建立情绪觉察习惯。

---

## 产品特色

###🃏 每日情绪卡
每天一张专属情绪卡牌，配合 AI 生成的治愈系插画，带你看见内心最真实的样子。

### 💬 苏格拉底式对话
针对10 种不同情绪设计的专属引导问题，不给答案，而是陪你一步步探索内心。

### 📓觉察日记
记录每一次情绪觉察的轨迹，支持标签、心情评分，形成个人情绪成长档案。

### ✨ 品牌视觉
温暖的水獭 mascot「念念」全程陪伴，治愈系配色，轻盈动效，零压力使用体验。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | Tailwind CSS 4 + 原生 CSS 动画 |
| 图标 | Lucide React（统一线稿 SVG） |
| 动效 | CSS Keyframes + Canvas API |
| 状态管理 | React useState / useRef / useCallback / useMemo |
| 部署 | Vite 静态打包 →托管平台 |

---

## 目录结构

```
nianqi-mvp/
├── public/
│   ├── cards/          # 10 张情绪卡 AI 插画
│   │   ├── card-anxiety.png
│   │   ├── card-calm.png
│   │   ├── card-exhaustion.png
│   │   ├── card-joy.png
│   │   ├── card-loneliness.png
│   │   ├── card-anger.png
│   │   ├── card-gratitude.png
│   │   ├── card-confusion.png
│   │   ├── card-anticipation.png
│   │   └── card-relief.png
│   └── otter-frames/   # 念念品牌素材
│       ├── otter-happy.png
│       ├── otter-curious.png
│       ├── otter-glow.png
│       ├── splash-1~4.png   # 启动页动画帧
│       └── onboard-1~3.png # 引导页插画
├── src/
│   ├── App.tsx # 主组件（6 个页面状态）
│   ├── data.ts         # 卡牌数据、拥抱消息、情绪标签
│   └── index.css       # 全局样式（含暗色模式、动画 keyframes）
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 页面说明

| 页面 | 路由状态 | 说明 |
|------|---------|------|
| 启动页 | `splash` | 念念浮起序列帧动画，自动跳转引导页 |
| 引导页 | `onboard` | 3 步品牌介绍，新用户首次展示 |
| 首页 | `home` | 情绪卡展示，支持换卡、进入对话 |
| 对话页 | `chat` | 苏格拉底式 AI 引导对话，念念表情动态切换 |
| 日记本 | `journal` | 7 天趋势图 + 历史觉察记录列表 |
| 我的 | `profile` | 深色模式、分享、抱抱念念 |

---

## 情绪卡片数据

共 10 张卡牌，涵盖常见情绪：

| 卡牌 | 情绪词 | 引导语 |
|------|--------|--------|
| card-anxiety | 焦虑 | 此刻，你身体里有一个声音在低语…… |
| card-calm | 平静 | 水面如镜，你看见了自己真实的样子。 |
| card-exhaustion | 疲惫 | 累了就停下，没有人在计时。 |
| card-joy | 欣喜 | 这份快乐，像阳光一样值得被记住。 |
| card-loneliness | 孤独 | 你并非独自一人，只是需要被看见。 |
| card-anger | 愤怒 | 那股力量在告诉你，边界需要被守护。 |
| card-gratitude | 感恩 | 今天有什么，是你特别想说的谢谢？ |
| card-confusion | 迷茫 | 方向还未出现，也许是因为你还有时间探索。 |
| card-anticipation | 期待 | 那个小小的希望，还在发芽。 |
| card-relief | 释然 | 有些事，你已经准备好了放下。 |

---

## 核心交互

### 情绪卡切换
- 首页点击「换一张」→ 卡片淡出 → 新卡淡入（220ms CSS transition）
- 首页点击整张卡 → 进入对话页，自动发送第一条苏格拉底提问

### 对话流程
- 每轮对话后，念念表情在好奇/温暖间动态切换
- 超过 3 轮对话后，显示「生成今日觉察」按钮
- 超过 15 秒无输入，显示念念引导气泡
- 消息超过 50 条，自动清理最早 1/3

### 觉察记录弹窗
- 支持心情评分（★ 1-5）、情绪标签多选、自定义觉察小结
- 点击保存后显示念念收到动画（2.2 秒后自动关闭）

### 分享卡片
- Canvas 绘制，750×1100px，含情绪卡插画 + 品牌水印
- 一键下载为 PNG 文件

### 深色模式
- 全局 CSS 变量切换（`--bg-top` / `--text-dark` / `--card-bg`）
- 无滤镜、无图片反色，零性能开销

---

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

---

## 设计规范

### 配色
| 变量 | 颜色 | 用途 |
|------|------|------|
| `--accent-warm` | `#C8A882` | 主色调（暖棕） |
| `--accent-green` | `#A7C5BD` | 辅色（薄荷绿） |
| `--bg-top` | `#FEF9F0` | 页面背景（暖白） |
| `--bg-bottom` | `#F0EDE8` | 底部渐变 |
| `--text-dark` | `#3C2E2B` | 正文文字 |
| `--text-muted` | `#8E7A72` | 次要文字 |
| `--card-bg` | `#FEF9F0` | 卡片背景 |

### 字体
- iOS 系统字体栈（`-apple-system, BlinkMacSystemFont`）
- 中文使用苹方（PingFang SC）
- 英文使用 SF Pro Text

### 动画
| 动画名 | 时长 | 缓动 | 用途 |
|--------|------|------|------|
| `splashFrameIn` | 0.9s | ease forwards | 启动页帧入场 |
| `cardIn` | 0.22s | ease-out | 卡片淡入 |
| `cardOut` | 0.22s | ease-in | 卡片淡出 |
| `msgSlide` | 0.35s | cubic-bezier | 消息气泡滑入 |
| `savePop` | 0.6s | cubic-bezier(0.34,1.56,...) | 保存成功弹跳 |
| `otterFloat` | 3s | ease-in-out infinite | 念念悬浮 |
| `typingBounce` | 1.4s | ease-in-out infinite | 打字指示器 |

---

## 注意事项

- 「念起」不替代专业心理咨询，如需专业帮助请联系心理医生或心理咨询师
- 所有用户数据均存储在浏览器本地（localStorage），不涉及任何服务端
- 图片资源存放于 `public/` 目录，打包时自动拷贝至 `dist/`

---

## 开源许可

MIT License