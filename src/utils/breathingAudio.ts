/** 呼吸练习环境音：Web Audio 合成，无需外部音频文件 */

const FADE_IN_S = 1.2
const FADE_OUT_S = 0.9
const AMBIENT_LEVEL = 0.22

function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 3
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + white * 0.02) / 1.02
    data[i] = last * 3.2
  }
  return buffer
}

export class BreathingAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private noiseSource: AudioBufferSourceNode | null = null
  private disposed = false

  async start(): Promise<void> {
    if (this.ctx) return
    const Ctx = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return

    this.ctx = new Ctx()
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    const master = this.ctx.createGain()
    master.gain.setValueAtTime(0, this.ctx.currentTime)
    master.gain.linearRampToValueAtTime(AMBIENT_LEVEL, this.ctx.currentTime + FADE_IN_S)
    master.connect(this.ctx.destination)
    this.master = master

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 520
    filter.Q.value = 0.6
    filter.connect(master)

    // 柔和五度泛音垫 —— 类似冥想 App 的 ambient pad
    for (const freq of [174.61, 261.63]) {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const g = this.ctx.createGain()
      g.gain.value = 0.045
      osc.connect(g)
      g.connect(filter)
      osc.start()
      this.oscillators.push(osc)
    }

    const noiseBuf = createBrownNoiseBuffer(this.ctx)
    const noise = this.ctx.createBufferSource()
    noise.buffer = noiseBuf
    noise.loop = true
    const noiseGain = this.ctx.createGain()
    noiseGain.gain.value = 0.035
    noise.connect(noiseGain)
    noiseGain.connect(filter)
    noise.start()
    this.noiseSource = noise
  }

  setMuted(muted: boolean): void {
    if (!this.master || !this.ctx || this.disposed) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(
      muted ? 0 : AMBIENT_LEVEL,
      now + 0.35,
    )
  }

  /** 阶段切换时极轻提示音，帮助跟上节奏 */
  pulsePhase(phase: 'inhale' | 'hold' | 'exhale'): void {
    if (!this.ctx || !this.master || this.disposed) return
    if (this.master.gain.value < 0.01) return

    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    const freqs = { inhale: 392, hold: 349.23, exhale: 293.66 }
    osc.type = 'sine'
    osc.frequency.value = freqs[phase]
    g.gain.setValueAtTime(0, this.ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.028, this.ctx.currentTime + 0.08)
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.55)
    osc.connect(g)
    g.connect(this.master)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.6)
  }

  stop(): void {
    if (!this.ctx || !this.master || this.disposed) return
    this.disposed = true
    const ctx = this.ctx
    const now = ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0, now + FADE_OUT_S)

    window.setTimeout(() => this.dispose(), (FADE_OUT_S + 0.1) * 1000)
  }

  private dispose(): void {
    for (const osc of this.oscillators) {
      try { osc.stop() } catch { /* already stopped */ }
    }
    this.oscillators = []
    try { this.noiseSource?.stop() } catch { /* noop */ }
    this.noiseSource = null
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }
}
