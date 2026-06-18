import type {
  MagicType,
  Skill,
  Student,
  Dungeon,
  ElementAdvantageType,
  ElementRelation,
  BattleUnit,
  TeamCompBonus,
  TeamCompEvaluation,
  EnemyTemplate,
  DungeonWaveConfig,
  DamageCalculationParams,
  DamageResult,
  BattleState,
  BattleSkillResult,
  BattleTurn,
  BattleSettlement,
  BattleRewards,
  MentorDungeonBonus,
} from '../types/game';
import {
  ELEMENT_ADVANTAGE_MULTIPLIER,
  ELEMENT_DISADVANTAGE_MULTIPLIER,
  CRITICAL_BASE_CHANCE,
  CRITICAL_BASE_MULTIPLIER,
  MAX_TEAM_SIZE,
  MAX_BATTLE_TURNS,
} from '../types/game';

const ELEMENT_RELATIONS: ElementRelation[] = [
  { attacker: 'fire', defender: 'wind', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'fire', defender: 'earth', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'fire', defender: 'water', relation: 'weak', multiplier: ELEMENT_DISADVANTAGE_MULTIPLIER },
  { attacker: 'water', defender: 'fire', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'water', defender: 'earth', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'water', defender: 'wind', relation: 'weak', multiplier: ELEMENT_DISADVANTAGE_MULTIPLIER },
  { attacker: 'earth', defender: 'water', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'earth', defender: 'light', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'earth', defender: 'wind', relation: 'weak', multiplier: ELEMENT_DISADVANTAGE_MULTIPLIER },
  { attacker: 'wind', defender: 'earth', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'wind', defender: 'dark', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'wind', defender: 'fire', relation: 'weak', multiplier: ELEMENT_DISADVANTAGE_MULTIPLIER },
  { attacker: 'light', defender: 'dark', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'light', defender: 'earth', relation: 'weak', multiplier: ELEMENT_DISADVANTAGE_MULTIPLIER },
  { attacker: 'dark', defender: 'light', relation: 'strong', multiplier: ELEMENT_ADVANTAGE_MULTIPLIER },
  { attacker: 'dark', defender: 'wind', relation: 'weak', multiplier: ELEMENT_DISADVANTAGE_MULTIPLIER },
];

export const getElementRelation = (attacker: MagicType, defender: MagicType): ElementRelation => {
  const relation = ELEMENT_RELATIONS.find(
    r => r.attacker === attacker && r.defender === defender
  );
  return relation || { attacker, defender, relation: 'neutral', multiplier: 1.0 };
};

export const getElementAdvantage = (attacker: MagicType, defender: MagicType): ElementAdvantageType => {
  return getElementRelation(attacker, defender).relation;
};

export const getElementMultiplier = (attacker: MagicType, defender: MagicType): number => {
  return getElementRelation(attacker, defender).multiplier;
};

export const getStrongAgainst = (element: MagicType): MagicType[] => {
  return ELEMENT_RELATIONS
    .filter(r => r.attacker === element && r.relation === 'strong')
    .map(r => r.defender);
};

export const getWeakAgainst = (element: MagicType): MagicType[] => {
  return ELEMENT_RELATIONS
    .filter(r => r.attacker === element && r.relation === 'weak')
    .map(r => r.defender);
};

export const ELEMENT_COLORS: Record<MagicType, string> = {
  fire: '#FF5722',
  water: '#2196F3',
  earth: '#795548',
  wind: '#4CAF50',
  light: '#FFD700',
  dark: '#9C27B0',
};

export const ELEMENT_NAMES: Record<MagicType, string> = {
  fire: '火',
  water: '水',
  earth: '土',
  wind: '风',
  light: '光',
  dark: '暗',
};

export const ELEMENT_ICONS: Record<MagicType, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🪨',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

const ENEMY_TEMPLATES: EnemyTemplate[] = [
  {
    id: 'fire_slime',
    name: '火焰史莱姆',
    magicType: 'fire',
    baseHp: 80,
    baseAttack: 15,
    baseDefense: 5,
    baseSpeed: 8,
    isBoss: false,
    skills: [{ id: 'fire_hit', name: '火焰冲击', type: 'fire', damage: 20, cost: 5, description: '基础火焰攻击' }],
    icon: '🔥',
    description: '由火焰凝聚而成的低级魔物',
  },
  {
    id: 'water_sprite',
    name: '水之精灵',
    magicType: 'water',
    baseHp: 90,
    baseAttack: 12,
    baseDefense: 8,
    baseSpeed: 10,
    isBoss: false,
    skills: [{ id: 'water_splash', name: '水流冲击', type: 'water', damage: 18, cost: 5, description: '基础水系攻击' }],
    icon: '💧',
    description: '栖息于水源的精灵生物',
  },
  {
    id: 'earth_golem',
    name: '岩石傀儡',
    magicType: 'earth',
    baseHp: 120,
    baseAttack: 14,
    baseDefense: 15,
    baseSpeed: 5,
    isBoss: false,
    skills: [{ id: 'rock_smash', name: '岩石粉碎', type: 'earth', damage: 22, cost: 6, description: '重击地面造成伤害' }],
    icon: '🪨',
    description: '由魔法驱动的石制守卫',
  },
  {
    id: 'wind_wolf',
    name: '疾风狼',
    magicType: 'wind',
    baseHp: 70,
    baseAttack: 18,
    baseDefense: 6,
    baseSpeed: 15,
    isBoss: false,
    skills: [{ id: 'wind_slash', name: '风刃斩', type: 'wind', damage: 25, cost: 6, description: '快速的风系攻击' }],
    icon: '🌪️',
    description: '速度极快的风属性魔兽',
  },
  {
    id: 'light_angel',
    name: '光明天使',
    magicType: 'light',
    baseHp: 85,
    baseAttack: 16,
    baseDefense: 10,
    baseSpeed: 12,
    isBoss: false,
    skills: [{ id: 'holy_ray', name: '神圣射线', type: 'light', damage: 24, cost: 7, description: '光明属性的神圣攻击' }],
    icon: '✨',
    description: '散发着神圣光芒的天使',
  },
  {
    id: 'dark_shadow',
    name: '暗影刺客',
    magicType: 'dark',
    baseHp: 75,
    baseAttack: 20,
    baseDefense: 5,
    baseSpeed: 14,
    isBoss: false,
    skills: [{ id: 'shadow_strike', name: '暗影突袭', type: 'dark', damage: 28, cost: 7, description: '从暗影中发起的致命攻击' }],
    icon: '🌑',
    description: '潜伏于暗影中的刺客',
  },
  {
    id: 'fire_dragon',
    name: '炎龙',
    magicType: 'fire',
    baseHp: 300,
    baseAttack: 35,
    baseDefense: 20,
    baseSpeed: 10,
    isBoss: true,
    skills: [
      { id: 'flame_breath', name: '烈焰吐息', type: 'fire', damage: 50, cost: 15, description: '喷出毁灭性的火焰' },
      { id: 'inferno', name: '地狱烈焰', type: 'fire', damage: 80, cost: 25, description: '召唤地狱之火焚烧一切' },
    ],
    icon: '🐉',
    description: '传说中的火焰巨龙，拥有毁灭性的力量',
  },
  {
    id: 'water_serpent',
    name: '深海巨蟒',
    magicType: 'water',
    baseHp: 280,
    baseAttack: 30,
    baseDefense: 25,
    baseSpeed: 8,
    isBoss: true,
    skills: [
      { id: 'tsunami', name: '海啸', type: 'water', damage: 45, cost: 15, description: '召唤巨浪淹没敌人' },
      { id: 'water_prison', name: '水牢', type: 'water', damage: 60, cost: 20, description: '用水流困住并伤害敌人' },
    ],
    icon: '🐍',
    description: '深海中的巨型海蛇，掌控着水之力量',
  },
  {
    id: 'earth_titan',
    name: '大地泰坦',
    magicType: 'earth',
    baseHp: 400,
    baseAttack: 28,
    baseDefense: 35,
    baseSpeed: 5,
    isBoss: true,
    skills: [
      { id: 'earthquake', name: '地震', type: 'earth', damage: 40, cost: 15, description: '引发强烈地震' },
      { id: 'mountain_crush', name: '山崩地裂', type: 'earth', damage: 70, cost: 25, description: '召唤巨石碾压敌人' },
    ],
    icon: '🗿',
    description: '沉睡于大地深处的远古巨人',
  },
];

export const getEnemyTemplates = (): EnemyTemplate[] => ENEMY_TEMPLATES;

export const getEnemyTemplateByType = (magicType: MagicType, isBoss: boolean = false): EnemyTemplate | undefined => {
  return ENEMY_TEMPLATES.find(e => e.magicType === magicType && e.isBoss === isBoss);
};

export const generateWaveConfig = (dungeonLevel: number, waveNumber: number, totalWaves: number): DungeonWaveConfig => {
  const isBossWave = waveNumber === totalWaves;
  const waveDifficulty = 0.8 + (waveNumber / totalWaves) * 0.4;
  const MAGIC_TYPES: MagicType[] = ['fire', 'water', 'earth', 'wind', 'light', 'dark'];
  
  if (isBossWave) {
    const bossType = MAGIC_TYPES[Math.floor(Math.random() * MAGIC_TYPES.length)];
    const minionTypes = MAGIC_TYPES.filter(t => t !== bossType).slice(0, 2);
    
    return {
      waveNumber,
      isBossWave: true,
      enemies: [
        { magicType: bossType, count: 1, isBoss: true, levelMultiplier: 1.2 + dungeonLevel * 0.1 },
        ...minionTypes.map(t => ({
          magicType: t,
          count: 1,
          isBoss: false,
          levelMultiplier: waveDifficulty,
        })),
      ],
    };
  }
  
  const enemyCount = Math.min(3, 1 + Math.floor(waveNumber / 2));
  const shuffledTypes = [...MAGIC_TYPES].sort(() => Math.random() - 0.5).slice(0, enemyCount);
  
  return {
    waveNumber,
    isBossWave: false,
    enemies: shuffledTypes.map(magicType => ({
      magicType,
      count: 1,
      isBoss: false,
      levelMultiplier: waveDifficulty,
    })),
  };
};

export const generateDungeonWaves = (dungeon: Dungeon): DungeonWaveConfig[] => {
  const waves: DungeonWaveConfig[] = [];
  for (let i = 1; i <= dungeon.waves; i++) {
    waves.push(generateWaveConfig(dungeon.level, i, dungeon.waves));
  }
  return waves;
};

let _enemyIdCounter = 0;

export const createEnemyUnit = (
  template: EnemyTemplate,
  dungeonLevel: number,
  levelMultiplier: number,
  position: number
): BattleUnit => {
  const effectiveLevel = Math.floor(dungeonLevel * levelMultiplier);
  const levelBonus = 1 + effectiveLevel * 0.1;
  _enemyIdCounter++;
  
  return {
    id: `enemy_${_enemyIdCounter}_${Math.random().toString(36).substring(2, 9)}`,
    name: template.name,
    magicType: template.magicType,
    level: effectiveLevel,
    currentHp: Math.floor(template.baseHp * levelBonus * (template.isBoss ? 1.5 : 1)),
    maxHp: Math.floor(template.baseHp * levelBonus * (template.isBoss ? 1.5 : 1)),
    attack: Math.floor(template.baseAttack * levelBonus),
    defense: Math.floor(template.baseDefense * levelBonus),
    speed: Math.floor(template.baseSpeed * levelBonus),
    skills: template.skills,
    isPlayer: false,
    position,
    buffs: [],
    debuffs: [],
    hasActed: false,
    isBoss: template.isBoss,
  };
};

export const generateWaveEnemies = (
  waveConfig: DungeonWaveConfig,
  dungeonLevel: number
): BattleUnit[] => {
  const enemies: BattleUnit[] = [];
  let position = 0;
  
  for (const enemyConfig of waveConfig.enemies) {
    for (let i = 0; i < enemyConfig.count; i++) {
      const template = getEnemyTemplateByType(enemyConfig.magicType, enemyConfig.isBoss);
      if (template) {
        enemies.push(createEnemyUnit(template, dungeonLevel, enemyConfig.levelMultiplier, position));
        position++;
      }
    }
  }
  
  return enemies;
};

export const createPlayerUnit = (student: Student, position: number): BattleUnit => {
  const baseAttack = 10 + student.level * 3;
  const baseDefense = 5 + student.level * 2;
  const baseSpeed = 8 + student.level * 1.5;
  
  let attackBonus = 0;
  let defenseBonus = 0;
  
  for (const trait of student.traits) {
    for (const effect of trait.effects) {
      if (effect.type === 'all_stats') {
        attackBonus += effect.value;
        defenseBonus += effect.value;
      }
      if (effect.type === 'skill_damage') {
        attackBonus += effect.value;
      }
      if (effect.type === 'magic_affinity' && effect.magicType === student.magicType) {
        attackBonus += effect.value;
      }
    }
  }
  
  return {
    id: student.id,
    name: student.name,
    magicType: student.magicType,
    level: student.level,
    currentHp: student.currentHp,
    maxHp: student.maxHp,
    attack: Math.floor(baseAttack * (1 + attackBonus)),
    defense: Math.floor(baseDefense * (1 + defenseBonus)),
    speed: Math.floor(baseSpeed),
    skills: student.skills.length > 0 ? student.skills : [
      {
        id: `basic_${student.magicType}`,
        name: `${ELEMENT_NAMES[student.magicType]}系普攻`,
        type: student.magicType,
        damage: 15 + student.level * 3,
        cost: 3,
        description: '基础攻击',
      },
    ],
    isPlayer: true,
    position,
    buffs: [],
    debuffs: [],
    hasActed: false,
  };
};

export const createPlayerTeam = (students: Student[]): BattleUnit[] => {
  return students.slice(0, MAX_TEAM_SIZE).map((student, index) => createPlayerUnit(student, index));
};

export const calculateDamage = (params: DamageCalculationParams): DamageResult => {
  const { attacker, defender, skill, teamBonuses, activeBuffs, activeDebuffs, includeCritical } = params;
  
  const baseDamage = skill.damage + attacker.attack * 0.5;
  
  const elementMultiplier = getElementMultiplier(skill.type, defender.magicType);
  const elementRelation = getElementAdvantage(skill.type, defender.magicType);
  
  let buffMultiplier = 1;
  for (const buff of activeBuffs) {
    if (buff.type === 'attack_up') {
      buffMultiplier += buff.value;
    }
  }
  
  let debuffMultiplier = 1;
  for (const debuff of activeDebuffs) {
    if (debuff.type === 'attack_down') {
      debuffMultiplier -= debuff.value;
    }
  }
  
  let isCritical = false;
  let criticalMultiplier = 1;
  if (includeCritical) {
    const critChance = CRITICAL_BASE_CHANCE + (attacker.speed - defender.speed) * 0.01;
    if (Math.random() < Math.max(0.05, Math.min(0.5, critChance))) {
      isCritical = true;
      criticalMultiplier = CRITICAL_BASE_MULTIPLIER;
    }
  }
  
  let teamBonusMultiplier = 1;
  for (const bonus of teamBonuses) {
    if (bonus.bonusType === 'damage') {
      teamBonusMultiplier += bonus.value;
    }
    if (bonus.bonusType === 'crit' && isCritical) {
      criticalMultiplier += bonus.value;
    }
  }
  
  const defenseReduction = defender.defense * 0.3 / (defender.defense * 0.3 + 100);
  const defenseMultiplier = 1 - defenseReduction;
  
  let defenderDebuffMultiplier = 1;
  for (const debuff of defender.debuffs) {
    if (debuff.type === 'defense_down') {
      defenderDebuffMultiplier += debuff.value;
    }
  }
  
  const preDefenseDamage = baseDamage * elementMultiplier * buffMultiplier * debuffMultiplier * criticalMultiplier * teamBonusMultiplier;
  const finalDamage = Math.max(1, Math.floor(preDefenseDamage * defenseMultiplier * defenderDebuffMultiplier));
  
  const isKill = defender.currentHp - finalDamage <= 0;
  
  return {
    baseDamage: Math.floor(baseDamage),
    elementMultiplier,
    elementRelation,
    criticalMultiplier,
    isCritical,
    buffMultiplier,
    debuffMultiplier,
    defenseReduction,
    finalDamage,
    isKill,
  };
};

export const TEAM_COMP_BONUSES: TeamCompBonus[] = [
  {
    id: 'triple_element',
    name: '三元归一',
    description: '队伍包含3种不同元素，伤害+15%',
    icon: '⚡',
    bonusType: 'damage',
    value: 0.15,
    requiredElements: [],
    elementCount: 3,
  },
  {
    id: 'four_element',
    name: '四象俱全',
    description: '队伍包含4种不同元素，伤害+25%',
    icon: '🌟',
    bonusType: 'damage',
    value: 0.25,
    requiredElements: [],
    elementCount: 4,
  },
  {
    id: 'four_element_crit',
    name: '四象俱全·暴击',
    description: '队伍包含4种不同元素，暴击伤害+10%',
    icon: '🌟',
    bonusType: 'crit',
    value: 0.10,
    requiredElements: [],
    elementCount: 4,
  },
  {
    id: 'fire_wind',
    name: '风火燎原',
    description: '火+风组合，火元素伤害+20%',
    icon: '🔥🌪️',
    bonusType: 'damage',
    value: 0.20,
    requiredElements: ['fire', 'wind'],
    elementCount: 2,
  },
  {
    id: 'water_earth',
    name: '水土交融',
    description: '水+土组合，防御+25%',
    icon: '💧🪨',
    bonusType: 'defense',
    value: 0.25,
    requiredElements: ['water', 'earth'],
    elementCount: 2,
  },
  {
    id: 'light_dark',
    name: '光暗交织',
    description: '光+暗组合，暴击伤害+30%',
    icon: '✨🌑',
    bonusType: 'crit',
    value: 0.30,
    requiredElements: ['light', 'dark'],
    elementCount: 2,
  },
  {
    id: 'fire_earth',
    name: '熔岩爆发',
    description: '火+土组合，攻击+20%',
    icon: '🔥🪨',
    bonusType: 'damage',
    value: 0.20,
    requiredElements: ['fire', 'earth'],
    elementCount: 2,
  },
  {
    id: 'water_wind',
    name: '风雨同舟',
    description: '水+风组合，速度+20%',
    icon: '💧🌪️',
    bonusType: 'speed',
    value: 0.20,
    requiredElements: ['water', 'wind'],
    elementCount: 2,
  },
  {
    id: 'same_element',
    name: '元素共鸣',
    description: '3个相同元素，该元素伤害+30%',
    icon: '💫',
    bonusType: 'damage',
    value: 0.30,
    requiredElements: [],
    elementCount: 0,
  },
];

export const evaluateTeamComposition = (team: Student[]): TeamCompEvaluation => {
  if (team.length === 0) {
    return {
      score: 0,
      grade: 'D',
      bonuses: [],
      weaknesses: [],
      strengths: [],
      coverage: 0,
      synergyLevel: 0,
      recommendations: ['请选择至少1名队员出战'],
    };
  }
  
  const elements = team.map(s => s.magicType);
  const uniqueElements = [...new Set(elements)];
  const elementCounts: Record<MagicType, number> = {
    fire: 0, water: 0, earth: 0, wind: 0, light: 0, dark: 0,
  };
  elements.forEach(e => elementCounts[e]++);
  
  const bonuses: TeamCompBonus[] = [];
  
  if (uniqueElements.length >= 4) {
    bonuses.push(TEAM_COMP_BONUSES.find(b => b.id === 'four_element')!);
    bonuses.push(TEAM_COMP_BONUSES.find(b => b.id === 'four_element_crit')!);
  } else if (uniqueElements.length >= 3) {
    bonuses.push(TEAM_COMP_BONUSES.find(b => b.id === 'triple_element')!);
  }
  
  for (const bonus of TEAM_COMP_BONUSES.filter(b => b.requiredElements.length > 0)) {
    const hasAll = bonus.requiredElements.every(e => elements.includes(e as MagicType));
    if (hasAll) {
      bonuses.push(bonus);
    }
  }
  
  for (const [element, count] of Object.entries(elementCounts)) {
    if (count >= 3) {
      bonuses.push({
        ...TEAM_COMP_BONUSES.find(b => b.id === 'same_element')!,
        requiredElements: [element as MagicType],
        description: `${ELEMENT_NAMES[element as MagicType]}元素共鸣，${ELEMENT_NAMES[element as MagicType]}系伤害+30%`,
      });
    }
  }
  
  const strengths: MagicType[] = [];
  const weaknesses: MagicType[] = [];
  
  for (const element of uniqueElements) {
    const strong = getStrongAgainst(element);
    const weak = getWeakAgainst(element);
    strong.forEach(s => { if (!strengths.includes(s)) strengths.push(s); });
    weak.forEach(w => { if (!weaknesses.includes(w)) weaknesses.push(w); });
  }
  
  const coverage = uniqueElements.length / 6;
  
  let synergyLevel = 0;
  synergyLevel += uniqueElements.length * 10;
  synergyLevel += bonuses.length * 15;
  synergyLevel += team.filter(s => s.quality === 'legendary').length * 20;
  synergyLevel += team.filter(s => s.quality === 'epic').length * 10;
  
  const avgLevel = team.reduce((sum, s) => sum + s.level, 0) / team.length;
  synergyLevel += Math.floor(avgLevel);
  
  const totalSkillCount = team.reduce((sum, s) => sum + s.skills.length, 0);
  synergyLevel += totalSkillCount * 2;
  
  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (synergyLevel >= 100) grade = 'S';
  else if (synergyLevel >= 80) grade = 'A';
  else if (synergyLevel >= 60) grade = 'B';
  else if (synergyLevel >= 40) grade = 'C';
  
  const recommendations: string[] = [];
  
  if (team.length < MAX_TEAM_SIZE) {
    recommendations.push(`可以再添加 ${MAX_TEAM_SIZE - team.length} 名队员`);
  }
  
  if (uniqueElements.length < 3) {
    recommendations.push('建议增加更多元素种类以获得加成');
  }
  
  if (weaknesses.length > strengths.length) {
    recommendations.push('队伍存在较多克制弱点，建议调整');
  }
  
  const hasHealer = team.some(s => s.magicType === 'light' || s.magicType === 'water');
  if (!hasHealer && team.length >= 3) {
    recommendations.push('建议加入光系或水系学员提供续航');
  }
  
  const hasTank = team.some(s => s.magicType === 'earth' || s.maxHp > 150);
  if (!hasTank && team.length >= 3) {
    recommendations.push('建议加入土系或高HP学员作为坦克');
  }
  
  return {
    score: synergyLevel,
    grade,
    bonuses,
    weaknesses,
    strengths,
    coverage,
    synergyLevel,
    recommendations,
  };
};

export const getGradeColor = (grade: 'S' | 'A' | 'B' | 'C' | 'D'): string => {
  const colors: Record<string, string> = {
    S: '#FFD700',
    A: '#FF6B6B',
    B: '#4ECDC4',
    C: '#95E1D3',
    D: '#AAAAAA',
  };
  return colors[grade] || colors.D;
};

export const initializeBattleState = (
  playerTeam: Student[],
  dungeon: Dungeon,
  waves: DungeonWaveConfig[]
): BattleState => {
  const playerUnits = createPlayerTeam(playerTeam);
  const firstWaveEnemies = generateWaveEnemies(waves[0], dungeon.level);
  
  return {
    status: 'preparing',
    currentWave: 1,
    totalWaves: dungeon.waves,
    turnCount: 0,
    playerUnits,
    enemyUnits: firstWaveEnemies,
    selectedUnitId: null,
    selectedSkillId: null,
    targetableUnitIds: [],
    turnHistory: [],
    currentTurnActions: [],
    isPlayerTurn: true,
    currentUnitIndex: 0,
    turnOrder: [],
    autoBattle: false,
    battleSpeed: 1,
  };
};

export const getTurnOrder = (playerUnits: BattleUnit[], enemyUnits: BattleUnit[]): string[] => {
  const allUnits = [...playerUnits, ...enemyUnits].filter(u => u.currentHp > 0);
  allUnits.sort((a, b) => b.speed - a.speed);
  return allUnits.map(u => u.id);
};

export const startBattle = (state: BattleState): BattleState => {
  const turnOrder = getTurnOrder(state.playerUnits, state.enemyUnits);
  return {
    ...state,
    status: 'fighting',
    turnCount: state.turnCount || 1,
    turnOrder,
    currentUnitIndex: 0,
    isPlayerTurn: state.playerUnits.find(u => u.id === turnOrder[0])?.isPlayer ?? true,
    playerUnits: state.playerUnits.map(u => ({ ...u, hasActed: false })),
    enemyUnits: state.enemyUnits.map(u => ({ ...u, hasActed: false })),
  };
};

export const getCurrentUnit = (state: BattleState): BattleUnit | undefined => {
  const unitId = state.turnOrder[state.currentUnitIndex];
  return [...state.playerUnits, ...state.enemyUnits].find(u => u.id === unitId);
};

export const selectSkill = (state: BattleState, skillId: string): BattleState => {
  const currentUnit = getCurrentUnit(state);
  if (!currentUnit || !currentUnit.isPlayer) return state;
  
  const skill = currentUnit.skills.find(s => s.id === skillId);
  if (!skill) return state;
  
  const aliveEnemies = state.enemyUnits.filter(u => u.currentHp > 0);
  
  return {
    ...state,
    selectedSkillId: skillId,
    targetableUnitIds: aliveEnemies.map(u => u.id),
  };
};

export const executeSkill = (
  state: BattleState,
  targetId: string,
  teamBonuses: TeamCompBonus[]
): { newState: BattleState; result: BattleSkillResult } | null => {
  const currentUnit = getCurrentUnit(state);
  if (!currentUnit || !state.selectedSkillId) return null;
  
  const skill = currentUnit.skills.find(s => s.id === state.selectedSkillId);
  const target = [...state.playerUnits, ...state.enemyUnits].find(u => u.id === targetId);
  
  if (!skill || !target || target.currentHp <= 0) return null;
  
  const damageParams: DamageCalculationParams = {
    attacker: currentUnit,
    defender: target,
    skill,
    teamBonuses,
    activeBuffs: currentUnit.buffs,
    activeDebuffs: currentUnit.debuffs,
    includeCritical: true,
  };
  
  const damageResult = calculateDamage(damageParams);
  
  const kills: string[] = [];
  if (damageResult.isKill) {
    kills.push(target.id);
  }
  
  const actionResult: BattleSkillResult = {
    skillId: skill.id,
    skillName: skill.name,
    casterId: currentUnit.id,
    casterName: currentUnit.name,
    targetIds: [target.id],
    targetNames: [target.name],
    baseDamage: damageResult.baseDamage,
    finalDamage: damageResult.finalDamage,
    isCritical: damageResult.isCritical,
    criticalMultiplier: damageResult.criticalMultiplier,
    elementRelation: damageResult.elementRelation,
    elementMultiplier: damageResult.elementMultiplier,
    totalDamage: damageResult.finalDamage,
    kills,
    buffsApplied: [],
    debuffsApplied: [],
  };
  
  const updatedEnemies = state.enemyUnits.map(u => {
    if (u.id === target.id) {
      return {
        ...u,
        currentHp: Math.max(0, u.currentHp - damageResult.finalDamage),
      };
    }
    return u;
  });
  
  const updatedPlayerUnits = state.playerUnits.map(u => {
    if (u.id === target.id) {
      return {
        ...u,
        currentHp: Math.max(0, u.currentHp - damageResult.finalDamage),
      };
    }
    if (u.id === currentUnit.id) {
      return { ...u, hasActed: true };
    }
    return u;
  });
  
  const newState: BattleState = {
    ...state,
    playerUnits: updatedPlayerUnits,
    enemyUnits: updatedEnemies,
    selectedSkillId: null,
    targetableUnitIds: [],
    currentTurnActions: [...state.currentTurnActions, actionResult],
  };
  
  return { newState, result: actionResult };
};

export const nextTurn = (state: BattleState): BattleState => {
  const alivePlayerUnits = state.playerUnits.filter(u => u.currentHp > 0);
  const aliveEnemyUnits = state.enemyUnits.filter(u => u.currentHp > 0);
  
  if (alivePlayerUnits.length === 0) {
    return { ...state, status: 'defeat' };
  }
  
  if (aliveEnemyUnits.length === 0) {
    const turnRecord: BattleTurn = {
      turnNumber: state.turnCount,
      actions: state.currentTurnActions,
      playerUnitsRemaining: alivePlayerUnits.length,
      enemyUnitsRemaining: 0,
    };
    return {
      ...state,
      status: 'victory',
      turnHistory: [...state.turnHistory, turnRecord],
      currentTurnActions: [],
    };
  }
  
  let nextIndex = state.currentUnitIndex + 1;
  let turnCount = state.turnCount;
  let turnOrder = state.turnOrder;
  let isNewRound = false;
  
  while (nextIndex < turnOrder.length) {
    const nextUnitId = turnOrder[nextIndex];
    const nextUnit = [...state.playerUnits, ...state.enemyUnits].find(u => u.id === nextUnitId);
    if (nextUnit && nextUnit.currentHp > 0) {
      break;
    }
    nextIndex++;
  }
  
  if (nextIndex >= turnOrder.length) {
    turnCount++;
    nextIndex = 0;
    turnOrder = getTurnOrder(state.playerUnits, state.enemyUnits);
    isNewRound = true;
    
    if (turnCount > MAX_BATTLE_TURNS) {
      return { ...state, status: 'defeat' };
    }
  }
  
  const nextUnit = [...state.playerUnits, ...state.enemyUnits].find(u => u.id === turnOrder[nextIndex]);
  
  const updatedState: BattleState = {
    ...state,
    turnCount,
    currentUnitIndex: nextIndex,
    turnOrder,
    isPlayerTurn: nextUnit?.isPlayer ?? true,
  };
  
  if (isNewRound) {
    const turnRecord: BattleTurn = {
      turnNumber: state.turnCount,
      actions: state.currentTurnActions,
      playerUnitsRemaining: alivePlayerUnits.length,
      enemyUnitsRemaining: aliveEnemyUnits.length,
    };
    updatedState.turnHistory = [...state.turnHistory, turnRecord];
    updatedState.currentTurnActions = [];
    updatedState.playerUnits = state.playerUnits.map(u => ({ ...u, hasActed: false }));
    updatedState.enemyUnits = state.enemyUnits.map(u => ({ ...u, hasActed: false }));
  }
  
  return updatedState;
};

export const aiSelectSkill = (unit: BattleUnit): Skill => {
  return unit.skills[Math.floor(Math.random() * unit.skills.length)];
};

export const aiSelectTarget = (unit: BattleUnit, playerUnits: BattleUnit[]): BattleUnit | undefined => {
  const aliveTargets = playerUnits.filter(u => u.currentHp > 0);
  if (aliveTargets.length === 0) return undefined;
  
  const weakTargets = aliveTargets.filter(t => getElementAdvantage(unit.magicType, t.magicType) === 'strong');
  if (weakTargets.length > 0) {
    return weakTargets.reduce((a, b) => a.currentHp < b.currentHp ? a : b);
  }
  
  const lowHpTargets = aliveTargets.filter(t => t.currentHp / t.maxHp < 0.3);
  if (lowHpTargets.length > 0) {
    return lowHpTargets.reduce((a, b) => a.currentHp < b.currentHp ? a : b);
  }
  
  return aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
};

export const executeAITurn = (
  state: BattleState,
  _teamBonuses: TeamCompBonus[]
): { newState: BattleState; result: BattleSkillResult } | null => {
  const currentUnit = getCurrentUnit(state);
  if (!currentUnit || currentUnit.isPlayer) return null;
  
  const skill = aiSelectSkill(currentUnit);
  const target = aiSelectTarget(currentUnit, state.playerUnits);
  
  if (!target) return null;
  
  const damageParams: DamageCalculationParams = {
    attacker: currentUnit,
    defender: target,
    skill,
    teamBonuses: [],
    activeBuffs: currentUnit.buffs,
    activeDebuffs: currentUnit.debuffs,
    includeCritical: true,
  };
  
  const damageResult = calculateDamage(damageParams);
  
  const kills: string[] = [];
  if (damageResult.isKill) {
    kills.push(target.id);
  }
  
  const actionResult: BattleSkillResult = {
    skillId: skill.id,
    skillName: skill.name,
    casterId: currentUnit.id,
    casterName: currentUnit.name,
    targetIds: [target.id],
    targetNames: [target.name],
    baseDamage: damageResult.baseDamage,
    finalDamage: damageResult.finalDamage,
    isCritical: damageResult.isCritical,
    criticalMultiplier: damageResult.criticalMultiplier,
    elementRelation: damageResult.elementRelation,
    elementMultiplier: damageResult.elementMultiplier,
    totalDamage: damageResult.finalDamage,
    kills,
    buffsApplied: [],
    debuffsApplied: [],
  };
  
  const updatedPlayerUnits = state.playerUnits.map(u => {
    if (u.id === target.id) {
      return {
        ...u,
        currentHp: Math.max(0, u.currentHp - damageResult.finalDamage),
      };
    }
    return u;
  });
  
  const updatedEnemyUnits = state.enemyUnits.map(u => {
    if (u.id === currentUnit.id) {
      return { ...u, hasActed: true };
    }
    return u;
  });
  
  const newState: BattleState = {
    ...state,
    playerUnits: updatedPlayerUnits,
    enemyUnits: updatedEnemyUnits,
    currentTurnActions: [...state.currentTurnActions, actionResult],
    selectedSkillId: null,
    targetableUnitIds: [],
  };
  
  return { newState, result: actionResult };
};

export const calculateBattleSettlement = (
  state: BattleState,
  dungeon: Dungeon,
  teamBonuses: TeamCompBonus[],
  mentorBonus?: MentorDungeonBonus,
  isFirstClear: boolean = false
): BattleSettlement => {
  const victory = state.status === 'victory';
  const survivingMembers = state.playerUnits.filter(u => u.currentHp > 0).length;
  const totalMembers = state.playerUnits.length;
  const averageHpPercent = totalMembers > 0
    ? state.playerUnits.reduce((sum, u) => sum + (u.currentHp / Math.max(1, u.maxHp)), 0) / totalMembers
    : 0;
  
  let stars = 0;
  if (victory) {
    const hpThreshold = dungeon.id === 'dark_forest' ? 0.7 : dungeon.id === 'ancient_ruins' ? 0.6 : 0.5;
    if (survivingMembers === totalMembers && averageHpPercent >= hpThreshold) {
      stars = 3;
    } else if (survivingMembers >= Math.max(2, Math.ceil(totalMembers * 0.5))) {
      stars = 2;
    } else if (survivingMembers >= 1) {
      stars = 1;
    }
  }
  
  let totalDamageDealt = 0;
  let totalDamageTaken = 0;
  const elementBreakdown: Record<MagicType, { damage: number; kills: number }> = {
    fire: { damage: 0, kills: 0 },
    water: { damage: 0, kills: 0 },
    earth: { damage: 0, kills: 0 },
    wind: { damage: 0, kills: 0 },
    light: { damage: 0, kills: 0 },
    dark: { damage: 0, kills: 0 },
  };
  const skillUsage: Record<string, { uses: number; totalDamage: number }> = {};
  const playerDamageMap: Record<string, number> = {};
  
  for (const turn of state.turnHistory) {
    for (const action of turn.actions) {
      const caster = [...state.playerUnits, ...state.enemyUnits].find(u => u.id === action.casterId);
      if (caster?.isPlayer) {
        totalDamageDealt += action.totalDamage;
        elementBreakdown[caster.magicType].damage += action.totalDamage;
        elementBreakdown[caster.magicType].kills += action.kills.length;
        
        if (!playerDamageMap[caster.id]) playerDamageMap[caster.id] = 0;
        playerDamageMap[caster.id] += action.totalDamage;
      } else {
        totalDamageTaken += action.totalDamage;
      }
      
      if (!skillUsage[action.skillId]) {
        skillUsage[action.skillId] = { uses: 0, totalDamage: 0 };
      }
      skillUsage[action.skillId].uses += 1;
      skillUsage[action.skillId].totalDamage += action.totalDamage;
    }
  }
  
  for (const action of state.currentTurnActions) {
    const caster = [...state.playerUnits, ...state.enemyUnits].find(u => u.id === action.casterId);
    if (caster?.isPlayer) {
      totalDamageDealt += action.totalDamage;
      elementBreakdown[caster.magicType].damage += action.totalDamage;
      elementBreakdown[caster.magicType].kills += action.kills.length;
      
      if (!playerDamageMap[caster.id]) playerDamageMap[caster.id] = 0;
      playerDamageMap[caster.id] += action.totalDamage;
    } else {
      totalDamageTaken += action.totalDamage;
    }
    
    if (!skillUsage[action.skillId]) {
      skillUsage[action.skillId] = { uses: 0, totalDamage: 0 };
    }
    skillUsage[action.skillId].uses += 1;
    skillUsage[action.skillId].totalDamage += action.totalDamage;
  }
  
  let mvpId: string | null = null;
  let maxDamage = 0;
  for (const [id, damage] of Object.entries(playerDamageMap)) {
    if (damage > maxDamage) {
      maxDamage = damage;
      mvpId = id;
    }
  }
  
  const mvpUnit = mvpId ? state.playerUnits.find(u => u.id === mvpId) : null;
  
  const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;
  const rewardMultiplier = starMultiplier * (mentorBonus?.rewardMultiplier ?? 1);
  
  const defenseBonusCount = teamBonuses.filter(b => b.bonusType === 'defense').length;
  const teamExpBonus = 1 + defenseBonusCount * 0.05;
  
  const baseRewards = dungeon.rewards;
  const expPerStudent: Record<string, number> = {};
  let totalExp = 0;
  
  for (const unit of state.playerUnits) {
    const survivedBonus = unit.currentHp > 0 ? 1 : 0.5;
    const expGained = Math.floor((15 + dungeon.level * 5 + stars * 10) * (mentorBonus?.expMultiplier ?? 1) * teamExpBonus * survivedBonus);
    expPerStudent[unit.id] = expGained;
    totalExp += expGained;
  }
  
  const rewards: BattleRewards = {
    gold: Math.floor(baseRewards.gold * rewardMultiplier * (isFirstClear ? 2 : 1)),
    mana: Math.floor(baseRewards.mana * rewardMultiplier * (isFirstClear ? 2 : 1)),
    food: Math.floor(baseRewards.food * rewardMultiplier * (isFirstClear ? 2 : 1)),
    reputation: Math.floor(baseRewards.reputation * rewardMultiplier * (isFirstClear ? 2 : 1)),
    exp: totalExp,
    expPerStudent,
    drops: [],
  };
  
  return {
    victory,
    stars,
    totalTurns: state.turnCount,
    wavesCompleted: state.currentWave,
    survivingMembers,
    totalMembers,
    averageHpPercent,
    totalDamageDealt,
    totalDamageTaken,
    totalHealingDone: 0,
    mostValuablePlayer: mvpUnit?.name || null,
    rewards,
    elementBreakdown,
    skillUsage,
  };
};

export const applyBattleResultToStudents = (
  students: Student[],
  playerUnits: BattleUnit[],
  settlement: BattleSettlement
): Student[] => {
  return students.map(student => {
    const battleUnit = playerUnits.find(u => u.id === student.id);
    if (!battleUnit) return student;
    
    const expGained = settlement.rewards.expPerStudent[student.id] || 0;
    let newExp = student.exp + expGained;
    let newLevel = student.level;
    
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel++;
    }
    
    return {
      ...student,
      currentHp: Math.max(1, battleUnit.currentHp),
      exp: newExp,
      level: newLevel,
    };
  });
};
