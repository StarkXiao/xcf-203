import type { Building, Course, Dungeon, Resource, RecruitmentTicket, MagicType, Trait, StudentQuality, TraitRarity, BuildingSynergy, Teacher, CourseBenefitBreakdown, Student, ReputationLevel, WeeklyGoal, StageTask, GoalProgress, WeeklyGoalsState, StageTasksState, GoalType, Club, ClubTask, ClubShopItem, ClubReputationLevel, ClubsState, Mentor, MentorAcademy, MentorSpecialization, SpecializationType, MentorQuality, MentorRank, MentorRecruitmentOption, MentorRecruitmentPool, MentorState, MentorCourseBonus, MentorDungeonBonus, MentorPromotionCheck, MentorDungeonLeadResult, AlchemyMaterialId, AlchemyMaterialDef, AlchemyMaterialRarity, PotionId, PotionRecipe, MaterialSynthesisRecipe, AlchemyState, ActivePotionBuff, AcademyEventDefinition, AcademyEventRarity, AcademyEventCategory, EventCenterState, KingdomCommission, CommissionStage, CommissionType, CommissionDifficulty, CommissionStageType, CommissionRankInfo, KingdomCommissionState, DormitoryState, DormitoryRoom, StudentRelationship, RelationshipLevel, RestActivity, DormitoryEventDef, DormitoryScheduleSlot, DormitoryEventInstance } from '../types/game';
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
  {
    id: 'trade_harbor',
    name: '贸易港',
    level: 0,
    maxLevel: 10,
    cost: { gold: 800, mana: 400, food: 60, reputation: 50 },
    effect: { type: 'trade_price_bonus', value: 1 },
    description: '贸易港核心建筑，买价降低/卖价提高，每级+2%',
    requiredReputation: 100,
    prerequisites: [
      { buildingId: 'main_building', requiredLevel: 3 },
    ],
  },
  {
    id: 'warehouse',
    name: '大型仓库',
    level: 0,
    maxLevel: 10,
    cost: { gold: 500, mana: 200, food: 40, reputation: 30 },
    effect: { type: 'warehouse_capacity', value: 20 },
    description: '每级增加20点仓储容量',
    requiredReputation: 80,
    prerequisites: [
      { buildingId: 'dining_hall', requiredLevel: 2 },
    ],
  },
  {
    id: 'auction_house',
    name: '拍卖行',
    level: 0,
    maxLevel: 10,
    cost: { gold: 1000, mana: 500, food: 50, reputation: 80 },
    effect: { type: 'trade_price_bonus', value: 2 },
    description: '提供更优的交易价格，每级买卖价差再优化+2%',
    requiredReputation: 200,
    prerequisites: [
      { buildingId: 'trade_harbor', requiredLevel: 2 },
      { buildingId: 'library', requiredLevel: 3 },
    ],
  },
  {
    id: 'caravan_hall',
    name: '商会会馆',
    level: 0,
    maxLevel: 10,
    cost: { gold: 700, mana: 350, food: 50, reputation: 60 },
    effect: { type: 'transport_speed', value: 1 },
    description: '每级提升运输速度10%，更快到达',
    requiredReputation: 150,
    prerequisites: [
      { buildingId: 'trade_harbor', requiredLevel: 1 },
    ],
  },
  {
    id: 'guard_post',
    name: '护卫营地',
    level: 0,
    maxLevel: 10,
    cost: { gold: 600, mana: 250, food: 70, reputation: 50 },
    effect: { type: 'trade_risk_reduction', value: 1 },
    description: '每级降低2%运输风险，保护货物安全',
    requiredReputation: 120,
    prerequisites: [
      { buildingId: 'trade_harbor', requiredLevel: 1 },
    ],
  },
  {
    id: 'alchemy_workshop',
    name: '炼金工坊',
    level: 0,
    maxLevel: 10,
    cost: { gold: 500, mana: 300, food: 30, reputation: 20 },
    effect: { type: 'course_speed', value: 5 },
    description: '炼金工坊核心建筑，解锁炼金系统，每级增加炼金效率',
    requiredReputation: 60,
    prerequisites: [
      { buildingId: 'library', requiredLevel: 2 },
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
  isFirstClear: boolean,
  mentorBonus?: MentorDungeonBonus,
  potionBonus: { damageBoost: number; defenseBoost: number } = { damageBoost: 0, defenseBoost: 0 }
): Resource => {
  const baseRewards = dungeon.rewards;
  const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;
  const rewardMultiplier = (mentorBonus?.rewardMultiplier ?? 1) * (1 + potionBonus.damageBoost + potionBonus.defenseBoost);

  const rewards: Resource = {
    gold: Math.floor(baseRewards.gold * starMultiplier * rewardMultiplier),
    mana: Math.floor(baseRewards.mana * starMultiplier * rewardMultiplier),
    food: Math.floor(baseRewards.food * starMultiplier * rewardMultiplier),
    reputation: Math.floor(baseRewards.reputation * starMultiplier * rewardMultiplier),
  };

  if (isFirstClear) {
    rewards.gold += Math.floor(dungeon.firstClearRewards.gold * rewardMultiplier);
    rewards.mana += Math.floor(dungeon.firstClearRewards.mana * rewardMultiplier);
    rewards.food += Math.floor(dungeon.firstClearRewards.food * rewardMultiplier);
    rewards.reputation += Math.floor(dungeon.firstClearRewards.reputation * rewardMultiplier);
  }

  return rewards;
};

export const getSweepRewardMultiplier = (bestStars: number): number => {
  if (bestStars >= 3) return 0.8;
  if (bestStars >= 2) return 0.6;
  return 0.4;
};

export const calculateSweepRewards = (dungeon: Dungeon, sweepBonus: number = 0): Resource => {
  const multiplier = getSweepRewardMultiplier(dungeon.bestStars) * (1 + sweepBonus);
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
  teachers: Teacher[],
  mentors?: Mentor[],
  academies?: MentorAcademy[],
  potionBuffs: { expBoost: number; speedBoost: number } = { expBoost: 0, speedBoost: 0 }
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
  
  let mentorBonus = 0;
  let mentorSpecializationBonus = 0;
  let academyBonus = 0;
  const contributingMentors: string[] = [];
  
  if (mentors && academies) {
    const mentorResult = calculateMentorCourseBonus(course, mentors, academies);
    mentorBonus = mentorResult.expMultiplier - 1;
    mentorSpecializationBonus = mentorResult.specializationsActive.length * 0.02;
    academyBonus = mentorResult.academyBonus;
    contributingMentors.push(...mentorResult.contributingMentors);
  }
  
  const additiveMultiplier = 
    magicTypeResult.bonus + 
    teacherResult.expBonus + 
    buildingResult.bonus + 
    totalTraitBonus +
    mentorBonus +
    mentorSpecializationBonus +
    academyBonus +
    potionBuffs.expBoost +
    potionBuffs.speedBoost;
  
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
    mentorBonus,
    mentorSpecializationBonus,
    academyBonus,
    contributingMentors,
    potionExpBoost: potionBuffs.expBoost,
    potionSpeedBoost: potionBuffs.speedBoost,
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
  if (breakdown.potionExpBoost > 0) {
    parts.push(`📚 经验药剂 +${Math.round(breakdown.potionExpBoost * 100)}%`);
  }
  if (breakdown.potionSpeedBoost > 0) {
    parts.push(`⏩ 加速药剂 +${Math.round(breakdown.potionSpeedBoost * 100)}%`);
  }
  if (breakdown.mentorBonus > 0 || breakdown.academyBonus > 0 || breakdown.mentorSpecializationBonus > 0) {
    const total = breakdown.mentorBonus + breakdown.mentorSpecializationBonus + breakdown.academyBonus;
    if (total > 0) parts.push(`👨‍🏫 导师 +${Math.round(total * 100)}%`);
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
    const updateAmount = amount;
    
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

import type {
  TradeMaterial,
  TradeMaterialType,
  TradeHarborState,
} from '../types/game';

export const TRADE_MATERIALS: TradeMaterial[] = [
  {
    id: 'mana_crystal',
    name: '魔力水晶',
    icon: '💎',
    description: '蕴含纯净魔力的结晶，法师们的日常消耗品',
    basePrice: 50,
    volatility: 0.25,
    category: 'consumable',
    dailyUsage: 5,
  },
  {
    id: 'magic_herb',
    name: '魔法草药',
    icon: '🌿',
    description: '生长在魔力充沛之地的珍稀草药，用于炼金和制药',
    basePrice: 80,
    volatility: 0.3,
    category: 'consumable',
    dailyUsage: 3,
  },
  {
    id: 'dragon_scale',
    name: '龙鳞',
    icon: '🐉',
    description: '从巨龙身上脱落的鳞片，坚固且蕴含魔力',
    basePrice: 300,
    volatility: 0.45,
    category: 'rare',
  },
  {
    id: 'star_silver',
    name: '星辰银',
    icon: '✨',
    description: '由陨星中提炼的神秘金属，附魔的绝佳材料',
    basePrice: 450,
    volatility: 0.4,
    category: 'rare',
  },
  {
    id: 'phoenix_feather',
    name: '凤凰羽',
    icon: '🔥',
    description: '传说中凤凰的羽毛，拥有强大的火焰与再生之力',
    basePrice: 1200,
    volatility: 0.55,
    category: 'legendary',
  },
  {
    id: 'void_essence',
    name: '虚空精华',
    icon: '🌌',
    description: '从虚空裂隙中提取的神秘能量，极度稀有',
    basePrice: 2000,
    volatility: 0.6,
    category: 'legendary',
  },
];

export const getTradeMaterial = (id: TradeMaterialType): TradeMaterial => {
  return TRADE_MATERIALS.find(m => m.id === id) || TRADE_MATERIALS[0];
};

export const calculateDailyPrices = (
  day: number,
  previousPrices: Record<TradeMaterialType, number>,
  previousTrends: Record<TradeMaterialType, 'up' | 'down' | 'stable'>
): { prices: Record<TradeMaterialType, number>; trends: Record<TradeMaterialType, 'up' | 'down' | 'stable'> } => {
  const prices: Record<TradeMaterialType, number> = { ...previousPrices };
  const trends: Record<TradeMaterialType, 'up' | 'down' | 'stable'> = { ...previousTrends };

  for (const material of TRADE_MATERIALS) {
    const seed = day * 1000 + material.basePrice;
    const rand1 = Math.sin(seed + 1) * 10000 - Math.floor(Math.sin(seed + 1) * 10000);
    const rand2 = Math.sin(seed + 2) * 10000 - Math.floor(Math.sin(seed + 2) * 10000);
    
    let changePercent = (rand1 - 0.5) * material.volatility * 2;
    
    const trendPersist = previousTrends[material.id] === 'up' ? 0.15 : previousTrends[material.id] === 'down' ? -0.15 : 0;
    changePercent += trendPersist;
    
    if (rand2 < 0.08) {
      changePercent += (rand1 > 0.5 ? 1 : -1) * material.volatility * 1.5;
    }
    
    const minPrice = material.basePrice * 0.4;
    const maxPrice = material.basePrice * 2.5;
    const newPrice = Math.round(Math.max(minPrice, Math.min(maxPrice, previousPrices[material.id] * (1 + changePercent))));
    
    prices[material.id] = newPrice;
    trends[material.id] = newPrice > previousPrices[material.id] ? 'up' : newPrice < previousPrices[material.id] ? 'down' : 'stable';
  }

  return { prices, trends };
};

export const getInitialTradePrices = (): Record<TradeMaterialType, number> => {
  const result: Record<string, number> = {};
  for (const material of TRADE_MATERIALS) {
    const rand = Math.sin(material.basePrice) * 10000 - Math.floor(Math.sin(material.basePrice) * 10000);
    const variation = (rand - 0.5) * 0.2;
    result[material.id] = Math.round(material.basePrice * (1 + variation));
  }
  return result as Record<TradeMaterialType, number>;
};

export const getInitialTradeTrends = (): Record<TradeMaterialType, 'up' | 'down' | 'stable'> => {
  return {
    mana_crystal: 'stable',
    magic_herb: 'stable',
    dragon_scale: 'stable',
    star_silver: 'stable',
    phoenix_feather: 'stable',
    void_essence: 'stable',
  };
};

export const calculateShipmentDuration = (
  route: 'local' | 'regional' | 'intercontinental',
  speedBonus: number = 0
): number => {
  const baseDuration = route === 'local' ? 1 : route === 'regional' ? 3 : 5;
  const reduction = Math.min(0.5, speedBonus * 0.1);
  return Math.max(1, Math.ceil(baseDuration * (1 - reduction)));
};

export const calculateShipmentRisk = (
  route: 'local' | 'regional' | 'intercontinental',
  riskReduction: number = 0
): number => {
  const baseRisk = route === 'local' ? 0.02 : route === 'regional' ? 0.08 : 0.15;
  const effectiveRisk = Math.max(0, baseRisk - riskReduction * 0.02);
  return effectiveRisk;
};

export const calculateTradePriceBonus = (
  type: 'buy' | 'sell',
  priceBonus: number = 0
): number => {
  return type === 'buy' 
    ? Math.max(0.8, 1 - priceBonus * 0.02) 
    : Math.min(1.3, 1 + priceBonus * 0.02);
};

export const getTotalWarehouseUsed = (materials: Record<TradeMaterialType, number>): number => {
  return Object.values(materials).reduce((sum, qty) => sum + qty, 0);
};

export const calculateWarehouseCapacity = (
  buildings: Building[],
  capacityBonus: number = 0
): number => {
  const baseCapacity = 100;
  let buildingBonus = 0;
  for (const building of buildings) {
    if (building.effect.type === 'warehouse_capacity') {
      buildingBonus += building.effect.value * building.level;
    }
  }
  const bonusMultiplier = 1 + capacityBonus * 0.1;
  return Math.round((baseCapacity + buildingBonus) * bonusMultiplier);
};

export const getTradeBuildingBonuses = (buildings: Building[]): {
  capacityBonus: number;
  priceBonus: number;
  transportSpeedBonus: number;
  riskReduction: number;
} => {
  let capacityBonus = 0;
  let priceBonus = 0;
  let transportSpeedBonus = 0;
  let riskReduction = 0;

  for (const building of buildings) {
    const level = building.level;
    switch (building.effect.type) {
      case 'warehouse_capacity':
        capacityBonus += level;
        break;
      case 'trade_price_bonus':
        priceBonus += level;
        break;
      case 'transport_speed':
        transportSpeedBonus += level;
        break;
      case 'trade_risk_reduction':
        riskReduction += level;
        break;
    }
  }

  const synergies = getActiveSynergies(buildings);
  for (const { synergy, totalValue } of synergies) {
    if (synergy.effect.type === 'all_stats_bonus') {
      capacityBonus += Math.floor(totalValue / 3);
      priceBonus += Math.floor(totalValue / 3);
      transportSpeedBonus += Math.floor(totalValue / 3);
    }
  }

  return { capacityBonus, priceBonus, transportSpeedBonus, riskReduction };
};

export const canPlaceBuyOrder = (
  _materialId: TradeMaterialType,
  quantity: number,
  currentGold: number,
  unitPrice: number,
  currentMaterials: Record<TradeMaterialType, number>,
  maxCapacity: number
): { ok: boolean; reason?: string } => {
  const totalPrice = unitPrice * quantity;
  if (currentGold < totalPrice) {
    return { ok: false, reason: `金币不足，需要 ${totalPrice}，当前 ${currentGold}` };
  }
  const used = getTotalWarehouseUsed(currentMaterials);
  if (used + quantity > maxCapacity) {
    return { ok: false, reason: `仓库容量不足，剩余 ${maxCapacity - used}，需要 ${quantity}` };
  }
  return { ok: true };
};

export const canPlaceSellOrder = (
  materialId: TradeMaterialType,
  quantity: number,
  currentMaterials: Record<TradeMaterialType, number>
): { ok: boolean; reason?: string } => {
  const available = currentMaterials[materialId] || 0;
  if (available < quantity) {
    return { ok: false, reason: `${getTradeMaterial(materialId).name}不足，库存 ${available}，需要 ${quantity}` };
  }
  return { ok: true };
};

export const generateTradeOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const generateShipmentId = (): string => {
  return `ship_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const INITIAL_TRADE_HARBOR_STATE: TradeHarborState = {
  unlocked: false,
  warehouse: {
    materials: {
      mana_crystal: 0,
      magic_herb: 0,
      dragon_scale: 0,
      star_silver: 0,
      phoenix_feather: 0,
      void_essence: 0,
    },
    capacity: 100,
    usedCapacity: 0,
    upgradeCost: { gold: 500, mana: 300, food: 50, reputation: 30 },
  },
  materials: {
    mana_crystal: 10,
    magic_herb: 5,
    dragon_scale: 0,
    star_silver: 0,
    phoenix_feather: 0,
    void_essence: 0,
  },
  activeOrders: [],
  historyOrders: [],
  activeShipments: [],
  priceHistory: [],
  currentPrices: getInitialTradePrices(),
  priceTrends: getInitialTradeTrends(),
  profitRecords: [],
  stats: {
    totalTrades: 0,
    totalVolume: 0,
    totalProfit: 0,
    totalLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    completedBuys: 0,
    completedSells: 0,
  },
  capacityBonus: 0,
  priceBonus: 0,
  transportSpeedBonus: 0,
  riskReduction: 0,
};

export const getRouteInfo = (route: 'local' | 'regional' | 'intercontinental'): {
  name: string;
  icon: string;
  description: string;
} => {
  switch (route) {
    case 'local':
      return { name: '本地运输', icon: '🛒', description: '快速安全，但数量有限' };
    case 'regional':
      return { name: '跨区贸易', icon: '🚛', description: '适中的速度和风险' };
    case 'intercontinental':
      return { name: '远洋商队', icon: '⛵', description: '可进行大额交易，但风险较高' };
  }
};

export const updateTradeHarborBonuses = (state: TradeHarborState, buildings: Building[]): TradeHarborState => {
  const bonuses = getTradeBuildingBonuses(buildings);
  const capacity = calculateWarehouseCapacity(buildings, bonuses.capacityBonus);
  return {
    ...state,
    ...bonuses,
    warehouse: {
      ...state.warehouse,
      capacity,
      usedCapacity: getTotalWarehouseUsed(state.materials),
    },
  };
};

export const MENTOR_QUALITY_NAMES: Record<MentorQuality, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const MENTOR_QUALITY_COLORS: Record<MentorQuality, string> = {
  common: '#9e9e9e',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

export const MENTOR_RANK_NAMES: Record<MentorRank, string> = {
  novice: '新手导师',
  apprentice: '见习导师',
  journeyman: '资深导师',
  expert: '专家导师',
  master: '大师导师',
  grandmaster: '宗师导师',
};

export const MENTOR_RANK_ORDER: MentorRank[] = ['novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster'];

export const getMentorRankExpRequirement = (rank: MentorRank): number => {
  const index = MENTOR_RANK_ORDER.indexOf(rank);
  return Math.floor(100 * Math.pow(2, index));
};

export const getNextMentorRank = (rank: MentorRank): MentorRank | null => {
  const index = MENTOR_RANK_ORDER.indexOf(rank);
  return index < MENTOR_RANK_ORDER.length - 1 ? MENTOR_RANK_ORDER[index + 1] : null;
};

export const getSpecializationExpRequirement = (level: number): number => {
  return Math.floor(50 * Math.pow(1.5, level - 1));
};

export const createEmptySpecialization = (
  id: SpecializationType,
  name: string,
  description: string,
  icon: string,
  effects: MentorSpecialization['effects'],
  effectDescription: string
): MentorSpecialization => ({
  id,
  name,
  description,
  icon,
  level: 1,
  maxLevel: 10,
  expToNext: getSpecializationExpRequirement(1),
  currentExp: 0,
  effects,
  effectDescription,
});

export const SPECIALIZATION_TEMPLATES: Record<SpecializationType, Omit<MentorSpecialization, 'level' | 'currentExp' | 'expToNext'>> = {
  fire_mastery: {
    id: 'fire_mastery',
    name: '火焰精通',
    description: '深入研究火系魔法，大幅提升火系课程和战斗效果',
    icon: '🔥',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.05, valuePerLevel: 0.02, target: 'fire' },
      { type: 'course_speed_bonus', value: 0.03, valuePerLevel: 0.01, target: 'fire' },
      { type: 'dungeon_damage_bonus', value: 0.05, valuePerLevel: 0.02, target: 'fire' },
    ],
    effectDescription: '',
  },
  water_mastery: {
    id: 'water_mastery',
    name: '水系精通',
    description: '深入研究水系魔法，大幅提升水系课程和战斗效果',
    icon: '💧',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.05, valuePerLevel: 0.02, target: 'water' },
      { type: 'course_speed_bonus', value: 0.03, valuePerLevel: 0.01, target: 'water' },
      { type: 'dungeon_damage_bonus', value: 0.05, valuePerLevel: 0.02, target: 'water' },
    ],
    effectDescription: '',
  },
  earth_mastery: {
    id: 'earth_mastery',
    name: '大地精通',
    description: '深入研究土系魔法，大幅提升土系课程和战斗效果',
    icon: '🪨',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.05, valuePerLevel: 0.02, target: 'earth' },
      { type: 'course_speed_bonus', value: 0.03, valuePerLevel: 0.01, target: 'earth' },
      { type: 'dungeon_hp_bonus', value: 0.05, valuePerLevel: 0.02, target: 'earth' },
    ],
    effectDescription: '',
  },
  wind_mastery: {
    id: 'wind_mastery',
    name: '风系精通',
    description: '深入研究风系魔法，大幅提升风系课程和战斗效果',
    icon: '💨',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.05, valuePerLevel: 0.02, target: 'wind' },
      { type: 'course_speed_bonus', value: 0.03, valuePerLevel: 0.01, target: 'wind' },
      { type: 'dungeon_damage_bonus', value: 0.05, valuePerLevel: 0.02, target: 'wind' },
    ],
    effectDescription: '',
  },
  light_mastery: {
    id: 'light_mastery',
    name: '光明精通',
    description: '深入研究光系魔法，大幅提升光系课程和战斗效果',
    icon: '✨',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.06, valuePerLevel: 0.025, target: 'light' },
      { type: 'dungeon_hp_bonus', value: 0.05, valuePerLevel: 0.02, target: 'light' },
      { type: 'morale_bonus', value: 0.02, valuePerLevel: 0.01 },
    ],
    effectDescription: '',
  },
  dark_mastery: {
    id: 'dark_mastery',
    name: '暗影精通',
    description: '深入研究暗系魔法，大幅提升暗系课程和战斗效果',
    icon: '🌑',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.06, valuePerLevel: 0.025, target: 'dark' },
      { type: 'dungeon_damage_bonus', value: 0.06, valuePerLevel: 0.025, target: 'dark' },
      { type: 'skill_damage_bonus', value: 0.03, valuePerLevel: 0.01 },
    ],
    effectDescription: '',
  },
  arcane_mastery: {
    id: 'arcane_mastery',
    name: '奥术精通',
    description: '精通奥术原理，对所有魔法类型提供均衡加成',
    icon: '🔮',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.03, valuePerLevel: 0.01 },
      { type: 'skill_damage_bonus', value: 0.02, valuePerLevel: 0.01 },
      { type: 'course_speed_bonus', value: 0.02, valuePerLevel: 0.01 },
    ],
    effectDescription: '',
  },
  combat_training: {
    id: 'combat_training',
    name: '战斗训练',
    description: '专注实战训练，大幅提升副本战斗能力',
    icon: '⚔️',
    maxLevel: 10,
    effects: [
      { type: 'dungeon_damage_bonus', value: 0.04, valuePerLevel: 0.02 },
      { type: 'dungeon_hp_bonus', value: 0.04, valuePerLevel: 0.02 },
      { type: 'stamina_regen_bonus', value: 0.03, valuePerLevel: 0.015 },
    ],
    effectDescription: '',
  },
  spell_research: {
    id: 'spell_research',
    name: '法术研究',
    description: '专注法术研究，提升技能威力和学习效率',
    icon: '📖',
    maxLevel: 10,
    effects: [
      { type: 'course_exp_bonus', value: 0.04, valuePerLevel: 0.02 },
      { type: 'skill_damage_bonus', value: 0.04, valuePerLevel: 0.02 },
      { type: 'course_speed_bonus', value: 0.02, valuePerLevel: 0.01 },
    ],
    effectDescription: '',
  },
  student_counseling: {
    id: 'student_counseling',
    name: '学员辅导',
    description: '专注学员成长，提升晋升速度和整体士气',
    icon: '💬',
    maxLevel: 10,
    effects: [
      { type: 'student_promotion_bonus', value: 0.05, valuePerLevel: 0.03 },
      { type: 'morale_bonus', value: 0.03, valuePerLevel: 0.015 },
      { type: 'course_exp_bonus', value: 0.03, valuePerLevel: 0.015 },
    ],
    effectDescription: '',
  },
  dungeon_specialist: {
    id: 'dungeon_specialist',
    name: '副本专家',
    description: '精通副本攻略，提供全方位的战斗加成',
    icon: '🗺️',
    maxLevel: 10,
    effects: [
      { type: 'dungeon_damage_bonus', value: 0.03, valuePerLevel: 0.015 },
      { type: 'dungeon_hp_bonus', value: 0.03, valuePerLevel: 0.015 },
      { type: 'recruit_quality_bonus', value: 0.02, valuePerLevel: 0.01 },
    ],
    effectDescription: '',
  },
};

export const getRecommendedSpecializations = (magicType: MagicType): SpecializationType[] => {
  const typeMap: Record<MagicType, SpecializationType[]> = {
    fire: ['fire_mastery', 'combat_training', 'spell_research'],
    water: ['water_mastery', 'spell_research', 'student_counseling'],
    earth: ['earth_mastery', 'combat_training', 'dungeon_specialist'],
    wind: ['wind_mastery', 'combat_training', 'spell_research'],
    light: ['light_mastery', 'student_counseling', 'dungeon_specialist'],
    dark: ['dark_mastery', 'combat_training', 'spell_research'],
  };
  return typeMap[magicType] || ['arcane_mastery'];
};

export const INITIAL_ACADEMIES: MentorAcademy[] = [
  {
    id: 'academy_warrior',
    name: '战技学院',
    type: 'warrior',
    level: 0,
    maxLevel: 10,
    reputation: 0,
    description: '专注战斗训练，培养强大的战士型魔法师',
    icon: '⚔️',
    mentors: [],
    maxMentors: 4,
    bonuses: {
      expBonus: 0,
      skillBonus: 0,
      speedBonus: 0,
      dungeonRewardBonus: 0.05,
      promotionBonus: 0,
      courseEfficiencyBonus: 0,
    },
    unlocked: false,
    requiredReputation: 100,
  },
  {
    id: 'academy_mage',
    name: '奥术学院',
    type: 'mage',
    level: 0,
    maxLevel: 10,
    reputation: 0,
    description: '专注魔法研究，培养博学的奥术师',
    icon: '🔮',
    mentors: [],
    maxMentors: 4,
    bonuses: {
      expBonus: 0.05,
      skillBonus: 0,
      speedBonus: 0.03,
      dungeonRewardBonus: 0,
      promotionBonus: 0,
      courseEfficiencyBonus: 0.05,
    },
    unlocked: false,
    requiredReputation: 100,
  },
  {
    id: 'academy_support',
    name: '辅助学院',
    type: 'support',
    level: 0,
    maxLevel: 10,
    reputation: 0,
    description: '专注学员培养，提升整体学员质量',
    icon: '💚',
    mentors: [],
    maxMentors: 4,
    bonuses: {
      expBonus: 0.03,
      skillBonus: 0,
      speedBonus: 0,
      dungeonRewardBonus: 0,
      promotionBonus: 0.08,
      courseEfficiencyBonus: 0,
    },
    unlocked: false,
    requiredReputation: 200,
  },
  {
    id: 'academy_mixed',
    name: '综合学院',
    type: 'mixed',
    level: 0,
    maxLevel: 10,
    reputation: 0,
    description: '全面发展，提供均衡的全方位加成',
    icon: '🌟',
    mentors: [],
    maxMentors: 6,
    bonuses: {
      expBonus: 0.02,
      skillBonus: 0.02,
      speedBonus: 0.02,
      dungeonRewardBonus: 0.02,
      promotionBonus: 0.02,
      courseEfficiencyBonus: 0.02,
    },
    unlocked: true,
    requiredReputation: 0,
  },
];

const MENTOR_FIRST_NAMES = ['阿尔弗雷德', '贝琳达', '塞德里克', '戴安娜', '埃德蒙', '菲奥娜', '格雷戈里', '海伦娜', '伊格内修斯', '朱莉娅', '科尼利厄斯', '洛雷娜', '马库斯', '娜塔莉', '奥利弗', '佩内洛普', '昆汀', '罗莎琳', '西奥多', '厄休拉'];
const MENTOR_TITLES = ['贤者', '大师', '导师', '教授', '学者', '术士', '法师', '长老'];

export const generateMentorName = (): string => {
  const firstName = MENTOR_FIRST_NAMES[Math.floor(Math.random() * MENTOR_FIRST_NAMES.length)];
  const title = MENTOR_TITLES[Math.floor(Math.random() * MENTOR_TITLES.length)];
  return `${firstName}·${title}`;
};

export const getMentorQualityMultiplier = (quality: MentorQuality): number => {
  switch (quality) {
    case 'legendary': return 2.0;
    case 'epic': return 1.5;
    case 'rare': return 1.2;
    default: return 1.0;
  }
};

export const getMentorInitialLevel = (quality: MentorQuality): number => {
  switch (quality) {
    case 'legendary': return 8;
    case 'epic': return 5;
    case 'rare': return 3;
    default: return 1;
  }
};

export const getMentorInitialRank = (quality: MentorQuality): MentorRank => {
  switch (quality) {
    case 'legendary': return 'expert';
    case 'epic': return 'journeyman';
    case 'rare': return 'apprentice';
    default: return 'novice';
  }
};

export const getMentorMaxCourses = (quality: MentorQuality, level: number): number => {
  const base = quality === 'legendary' ? 4 : quality === 'epic' ? 3 : quality === 'rare' ? 2 : 1;
  return base + Math.floor(level / 5);
};

export const getMentorSalaryMultiplier = (quality: MentorQuality, rank: MentorRank): number => {
  const qualityMult = getMentorQualityMultiplier(quality);
  const rankIndex = MENTOR_RANK_ORDER.indexOf(rank);
  const rankMult = 1 + rankIndex * 0.2;
  return qualityMult * rankMult;
};

export const generateMentorSpecializations = (magicType: MagicType, quality: MentorQuality): MentorSpecialization[] => {
  const recommended = getRecommendedSpecializations(magicType);
  const count = quality === 'legendary' ? 3 : quality === 'epic' ? 2 : 1;
  const selected = recommended.slice(0, count);
  
  return selected.map(specId => {
    const template = SPECIALIZATION_TEMPLATES[specId];
    const level = quality === 'legendary' ? 3 : quality === 'epic' ? 2 : 1;
    return {
      ...template,
      level,
      currentExp: 0,
      expToNext: getSpecializationExpRequirement(level),
    };
  });
};

export const generateRandomMentor = (
  quality: MentorQuality
): Omit<Mentor, 'id' | 'status' | 'assignedCourses' | 'assignedDungeon' | 'recruitedAt' | 'totalStudentsTaught' | 'totalDungeonsLed'> => {
  const magicTypes: MagicType[] = ['fire', 'water', 'earth', 'wind', 'light', 'dark'];
  const magicType = magicTypes[Math.floor(Math.random() * magicTypes.length)];
  const level = getMentorInitialLevel(quality);
  const rank = getMentorInitialRank(quality);
  const qualityMult = getMentorQualityMultiplier(quality);
  
  const baseExpBonus = 0.1 + qualityMult * 0.1;
  const baseSkillBonus = 0.05 + qualityMult * 0.08;
  
  const specializations = generateMentorSpecializations(magicType, quality);
  const maxCourses = getMentorMaxCourses(quality, level);
  
  const leadership = Math.floor(30 + qualityMult * 30 + Math.random() * 20);
  const charisma = Math.floor(30 + qualityMult * 30 + Math.random() * 20);
  const knowledge = Math.floor(30 + qualityMult * 30 + Math.random() * 20);
  
  const studentPromotionBonus = 0.02 + charisma / 500;
  const dungeonLeadBonus = 0.03 + leadership / 400;
  
  return {
    name: generateMentorName(),
    magicType,
    level,
    expBonus: baseExpBonus,
    skillBonus: baseSkillBonus,
    description: `${MENTOR_QUALITY_NAMES[quality]}品质的${MENTOR_RANK_NAMES[rank]}，专精${magicType}系魔法`,
    salary: {
      gold: Math.floor(30 * qualityMult),
      mana: Math.floor(20 * qualityMult),
      food: Math.floor(10 * qualityMult),
      reputation: Math.floor(5 * qualityMult),
    },
    quality,
    rank,
    exp: 0,
    expToNextRank: getMentorRankExpRequirement(rank),
    specializations,
    academyId: null,
    maxCourses,
    studentPromotionBonus,
    dungeonLeadBonus,
    leadership,
    charisma,
    knowledge,
    dailySalaryMultiplier: getMentorSalaryMultiplier(quality, rank),
  };
};

export const convertTeacherToMentor = (
  teacher: Teacher,
  day: number
): Mentor => {
  const quality: MentorQuality = teacher.level >= 8 ? 'epic' : teacher.level >= 6 ? 'rare' : 'common';
  const level = teacher.level;
  const rank: MentorRank = teacher.level >= 8 ? 'journeyman' : teacher.level >= 5 ? 'apprentice' : 'novice';
  const specializations = generateMentorSpecializations(teacher.magicType, quality);
  const maxCourses = getMentorMaxCourses(quality, level);
  
  const leadership = 30 + level * 5;
  const charisma = 30 + level * 5;
  const knowledge = 40 + level * 6;
  
  return {
    ...teacher,
    quality,
    rank,
    exp: 0,
    expToNextRank: getMentorRankExpRequirement(rank),
    status: 'idle',
    assignedCourses: teacher.id ? [] : [],
    assignedDungeon: null,
    specializations,
    academyId: null,
    maxCourses,
    studentPromotionBonus: 0.02 + charisma / 500,
    dungeonLeadBonus: 0.03 + leadership / 400,
    leadership,
    charisma,
    knowledge,
    recruitedAt: day,
    dailySalaryMultiplier: getMentorSalaryMultiplier(quality, rank),
    totalStudentsTaught: 0,
    totalDungeonsLed: 0,
  };
};

export const INITIAL_MENTORS: Mentor[] = INITIAL_TEACHERS.map((t, idx) => ({
  ...convertTeacherToMentor(t, 1),
  id: `mentor_${idx + 1}`,
  assignedCourses: t.id && ['fire_magic', 'water_magic', 'earth_magic', 'wind_magic', 'light_magic', 'dark_magic', 'advanced_magic'][idx] 
    ? [['fire_magic', 'water_magic', 'earth_magic', 'wind_magic', 'light_magic', 'dark_magic', 'advanced_magic'][idx]]
    : [],
}));

export const generateRecruitmentOption = (
  quality: MentorQuality,
  currentDay: number
): MentorRecruitmentOption => {
  const mentorTemplate = generateRandomMentor(quality);
  const qualityMult = getMentorQualityMultiplier(quality);
  
  const cost: Resource = {
    gold: Math.floor(300 * qualityMult),
    mana: Math.floor(200 * qualityMult),
    food: Math.floor(50 * qualityMult),
    reputation: Math.floor(30 * qualityMult),
  };
  
  const requiredReputation = quality === 'legendary' ? 500 : quality === 'epic' ? 200 : quality === 'rare' ? 80 : 0;
  
  return {
    id: `recruit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mentorTemplate,
    cost,
    expiresAtDay: currentDay + 3 + Math.floor(Math.random() * 4),
    locked: false,
    requiredReputation,
  };
};

export const refreshMentorRecruitmentPool = (
  currentDay: number,
  reputation: number
): MentorRecruitmentOption[] => {
  const options: MentorRecruitmentOption[] = [];
  
  options.push(generateRecruitmentOption('common', currentDay));
  options.push(generateRecruitmentOption('common', currentDay));
  
  if (reputation >= 50) {
    options.push(generateRecruitmentOption('rare', currentDay));
  }
  if (reputation >= 150) {
    options.push(generateRecruitmentOption('rare', currentDay));
  }
  if (reputation >= 300) {
    options.push(generateRecruitmentOption('epic', currentDay));
  }
  if (reputation >= 600 && Math.random() < 0.3) {
    options.push(generateRecruitmentOption('legendary', currentDay));
  }
  
  return options;
};

export const INITIAL_MENTOR_RECRUITMENT_POOL: MentorRecruitmentPool = {
  currentOptions: refreshMentorRecruitmentPool(1, 50),
  lastRefreshDay: 1,
  refreshCost: { gold: 200, mana: 100, food: 30, reputation: 10 },
  freeRefreshesPerWeek: 2,
  freeRefreshesUsed: 0,
  freeRefreshResetDay: 1,
};

export const INITIAL_MENTOR_STATE: MentorState = {
  mentors: INITIAL_MENTORS,
  academies: INITIAL_ACADEMIES,
  recruitmentPool: INITIAL_MENTOR_RECRUITMENT_POOL,
  maxMentors: 10,
  totalMentorSlots: 10,
};

export const calculateMentorCourseBonus = (
  course: Course,
  mentors: Mentor[],
  academies: MentorAcademy[]
): MentorCourseBonus => {
  let expMultiplier = 1;
  let speedMultiplier = 1;
  let skillBonusMultiplier = 1;
  let academyBonus = 0;
  const contributingMentors: string[] = [];
  const specializationsActive: SpecializationType[] = [];
  
  const assignedMentors = mentors.filter(m => m.assignedCourses.includes(course.id));
  
  for (const mentor of assignedMentors) {
    expMultiplier += mentor.expBonus;
    skillBonusMultiplier += mentor.skillBonus;
    contributingMentors.push(mentor.id);
    
    if (course.magicType && mentor.magicType === course.magicType) {
      expMultiplier *= 1.1;
      skillBonusMultiplier *= 1.1;
    }
    
    for (const spec of mentor.specializations) {
      if (!specializationsActive.includes(spec.id)) {
        specializationsActive.push(spec.id);
      }
      for (const effect of spec.effects) {
        const effectValue = effect.value + effect.valuePerLevel * (spec.level - 1);
        const matchesTarget = !effect.target || effect.target === course.magicType;
        
        if (!matchesTarget) continue;
        
        switch (effect.type) {
          case 'course_exp_bonus':
            expMultiplier += effectValue;
            break;
          case 'course_speed_bonus':
            speedMultiplier += effectValue;
            break;
          case 'skill_damage_bonus':
            skillBonusMultiplier += effectValue;
            break;
        }
      }
    }
  }
  
  for (const academy of academies) {
    if (academy.level === 0) continue;
    const academyMentors = mentors.filter(m => academy.mentors.includes(m.id));
    if (academyMentors.length === 0) continue;
    
    const hasMatchingMentor = academyMentors.some(m => contributingMentors.includes(m.id));
    if (!hasMatchingMentor) continue;
    
    const qualityMult = academyMentors.reduce((sum, m) => sum + getMentorQualityMultiplier(m.quality), 0) / academyMentors.length;
    const levelMult = 1 + academy.level * 0.05;
    const baseBonus = academy.bonuses.expBonus + academy.bonuses.speedBonus * 0.5 + academy.bonuses.courseEfficiencyBonus;
    let bonus = baseBonus * levelMult;
    bonus += academyMentors.length * 0.01;
    bonus *= qualityMult;
    
    expMultiplier += bonus;
    speedMultiplier += academy.bonuses.speedBonus * levelMult;
    academyBonus += bonus;
  }
  
  return {
    expMultiplier,
    speedMultiplier,
    skillBonusMultiplier,
    contributingMentors,
    specializationsActive,
    academyBonus,
  };
};

export const calculateMentorDungeonBonus = (
  dungeon: Dungeon,
  team: Student[],
  mentors: Mentor[],
  academies: MentorAcademy[]
): MentorDungeonBonus => {
  let damageBonus = 0;
  let hpBonus = 0;
  let staminaCostReduction = 0;
  let rewardBonus = 0;
  let starChanceBonus = 0;
  
  const assignedMentor = mentors.find(m => m.assignedDungeon === dungeon.id);
  
  if (assignedMentor) {
    damageBonus += assignedMentor.dungeonLeadBonus;
    hpBonus += assignedMentor.dungeonLeadBonus * 0.7;
    starChanceBonus += assignedMentor.leadership / 1000;
    
    const magicTypesInTeam = new Set(team.map(s => s.magicType));
    if (magicTypesInTeam.has(assignedMentor.magicType)) {
      damageBonus += 0.05;
      hpBonus += 0.03;
    }
    
    for (const spec of assignedMentor.specializations) {
      for (const effect of spec.effects) {
        const effectValue = effect.value + effect.valuePerLevel * (spec.level - 1);
        const matchesTarget = !effect.target || team.some(s => s.magicType === effect.target);
        
        if (!matchesTarget) continue;
        
        switch (effect.type) {
          case 'dungeon_damage_bonus':
            damageBonus += effectValue;
            break;
          case 'dungeon_hp_bonus':
            hpBonus += effectValue;
            break;
          case 'student_promotion_bonus':
            starChanceBonus += effectValue;
            break;
          case 'stamina_regen_bonus':
            staminaCostReduction += effectValue;
            break;
        }
      }
    }
  }
  
  for (const academy of academies) {
    if (academy.level === 0) continue;
    const academyMentors = mentors.filter(m => academy.mentors.includes(m.id));
    if (academyMentors.length === 0) continue;
    
    const hasLeadMentor = assignedMentor && academyMentors.includes(assignedMentor);
    if (!hasLeadMentor) continue;
    
    const qualityMult = academyMentors.reduce((sum, m) => sum + getMentorQualityMultiplier(m.quality), 0) / academyMentors.length;
    const levelMult = 1 + academy.level * 0.05;
    let bonus = academy.bonuses.dungeonRewardBonus * levelMult;
    bonus += academyMentors.length * 0.01;
    bonus *= qualityMult;
    
    damageBonus += bonus;
    hpBonus += bonus * 0.7;
    rewardBonus += bonus * 0.3;
  }
  
  const rewardMultiplier = 1 + rewardBonus;
  const expMultiplier = 1 + Math.min(0.5, damageBonus * 0.5 + hpBonus * 0.3);
  
  return {
    damageBonus: Math.min(1, damageBonus),
    hpBonus: Math.min(0.8, hpBonus),
    staminaCostReduction: Math.min(0.5, staminaCostReduction),
    rewardBonus: Math.min(0.5, rewardBonus),
    starChanceBonus: Math.min(0.3, starChanceBonus),
    rewardMultiplier,
    expMultiplier,
  };
};

export const calculateMentorPromotionBonus = (
  student: Student,
  mentors: Mentor[],
  academies: MentorAcademy[]
): MentorPromotionCheck => {
  let expBonus = 0;
  let levelUpChanceBonus = 0;
  let qualityUpgradeChance = 0;
  const contributingMentors: string[] = [];
  
  const relevantMentors = mentors.filter(m => {
    if (m.assignedCourses.length > 0) return true;
    if (m.academyId) {
      const academy = academies.find(a => a.id === m.academyId);
      return academy && academy.level > 0;
    }
    return false;
  });
  
  for (const mentor of relevantMentors) {
    if (mentor.magicType === student.magicType) {
      expBonus += mentor.expBonus * 0.5;
      levelUpChanceBonus += mentor.studentPromotionBonus * 0.5;
      contributingMentors.push(mentor.id);
    }
    
    if (student.assignedCourse && mentor.assignedCourses.includes(student.assignedCourse)) {
      expBonus += mentor.expBonus;
      levelUpChanceBonus += mentor.studentPromotionBonus;
      if (!contributingMentors.includes(mentor.id)) {
        contributingMentors.push(mentor.id);
      }
    }
    
    for (const spec of mentor.specializations) {
      for (const effect of spec.effects) {
        const effectValue = effect.value + effect.valuePerLevel * (spec.level - 1);
        const matchesTarget = !effect.target || effect.target === student.magicType;
        if (!matchesTarget) continue;
        
        if (effect.type === 'course_exp_bonus') {
          expBonus += effectValue * 0.3;
        } else if (effect.type === 'student_promotion_bonus') {
          levelUpChanceBonus += effectValue;
          expBonus += effectValue * 0.5;
        }
      }
    }
  }
  
  for (const academy of academies) {
    if (academy.level === 0) continue;
    const academyMentors = mentors.filter(m => academy.mentors.includes(m.id));
    if (academyMentors.length === 0) continue;
    
    const qualityMult = academyMentors.reduce((sum, m) => sum + getMentorQualityMultiplier(m.quality), 0) / academyMentors.length;
    const levelMult = 1 + academy.level * 0.05;
    let bonus = academy.bonuses.promotionBonus * levelMult;
    bonus += academyMentors.length * 0.01;
    bonus *= qualityMult;
    
    levelUpChanceBonus += bonus;
    expBonus += bonus;
    qualityUpgradeChance += bonus * 0.1;
  }
  
  const requiredLevel = student.quality === 'legendary' ? 15 : student.quality === 'epic' ? 10 : student.quality === 'rare' ? 6 : 3;
  const requiredExp = requiredLevel * 100;
  const canPromote = student.level >= requiredLevel && student.exp >= requiredExp * 0.5;
  const probabilityBonus = levelUpChanceBonus;
  
  return {
    canPromote,
    requiredLevel,
    requiredExp,
    mentorBonus: {
      expBonus: Math.min(1, expBonus),
      levelUpChanceBonus: Math.min(0.5, levelUpChanceBonus),
      qualityUpgradeChance: Math.min(0.1, qualityUpgradeChance),
    },
    contributingMentors,
    probabilityBonus,
  };
};

export const getNextStudentQuality = (quality: StudentQuality): StudentQuality | null => {
  if (quality === 'common') return 'rare';
  if (quality === 'rare') return 'epic';
  if (quality === 'epic') return 'legendary';
  return null;
};

export const getQualityUpgradeRequirements = (quality: StudentQuality): { level: number } => {
  switch (quality) {
    case 'common': return { level: 5 };
    case 'rare': return { level: 10 };
    case 'epic': return { level: 15 };
    default: return { level: 999 };
  }
};

export interface StudentPromotionResult {
  qualityUpgraded: boolean;
  oldQuality?: StudentQuality;
  newQuality?: StudentQuality;
  bonusExpGained: number;
  bonusLevelsGained: number;
}

export const tryStudentPromotion = (
  student: Student,
  mentors: Mentor[],
  academies: MentorAcademy[]
): StudentPromotionResult => {
  const promotionCheck = calculateMentorPromotionBonus(student, mentors, academies);
  const { qualityUpgradeChance, levelUpChanceBonus } = promotionCheck.mentorBonus;

  let bonusExpGained = 0;
  const bonusLevelsGained = 0;
  let qualityUpgraded = false;
  let oldQuality: StudentQuality | undefined;
  let newQuality: StudentQuality | undefined;

  if (levelUpChanceBonus > 0) {
    const roll = Math.random();
    if (roll < levelUpChanceBonus) {
      bonusExpGained = Math.floor(student.level * 50 * levelUpChanceBonus);
    }
  }

  const nextQuality = getNextStudentQuality(student.quality);
  if (nextQuality) {
    const requirements = getQualityUpgradeRequirements(student.quality);
    if (student.level >= requirements.level) {
      const baseChance = 0.02;
      const totalChance = baseChance + qualityUpgradeChance;
      const roll = Math.random();
      if (roll < totalChance) {
        qualityUpgraded = true;
        oldQuality = student.quality;
        newQuality = nextQuality;
      }
    }
  }

  return {
    qualityUpgraded,
    oldQuality,
    newQuality,
    bonusExpGained,
    bonusLevelsGained,
  };
};

export const applyQualityUpgradeToStudent = (student: Student, newQuality: StudentQuality, currentDay: number = 0): Student => {
  const qualityMult = getQualityMultiplier(newQuality);
  const oldQualityMult = getQualityMultiplier(student.quality);
  const potentialBoost = (qualityMult - oldQualityMult) * 0.3;

  const newPotential = Math.min(2.5, student.potential + potentialBoost);
  const newMaxHp = Math.floor(student.maxHp * (1 + (qualityMult - oldQualityMult) * 0.5));

  const qualityNames: Record<StudentQuality, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  const newGrowthRecords = [...student.growthRecords, {
    id: `growth_${student.id}_quality_${Date.now()}`,
    type: 'quality_up' as const,
    day: currentDay,
    description: `品质晋升: ${qualityNames[student.quality]} → ${qualityNames[newQuality]}`,
    details: { oldQuality: student.quality, newQuality, potentialBoost },
  }];

  return {
    ...student,
    quality: newQuality,
    potential: Number(newPotential.toFixed(2)),
    maxHp: newMaxHp,
    currentHp: Math.min(student.currentHp, newMaxHp),
    growthRecords: newGrowthRecords,
  };
};

export const canAssignMentorToCourse = (
  mentor: Mentor,
  courseId: string
): { ok: boolean; reason?: string } => {
  if (mentor.assignedCourses.includes(courseId)) {
    return { ok: false, reason: '导师已分配到此课程' };
  }
  if (mentor.assignedCourses.length >= mentor.maxCourses) {
    return { ok: false, reason: `导师课程已满 (${mentor.assignedCourses.length}/${mentor.maxCourses})` };
  }
  return { ok: true };
};

export const canMentorLeadDungeon = (
  mentor: Mentor,
  dungeonLevel: number
): MentorDungeonLeadResult => {
  const requiredMentorLevel = Math.max(1, dungeonLevel - 2);
  const canLead = mentor.level >= requiredMentorLevel;
  
  const bonuses: MentorDungeonBonus = canLead ? {
    damageBonus: mentor.dungeonLeadBonus,
    hpBonus: mentor.dungeonLeadBonus * 0.7,
    staminaCostReduction: mentor.leadership / 2000,
    rewardBonus: mentor.charisma / 2000,
    starChanceBonus: mentor.knowledge / 2000,
    rewardMultiplier: 1 + mentor.charisma / 2000,
    expMultiplier: 1 + (mentor.dungeonLeadBonus * 0.5),
  } : {
    damageBonus: 0,
    hpBonus: 0,
    staminaCostReduction: 0,
    rewardBonus: 0,
    starChanceBonus: 0,
    rewardMultiplier: 1,
    expMultiplier: 1,
  };
  
  return {
    canLead,
    mentor: canLead ? mentor : undefined,
    bonuses,
    requiredMentorLevel,
    reason: canLead ? undefined : `导师等级不足 (需要Lv.${requiredMentorLevel})`,
  };
};

export const getAcademyUpgradeCost = (academy: MentorAcademy): Resource => {
  const baseMult = Math.pow(1.5, academy.level);
  const typeMult = academy.type === 'mixed' ? 1.2 : 1;
  return {
    gold: Math.floor(500 * baseMult * typeMult),
    mana: Math.floor(300 * baseMult * typeMult),
    food: Math.floor(80 * baseMult * typeMult),
    reputation: Math.floor(50 * baseMult * typeMult),
  };
};

export const getAcademyBonusDescription = (academy: MentorAcademy): string => {
  const parts: string[] = [];
  const level = Math.max(1, academy.level);
  const mult = 1 + level * 0.05;
  if (academy.bonuses.expBonus > 0) parts.push(`经验+${Math.round(academy.bonuses.expBonus * mult * 100)}%`);
  if (academy.bonuses.speedBonus > 0) parts.push(`速度+${Math.round(academy.bonuses.speedBonus * mult * 100)}%`);
  if (academy.bonuses.dungeonRewardBonus > 0) parts.push(`副本奖励+${Math.round(academy.bonuses.dungeonRewardBonus * mult * 100)}%`);
  if (academy.bonuses.promotionBonus > 0) parts.push(`晋升+${Math.round(academy.bonuses.promotionBonus * mult * 100)}%`);
  if (academy.bonuses.courseEfficiencyBonus > 0) parts.push(`课程效率+${Math.round(academy.bonuses.courseEfficiencyBonus * mult * 100)}%`);
  if (academy.bonuses.skillBonus > 0) parts.push(`技能+${Math.round(academy.bonuses.skillBonus * mult * 100)}%`);
  return parts.length > 0 ? parts.join('，') : '暂无加成';
};

export const getMentorMentorExpGain = (action: 'teach_course' | 'lead_dungeon', quality: MentorQuality): number => {
  const base = action === 'teach_course' ? 10 : 15;
  return Math.floor(base * getMentorQualityMultiplier(quality));
};

export const ALCHEMY_MATERIALS: AlchemyMaterialDef[] = [
  { id: 'herb_grass', name: '魔法草', icon: '🌿', description: '随处可见的魔法植物', rarity: 'common', category: 'herb', sellPrice: 5 },
  { id: 'moon_dew', name: '月光露', icon: '🌙', description: '月夜凝结的魔力露水', rarity: 'common', category: 'herb', sellPrice: 8 },
  { id: 'fire_ash', name: '火焰灰', icon: '🔥', description: '火系魔力灼烧后的残灰', rarity: 'common', category: 'herb', sellPrice: 6 },
  { id: 'earth_shard', name: '大地碎片', icon: '🪨', description: '蕴含土系力量的矿石碎片', rarity: 'common', category: 'herb', sellPrice: 6 },
  { id: 'wind_leaf', name: '风之叶', icon: '🍃', description: '永不停歇的风系叶片', rarity: 'common', category: 'herb', sellPrice: 6 },
  { id: 'light_petal', name: '光之花瓣', icon: '✨', description: '散发微光的圣洁花瓣', rarity: 'uncommon', category: 'herb', sellPrice: 12 },
  { id: 'dark_spore', name: '暗影孢子', icon: '🌑', description: '黑暗中生长的魔性孢子', rarity: 'uncommon', category: 'herb', sellPrice: 12 },
  { id: 'essence_flame', name: '火焰精华', icon: '🔥', description: '浓缩的火系魔力精华', rarity: 'uncommon', category: 'essence', sellPrice: 20 },
  { id: 'essence_tide', name: '潮汐精华', icon: '💧', description: '浓缩的水系魔力精华', rarity: 'uncommon', category: 'essence', sellPrice: 20 },
  { id: 'essence_stone', name: '磐石精华', icon: '🪨', description: '浓缩的土系魔力精华', rarity: 'uncommon', category: 'essence', sellPrice: 20 },
  { id: 'essence_gale', name: '疾风精华', icon: '💨', description: '浓缩的风系魔力精华', rarity: 'uncommon', category: 'essence', sellPrice: 20 },
  { id: 'essence_radiance', name: '光辉精华', icon: '☀️', description: '浓缩的光系魔力精华', rarity: 'rare', category: 'essence', sellPrice: 35 },
  { id: 'essence_void', name: '虚空精华', icon: '🌑', description: '浓缩的暗系魔力精华', rarity: 'rare', category: 'essence', sellPrice: 35 },
  { id: 'crystal_pure', name: '纯净水晶', icon: '💎', description: '纯净的魔力水晶', rarity: 'rare', category: 'crystal', sellPrice: 40 },
  { id: 'crystal_fused', name: '融合水晶', icon: '💠', description: '多系魔力融合的水晶', rarity: 'epic', category: 'crystal', sellPrice: 80 },
  { id: 'dragon_blood', name: '龙血', icon: '🩸', description: '远古巨龙的血液', rarity: 'epic', category: 'special', sellPrice: 100 },
  { id: 'star_dust', name: '星尘', icon: '⭐', description: '来自星辰的微尘', rarity: 'epic', category: 'special', sellPrice: 90 },
  { id: 'phoenix_feather_dust', name: '凤羽粉', icon: '🪶', description: '凤凰羽毛研磨的粉末', rarity: 'legendary', category: 'special', sellPrice: 200 },
];

export const getAlchemyMaterial = (id: AlchemyMaterialId): AlchemyMaterialDef => {
  return ALCHEMY_MATERIALS.find(m => m.id === id) || ALCHEMY_MATERIALS[0];
};

const ALL_MATERIAL_IDS: AlchemyMaterialId[] = [
  'herb_grass', 'moon_dew', 'fire_ash', 'earth_shard', 'wind_leaf', 'light_petal', 'dark_spore',
  'essence_flame', 'essence_tide', 'essence_stone', 'essence_gale', 'essence_radiance', 'essence_void',
  'crystal_pure', 'crystal_fused', 'dragon_blood', 'star_dust', 'phoenix_feather_dust',
];

const ALL_POTION_IDS: PotionId[] = [
  'potion_hp_minor', 'potion_hp_major', 'potion_hp_supreme',
  'potion_mana_minor', 'potion_mana_major',
  'potion_stamina_minor', 'potion_stamina_major',
  'potion_exp_boost', 'potion_course_speed', 'potion_morale_boost',
  'potion_damage_boost', 'potion_defense_boost', 'potion_dungeon_sweep',
  'potion_reputation_elixir', 'potion_gold_dust',
];

export const INITIAL_POTION_RECIPES: PotionRecipe[] = [
  {
    id: 'potion_hp_minor', name: '小型生命药水', icon: '❤️', description: '恢复30点HP',
    rarity: 'common', effects: [{ type: 'heal_hp', value: 30 }], usageContext: 'dungeon',
    materials: { herb_grass: 3, moon_dew: 1 }, goldCost: 10, manaCost: 5, sellPrice: 15,
    craftingTime: 1, requiredWorkshopLevel: 1, unlocked: true, requiredReputation: 0,
  },
  {
    id: 'potion_hp_major', name: '大型生命药水', icon: '❤️', description: '恢复80点HP',
    rarity: 'uncommon', effects: [{ type: 'heal_hp', value: 80 }], usageContext: 'dungeon',
    materials: { herb_grass: 5, moon_dew: 3, crystal_pure: 1 }, goldCost: 30, manaCost: 15, sellPrice: 40,
    craftingTime: 2, requiredWorkshopLevel: 2, unlocked: true, requiredReputation: 50,
  },
  {
    id: 'potion_hp_supreme', name: '至尊生命药水', icon: '❤️', description: '恢复200点HP',
    rarity: 'rare', effects: [{ type: 'heal_hp', value: 200 }], usageContext: 'dungeon',
    materials: { herb_grass: 8, moon_dew: 5, crystal_fused: 1, dragon_blood: 1 }, goldCost: 80, manaCost: 40, sellPrice: 120,
    craftingTime: 3, requiredWorkshopLevel: 4, unlocked: true, requiredReputation: 200,
  },
  {
    id: 'potion_mana_minor', name: '小型魔力药水', icon: '🔮', description: '恢复20点魔力',
    rarity: 'common', effects: [{ type: 'restore_mana', value: 20 }], usageContext: 'any',
    materials: { moon_dew: 3, fire_ash: 1 }, goldCost: 15, manaCost: 0, sellPrice: 20,
    craftingTime: 1, requiredWorkshopLevel: 1, unlocked: true, requiredReputation: 0,
  },
  {
    id: 'potion_mana_major', name: '大型魔力药水', icon: '🔮', description: '恢复60点魔力',
    rarity: 'uncommon', effects: [{ type: 'restore_mana', value: 60 }], usageContext: 'any',
    materials: { moon_dew: 5, essence_flame: 1, crystal_pure: 1 }, goldCost: 40, manaCost: 0, sellPrice: 55,
    craftingTime: 2, requiredWorkshopLevel: 3, unlocked: true, requiredReputation: 100,
  },
  {
    id: 'potion_stamina_minor', name: '小型体力药水', icon: '⚡', description: '恢复15点体力',
    rarity: 'common', effects: [{ type: 'restore_stamina', value: 15 }], usageContext: 'dungeon',
    materials: { herb_grass: 2, wind_leaf: 2 }, goldCost: 10, manaCost: 5, sellPrice: 15,
    craftingTime: 1, requiredWorkshopLevel: 1, unlocked: true, requiredReputation: 0,
  },
  {
    id: 'potion_stamina_major', name: '大型体力药水', icon: '⚡', description: '恢复40点体力',
    rarity: 'uncommon', effects: [{ type: 'restore_stamina', value: 40 }], usageContext: 'dungeon',
    materials: { herb_grass: 4, wind_leaf: 4, essence_gale: 1 }, goldCost: 30, manaCost: 15, sellPrice: 45,
    craftingTime: 2, requiredWorkshopLevel: 2, unlocked: true, requiredReputation: 80,
  },
  {
    id: 'potion_exp_boost', name: '经验增幅药剂', icon: '📚', description: '课程经验+30%，持续3天',
    rarity: 'uncommon', effects: [{ type: 'exp_boost', value: 0.3, duration: 3 }], usageContext: 'course',
    materials: { moon_dew: 3, earth_shard: 2, essence_stone: 1 }, goldCost: 50, manaCost: 25, sellPrice: 70,
    craftingTime: 2, requiredWorkshopLevel: 2, unlocked: true, requiredReputation: 80,
  },
  {
    id: 'potion_course_speed', name: '学习加速药剂', icon: '⏩', description: '课程速度+25%，持续3天',
    rarity: 'uncommon', effects: [{ type: 'course_speed_boost', value: 0.25, duration: 3 }], usageContext: 'course',
    materials: { wind_leaf: 3, moon_dew: 2, essence_gale: 1 }, goldCost: 45, manaCost: 20, sellPrice: 65,
    craftingTime: 2, requiredWorkshopLevel: 2, unlocked: true, requiredReputation: 80,
  },
  {
    id: 'potion_morale_boost', name: '士气鼓舞药剂', icon: '😊', description: '士气+25',
    rarity: 'common', effects: [{ type: 'morale_boost', value: 25 }], usageContext: 'any',
    materials: { herb_grass: 2, light_petal: 1 }, goldCost: 15, manaCost: 10, sellPrice: 25,
    craftingTime: 1, requiredWorkshopLevel: 1, unlocked: true, requiredReputation: 30,
  },
  {
    id: 'potion_damage_boost', name: '战斗强化药剂', icon: '⚔️', description: '副本伤害+20%，持续1次副本',
    rarity: 'rare', effects: [{ type: 'damage_boost', value: 0.2, duration: 1 }], usageContext: 'dungeon',
    materials: { fire_ash: 4, essence_flame: 2, crystal_pure: 1 }, goldCost: 60, manaCost: 30, sellPrice: 90,
    craftingTime: 2, requiredWorkshopLevel: 3, unlocked: true, requiredReputation: 150,
  },
  {
    id: 'potion_defense_boost', name: '防御强化药剂', icon: '🛡️', description: '副本防御+20%，减少受伤，持续1次副本',
    rarity: 'rare', effects: [{ type: 'defense_boost', value: 0.2, duration: 1 }], usageContext: 'dungeon',
    materials: { earth_shard: 4, essence_stone: 2, crystal_pure: 1 }, goldCost: 60, manaCost: 30, sellPrice: 90,
    craftingTime: 2, requiredWorkshopLevel: 3, unlocked: true, requiredReputation: 150,
  },
  {
    id: 'potion_dungeon_sweep', name: '扫荡增幅药剂', icon: '🏆', description: '扫荡奖励+30%',
    rarity: 'epic', effects: [{ type: 'sweep_bonus', value: 0.3 }], usageContext: 'dungeon',
    materials: { essence_radiance: 1, crystal_fused: 1, star_dust: 1 }, goldCost: 100, manaCost: 50, sellPrice: 160,
    craftingTime: 3, requiredWorkshopLevel: 5, unlocked: true, requiredReputation: 300,
  },
  {
    id: 'potion_reputation_elixir', name: '声望灵药', icon: '⭐', description: '获得15声望',
    rarity: 'rare', effects: [{ type: 'reputation_gain', value: 15 }], usageContext: 'any',
    materials: { light_petal: 3, essence_radiance: 1, crystal_pure: 1 }, goldCost: 50, manaCost: 30, sellPrice: 80,
    craftingTime: 2, requiredWorkshopLevel: 3, unlocked: true, requiredReputation: 150,
  },
  {
    id: 'potion_gold_dust', name: '黄金粉末', icon: '💰', description: '获得100金币',
    rarity: 'uncommon', effects: [{ type: 'gold_gain', value: 100 }], usageContext: 'any',
    materials: { fire_ash: 3, earth_shard: 2, moon_dew: 2 }, goldCost: 20, manaCost: 10, sellPrice: 50,
    craftingTime: 1, requiredWorkshopLevel: 2, unlocked: true, requiredReputation: 50,
  },
];

export const INITIAL_SYNTHESIS_RECIPES: MaterialSynthesisRecipe[] = [
  {
    id: 'synth_essence_flame', name: '提炼火焰精华',
    inputs: { fire_ash: 5, herb_grass: 2 },
    output: { materialId: 'essence_flame', quantity: 1 },
    goldCost: 15, requiredWorkshopLevel: 1,
  },
  {
    id: 'synth_essence_tide', name: '提炼潮汐精华',
    inputs: { moon_dew: 5, herb_grass: 2 },
    output: { materialId: 'essence_tide', quantity: 1 },
    goldCost: 15, requiredWorkshopLevel: 1,
  },
  {
    id: 'synth_essence_stone', name: '提炼磐石精华',
    inputs: { earth_shard: 5, herb_grass: 2 },
    output: { materialId: 'essence_stone', quantity: 1 },
    goldCost: 15, requiredWorkshopLevel: 1,
  },
  {
    id: 'synth_essence_gale', name: '提炼疾风精华',
    inputs: { wind_leaf: 5, herb_grass: 2 },
    output: { materialId: 'essence_gale', quantity: 1 },
    goldCost: 15, requiredWorkshopLevel: 1,
  },
  {
    id: 'synth_essence_radiance', name: '提炼光辉精华',
    inputs: { light_petal: 4, essence_flame: 1, essence_stone: 1 },
    output: { materialId: 'essence_radiance', quantity: 1 },
    goldCost: 30, requiredWorkshopLevel: 2,
  },
  {
    id: 'synth_essence_void', name: '提炼虚空精华',
    inputs: { dark_spore: 4, essence_flame: 1, essence_gale: 1 },
    output: { materialId: 'essence_void', quantity: 1 },
    goldCost: 30, requiredWorkshopLevel: 2,
  },
  {
    id: 'synth_crystal_pure', name: '凝结纯净水晶',
    inputs: { moon_dew: 3, essence_flame: 1, essence_tide: 1 },
    output: { materialId: 'crystal_pure', quantity: 1 },
    goldCost: 40, requiredWorkshopLevel: 2,
  },
  {
    id: 'synth_crystal_fused', name: '融合多系水晶',
    inputs: { crystal_pure: 2, essence_flame: 1, essence_tide: 1, essence_stone: 1, essence_gale: 1 },
    output: { materialId: 'crystal_fused', quantity: 1 },
    goldCost: 80, requiredWorkshopLevel: 4,
  },
  {
    id: 'synth_dragon_blood', name: '炼制龙血',
    inputs: { fire_ash: 8, essence_flame: 3, crystal_pure: 2 },
    output: { materialId: 'dragon_blood', quantity: 1 },
    goldCost: 120, requiredWorkshopLevel: 4,
  },
  {
    id: 'synth_star_dust', name: '收集星尘',
    inputs: { light_petal: 5, moon_dew: 5, crystal_pure: 2 },
    output: { materialId: 'star_dust', quantity: 1 },
    goldCost: 100, requiredWorkshopLevel: 4,
  },
  {
    id: 'synth_phoenix_feather', name: '研磨凤羽粉',
    inputs: { fire_ash: 10, dragon_blood: 2, crystal_fused: 1, star_dust: 1 },
    output: { materialId: 'phoenix_feather_dust', quantity: 1 },
    goldCost: 300, requiredWorkshopLevel: 5,
  },
];

export const DUNGEON_MATERIAL_DROPS: Record<string, { materialId: AlchemyMaterialId; quantity: number; chance: number }[]> = {
  dark_forest: [
    { materialId: 'herb_grass', quantity: 3, chance: 0.9 },
    { materialId: 'moon_dew', quantity: 2, chance: 0.7 },
    { materialId: 'fire_ash', quantity: 2, chance: 0.5 },
    { materialId: 'wind_leaf', quantity: 2, chance: 0.5 },
    { materialId: 'light_petal', quantity: 1, chance: 0.3 },
  ],
  ancient_ruins: [
    { materialId: 'herb_grass', quantity: 5, chance: 0.9 },
    { materialId: 'moon_dew', quantity: 3, chance: 0.8 },
    { materialId: 'earth_shard', quantity: 3, chance: 0.7 },
    { materialId: 'dark_spore', quantity: 2, chance: 0.5 },
    { materialId: 'essence_flame', quantity: 1, chance: 0.4 },
    { materialId: 'essence_tide', quantity: 1, chance: 0.4 },
    { materialId: 'crystal_pure', quantity: 1, chance: 0.2 },
  ],
  dragon_lair: [
    { materialId: 'fire_ash', quantity: 6, chance: 0.9 },
    { materialId: 'moon_dew', quantity: 5, chance: 0.8 },
    { materialId: 'essence_flame', quantity: 2, chance: 0.6 },
    { materialId: 'essence_stone', quantity: 2, chance: 0.5 },
    { materialId: 'crystal_pure', quantity: 2, chance: 0.4 },
    { materialId: 'dragon_blood', quantity: 1, chance: 0.15 },
    { materialId: 'star_dust', quantity: 1, chance: 0.1 },
    { materialId: 'crystal_fused', quantity: 1, chance: 0.08 },
  ],
};

export const rollDungeonMaterialDrops = (dungeonId: string, stars: number): Record<AlchemyMaterialId, number> => {
  const drops = DUNGEON_MATERIAL_DROPS[dungeonId] || [];
  const result: Record<AlchemyMaterialId, number> = {} as Record<AlchemyMaterialId, number>;
  const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;
  
  for (const drop of drops) {
    if (Math.random() < drop.chance * starMultiplier) {
      const qty = Math.max(1, Math.floor(drop.quantity * starMultiplier));
      result[drop.materialId] = (result[drop.materialId] || 0) + qty;
    }
  }
  return result;
};

export const canCraftPotion = (
  recipe: PotionRecipe,
  materials: Record<AlchemyMaterialId, number>,
  gold: number,
  mana: number,
  workshopLevel: number,
  activeCraftings: number,
  craftingSlots: number,
  reputation: number
): { ok: boolean; reason?: string } => {
  if (activeCraftings >= craftingSlots) return { ok: false, reason: ' crafting队列已满' };
  if (workshopLevel < recipe.requiredWorkshopLevel) return { ok: false, reason: `工坊等级不足(需要Lv.${recipe.requiredWorkshopLevel})` };
  if (reputation < recipe.requiredReputation) return { ok: false, reason: `声望不足(需要${recipe.requiredReputation})` };
  if (gold < recipe.goldCost) return { ok: false, reason: '金币不足' };
  if (mana < recipe.manaCost) return { ok: false, reason: '魔力不足' };
  for (const [matId, qty] of Object.entries(recipe.materials)) {
    if ((materials[matId as AlchemyMaterialId] || 0) < qty) {
      const matDef = getAlchemyMaterial(matId as AlchemyMaterialId);
      return { ok: false, reason: `${matDef.name}不足` };
    }
  }
  return { ok: true };
};

export const canSynthesizeMaterial = (
  recipe: MaterialSynthesisRecipe,
  materials: Record<AlchemyMaterialId, number>,
  gold: number,
  workshopLevel: number
): { ok: boolean; reason?: string } => {
  if (workshopLevel < recipe.requiredWorkshopLevel) return { ok: false, reason: `工坊等级不足(需要Lv.${recipe.requiredWorkshopLevel})` };
  if (gold < recipe.goldCost) return { ok: false, reason: '金币不足' };
  for (const [matId, qty] of Object.entries(recipe.inputs)) {
    if ((materials[matId as AlchemyMaterialId] || 0) < qty) {
      const matDef = getAlchemyMaterial(matId as AlchemyMaterialId);
      return { ok: false, reason: `${matDef.name}不足` };
    }
  }
  return { ok: true };
};

export const getWorkshopUpgradeCost = (currentLevel: number): Resource => {
  const mult = Math.pow(1.8, currentLevel - 1);
  return {
    gold: Math.floor(300 * mult),
    mana: Math.floor(200 * mult),
    food: Math.floor(50 * mult),
    reputation: Math.floor(30 * mult),
  };
};

export const getCraftingSlotsForLevel = (level: number): number => {
  return 1 + Math.floor(level / 2);
};

export const getWorkshopRequiredReputation = (): number => 60;

export const getPotionCourseBuffs = (buffs: ActivePotionBuff[], studentId?: string): { expBoost: number; speedBoost: number; usedBuffIds: string[] } => {
  let expBoost = 0;
  let speedBoost = 0;
  const usedBuffIds: string[] = [];
  for (const b of buffs) {
    if (b.studentId && studentId && b.studentId !== studentId) continue;
    let used = false;
    for (const e of b.effects) {
      if (e.type === 'exp_boost') { expBoost += e.value; used = true; }
      if (e.type === 'course_speed_boost') { speedBoost += e.value; used = true; }
    }
    if (used) usedBuffIds.push(b.id);
  }
  return { expBoost, speedBoost, usedBuffIds };
};

export const getPotionDungeonBuffs = (buffs: ActivePotionBuff[], dungeonId?: string, teamIds: string[] = []): { damageBoost: number; defenseBoost: number; sweepBonus: number; usedBuffIds: string[] } => {
  let damageBoost = 0;
  let defenseBoost = 0;
  let sweepBonus = 0;
  const usedBuffIds: string[] = [];
  for (const b of buffs) {
    const matchesDungeon = !dungeonId || !b.dungeonId || b.dungeonId === dungeonId;
    const matchesStudent = !b.studentId || teamIds.includes(b.studentId);
    if (!matchesDungeon || !matchesStudent) continue;
    let used = false;
    for (const e of b.effects) {
      if (e.type === 'damage_boost') { damageBoost += e.value; used = true; }
      if (e.type === 'defense_boost') { defenseBoost += e.value; used = true; }
      if (e.type === 'sweep_bonus') { sweepBonus += e.value; used = true; }
    }
    if (used) usedBuffIds.push(b.id);
  }
  return { damageBoost, defenseBoost, sweepBonus, usedBuffIds };
};

export const INITIAL_ALCHEMY_STATE: AlchemyState = {
  unlocked: false,
  workshopLevel: 1,
  maxWorkshopLevel: 10,
  materials: Object.fromEntries(ALL_MATERIAL_IDS.map(id => [id, 0])) as Record<AlchemyMaterialId, number>,
  potions: Object.fromEntries(ALL_POTION_IDS.map(id => [id, 0])) as Record<PotionId, number>,
  recipes: INITIAL_POTION_RECIPES,
  synthesisRecipes: INITIAL_SYNTHESIS_RECIPES,
  activeCraftings: [],
  activeBuffs: [],
  stats: {
    totalCrafted: 0,
    totalSold: 0,
    totalUsed: 0,
    totalGoldEarned: 0,
    totalMaterialsSynthesized: 0,
    potionsCrafted: Object.fromEntries(ALL_POTION_IDS.map(id => [id, 0])) as Record<PotionId, number>,
  },
  craftingSlots: getCraftingSlotsForLevel(1),
};

export const ALCHEMY_RARITY_COLORS: Record<AlchemyMaterialRarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4CAF50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

export const ALCHEMY_RARITY_NAMES: Record<AlchemyMaterialRarity, string> = {
  common: '普通',
  uncommon: '优良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const EVENT_RARITY_COLORS: Record<AcademyEventRarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4CAF50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

export const EVENT_RARITY_NAMES: Record<AcademyEventRarity, string> = {
  common: '普通',
  uncommon: '优良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const EVENT_CATEGORY_ICONS: Record<AcademyEventCategory, string> = {
  crisis: '⚡',
  opportunity: '🌟',
  discovery: '🔍',
  intrigue: '🎭',
  natural: '🌍',
  festival: '🎉',
};

export const EVENT_CATEGORY_NAMES: Record<AcademyEventCategory, string> = {
  crisis: '危机',
  opportunity: '机遇',
  discovery: '发现',
  intrigue: '阴谋',
  natural: '自然',
  festival: '庆典',
};

export const ACADEMY_EVENTS: AcademyEventDefinition[] = [
  {
    id: 'fire_outbreak',
    name: '魔法失火',
    icon: '🔥',
    description: '学院实验室发生魔力失控，引发火灾！必须迅速决策以减少损失。',
    category: 'crisis',
    rarity: 'common',
    minDay: 1,
    minReputation: 0,
    minStudentCount: 1,
    cooldown: 10,
    weight: 10,
    choices: [
      {
        id: 'fire_fight',
        text: '组织学员灭火',
        description: '让火系和水系学员协作扑灭火灾',
        resourceChange: { mana: -10, food: -5 },
        moraleChange: -5,
        staminaChange: -10,
        riskProbability: 0.3,
        riskResourceLoss: { gold: -30, mana: -20 },
        riskMoraleLoss: -10,
        outcomeText: '学员们齐心协力扑灭了火焰，虽然消耗了些资源但大家都安全。',
        riskOutcomeText: '灭火过程中发生了魔力反噬，额外损失了大量资源，学员士气也受到影响。',
      },
      {
        id: 'fire_evacuate',
        text: '紧急疏散',
        description: '优先保障人员安全，放弃部分物资',
        resourceChange: { gold: -20, food: -10 },
        moraleChange: -10,
        outcomeText: '虽然损失了一些物资，但所有学员都安全撤离。',
      },
    ],
  },
  {
    id: 'mana_surge',
    name: '魔力潮涌',
    icon: '💫',
    description: '魔力节点突然涌出大量魔力，这是一个收集的良机，但也可能失控。',
    category: 'opportunity',
    rarity: 'uncommon',
    minDay: 5,
    minReputation: 10,
    minStudentCount: 2,
    cooldown: 15,
    weight: 8,
    choices: [
      {
        id: 'mana_collect',
        text: '引导魔力收集',
        description: '让学员引导魔力进入储存装置',
        resourceChange: { mana: 40, gold: 10 },
        moraleChange: 5,
        riskProbability: 0.25,
        riskResourceLoss: { mana: -20 },
        riskMoraleLoss: -8,
        outcomeText: '学员成功引导了魔力潮涌，获得了大量魔力资源！',
        riskOutcomeText: '魔力引导过程中发生反噬，部分魔力外泄，学员受到惊吓。',
      },
      {
        id: 'mana_stabilize',
        text: '稳定节点',
        description: '花费资源加固魔力节点，获得少量但稳定的收益',
        resourceChange: { mana: 20, gold: -5 },
        moraleChange: 3,
        outcomeText: '节点被成功稳定，获得了适度的魔力回馈。',
      },
    ],
  },
  {
    id: 'ancient_tome',
    name: '古籍残卷',
    icon: '📜',
    description: '在学院图书馆的暗室中发现了一卷古老魔法典籍残卷，蕴含未知知识。',
    category: 'discovery',
    rarity: 'rare',
    minDay: 10,
    minReputation: 30,
    minStudentCount: 3,
    cooldown: 20,
    weight: 5,
    choices: [
      {
        id: 'tome_study',
        text: '研读古籍',
        description: '安排学员研读残卷，尝试解读其中的魔法知识',
        resourceChange: { mana: -15 },
        moraleChange: 10,
        reputationBonus: 5,
        staminaChange: -5,
        riskProbability: 0.2,
        riskResourceLoss: { mana: -10 },
        riskMoraleLoss: -15,
        outcomeText: '学员成功解读了部分古籍内容，领悟了新知识，学院声望也有所提升！',
        riskOutcomeText: '古籍中蕴含的禁忌魔法侵蚀了研读者的心智，学员们精神受到了打击。',
      },
      {
        id: 'tome_archive',
        text: '封存典籍',
        description: '将残卷妥善保管，避免潜在风险',
        resourceChange: { gold: 5 },
        moraleChange: 2,
        reputationBonus: 2,
        outcomeText: '残卷被安全封存在图书馆深处，为未来留下了研究机会。',
      },
    ],
  },
  {
    id: 'rival_plot',
    name: '对手阴谋',
    icon: '🎭',
    description: '情报显示竞争学院正在暗中策划挖走你的优秀学员！',
    category: 'intrigue',
    rarity: 'uncommon',
    minDay: 7,
    minReputation: 20,
    minStudentCount: 3,
    cooldown: 12,
    weight: 7,
    choices: [
      {
        id: 'rival_counter',
        text: '反制策反',
        description: '暗中调查并瓦解对方的阴谋',
        resourceChange: { gold: -15 },
        moraleChange: 8,
        reputationBonus: 3,
        riskProbability: 0.35,
        riskResourceLoss: { reputation: -10 },
        riskMoraleLoss: -12,
        outcomeText: '成功瓦解了对手的阴谋，学员们更加团结，学院声望提升！',
        riskOutcomeText: '反制行动失败，部分学员还是被对手挖走，学院声望受损。',
      },
      {
        id: 'rival_improve',
        text: '改善待遇',
        description: '提高学员福利，让他们不愿离开',
        resourceChange: { gold: -20, food: -10 },
        moraleChange: 15,
        outcomeText: '学员们感受到学院的关怀，士气大幅提升，不再受外界诱惑。',
      },
    ],
  },
  {
    id: 'storm_warning',
    name: '魔力风暴',
    icon: '🌪️',
    description: '一场罕见的魔力风暴正在逼近学院！需要做好防护准备。',
    category: 'natural',
    rarity: 'common',
    minDay: 3,
    minReputation: 0,
    minStudentCount: 1,
    cooldown: 8,
    weight: 9,
    choices: [
      {
        id: 'storm_shield',
        text: '构筑防护结界',
        description: '消耗魔力建立防护屏障保护学院',
        resourceChange: { mana: -25 },
        moraleChange: 5,
        staminaChange: -5,
        riskProbability: 0.15,
        riskResourceLoss: { mana: -15, food: -5 },
        outcomeText: '防护结界成功抵御了风暴，学员们对自己的防护能力更加自信！',
        riskOutcomeText: '结界在风暴冲击下出现裂缝，额外消耗了魔力来修补。',
      },
      {
        id: 'storm_hunker',
        text: '坚守等待',
        description: '让学员留在室内，等待风暴过去',
        resourceChange: { food: -8 },
        moraleChange: -5,
        riskProbability: 0.4,
        riskResourceLoss: { gold: -15, food: -10 },
        riskMoraleLoss: -10,
        outcomeText: '风暴过去了，虽然有些物资受损，但总体损失不大。',
        riskOutcomeText: '风暴比预想的更猛烈，建筑和物资都遭受了严重损失。',
      },
    ],
  },
  {
    id: 'festival_invitation',
    name: '魔法庆典',
    icon: '🎉',
    description: '王国举办魔法庆典，邀请各学院参加！这是展示实力和获取资源的好机会。',
    category: 'festival',
    rarity: 'uncommon',
    minDay: 8,
    minReputation: 15,
    minStudentCount: 3,
    cooldown: 14,
    weight: 7,
    choices: [
      {
        id: 'festival_compete',
        text: '参加比赛',
        description: '派出精英学员参加魔法竞技',
        resourceChange: { gold: -10, food: -5 },
        moraleChange: 10,
        reputationBonus: 8,
        staminaChange: -15,
        riskProbability: 0.3,
        riskResourceLoss: { reputation: -5 },
        riskMoraleLoss: -8,
        outcomeText: '学员在比赛中表现出色，赢得了丰厚奖励和极高声誉！',
        riskOutcomeText: '比赛失利，虽然获得了参与奖，但士气受到了一定打击。',
      },
      {
        id: 'festival_showcase',
        text: '学术展示',
        description: '展示学院的研究成果和教学方法',
        resourceChange: { gold: 5, mana: 5 },
        moraleChange: 5,
        reputationBonus: 4,
        outcomeText: '学院的学术展示获得了广泛好评，吸引了一些关注。',
      },
    ],
  },
  {
    id: 'plague_outbreak',
    name: '魔力疫病',
    icon: '☠️',
    description: '一种神秘的魔力疫病在学员中蔓延，需要立刻采取措施！',
    category: 'crisis',
    rarity: 'rare',
    minDay: 15,
    minReputation: 25,
    minStudentCount: 4,
    cooldown: 25,
    weight: 4,
    choices: [
      {
        id: 'plague_quarantine',
        text: '隔离治疗',
        description: '立即隔离感染者，消耗资源研制解药',
        resourceChange: { gold: -25, mana: -20, food: -10 },
        moraleChange: -10,
        hpChange: -20,
        riskProbability: 0.2,
        riskResourceLoss: { gold: -15, reputation: -8 },
        riskMoraleLoss: -15,
        outcomeText: '疫病被成功控制，虽然代价不小但保住了所有学员。',
        riskOutcomeText: '疫病传播速度超出预期，更多学员被感染，学院声望也受到影响。',
      },
      {
        id: 'plague_heal',
        text: '全力救治',
        description: '投入大量资源进行紧急治疗',
        resourceChange: { gold: -35, mana: -15, food: -5 },
        moraleChange: 5,
        hpChange: -10,
        reputationBonus: 3,
        outcomeText: '全力救治奏效，所有学员恢复健康，学院的危机处理能力令人敬佩！',
      },
    ],
  },
  {
    id: 'treasure_map',
    name: '藏宝图',
    icon: '🗺️',
    description: '一位旅人带来了一张据称指向古代魔法宝库的地图碎片。',
    category: 'discovery',
    rarity: 'rare',
    minDay: 12,
    minReputation: 20,
    minStudentCount: 3,
    cooldown: 18,
    weight: 5,
    choices: [
      {
        id: 'treasure_explore',
        text: '组队探索',
        description: '派遣学员小队按地图探索',
        resourceChange: { gold: -10, food: -10 },
        moraleChange: 5,
        staminaChange: -15,
        riskProbability: 0.4,
        riskResourceLoss: { gold: -20, food: -5 },
        riskMoraleLoss: -8,
        outcomeText: '探索小队找到了宝库，获得了丰厚的宝藏！',
        riskOutcomeText: '地图是陷阱，探索小队遭遇了危险，损失了物资。',
      },
      {
        id: 'treasure_trade',
        text: '转卖地图',
        description: '将地图碎片卖给收藏家',
        resourceChange: { gold: 30 },
        moraleChange: -2,
        outcomeText: '地图卖了个好价钱，虽然有些可惜但获得了稳定的收益。',
      },
    ],
  },
  {
    id: 'merchant_caravan',
    name: '异域商队',
    icon: '🐪',
    description: '来自远方的异域商队路过学院，带来了稀有的魔法材料和珍贵的情报。',
    category: 'opportunity',
    rarity: 'common',
    minDay: 3,
    minReputation: 5,
    minStudentCount: 1,
    cooldown: 7,
    weight: 10,
    choices: [
      {
        id: 'merchant_trade',
        text: '交易物资',
        description: '用金币交换稀有材料',
        resourceChange: { gold: -20, mana: 15, food: 10 },
        moraleChange: 3,
        outcomeText: '与商队达成了有利的交易，获得了不少稀缺资源。',
      },
      {
        id: 'merchant_host',
        text: '盛情款待',
        description: '免费提供食宿，建立人脉关系',
        resourceChange: { food: -15 },
        moraleChange: 8,
        reputationBonus: 5,
        riskProbability: 0.1,
        riskResourceLoss: { food: -5 },
        outcomeText: '商队对学院的款待非常满意，承诺日后会有更多优惠！',
        riskOutcomeText: '商队多住了几天，食物消耗比预期稍多。',
      },
    ],
  },
  {
    id: 'dark_ritual',
    name: '暗影仪式',
    icon: '🌑',
    description: '学院附近出现了可疑的暗影魔法痕迹，似乎是某个禁忌仪式的残留。',
    category: 'intrigue',
    rarity: 'epic',
    minDay: 20,
    minReputation: 50,
    minStudentCount: 5,
    cooldown: 30,
    weight: 3,
    choices: [
      {
        id: 'dark_investigate',
        text: '深入调查',
        description: '派遣精英学员调查暗影魔法的来源',
        resourceChange: { mana: -20 },
        moraleChange: -5,
        staminaChange: -10,
        reputationBonus: 10,
        riskProbability: 0.35,
        riskResourceLoss: { mana: -30, reputation: -10 },
        riskMoraleLoss: -20,
        outcomeText: '调查成功！暗影势力被揭露并驱逐，学院声望大幅提升！',
        riskOutcomeText: '调查小队遭到暗影魔法侵蚀，多名学员精神受创，学院也受到质疑。',
      },
      {
        id: 'dark_report',
        text: '上报王国',
        description: '将发现报告给王国魔法部，让专业人士处理',
        resourceChange: { gold: 10 },
        moraleChange: 3,
        reputationBonus: 5,
        outcomeText: '王国派遣了专家处理，并对学院的警觉性表示赞赏。',
      },
    ],
  },
  {
    id: 'elemental_convergence',
    name: '元素交汇',
    icon: '✨',
    description: '六系元素在学院上空交汇，形成罕见的元素共振现象，是强化魔法的绝佳时机！',
    category: 'opportunity',
    rarity: 'epic',
    minDay: 18,
    minReputation: 40,
    minStudentCount: 4,
    cooldown: 25,
    weight: 3,
    choices: [
      {
        id: 'element_absorb',
        text: '吸收元素',
        description: '让学员尝试吸收交汇的元素力量',
        resourceChange: { mana: 30 },
        moraleChange: 12,
        reputationBonus: 8,
        staminaChange: -10,
        riskProbability: 0.3,
        riskResourceLoss: { mana: -20 },
        riskMoraleLoss: -15,
        outcomeText: '学员成功吸收了元素之力，魔力大增，学院声望水涨船高！',
        riskOutcomeText: '元素力量过于狂暴，部分学员受到冲击，精神和魔力都遭受了损失。',
      },
      {
        id: 'element_observe',
        text: '记录研究',
        description: '安全地观察并记录这一罕见现象',
        resourceChange: { mana: 10 },
        moraleChange: 5,
        reputationBonus: 3,
        outcomeText: '详细的研究记录成为珍贵资料，学院获得了一定的学术声望。',
      },
    ],
  },
  {
    id: 'legendary_summon',
    name: '远古召唤',
    icon: '🐲',
    description: '学院地下深处传来了远古巨龙的低语，它愿意与学院达成某种契约。',
    category: 'festival',
    rarity: 'legendary',
    minDay: 30,
    minReputation: 80,
    minStudentCount: 6,
    cooldown: 0,
    weight: 1,
    choices: [
      {
        id: 'dragon_pact',
        text: '签订契约',
        description: '与巨龙签订守护契约',
        resourceChange: { gold: -50, mana: -30, food: -20 },
        moraleChange: 20,
        reputationBonus: 20,
        staminaChange: -10,
        riskProbability: 0.25,
        riskResourceLoss: { gold: -30, mana: -20, reputation: -15 },
        riskMoraleLoss: -25,
        outcomeText: '巨龙接受了契约，成为学院的守护者！声望暴涨，所有学员士气高昂！',
        riskOutcomeText: '巨龙对学院的诚意不满，愤怒离去，带走了部分财宝，学院声望受损。',
      },
      {
        id: 'dragon_gift',
        text: '献上贡品',
        description: '献上珍贵的魔法物品以示敬意',
        resourceChange: { gold: -30, mana: -15 },
        moraleChange: 10,
        reputationBonus: 12,
        outcomeText: '巨龙对贡品很满意，赐予了祝福，学院声望大幅提升！',
      },
    ],
  },
];

export const EVENT_RARITY_WEIGHTS: Record<AcademyEventRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

export function rollEventRarity(day: number): AcademyEventRarity {
  const dayBonus = Math.min(day / 100, 0.5);
  const roll = Math.random();
  const epicThreshold = 0.02 + dayBonus * 0.03;
  const rareThreshold = epicThreshold + 0.08 + dayBonus * 0.05;
  const uncommonThreshold = rareThreshold + 0.25 + dayBonus * 0.05;
  if (roll < epicThreshold * 0.2) return 'legendary';
  if (roll < epicThreshold) return 'epic';
  if (roll < rareThreshold) return 'rare';
  if (roll < uncommonThreshold) return 'uncommon';
  return 'common';
}

export function selectRandomEvent(
  day: number,
  reputation: number,
  studentCount: number,
  cooldowns: { eventId: string; lastTriggeredDay: number }[],
  currentEventId: string | null
): AcademyEventDefinition | null {
  if (currentEventId) return null;

  const eligible = ACADEMY_EVENTS.filter(e => {
    if (day < e.minDay) return false;
    if (reputation < e.minReputation) return false;
    if (studentCount < e.minStudentCount) return false;
    const cooldown = cooldowns.find(c => c.eventId === e.id);
    if (cooldown && e.cooldown > 0 && day - cooldown.lastTriggeredDay < e.cooldown) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  const rarity = rollEventRarity(day);
  const rarityWeight = EVENT_RARITY_WEIGHTS[rarity];

  const weighted = eligible.map(e => ({
    event: e,
    weight: e.weight * (EVENT_RARITY_WEIGHTS[e.rarity] / rarityWeight > 0.5 ? 1.5 : 1),
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.event;
  }

  return weighted[weighted.length - 1].event;
}

export function resolveEventChoice(
  event: AcademyEventDefinition,
  choiceId: string,
  students: { id: string; magicType: MagicType }[]
): {
  resourceChange: Partial<Resource>;
  moraleChange: number;
  staminaChange: number;
  hpChange: number;
  wasRiskTriggered: boolean;
  affectedStudentIds: string[];
  outcomeText: string;
} {
  const choice = event.choices.find(c => c.id === choiceId);
  if (!choice) {
    return {
      resourceChange: {},
      moraleChange: 0,
      staminaChange: 0,
      hpChange: 0,
      wasRiskTriggered: false,
      affectedStudentIds: [],
      outcomeText: '无效选择',
    };
  }

  const wasRiskTriggered = choice.riskProbability != null && Math.random() < choice.riskProbability;

  if (wasRiskTriggered) {
    const riskResource = choice.riskResourceLoss || {};
    const riskMorale = choice.riskMoraleLoss || 0;
    const riskStamina = choice.riskStaminaLoss || 0;

    let affectedStudentIds: string[] = [];
    if (choice.studentTargetCount && choice.studentTargetCount > 0) {
      const targetStudents = choice.targetMagicType
        ? students.filter(s => s.magicType === choice.targetMagicType)
        : students;
      const shuffled = [...targetStudents].sort(() => Math.random() - 0.5);
      affectedStudentIds = shuffled.slice(0, choice.studentTargetCount).map(s => s.id);
    }

    return {
      resourceChange: {
        gold: (choice.resourceChange.gold || 0) + (riskResource.gold || 0),
        mana: (choice.resourceChange.mana || 0) + (riskResource.mana || 0),
        food: (choice.resourceChange.food || 0) + (riskResource.food || 0),
        reputation: (choice.resourceChange.reputation || 0) + (riskResource.reputation || 0),
      },
      moraleChange: (choice.moraleChange || 0) + riskMorale,
      staminaChange: (choice.staminaChange || 0) + riskStamina,
      hpChange: choice.hpChange || 0,
      wasRiskTriggered: true,
      affectedStudentIds,
      outcomeText: choice.riskOutcomeText || choice.outcomeText,
    };
  }

  let affectedStudentIds: string[] = [];
  if (choice.studentTargetCount && choice.studentTargetCount > 0) {
    const targetStudents = choice.targetMagicType
      ? students.filter(s => s.magicType === choice.targetMagicType)
      : students;
    const shuffled = [...targetStudents].sort(() => Math.random() - 0.5);
    affectedStudentIds = shuffled.slice(0, choice.studentTargetCount).map(s => s.id);
  }

  return {
    resourceChange: { ...choice.resourceChange },
    moraleChange: choice.moraleChange || 0,
    staminaChange: choice.staminaChange || 0,
    hpChange: choice.hpChange || 0,
    wasRiskTriggered: false,
    affectedStudentIds,
    outcomeText: choice.outcomeText,
  };
}

export const INITIAL_EVENT_CENTER_STATE: EventCenterState = {
  unlocked: false,
  currentEvent: null,
  eventHistory: [],
  cooldowns: [],
  stats: {
    totalEvents: 0,
    eventsByCategory: {
      crisis: 0,
      opportunity: 0,
      discovery: 0,
      intrigue: 0,
      natural: 0,
      festival: 0,
    },
    eventsByRarity: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
    totalResourceGained: { gold: 0, mana: 0, food: 0, reputation: 0 },
    totalResourceLost: { gold: 0, mana: 0, food: 0, reputation: 0 },
    risksTriggered: 0,
    risksAvoided: 0,
    bestReward: {},
    worstLoss: {},
    streakResolved: 0,
    maxStreak: 0,
  },
  pendingReward: null,
  lastEventDay: 0,
  eventChance: 0.35,
  minDaysBetweenEvents: 3,
};

export const COMMISSION_RANK_INFO: CommissionRankInfo[] = [
  {
    rank: 1,
    name: '新手学徒',
    minPoints: 0,
    maxPoints: 99,
    description: '刚接触王国委托的新人',
    bonuses: { commissionRewardBonus: 0, extraCommissionSlots: 0, reputationBonus: 0 },
  },
  {
    rank: 2,
    name: '正式冒险者',
    minPoints: 100,
    maxPoints: 299,
    description: '积累了一定经验的冒险者',
    bonuses: { commissionRewardBonus: 0.05, extraCommissionSlots: 1, reputationBonus: 5 },
  },
  {
    rank: 3,
    name: '精英调查员',
    minPoints: 300,
    maxPoints: 599,
    description: '王国认可的精英人才',
    bonuses: { commissionRewardBonus: 0.1, extraCommissionSlots: 2, reputationBonus: 10 },
  },
  {
    rank: 4,
    name: '皇家顾问',
    minPoints: 600,
    maxPoints: 999,
    description: '皇室信赖的高级顾问',
    bonuses: { commissionRewardBonus: 0.15, extraCommissionSlots: 3, reputationBonus: 20 },
  },
  {
    rank: 5,
    name: '传奇大师',
    minPoints: 1000,
    maxPoints: 9999,
    description: '载入史册的传奇人物',
    bonuses: { commissionRewardBonus: 0.25, extraCommissionSlots: 5, reputationBonus: 35 },
  },
];

export const getCommissionRank = (points: number): CommissionRankInfo => {
  for (let i = COMMISSION_RANK_INFO.length - 1; i >= 0; i--) {
    if (points >= COMMISSION_RANK_INFO[i].minPoints) {
      return COMMISSION_RANK_INFO[i];
    }
  }
  return COMMISSION_RANK_INFO[0];
};

export const getNextCommissionRank = (points: number): CommissionRankInfo | null => {
  const currentRank = getCommissionRank(points);
  const nextIndex = COMMISSION_RANK_INFO.findIndex(r => r.rank === currentRank.rank) + 1;
  return nextIndex < COMMISSION_RANK_INFO.length ? COMMISSION_RANK_INFO[nextIndex] : null;
};

export const COMMISSION_DIFFICULTY_MULTIPLIERS: Record<CommissionDifficulty, { reward: number; points: number; reputation: number }> = {
  easy: { reward: 1, points: 10, reputation: 1 },
  normal: { reward: 1.5, points: 25, reputation: 1.5 },
  hard: { reward: 2.5, points: 50, reputation: 2 },
  epic: { reward: 4, points: 100, reputation: 3 },
  legendary: { reward: 7, points: 200, reputation: 5 },
};

export const COMMISSION_DIFFICULTY_NAMES: Record<CommissionDifficulty, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
  epic: '史诗',
  legendary: '传说',
};

export const COMMISSION_DIFFICULTY_COLORS: Record<CommissionDifficulty, string> = {
  easy: '#4CAF50',
  normal: '#2196F3',
  hard: '#FF9800',
  epic: '#9C27B0',
  legendary: '#FFD700',
};

export const COMMISSION_TYPE_NAMES: Record<CommissionType, string> = {
  course_training: '课程培养',
  dungeon_dispatch: '队伍派遣',
  resource_delivery: '资源交付',
  comprehensive: '综合委托',
};

export const COMMISSION_TYPE_ICONS: Record<CommissionType, string> = {
  course_training: '📚',
  dungeon_dispatch: '⚔️',
  resource_delivery: '📦',
  comprehensive: '🎯',
};

const generateCommissionId = (): string => {
  return `commission_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const generateCommissionStageId = (commissionId: string, stageNum: number): string => {
  return `${commissionId}_stage_${stageNum}`;
};

const COMMISSION_NAME_POOLS = {
  course_training: [
    '魔法学徒培养计划',
    '精英法师特训',
    '王国魔法人才输送',
    '高级法术研修班',
    '皇家法师储备计划',
  ],
  dungeon_dispatch: [
    '边境清剿任务',
    '遗迹探索委托',
    '魔物讨伐令',
    '深渊调查',
    '远古秘境探险',
  ],
  resource_delivery: [
    '魔力水晶采购',
    '魔法药材征集',
    '稀有材料收购',
    '战略物资储备',
    '皇家宝库补充',
  ],
  comprehensive: [
    '学院综合评估',
    '王国年度考核',
    '魔法大赛筹备',
    '边境支援任务',
    '贤者试炼',
  ],
};

const getRandomCommissionName = (type: CommissionType): string => {
  const pool = COMMISSION_NAME_POOLS[type];
  return pool[Math.floor(Math.random() * pool.length)];
};

const generateCourseStage = (
  stageNum: number,
  difficulty: CommissionDifficulty,
  academyLevel: number
): CommissionStage => {
  const diffMult = COMMISSION_DIFFICULTY_MULTIPLIERS[difficulty];
  const baseCount = Math.ceil((1 + stageNum) * diffMult.reward * 0.8);
  const courseCount = Math.max(1, Math.min(baseCount + academyLevel, 10));
  
  return {
    id: '',
    stageNumber: stageNum,
    name: `第${stageNum}阶段：课程学习`,
    description: `完成${courseCount}门课程学习`,
    type: 'course',
    target: courseCount,
    current: 0,
    reward: {
      gold: Math.floor(100 * diffMult.reward * (1 + stageNum * 0.3)),
      mana: Math.floor(50 * diffMult.reward * (1 + stageNum * 0.3)),
      reputation: Math.floor(5 * diffMult.reputation * (1 + stageNum * 0.2)),
    },
    completed: false,
    claimed: false,
    unlocked: stageNum === 1,
    courseCount,
  };
};

const generateDungeonStage = (
  stageNum: number,
  difficulty: CommissionDifficulty,
  academyLevel: number
): CommissionStage => {
  const diffMult = COMMISSION_DIFFICULTY_MULTIPLIERS[difficulty];
  const baseCount = Math.ceil((1 + stageNum * 0.5) * diffMult.reward * 0.6);
  const dungeonCount = Math.max(1, Math.min(baseCount + Math.floor(academyLevel / 2), 5));
  
  return {
    id: '',
    stageNumber: stageNum,
    name: `第${stageNum}阶段：副本挑战`,
    description: `完成${dungeonCount}次副本挑战`,
    type: 'dungeon',
    target: dungeonCount,
    current: 0,
    reward: {
      gold: Math.floor(150 * diffMult.reward * (1 + stageNum * 0.4)),
      mana: Math.floor(80 * diffMult.reward * (1 + stageNum * 0.4)),
      reputation: Math.floor(8 * diffMult.reputation * (1 + stageNum * 0.3)),
    },
    completed: false,
    claimed: false,
    unlocked: stageNum === 1,
    dungeonCount,
  };
};

const generateResourceStage = (
  stageNum: number,
  difficulty: CommissionDifficulty,
  academyLevel: number
): CommissionStage => {
  const diffMult = COMMISSION_DIFFICULTY_MULTIPLIERS[difficulty];
  const resourceTypes: (keyof Resource)[] = ['gold', 'mana', 'food'];
  const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
  const baseAmount = Math.ceil(100 * diffMult.reward * (1 + stageNum * 0.5) * (1 + academyLevel * 0.1));
  const resourceAmount = Math.floor(baseAmount);
  
  const resourceNames: Record<keyof Resource, string> = {
    gold: '金币',
    mana: '魔力',
    food: '食物',
    reputation: '声望',
  };
  
  return {
    id: '',
    stageNumber: stageNum,
    name: `第${stageNum}阶段：资源缴纳`,
    description: `缴纳${resourceAmount}${resourceNames[resourceType]}`,
    type: 'resource',
    target: resourceAmount,
    current: 0,
    reward: {
      gold: resourceType === 'gold' ? Math.floor(resourceAmount * 0.5) : Math.floor(80 * diffMult.reward),
      mana: resourceType === 'mana' ? Math.floor(resourceAmount * 0.5) : Math.floor(40 * diffMult.reward),
      food: resourceType === 'food' ? Math.floor(resourceAmount * 0.5) : Math.floor(20 * diffMult.reward),
      reputation: Math.floor(10 * diffMult.reputation * (1 + stageNum * 0.2)),
    },
    completed: false,
    claimed: false,
    unlocked: stageNum === 1,
    resourceType,
    resourceAmount,
  };
};

const generateReputationStage = (
  stageNum: number,
  difficulty: CommissionDifficulty,
  academyLevel: number
): CommissionStage => {
  const diffMult = COMMISSION_DIFFICULTY_MULTIPLIERS[difficulty];
  const target = Math.ceil(50 * diffMult.reputation * (1 + stageNum * 0.4) * (1 + academyLevel * 0.05));
  
  return {
    id: '',
    stageNumber: stageNum,
    name: `第${stageNum}阶段：声望积累`,
    description: `累计获得${target}点声望`,
    type: 'reputation',
    target,
    current: 0,
    reward: {
      gold: Math.floor(200 * diffMult.reward * (1 + stageNum * 0.3)),
      mana: Math.floor(100 * diffMult.reward * (1 + stageNum * 0.3)),
      food: Math.floor(30 * diffMult.reward * (1 + stageNum * 0.3)),
      reputation: Math.floor(15 * diffMult.reputation),
    },
    completed: false,
    claimed: false,
    unlocked: stageNum === 1,
    reputationTarget: target,
  };
};

const generateStages = (
  type: CommissionType,
  difficulty: CommissionDifficulty,
  academyLevel: number,
  stageCount: number
): CommissionStage[] => {
  const stages: CommissionStage[] = [];
  const stageGenerators: ((stageNum: number, difficulty: CommissionDifficulty, academyLevel: number) => CommissionStage)[] = [];
  
  switch (type) {
    case 'course_training':
      for (let i = 0; i < stageCount; i++) {
        stageGenerators.push(generateCourseStage);
      }
      break;
    case 'dungeon_dispatch':
      for (let i = 0; i < stageCount; i++) {
        stageGenerators.push(generateDungeonStage);
      }
      break;
    case 'resource_delivery':
      for (let i = 0; i < stageCount; i++) {
        stageGenerators.push(generateResourceStage);
      }
      break;
    case 'comprehensive': {
      const allGenerators = [generateCourseStage, generateDungeonStage, generateResourceStage, generateReputationStage];
      for (let i = 0; i < stageCount; i++) {
        stageGenerators.push(allGenerators[i % allGenerators.length]);
      }
      break;
    }
  }
  
  for (let i = 0; i < stageCount; i++) {
    const generator = stageGenerators[i % stageGenerators.length];
    stages.push(generator(i + 1, difficulty, academyLevel));
  }
  
  return stages;
};

export const generateCommission = (
  type: CommissionType,
  difficulty: CommissionDifficulty,
  academyLevel: number,
  reputation: number
): KingdomCommission | null => {
  const diffMult = COMMISSION_DIFFICULTY_MULTIPLIERS[difficulty];
  const minReputation = Math.floor(20 * diffMult.reputation);
  
  if (reputation < minReputation) {
    return null;
  }
  
  const stageCount = difficulty === 'easy' ? 2 : difficulty === 'normal' ? 3 : difficulty === 'hard' ? 4 : difficulty === 'epic' ? 5 : 6;
  const id = generateCommissionId();
  const stages = generateStages(type, difficulty, academyLevel, stageCount).map((stage, index) => ({
    ...stage,
    id: generateCommissionStageId(id, index + 1),
  }));
  
  const overallReward: Partial<Resource> = {
    gold: Math.floor(300 * diffMult.reward * (1 + academyLevel * 0.1)),
    mana: Math.floor(150 * diffMult.reward * (1 + academyLevel * 0.1)),
    food: Math.floor(50 * diffMult.reward * (1 + academyLevel * 0.1)),
  };
  
  const reputationReward = Math.floor(30 * diffMult.reputation * (1 + academyLevel * 0.05));
  const maxStudents = difficulty === 'easy' ? 2 : difficulty === 'normal' ? 3 : difficulty === 'hard' ? 4 : difficulty === 'epic' ? 5 : 6;
  
  return {
    id,
    name: getRandomCommissionName(type),
    description: `王国发布的${COMMISSION_DIFFICULTY_NAMES[difficulty]}难度${COMMISSION_TYPE_NAMES[type]}委托，完成所有阶段可获得丰厚奖励。`,
    type,
    difficulty,
    requiredAcademyLevel: academyLevel,
    requiredReputation: minReputation,
    stages,
    currentStage: 1,
    totalStages: stageCount,
    status: 'available',
    overallReward,
    reputationReward,
    acceptedAt: null,
    completedAt: null,
    expiresInDays: Math.floor(7 + stageCount * 3),
    daysRemaining: Math.floor(7 + stageCount * 3),
    assignedStudents: [],
    maxStudents,
    commissionRank: getCommissionRank(reputation).rank,
  };
};

export const generateAvailableCommissions = (
  academyLevel: number,
  reputation: number,
  count: number = 5
): KingdomCommission[] => {
  const commissions: KingdomCommission[] = [];
  const types: CommissionType[] = ['course_training', 'dungeon_dispatch', 'resource_delivery', 'comprehensive'];
  const difficulties: CommissionDifficulty[] = ['easy', 'normal', 'hard', 'epic', 'legendary'];
  
  const maxDifficultyIndex = Math.min(
    Math.floor(academyLevel / 3),
    difficulties.length - 1
  );
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const diffIndex = Math.min(
      Math.floor(Math.random() * (maxDifficultyIndex + 2)),
      maxDifficultyIndex
    );
    const difficulty = difficulties[Math.max(0, diffIndex)];
    
    const commission = generateCommission(type, difficulty, academyLevel, reputation);
    if (commission) {
      commissions.push(commission);
    }
  }
  
  return commissions;
};

export const calculateCommissionPoints = (
  difficulty: CommissionDifficulty,
  stagesCompleted: number,
  totalStages: number
): number => {
  const basePoints = COMMISSION_DIFFICULTY_MULTIPLIERS[difficulty].points;
  const completionRatio = stagesCompleted / totalStages;
  return Math.floor(basePoints * completionRatio * (0.5 + completionRatio * 0.5));
};

export const canAcceptCommission = (
  commission: KingdomCommission,
  reputation: number,
  activeCount: number,
  maxActive: number
): boolean => {
  return (
    reputation >= commission.requiredReputation &&
    activeCount < maxActive &&
    commission.status === 'available'
  );
};

export const updateCommissionStageProgress = (
  commissions: KingdomCommission[],
  stageType: CommissionStageType,
  amount: number = 1,
  resourceType?: keyof Resource
): { updated: KingdomCommission[]; completedStages: string[]; completedCommissions: string[] } => {
  const completedStages: string[] = [];
  const completedCommissions: string[] = [];
  
  const updated = commissions.map(commission => {
    if (commission.status !== 'in_progress' && commission.status !== 'accepted') {
      return commission;
    }
    
    const updatedStages = commission.stages.map(stage => {
      if (!stage.unlocked || stage.completed) {
        return stage;
      }
      
      if (stage.type !== stageType) {
        return stage;
      }
      
      if (stageType === 'resource' && resourceType && stage.resourceType !== resourceType) {
        return stage;
      }
      
      const newCurrent = Math.min(stage.current + amount, stage.target);
      const wasCompleted = stage.completed;
      const isCompleted = newCurrent >= stage.target;
      
      if (isCompleted && !wasCompleted) {
        completedStages.push(stage.id);
      }
      
      return {
        ...stage,
        current: newCurrent,
        completed: isCompleted,
      };
    });
    
    const allCompleted = updatedStages.every(s => s.completed);
    const newStatus = allCompleted ? 'stage_complete' as const : 'in_progress' as const;
    
    if (allCompleted) {
      completedCommissions.push(commission.id);
    }
    
    const currentStageIndex = updatedStages.findIndex(s => !s.completed);
    const newCurrentStage = currentStageIndex === -1 ? commission.totalStages : currentStageIndex + 1;
    
    const finalStages = updatedStages.map((stage, index) => {
      if (stage.unlocked) return stage;
      
      const prevStage = updatedStages[index - 1];
      if (prevStage && prevStage.completed) {
        return { ...stage, unlocked: true };
      }
      return stage;
    });
    
    return {
      ...commission,
      stages: finalStages,
      currentStage: newCurrentStage,
      status: newStatus,
    };
  });
  
  return { updated, completedStages, completedCommissions };
};

export const deliverCommissionResource = (
  commission: KingdomCommission,
  stageId: string,
  resources: Resource
): { updatedCommission: KingdomCommission; delivered: boolean; cost: Partial<Resource> } => {
  const stage = commission.stages.find(s => s.id === stageId);
  
  if (!stage || stage.type !== 'resource' || !stage.resourceType || stage.completed) {
    return { updatedCommission: commission, delivered: false, cost: {} };
  }
  
  const remaining = stage.target - stage.current;
  const available = resources[stage.resourceType];
  const deliverAmount = Math.min(remaining, available);
  
  if (deliverAmount <= 0) {
    return { updatedCommission: commission, delivered: false, cost: {} };
  }
  
  const updatedStages = commission.stages.map(s => {
    if (s.id !== stageId) return s;
    const newCurrent = Math.min(s.current + deliverAmount, s.target);
    return {
      ...s,
      current: newCurrent,
      completed: newCurrent >= s.target,
    };
  });
  
  const allCompleted = updatedStages.every(s => s.completed);
  
  const cost: Partial<Resource> = {
    [stage.resourceType]: deliverAmount,
  };
  
  return {
    updatedCommission: {
      ...commission,
      stages: updatedStages,
      status: allCompleted ? 'stage_complete' : commission.status,
      currentStage: allCompleted ? commission.totalStages : commission.currentStage,
    },
    delivered: true,
    cost,
  };
};

export const claimStageReward = (
  commission: KingdomCommission,
  stageId: string
): { updatedCommission: KingdomCommission; reward: Partial<Resource> } => {
  const stage = commission.stages.find(s => s.id === stageId);
  
  if (!stage || !stage.completed || stage.claimed) {
    return { updatedCommission: commission, reward: {} };
  }
  
  const updatedStages = commission.stages.map(s => {
    if (s.id !== stageId) return s;
    return { ...s, claimed: true };
  });
  
  return {
    updatedCommission: {
      ...commission,
      stages: updatedStages,
    },
    reward: stage.reward,
  };
};

export const claimCommissionReward = (
  commission: KingdomCommission
): { updatedCommission: KingdomCommission; reward: Partial<Resource>; reputation: number; points: number } => {
  if (commission.status !== 'stage_complete') {
    return { updatedCommission: commission, reward: {}, reputation: 0, points: 0 };
  }
  
  const points = calculateCommissionPoints(commission.difficulty, commission.totalStages, commission.totalStages);
  
  return {
    updatedCommission: {
      ...commission,
      status: 'completed',
      completedAt: Date.now(),
    },
    reward: commission.overallReward,
    reputation: commission.reputationReward,
    points,
  };
};

export const getMaxActiveCommissions = (rank: CommissionRankInfo, baseMax: number = 3): number => {
  return baseMax + rank.bonuses.extraCommissionSlots;
};

export const applyCommissionRewardBonus = (
  reward: Partial<Resource>,
  rank: CommissionRankInfo
): Partial<Resource> => {
  const bonus = rank.bonuses.commissionRewardBonus;
  const result: Partial<Resource> = {};
  
  (Object.keys(reward) as (keyof Resource)[]).forEach(key => {
    const value = reward[key];
    if (value !== undefined) {
      result[key] = Math.floor(value * (1 + bonus));
    }
  });
  
  return result;
};

export const INITIAL_KINGDOM_COMMISSION_STATE: KingdomCommissionState = {
  unlocked: false,
  availableCommissions: [],
  activeCommissions: [],
  completedCommissions: [],
  failedCommissions: [],
  totalCommissionsCompleted: 0,
  totalReputationEarned: 0,
  currentRank: 1,
  bestRank: 1,
  rankPoints: 0,
  weeklyCommissionCount: 0,
  maxWeeklyCommissions: 10,
  lastRefreshDay: 0,
  refreshCost: { gold: 100, reputation: 10 },
  commissionHistory: [],
  maxHistorySize: 50,
};

export const RELATIONSHIP_LEVELS: { level: RelationshipLevel; name: string; minExp: number; color: string }[] = [
  { level: 'stranger', name: '陌生', minExp: 0, color: '#9E9E9E' },
  { level: 'acquaintance', name: '认识', minExp: 20, color: '#78909C' },
  { level: 'friend', name: '朋友', minExp: 60, color: '#42A5F5' },
  { level: 'close_friend', name: '挚友', minExp: 150, color: '#AB47BC' },
  { level: 'bonded', name: '羁绊', minExp: 300, color: '#FFD700' },
];

export const REST_ACTIVITIES: { id: RestActivity; name: string; icon: string; description: string; staminaEffect: number; moraleEffect: number; hpEffect: number; specialEffect?: string }[] = [
  { id: 'sleep', name: '深度睡眠', icon: '😴', description: '充足休息，大幅恢复体力与生命', staminaEffect: 35, moraleEffect: 5, hpEffect: 25, specialEffect: 'stamina_regen' },
  { id: 'socialize', name: '社交活动', icon: '💬', description: '与室友互动，增进关系与心情', staminaEffect: 10, moraleEffect: 15, hpEffect: 5, specialEffect: 'relationship_boost' },
  { id: 'train_light', name: '轻度训练', icon: '🏃', description: '保持运动习惯，小幅提升全属性', staminaEffect: -5, moraleEffect: 5, hpEffect: 10, specialEffect: 'battle_bonus' },
  { id: 'meditate', name: '冥想修炼', icon: '🧘', description: '精神修养，大幅恢复心情与魔力感知', staminaEffect: 15, moraleEffect: 20, hpEffect: 15, specialEffect: 'course_bonus' },
  { id: 'study_leisure', name: '休闲阅读', icon: '📖', description: '轻松学习，小幅获得经验', staminaEffect: 5, moraleEffect: 10, hpEffect: 5, specialEffect: 'exp_bonus' },
];

export const DORMITORY_EVENTS: DormitoryEventDef[] = [
  {
    id: 'dorm_bonfire_night',
    name: '篝火晚会',
    description: '宿舍区举办了一场温馨的篝火晚会，学员们围坐分享故事。',
    icon: '🔥',
    category: 'celebration',
    effects: { moraleChange: 15, relationshipExpChange: 25 },
    probability: 0.08,
    minRelationship: 'acquaintance',
    requiresRoommates: true,
  },
  {
    id: 'dorm_roommate_conflict',
    name: '室友争执',
    description: '两位室友因生活琐事发生了争吵，气氛紧张。',
    icon: '⚡',
    category: 'conflict',
    effects: { moraleChange: -10, relationshipExpChange: -15 },
    probability: 0.06,
    choices: [
      {
        id: 'mediate',
        text: '调解劝和',
        description: '出面调解，帮助双方化解矛盾',
        effects: { moraleChange: 5, relationshipExpChange: 10 },
        riskProbability: 0.3,
        riskEffects: { moraleChange: -5, relationshipExpChange: -5 },
      },
      {
        id: 'ignore',
        text: '不介入',
        description: '让他们自行解决',
        effects: { moraleChange: -3, relationshipExpChange: -5 },
      },
    ],
  },
  {
    id: 'dorm_magic_practice',
    name: '宿舍魔法练习',
    description: '几位学员在宿舍里互相切磋魔法，热闹非凡。',
    icon: '✨',
    category: 'growth',
    effects: { moraleChange: 5, staminaChange: -5, relationshipExpChange: 15 },
    probability: 0.1,
    requiresRoommates: true,
  },
  {
    id: 'dorm_midnight_snack',
    name: '深夜食堂',
    description: '有人悄悄在公共厨房做夜宵，香气弥漫整个宿舍。',
    icon: '🍜',
    category: 'social',
    effects: { moraleChange: 10, staminaChange: 5 },
    probability: 0.1,
  },
  {
    id: 'dorm_nightmare',
    name: '噩梦侵袭',
    description: '一位学员被噩梦惊醒，整晚无法入眠。',
    icon: '🌙',
    category: 'accident',
    effects: { moraleChange: -8, staminaChange: -10 },
    probability: 0.05,
  },
  {
    id: 'dorm_birthday_party',
    name: '生日派对',
    description: '今天是一位室友的生日，大家偷偷准备了惊喜！',
    icon: '🎂',
    category: 'celebration',
    effects: { moraleChange: 20, relationshipExpChange: 30, reputationChange: 3 },
    probability: 0.04,
    requiresRoommates: true,
  },
  {
    id: 'dorm_stargazing',
    name: '观星之夜',
    description: '晴朗的夜晚，学员们一起在宿舍楼顶观星冥想。',
    icon: '⭐',
    category: 'social',
    effects: { moraleChange: 12, staminaChange: 5, relationshipExpChange: 10 },
    probability: 0.07,
  },
  {
    id: 'dorm_water_leak',
    name: '水管爆裂',
    description: '宿舍的水管突然爆裂，一片混乱！',
    icon: '💦',
    category: 'accident',
    effects: { moraleChange: -12, staminaChange: -8 },
    probability: 0.04,
    choices: [
      {
        id: 'help_fix',
        text: '帮忙抢修',
        description: '齐心协力修理水管，可能获得好感',
        effects: { moraleChange: 3, relationshipExpChange: 15, staminaChange: -5 },
        riskProbability: 0.2,
        riskEffects: { moraleChange: -5, staminaChange: -10 },
      },
      {
        id: 'evacuate',
        text: '撤离转移',
        description: '先离开危险区域，等待专业人员处理',
        effects: { moraleChange: -5, staminaChange: -3 },
      },
    ],
  },
  {
    id: 'dorm_study_group',
    name: '学习小组',
    description: '几位学员自发组成了学习小组，互相辅导功课。',
    icon: '📚',
    category: 'growth',
    effects: { moraleChange: 5, relationshipExpChange: 20 },
    probability: 0.09,
    requiresRoommates: true,
  },
  {
    id: 'dorm_hidden_treasure',
    name: '意外发现',
    description: '打扫宿舍时，在角落发现了一本尘封的魔法笔记！',
    icon: '📜',
    category: 'growth',
    effects: { moraleChange: 10, reputationChange: 2 },
    probability: 0.03,
  },
];

export const getRelationshipLevel = (exp: number): RelationshipLevel => {
  for (let i = RELATIONSHIP_LEVELS.length - 1; i >= 0; i--) {
    if (exp >= RELATIONSHIP_LEVELS[i].minExp) {
      return RELATIONSHIP_LEVELS[i].level;
    }
  }
  return 'stranger';
};

export const getRelationshipInfo = (exp: number): { level: RelationshipLevel; name: string; color: string; expToNext: number } => {
  const level = getRelationshipLevel(exp);
  const levelInfo = RELATIONSHIP_LEVELS.find(l => l.level === level)!;
  const nextLevelIndex = RELATIONSHIP_LEVELS.findIndex(l => l.level === level) + 1;
  const nextLevel = nextLevelIndex < RELATIONSHIP_LEVELS.length ? RELATIONSHIP_LEVELS[nextLevelIndex] : null;
  return {
    level,
    name: levelInfo.name,
    color: levelInfo.color,
    expToNext: nextLevel ? nextLevel.minExp - exp : 0,
  };
};

export const calculateDormitoryComfort = (dormitoryLevel: number, diningHallLevel: number): number => {
  return 50 + dormitoryLevel * 5 + Math.floor(diningHallLevel * 2);
};

export const calculateRoomCapacity = (dormitoryLevel: number): number => {
  if (dormitoryLevel >= 8) return 3;
  if (dormitoryLevel >= 5) return 2;
  return 2;
};

export const calculateDormitoryBonus = (
  dormitoryState: DormitoryState,
  dormitoryLevel: number,
  diningHallLevel: number
): DormitoryState['dailyBonus'] => {
  const comfort = calculateDormitoryComfort(dormitoryLevel, diningHallLevel);
  const comfortBonus = (comfort - 50) / 100;
  
  const friendCount = dormitoryState.relationships.filter(r => 
    r.level === 'friend' || r.level === 'close_friend' || r.level === 'bonded'
  ).length;
  const relationshipBonus = Math.min(friendCount * 0.5, 15);
  
  const avgMorale = dormitoryState.avgMorale;
  const moraleBonus = avgMorale >= 80 ? 5 : avgMorale >= 60 ? 2 : 0;
  
  const courseEfficiency = comfortBonus * 5 + moraleBonus * 0.5;
  const battleBonus = relationshipBonus * 0.3;
  const reputationBonus = moraleBonus * 0.2 + (dormitoryState.totalSocialInteractions > 20 ? 2 : 0);
  const staminaRegenBonus = comfortBonus * 3 + dormitoryLevel * 0.5;
  const moraleRegenBonus = comfortBonus * 2 + diningHallLevel * 0.3;
  
  return {
    courseEfficiency: Math.round(courseEfficiency * 10) / 10,
    battleBonus: Math.round(battleBonus * 10) / 10,
    reputationBonus: Math.round(reputationBonus * 10) / 10,
    staminaRegenBonus: Math.round(staminaRegenBonus * 10) / 10,
    moraleRegenBonus: Math.round(moraleRegenBonus * 10) / 10,
  };
};

export const calculateRelationshipExpGain = (
  activity: RestActivity,
  areRoommates: boolean,
  roomComfort: number
): number => {
  let base = 0;
  switch (activity) {
    case 'socialize': base = 8; break;
    case 'study_leisure': base = 3; break;
    case 'train_light': base = 2; break;
    case 'meditate': base = 1; break;
    default: base = 0;
  }
  if (areRoommates) base *= 1.5;
  base *= (1 + roomComfort / 200);
  return Math.floor(base);
};

export const calculateRestActivityResult = (
  activity: RestActivity,
  dormitoryLevel: number,
  diningHallLevel: number,
  roomComfort: number
): { staminaChange: number; moraleChange: number; hpChange: number } => {
  const activityDef = REST_ACTIVITIES.find(a => a.id === activity);
  if (!activityDef) return { staminaChange: 0, moraleChange: 0, hpChange: 0 };
  
  const comfortMult = 1 + roomComfort / 200;
  const dormMult = 1 + dormitoryLevel * 0.03;
  const diningMult = 1 + diningHallLevel * 0.02;
  
  return {
    staminaChange: Math.floor(activityDef.staminaEffect * comfortMult * dormMult),
    moraleChange: Math.floor(activityDef.moraleEffect * comfortMult * diningMult),
    hpChange: Math.floor(activityDef.hpEffect * comfortMult * dormMult),
  };
};

export const getBattleRelationshipBonus = (relationships: StudentRelationship[], teamIds: string[]): { damageBonus: number; hpBonus: number; description: string } => {
  const teamRels = relationships.filter(r => 
    teamIds.includes(r.studentId1) && teamIds.includes(r.studentId2)
  );
  
  let totalBonus = 0;
  const descriptions: string[] = [];
  
  for (const rel of teamRels) {
    const info = RELATIONSHIP_LEVELS.find(l => l.level === rel.level);
    switch (rel.level) {
      case 'bonded':
        totalBonus += 0.12;
        descriptions.push('羁绊加成+12%');
        break;
      case 'close_friend':
        totalBonus += 0.08;
        descriptions.push('挚友加成+8%');
        break;
      case 'friend':
        totalBonus += 0.05;
        descriptions.push('友情加成+5%');
        break;
      case 'acquaintance':
        totalBonus += 0.02;
        break;
      default:
        break;
    }
  }
  
  const maxBonus = 0.25;
  const cappedBonus = Math.min(totalBonus, maxBonus);
  
  return {
    damageBonus: cappedBonus,
    hpBonus: Math.floor(cappedBonus * 50),
    description: descriptions.length > 0 ? descriptions.slice(0, 3).join(', ') : '',
  };
};

export const generateDormitoryRooms = (studentIds: string[], dormitoryLevel: number): DormitoryRoom[] => {
  const capacity = calculateRoomCapacity(dormitoryLevel);
  const rooms: DormitoryRoom[] = [];
  const comfort = calculateDormitoryComfort(dormitoryLevel, 0);
  
  let roomIndex = 0;
  for (let i = 0; i < studentIds.length; i += capacity) {
    const roomResidentIds = studentIds.slice(i, i + capacity);
    rooms.push({
      id: `room_${roomIndex + 1}`,
      residentIds: roomResidentIds,
      capacity,
      comfort,
      roomLevel: dormitoryLevel,
    });
    roomIndex++;
  }
  
  return rooms;
};

export const initializeRelationships = (studentIds: string[]): StudentRelationship[] => {
  const relationships: StudentRelationship[] = [];
  for (let i = 0; i < studentIds.length; i++) {
    for (let j = i + 1; j < studentIds.length; j++) {
      relationships.push({
        studentId1: studentIds[i],
        studentId2: studentIds[j],
        level: 'stranger',
        exp: 0,
        expToNext: RELATIONSHIP_LEVELS[1].minExp,
        dailyInteracted: false,
      });
    }
  }
  return relationships;
};

export const triggerRandomDormitoryEvent = (
  relationships: StudentRelationship[],
  studentIds: string[],
  day: number,
  lastEventDay: number
): DormitoryEventInstance | null => {
  if (day - lastEventDay < 2) return null;
  if (studentIds.length < 2) return null;
  
  const eligibleEvents = DORMITORY_EVENTS.filter(e => {
    if (e.requiresRoommates && studentIds.length < 2) return false;
    if (e.minRelationship) {
      const hasMinRel = relationships.some(r => {
        const relInfo = RELATIONSHIP_LEVELS.findIndex(l => l.level === r.level);
        const minIndex = RELATIONSHIP_LEVELS.findIndex(l => l.level === e.minRelationship);
        return relInfo >= minIndex;
      });
      if (!hasMinRel) return false;
    }
    return true;
  });
  
  if (eligibleEvents.length === 0) return null;
  
  const totalWeight = eligibleEvents.reduce((sum, e) => sum + e.probability, 0);
  let roll = Math.random() * totalWeight;
  let selectedEvent: DormitoryEventDef | null = null;
  
  for (const event of eligibleEvents) {
    roll -= event.probability;
    if (roll <= 0) {
      selectedEvent = event;
      break;
    }
  }
  
  if (!selectedEvent) selectedEvent = eligibleEvents[0];
  
  const participantCount = Math.min(selectedEvent.requiresRoommates ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 1, studentIds.length);
  const shuffled = [...studentIds].sort(() => Math.random() - 0.5);
  const participantIds = shuffled.slice(0, participantCount);
  
  return {
    id: `dorm_event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    eventId: selectedEvent.id,
    day,
    participantIds,
    effects: selectedEvent.effects,
    resolved: false,
  };
};

export const INITIAL_DORMITORY_STATE: DormitoryState = {
  rooms: [],
  relationships: [],
  schedules: [],
  recentEvents: [],
  dailyBonus: {
    courseEfficiency: 0,
    battleBonus: 0,
    reputationBonus: 0,
    staminaRegenBonus: 0,
    moraleRegenBonus: 0,
  },
  totalEventsTriggered: 0,
  lastEventDay: 0,
  totalSocialInteractions: 0,
  bestRelationshipLevel: 'stranger',
  avgMorale: 0,
  avgStamina: 0,
};

export const getRelationshipLevelOrder = (level: RelationshipLevel): number => {
  const order: Record<RelationshipLevel, number> = {
    stranger: 0,
    acquaintance: 1,
    friend: 2,
    close_friend: 3,
    bonded: 4,
  };
  return order[level];
};

export const getRestActivityIcon = (activity: RestActivity): string => {
  return REST_ACTIVITIES.find(a => a.id === activity)?.icon || '😴';
};

export const getRestActivityName = (activity: RestActivity): string => {
  return REST_ACTIVITIES.find(a => a.id === activity)?.name || activity;
};
