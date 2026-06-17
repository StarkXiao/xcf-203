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
  type: 'student_capacity' | 'mana_capacity' | 'reputation_gain' | 'course_speed' | 'recruit_quality';
  value: number;
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

export interface GameState {
  resources: Resource;
  buildings: Building[];
  students: Student[];
  courses: Course[];
  dungeons: Dungeon[];
  day: number;
  maxStudents: number;
  currentStudentId: number;
  currentDungeonId: number;
  gameStarted: boolean;
  dailyLogs: DailyLog[];
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