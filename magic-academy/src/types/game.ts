export interface Resource {
  gold: number;
  mana: number;
  food: number;
  reputation: number;
}

export interface Building {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  cost: Resource;
  effect: BuildingEffect;
  description: string;
  prerequisites?: BuildingPrerequisite[];
  synergyBonus?: BuildingSynergy[];
}

export interface BuildingPrerequisite {
  buildingId: string;
  requiredLevel: number;
}

export interface BuildingSynergy {
  name: string;
  description: string;
  requires: { buildingId: string; minLevel: number }[];
  effect: SynergyEffect;
}

export interface SynergyEffect {
  type: 'capacity_bonus' | 'efficiency_bonus' | 'reputation_bonus' | 'all_stats_bonus';
  value: number;
  valuePerLevel?: number;
}

export interface BuildingEffect {
  type: 'student_capacity' | 'mana_capacity' | 'reputation_gain' | 'course_speed' | 'recruit_quality' | 'magic_type_bonus';
  value: number;
  magicType?: MagicType;
}

export interface Student {
  id: string;
  name: string;
  level: number;
  exp: number;
  magicType: MagicType;
  skills: Skill[];
  status: StudentStatus;
  assignedBuilding: string | null;
  assignedCourse: string | null;
  courseProgress: number;
  courseDaysRemaining: number;
  courseQueue: QueuedCourse[];
  quality: StudentQuality;
  potential: number;
  traits: Trait[];
  morale: number;
  stamina: number;
  recruitmentInfo: RecruitmentInfo;
  growthRecords: GrowthRecord[];
  courseHistory: CourseHistoryEntry[];
  dungeonHistory: DungeonHistoryEntry[];
}

export interface RecruitmentInfo {
  recruitedAt: number;
  recruitmentQuality: StudentQuality;
  initialLevel: number;
  initialPotential: number;
}

export interface GrowthRecord {
  id: string;
  type: 'level_up' | 'skill_unlock' | 'trait_gain' | 'potential_boost';
  day: number;
  description: string;
  details?: Record<string, unknown>;
}

export interface CourseHistoryEntry {
  id: string;
  courseId: string;
  courseName: string;
  startedAt: number;
  completedAt: number;
  expGained: number;
  leveledUp: boolean;
  skillUnlocked: boolean;
}

export interface DungeonHistoryEntry {
  id: string;
  dungeonId: string;
  dungeonName: string;
  challengedAt: number;
  victory: boolean;
  stars: number;
  survivingMembers: number;
  totalMembers: number;
  turns: number;
  rewards: Partial<Resource>;
  isFirstClear: boolean;
}

export interface QueuedCourse {
  courseId: string;
  addedAt: number;
}

export type StudentQuality = 'common' | 'rare' | 'epic' | 'legendary';

export interface Trait {
  id: string;
  name: string;
  description: string;
  rarity: TraitRarity;
  effects: TraitEffect[];
}

export type TraitRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface TraitEffect {
  type: TraitEffectType;
  value: number;
  magicType?: MagicType;
}

export type TraitEffectType = 
  | 'exp_bonus' 
  | 'skill_damage' 
  | 'magic_affinity' 
  | 'learning_speed' 
  | 'course_speed'
  | 'potential_growth'
  | 'all_stats';

export type MagicType = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark';

export type StudentStatus = 'idle' | 'studying' | 'training' | 'resting';

export interface Skill {
  id: string;
  name: string;
  type: MagicType;
  damage: number;
  cost: number;
  description: string;
}

export interface Course {
  id: string;
  name: string;
  level: number;
  duration: number;
  cost: Resource;
  effect: CourseEffect;
  requiredLevel: number;
  magicType?: MagicType;
  assignedTeacher?: string | null;
}

export interface Teacher {
  id: string;
  name: string;
  magicType: MagicType;
  level: number;
  expBonus: number;
  skillBonus: number;
  description: string;
  salary: Resource;
}

export interface CourseEffect {
  type: 'exp_gain' | 'skill_unlock' | 'stat_boost';
  value: number;
  stat?: string;
}

export interface Dungeon {
  id: string;
  name: string;
  level: number;
  waves: number;
  enemies: Enemy[];
  rewards: Resource;
  firstClearRewards: Resource;
  requiredLevel: number;
  staminaCost: number;
  stars: number;
  bestStars: number;
  firstCleared: boolean;
  clearedCount: number;
  bestTeam: string[];
  sweepUnlocked: boolean;
  starRequirements: {
    threeStar: string;
    twoStar: string;
    oneStar: string;
  };
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  type: MagicType;
  isBoss: boolean;
}

export const CURRENT_SAVE_VERSION = 3;

export interface PityCounter {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface ProbabilityConfig {
  quality: StudentQuality;
  probability: number;
  minProbability?: number;
  maxProbability?: number;
}

export interface GachaResult {
  id: string;
  ticketQuality: StudentQuality;
  resultQuality: StudentQuality;
  studentId: string;
  studentName: string;
  isPityTriggered: boolean;
  pityCountBefore: number;
  timestamp: number;
  day: number;
  details: {
    potential: number;
    traits: string[];
    magicType: MagicType;
    initialLevel: number;
  };
}

export interface GachaHistory {
  results: GachaResult[];
  totalDraws: number;
  qualityCounts: Record<StudentQuality, number>;
}

export interface GameState {
  saveVersion: number;
  resources: Resource;
  buildings: Building[];
  students: Student[];
  courses: Course[];
  dungeons: Dungeon[];
  teachers: Teacher[];
  day: number;
  maxStudents: number;
  currentStudentId: number;
  currentDungeonId: number;
  gameStarted: boolean;
  dailyLogs: DailyLog[];
  pityCounters: PityCounter;
  gachaHistory: GachaHistory;
}

export interface CourseBenefitBreakdown {
  baseExp: number;
  magicTypeMatchBonus: number;
  teacherBonus: number;
  buildingBonus: number;
  traitBonus: number;
  potentialMultiplier: number;
  totalExp: number;
  magicTypeMatch: boolean;
  matchedTeacher?: Teacher;
  contributingBuildings: string[];
}

export interface RecruitmentTicket {
  id: string;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  cost: Resource;
}

export interface BattleResult {
  victory: boolean;
  stars: number;
  survivingMembers: number;
  totalMembers: number;
  averageHpPercent: number;
  totalTurns: number;
  rewards: Resource;
  isFirstClear: boolean;
}

export interface DungeonProgress {
  currentWave: number;
  totalWaves: number;
  playerTeamHp: Record<string, { current: number; max: number }>;
  turnCount: number;
}

export type TabType = 'academy' | 'recruit' | 'course' | 'dungeon' | 'settlement' | 'settings';

export interface DailyLog {
  day: number;
  events: DailyEvent[];
}

export interface DailyEvent {
  type: 'food_consumed' | 'food_shortage' | 'morale_change' | 'student_left' | 'rest' | 'study' | 'course_complete' | 'income' | 'warning' | 'course_queued' | 'course_started' | 'queue_empty' | 'course_conflict';
  message: string;
  value?: number;
  studentId?: string;
  studentName?: string;
  courseId?: string;
  courseName?: string;
}

export const MORALE_MAX = 100;
export const MORALE_MIN = 0;
export const STAMINA_MAX = 100;
export const STAMINA_MIN = 0;
export const MORALE_LEAVE_THRESHOLD = 10;
export const FOOD_CONSUMPTION_PER_STUDENT = 1;