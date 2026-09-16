/**
 * 无尽模式排行榜数据
 * 本地 localStorage 持久化，接口抽象，未来可平滑切换后端。
 */

export interface RushRecord {
    waves: number;
    score: number;
    date: string;
}

const STORAGE_KEY = 'stg_rush_best';

export function getBestRush(): RushRecord | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as RushRecord;
            if (parsed && typeof parsed.waves === 'number') {
                return parsed;
            }
        }
    } catch {}
    return null;
}

/**
 * 提交一次无尽结果，若刷新纪录返回 true
 */
export function submitRush(waves: number, score: number): { isNewBest: boolean; best: RushRecord } {
    const prev = getBestRush();
    const isNewBest = !prev || waves > prev.waves || (waves === prev.waves && score > prev.score);

    if (isNewBest) {
        const record: RushRecord = {
            waves,
            score,
            date: new Date().toISOString()
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        } catch {}
        return { isNewBest: true, best: record };
    }

    return { isNewBest: false, best: prev! };
}