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
  requiredReputation: number;
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
  currentHp: number;
  maxHp: number;
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
  requiredReputation: number;
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

export const CURRENT_SAVE_VERSION = 9;

export type SeasonGoalType = 'building' | 'course' | 'dungeon' | 'recruit' | 'reputation' | 'comprehensive';

export interface SeasonGoal {
  id: string;
  name: string;
  description: string;
  type: SeasonGoalType;
  target: number;
  current: number;
  reward: Partial<Resource>;
  completed: boolean;
  claimed: boolean;
  seasonPoints: number;
}

export interface SeasonStageReward {
  id: string;
  stage: number;
  name: string;
  description: string;
  requiredPoints: number;
  reward: Partial<Resource>;
  claimed: boolean;
  unlocked: boolean;
}

export interface SeasonState {
  seasonNumber: number;
  seasonName: string;
  seasonStartDay: number;
  seasonDuration: number;
  currentDay: number;
  seasonPoints: number;
  totalPointsEarned: number;
  goals: SeasonGoal[];
  stageRewards: SeasonStageReward[];
  currentStage: number;
  seasonEnded: boolean;
  seasonSettled: boolean;
  settlementRank: 'S' | 'A' | 'B' | 'C' | 'D' | null;
  settlementRewards: Partial<Resource> | null;
  settlementClaimed: boolean;
  initialSnapshot: SeasonSnapshot | null;
}

export interface SeasonSnapshot {
  resources: Resource;
  studentCount: number;
  buildingLevels: Record<string, number>;
  coursesCompleted: number;
  dungeonsCleared: number;
  recruitsDone: number;
  buildingUpgrades: number;
  totalReputation: number;
}

export interface SeasonHistory {
  seasonNumber: number;
  seasonName: string;
  startedAt: number;
  endedAt: number;
  durationDays: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  finalPoints: number;
  goalsCompleted: number;
  totalGoals: number;
  stagesClaimed: number;
  totalStages: number;
  initialResources: Resource;
  finalResources: Resource;
  initialStudentCount: number;
  finalStudentCount: number;
  initialBuildingLevels: Record<string, number>;
  finalBuildingLevels: Record<string, number>;
  coursesCompleted: number;
  dungeonsCleared: number;
  recruitsDone: number;
  buildingUpgrades: number;
  reputationGained: number;
  totalRewards: Partial<Resource>;
  rankRewards: Partial<Resource>;
  carryOverRewards: Partial<Resource>;
}

export interface SeasonSettlement {
  seasonNumber: number;
  seasonName: string;
  totalPoints: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  goalsCompleted: number;
  totalGoals: number;
  stagesClaimed: number;
  totalStages: number;
  finalRewards: Partial<Resource>;
  rankBonus: Partial<Resource>;
  carryOverBonus: Partial<Resource>;
}

export const SEASON_DURATION_DAYS = 30;
export const MAX_SEASON_HISTORY = 10;

export type GoalType = 'building' | 'course' | 'dungeon' | 'recruit' | 'comprehensive';

export interface WeeklyGoal {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  target: number;
  current: number;
  reward: Partial<Resource>;
  completed: boolean;
  claimed: boolean;
}

export interface StageTask {
  id: string;
  name: string;
  description: string;
  stage: number;
  type: GoalType;
  target: number;
  current: number;
  reward: Partial<Resource>;
  completed: boolean;
  claimed: boolean;
  unlocked: boolean;
  prerequisite?: string;
}

export interface GoalProgress {
  buildingUpgrades: number;
  coursesCompleted: number;
  dungeonClears: number;
  recruits: number;
  totalStudents: number;
  reputationGained: number;
}

export interface WeeklyGoalsState {
  weekStartDay: number;
  goals: WeeklyGoal[];
  weeklyResetCount: number;
}

export interface StageTasksState {
  tasks: StageTask[];
  currentStage: number;
}

export interface ReputationLevel {
  level: number;
  name: string;
  minReputation: number;
  description: string;
  bonuses: {
    recruitQualityBonus: number;
    courseDiscount: number;
    buildingCostDiscount: number;
    dailyReputationBonus: number;
  };
}

export interface RecruitmentTicket {
  id: string;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  cost: Resource;
  requiredReputation: number;
}

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

export type RecruitTickets = Record<StudentQuality, number>;

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
  dailySnapshots: DailySnapshot[];
  autoSaveConfig: AutoSaveConfig;
  pityCounters: PityCounter;
  gachaHistory: GachaHistory;
  recruitTickets: RecruitTickets;
  goalProgress: GoalProgress;
  weeklyGoals: WeeklyGoalsState;
  stageTasks: StageTasksState;
  season: SeasonState;
  seasonHistory: SeasonHistory[];
  clubs: ClubsState;
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

export interface BattleResult {
  victory: boolean;
  stars: number;
  survivingMembers: number;
  totalMembers: number;
  averageHpPercent: number;
  totalTurns: number;
  rewards: Resource;
  isFirstClear: boolean;
  studentHpMap: Record<string, { current: number; max: number }>;
}

export interface DungeonProgress {
  currentWave: number;
  totalWaves: number;
  playerTeamHp: Record<string, { current: number; max: number }>;
  turnCount: number;
}

export type TabType = 'academy' | 'recruit' | 'course' | 'dungeon' | 'goals' | 'settlement' | 'records' | 'settings' | 'season' | 'club';

export interface Club {
  id: string;
  name: string;
  description: string;
  icon: string;
  primaryMagicType: MagicType | 'mixed';
  focus: 'combat' | 'research' | 'support' | 'balanced';
  level: number;
  maxLevel: number;
  reputation: number;
  contributionPoints: number;
  totalContributionPoints: number;
  members: string[];
  maxMembers: number;
  buildingBonus: string[];
  unlocked: boolean;
  requiredReputation: number;
  requiredBuildingLevel?: { buildingId: string; level: number }[];
  createdAt: number;
}

export interface ClubTask {
  id: string;
  clubId: string;
  name: string;
  description: string;
  type: 'course' | 'dungeon' | 'recruit' | 'building' | 'daily' | 'special';
  target: number;
  current: number;
  reward: Partial<Resource> & { contributionPoints?: number };
  duration?: number;
  daysRemaining?: number;
  assignedStudents?: string[];
  maxAssignees?: number;
  requiredLevel?: number;
  requiredMagicType?: MagicType;
  completed: boolean;
  claimed: boolean;
  unlocked: boolean;
  prerequisiteTaskId?: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'legendary';
}

export interface ClubShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: { contributionPoints: number } & Partial<Resource>;
  effect: ClubShopEffect;
  requiredClubLevel: number;
  requiredClubReputation?: number;
  stock: number;
  maxStock: number;
  purchaseLimit: number;
  purchasedCount: number;
  category: 'resource' | 'buff' | 'consumable' | 'unlock';
}

export interface ClubShopEffect {
  type: 'resource_gain' | 'stat_buff' | 'student_buff' | 'building_buff' | 'unlock_content' | 'recruit_ticket' | 'reputation_boost';
  value: number;
  target?: string;
  duration?: number;
  quality?: StudentQuality;
}

export interface ClubReputationLevel {
  level: number;
  name: string;
  minReputation: number;
  description: string;
  bonuses: {
    taskRewardBonus: number;
    shopDiscount: number;
    maxMembersBonus: number;
    contributionGainBonus: number;
    dailyReputationBonus: number;
  };
}

export interface ClubContributionLog {
  id: string;
  clubId: string;
  studentId?: string;
  studentName?: string;
  type: 'task_complete' | 'shop_purchase' | 'donation' | 'level_up' | 'reputation_gain';
  amount: number;
  day: number;
  description: string;
  timestamp: number;
}

export interface ClubBuff {
  id: string;
  clubId: string;
  name: string;
  description: string;
  effect: ClubBuffEffect;
  remainingDays: number;
  totalDays: number;
  source: string;
}

export interface ClubBuffEffect {
  type: 'exp_bonus' | 'course_speed' | 'damage_bonus' | 'resource_gain' | 'reputation_gain' | 'stamina_regen' | 'morale_regen';
  value: number;
  target?: string;
}

export interface ClubsState {
  clubs: Club[];
  tasks: ClubTask[];
  shopItems: ClubShopItem[];
  contributionLogs: ClubContributionLog[];
  activeBuffs: ClubBuff[];
  totalContributionEarned: number;
  shopRefreshDay: number;
}

export interface DailySnapshot {
  day: number;
  timestamp: number;
  resources: Resource;
  studentCount: number;
  buildingLevels: Record<string, number>;
  avgMorale: number;
  avgStamina: number;
  studyingCount: number;
  restingCount: number;
  totalExp: number;
  events: DailyEvent[];
  income: Resource;
  consumption: { food: number };
  netChange: Resource;
}

export interface AutoSaveConfig {
  enabled: boolean;
  saveOnDayAdvance: boolean;
  saveOnCriticalAction: boolean;
  maxSnapshots: number;
  lastAutoSave: number | null;
  confirmOnCriticalAction: boolean;
}

export interface CriticalActionConfirm {
  action: 'reset_game' | 'spend_resources' | 'next_day' | 'recruit' | 'dungeon_challenge' | 'import_save';
  title: string;
  description: string;
  cost?: Partial<Resource>;
  warning?: string;
}

export interface DailyLog {
  day: number;
  events: DailyEvent[];
}

export interface DailyEvent {
  type: 'food_consumed' | 'food_shortage' | 'morale_change' | 'student_left' | 'rest' | 'study' | 'course_complete' | 'income' | 'warning' | 'course_queued' | 'course_started' | 'queue_empty' | 'course_conflict' | 'hp_heal' | 'hp_natural_recovery' | 'battle_injury' | 'cannot_battle_injured' | 'club_task_complete' | 'club_joined' | 'club_shop_purchase' | 'club_level_up' | 'club_reputation_gain';
  message: string;
  value?: number;
  studentId?: string;
  studentName?: string;
  courseId?: string;
  courseName?: string;
  clubId?: string;
  clubName?: string;
}

export const MORALE_MAX = 100;
export const MORALE_MIN = 0;
export const STAMINA_MAX = 100;
export const STAMINA_MIN = 0;
export const MORALE_LEAVE_THRESHOLD = 10;
export const FOOD_CONSUMPTION_PER_STUDENT = 1;

export const HP_BATTLE_THRESHOLD = 0.3;
export const HP_COURSE_EFFICIENCY_THRESHOLD = 0.5;
export const HP_BASE_REST_RECOVERY = 20;
export const HP_BASE_DAILY_RECOVERY = 5;
export const HEAL_MANA_PER_HP = 3;
export const HEAL_GOLD_PER_HP = 5;
export const HEAL_FOOD_PER_HP = 2;
export const HEAL_INSTANT_MANA_COST = 5;
export const HEAL_INSTANT_GOLD_COST = 10;
export const HEAL_INSTANT_FOOD_COST = 3;