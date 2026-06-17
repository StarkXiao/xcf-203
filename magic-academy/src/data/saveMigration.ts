import type { GameState, Resource, Dungeon, Student, Building, Course, DailyEvent, Teacher } from '../types/game';
import { CURRENT_SAVE_VERSION } from '../types/game';
import {
  INITIAL_RESOURCES,
  INITIAL_BUILDINGS,
  INITIAL_COURSES,
  INITIAL_DUNGEONS,
  INITIAL_TEACHERS,
  INITIAL_STUDENT_MORALE,
  INITIAL_STUDENT_STAMINA,
  initializeStudentHp,
  INITIAL_GOAL_PROGRESS,
  INITIAL_WEEKLY_GOALS,
  INITIAL_STAGE_TASKS_STATE,
} from './gameData';

type SaveData = Record<string, unknown>;

const SAVE_KEY = 'magicAcademySave';
const BACKUP_KEY = 'magicAcademySaveBackup';
const BACKUP_VERSION_KEY = 'magicAcademyBackupVersion';

function ensureResource(partial: Partial<Resource> | undefined, fallback: Resource): Resource {
  if (!partial) return { ...fallback };
  return {
    gold: typeof partial.gold === 'number' ? partial.gold : fallback.gold,
    mana: typeof partial.mana === 'number' ? partial.mana : fallback.mana,
    food: typeof partial.food === 'number' ? partial.food : fallback.food,
    reputation: typeof partial.reputation === 'number' ? partial.reputation : fallback.reputation,
  };
}

function ensureNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
}

function ensureString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function ensureBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function ensureDungeon(d: Partial<Dungeon> & Record<string, unknown>, template: Dungeon | undefined): Dungeon {
  const fallback = template || INITIAL_DUNGEONS[0];
  return {
    id: ensureString(d.id, fallback.id),
    name: ensureString(d.name, fallback.name),
    level: ensureNumber(d.level, fallback.level),
    waves: ensureNumber(d.waves, fallback.waves),
    enemies: ensureArray(d.enemies, fallback.enemies),
    rewards: ensureResource(d.rewards as Partial<Resource> | undefined, fallback.rewards),
    firstClearRewards: ensureResource(d.firstClearRewards as Partial<Resource> | undefined, fallback.firstClearRewards),
    requiredLevel: ensureNumber(d.requiredLevel, fallback.requiredLevel),
    staminaCost: ensureNumber(d.staminaCost, fallback.staminaCost),
    stars: ensureNumber(d.stars, 0),
    bestStars: ensureNumber(d.bestStars, 0),
    firstCleared: ensureBoolean(d.firstCleared, typeof d.completed === 'boolean' ? d.completed : false),
    clearedCount: ensureNumber(d.clearedCount, 0),
    bestTeam: ensureArray<string>(d.bestTeam, []),
    sweepUnlocked: ensureBoolean(d.sweepUnlocked, false),
    starRequirements: d.starRequirements && typeof d.starRequirements === 'object'
      ? {
          threeStar: ensureString((d.starRequirements as Record<string, unknown>).threeStar, fallback.starRequirements.threeStar),
          twoStar: ensureString((d.starRequirements as Record<string, unknown>).twoStar, fallback.starRequirements.twoStar),
          oneStar: ensureString((d.starRequirements as Record<string, unknown>).oneStar, fallback.starRequirements.oneStar),
        }
      : { ...fallback.starRequirements },
  };
}

function ensureStudent(s: Partial<Student> & Record<string, unknown>): Student {
  const recruitmentInfo = s.recruitmentInfo && typeof s.recruitmentInfo === 'object'
    ? {
        recruitedAt: ensureNumber((s.recruitmentInfo as unknown as Record<string, unknown>).recruitedAt, 1),
        recruitmentQuality: (['common', 'rare', 'epic', 'legendary'].includes(
          (s.recruitmentInfo as unknown as Record<string, unknown>).recruitmentQuality as string
        )
          ? (s.recruitmentInfo as unknown as Record<string, unknown>).recruitmentQuality
          : 'common') as Student['recruitmentInfo']['recruitmentQuality'],
        initialLevel: ensureNumber((s.recruitmentInfo as unknown as Record<string, unknown>).initialLevel, 1),
        initialPotential: ensureNumber((s.recruitmentInfo as unknown as Record<string, unknown>).initialPotential, 1),
      }
    : {
        recruitedAt: 1,
        recruitmentQuality: 'common' as const,
        initialLevel: 1,
        initialPotential: 1,
      };

  const skills = ensureArray(s.skills, []);
  const level = clampNumber(s.level, 1, 999, 1);
  const defaultHp = initializeStudentHp({ level, skills });
  const rawMaxHp = typeof s.maxHp === 'number' && !isNaN(s.maxHp) ? s.maxHp : defaultHp.maxHp;
  const rawCurrentHp = typeof s.currentHp === 'number' && !isNaN(s.currentHp) ? s.currentHp : defaultHp.currentHp;
  const maxHp = Math.max(1, rawMaxHp);
  const currentHp = clampNumber(rawCurrentHp, 0, maxHp, maxHp);

  return {
    id: ensureString(s.id, `student_recovered_${Math.random().toString(36).slice(2, 8)}`),
    name: ensureString(s.name, '未知学员'),
    level,
    exp: clampNumber(s.exp, 0, Infinity, 0),
    magicType: (['fire', 'water', 'earth', 'wind', 'light', 'dark'].includes(s.magicType as string)
      ? s.magicType : 'fire') as Student['magicType'],
    skills,
    status: (['idle', 'studying', 'training', 'resting'].includes(s.status as string)
      ? s.status : 'idle') as Student['status'],
    assignedBuilding: s.assignedBuilding === null ? null : ensureString(s.assignedBuilding, null as unknown as string) || null,
    assignedCourse: s.assignedCourse === null ? null : ensureString(s.assignedCourse, null as unknown as string) || null,
    courseProgress: clampNumber(s.courseProgress, 0, Infinity, 0),
    courseDaysRemaining: clampNumber(s.courseDaysRemaining, 0, Infinity, 0),
    courseQueue: ensureArray(s.courseQueue, []),
    quality: (['common', 'rare', 'epic', 'legendary'].includes(s.quality as string)
      ? s.quality : 'common') as Student['quality'],
    potential: clampNumber(s.potential, 0.1, 5, 1),
    traits: ensureArray(s.traits, []),
    morale: clampNumber(s.morale, 0, 100, INITIAL_STUDENT_MORALE),
    stamina: clampNumber(s.stamina, 0, 100, INITIAL_STUDENT_STAMINA),
    currentHp,
    maxHp,
    recruitmentInfo,
    growthRecords: ensureArray(s.growthRecords, []),
    courseHistory: ensureArray(s.courseHistory, []),
    dungeonHistory: ensureArray(s.dungeonHistory, []),
  };
}

function ensureBuilding(b: Partial<Building> & Record<string, unknown>, template: Building | undefined): Building {
  const fallback = template || INITIAL_BUILDINGS[0];
  return {
    id: ensureString(b.id, fallback.id),
    name: ensureString(b.name, fallback.name),
    level: clampNumber(b.level, 1, b.maxLevel ?? fallback.maxLevel, fallback.level),
    maxLevel: ensureNumber(b.maxLevel, fallback.maxLevel),
    cost: ensureResource(b.cost as Partial<Resource> | undefined, fallback.cost),
    effect: b.effect && typeof b.effect === 'object'
      ? {
          type: ensureString((b.effect as unknown as Record<string, unknown>).type, fallback.effect.type) as Building['effect']['type'],
          value: ensureNumber((b.effect as unknown as Record<string, unknown>).value, fallback.effect.value),
          magicType: (['fire', 'water', 'earth', 'wind', 'light', 'dark'].includes((b.effect as unknown as Record<string, unknown>).magicType as string)
            ? (b.effect as unknown as Record<string, unknown>).magicType
            : fallback.effect.magicType) as Building['effect']['magicType'],
        }
      : { ...fallback.effect },
    description: ensureString(b.description, fallback.description),
    requiredReputation: ensureNumber(b.requiredReputation, fallback.requiredReputation),
    prerequisites: Array.isArray(b.prerequisites) ? b.prerequisites as Building['prerequisites'] : fallback.prerequisites,
    synergyBonus: Array.isArray(b.synergyBonus) ? b.synergyBonus as Building['synergyBonus'] : fallback.synergyBonus,
  };
}

function ensureCourse(c: Partial<Course> & Record<string, unknown>, template: Course | undefined): Course {
  const fallback = template || INITIAL_COURSES[0];
  return {
    id: ensureString(c.id, fallback.id),
    name: ensureString(c.name, fallback.name),
    level: ensureNumber(c.level, fallback.level),
    duration: ensureNumber(c.duration, fallback.duration),
    cost: ensureResource(c.cost as Partial<Resource> | undefined, fallback.cost),
    effect: c.effect && typeof c.effect === 'object'
      ? {
          type: ensureString((c.effect as unknown as Record<string, unknown>).type, fallback.effect.type) as Course['effect']['type'],
          value: ensureNumber((c.effect as unknown as Record<string, unknown>).value, fallback.effect.value),
          stat: (c.effect as unknown as Record<string, unknown>).stat as string | undefined,
        }
      : { ...fallback.effect },
    requiredLevel: ensureNumber(c.requiredLevel, fallback.requiredLevel),
    requiredReputation: ensureNumber(c.requiredReputation, fallback.requiredReputation),
    magicType: (['fire', 'water', 'earth', 'wind', 'light', 'dark'].includes(c.magicType as string)
      ? c.magicType
      : fallback.magicType) as Course['magicType'],
    assignedTeacher: c.assignedTeacher === null
      ? null
      : typeof c.assignedTeacher === 'string'
        ? c.assignedTeacher
        : (fallback.assignedTeacher ?? null),
  };
}

function ensureTeacher(t: Partial<Teacher> & Record<string, unknown>, template: Teacher | undefined): Teacher {
  const fallback = template || INITIAL_TEACHERS[0];
  return {
    id: ensureString(t.id, fallback.id),
    name: ensureString(t.name, fallback.name),
    magicType: (['fire', 'water', 'earth', 'wind', 'light', 'dark'].includes(t.magicType as string)
      ? t.magicType
      : fallback.magicType) as Teacher['magicType'],
    level: ensureNumber(t.level, fallback.level),
    expBonus: ensureNumber(t.expBonus, fallback.expBonus),
    skillBonus: ensureNumber(t.skillBonus, fallback.skillBonus),
    description: ensureString(t.description, fallback.description),
    salary: ensureResource(t.salary as Partial<Resource> | undefined, fallback.salary),
  };
}

interface MigrationContext {
  version: number;
  data: SaveData;
}

type MigrationStep = (ctx: MigrationContext) => SaveData;

function migrateV0ToV1(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  if (!data.dungeons || !Array.isArray(data.dungeons)) {
    data.dungeons = [];
  }

  data.dungeons = (data.dungeons as Array<Record<string, unknown>>).map((d: Record<string, unknown>) => {
    const template = INITIAL_DUNGEONS.find(t => t.id === d.id);
    return {
      ...template,
      ...d,
      firstClearRewards: d.firstClearRewards ?? template?.firstClearRewards ?? { gold: 0, mana: 0, food: 0, reputation: 0 },
      staminaCost: d.staminaCost ?? template?.staminaCost ?? 10,
      stars: d.stars ?? 0,
      bestStars: d.bestStars ?? 0,
      firstCleared: d.firstCleared ?? (d.completed ?? false),
      clearedCount: d.clearedCount ?? 0,
      bestTeam: d.bestTeam ?? [],
      sweepUnlocked: d.sweepUnlocked ?? false,
      starRequirements: d.starRequirements ?? template?.starRequirements ?? {
        threeStar: '全员存活',
        twoStar: '至少2人存活',
        oneStar: '至少1人存活',
      },
    };
  });

  if (!data.students || !Array.isArray(data.students)) {
    data.students = [];
  }
  data.students = (data.students as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => ({
    ...s,
    morale: s.morale ?? INITIAL_STUDENT_MORALE,
    stamina: s.stamina ?? INITIAL_STUDENT_STAMINA,
    courseQueue: s.courseQueue ?? [],
  }));

  data.dailyLogs = data.dailyLogs ?? [];

  data.saveVersion = 1;
  return data;
}

function migrateV1ToV2(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  if (Array.isArray(data.buildings)) {
    data.buildings = (data.buildings as Array<Record<string, unknown>>).map((b: Record<string, unknown>) => {
      const template = INITIAL_BUILDINGS.find(t => t.id === b.id);
      if (template) {
        return {
          ...template,
          ...b,
          synergyBonus: b.synergyBonus ?? template.synergyBonus,
          prerequisites: b.prerequisites ?? template.prerequisites,
        };
      }
      return b;
    });
  }

  if (Array.isArray(data.courses)) {
    data.courses = (data.courses as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => {
      const template = INITIAL_COURSES.find(t => t.id === c.id);
      if (template) {
        return {
          ...template,
          ...c,
          effect: c.effect ?? template.effect,
        };
      }
      return c;
    });
  }

  if (Array.isArray(data.students)) {
    data.students = (data.students as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => {
      if (!Array.isArray(s.traits)) s.traits = [];
      if (typeof s.potential !== 'number' || isNaN(s.potential)) s.potential = 1;
      return s;
    });
  }

  data.saveVersion = 2;
  return data;
}

function migrateV2ToV3(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  if (!data.teachers || !Array.isArray(data.teachers)) {
    data.teachers = [...INITIAL_TEACHERS];
  }

  if (Array.isArray(data.buildings)) {
    data.buildings = (data.buildings as Array<Record<string, unknown>>).map((b: Record<string, unknown>) => {
      const template = INITIAL_BUILDINGS.find(t => t.id === b.id);
      if (template) {
        return {
          ...template,
          ...b,
          effect: b.effect ?? template.effect,
        };
      }
      return b;
    });
  }

  if (Array.isArray(data.courses)) {
    data.courses = (data.courses as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => {
      const template = INITIAL_COURSES.find(t => t.id === c.id);
      if (template) {
        return {
          ...template,
          ...c,
          assignedTeacher: c.assignedTeacher ?? template.assignedTeacher,
        };
      }
      return c;
    });
  }

  data.saveVersion = 3;
  return data;
}

function migrateV3ToV4(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  if (Array.isArray(data.students)) {
    data.students = (data.students as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => {
      const level = typeof s.level === 'number' && !isNaN(s.level) ? Math.max(1, s.level) : 1;
      const skills = Array.isArray(s.skills) ? s.skills : [];
      const defaultHp = initializeStudentHp({ level, skills });
      
      if (typeof s.maxHp !== 'number' || isNaN(s.maxHp)) {
        s.maxHp = defaultHp.maxHp;
      }
      if (typeof s.currentHp !== 'number' || isNaN(s.currentHp)) {
        s.currentHp = defaultHp.currentHp;
      }
      s.currentHp = Math.max(0, Math.min(s.currentHp as number, s.maxHp as number));
      return s;
    });
  }

  data.saveVersion = 4;
  return data;
}

function migrateV4ToV5(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  data.dailySnapshots = [];
  data.autoSaveConfig = {
    enabled: true,
    saveOnDayAdvance: true,
    saveOnCriticalAction: true,
    maxSnapshots: 30,
    lastAutoSave: null,
    confirmOnCriticalAction: true,
  };

  data.saveVersion = 5;
  return data;
}

function migrateV5ToV6(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  if (Array.isArray(data.buildings)) {
    data.buildings = (data.buildings as Array<Record<string, unknown>>).map((b: Record<string, unknown>) => {
      const template = INITIAL_BUILDINGS.find(t => t.id === b.id);
      return {
        ...template,
        ...b,
        requiredReputation: b.requiredReputation ?? template?.requiredReputation ?? 0,
      };
    });
  }

  if (Array.isArray(data.courses)) {
    data.courses = (data.courses as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => {
      const template = INITIAL_COURSES.find(t => t.id === c.id);
      return {
        ...template,
        ...c,
        requiredReputation: c.requiredReputation ?? template?.requiredReputation ?? 0,
      };
    });
  }

  data.saveVersion = 6;
  return data;
}

function migrateV6ToV7(ctx: MigrationContext): SaveData {
  const data = { ...ctx.data };

  data.goalProgress = { ...INITIAL_GOAL_PROGRESS };
  data.weeklyGoals = { ...INITIAL_WEEKLY_GOALS };
  data.stageTasks = { ...INITIAL_STAGE_TASKS_STATE };

  data.saveVersion = 7;
  return data;
}

const MIGRATION_CHAIN: Record<number, MigrationStep> = {
  0: migrateV0ToV1,
  1: migrateV1ToV2,
  2: migrateV2ToV3,
  3: migrateV3ToV4,
  4: migrateV4ToV5,
  5: migrateV5ToV6,
  6: migrateV6ToV7,
};

export function migrateSave(rawData: SaveData): GameState {
  let data = { ...rawData };
  let version = typeof data.saveVersion === 'number' ? data.saveVersion : 0;

  while (version < CURRENT_SAVE_VERSION) {
    const migrator = MIGRATION_CHAIN[version];
    if (!migrator) break;
    data = migrator({ version, data });
    version = typeof data.saveVersion === 'number' ? data.saveVersion : version + 1;
  }

  return normalizeToGameState(data);
}

function normalizeToGameState(data: SaveData): GameState {
  const resources = ensureResource(data.resources as Partial<Resource> | undefined, INITIAL_RESOURCES);

  const buildings = ensureArray<Record<string, unknown>>(data.buildings, []).map(
    b => ensureBuilding(b as Partial<Building> & Record<string, unknown>, INITIAL_BUILDINGS.find(t => t.id === b.id))
  );
  const missingBuildingIds = INITIAL_BUILDINGS.filter(t => !buildings.find(b => b.id === t.id)).map(t => t.id);
  for (const id of missingBuildingIds) {
    const template = INITIAL_BUILDINGS.find(t => t.id === id)!;
    buildings.push({ ...template });
  }

  const courses = ensureArray<Record<string, unknown>>(data.courses, []).map(
    c => ensureCourse(c as Partial<Course> & Record<string, unknown>, INITIAL_COURSES.find(t => t.id === c.id))
  );
  const missingCourseIds = INITIAL_COURSES.filter(t => !courses.find(c => c.id === t.id)).map(t => t.id);
  for (const id of missingCourseIds) {
    const template = INITIAL_COURSES.find(t => t.id === id)!;
    courses.push({ ...template });
  }

  const dungeons = ensureArray<Record<string, unknown>>(data.dungeons, []).map(
    d => ensureDungeon(d as Partial<Dungeon> & Record<string, unknown>, INITIAL_DUNGEONS.find(t => t.id === d.id))
  );
  const missingDungeonIds = INITIAL_DUNGEONS.filter(t => !dungeons.find(d => d.id === t.id)).map(t => t.id);
  for (const id of missingDungeonIds) {
    const template = INITIAL_DUNGEONS.find(t => t.id === id)!;
    dungeons.push({ ...template });
  }

  const teachers = ensureArray<Record<string, unknown>>(data.teachers, []).map(
    t => ensureTeacher(t as Partial<Teacher> & Record<string, unknown>, INITIAL_TEACHERS.find(tpl => tpl.id === t.id))
  );
  const missingTeacherIds = INITIAL_TEACHERS.filter(tpl => !teachers.find(t => t.id === tpl.id)).map(t => t.id);
  for (const id of missingTeacherIds) {
    const template = INITIAL_TEACHERS.find(t => t.id === id)!;
    teachers.push({ ...template });
  }

  const students = ensureArray<Record<string, unknown>>(data.students, []).map(
    s => ensureStudent(s as Partial<Student> & Record<string, unknown>)
  );

  const dailyLogs = ensureArray<Record<string, unknown>>(data.dailyLogs, []).map(
    (log: Record<string, unknown>) => ({
      day: ensureNumber(log.day, 1),
      events: ensureArray<Record<string, unknown>>(log.events, []).map(
        (evt: Record<string, unknown>) => ({
          type: ensureString(evt.type, 'warning') as DailyEvent['type'],
          message: ensureString(evt.message, ''),
          value: typeof evt.value === 'number' ? evt.value : undefined,
          studentId: typeof evt.studentId === 'string' ? evt.studentId : undefined,
          studentName: typeof evt.studentName === 'string' ? evt.studentName : undefined,
          courseId: typeof evt.courseId === 'string' ? evt.courseId : undefined,
          courseName: typeof evt.courseName === 'string' ? evt.courseName : undefined,
        })
      ),
    })
  );

  const pityCounters = data.pityCounters && typeof data.pityCounters === 'object'
    ? {
        common: ensureNumber((data.pityCounters as Record<string, unknown>).common, 0),
        rare: ensureNumber((data.pityCounters as Record<string, unknown>).rare, 0),
        epic: ensureNumber((data.pityCounters as Record<string, unknown>).epic, 0),
        legendary: ensureNumber((data.pityCounters as Record<string, unknown>).legendary, 0),
      }
    : { common: 0, rare: 0, epic: 0, legendary: 0 };

  const gachaQualityCounts = data.gachaHistory && typeof data.gachaHistory === 'object' && (data.gachaHistory as Record<string, unknown>).qualityCounts && typeof (data.gachaHistory as Record<string, unknown>).qualityCounts === 'object'
    ? (data.gachaHistory as Record<string, unknown>).qualityCounts as Record<string, unknown>
    : {};

  const gachaHistory = data.gachaHistory && typeof data.gachaHistory === 'object'
    ? {
        results: ensureArray((data.gachaHistory as Record<string, unknown>).results, []),
        totalDraws: ensureNumber((data.gachaHistory as Record<string, unknown>).totalDraws, 0),
        qualityCounts: {
          common: ensureNumber(gachaQualityCounts.common, 0),
          rare: ensureNumber(gachaQualityCounts.rare, 0),
          epic: ensureNumber(gachaQualityCounts.epic, 0),
          legendary: ensureNumber(gachaQualityCounts.legendary, 0),
        },
      }
    : {
        results: [],
        totalDraws: 0,
        qualityCounts: { common: 0, rare: 0, epic: 0, legendary: 0 },
      };

  const dailySnapshots = ensureArray<Record<string, unknown>>(data.dailySnapshots, []).map(
    (snap: Record<string, unknown>) => ({
      day: ensureNumber(snap.day, 1),
      timestamp: ensureNumber(snap.timestamp, Date.now()),
      resources: ensureResource(snap.resources as Partial<Resource> | undefined, INITIAL_RESOURCES),
      studentCount: ensureNumber(snap.studentCount, 0),
      buildingLevels: snap.buildingLevels && typeof snap.buildingLevels === 'object'
        ? (snap.buildingLevels as Record<string, number>)
        : {},
      avgMorale: ensureNumber(snap.avgMorale, 0),
      avgStamina: ensureNumber(snap.avgStamina, 0),
      studyingCount: ensureNumber(snap.studyingCount, 0),
      restingCount: ensureNumber(snap.restingCount, 0),
      totalExp: ensureNumber(snap.totalExp, 0),
      events: ensureArray<Record<string, unknown>>(snap.events, []).map(
        (evt: Record<string, unknown>) => ({
          type: ensureString(evt.type, 'warning') as DailyEvent['type'],
          message: ensureString(evt.message, ''),
          value: typeof evt.value === 'number' ? evt.value : undefined,
          studentId: typeof evt.studentId === 'string' ? evt.studentId : undefined,
          studentName: typeof evt.studentName === 'string' ? evt.studentName : undefined,
          courseId: typeof evt.courseId === 'string' ? evt.courseId : undefined,
          courseName: typeof evt.courseName === 'string' ? evt.courseName : undefined,
        })
      ),
      income: ensureResource(snap.income as Partial<Resource> | undefined, { gold: 0, mana: 0, food: 0, reputation: 0 }),
      consumption: {
        food: ensureNumber((snap.consumption as Record<string, unknown> | undefined)?.food, 0),
      },
      netChange: ensureResource(snap.netChange as Partial<Resource> | undefined, { gold: 0, mana: 0, food: 0, reputation: 0 }),
    })
  );

  const autoSaveConfig = data.autoSaveConfig && typeof data.autoSaveConfig === 'object'
    ? {
        enabled: ensureBoolean((data.autoSaveConfig as Record<string, unknown>).enabled, true),
        saveOnDayAdvance: ensureBoolean((data.autoSaveConfig as Record<string, unknown>).saveOnDayAdvance, true),
        saveOnCriticalAction: ensureBoolean((data.autoSaveConfig as Record<string, unknown>).saveOnCriticalAction, true),
        maxSnapshots: ensureNumber((data.autoSaveConfig as Record<string, unknown>).maxSnapshots, 30),
        lastAutoSave: typeof (data.autoSaveConfig as Record<string, unknown>).lastAutoSave === 'number'
          ? (data.autoSaveConfig as Record<string, unknown>).lastAutoSave as number
          : null,
        confirmOnCriticalAction: ensureBoolean((data.autoSaveConfig as Record<string, unknown>).confirmOnCriticalAction, true),
      }
    : {
        enabled: true,
        saveOnDayAdvance: true,
        saveOnCriticalAction: true,
        maxSnapshots: 30,
        lastAutoSave: null,
        confirmOnCriticalAction: true,
      };

  const goalProgress = data.goalProgress && typeof data.goalProgress === 'object'
    ? {
        buildingUpgrades: ensureNumber((data.goalProgress as Record<string, unknown>).buildingUpgrades, 0),
        coursesCompleted: ensureNumber((data.goalProgress as Record<string, unknown>).coursesCompleted, 0),
        dungeonClears: ensureNumber((data.goalProgress as Record<string, unknown>).dungeonClears, 0),
        recruits: ensureNumber((data.goalProgress as Record<string, unknown>).recruits, 0),
        totalStudents: ensureNumber((data.goalProgress as Record<string, unknown>).totalStudents, 0),
        reputationGained: ensureNumber((data.goalProgress as Record<string, unknown>).reputationGained, 0),
      }
    : { ...INITIAL_GOAL_PROGRESS };

  const weeklyGoals = data.weeklyGoals && typeof data.weeklyGoals === 'object'
    ? {
        weekStartDay: ensureNumber((data.weeklyGoals as Record<string, unknown>).weekStartDay, 1),
        goals: ensureArray((data.weeklyGoals as Record<string, unknown>).goals, []),
        weeklyResetCount: ensureNumber((data.weeklyGoals as Record<string, unknown>).weeklyResetCount, 0),
      }
    : { ...INITIAL_WEEKLY_GOALS };

  const stageTasks = data.stageTasks && typeof data.stageTasks === 'object'
    ? {
        tasks: ensureArray((data.stageTasks as Record<string, unknown>).tasks, []),
        currentStage: ensureNumber((data.stageTasks as Record<string, unknown>).currentStage, 1),
      }
    : { ...INITIAL_STAGE_TASKS_STATE };

  if (stageTasks.tasks.length === 0) {
    stageTasks.tasks = [...INITIAL_STAGE_TASKS_STATE.tasks];
  }

  if (weeklyGoals.goals.length === 0) {
    weeklyGoals.goals = [...INITIAL_WEEKLY_GOALS.goals];
  }

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    resources,
    buildings,
    students,
    courses,
    dungeons,
    teachers,
    day: ensureNumber(data.day, 1),
    maxStudents: ensureNumber(data.maxStudents, 20),
    currentStudentId: ensureNumber(data.currentStudentId, 1),
    currentDungeonId: ensureNumber(data.currentDungeonId, 100),
    gameStarted: ensureBoolean(data.gameStarted, true),
    dailyLogs,
    dailySnapshots,
    autoSaveConfig,
    pityCounters,
    gachaHistory,
    goalProgress,
    weeklyGoals,
    stageTasks,
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSaveData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('存档数据为空或格式不正确');
    return { valid: false, errors, warnings };
  }

  const save = data as Record<string, unknown>;

  if (!save.resources || typeof save.resources !== 'object') {
    errors.push('缺少资源数据');
  } else {
    const res = save.resources as Record<string, unknown>;
    if (typeof res.gold !== 'number' || isNaN(res.gold)) warnings.push('金币数据异常，将使用默认值');
    if (typeof res.mana !== 'number' || isNaN(res.mana)) warnings.push('魔力数据异常，将使用默认值');
    if (typeof res.food !== 'number' || isNaN(res.food)) warnings.push('食物数据异常，将使用默认值');
    if (typeof res.reputation !== 'number' || isNaN(res.reputation)) warnings.push('声望数据异常，将使用默认值');
  }

  if (!Array.isArray(save.buildings)) {
    errors.push('缺少建筑数据');
  }

  if (!Array.isArray(save.students)) {
    warnings.push('缺少学员数据，将以空列表初始化');
  } else {
    for (let i = 0; i < save.students.length; i++) {
      const s = save.students[i] as Record<string, unknown>;
      if (!s.id) warnings.push(`学员 #${i + 1} 缺少ID，将自动生成`);
      if (typeof s.level !== 'number' || s.level < 1) warnings.push(`学员 #${i + 1} 等级异常`);
    }
  }

  if (!Array.isArray(save.dungeons)) {
    errors.push('缺少副本数据');
  }

  if (typeof save.day !== 'number' || save.day < 1) {
    warnings.push('天数数据异常，将使用默认值1');
  }

  const version = save.saveVersion;
  if (typeof version !== 'number') {
    warnings.push('存档无版本号，将视为v0旧存档进行完整迁移');
  } else if (version > CURRENT_SAVE_VERSION) {
    errors.push(`存档版本(v${version})高于当前游戏版本(v${CURRENT_SAVE_VERSION})，可能不兼容`);
  } else if (version < CURRENT_SAVE_VERSION) {
    warnings.push(`存档版本(v${version})低于当前版本(v${CURRENT_SAVE_VERSION})，将自动迁移`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createBackup(): boolean {
  try {
    const current = localStorage.getItem(SAVE_KEY);
    if (!current) return false;
    localStorage.setItem(BACKUP_KEY, current);
    localStorage.setItem(BACKUP_VERSION_KEY, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

export function restoreBackup(): SaveData | null {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return null;
    return JSON.parse(backup);
  } catch {
    return null;
  }
}

export function hasBackup(): boolean {
  return localStorage.getItem(BACKUP_KEY) !== null;
}

export function getBackupTime(): string | null {
  return localStorage.getItem(BACKUP_VERSION_KEY);
}

export function loadAndMigrateSave(): { state: GameState; warnings: string[] } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validation = validateSaveData(parsed);

    if (!validation.valid) {
      console.warn('存档校验失败:', validation.errors);
      const backup = restoreBackup();
      if (backup) {
        const backupValidation = validateSaveData(backup);
        if (backupValidation.valid) {
          const migrated = migrateSave(backup);
          return { state: migrated, warnings: ['原始存档损坏，已从备份恢复', ...backupValidation.warnings] };
        }
      }
      return null;
    }

    createBackup();
    const migrated = migrateSave(parsed);
    return { state: migrated, warnings: validation.warnings };
  } catch (e) {
    console.error('加载存档失败:', e);
    const backup = restoreBackup();
    if (backup) {
      try {
        const migrated = migrateSave(backup);
        return { state: migrated, warnings: ['原始存档解析失败，已从备份恢复'] };
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function exportSaveData(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function importSaveData(jsonString: string): { state: GameState; warnings: string[] } | null {
  try {
    const parsed = JSON.parse(jsonString);
    const validation = validateSaveData(parsed);
    if (!validation.valid) {
      return null;
    }
    const migrated = migrateSave(parsed);
    return { state: migrated, warnings: validation.warnings };
  } catch {
    return null;
  }
}
