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
    effect: { type: 'recruit_quality', value: 1 },
    description: '招募品质加成+1/级',
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
  {
    id: 'fire_temple',
    name: '火焰神殿',
    level: 1,
    maxLevel: 10,
    cost: { gold: 400, mana: 250, food: 30, reputation: 15 },
    effect: { type: 'magic_type_bonus', value: 15, magicType: 'fire' },
    description: '火系课程经验+15%',
    prerequisites: [
      { buildingId: 'library', requiredLevel: 2 },
    ],
  },
  {
    id: 'water_temple',
    name: '水之圣殿',
    level: 1,
    maxLevel: 10,
    cost: { gold: 400, mana: 250, food: 30, reputation: 15 },
    effect: { type: 'magic_type_bonus', value: 15, magicType: 'water' },
    description: '水系课程经验+15%',
    prerequisites: [
      { buildingId: 'library', requiredLevel: 2 },
    ],
  },
  {
    id: 'earth_temple',
    name: '大地神殿',
    level: 1,
    maxLevel: 10,
    cost: { gold: 400, mana: 250, food: 30, reputation: 15 },
    effect: { type: 'magic_type_bonus', value: 15, magicType: 'earth' },
    description: '土系课程经验+15%',
    prerequisites: [
      { buildingId: 'library', requiredLevel: 2 },
    ],
  },
  {
    id: 'wind_temple',
    name: '风之圣殿',
    level: 1,
    maxLevel: 10,
    cost: { gold: 400, mana: 250, food: 30, reputation: 15 },
    effect: { type: 'magic_type_bonus', value: 15, magicType: 'wind' },
    description: '风系课程经验+15%',
    prerequisites: [
      { buildingId: 'library', requiredLevel: 2 },
    ],
  },
  {
    id: 'light_temple',
    name: '光明圣殿',
    level: 1,
    maxLevel: 10,
    cost: { gold: 500, mana: 300, food: 35, reputation: 25 },
    effect: { type: 'magic_type_bonus', value: 20, magicType: 'light' },
    description: '光系课程经验+20%',
    prerequisites: [
      { buildingId: 'library', requiredLevel: 3 },
    ],
  },
  {
    id: 'dark_temple',
    name: '暗影圣殿',
    level: 1,
    maxLevel: 10,
    cost: { gold: 500, mana: 300, food: 35, reputation: 25 },
    effect: { type: 'magic_type_bonus', value: 20, magicType: 'dark' },
    description: '暗系课程经验+20%',
    prerequisites: [
      { buildingId: 'library', requiredLevel: 3 },
    ],
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher_fire',
    name: '炎龙大师',
    magicType: 'fire',
    level: 5,
    expBonus: 0.25,
    skillBonus: 0.15,
    description: '精通火焰魔法的传奇法师，对火系学员有额外加成',
    salary: { gold: 50, mana: 30, food: 10, reputation: 5 },
  },
  {
    id: 'teacher_water',
    name: '潮汐贤者',
    magicType: 'water',
    level: 5,
    expBonus: 0.25,
    skillBonus: 0.15,
    description: '掌控水之力量的智者，擅长培养水系魔法师',
    salary: { gold: 50, mana: 30, food: 10, reputation: 5 },
  },
  {
    id: 'teacher_earth',
    name: '岩石守护者',
    magicType: 'earth',
    level: 5,
    expBonus: 0.25,
    skillBonus: 0.15,
    description: '坚如磐石的大地守护者，土系魔法专家',
    salary: { gold: 50, mana: 30, food: 10, reputation: 5 },
  },
  {
    id: 'teacher_wind',
    name: '疾风行者',
    magicType: 'wind',
    level: 5,
    expBonus: 0.25,
    skillBonus: 0.15,
    description: '来去如风的风系大师，速度与技巧并重',
    salary: { gold: 50, mana: 30, food: 10, reputation: 5 },
  },
  {
    id: 'teacher_light',
    name: '圣光大主教',
    magicType: 'light',
    level: 6,
    expBonus: 0.30,
    skillBonus: 0.20,
    description: '神圣力量的传承者，光系魔法权威',
    salary: { gold: 80, mana: 50, food: 15, reputation: 10 },
  },
  {
    id: 'teacher_dark',
    name: '深渊领主',
    magicType: 'dark',
    level: 6,
    expBonus: 0.30,
    skillBonus: 0.20,
    description: '掌握暗影奥秘的神秘者，暗系魔法大宗师',
    salary: { gold: 80, mana: 50, food: 15, reputation: 10 },
  },
  {
    id: 'teacher_arcane',
    name: '奥术智者',
    magicType: 'fire',
    level: 8,
    expBonus: 0.20,
    skillBonus: 0.25,
    description: '精通所有魔法的奥术大师，全属性均衡加成',
    salary: { gold: 120, mana: 80, food: 20, reputation: 15 },
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
    assignedTeacher: 'teacher_fire',
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
    assignedTeacher: 'teacher_water',
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
    assignedTeacher: 'teacher_earth',
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
    assignedTeacher: 'teacher_wind',
  },
  {
    id: 'light_magic',
    name: '光明魔法',
    level: 2,
    duration: 5,
    cost: { gold: 120, mana: 80, food: 15, reputation: 8 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    magicType: 'light',
    assignedTeacher: 'teacher_light',
  },
  {
    id: 'dark_magic',
    name: '暗影魔法',
    level: 2,
    duration: 5,
    cost: { gold: 120, mana: 80, food: 15, reputation: 8 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    magicType: 'dark',
    assignedTeacher: 'teacher_dark',
  },
  {
    id: 'advanced_magic',
    name: '高级魔法',
    level: 3,
    duration: 7,
    cost: { gold: 200, mana: 120, food: 25, reputation: 10 },
    effect: { type: 'exp_gain', value: 50 },
    requiredLevel: 5,
    assignedTeacher: 'teacher_arcane',
  },
  {
    id: 'master_fire',
    name: '火焰专精',
    level: 4,
    duration: 10,
    cost: { gold: 350, mana: 200, food: 30, reputation: 15 },
    effect: { type: 'exp_gain', value: 80 },
    requiredLevel: 8,
    magicType: 'fire',
    assignedTeacher: 'teacher_fire',
  },
  {
    id: 'master_water',
    name: '水系专精',
    level: 4,
    duration: 10,
    cost: { gold: 350, mana: 200, food: 30, reputation: 15 },
    effect: { type: 'exp_gain', value: 80 },
    requiredLevel: 8,
    magicType: 'water',
    assignedTeacher: 'teacher_water',
  },
  {
    id: 'master_earth',
    name: '大地专精',
    level: 4,
    duration: 10,
    cost: { gold: 350, mana: 200, food: 30, reputation: 15 },
    effect: { type: 'exp_gain', value: 80 },
    requiredLevel: 8,
    magicType: 'earth',
    assignedTeacher: 'teacher_earth',
  },
  {
    id: 'master_wind',
    name: '风系专精',
    level: 4,
    duration: 10,
    cost: { gold: 350, mana: 200, food: 30, reputation: 15 },
    effect: { type: 'exp_gain', value: 80 },
    requiredLevel: 8,
    magicType: 'wind',
    assignedTeacher: 'teacher_wind',
  },
  {
    id: 'master_light',
    name: '光明专精',
    level: 4,
    duration: 10,
    cost: { gold: 380, mana: 220, food: 30, reputation: 20 },
    effect: { type: 'exp_gain', value: 90 },
    requiredLevel: 8,
    magicType: 'light',
    assignedTeacher: 'teacher_light',
  },
  {
    id: 'master_dark',
    name: '暗影专精',
    level: 4,
    duration: 10,
    cost: { gold: 380, mana: 220, food: 30, reputation: 20 },
    effect: { type: 'exp_gain', value: 90 },
    requiredLevel: 8,
    magicType: 'dark',
    assignedTeacher: 'teacher_dark',
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
  averageHpPercent: number
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
  return dungeon.firstCleared && dungeon.bestStars >= 3;
};

export const INITIAL_STUDENT_MORALE = 80;
export const INITIAL_STUDENT_STAMINA = 100;

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const calculateFoodConsumption = (studentCount: number): number => {
  return Math.ceil(studentCount * 1);
};

export const calculateMoraleEfficiencyMultiplier = (morale: number): number => {
  if (morale >= 80) return 1.2;
  if (morale >= 60) return 1.0;
  if (morale >= 40) return 0.8;
  if (morale >= 20) return 0.5;
  return 0.2;
};

export const calculateStaminaEfficiencyMultiplier = (stamina: number): number => {
  if (stamina >= 80) return 1.1;
  if (stamina >= 60) return 1.0;
  if (stamina >= 40) return 0.9;
  if (stamina >= 20) return 0.7;
  return 0.4;
};

export const calculateDailyMoraleChange = (
  student: { status: string; morale: number },
  hasFood: boolean,
  dormitoryLevel: number
): number => {
  let change = 0;

  if (!hasFood) {
    change -= 25;
  } else if (student.status === 'resting') {
    change += 15 + dormitoryLevel * 2;
  } else if (student.status === 'studying') {
    change -= 5;
  } else {
    change += 3 + dormitoryLevel;
  }

  if (student.morale < 30) {
    change += 2;
  }

  return change;
};

export const calculateDailyStaminaChange = (
  student: { status: string; stamina: number },
  diningHallLevel: number
): number => {
  let change = 0;

  if (student.status === 'resting') {
    change += 30 + diningHallLevel * 3;
  } else if (student.status === 'studying') {
    change -= 15;
  } else if (student.status === 'training') {
    change -= 20;
  } else {
    change += 10 + diningHallLevel;
  }

  if (student.stamina < 30) {
    change += 5;
  }

  return change;
};

export const shouldStudentLeave = (morale: number, consecutiveLowDays: number): boolean => {
  if (morale <= 5) return true;
  if (morale < 15 && consecutiveLowDays >= 3) return true;
  return false;
};

export const getMoraleLabel = (morale: number): { label: string; color: string } => {
  if (morale >= 80) return { label: '热情高涨', color: '#4CAF50' };
  if (morale >= 60) return { label: '状态良好', color: '#8BC34A' };
  if (morale >= 40) return { label: '一般', color: '#FFC107' };
  if (morale >= 20) return { label: '低落', color: '#FF9800' };
  return { label: '濒临崩溃', color: '#f44336' };
};

export const getStaminaLabel = (stamina: number): { label: string; color: string } => {
  if (stamina >= 80) return { label: '精力充沛', color: '#2196F3' };
  if (stamina >= 60) return { label: '良好', color: '#03A9F4' };
  if (stamina >= 40) return { label: '有些疲惫', color: '#FFC107' };
  if (stamina >= 20) return { label: '疲惫', color: '#FF9800' };
  return { label: '精疲力竭', color: '#f44336' };
};

export const calculateDailyIncome = (
  buildings: Building[]
): { gold: number; mana: number; food: number; reputation: number } => {
  const diningHallLevel = buildings.find(b => b.id === 'dining_hall')?.level || 0;
  const manaTowerLevel = buildings.find(b => b.id === 'mana_tower')?.level || 0;
  const mainBuildingLevel = buildings.find(b => b.id === 'main_building')?.level || 0;
  const reputationBonus = calculateSynergyBonus(buildings, 'reputation');

  return {
    gold: 50 + diningHallLevel * 5 + mainBuildingLevel * 3,
    mana: 30 + manaTowerLevel * 10,
    food: 10 + diningHallLevel * 3,
    reputation: 5 + diningHallLevel * 2 + reputationBonus,
  };
};

export interface PityConfig {
  quality: StudentQuality;
  pityThreshold: number;
  guaranteedQuality: StudentQuality;
}

export const PITY_CONFIGS: PityConfig[] = [
  { quality: 'common', pityThreshold: 10, guaranteedQuality: 'rare' },
  { quality: 'rare', pityThreshold: 15, guaranteedQuality: 'epic' },
  { quality: 'epic', pityThreshold: 20, guaranteedQuality: 'legendary' },
  { quality: 'legendary', pityThreshold: 30, guaranteedQuality: 'legendary' },
];

export interface TicketProbability {
  ticketQuality: StudentQuality;
  probabilities: Record<StudentQuality, number>;
}

export const RECRUITMENT_PROBABILITIES: TicketProbability[] = [
  {
    ticketQuality: 'common',
    probabilities: { common: 0.70, rare: 0.25, epic: 0.045, legendary: 0.005 },
  },
  {
    ticketQuality: 'rare',
    probabilities: { common: 0.30, rare: 0.50, epic: 0.17, legendary: 0.03 },
  },
  {
    ticketQuality: 'epic',
    probabilities: { common: 0.10, rare: 0.30, epic: 0.45, legendary: 0.15 },
  },
  {
    ticketQuality: 'legendary',
    probabilities: { common: 0.05, rare: 0.15, epic: 0.35, legendary: 0.45 },
  },
];

export const QUALITY_WEIGHTS: Record<StudentQuality, number> = {
  common: 1,
  rare: 2,
  epic: 4,
  legendary: 8,
};

export const getPityThreshold = (ticketQuality: StudentQuality): number => {
  const config = PITY_CONFIGS.find(c => c.quality === ticketQuality);
  return config?.pityThreshold || 10;
};

export const getGuaranteedQuality = (ticketQuality: StudentQuality): StudentQuality => {
  const config = PITY_CONFIGS.find(c => c.quality === ticketQuality);
  return config?.guaranteedQuality || 'rare';
};

export const getProbabilities = (ticketQuality: StudentQuality): Record<StudentQuality, number> => {
  const config = RECRUITMENT_PROBABILITIES.find(p => p.ticketQuality === ticketQuality);
  return config?.probabilities || RECRUITMENT_PROBABILITIES[0].probabilities;
};

export const getQualityOrder = (quality: StudentQuality): number => {
  const order: Record<StudentQuality, number> = {
    common: 0,
    rare: 1,
    epic: 2,
    legendary: 3,
  };
  return order[quality];
};

export const rollQuality = (
  ticketQuality: StudentQuality,
  pityCount: number,
  recruitQualityBonus: number = 0
): { quality: StudentQuality; isPity: boolean; adjustedProbabilities: Record<StudentQuality, number> } => {
  const { adjusted: adjustedProbabilities } = computeAdjustedProbabilities(ticketQuality, pityCount, recruitQualityBonus);
  const pityThreshold = getPityThreshold(ticketQuality);
  const guaranteedQuality = getGuaranteedQuality(ticketQuality);

  const isPity = pityCount >= pityThreshold;

  if (isPity) {
    return { quality: guaranteedQuality, isPity: true, adjustedProbabilities };
  }

  const roll = Math.random();
  let cumulative = 0;
  const qualities: StudentQuality[] = ['legendary', 'epic', 'rare', 'common'];

  for (const quality of qualities) {
    cumulative += adjustedProbabilities[quality];
    if (roll < cumulative) {
      return { quality, isPity: false, adjustedProbabilities };
    }
  }

  return { quality: 'common', isPity: false, adjustedProbabilities };
};

export const getRecruitQualityBonus = (buildings: Building[]): number => {
  const trainingFieldLevel = buildings.find(b => b.id === 'training_field')?.level || 0;
  const libraryLevel = buildings.find(b => b.id === 'library')?.level || 0;
  return trainingFieldLevel * 0.5 + libraryLevel * 0.3;
};

export const computeAdjustedProbabilities = (
  ticketQuality: StudentQuality,
  pityCount: number,
  recruitQualityBonus: number = 0
): { adjusted: Record<StudentQuality, number>; base: Record<StudentQuality, number> } => {
  const baseProbabilities = getProbabilities(ticketQuality);
  const adjusted: Record<StudentQuality, number> = {
    common: baseProbabilities.common,
    rare: baseProbabilities.rare,
    epic: baseProbabilities.epic,
    legendary: baseProbabilities.legendary,
  };

  const ticketWeight = QUALITY_WEIGHTS[ticketQuality];
  const effectiveBonus = recruitQualityBonus * ticketWeight;

  if (effectiveBonus > 0) {
    const qualities: StudentQuality[] = ['common', 'rare', 'epic', 'legendary'];
    for (let i = 0; i < qualities.length - 1; i++) {
      const shift = Math.min(
        adjusted[qualities[i]] * effectiveBonus * 0.1,
        adjusted[qualities[i]] * 0.5
      );
      adjusted[qualities[i]] -= shift;
      adjusted[qualities[i + 1]] += shift;
    }
  }

  const pityThreshold = getPityThreshold(ticketQuality);
  const pityProgress = pityCount / pityThreshold;
  if (pityProgress >= 0.5) {
    const guaranteedQuality = getGuaranteedQuality(ticketQuality);
    const guaranteedOrder = getQualityOrder(guaranteedQuality);
    const boostFactor = (pityProgress - 0.5) * 2;
    const qualities: StudentQuality[] = ['common', 'rare', 'epic', 'legendary'];

    for (let i = 0; i < qualities.length; i++) {
      if (i < guaranteedOrder) {
        const reduction = adjusted[qualities[i]] * boostFactor * 0.8;
        adjusted[qualities[i]] -= reduction;
        adjusted[guaranteedQuality] += reduction;
      }
    }
  }

  if (pityCount >= pityThreshold) {
    const guaranteedQuality = getGuaranteedQuality(ticketQuality);
    const qualities: StudentQuality[] = ['common', 'rare', 'epic', 'legendary'];
    for (const q of qualities) {
      if (q !== guaranteedQuality) {
        adjusted[q] = 0;
      }
    }
    adjusted[guaranteedQuality] = 1;
  }

  return { adjusted, base: baseProbabilities };
};

export const calculateMagicTypeMatchBonus = (
  studentMagicType: MagicType,
  courseMagicType?: MagicType
): { match: boolean; bonus: number } => {
  if (!courseMagicType) {
    return { match: false, bonus: 0 };
  }
  const match = studentMagicType === courseMagicType;
  const bonus = match ? 0.30 : 0;
  return { match, bonus };
};

export const calculateTeacherBonus = (
  course: Course,
  teachers: Teacher[],
  courseMagicType?: MagicType
): { teacher?: Teacher; expBonus: number; skillBonus: number } => {
  if (!course.assignedTeacher) {
    return { expBonus: 0, skillBonus: 0 };
  }
  
  const teacher = teachers.find(t => t.id === course.assignedTeacher);
  if (!teacher) {
    return { expBonus: 0, skillBonus: 0 };
  }
  
  let expBonus = teacher.expBonus;
  let skillBonus = teacher.skillBonus;
  
  if (courseMagicType && teacher.magicType === courseMagicType) {
    expBonus *= 1.2;
    skillBonus *= 1.2;
  }
  
  return { teacher, expBonus, skillBonus };
};

export const calculateBuildingMagicBonus = (
  buildings: Building[],
  courseMagicType?: MagicType
): { bonus: number; contributingBuildings: string[] } => {
  if (!courseMagicType) {
    return { bonus: 0, contributingBuildings: [] };
  }
  
  let totalBonus = 0;
  const contributingBuildings: string[] = [];
  
  const libraryLevel = buildings.find(b => b.id === 'library')?.level || 0;
  const efficiencyBonus = calculateSynergyBonus(buildings, 'efficiency');
  totalBonus += libraryLevel * 0.05 + efficiencyBonus * 0.01;
  
  for (const building of buildings) {
    if (building.effect.type === 'magic_type_bonus' && 
        building.effect.magicType === courseMagicType) {
      const levelBonus = building.effect.value * building.level * 0.01;
      totalBonus += levelBonus;
      contributingBuildings.push(building.name);
    }
  }
  
  return { bonus: totalBonus, contributingBuildings };
};

export const calculateCourseBenefit = (
  baseExp: number,
  student: { magicType: MagicType; potential: number; traits: Trait[] },
  course: Course,
  buildings: Building[],
  teachers: Teacher[]
): CourseBenefitBreakdown => {
  const magicTypeResult = calculateMagicTypeMatchBonus(student.magicType, course.magicType);
  const teacherResult = calculateTeacherBonus(course, teachers, course.magicType);
  const buildingResult = calculateBuildingMagicBonus(buildings, course.magicType);
  
  const traitBonus = student.traits
    .filter(t => t.effects.some(e => e.type === 'exp_bonus'))
    .reduce((sum, t) => {
      const effect = t.effects.find(e => e.type === 'exp_bonus');
      return sum + (effect?.value || 0);
    }, 0);
  
  const learningSpeedTraitBonus = student.traits
    .filter(t => t.effects.some(e => e.type === 'learning_speed'))
    .reduce((sum, t) => {
      const effect = t.effects.find(e => e.type === 'learning_speed');
      return sum + (effect?.value || 0);
    }, 0);
  
  const totalTraitBonus = traitBonus + learningSpeedTraitBonus;
  
  const additiveMultiplier = 
    magicTypeResult.bonus + 
    teacherResult.expBonus + 
    buildingResult.bonus + 
    totalTraitBonus;
  
  const totalMultiplier = student.potential * (1 + additiveMultiplier);
  const totalExp = Math.floor(baseExp * totalMultiplier);
  
  return {
    baseExp,
    magicTypeMatchBonus: magicTypeResult.bonus,
    teacherBonus: teacherResult.expBonus,
    buildingBonus: buildingResult.bonus,
    traitBonus: totalTraitBonus,
    potentialMultiplier: student.potential,
    totalExp,
    magicTypeMatch: magicTypeResult.match,
    matchedTeacher: teacherResult.teacher,
    contributingBuildings: buildingResult.contributingBuildings,
  };
};

export const calculateEnhancedSkillDamage = (
  baseDamage: number,
  student: { potential: number; traits: Trait[]; magicType: MagicType },
  course: Course,
  teachers: Teacher[]
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
  
  if (course.magicType) {
    const magicAffinityBonus = student.traits
      .filter(t => t.effects.some(e => e.type === 'magic_affinity' && e.magicType === course.magicType))
      .reduce((sum, t) => {
        const effect = t.effects.find(e => e.type === 'magic_affinity' && e.magicType === course.magicType);
        return sum + (effect?.value || 0);
      }, 0);
    multiplier += magicAffinityBonus;
    
    if (student.magicType === course.magicType) {
      multiplier += 0.15;
    }
  }
  
  const teacherResult = calculateTeacherBonus(course, teachers, course.magicType);
  multiplier += teacherResult.skillBonus;
  
  return Math.floor(baseDamage * multiplier);
};

export const formatBenefitBreakdown = (breakdown: CourseBenefitBreakdown): string => {
  const parts: string[] = [];
  
  if (breakdown.magicTypeMatch) {
    parts.push(`✨ 系别匹配 +${Math.round(breakdown.magicTypeMatchBonus * 100)}%`);
  }
  if (breakdown.matchedTeacher) {
    parts.push(`👨‍🏫 ${breakdown.matchedTeacher.name} +${Math.round(breakdown.teacherBonus * 100)}%`);
  }
  if (breakdown.contributingBuildings.length > 0) {
    parts.push(`🏛️ ${breakdown.contributingBuildings.join('+')} +${Math.round(breakdown.buildingBonus * 100)}%`);
  }
  if (breakdown.traitBonus > 0) {
    parts.push(`💪 特质 +${Math.round(breakdown.traitBonus * 100)}%`);
  }
  parts.push(`⭐ 潜力 ×${breakdown.potentialMultiplier.toFixed(2)}`);
  
  return parts.join(' | ');
};