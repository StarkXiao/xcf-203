import type { Building, Course, Dungeon, Resource, RecruitmentTicket, MagicType } from '../types/game';

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
  },
  {
    id: 'dining_hall',
    name: '魔法餐厅',
    level: 1,
    maxLevel: 10,
    cost: { gold: 180, mana: 90, food: 10, reputation: 5 },
    effect: { type: 'reputation_gain', value: 5 },
    description: '声望获取+5',
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
    requiredLevel: 2,
    completed: false,
  },
  {
    id: 'ancient_ruins',
    name: '古代遗迹',
    level: 3,
    waves: 5,
    enemies: [],
    rewards: { gold: 500, mana: 300, food: 40, reputation: 25 },
    requiredLevel: 5,
    completed: false,
  },
  {
    id: 'dragon_lair',
    name: '巨龙巢穴',
    level: 5,
    waves: 7,
    enemies: [],
    rewards: { gold: 1000, mana: 600, food: 80, reputation: 50 },
    requiredLevel: 10,
    completed: false,
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