export const CARDS = [
  { id: 1, word: '焦虑', pinyin: 'Jiaolu', guide: '此刻，你身体里有一个声音在低语……它想告诉你什么？', cardImg: '/cards/card-anxiety.png' },
  { id: 2, word: '平静', pinyin: 'Píngjìng', guide: '水面如镜，你看见了自己真实的样子。', cardImg: '/cards/card-calm.png' },
  { id: 3, word: '疲惫', pinyin: 'Píbèi', guide: '累了就停下，没有人在计时。', cardImg: '/cards/card-exhaustion.png' },
  { id: 4, word: '欣喜', pinyin: 'Xīnxǐ', guide: '这份快乐，像阳光一样值得被记住。', cardImg: '/cards/card-joy.png' },
  { id: 5, word: '孤独', pinyin: 'Gūdú', guide: '你并非独自一人，只是需要被看见。', cardImg: '/cards/card-loneliness.png' },
  { id: 6, word: '愤怒', pinyin: 'Fènnù', guide: '那股力量在告诉你，边界需要被守护。', cardImg: '/cards/card-anger.png' },
  { id: 7, word: '感恩', pinyin: 'GanEn', guide: '今天有什么，是你特别想说的谢谢？', cardImg: '/cards/card-gratitude.png' },
  { id: 8, word: '迷茫', pinyin: 'Mímáng', guide: '方向还未出现，也许是因为你还有时间探索。', cardImg: '/cards/card-confusion.png' },
  { id: 9, word: '期待', pinyin: 'Qīdài', guide: '那个小小的希望，还在发芽。', cardImg: '/cards/card-anticipation.png' },
  { id: 10, word: '释然', pinyin: 'Shìrán', guide: '有些事，你已经准备好了放下。', cardImg: '/cards/card-relief.png' },
]

export const AI_REPLIES = [
  '你看到"焦虑"这个词，身体哪个部位最有感觉？',
  '那团感受如果有一个颜色，它会是什么？形状呢？',
  '谢谢你愿意描述它。深呼吸三次，感受身体有没有一点点变化？',
  '这个感受，它在提醒你什么？',
  '如果你可以回应身体里的这个声音，你会说什么？',
  '此刻，什么对你最重要？',
  '那种感觉在你身体里停留了多久？它有在变化吗？',
  '如果把你的感受比喻成天气，会是哪种？',
  '你上一次有这种感觉是什么时候？',
  '想象这个感受是一个小动物，它在做什么？',
]

export const JOURNAL_DATA = [
  { id: 1, date: '6月10日', day: '周二', emotion: '焦虑', rating: 3, cardWord: '焦虑', preview: '胸口有点闷，深呼吸之后稍微缓解了一些。下午开完会感觉整个人都被掏空了，需要早点休息。', cardImg: '/cards/card-anxiety.png' },
  { id: 2, date: '6月9日', day: '周一', emotion: '平静', rating: 4, cardWord: '平静', preview: '今天睡了个好觉，醒来觉得世界都亮了一些。下午独自去公园散步，发现自己很久没有这样慢下来了。', cardImg: '/cards/card-calm.png' },
  { id: 3, date: '6月7日', day: '周六', emotion: '欣喜', rating: 5, cardWord: '欣喜', preview: '收到了好朋友的礼物，是一本想了很久的书。这个世界上还有人会记得你喜欢什么，真的很温暖。', cardImg: '/cards/card-joy.png' },
  { id: 4, date: '6月5日', day: '周四', emotion: '疲惫', rating: 2, cardWord: '疲惫', preview: '连轴转了三天，感觉身体在抗议。下周要给自己放一天假，什么都不做，只是休息。', cardImg: '/cards/card-exhaustion.png' },
]

export const HUG_MESSAGES = [
  '今天你已经做得很好了。光是愿意觉察，就已经是勇敢的第一步。',
  '有些日子，只需要撑过去就好。你不用每天都闪闪发光。',
  '你的感受很重要。哪怕没有人理解你，你也要站在自己这边。',
  '这一刻很难，但会过去的。你比自己以为的更坚韧。',
  '念念在这里抱着小石头陪你。你不是一个人。',
  '对自己温柔一点。你已经尽力了。',
  '世界不完美，但你还在这里，这就够了。',
  '有些情绪不需要被解决，只需要被允许存在。',
]

export const emotionTags = ['压力', '焦虑', '平静', '疲惫', '感恩', '孤独', '欣喜', '迷茫']

export const SHARE_MESSAGES = [
  '我在「念起」完成了一次情绪觉察，你呢？',
  '今天我选择看见自己。觉察即自由 🦦',
  '一颗光球，一段觉察。念念陪我度过了今天。',
] as const