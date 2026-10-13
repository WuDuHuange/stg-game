/**
 * 关键音效的第三方音色叠加（SfxAccent）
 * 在既有程序化 SFX 之上，为升级 / 技能 / 连击叠加 SoundFont 强调音。
 * 射击 / 爆炸 / 受击等高频音效仍保留程序化合成（低延迟）。
 * 音源加载失败时静默降级，程序化音效不受影响。
 */

import { instrument } from 'soundfont-player';

const SOUNDFONT_NAME = 'MusyngKite';
const ACCENT_INST = 'lead_2_sawtooth';

// 每种强调音：[音名, 相对起始秒, 时长秒]
const ACCENTS: Record<string, Array<[string, number, number]>> = {
    upgrade: [['C5', 0, 0.12], ['E5', 0.09, 0.12], ['G5', 0.18, 0.12], ['C6', 0.27, 0.32]],
    skill: [['A4', 0, 0.28], ['C5', 0.02, 0.28], ['E5', 0.04, 0.34]],
    combo: [['E6', 0, 0.08], ['G6', 0.05, 0.1]],
    boss: [['A3', 0, 0.5], ['A2', 0.0, 0.7]]
};

export class SfxAccent {
    private static instance: SfxAccent | null = null;
    private ctx: AudioContext | null = null;
    private master: GainNode | null = null;
    private lead: any = null;
    private loading = false;
    private volume = 0.5;

    public static getInstance(): SfxAccent {
        if (!SfxAccent.instance) SfxAccent.instance = new SfxAccent();
        return SfxAccent.instance;
    }

    /** 绑定音频上下文（可重复调用，仅首次生效） */
    public ensure(ctx: AudioContext, destination: AudioNode): void {
        if (this.ctx === ctx && this.master) return;
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(destination);
        void this.loadLead();
    }

    public setVolume(v: number): void {
        this.volume = v;
        if (this.master && this.ctx) {
            this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
        }
    }

    /** 播放强调音（未就绪或类型未知时静默跳过） */
    public play(type: string): void {
        if (!this.lead || !this.ctx) return;
        const seq = ACCENTS[type];
        if (!seq) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < seq.length; i++) {
            try {
                this.lead.play(seq[i][0], now + seq[i][1], { duration: seq[i][2], gain: 0.85 });
            } catch { /* ignore */ }
        }
    }

    private async loadLead(): Promise<void> {
        if (this.lead || this.loading || !this.ctx || !this.master) return;
        this.loading = true;
        try {
            this.lead = await instrument(this.ctx, ACCENT_INST as any, {
                soundfont: SOUNDFONT_NAME,
                destination: this.master
            });
        } catch { /* 静默降级 */ } finally {
            this.loading = false;
        }
    }
}