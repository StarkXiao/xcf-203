import type { Building, Course, Dungeon, Resource, RecruitmentTicket, MagicType, Trait, StudentQuality, TraitRarity, BuildingSynergy } from '../types/game';

export const INITIAL_RESOURCES: Resource = {
  gold: 1000,
  mana: 500,
  food: 100,
  reputation: 50,
};

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'main_building',
    name: '主教学楼',
    level: 1,
    maxLevel: 10,
    cost: { gold: 200, mana: 100, food: 20, reputation: 0 },
    effect: { type: 'student_capacity', value: 5 },
    description: '增加5点学员容量',
  },
  {
    id: 'mana_tower',
    name: '魔力塔',
    level: 1,
    maxLevel: 10,
    cost: { gold: 300, mana: 200, food: 30, reputation: 10 },
    effect: { type: 'mana_capacity', value: 100 },
    description: '增加100魔力上限',
  },
  {
    id: 'library',
    name: '魔法图书馆',
    level: 1,
    maxLevel: 10,
    cost: { gold: 250, mana: 150, food: 25, reputation: 5 },
    effect: { type: 'course_speed', value: 10 },
    description: '课程经验获取+10%',
    prerequisites: [
      { buildingId: 'main_building', requiredLevel: 2 },
    ],
    synergyBonus: [
      {
        name: '知识殿堂',
        description: '图书馆与宿舍联动：学员学习效率与住宿容量双重提升',
        requires: [
          { buildingId: 'library', minLevel: 3 },
          { buildingId: 'dormitory', minLevel: 3 },
        ],
        effect: { type: 'efficiency_bonus', value: 15, valuePerLevel: 3 },
      },
      {
        name: '黄金三角',
        description: '三大核心建筑联动：容量、效率、声望全面提升',
        requires: [
          { buildingId: 'library', minLevel: 5 },
          { buildingId: 'dormitory', minLevel: 5 },
          { buildingId: 'dining_hall', minLevel: 5 },
        ],
        effect: { type: 'all_stats_bonus', value: 10, valuePerLevel: 2 },
      },
    ],
  },
  {
    id: 'training_field',
    name: '训练场',
    level: 1,
    maxLevel: 10,
    cost: { gold: 200, mana: 100, food: 30, reputation: 5 },
    effect: { type: 'student_capacity', value: 3 },
    description: '增加3点学员容量',
  },
  {
    id: 'dormitory',
    name: '学员宿舍',
    level: 1,
    maxLevel: 10,
    cost: { gold: 150, mana: 80, food: 40, reputation: 0 },
    effect: { type: 'student_capacity', value: 4 },
    description: '增加4点学员容量',
    prerequisites: [
      { buildingId: 'main_building', requiredLevel: 2 },
    ],
    synergyBonus: [
      {
        name: '美食学府',
        description: '宿舍与餐厅联动：学员居住满意度提升，容量与声望双增长',
        requires: [
          { buildingId: 'dormitory', minLevel: 3 },
          { buildingId: 'dining_hall', minLevel: 3 },
        ],
        effect: { type: 'capacity_bonus', value: 3, valuePerLevel: 1 },
      },
      {
        name: '黄金三角',
        description: '三大核心建筑联动：容量、效率、声望全面提升',
        requires: [
          { buildingId: 'library', minLevel: 5 },
          { buildingId: 'dormitory', minLevel: 5 },
          { buildingId: 'dining_hall', minLevel: 5 },
        ],
        effect: { type: 'all_stats_bonus', value: 10, valuePerLevel: 2 },
      },
    ],
  },
  {
    id: 'dining_hall',
    name: '魔法餐厅',
    level: 1,
    maxLevel: 10,
    cost: { gold: 180, mana: 90, food: 10, reputation: 5 },
    effect: { type: 'reputation_gain', value: 5 },
    description: '声望获取+5',
    prerequisites: [
      { buildingId: 'main_building', requiredLevel: 2 },
    ],
    synergyBonus: [
      {
        name: '美食学府',
        description: '宿舍与餐厅联动：学员居住满意度提升，容量与声望双增长',
        requires: [
          { buildingId: 'dormitory', minLevel: 3 },
          { buildingId: 'dining_hall', minLevel: 3 },
        ],
        effect: { type: 'reputation_bonus', value: 8, valuePerLevel: 2 },
      },
      {
        name: '黄金三角',
        description: '三大核心建筑联动：容量、效率、声望全面提升',
        requires: [
          { buildingId: 'library', minLevel: 5 },
          { buildingId: 'dormitory', minLevel: 5 },
          { buildingId: 'dining_hall', minLevel: 5 },
        ],
        effect: { type: 'all_stats_bonus', value: 10, valuePerLevel: 2 },
      },
    ],
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'basic_magic',
    name: '基础魔法',
    level: 1,
    duration: 3,
    cost: { gold: 50, mana: 30, food: 10, reputation: 0 },
    effect: { type: 'exp_gain', value: 20 },
    requiredLevel: 1,
  },
  {
    id: 'fire_magic',
    name: '火焰魔法',
    level: 2,
    duration: 5,
    cost: { gold: 100, mana: 60, food: 15, reputation: 5 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    magicType: 'fire',
  },
  {
    id: 'water_magic',
    name: '水系魔法',
    level: 2,
    duration: 5,
    cost: { gold: 100, mana: 60, food: 15, reputation: 5 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    magicType: 'water',
  },
  {
    id: 'earth_magic',
    name: '大地魔法',
    level: 2,
    duration: 5,
    cost: { gold: 100, mana: 60, food: 15, reputation: 5 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    magicType: 'earth',
  },
  {
    id: 'wind_magic',
    name: '风系魔法',
    level: 2,
    duration: 5,
    cost: { gold: 100, mana: 60, food: 15, reputation: 5 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    magicType: 'wind',
  },
  {
    id: 'advanced_magic',
    name: '高级魔法',
    level: 3,
    duration: 7,
    cost: { gold: 200, mana: 120, food: 25, reputation: 10 },
    effect: { type: 'exp_gain', value: 50 },
    requiredLevel: 5,
  },
];

export const INITIAL_DUNGEONS: Dungeon[] = [
  {
    id: 'dark_forest',
    name: '黑暗森林',
    level: 1,
    waves: 3,
    enemies: [],
    rewards: { gold: 300, mana: 150, food: 20, reputation: 10 },
    firstClearRewards: { gold: 800, mana: 400, food: 50, reputation: 30 },
    requiredLevel: 2,
    staminaCost: 10,
    stars: 0,
    bestStars: 0,
    firstCleared: false,
    clearedCount: 0,
    bestTeam: [],
    sweepUnlocked: false,
    starRequirements: {
      threeStar: '全员存活且平均HP≥70%',
      twoStar: '全员存活',
      oneStar: '至少1人存活',
    },
  },
  {
    id: 'ancient_ruins',
    name: '古代遗迹',
    level: 3,
    waves: 5,
    enemies: [],
    rewards: { gold: 500, mana: 300, food: 40, reputation: 25 },
    firstClearRewards: { gold: 1200, mana: 700, food: 100, reputation: 60 },
    requiredLevel: 5,
    staminaCost: 15,
    stars: 0,
    bestStars: 0,
    firstCleared: false,
    clearedCount: 0,
    bestTeam: [],
    sweepUnlocked: false,
    starRequirements: {
      threeStar: '全员存活且平均HP≥60%',
      twoStar: '至少2人存活',
      oneStar: '至少1人存活',
    },
  },
  {
    id: 'dragon_lair',
    name: '巨龙巢穴',
    level: 5,
    waves: 7,
    enemies: [],
    rewards: { gold: 1000, mana: 600, food: 80, reputation: 50 },
    firstClearRewards: { gold: 2500, mana: 1500, food: 200, reputation: 120 },
    requiredLevel: 10,
    staminaCost: 25,
    stars: 0,
    bestStars: 0,
    firstCleared: false,
    clearedCount: 0,
    bestTeam: [],
    sweepUnlocked: false,
    starRequirements: {
      threeStar: '全员存活且平均HP≥50%',
      twoStar: '至少2人存活',
      oneStar: '至少1人存活',
    },
  },
];

export const RECRUITMENT_TICKETS: RecruitmentTicket[] = [
  {
    id: 'common_ticket',
    quality: 'common',
    cost: { gold: 100, mana: 50, food: 0, reputation: 0 },
  },
  {
    id: 'rare_ticket',
    quality: 'rare',
    cost: { gold: 300, mana: 150, food: 10, reputation: 20 },
  },
  {
    id: 'epic_ticket',
    quality: 'epic',
    cost: { gold: 800, mana: 400, food: 30, reputation: 50 },
  },
];

const MAGIC_TYPES: MagicType[] = ['fire', 'water', 'earth', 'wind', 'light', 'dark'];

const FIRST_NAMES = ['艾琳娜', '马尔科', '索菲亚', '莱昂纳德', '维多利亚', '奥古斯特', '薇薇安', '塞巴斯蒂安', '阿芙拉', '珀西瓦尔'];
const LAST_NAMES = ['星火', '寒霜', '雷霆', '月光', '暗影', '烈阳', '清风', '幽泉', '炽焰', '寒冰'];

export const generateStudentName = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName}·${lastName}`;
};

export const getRandomMagicType = (): MagicType => {
  return MAGIC_TYPES[Math.floor(Math.random() * MAGIC_TYPES.length)];
};

export const getQualityMultiplier = (quality: RecruitmentTicket['quality']): number => {
  switch (quality) {
    case 'legendary': return 3;
    case 'epic': return 2;
    case 'rare': return 1.5;
    default: return 1;
  }
};

export const TRAIT_POOL: Trait[] = [
  {
    id: 'genius',
    name: '天才',
    description: '学习速度提升20%',
    rarity: 'rare',
    effects: [{ type: 'learning_speed', value: 0.2 }],
  },
  {
    id: 'fire_affinity',
    name: '火焰亲和',
    description: '火系魔法技能伤害提升30%',
    rarity: 'common',
    effects: [{ type: 'magic_affinity', value: 0.3, magicType: 'fire' }],
  },
  {
    id: 'water_affinity',
    name: '水系亲和',
    description: '水系魔法技能伤害提升30%',
    rarity: 'common',
    effects: [{ type: 'magic_affinity', value: 0.3, magicType: 'water' }],
  },
  {
    id: 'earth_affinity',
    name: '大地亲和',
    description: '土系魔法技能伤害提升30%',
    rarity: 'common',
    effects: [{ type: 'magic_affinity', value: 0.3, magicType: 'earth' }],
  },
  {
    id: 'wind_affinity',
    name: '风系亲和',
    description: '风系魔法技能伤害提升30%',
    rarity: 'common',
    effects: [{ type: 'magic_affinity', value: 0.3, magicType: 'wind' }],
  },
  {
    id: 'light_affinity',
    name: '光明亲和',
    description: '光系魔法技能伤害提升30%',
    rarity: 'rare',
    effects: [{ type: 'magic_affinity', value: 0.3, magicType: 'light' }],
  },
  {
    id: 'dark_affinity',
    name: '暗影亲和',
    description: '暗系魔法技能伤害提升30%',
    rarity: 'rare',
    effects: [{ type: 'magic_affinity', value: 0.3, magicType: 'dark' }],
  },
  {
    id: 'quick_learner',
    name: '快速学习者',
    description: '经验获取提升15%',
    rarity: 'common',
    effects: [{ type: 'exp_bonus', value: 0.15 }],
  },
  {
    id: 'mana_surge',
    name: '魔力澎湃',
    description: '技能伤害提升10%',
    rarity: 'common',
    effects: [{ type: 'skill_damage', value: 0.1 }],
  },
  {
    id: 'focused',
    name: '专注',
    description: '课程完成速度提升10%',
    rarity: 'common',
    effects: [{ type: 'course_speed', value: 0.1 }],
  },
  {
    id: 'prodigy',
    name: '神童',
    description: '潜力成长提升25%',
    rarity: 'epic',
    effects: [{ type: 'potential_growth', value: 0.25 }],
  },
  {
    id: 'arcane_mastery',
    name: '奥术精通',
    description: '所有属性提升15%',
    rarity: 'epic',
    effects: [{ type: 'all_stats', value: 0.15 }],
  },
  {
    id: 'legendary_talent',
    name: '传说天赋',
    description: '学习速度提升30%，经验获取提升20%',
    rarity: 'legendary',
    effects: [
      { type: 'learning_speed', value: 0.3 },
      { type: 'exp_bonus', value: 0.2 },
    ],
  },
  {
    id: 'elemental_master',
    name: '元素大师',
    description: '所有魔法亲和度提升20%',
    rarity: 'legendary',
    effects: [
      { type: 'magic_affinity', value: 0.2, magicType: 'fire' },
      { type: 'magic_affinity', value: 0.2, magicType: 'water' },
      { type: 'magic_affinity', value: 0.2, magicType: 'earth' },
      { type: 'magic_affinity', value: 0.2, magicType: 'wind' },
      { type: 'magic_affinity', value: 0.2, magicType: 'light' },
      { type: 'magic_affinity', value: 0.2, magicType: 'dark' },
    ],
  },
];

export const getPotentialRange = (quality: StudentQuality): { min: number; max: number } => {
  switch (quality) {
    case 'legendary': return { min: 1.5, max: 2.0 };
    case 'epic': return { min: 1.2, max: 1.6 };
    case 'rare': return { min: 0.9, max: 1.3 };
    default: return { min: 0.5, max: 1.0 };
  }
};

export const getTraitCount = (quality: StudentQuality): number => {
  switch (quality) {
    case 'legendary': return 3;
    case 'epic': return 2;
    case 'rare': return 1;
    default: return 1;
  }
};

export const getAvailableTraitRarities = (quality: StudentQuality): TraitRarity[] => {
  switch (quality) {
    case 'legendary': return ['common', 'rare', 'epic', 'legendary'];
    case 'epic': return ['common', 'rare', 'epic'];
    case 'rare': return ['common', 'rare'];
    default: return ['common'];
  }
};

export const generateTraits = (quality: StudentQuality): Trait[] => {
  const traitCount = getTraitCount(quality);
  const availableRarities = getAvailableTraitRarities(quality);
  const availableTraits = TRAIT_POOL.filter(trait => availableRarities.includes(trait.rarity));
  
  const selectedTraits: Trait[] = [];
  const usedIds = new Set<string>();
  
  for (let i = 0; i < traitCount && availableTraits.length > selectedTraits.length; i++) {
    const candidates = availableTraits.filter(t => !usedIds.has(t.id));
    if (candidates.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const trait = candidates[randomIndex];
    selectedTraits.push(trait);
    usedIds.add(trait.id);
  }
  
  return selectedTraits;
};

export const generatePotential = (quality: StudentQuality): number => {
  const range = getPotentialRange(quality);
  const potential = range.min + Math.random() * (range.max - range.min);
  return Math.round(potential * 100) / 100;
};

export const calculateExpGain = (
  baseExp: number,
  student: { potential: number; traits: Trait[] }
): number => {
  let multiplier = student.potential;
  
  const expBonus = student.traits
    .filter(t => t.effects.some(e => e.type === 'exp_bonus'))
    .reduce((sum, t) => {
      const effect = t.effects.find(e => e.type === 'exp_bonus');
      return sum + (effect?.value || 0);
    }, 0);
  
  multiplier += expBonus;
  
  return Math.floor(baseExp * multiplier);
};

export const calculateCourseSpeed = (
  baseSpeed: number,
  student: { potential: number; traits: Trait[] }
): number => {
  let multiplier = 1;
  
  multiplier += (student.potential - 1) * 0.5;
  
  const speedBonus = student.traits
    .filter(t => t.effects.some(e => e.type === 'course_speed' || e.type === 'learning_speed'))
    .reduce((sum, t) => {
      const speedEffect = t.effects.find(e => e.type === 'course_speed');
      const learningEffect = t.effects.find(e => e.type === 'learning_speed');
      return sum + (speedEffect?.value || 0) + (learningEffect?.value || 0);
    }, 0);
  
  multiplier += speedBonus;
  
  return baseSpeed * multiplier;
};

export const calculateSkillDamage = (
  baseDamage: number,
  student: { potential: number; traits: Trait[] },
  magicType?: { type: string }
): number => {
  let multiplier = 1;
  
  multiplier += (student.potential - 1) * 0.5;
  
  const allStatsBonus = student.traits
    .filter(t => t.effects.some(e => e.type === 'all_stats'))
    .reduce((sum, t) => {
      const effect = t.effects.find(e => e.type === 'all_stats');
      return sum + (effect?.value || 0);
    }, 0);
  multiplier += allStatsBonus;
  
  const skillDamageBonus = student.traits
    .filter(t => t.effects.some(e => e.type === 'skill_damage'))
    .reduce((sum, t) => {
      const effect = t.effects.find(e => e.type === 'skill_damage');
      return sum + (effect?.value || 0);
    }, 0);
  multiplier += skillDamageBonus;
  
  if (magicType) {
    const magicAffinityBonus = student.traits
      .filter(t => t.effects.some(e => e.type === 'magic_affinity' && e.magicType === magicType.type))
      .reduce((sum, t) => {
        const effect = t.effects.find(e => e.type === 'magic_affinity' && e.magicType === magicType.type);
        return sum + (effect?.value || 0);
      }, 0);
    multiplier += magicAffinityBonus;
  }
  
  return Math.floor(baseDamage * multiplier);
};

export const getStudentStatsSummary = (student: { potential: number; traits: Trait[] }) => {
  const expMultiplier = student.potential + student.traits
    .filter(t => t.effects.some(e => e.type === 'exp_bonus'))
    .reduce((sum, t) => {
      const effect = t.effects.find(e => e.type === 'exp_bonus');
      return sum + (effect?.value || 0);
    }, 0);
  
  const courseSpeedMultiplier = calculateCourseSpeed(1, student);
  
  return {
    expMultiplier: Math.round(expMultiplier * 100),
    courseSpeedMultiplier: Math.round(courseSpeedMultiplier * 100),
  };
};

export const checkPrerequisites = (
  building: Building,
  buildings: Building[]
): { met: boolean; requirements: { name: string; current: number; required: number }[] } => {
  if (!building.prerequisites || building.prerequisites.length === 0) {
    return { met: true, requirements: [] };
  }

  const requirements = building.prerequisites.map(prereq => {
    const prereqBuilding = buildings.find(b => b.id === prereq.buildingId);
    return {
      name: prereqBuilding?.name || prereq.buildingId,
      current: prereqBuilding?.level || 0,
      required: prereq.requiredLevel,
    };
  });

  const met = requirements.every(req => req.current >= req.required);
  return { met, requirements };
};

export const getActiveSynergies = (buildings: Building[]): { synergy: BuildingSynergy; totalValue: number }[] => {
  const seenSynergies = new Set<string>();
  const activeSynergies: { synergy: BuildingSynergy; totalValue: number }[] = [];

  buildings.forEach(building => {
    if (!building.synergyBonus) return;

    building.synergyBonus.forEach(synergy => {
      if (seenSynergies.has(synergy.name)) return;
      seenSynergies.add(synergy.name);

      const allMet = synergy.requires.every(req => {
        const b = buildings.find(bl => bl.id === req.buildingId);
        return b && b.level >= req.minLevel;
      });

      if (allMet) {
        const minLevel = Math.min(...synergy.requires.map(req => {
          const b = buildings.find(bl => bl.id === req.buildingId);
          return b?.level || 0;
        }));
        const excessLevels = Math.max(0, minLevel - synergy.requires[0].minLevel);
        const totalValue = synergy.effect.value + (synergy.effect.valuePerLevel || 0) * excessLevels;
        activeSynergies.push({ synergy, totalValue });
      }
    });
  });

  return activeSynergies;
};

export const calculateSynergyBonus = (
  buildings: Building[],
  type: 'capacity' | 'efficiency' | 'reputation'
): number => {
  const synergies = getActiveSynergies(buildings);
  return synergies.reduce((total, { synergy, totalValue }) => {
    if (synergy.effect.type === 'all_stats_bonus') {
      return total + totalValue;
    }
    if (
      (type === 'capacity' && synergy.effect.type === 'capacity_bonus') ||
      (type === 'efficiency' && synergy.effect.type === 'efficiency_bonus') ||
      (type === 'reputation' && synergy.effect.type === 'reputation_bonus')
    ) {
      return total + totalValue;
    }
    return total;
  }, 0);
};

export const calculateBattleStars = (
  dungeon: Dungeon,
  survivingMembers: number,
  totalMembers: number,
  averageHpPercent: number,
  _totalTurns: number
): number => {
  if (survivingMembers === 0) return 0;

  const hpThreshold = dungeon.id === 'dark_forest' ? 0.7 : dungeon.id === 'ancient_ruins' ? 0.6 : 0.5;

  if (survivingMembers === totalMembers && averageHpPercent >= hpThreshold) {
    return 3;
  }

  const minSurvivorsForTwoStars = totalMembers >= 3 ? 2 : totalMembers;
  if (survivingMembers >= minSurvivorsForTwoStars) {
    return 2;
  }

  if (survivingMembers >= 1) {
    return 1;
  }

  return 0;
};

export const calculateDungeonRewards = (
  dungeon: Dungeon,
  stars: number,
  isFirstClear: boolean
): Resource => {
  const baseRewards = dungeon.rewards;
  const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;

  const rewards: Resource = {
    gold: Math.floor(baseRewards.gold * starMultiplier),
    mana: Math.floor(baseRewards.mana * starMultiplier),
    food: Math.floor(baseRewards.food * starMultiplier),
    reputation: Math.floor(baseRewards.reputation * starMultiplier),
  };

  if (isFirstClear) {
    rewards.gold += dungeon.firstClearRewards.gold;
    rewards.mana += dungeon.firstClearRewards.mana;
    rewards.food += dungeon.firstClearRewards.food;
    rewards.reputation += dungeon.firstClearRewards.reputation;
  }

  return rewards;
};

export const getSweepRewardMultiplier = (bestStars: number): number => {
  if (bestStars >= 3) return 0.8;
  if (bestStars >= 2) return 0.6;
  return 0.4;
};

export const calculateSweepRewards = (dungeon: Dungeon): Resource => {
  const multiplier = getSweepRewardMultiplier(dungeon.bestStars);
  return {
    gold: Math.floor(dungeon.rewards.gold * multiplier),
    mana: Math.floor(dungeon.rewards.mana * multiplier),
    food: Math.floor(dungeon.rewards.food * multiplier),
    reputation: Math.floor(dungeon.rewards.reputation * multiplier),
  };
};

export const canSweep = (dungeon: Dungeon): boolean => {
  return dungeon.sweepUnlocked && dungeon.bestStars >= 3;
};