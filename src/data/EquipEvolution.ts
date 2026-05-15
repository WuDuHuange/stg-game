export enum EquipBranch {
    ASSAULT = 'ASSAULT',
    DEFENSE = 'DEFENSE',
}

export interface EquipEvolutionNode {
    id: string;
    name: string;
    branch: EquipBranch;
    tier: number;
    description: string;
    stats: { attack: number; defense: number; speed: number; special: number };
    color: number;
}

export interface EquipEvolutionLine {
    slotId: string;
    slotName: string;
    branches: EquipBranch[];
    nodes: EquipEvolutionNode[];
}

const EQUIP_EVOLUTION_DB: EquipEvolutionLine[] = [
    {
        slotId: 'HEAD',
        slotName: '头部',
        branches: [EquipBranch.ASSAULT, EquipBranch.DEFENSE],
        nodes: [
            { id: 'head_t1', name: '战术头盔', branch: EquipBranch.ASSAULT, tier: 1, description: '基础防护', stats: { attack: 5, defense: 15, speed: 0, special: 0 }, color: 0x4488ff },
            { id: 'head_t2a', name: '突击头盔', branch: EquipBranch.ASSAULT, tier: 2, description: '攻击+20% 暴击+8%', stats: { attack: 15, defense: 12, speed: 5, special: 8 }, color: 0xff6644 },
            { id: 'head_t2d', name: '铁壁头盔', branch: EquipBranch.DEFENSE, tier: 2, description: '防御+30% 伤害减免10%', stats: { attack: 3, defense: 35, speed: -2, special: 10 }, color: 0x44aaff },
            { id: 'head_t3a', name: '歼灭者头盔', branch: EquipBranch.ASSAULT, tier: 3, description: '究极:暴击率+25% 暴击伤害x2.5', stats: { attack: 30, defense: 10, speed: 10, special: 25 }, color: 0xff2200 },
            { id: 'head_t3d', name: '不动如山头盔', branch: EquipBranch.DEFENSE, tier: 3, description: '究极:受击时30%概率完全免疫', stats: { attack: 5, defense: 60, speed: -5, special: 30 }, color: 0x0066ff },
        ]
    },
    {
        slotId: 'LEFT_HAND',
        slotName: '左手',
        branches: [EquipBranch.ASSAULT, EquipBranch.DEFENSE],
        nodes: [
            { id: 'lh_t1', name: '激光手枪', branch: EquipBranch.ASSAULT, tier: 1, description: '基础远程武器', stats: { attack: 20, defense: 0, speed: 10, special: 0 }, color: 0x00ff88 },
            { id: 'lh_t2a', name: '连射激光枪', branch: EquipBranch.ASSAULT, tier: 2, description: '射速+40% 穿透力+1', stats: { attack: 35, defense: 0, speed: 20, special: 15 }, color: 0xff8844 },
            { id: 'lh_t2d', name: '护盾手枪', branch: EquipBranch.DEFENSE, tier: 2, description: '攻击产生护盾 射击回血2%', stats: { attack: 15, defense: 20, speed: 8, special: 20 }, color: 0x44ddff },
            { id: 'lh_t3a', name: '歼灭光束枪', branch: EquipBranch.ASSAULT, tier: 3, description: '究极:光束穿透所有敌人', stats: { attack: 60, defense: 0, speed: 30, special: 40 }, color: 0xff4400 },
            { id: 'lh_t3d', name: '圣盾守护枪', branch: EquipBranch.DEFENSE, tier: 3, description: '究极:击杀回复15%最大生命', stats: { attack: 25, defense: 40, speed: 15, special: 45 }, color: 0x0088ff },
        ]
    },
    {
        slotId: 'RIGHT_HAND',
        slotName: '右手',
        branches: [EquipBranch.ASSAULT, EquipBranch.DEFENSE],
        nodes: [
            { id: 'rh_t1', name: '能量刃', branch: EquipBranch.ASSAULT, tier: 1, description: '基础近战武器', stats: { attack: 25, defense: 5, speed: 5, special: 0 }, color: 0xaa44ff },
            { id: 'rh_t2a', name: '爆裂能量刃', branch: EquipBranch.ASSAULT, tier: 2, description: '近战范围+50% 爆炸伤害', stats: { attack: 45, defense: 5, speed: 8, special: 20 }, color: 0xff6644 },
            { id: 'rh_t2d', name: '反射能量刃', branch: EquipBranch.DEFENSE, tier: 2, description: '格挡弹幕 15%概率反射', stats: { attack: 20, defense: 25, speed: 5, special: 15 }, color: 0x44aaff },
            { id: 'rh_t3a', name: '天罚·终焉刃', branch: EquipBranch.ASSAULT, tier: 3, description: '究极:近战一击必杀普通敌人', stats: { attack: 80, defense: 5, speed: 15, special: 50 }, color: 0xff0044 },
            { id: 'rh_t3d', name: '绝对领域刃', branch: EquipBranch.DEFENSE, tier: 3, description: '究极:格挡率50% 格挡反弹200%', stats: { attack: 30, defense: 50, speed: 10, special: 50 }, color: 0x0044ff },
        ]
    },
    {
        slotId: 'TORSO',
        slotName: '躯干',
        branches: [EquipBranch.ASSAULT, EquipBranch.DEFENSE],
        nodes: [
            { id: 'torso_t1', name: '纳米装甲', branch: EquipBranch.ASSAULT, tier: 1, description: '基础防护装甲', stats: { attack: 0, defense: 25, speed: 0, special: 5 }, color: 0x888888 },
            { id: 'torso_t2a', name: '突击外骨骼', branch: EquipBranch.ASSAULT, tier: 2, description: '移速+25% 攻击+15%', stats: { attack: 15, defense: 20, speed: 25, special: 10 }, color: 0xff8844 },
            { id: 'torso_t2d', name: '重装堡垒甲', branch: EquipBranch.DEFENSE, tier: 2, description: '护盾+50 受伤减免20%', stats: { attack: 0, defense: 50, speed: -10, special: 20 }, color: 0x44aaff },
            { id: 'torso_t3a', name: '超载战神甲', branch: EquipBranch.ASSAULT, tier: 3, description: '究极:低血时攻击力x3', stats: { attack: 40, defense: 15, speed: 35, special: 30 }, color: 0xff4400 },
            { id: 'torso_t3d', name: '不灭核心甲', branch: EquipBranch.DEFENSE, tier: 3, description: '究极:每10秒自动满盾一次', stats: { attack: 0, defense: 80, speed: -5, special: 60 }, color: 0x0066ff },
        ]
    },
    {
        slotId: 'LEGS',
        slotName: '腿部',
        branches: [EquipBranch.ASSAULT, EquipBranch.DEFENSE],
        nodes: [
            { id: 'legs_t1', name: '推进靴', branch: EquipBranch.ASSAULT, tier: 1, description: '基础机动装备', stats: { attack: 0, defense: 5, speed: 15, special: 5 }, color: 0x44dd44 },
            { id: 'legs_t2a', name: '冲刺推进器', branch: EquipBranch.ASSAULT, tier: 2, description: '闪避距离+100% 冲刺无敌0.3s', stats: { attack: 5, defense: 10, speed: 35, special: 15 }, color: 0xff8844 },
            { id: 'legs_t2d', name: '重力稳定靴', branch: EquipBranch.DEFENSE, tier: 2, description: '被击退减免80% 站桩防御+20', stats: { attack: 0, defense: 25, speed: 10, special: 20 }, color: 0x44aaff },
            { id: 'legs_t3a', name: '光速跃迁靴', branch: EquipBranch.ASSAULT, tier: 3, description: '究极:瞬移闪避 冷却1.5s', stats: { attack: 10, defense: 10, speed: 50, special: 40 }, color: 0xff0044 },
            { id: 'legs_t3d', name: '绝对固定靴', branch: EquipBranch.DEFENSE, tier: 3, description: '究极:站立时受伤-60%', stats: { attack: 0, defense: 45, speed: 5, special: 60 }, color: 0x0044ff },
        ]
    }
];

export function getEquipEvolutionLine(slotId: string): EquipEvolutionLine | undefined {
    return EQUIP_EVOLUTION_DB.find(e => e.slotId === slotId);
}

export function getEquipEvolutionNode(nodeId: string): EquipEvolutionNode | undefined {
    for (const line of EQUIP_EVOLUTION_DB) {
        const node = line.nodes.find(n => n.id === nodeId);
        if (node) return node;
    }
    return undefined;
}

export function getNextEquipNodes(currentNodeId: string | null, slotId: string): EquipEvolutionNode[] {
    if (!currentNodeId) {
        return getEquipEvolutionLine(slotId)?.nodes.filter(n => n.tier === 1) || [];
    }
    const current = getEquipEvolutionNode(currentNodeId);
    if (!current) return [];
    const line = getEquipEvolutionLine(slotId);
    if (!line) return [];
    if (current.tier >= 3) return [];
    return line.nodes.filter(n => n.tier === current.tier + 1);
}
