/**
 * BGM 播放引擎
 * 第三方音色：soundfont-player 加载 gleitz/midi-js-soundfonts 的 SoundFont；
 * 贝斯/主音走 SoundFont 采样，鼓用 Web Audio 程序化合成。
 * 加载失败时 play() 返回 false，由调用方回退到程序化音效。
 */

import { instrument } from 'soundfont-player';
import { TRACKS, MusicTrack } from '@data/MusicTracks';

const SOUNDFONT_NAME = 'MusyngKite';
const SCHEDULE_AHEAD = 0.5;
const TICK_MS = 150;

interface ParsedNote {
    note: string;
    beat: number;
    duration: number;
}

function parseNotes(src: string): ParsedNote[] {
    const out: ParsedNote[] = [];
    const parts = src.split(';');
    for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p) continue;
        const seg = p.split(':');
        if (seg.length < 2) continue;
        out.push({
            note: seg[0],
            beat: parseFloat(seg[1]),
            duration: seg.length > 2 ? parseFloat(seg[2]) : 0.4
        });
    }
    return out;
}

export class BGMPlayer {
    private static instance: BGMPlayer | null = null;
    private ctx: AudioContext | null = null;
    private master: GainNode | null = null;
    private noiseBuffer: AudioBuffer | null = null;
    private instruments: Record<string, any> = {};
    private track: MusicTrack | null = null;
    private timer: number | null = null;
    private nextLoopAt = 0;
    private secPerBeat = 0.5;
    private volume = 0.8;

    public static getInstance(): BGMPlayer {
        if (!BGMPlayer.instance) BGMPlayer.instance = new BGMPlayer();
        return BGMPlayer.instance;
    }

    public async init(ctx: AudioContext, destination: AudioNode): Promise<void> {
        if (this.ctx === ctx && this.master) return;
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(destination);
        this.noiseBuffer = this.createNoise(ctx);
    }

    public setVolume(v: number): void {
        this.volume = v;
        if (this.master && this.ctx) {
            this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
        }
    }

    public async play(trackId: string): Promise<boolean> {
        const track = TRACKS[trackId];
        if (!track || !this.ctx || !this.master) return false;
        this.stop();
        this.track = track;
        this.secPerBeat = 60 / track.bpm;

        try {
            const names: string[] = [track.bassInst, track.leadInst];
            const unique: string[] = [];
            for (let i = 0; i < names.length; i++) {
                if (unique.indexOf(names[i]) === -1) unique.push(names[i]);
            }
            const loaded = await Promise.all(unique.map((n) =>
                instrument(this.ctx as AudioContext, n as any, {
                    soundfont: SOUNDFONT_NAME,
                    destination: this.master as GainNode
                })
            ));
            for (let i = 0; i < unique.length; i++) this.instruments[unique[i]] = loaded[i];
        } catch {
            this.track = null;
            return false;
        }

        this.nextLoopAt = this.ctx.currentTime + 0.1;
        this.timer = window.setInterval(() => this.tick(), TICK_MS);
        this.tick();
        return true;
    }

    public stop(): void {
        if (this.timer !== null) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
        this.track = null;
        for (const k in this.instruments) {
            try { this.instruments[k].stop(); } catch { /* ignore */ }
        }
        this.instruments = {};
    }

    public isPlaying(): boolean {
        return this.track !== null;
    }

    private tick(): void {
        if (!this.ctx || !this.track) return;
        const loopDur = this.track.loopBeats * this.secPerBeat;
        while (this.nextLoopAt < this.ctx.currentTime + SCHEDULE_AHEAD) {
            this.scheduleLoop(this.nextLoopAt);
            this.nextLoopAt += loopDur;
        }
    }

    private scheduleLoop(startAt: number): void {
        if (!this.track) return;
        const bass = parseNotes(this.track.bass);
        const lead = parseNotes(this.track.lead);
        const drums = parseNotes(this.track.drums);

        for (let i = 0; i < bass.length; i++) {
            this.playInstrument(this.track.bassInst, bass[i].note, startAt + bass[i].beat * this.secPerBeat, bass[i].duration * this.secPerBeat, 0.9);
        }
        for (let i = 0; i < lead.length; i++) {
            this.playInstrument(this.track.leadInst, lead[i].note, startAt + lead[i].beat * this.secPerBeat, lead[i].duration * this.secPerBeat, 0.6);
        }
        for (let i = 0; i < drums.length; i++) {
            this.playDrum(drums[i].note, startAt + drums[i].beat * this.secPerBeat);
        }
    }

    private playInstrument(name: string, note: string, when: number, dur: number, gain: number): void {
        const inst = this.instruments[name];
        if (!inst) return;
        try {
            inst.play(note, when, { duration: Math.max(0.05, dur), gain: gain });
        } catch { /* ignore */ }
    }

    private playDrum(type: string, when: number): void {
        if (!this.ctx || !this.master) return;
        if (type === 'K') this.playKick(when);
        else if (type === 'S') this.playSnare(when);
        else this.playHat(when);
    }

    private playKick(when: number): void {
        const ctx = this.ctx as AudioContext;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(150, when);
        osc.frequency.exponentialRampToValueAtTime(45, when + 0.12);
        g.gain.setValueAtTime(0.9, when);
        g.gain.exponentialRampToValueAtTime(0.001, when + 0.28);
        osc.connect(g);
        g.connect(this.master as GainNode);
        osc.start(when);
        osc.stop(when + 0.3);
    }

    private playSnare(when: number): void {
        const ctx = this.ctx as AudioContext;
        if (!this.noiseBuffer) return;
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1800;
        bp.Q.value = 0.9;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, when);
        g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
        src.connect(bp);
        bp.connect(g);
        g.connect(this.master as GainNode);
        src.start(when);
        src.stop(when + 0.2);
    }

    private playHat(when: number): void {
        const ctx = this.ctx as AudioContext;
        if (!this.noiseBuffer) return;
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 7000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.22, when);
        g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
        src.connect(hp);
        hp.connect(g);
        g.connect(this.master as GainNode);
        src.start(when);
        src.stop(when + 0.06);
    }

    private createNoise(ctx: AudioContext): AudioBuffer {
        const len = Math.floor(ctx.sampleRate * 0.5);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        return buf;
    }
}