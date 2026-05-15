export enum SkillBranch {
    POWER = 'POWER',
    UTILITY = 'UTILITY',
}

export interface SkillEvolutionNode {
    id: string;
    name: string;
    branch: SkillBranch;
    tier: number;
    description: string;
    damageMultiplier: number;
    cooldownMultiplier: number;
    extraEffect: string;
    color: number;
}

export interface SkillEvolutionLine {
    skillIndex: number;
    skillName: string;
    branches: SkillBranch[];
    nodes: SkillEvolutionNode[];
}

const SKILL_EVOLUTION_DB: SkillEvolutionLine[] = [
    {
        skillIndex: 0,
        skillName: '激光射击',
        branches: [SkillBranch.POWER, SkillBranch.UTILITY],
        nodes: [
            { id: 'q_t1', name: '激光射击', branch: SkillBranch.POWER, tier: 1, description: '基础激光攻击', damageMultiplier: 1.0, cooldownMultiplier: 1.0, extraEffect: '', color: 0x00ff88 },
            { id: 'q_t2p', name: '聚焦激光', branch: SkillBranch.POWER, tier: 2, description: '伤害x2 范围+30%', damageMultiplier: 2.0, cooldownMultiplier: 1.1, extraEffect: 'range+30%', color: 0xff6644 },
            { id: 'q_t2u', name: '散射激光', branch: SkillBranch.UTILITY, tier: 2, description: '3方向射击 冷却-20%', damageMultiplier: 0.7, cooldownMultiplier: 0.8, extraEffect: 'triple_shot', color: 0x44ddff },
            { id: 'q_t3p', name: '歼灭光线', branch: SkillBranch.POWER, tier: 3, description: '究极:全屏穿透激光 伤害x5', damageMultiplier: 5.0, cooldownMultiplier: 1.3, extraEffect: 'fullscreen_pierce', color: 0xff0044 },
            { id: 'q_t3u', name: '激光风暴', branch: SkillBranch.UTILITY, tier: 3, description: '究极:8方向连射 冷却极短', damageMultiplier: 1.5, cooldownMultiplier: 0.4, extraEffect: '8way_rapid', color: 0x0088ff },
        ]
    },
    {
        skillIndex: 1,
        skillName: '护盾激活',
        branches: [SkillBranch.POWER, SkillBranch.UTILITY],
        nodes: [
            { id: 'r_t1', name: '护盾激活', branch: SkillBranch.UTILITY, tier: 1, description: '恢复护盾值', damageMultiplier: 1.0, cooldownMultiplier: 1.0, extraEffect: '', color: 0x44aaff },
            { id: 'r_t2p', name: '爆裂护盾', branch: SkillBranch.POWER, tier: 2, description: '护盾破裂时AOE伤害', damageMultiplier: 2.0, cooldownMultiplier: 1.0, extraEffect: 'shield_burst_aoe', color: 0xff6644 },
            { id: 'r_t2u', name: '持续护盾', branch: SkillBranch.UTILITY, tier: 2, description: '护盾持续8秒 自动回复', damageMultiplier: 0.8, cooldownMultiplier: 0.9, extraEffect: 'regen_8s', color: 0x44ddff },
            { id: 'r_t3p', name: '毁灭力场', branch: SkillBranch.POWER, tier: 3, description: '究极:护盾存在时对周围持续造成伤害', damageMultiplier: 4.0, cooldownMultiplier: 1.2, extraEffect: 'damage_aura', color: 0xff0044 },
            { id: 'r_t3u', name: '绝对屏障', branch: SkillBranch.UTILITY, tier: 3, description: '究极:5秒内完全无敌', damageMultiplier: 0, cooldownMultiplier: 1.5, extraEffect: 'invincible_5s', color: 0x0088ff },
        ]
    },
    {
        skillIndex: 2,
        skillName: '激光弹幕',
        branches: [SkillBranch.POWER, SkillBranch.UTILITY],
        nodes: [
            { id: 'f_t1', name: '激光弹幕', branch: SkillBranch.POWER, tier: 1, description: '全屏AOE清场', damageMultiplier: 1.0, cooldownMultiplier: 1.0, extraEffect: '', color: 0xffaa00 },
            { id: 'f_t2p', name: '歼灭弹幕', branch: SkillBranch.POWER, tier: 2, description: '伤害x2.5 对Boss额外50%', damageMultiplier: 2.5, cooldownMultiplier: 1.0, extraEffect: 'boss_bonus_50%', color: 0xff6644 },
            { id: 'f_t2u', name: '精密弹幕', branch: SkillBranch.UTILITY, tier: 2, description: '锁定最强敌人 冷却-30%', damageMultiplier: 1.5, cooldownMultiplier: 0.7, extraEffect: 'target_strongest', color: 0x44ddff },
            { id: 'f_t3p', name: '天罚·歼星', branch: SkillBranch.POWER, tier: 3, description: '究极:对全屏敌人造成10倍伤害', damageMultiplier: 10.0, cooldownMultiplier: 1.2, extraEffect: 'screen_wipe', color: 0xff0044 },
            { id: 'f_t3u', name: '时停弹幕', branch: SkillBranch.UTILITY, tier: 3, description: '究极:冻结敌人3秒后爆发', damageMultiplier: 3.0, cooldownMultiplier: 0.8, extraEffect: 'time_stop_3s', color: 0x0088ff },
        ]
    }
];

export function getSkillEvolutionLine(skillIndex: number): SkillEvolutionLine | undefined {
    return SKILL_EVOLUTION_DB.find(s => s.skillIndex === skillIndex);
}

export function getSkillEvolutionNode(nodeId: string): SkillEvolutionNode | undefined {
    for (const line of SKILL_EVOLUTION_DB) {
        const node = line.nodes.find(n => n.id === nodeId);
        if (node) return node;
    }
    return undefined;
}

export function getNextSkillNodes(currentNodeId: string | null, skillIndex: number): SkillEvolutionNode[] {
    if (!currentNodeId) {
        return getSkillEvolutionLine(skillIndex)?.nodes.filter(n => n.tier === 1) || [];
    }
    const current = getSkillEvolutionNode(currentNodeId);
    if (!current) return [];
    const line = getSkillEvolutionLine(skillIndex);
    if (!line) return [];
    if (current.tier >= 3) return [];
    return line.nodes.filter(n => n.tier === current.tier + 1);
}
