import type { Building, Course, Dungeon, Resource, RecruitmentTicket, MagicType, Trait, StudentQuality, TraitRarity, BuildingSynergy, Teacher, CourseBenefitBreakdown, Student, ReputationLevel, WeeklyGoal, StageTask, GoalProgress, WeeklyGoalsState, StageTasksState, GoalType, Club, ClubTask, ClubShopItem, ClubReputationLevel, ClubsState } from '../types/game';
import {
  HP_BATTLE_THRESHOLD,
  HP_COURSE_EFFICIENCY_THRESHOLD,
  HP_BASE_REST_RECOVERY,
  HP_BASE_DAILY_RECOVERY,
  HEAL_MANA_PER_HP,
  HEAL_GOLD_PER_HP,
  HEAL_FOOD_PER_HP,
  HEAL_INSTANT_MANA_COST,
  HEAL_INSTANT_GOLD_COST,
  HEAL_INSTANT_FOOD_COST,
} from '../types/game';

export { HP_BATTLE_THRESHOLD };

export const REPUTATION_LEVELS: ReputationLevel[] = [
  {
    level: 1,
    name: '默默无名',
    minReputation: 0,
    description: '初建的学院，还没有什么名气',
    bonuses: { recruitQualityBonus: 0, courseDiscount: 0, buildingCostDiscount: 0, dailyReputationBonus: 0 },
  },
  {
    level: 2,
    name: '小有名气',
    minReputation: 100,
    description: '周边地区开始知晓你的学院',
    bonuses: { recruitQualityBonus: 0.5, courseDiscount: 0.05, buildingCostDiscount: 0.03, dailyReputationBonus: 2 },
  },
  {
    level: 3,
    name: '声名远扬',
    minReputation: 300,
    description: '在王国境内有一定知名度',
    bonuses: { recruitQualityBonus: 1, courseDiscount: 0.1, buildingCostDiscount: 0.06, dailyReputationBonus: 5 },
  },
  {
    level: 4,
    name: '闻名遐迩',
    minReputation: 600,
    description: '周边王国都知道这所优秀的学院',
    bonuses: { recruitQualityBonus: 1.5, courseDiscount: 0.15, buildingCostDiscount: 0.1, dailyReputationBonus: 8 },
  },
  {
    level: 5,
    name: '如日中天',
    minReputation: 1000,
    description: '整个大陆闻名的顶尖学院',
    bonuses: { recruitQualityBonus: 2, courseDiscount: 0.2, buildingCostDiscount: 0.15, dailyReputationBonus: 12 },
  },
  {
    level: 6,
    name: '传奇学院',
    minReputation: 1500,
    description: '载入史册的传奇魔法学院',
    bonuses: { recruitQualityBonus: 3, courseDiscount: 0.25, buildingCostDiscount: 0.2, dailyReputationBonus: 18 },
  },
  {
    level: 7,
    name: '神话学府',
    minReputation: 2500,
    description: '神话般存在的最高学府',
    bonuses: { recruitQualityBonus: 5, courseDiscount: 0.3, buildingCostDiscount: 0.25, dailyReputationBonus: 25 },
  },
];

export const getReputationLevel = (reputation: number): ReputationLevel => {
  let currentLevel = REPUTATION_LEVELS[0];
  for (const level of REPUTATION_LEVELS) {
    if (reputation >= level.minReputation) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

export const getNextReputationLevel = (reputation: number): ReputationLevel | null => {
  const currentLevel = getReputationLevel(reputation);
  const nextIndex = REPUTATION_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  return nextIndex < REPUTATION_LEVELS.length ? REPUTATION_LEVELS[nextIndex] : null;
};

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
    requiredReputation: 0,
  },
  {
    id: 'mana_tower',
    name: '魔力塔',
    level: 1,
    maxLevel: 10,
    cost: { gold: 300, mana: 200, food: 30, reputation: 10 },
    effect: { type: 'mana_capacity', value: 100 },
    description: '增加100魔力上限',
    requiredReputation: 50,
  },
  {
    id: 'library',
    name: '魔法图书馆',
    level: 1,
    maxLevel: 10,
    cost: { gold: 250, mana: 150, food: 25, reputation: 5 },
    effect: { type: 'course_speed', value: 10 },
    description: '课程经验获取+10%',
    requiredReputation: 80,
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
    requiredReputation: 60,
  },
  {
    id: 'dormitory',
    name: '学员宿舍',
    level: 1,
    maxLevel: 10,
    cost: { gold: 150, mana: 80, food: 40, reputation: 0 },
    effect: { type: 'student_capacity', value: 4 },
    description: '增加4点学员容量',
    requiredReputation: 30,
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
    requiredReputation: 40,
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
    requiredReputation: 120,
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
    requiredReputation: 120,
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
    requiredReputation: 120,
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
    requiredReputation: 120,
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
    requiredReputation: 200,
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
    requiredReputation: 200,
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
    requiredReputation: 0,
  },
  {
    id: 'fire_magic',
    name: '火焰魔法',
    level: 2,
    duration: 5,
    cost: { gold: 100, mana: 60, food: 15, reputation: 5 },
    effect: { type: 'skill_unlock', value: 1 },
    requiredLevel: 3,
    requiredReputation: 50,
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
    requiredReputation: 50,
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
    requiredReputation: 50,
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
    requiredReputation: 50,
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
    requiredReputation: 100,
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
    requiredReputation: 100,
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
    requiredReputation: 150,
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
    requiredReputation: 300,
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
    requiredReputation: 300,
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
    requiredReputation: 300,
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
    requiredReputation: 300,
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
    requiredReputation: 400,
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
    requiredReputation: 400,
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
    requiredReputation: 0,
  },
  {
    id: 'rare_ticket',
    quality: 'rare',
    cost: { gold: 300, mana: 150, food: 10, reputation: 20 },
    requiredReputation: 80,
  },
  {
    id: 'epic_ticket',
    quality: 'epic',
    cost: { gold: 800, mana: 400, food: 30, reputation: 50 },
    requiredReputation: 200,
  },
  {
    id: 'legendary_ticket',
    quality: 'legendary',
    cost: { gold: 2000, mana: 1000, food: 100, reputation: 150 },
    requiredReputation: 500,
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
  buildings: Building[],
  reputation: number = 0
): { gold: number; mana: number; food: number; reputation: number } => {
  const diningHallLevel = buildings.find(b => b.id === 'dining_hall')?.level || 0;
  const manaTowerLevel = buildings.find(b => b.id === 'mana_tower')?.level || 0;
  const mainBuildingLevel = buildings.find(b => b.id === 'main_building')?.level || 0;
  const reputationBonus = calculateSynergyBonus(buildings, 'reputation');
  const reputationLevel = getReputationLevel(reputation);

  return {
    gold: 50 + diningHallLevel * 5 + mainBuildingLevel * 3,
    mana: 30 + manaTowerLevel * 10,
    food: 10 + diningHallLevel * 3,
    reputation: 5 + diningHallLevel * 2 + reputationBonus + reputationLevel.bonuses.dailyReputationBonus,
  };
};

export const calculateDiscountedCost = (
  baseCost: Resource,
  reputation: number,
  type: 'course' | 'building'
): Resource => {
  const reputationLevel = getReputationLevel(reputation);
  const discount = type === 'course' 
    ? reputationLevel.bonuses.courseDiscount 
    : reputationLevel.bonuses.buildingCostDiscount;
  
  return {
    gold: Math.floor(baseCost.gold * (1 - discount)),
    mana: Math.floor(baseCost.mana * (1 - discount)),
    food: Math.floor(baseCost.food * (1 - discount)),
    reputation: Math.floor(baseCost.reputation * (1 - discount)),
  };
};

export const canAccessCourse = (course: Course, studentLevel: number, reputation: number): boolean => {
  return studentLevel >= course.requiredLevel && reputation >= course.requiredReputation;
};

export const canAccessBuilding = (building: Building, reputation: number): boolean => {
  return reputation >= building.requiredReputation;
};

export const canAccessRecruitmentTicket = (ticket: RecruitmentTicket, reputation: number): boolean => {
  return reputation >= ticket.requiredReputation;
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

export const getRecruitQualityBonus = (buildings: Building[], reputation: number = 0): number => {
  const trainingFieldLevel = buildings.find(b => b.id === 'training_field')?.level || 0;
  const libraryLevel = buildings.find(b => b.id === 'library')?.level || 0;
  const reputationLevel = getReputationLevel(reputation);
  return trainingFieldLevel * 0.5 + libraryLevel * 0.3 + reputationLevel.bonuses.recruitQualityBonus;
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

export const calculateMaxHp = (student: { level: number; skills: { id: string }[] }): number => {
  return 100 + student.level * 20 + student.skills.length * 10;
};

export const getHpLabel = (currentHp: number, maxHp: number): { label: string; color: string } => {
  if (maxHp <= 0) return { label: '未知', color: '#999' };
  const percent = currentHp / maxHp;
  if (percent >= 0.8) return { label: '状态良好', color: '#4CAF50' };
  if (percent >= 0.5) return { label: '轻伤', color: '#FFC107' };
  if (percent >= 0.3) return { label: '重伤', color: '#FF9800' };
  if (percent > 0) return { label: '濒死', color: '#f44336' };
  return { label: '已倒下', color: '#d32f2f' };
};

export const calculateHpEfficiencyMultiplier = (currentHp: number, maxHp: number): number => {
  if (maxHp <= 0) return 1;
  const percent = currentHp / maxHp;
  if (percent >= HP_COURSE_EFFICIENCY_THRESHOLD) return 1;
  if (percent >= 0.3) return 0.7;
  if (percent > 0) return 0.4;
  return 0;
};

export const calculateDailyHpRecovery = (
  student: { status: string; currentHp: number; maxHp: number },
  dormitoryLevel: number = 1
): number => {
  if (student.currentHp >= student.maxHp) return 0;
  
  let recovery = HP_BASE_DAILY_RECOVERY;
  
  if (student.status === 'resting') {
    recovery = HP_BASE_REST_RECOVERY + dormitoryLevel * 5;
  }
  
  return Math.min(recovery, student.maxHp - student.currentHp);
};

export const calculateHealCost = (hpToHeal: number): Resource => {
  return {
    gold: hpToHeal * HEAL_GOLD_PER_HP,
    mana: hpToHeal * HEAL_MANA_PER_HP,
    food: hpToHeal * HEAL_FOOD_PER_HP,
    reputation: 0,
  };
};

export const calculateInstantHealCost = (student: { currentHp: number; maxHp: number }): Resource => {
  const hpToHeal = Math.max(0, student.maxHp - student.currentHp);
  const baseCost = calculateHealCost(hpToHeal);
  return {
    gold: baseCost.gold + HEAL_INSTANT_GOLD_COST,
    mana: baseCost.mana + HEAL_INSTANT_MANA_COST,
    food: baseCost.food + HEAL_INSTANT_FOOD_COST,
    reputation: 0,
  };
};

export const isStudentInjured = (student: { currentHp: number; maxHp: number }): boolean => {
  if (student.maxHp <= 0) return false;
  return student.currentHp < student.maxHp;
};

export const isStudentBadlyInjured = (student: { currentHp: number; maxHp: number }): boolean => {
  if (student.maxHp <= 0) return false;
  const percent = student.currentHp / student.maxHp;
  return percent < HP_BATTLE_THRESHOLD;
};

export const canStudentBattleByHp = (student: { currentHp: number; maxHp: number }): { ok: boolean; reason?: string } => {
  if (student.maxHp <= 0) return { ok: false, reason: 'HP数据异常' };
  if (student.currentHp <= 0) return { ok: false, reason: 'HP为0，已倒下无法出战' };
  const percent = student.currentHp / student.maxHp;
  if (percent < HP_BATTLE_THRESHOLD) {
    return { ok: false, reason: `重伤（HP ${Math.round(percent * 100)}%），需治疗后出战` };
  }
  return { ok: true };
};

export const initializeStudentHp = (student: { level: number; skills: { id: string }[] }): { currentHp: number; maxHp: number } => {
  const maxHp = calculateMaxHp(student);
  return { currentHp: maxHp, maxHp };
};

export const recalculateStudentMaxHp = (student: Student): Student => {
  const newMaxHp = calculateMaxHp(student);
  const hpRatio = student.maxHp > 0 ? student.currentHp / student.maxHp : 1;
  const newCurrentHp = Math.min(Math.floor(newMaxHp * hpRatio), newMaxHp);
  return {
    ...student,
    maxHp: newMaxHp,
    currentHp: Math.max(1, newCurrentHp),
  };
};

export const getMaxHealableHp = (student: { currentHp: number; maxHp: number }): number => {
  return Math.max(0, student.maxHp - student.currentHp);
};

export const isStudentBattleReady = canStudentBattleByHp;

export const INITIAL_GOAL_PROGRESS: GoalProgress = {
  buildingUpgrades: 0,
  coursesCompleted: 0,
  dungeonClears: 0,
  recruits: 0,
  totalStudents: 0,
  reputationGained: 0,
};

const WEEKLY_GOAL_TEMPLATES: Omit<WeeklyGoal, 'id' | 'current' | 'completed' | 'claimed'>[] = [
  {
    name: '🏗️ 学院扩建',
    description: '升级任意建筑 2 次',
    type: 'building',
    target: 2,
    reward: { gold: 500, mana: 300, reputation: 20 },
  },
  {
    name: '📚 知识积累',
    description: '完成任意课程 5 次',
    type: 'course',
    target: 5,
    reward: { gold: 400, mana: 500, food: 50, reputation: 15 },
  },
  {
    name: '⚔️ 试炼挑战',
    description: '成功挑战副本 3 次',
    type: 'dungeon',
    target: 3,
    reward: { gold: 800, mana: 400, food: 30, reputation: 30 },
  },
  {
    name: '📜 广纳英才',
    description: '招募新学员 2 名',
    type: 'recruit',
    target: 2,
    reward: { gold: 300, mana: 200, food: 100, reputation: 25 },
  },
  {
    name: '✨ 全面发展',
    description: '升级1次建筑 + 完成2次课程 + 挑战1次副本 + 招募1名学员',
    type: 'comprehensive',
    target: 4,
    reward: { gold: 1000, mana: 600, food: 80, reputation: 50 },
  },
  {
    name: '🎓 学业繁忙',
    description: '完成任意课程 8 次',
    type: 'course',
    target: 8,
    reward: { gold: 600, mana: 800, food: 60, reputation: 25 },
  },
  {
    name: '🏛️ 基础建设',
    description: '升级任意建筑 3 次',
    type: 'building',
    target: 3,
    reward: { gold: 700, mana: 400, food: 40, reputation: 30 },
  },
  {
    name: '🔥 勇者无畏',
    description: '成功挑战副本 5 次',
    type: 'dungeon',
    target: 5,
    reward: { gold: 1200, mana: 600, food: 50, reputation: 45 },
  },
];

export const INITIAL_STAGE_TASKS: StageTask[] = [
  {
    id: 'stage_1_1',
    name: '初建学院',
    description: '招募你的第一名学员',
    stage: 1,
    type: 'recruit',
    target: 1,
    current: 0,
    reward: { gold: 200, mana: 100, reputation: 10 },
    completed: false,
    claimed: false,
    unlocked: true,
  },
  {
    id: 'stage_1_2',
    name: '知识殿堂',
    description: '完成 3 次课程学习',
    stage: 1,
    type: 'course',
    target: 3,
    current: 0,
    reward: { gold: 300, mana: 200, food: 30, reputation: 15 },
    completed: false,
    claimed: false,
    unlocked: true,
  },
  {
    id: 'stage_1_3',
    name: '初露锋芒',
    description: '成功挑战 1 次副本',
    stage: 1,
    type: 'dungeon',
    target: 1,
    current: 0,
    reward: { gold: 500, mana: 300, food: 20, reputation: 25 },
    completed: false,
    claimed: false,
    unlocked: true,
  },
  {
    id: 'stage_2_1',
    name: '学院扩建',
    description: '升级任意建筑 3 次',
    stage: 2,
    type: 'building',
    target: 3,
    current: 0,
    reward: { gold: 600, mana: 400, food: 50, reputation: 30 },
    completed: false,
    claimed: false,
    unlocked: false,
    prerequisite: 'stage_1_3',
  },
  {
    id: 'stage_2_2',
    name: '人才济济',
    description: '招募 5 名学员',
    stage: 2,
    type: 'recruit',
    target: 5,
    current: 0,
    reward: { gold: 500, mana: 300, food: 100, reputation: 40 },
    completed: false,
    claimed: false,
    unlocked: false,
    prerequisite: 'stage_1_3',
  },
  {
    id: 'stage_2_3',
    name: '精英培养',
    description: '完成 10 次课程学习',
    stage: 2,
    type: 'course',
    target: 10,
    current: 0,
    reward: { gold: 800, mana: 600, food: 60, reputation: 35 },
    completed: false,
    claimed: false,
    unlocked: false,
    prerequisite: 'stage_1_3',
  },
  {
    id: 'stage_3_1',
    name: '征服试炼',
    description: '成功挑战 5 次副本',
    stage: 3,
    type: 'dungeon',
    target: 5,
    current: 0,
    reward: { gold: 1500, mana: 800, food: 80, reputation: 60 },
    completed: false,
    claimed: false,
    unlocked: false,
    prerequisite: 'stage_2_3',
  },
  {
    id: 'stage_3_2',
    name: '魔法圣地',
    description: '升级任意建筑 8 次',
    stage: 3,
    type: 'building',
    target: 8,
    current: 0,
    reward: { gold: 1200, mana: 1000, food: 100, reputation: 70 },
    completed: false,
    claimed: false,
    unlocked: false,
    prerequisite: 'stage_2_3',
  },
  {
    id: 'stage_3_3',
    name: '桃李满天下',
    description: '累计招募 10 名学员',
    stage: 3,
    type: 'recruit',
    target: 10,
    current: 0,
    reward: { gold: 1000, mana: 600, food: 150, reputation: 80 },
    completed: false,
    claimed: false,
    unlocked: false,
    prerequisite: 'stage_2_3',
  },
];

export const generateWeeklyGoals = (weekNumber: number): WeeklyGoal[] => {
  const shuffled = [...WEEKLY_GOAL_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  
  return selected.map((template, index) => ({
    ...template,
    id: `weekly_${weekNumber}_${index}`,
    current: 0,
    completed: false,
    claimed: false,
  }));
};

export const INITIAL_WEEKLY_GOALS: WeeklyGoalsState = {
  weekStartDay: 1,
  goals: generateWeeklyGoals(1),
  weeklyResetCount: 0,
};

export const INITIAL_STAGE_TASKS_STATE: StageTasksState = {
  tasks: INITIAL_STAGE_TASKS,
  currentStage: 1,
};

export const updateWeeklyGoalProgress = (
  goals: WeeklyGoal[],
  type: GoalType,
  amount: number = 1
): WeeklyGoal[] => {
  return goals.map(goal => {
    if (goal.completed || goal.claimed) return goal;
    
    let shouldUpdate = false;
    
    if (goal.type === type) {
      shouldUpdate = true;
    } else if (goal.type === 'comprehensive') {
      shouldUpdate = true;
    }
    
    if (shouldUpdate) {
      const newCurrent = Math.min(goal.current + amount, goal.target);
      const completed = newCurrent >= goal.target;
      return { ...goal, current: newCurrent, completed };
    }
    
    return goal;
  });
};

export const updateStageTaskProgress = (
  tasks: StageTask[],
  type: GoalType,
  amount: number = 1
): StageTask[] => {
  return tasks.map(task => {
    if (!task.unlocked || task.completed || task.claimed) return task;
    if (task.type !== type && task.type !== 'comprehensive') return task;
    
    const newCurrent = Math.min(task.current + amount, task.target);
    const completed = newCurrent >= task.target;
    return { ...task, current: newCurrent, completed };
  });
};

export const unlockNextStageTasks = (
  tasks: StageTask[],
  completedTaskId: string
): StageTask[] => {
  return tasks.map(task => {
    if (task.unlocked) return task;
    if (task.prerequisite === completedTaskId) {
      return { ...task, unlocked: true };
    }
    return task;
  });
};

export const checkWeeklyReset = (
  currentDay: number,
  weekStartDay: number
): boolean => {
  return currentDay - weekStartDay >= 7;
};

export const getCurrentWeek = (day: number): number => {
  return Math.floor((day - 1) / 7) + 1;
};

import type { SeasonGoal, SeasonStageReward, SeasonState, SeasonHistory, SeasonSettlement, SeasonGoalType, SeasonSnapshot } from '../types/game';
import { SEASON_DURATION_DAYS, MAX_SEASON_HISTORY } from '../types/game';

const SEASON_NAMES = [
  '春季学园祭',
  '夏季修炼营',
  '秋季魔法节',
  '冬季试炼季',
  '星光盛典',
  '龙魂觉醒',
  '精灵之森',
  '深渊探索',
];

const SEASON_GOAL_TEMPLATES: Omit<SeasonGoal, 'id' | 'current' | 'completed' | 'claimed'>[] = [
  {
    name: '🏗️ 基建先锋',
    description: '升级建筑 5 次',
    type: 'building',
    target: 5,
    reward: { gold: 800, mana: 500, reputation: 30 },
    seasonPoints: 100,
  },
  {
    name: '🏛️ 建筑大师',
    description: '升级建筑 10 次',
    type: 'building',
    target: 10,
    reward: { gold: 1500, mana: 1000, food: 100, reputation: 50 },
    seasonPoints: 200,
  },
  {
    name: '📚 知识海洋',
    description: '完成课程 10 次',
    type: 'course',
    target: 10,
    reward: { gold: 600, mana: 800, food: 60, reputation: 25 },
    seasonPoints: 100,
  },
  {
    name: '🎓 学业有成',
    description: '完成课程 25 次',
    type: 'course',
    target: 25,
    reward: { gold: 1200, mana: 1500, food: 120, reputation: 60 },
    seasonPoints: 250,
  },
  {
    name: '⚔️ 初出茅庐',
    description: '挑战副本 3 次',
    type: 'dungeon',
    target: 3,
    reward: { gold: 500, mana: 300, food: 30, reputation: 20 },
    seasonPoints: 80,
  },
  {
    name: '🗡️ 勇者无畏',
    description: '挑战副本 10 次',
    type: 'dungeon',
    target: 10,
    reward: { gold: 1500, mana: 800, food: 80, reputation: 60 },
    seasonPoints: 220,
  },
  {
    name: '📜 招贤纳士',
    description: '招募学员 3 名',
    type: 'recruit',
    target: 3,
    reward: { gold: 400, mana: 250, food: 80, reputation: 20 },
    seasonPoints: 80,
  },
  {
    name: '🌟 桃李满园',
    description: '招募学员 8 名',
    type: 'recruit',
    target: 8,
    reward: { gold: 1000, mana: 600, food: 200, reputation: 50 },
    seasonPoints: 180,
  },
  {
    name: '⭐ 声名鹊起',
    description: '获得 200 点声望',
    type: 'reputation',
    target: 200,
    reward: { gold: 800, mana: 500, food: 50 },
    seasonPoints: 120,
  },
  {
    name: '👑 传奇学院',
    description: '获得 500 点声望',
    type: 'reputation',
    target: 500,
    reward: { gold: 2000, mana: 1200, food: 150, reputation: 100 },
    seasonPoints: 300,
  },
  {
    name: '✨ 全能学院',
    description: '升级建筑3次 + 完成课程5次 + 挑战副本2次 + 招募2人',
    type: 'comprehensive',
    target: 12,
    reward: { gold: 1200, mana: 800, food: 100, reputation: 80 },
    seasonPoints: 200,
  },
  {
    name: '🏆 赛季巅峰',
    description: '完成所有类型目标各5个进度',
    type: 'comprehensive',
    target: 25,
    reward: { gold: 2500, mana: 1500, food: 200, reputation: 150 },
    seasonPoints: 400,
  },
];

const SEASON_STAGE_REWARDS: Omit<SeasonStageReward, 'claimed' | 'unlocked'>[] = [
  {
    id: 'season_stage_1',
    stage: 1,
    name: '起步奖励',
    description: '赛季初始奖励包',
    requiredPoints: 100,
    reward: { gold: 500, mana: 300, food: 50 },
  },
  {
    id: 'season_stage_2',
    stage: 2,
    name: '成长礼包',
    description: '学院发展奖励',
    requiredPoints: 300,
    reward: { gold: 1000, mana: 600, food: 100, reputation: 20 },
  },
  {
    id: 'season_stage_3',
    stage: 3,
    name: '精英奖励',
    description: '精英学院专属奖励',
    requiredPoints: 600,
    reward: { gold: 1500, mana: 1000, food: 150, reputation: 50 },
  },
  {
    id: 'season_stage_4',
    stage: 4,
    name: '荣耀礼包',
    description: '荣耀学院专属奖励',
    requiredPoints: 1000,
    reward: { gold: 2500, mana: 1500, food: 200, reputation: 100 },
  },
  {
    id: 'season_stage_5',
    stage: 5,
    name: '传奇奖励',
    description: '传奇学院终极奖励',
    requiredPoints: 1500,
    reward: { gold: 4000, mana: 2500, food: 300, reputation: 200 },
  },
];

export const generateSeasonGoals = (seasonNumber: number): SeasonGoal[] => {
  const shuffled = [...SEASON_GOAL_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 6);
  
  return selected.map((template, index) => ({
    ...template,
    id: `season_${seasonNumber}_goal_${index}`,
    current: 0,
    completed: false,
    claimed: false,
  }));
};

export const generateSeasonStageRewards = (): SeasonStageReward[] => {
  return SEASON_STAGE_REWARDS.map(stage => ({
    ...stage,
    claimed: false,
    unlocked: stage.stage === 1,
  }));
};

export const getSeasonName = (seasonNumber: number): string => {
  const index = (seasonNumber - 1) % SEASON_NAMES.length;
  return SEASON_NAMES[index];
};

export const INITIAL_SEASON_STATE: SeasonState = {
  seasonNumber: 1,
  seasonName: getSeasonName(1),
  seasonStartDay: 1,
  seasonDuration: SEASON_DURATION_DAYS,
  currentDay: 1,
  seasonPoints: 0,
  totalPointsEarned: 0,
  goals: generateSeasonGoals(1),
  stageRewards: generateSeasonStageRewards(),
  currentStage: 1,
  seasonEnded: false,
  seasonSettled: false,
  settlementRank: null,
  settlementRewards: null,
  settlementClaimed: false,
  initialSnapshot: null,
};

export const createSeasonSnapshot = (
  resources: Resource,
  buildings: Building[],
  students: Student[],
  goalProgress: GoalProgress
): SeasonSnapshot => {
  const buildingLevels: Record<string, number> = {};
  buildings.forEach(b => {
    buildingLevels[b.id] = b.level;
  });

  return {
    resources: { ...resources },
    studentCount: students.length,
    buildingLevels,
    coursesCompleted: goalProgress.coursesCompleted,
    dungeonsCleared: goalProgress.dungeonClears,
    recruitsDone: goalProgress.recruits,
    buildingUpgrades: goalProgress.buildingUpgrades,
    totalReputation: resources.reputation,
  };
};

export const updateSeasonGoalProgress = (
  goals: SeasonGoal[],
  type: SeasonGoalType,
  amount: number = 1
): { goals: SeasonGoal[]; pointsGained: number } => {
  let pointsGained = 0;
  
  const updatedGoals = goals.map(goal => {
    if (goal.completed || goal.claimed) return goal;
    
    let shouldUpdate = false;
    
    if (goal.type === type) {
      shouldUpdate = true;
    } else if (goal.type === 'comprehensive') {
      shouldUpdate = true;
    }
    
    if (shouldUpdate) {
      const oldCurrent = goal.current;
      const newCurrent = Math.min(oldCurrent + amount, goal.target);
      const completed = newCurrent >= goal.target;
      
      if (completed && !goal.completed) {
        pointsGained += goal.seasonPoints;
      }
      
      return { ...goal, current: newCurrent, completed };
    }
    
    return goal;
  });
  
  return { goals: updatedGoals, pointsGained };
};

export const updateSeasonStageRewards = (
  stageRewards: SeasonStageReward[],
  totalPoints: number
): SeasonStageReward[] => {
  return stageRewards.map(stage => {
    if (stage.unlocked && stage.claimed) return stage;
    
    const unlocked = totalPoints >= stage.requiredPoints;
    return { ...stage, unlocked };
  });
};

export const getCurrentSeasonStage = (
  stageRewards: SeasonStageReward[],
  totalPoints: number
): number => {
  let currentStage = 0;
  for (const stage of stageRewards) {
    if (totalPoints >= stage.requiredPoints) {
      currentStage = stage.stage;
    } else {
      break;
    }
  }
  return currentStage;
};

export const calculateSeasonRank = (totalPoints: number): 'S' | 'A' | 'B' | 'C' | 'D' => {
  if (totalPoints >= 1200) return 'S';
  if (totalPoints >= 800) return 'A';
  if (totalPoints >= 500) return 'B';
  if (totalPoints >= 200) return 'C';
  return 'D';
};

export const getRankBonus = (rank: 'S' | 'A' | 'B' | 'C' | 'D'): Partial<Resource> => {
  switch (rank) {
    case 'S':
      return { gold: 5000, mana: 3000, food: 500, reputation: 300 };
    case 'A':
      return { gold: 3000, mana: 1800, food: 300, reputation: 150 };
    case 'B':
      return { gold: 1500, mana: 900, food: 150, reputation: 80 };
    case 'C':
      return { gold: 600, mana: 350, food: 80, reputation: 30 };
    default:
      return { gold: 200, mana: 100, food: 30, reputation: 10 };
  }
};

export const calculateSeasonSettlement = (
  season: SeasonState
): SeasonSettlement => {
  const rank = calculateSeasonRank(season.totalPointsEarned);
  const rankBonus = getRankBonus(rank);
  
  const completedGoals = season.goals.filter(g => g.completed).length;
  const totalGoals = season.goals.length;
  const claimedStages = season.stageRewards.filter(s => s.claimed).length;
  const totalStages = season.stageRewards.length;
  
  const finalRewards: Partial<Resource> = { gold: 0, mana: 0, food: 0, reputation: 0 };
  for (const goal of season.goals) {
    if (goal.completed) {
      finalRewards.gold = (finalRewards.gold || 0) + (goal.reward.gold || 0);
      finalRewards.mana = (finalRewards.mana || 0) + (goal.reward.mana || 0);
      finalRewards.food = (finalRewards.food || 0) + (goal.reward.food || 0);
      finalRewards.reputation = (finalRewards.reputation || 0) + (goal.reward.reputation || 0);
    }
  }
  
  const carryOverBonus = {
    gold: Math.floor((finalRewards.gold || 0) * 0.1),
    mana: Math.floor((finalRewards.mana || 0) * 0.1),
    food: Math.floor((finalRewards.food || 0) * 0.1),
    reputation: Math.floor((finalRewards.reputation || 0) * 0.05),
  };
  
  return {
    seasonNumber: season.seasonNumber,
    seasonName: season.seasonName,
    totalPoints: season.totalPointsEarned,
    rank,
    goalsCompleted: completedGoals,
    totalGoals,
    stagesClaimed: claimedStages,
    totalStages,
    finalRewards,
    rankBonus,
    carryOverBonus,
  };
};

export const checkSeasonEnd = (
  currentDay: number,
  seasonStartDay: number,
  seasonDuration: number
): boolean => {
  return currentDay - seasonStartDay >= seasonDuration;
};

export const createSeasonHistory = (
  season: SeasonState,
  finalResources: Resource,
  students: Student[],
  buildings: Building[],
  goalProgress: GoalProgress
): SeasonHistory => {
  const rank = calculateSeasonRank(season.totalPointsEarned);
  const completedGoals = season.goals.filter(g => g.completed).length;
  const claimedStages = season.stageRewards.filter(s => s.claimed).length;
  const settlement = calculateSeasonSettlement(season);

  const finalBuildingLevels: Record<string, number> = {};
  buildings.forEach(b => {
    finalBuildingLevels[b.id] = b.level;
  });

  const initialSnapshot = season.initialSnapshot || {
    resources: { gold: 0, mana: 0, food: 0, reputation: 0 },
    studentCount: 0,
    buildingLevels: {},
    coursesCompleted: 0,
    dungeonsCleared: 0,
    recruitsDone: 0,
    buildingUpgrades: 0,
    totalReputation: 0,
  };

  return {
    seasonNumber: season.seasonNumber,
    seasonName: season.seasonName,
    startedAt: season.seasonStartDay,
    endedAt: season.currentDay,
    durationDays: season.currentDay - season.seasonStartDay,
    rank,
    finalPoints: season.totalPointsEarned,
    goalsCompleted: completedGoals,
    totalGoals: season.goals.length,
    stagesClaimed: claimedStages,
    totalStages: season.stageRewards.length,
    initialResources: initialSnapshot.resources,
    finalResources: { ...finalResources },
    initialStudentCount: initialSnapshot.studentCount,
    finalStudentCount: students.length,
    initialBuildingLevels: initialSnapshot.buildingLevels,
    finalBuildingLevels,
    coursesCompleted: goalProgress.coursesCompleted - initialSnapshot.coursesCompleted,
    dungeonsCleared: goalProgress.dungeonClears - initialSnapshot.dungeonsCleared,
    recruitsDone: goalProgress.recruits - initialSnapshot.recruitsDone,
    buildingUpgrades: goalProgress.buildingUpgrades - initialSnapshot.buildingUpgrades,
    reputationGained: finalResources.reputation - initialSnapshot.totalReputation,
    totalRewards: settlement.finalRewards,
    rankRewards: settlement.rankBonus,
    carryOverRewards: settlement.carryOverBonus,
  };
};

export const initializeNewSeason = (
  seasonNumber: number,
  startDay: number,
  initialSnapshot?: SeasonSnapshot
): SeasonState => {
  return {
    seasonNumber,
    seasonName: getSeasonName(seasonNumber),
    seasonStartDay: startDay,
    seasonDuration: SEASON_DURATION_DAYS,
    currentDay: startDay,
    seasonPoints: 0,
    totalPointsEarned: 0,
    goals: generateSeasonGoals(seasonNumber),
    stageRewards: generateSeasonStageRewards(),
    currentStage: 1,
    seasonEnded: false,
    seasonSettled: false,
    settlementRank: null,
    settlementRewards: null,
    settlementClaimed: false,
    initialSnapshot: initialSnapshot || null,
  };
};

export const addToSeasonHistory = (
  history: SeasonHistory[],
  record: SeasonHistory
): SeasonHistory[] => {
  const updated = [record, ...history];
  if (updated.length > MAX_SEASON_HISTORY) {
    return updated.slice(0, MAX_SEASON_HISTORY);
  }
  return updated;
};

export const CLUB_REPUTATION_LEVELS: ClubReputationLevel[] = [
  {
    level: 1,
    name: '初创社团',
    minReputation: 0,
    description: '刚刚成立的社团，一切都在起步阶段',
    bonuses: { taskRewardBonus: 0, shopDiscount: 0, maxMembersBonus: 0, contributionGainBonus: 0, dailyReputationBonus: 1 },
  },
  {
    level: 2,
    name: '小有名气',
    minReputation: 50,
    description: '在学院内有一定知名度的社团',
    bonuses: { taskRewardBonus: 0.1, shopDiscount: 0.05, maxMembersBonus: 2, contributionGainBonus: 0.1, dailyReputationBonus: 3 },
  },
  {
    level: 3,
    name: '知名社团',
    minReputation: 150,
    description: '学院内广为人知的优秀社团',
    bonuses: { taskRewardBonus: 0.2, shopDiscount: 0.1, maxMembersBonus: 4, contributionGainBonus: 0.2, dailyReputationBonus: 6 },
  },
  {
    level: 4,
    name: '精英社团',
    minReputation: 350,
    description: '汇聚学院精英的顶尖社团',
    bonuses: { taskRewardBonus: 0.35, shopDiscount: 0.15, maxMembersBonus: 6, contributionGainBonus: 0.35, dailyReputationBonus: 10 },
  },
  {
    level: 5,
    name: '传奇社团',
    minReputation: 700,
    description: '载入学院史册的传奇社团',
    bonuses: { taskRewardBonus: 0.5, shopDiscount: 0.25, maxMembersBonus: 10, contributionGainBonus: 0.5, dailyReputationBonus: 16 },
  },
  {
    level: 6,
    name: '神话社团',
    minReputation: 1200,
    description: '传说中才存在的神话级社团',
    bonuses: { taskRewardBonus: 0.75, shopDiscount: 0.35, maxMembersBonus: 15, contributionGainBonus: 0.75, dailyReputationBonus: 25 },
  },
];

export const getClubReputationLevel = (reputation: number): ClubReputationLevel => {
  let currentLevel = CLUB_REPUTATION_LEVELS[0];
  for (const level of CLUB_REPUTATION_LEVELS) {
    if (reputation >= level.minReputation) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

export const getClubReputationProgress = (reputation: number): { current: ClubReputationLevel; next: ClubReputationLevel | null; progress: number } => {
  const current = getClubReputationLevel(reputation);
  const currentIndex = CLUB_REPUTATION_LEVELS.findIndex(l => l.level === current.level);
  const next = currentIndex + 1 < CLUB_REPUTATION_LEVELS.length ? CLUB_REPUTATION_LEVELS[currentIndex + 1] : null;
  
  let progress = 1;
  if (next) {
    const range = next.minReputation - current.minReputation;
    const earned = reputation - current.minReputation;
    progress = Math.min(1, earned / range);
  }
  
  return { current, next, progress };
};

export const INITIAL_CLUBS: Club[] = [
  {
    id: 'fire_society',
    name: '烈焰社',
    description: '专注于火焰魔法研究与实战的社团，成员擅长爆发性输出',
    icon: '🔥',
    primaryMagicType: 'fire',
    focus: 'combat',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 8,
    buildingBonus: ['fire_temple'],
    unlocked: true,
    requiredReputation: 0,
    createdAt: 1,
  },
  {
    id: 'water_society',
    name: '潮汐社',
    description: '研究水系魔法的社团，精通治疗与控制魔法',
    icon: '💧',
    primaryMagicType: 'water',
    focus: 'support',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 8,
    buildingBonus: ['water_temple'],
    unlocked: true,
    requiredReputation: 0,
    createdAt: 1,
  },
  {
    id: 'earth_society',
    name: '磐石社',
    description: '土系魔法专精社团，以防御和持久力著称',
    icon: '🏔️',
    primaryMagicType: 'earth',
    focus: 'combat',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 8,
    buildingBonus: ['earth_temple'],
    unlocked: true,
    requiredReputation: 0,
    createdAt: 1,
  },
  {
    id: 'wind_society',
    name: '疾风社',
    description: '风系魔法研究社，追求速度与敏捷的极致',
    icon: '🌪️',
    primaryMagicType: 'wind',
    focus: 'balanced',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 8,
    buildingBonus: ['wind_temple'],
    unlocked: true,
    requiredReputation: 0,
    createdAt: 1,
  },
  {
    id: 'light_society',
    name: '圣光社',
    description: '光明魔法的虔诚信徒，擅长治愈与驱散黑暗',
    icon: '✨',
    primaryMagicType: 'light',
    focus: 'support',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 10,
    buildingBonus: ['light_temple'],
    unlocked: false,
    requiredReputation: 200,
    requiredBuildingLevel: [{ buildingId: 'library', level: 3 }],
    createdAt: 1,
  },
  {
    id: 'dark_society',
    name: '暗影社',
    description: '探索暗影奥秘的神秘社团，精通诅咒与暗杀',
    icon: '🌙',
    primaryMagicType: 'dark',
    focus: 'combat',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 10,
    buildingBonus: ['dark_temple'],
    unlocked: false,
    requiredReputation: 200,
    requiredBuildingLevel: [{ buildingId: 'library', level: 3 }],
    createdAt: 1,
  },
  {
    id: 'arcane_society',
    name: '奥术研究会',
    description: '研究所有魔法派系的综合性社团，追求魔法真谛',
    icon: '📚',
    primaryMagicType: 'mixed',
    focus: 'research',
    level: 1,
    maxLevel: 10,
    reputation: 0,
    contributionPoints: 0,
    totalContributionPoints: 0,
    members: [],
    maxMembers: 12,
    buildingBonus: ['library', 'mana_tower'],
    unlocked: false,
    requiredReputation: 400,
    requiredBuildingLevel: [{ buildingId: 'library', level: 5 }, { buildingId: 'mana_tower', level: 5 }],
    createdAt: 1,
  },
];

export const generateClubTasks = (clubId: string, clubLevel: number = 1): ClubTask[] => {
  const difficultyMultiplier = 1 + (clubLevel - 1) * 0.2;
  
  const tasks: ClubTask[] = [
    {
      id: `${clubId}_daily_study_1`,
      clubId,
      name: '日常研修',
      description: '社团成员完成任意课程累计5次',
      type: 'course',
      target: Math.ceil(5 * difficultyMultiplier),
      current: 0,
      reward: { gold: 100, mana: 50, contributionPoints: 20 },
      completed: false,
      claimed: false,
      unlocked: true,
      difficulty: 'easy',
    },
    {
      id: `${clubId}_daily_dungeon_1`,
      clubId,
      name: '联合征讨',
      description: '社团成员挑战地牢累计3次',
      type: 'dungeon',
      target: Math.ceil(3 * difficultyMultiplier),
      current: 0,
      reward: { gold: 200, mana: 100, reputation: 10, contributionPoints: 35 },
      completed: false,
      claimed: false,
      unlocked: true,
      difficulty: 'normal',
    },
    {
      id: `${clubId}_daily_recruit_1`,
      clubId,
      name: '招募新血',
      description: '招募新学员加入社团累计2人',
      type: 'recruit',
      target: Math.ceil(2 * difficultyMultiplier),
      current: 0,
      reward: { gold: 150, food: 30, contributionPoints: 25 },
      completed: false,
      claimed: false,
      unlocked: true,
      difficulty: 'easy',
    },
    {
      id: `${clubId}_daily_building_1`,
      clubId,
      name: '设施升级',
      description: '升级关联建筑累计2次',
      type: 'building',
      target: 2,
      current: 0,
      reward: { gold: 300, mana: 200, contributionPoints: 40 },
      completed: false,
      claimed: false,
      unlocked: clubLevel >= 2,
      prerequisiteTaskId: `${clubId}_daily_study_1`,
      difficulty: 'normal',
    },
    {
      id: `${clubId}_special_course`,
      clubId,
      name: '精英特训',
      description: '完成高级魔法专精课程累计3次',
      type: 'special',
      target: 3,
      current: 0,
      reward: { gold: 800, mana: 500, reputation: 30, contributionPoints: 100 },
      completed: false,
      claimed: false,
      unlocked: clubLevel >= 3,
      requiredLevel: 5,
      difficulty: 'hard',
    },
    {
      id: `${clubId}_special_dungeon`,
      clubId,
      name: '深渊探索',
      description: '获得地牢三星评价累计2次',
      type: 'special',
      target: 2,
      current: 0,
      reward: { gold: 1000, mana: 600, reputation: 50, contributionPoints: 150 },
      completed: false,
      claimed: false,
      unlocked: clubLevel >= 4,
      difficulty: 'hard',
    },
    {
      id: `${clubId}_legendary`,
      clubId,
      name: '传奇挑战',
      description: '完成所有日常任务并挑战巨龙巢穴',
      type: 'special',
      target: 1,
      current: 0,
      reward: { gold: 3000, mana: 2000, reputation: 150, food: 200, contributionPoints: 500 },
      completed: false,
      claimed: false,
      unlocked: clubLevel >= 5,
      difficulty: 'legendary',
    },
  ];
  
  return tasks;
};

export const INITIAL_CLUB_SHOP_ITEMS: ClubShopItem[] = [
  {
    id: 'shop_gold_small',
    name: '小额金币袋',
    description: '获得500金币',
    icon: '💰',
    cost: { contributionPoints: 50 },
    effect: { type: 'resource_gain', value: 500, target: 'gold' },
    requiredClubLevel: 1,
    stock: 10,
    maxStock: 10,
    purchaseLimit: 5,
    purchasedCount: 0,
    category: 'resource',
  },
  {
    id: 'shop_mana_small',
    name: '魔力水晶',
    description: '获得300魔力',
    icon: '💎',
    cost: { contributionPoints: 40 },
    effect: { type: 'resource_gain', value: 300, target: 'mana' },
    requiredClubLevel: 1,
    stock: 10,
    maxStock: 10,
    purchaseLimit: 5,
    purchasedCount: 0,
    category: 'resource',
  },
  {
    id: 'shop_food_small',
    name: '魔法食材包',
    description: '获得100食物',
    icon: '🍰',
    cost: { contributionPoints: 30 },
    effect: { type: 'resource_gain', value: 100, target: 'food' },
    requiredClubLevel: 1,
    stock: 15,
    maxStock: 15,
    purchaseLimit: 10,
    purchasedCount: 0,
    category: 'resource',
  },
  {
    id: 'shop_reputation_small',
    name: '声望徽章',
    description: '获得20点学院声望',
    icon: '🏅',
    cost: { contributionPoints: 100, reputation: 10 },
    effect: { type: 'reputation_boost', value: 20 },
    requiredClubLevel: 2,
    stock: 5,
    maxStock: 5,
    purchaseLimit: 3,
    purchasedCount: 0,
    category: 'resource',
  },
  {
    id: 'shop_exp_buff',
    name: '经验增幅卷轴',
    description: '3天内所有学员经验获取+20%',
    icon: '📜',
    cost: { contributionPoints: 200 },
    effect: { type: 'stat_buff', value: 0.2, target: 'exp_bonus', duration: 3 },
    requiredClubLevel: 2,
    stock: 3,
    maxStock: 3,
    purchaseLimit: 2,
    purchasedCount: 0,
    category: 'buff',
  },
  {
    id: 'shop_stamina_potion',
    name: '体力恢复药水',
    description: '全体学员体力恢复50点',
    icon: '🧪',
    cost: { contributionPoints: 80 },
    effect: { type: 'stat_buff', value: 50, target: 'stamina_regen' },
    requiredClubLevel: 2,
    stock: 8,
    maxStock: 8,
    purchaseLimit: 5,
    purchasedCount: 0,
    category: 'consumable',
  },
  {
    id: 'shop_morale_potion',
    name: '士气鼓舞药剂',
    description: '全体学员士气恢复30点',
    icon: '🎺',
    cost: { contributionPoints: 70 },
    effect: { type: 'stat_buff', value: 30, target: 'morale_regen' },
    requiredClubLevel: 2,
    stock: 8,
    maxStock: 8,
    purchaseLimit: 5,
    purchasedCount: 0,
    category: 'consumable',
  },
  {
    id: 'shop_rare_ticket',
    name: '稀有招募券',
    description: '获得一张稀有招募券',
    icon: '🎫',
    cost: { contributionPoints: 300, gold: 200 },
    effect: { type: 'recruit_ticket', value: 1, quality: 'rare' },
    requiredClubLevel: 3,
    requiredClubReputation: 100,
    stock: 3,
    maxStock: 3,
    purchaseLimit: 2,
    purchasedCount: 0,
    category: 'unlock',
  },
  {
    id: 'shop_course_speed_buff',
    name: '时间加速法阵',
    description: '5天内课程完成速度+30%',
    icon: '⏰',
    cost: { contributionPoints: 400, mana: 200 },
    effect: { type: 'stat_buff', value: 0.3, target: 'course_speed', duration: 5 },
    requiredClubLevel: 3,
    requiredClubReputation: 150,
    stock: 2,
    maxStock: 2,
    purchaseLimit: 1,
    purchasedCount: 0,
    category: 'buff',
  },
  {
    id: 'shop_epic_ticket',
    name: '史诗招募券',
    description: '获得一张史诗招募券',
    icon: '🎟️',
    cost: { contributionPoints: 800, gold: 500, reputation: 30 },
    effect: { type: 'recruit_ticket', value: 1, quality: 'epic' },
    requiredClubLevel: 4,
    requiredClubReputation: 300,
    stock: 2,
    maxStock: 2,
    purchaseLimit: 1,
    purchasedCount: 0,
    category: 'unlock',
  },
  {
    id: 'shop_damage_buff',
    name: '战神祝福',
    description: '7天内学员技能伤害+25%',
    icon: '⚔️',
    cost: { contributionPoints: 600, mana: 300 },
    effect: { type: 'stat_buff', value: 0.25, target: 'damage_bonus', duration: 7 },
    requiredClubLevel: 4,
    requiredClubReputation: 250,
    stock: 2,
    maxStock: 2,
    purchaseLimit: 1,
    purchasedCount: 0,
    category: 'buff',
  },
  {
    id: 'shop_legendary_ticket',
    name: '传说招募券',
    description: '获得一张传说招募券',
    icon: '👑',
    cost: { contributionPoints: 2000, gold: 1500, reputation: 100 },
    effect: { type: 'recruit_ticket', value: 1, quality: 'legendary' },
    requiredClubLevel: 5,
    requiredClubReputation: 600,
    stock: 1,
    maxStock: 1,
    purchaseLimit: 1,
    purchasedCount: 0,
    category: 'unlock',
  },
];

export const generateAllClubTasks = (clubs: Club[]): ClubTask[] => {
  let allTasks: ClubTask[] = [];
  for (const club of clubs) {
    allTasks = [...allTasks, ...generateClubTasks(club.id, club.level)];
  }
  return allTasks;
};

export const INITIAL_CLUBS_STATE: ClubsState = {
  clubs: INITIAL_CLUBS,
  tasks: generateAllClubTasks(INITIAL_CLUBS),
  shopItems: INITIAL_CLUB_SHOP_ITEMS,
  contributionLogs: [],
  activeBuffs: [],
  totalContributionEarned: 0,
  shopRefreshDay: 1,
};

export const canUnlockClub = (club: Club, reputation: number, buildings: Building[]): { canUnlock: boolean; requirements: { type: string; current: number; required: number; name: string }[] } => {
  const requirements: { type: string; current: number; required: number; name: string }[] = [];
  
  requirements.push({
    type: 'reputation',
    current: reputation,
    required: club.requiredReputation,
    name: '学院声望',
  });
  
  if (club.requiredBuildingLevel) {
    for (const req of club.requiredBuildingLevel) {
      const building = buildings.find(b => b.id === req.buildingId);
      requirements.push({
        type: 'building',
        current: building?.level || 0,
        required: req.level,
        name: building?.name || req.buildingId,
      });
    }
  }
  
  const canUnlock = requirements.every(r => r.current >= r.required);
  return { canUnlock, requirements };
};

export const getClubLevelRequirement = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateClubLevelProgress = (totalContribution: number, currentLevel: number, maxLevel: number): { progress: number; requiredForNext: number; canLevelUp: boolean } => {
  if (currentLevel >= maxLevel) {
    return { progress: 1, requiredForNext: 0, canLevelUp: false };
  }
  
  const requiredForCurrent = getClubLevelRequirement(currentLevel);
  const requiredForNext = getClubLevelRequirement(currentLevel + 1);
  const progressInLevel = totalContribution - requiredForCurrent;
  const levelRange = requiredForNext - requiredForCurrent;
  const progress = Math.min(1, Math.max(0, progressInLevel / levelRange));
  const canLevelUp = totalContribution >= requiredForNext;
  
  return { progress, requiredForNext, canLevelUp };
};

export const calculateClubTaskProgress = (
  tasks: ClubTask[],
  actionType: 'course' | 'dungeon' | 'recruit' | 'building',
  amount: number = 1,
  isThreeStar?: boolean
): ClubTask[] => {
  return tasks.map(task => {
    if (task.completed || task.claimed) return task;
    if (!task.unlocked) return task;
    
    let shouldUpdate = false;
    let updateAmount = amount;
    
    switch (task.type) {
      case 'course':
        shouldUpdate = actionType === 'course';
        break;
      case 'dungeon':
        shouldUpdate = actionType === 'dungeon';
        break;
      case 'recruit':
        shouldUpdate = actionType === 'recruit';
        break;
      case 'building':
        shouldUpdate = actionType === 'building';
        break;
      case 'special':
        if (task.id.includes('dungeon') && actionType === 'dungeon' && isThreeStar) {
          shouldUpdate = true;
        } else if (task.id.includes('course') && actionType === 'course') {
          shouldUpdate = true;
        }
        break;
    }
    
    if (shouldUpdate) {
      const newCurrent = Math.min(task.target, task.current + updateAmount);
      const completed = newCurrent >= task.target;
      return { ...task, current: newCurrent, completed };
    }
    
    return task;
  });
};

export const unlockPrerequisiteTasks = (tasks: ClubTask[], completedTaskId: string): ClubTask[] => {
  return tasks.map(task => {
    if (task.unlocked) return task;
    if (task.prerequisiteTaskId === completedTaskId) {
      return { ...task, unlocked: true };
    }
    return task;
  });
};

export const calculateDiscountedClubShopCost = (
  baseCost: { contributionPoints: number } & Partial<Resource>,
  clubReputation: number
): { contributionPoints: number } & Partial<Resource> => {
  const repLevel = getClubReputationLevel(clubReputation);
  const discount = repLevel.bonuses.shopDiscount;
  
  const result: { contributionPoints: number } & Partial<Resource> = {
    contributionPoints: Math.floor(baseCost.contributionPoints * (1 - discount)),
  };
  
  if (baseCost.gold !== undefined) result.gold = Math.floor(baseCost.gold * (1 - discount));
  if (baseCost.mana !== undefined) result.mana = Math.floor(baseCost.mana * (1 - discount));
  if (baseCost.food !== undefined) result.food = Math.floor(baseCost.food * (1 - discount));
  if (baseCost.reputation !== undefined) result.reputation = Math.floor(baseCost.reputation * (1 - discount));
  
  return result;
};

export const getClubMemberBonus = (
  club: Club,
  students: Student[]
): { expBonus: number; damageBonus: number; courseSpeedBonus: number; memberCount: number } => {
  const members = students.filter(s => club.members.includes(s.id));
  const memberCount = members.length;
  
  let expBonus = 0;
  let damageBonus = 0;
  let courseSpeedBonus = 0;
  
  for (const member of members) {
    if (club.primaryMagicType === 'mixed' || member.magicType === club.primaryMagicType) {
      const levelBonus = member.level * 0.002;
      const potentialBonus = (member.potential - 1) * 0.01;
      expBonus += levelBonus + potentialBonus;
      damageBonus += levelBonus + potentialBonus;
      courseSpeedBonus += levelBonus * 0.5;
    }
  }
  
  const focusMultiplier = club.focus === 'combat' ? 1.5 : club.focus === 'research' ? 1.3 : club.focus === 'support' ? 1.2 : 1;
  const expMultiplier = club.focus === 'research' ? 1.5 : club.focus === 'balanced' ? 1.2 : 1;
  const speedMultiplier = club.focus === 'research' ? 1.4 : club.focus === 'balanced' ? 1.2 : 1;
  
  return {
    expBonus: Math.min(0.5, expBonus * expMultiplier),
    damageBonus: Math.min(0.5, damageBonus * focusMultiplier),
    courseSpeedBonus: Math.min(0.3, courseSpeedBonus * speedMultiplier),
    memberCount,
  };
};

export const refreshClubShop = (items: ClubShopItem[]): ClubShopItem[] => {
  return items.map(item => ({
    ...item,
    stock: item.maxStock,
    purchasedCount: 0,
  }));
};