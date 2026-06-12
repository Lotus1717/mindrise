export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const BASE_URL = import.meta.env.VITE_AI_BASE_URL as string
const API_KEY = import.meta.env.VITE_AI_API_KEY as string
const MODEL = (import.meta.env.VITE_AI_MODEL as string) || 'hy3-preview'

function buildSystemPrompt(emotion: string, guide: string, userName: string) {
  return `你是「念念」，一只温暖的小水獭，是心理健康 App「念起」的情绪觉察陪伴者。
用户「${userName}」正在围绕「${emotion}」这张情绪卡进行觉察。
卡牌引导语：${guide}

对话要求：
- 采用苏格拉底式提问：用温柔、好奇的问题引导用户探索感受，不给标准答案、不讲大道理
- 每次回复 1～2 个简短问题，总字数不超过 80 字
- 语气温暖、口语化，像朋友聊天
- 不使用 markdown、列表或编号
- 不替代专业心理咨询；若用户提及自伤、自杀等危机，请温和建议寻求专业帮助

若用户刚开始觉察、尚未发言，请用第一个问题自然开启对话。`
}

function assertConfig() {
  if (!BASE_URL || !API_KEY) {
    throw new Error('未配置 AI 接口，请在 .env.local 中设置 VITE_AI_BASE_URL 和 VITE_AI_API_KEY')
  }
}

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[]
  error?: { message?: string }
  message?: string
  code?: string
}

/** 调用腾讯混元（CloudBase AI 网关，OpenAI 兼容协议） */
export async function chatWithNianNian(
  params: {
    emotion: string
    guide: string
    userName: string
    messages: ChatMessage[]
    signal?: AbortSignal
  },
): Promise<string> {
  assertConfig()

  const apiMessages: { role: string; content: string }[] = [
    { role: 'system', content: buildSystemPrompt(params.emotion, params.guide, params.userName) },
    ...params.messages.map(m => ({ role: m.role, content: m.content })),
  ]

  if (params.messages.length === 0) {
    apiMessages.push({ role: 'user', content: '你好念念，我想开始今天的觉察。' })
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.75,
      max_tokens: 256,
    }),
    signal: params.signal,
  })

  const data = (await res.json()) as ChatCompletionResponse
  if (!res.ok) {
    throw new Error(data.message || data.error?.message || `AI 请求失败 (${res.status})`)
  }

  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('AI 返回为空')
  return text
}
