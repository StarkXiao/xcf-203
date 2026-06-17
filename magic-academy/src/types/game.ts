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
  quality: StudentQuality;
  potential: number;
  traits: Trait[];
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
  requiredLevel: number;
  completed: boolean;
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
}

export interface RecruitmentTicket {
  id: string;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  cost: Resource;
}

export type TabType = 'academy' | 'recruit' | 'course' | 'dungeon' | 'settlement' | 'settings';