export const PRIVACY_POLICY = `念起（MindRise）隐私说明

我们尊重你的隐私。念起是一款以本地存储为主的觉察工具：

· 日记、昵称、对话记录默认保存在你的设备上（Capacitor Preferences / 浏览器存储）
· AI 对话通过 CloudBase 云函数转发至混元模型，仅传输当前对话内容与情绪卡信息
· 使用匿名登录标识调用云函数，我们不收集手机号或微信信息
· 你可以选择开启每日提醒，通知仅在本地设备触发
· 我们不会出售你的个人数据

如需删除本地数据，可在系统设置中清除 App 数据，或卸载应用。

更新日期：2026年6月`

export const DISCLAIMER = `念起不替代专业心理咨询或医疗诊断。

若你感到持续痛苦、有自伤或伤害他人的念头，请立即联系专业人士或拨打心理援助热线。`

export const CRISIS_HOTLINES = [
  { name: '全国心理援助热线', number: '12356', note: '24小时' },
  { name: '北京心理危机研究与干预中心', number: '010-82951332', note: '24小时' },
  { name: '生命热线', number: '400-161-9995', note: '24小时' },
]

export const ABOUT_TAGLINE = '觉察即自由'

export const ABOUT_BODY = `一只叫念念的小水獭，陪你看见情绪的形状。
我们相信，每一次觉察，都是一次温柔的自我靠近。`

export const ABOUT_DISCLAIMER = '「念起」不替代专业心理咨询。如有严重困扰，请寻求专业帮助。'

export const APP_SHARE_TEXT = `念起 · ${ABOUT_TAGLINE}

${ABOUT_BODY}

${ABOUT_DISCLAIMER}`
