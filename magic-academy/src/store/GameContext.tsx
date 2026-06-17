/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, Resource, TabType, Student as StudentType, GachaResult, StudentQuality, CourseBenefitBreakdown } from '../types/game';
import { CURRENT_SAVE_VERSION } from '../types/game';
import { 
  INITIAL_RESOURCES, 
  INITIAL_BUILDINGS, 
  INITIAL_COURSES, 
  INITIAL_DUNGEONS, 
  INITIAL_TEACHERS,
  generateStudentName, 
  getRandomMagicType,
  generateTraits,
  generatePotential,
  calculateCourseSpeed,
  checkPrerequisites,
  getActiveSynergies,
  calculateSynergyBonus,
  calculateBattleStars,
  calculateDungeonRewards,
  calculateSweepRewards,
  canSweep,
  INITIAL_STUDENT_MORALE,
  INITIAL_STUDENT_STAMINA,
  clamp,
  calculateFoodConsumption,
  calculateMoraleEfficiencyMultiplier,
  calculateStaminaEfficiencyMultiplier,
  calculateDailyMoraleChange,
  calculateDailyStaminaChange,
  shouldStudentLeave,
  calculateDailyIncome,
  getMoraleLabel,
  getStaminaLabel,
  rollQuality,
  getPityThreshold,
  getQualityOrder,
  getRecruitQualityBonus,
  getProbabilities,
  computeAdjustedProbabilities,
  getGuaranteedQuality,
  calculateMagicTypeMatchBonus,
  calculateTeacherBonus,
  calculateBuildingMagicBonus,
  calculateCourseBenefit,
  calculateEnhancedSkillDamage,
  formatBenefitBreakdown,
  calculateHpEfficiencyMultiplier,
  calculateDailyHpRecovery,
  calculateHealCost,
  initializeStudentHp,
  recalculateStudentMaxHp,
} from '../data/gameData';
import type { DailyLog, DailyEvent } from '../types/game';
import { migrateSave, loadAndMigrateSave, exportSaveData, importSaveData, hasBackup, restoreBackup, getBackupTime, createBackup } from '../data/saveMigration';

type GameAction =
  | { type: 'ADD_RESOURCE'; resource: Partial<Resource> }
  | { type: 'SPEND_RESOURCE'; resource: Partial<Resource> }
  | { type: 'UPGRADE_BUILDING'; buildingId: string }
  | { type: 'ADD_STUDENT'; student: StudentType }
  | { type: 'REMOVE_STUDENT'; studentId: string }
  | { type: 'UPDATE_STUDENT'; student: StudentType }
  | { type: 'ASSIGN_STUDENT_TO_BUILDING'; studentId: string; buildingId: string | null }
  | { type: 'ASSIGN_STUDENT_TO_COURSE'; studentId: string; courseId: string | null; courseDuration: number }
  | { type: 'ASSIGN_STUDENT_TO_REST'; studentId: string }
  | { type: 'COMPLETE_COURSE'; studentId: string; courseId: string }
  | { type: 'RECRUIT_STUDENT'; result: GachaResult }
  | { type: 'UPDATE_PITY_COUNTER'; quality: StudentQuality; value: number }
  | { type: 'RESET_PITY_COUNTER'; quality: StudentQuality }
  | { type: 'QUEUE_COURSE'; studentId: string; courseId: string; day: number }
  | { type: 'REMOVE_FROM_QUEUE'; studentId: string; queueIndex: number }
  | { type: 'REORDER_QUEUE'; studentId: string; fromIndex: number; toIndex: number }
  | { type: 'START_NEXT_COURSE'; studentId: string }
  | { type: 'START_DUNGEON'; dungeonId: string }
  | { type: 'COMPLETE_DUNGEON'; dungeonId: string; stars: number; survivingMembers: number; totalMembers: number; averageHpPercent: number; totalTurns: number; team: string[]; studentHpMap: Record<string, { current: number; max: number }> }
  | { type: 'SWEEP_DUNGEON'; dungeonId: string }
  | { type: 'SAVE_BEST_TEAM'; dungeonId: string; team: string[] }
  | { type: 'UNLOCK_SWEEP'; dungeonId: string }
  | { type: 'HEAL_STUDENT'; studentId: string; hpAmount: number; cost: Resource }
  | { type: 'HEAL_ALL_STUDENTS' }
  | { type: 'NEXT_DAY' }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

const MAX_STUDENT_CAPACITY = 20;

const initialState: GameState = {
  saveVersion: CURRENT_SAVE_VERSION,
  resources: INITIAL_RESOURCES,
  buildings: INITIAL_BUILDINGS,
  students: [],
  courses: INITIAL_COURSES,
  dungeons: INITIAL_DUNGEONS,
  teachers: INITIAL_TEACHERS,
  day: 1,
  maxStudents: MAX_STUDENT_CAPACITY,
  currentStudentId: 1,
  currentDungeonId: 100,
  gameStarted: false,
  dailyLogs: [],
  pityCounters: {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  },
  gachaHistory: {
    results: [],
    totalDraws: 0,
    qualityCounts: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: {
          gold: state.resources.gold + (action.resource.gold || 0),
          mana: state.resources.mana + (action.resource.mana || 0),
          food: state.resources.food + (action.resource.food || 0),
          reputation: state.resources.reputation + (action.resource.reputation || 0),
        },
      };

    case 'SPEND_RESOURCE': {
      const newResources = {
        gold: state.resources.gold - (action.resource.gold || 0),
        mana: state.resources.mana - (action.resource.mana || 0),
        food: state.resources.food - (action.resource.food || 0),
        reputation: state.resources.reputation - (action.resource.reputation || 0),
      };
      if (newResources.gold < 0 || newResources.mana < 0 || newResources.food < 0 || newResources.reputation < 0) {
        return state;
      }
      return { ...state, resources: newResources };
    }

    case 'UPGRADE_BUILDING': {
      const building = state.buildings.find(b => b.id === action.buildingId);
      if (!building || building.level >= building.maxLevel) return state;
      
      const prereqCheck = checkPrerequisites(building, state.buildings);
      if (!prereqCheck.met) return state;
      
      const cost = {
        gold: building.cost.gold * building.level,
        mana: building.cost.mana * building.level,
        food: building.cost.food * building.level,
        reputation: building.cost.reputation * building.level,
      };
      if (state.resources.gold < cost.gold || state.resources.mana < cost.mana ||
          state.resources.food < cost.food || state.resources.reputation < cost.reputation) {
        return state;
      }
      return {
        ...state,
        resources: {
          gold: state.resources.gold - cost.gold,
          mana: state.resources.mana - cost.mana,
          food: state.resources.food - cost.food,
          reputation: state.resources.reputation - cost.reputation,
        },
        buildings: state.buildings.map(b =>
          b.id === action.buildingId ? { ...b, level: b.level + 1 } : b
        ),
      };
    }

    case 'ADD_STUDENT':
      if (state.students.length >= state.maxStudents) return state;
      return {
        ...state,
        students: [...state.students, action.student],
        currentStudentId: state.currentStudentId + 1,
      };

    case 'RECRUIT_STUDENT': {
      const { result } = action;
      const guaranteedQuality = getGuaranteedQuality(result.ticketQuality);
      const guaranteedOrder = getQualityOrder(guaranteedQuality);
      const resultQualityOrder = getQualityOrder(result.resultQuality);

      const newPityCounters = { ...state.pityCounters };

      if (result.isPityTriggered || resultQualityOrder >= guaranteedOrder) {
        newPityCounters[result.ticketQuality] = 0;
      } else {
        newPityCounters[result.ticketQuality] += 1;
      }

      const newHistoryResults = [...state.gachaHistory.results, result];
      if (newHistoryResults.length > 100) {
        newHistoryResults.shift();
      }

      return {
        ...state,
        pityCounters: newPityCounters,
        gachaHistory: {
          results: newHistoryResults,
          totalDraws: state.gachaHistory.totalDraws + 1,
          qualityCounts: {
            ...state.gachaHistory.qualityCounts,
            [result.resultQuality]: state.gachaHistory.qualityCounts[result.resultQuality] + 1,
          },
        },
      };
    }

    case 'UPDATE_PITY_COUNTER': {
      return {
        ...state,
        pityCounters: {
          ...state.pityCounters,
          [action.quality]: action.value,
        },
      };
    }

    case 'RESET_PITY_COUNTER': {
      return {
        ...state,
        pityCounters: {
          ...state.pityCounters,
          [action.quality]: 0,
        },
      };
    }

    case 'REMOVE_STUDENT':
      return {
        ...state,
        students: state.students.filter(s => s.id !== action.studentId),
      };

    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s => s.id === action.student.id ? action.student : s),
      };

    case 'ASSIGN_STUDENT_TO_BUILDING':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.studentId ? { ...s, assignedBuilding: action.buildingId, assignedCourse: null, status: 'idle' as const, courseProgress: 0, courseDaysRemaining: 0 } : s
        ),
      };

    case 'ASSIGN_STUDENT_TO_COURSE':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.studentId ? { ...s, assignedCourse: action.courseId, status: 'studying' as const, courseProgress: 0, courseDaysRemaining: action.courseDuration } : s
        ),
      };

    case 'ASSIGN_STUDENT_TO_REST':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.studentId ? { ...s, assignedBuilding: null, assignedCourse: null, status: 'resting' as const, courseProgress: 0, courseDaysRemaining: 0 } : s
        ),
      };

    case 'COMPLETE_COURSE': {
      const course = state.courses.find(c => c.id === action.courseId);
      if (!course) return state;
      
      const student = state.students.find(s => s.id === action.studentId);
      const todayEvents: DailyEvent[] = [];
      
      if (student && course.effect.type === 'exp_gain') {
        const breakdown = calculateCourseBenefit(
          course.effect.value,
          student,
          course,
          state.buildings,
          state.teachers
        );
        
        const benefitText = formatBenefitBreakdown(breakdown);
        todayEvents.push({
          type: 'course_complete',
          message: `🎓 ${student.name} 完成了「${course.name}」！获得${breakdown.totalExp}经验。${benefitText}`,
          studentId: action.studentId,
          studentName: student.name,
          courseId: course.id,
          courseName: course.name,
          value: breakdown.totalExp,
        });
      } else if (student) {
        todayEvents.push({
          type: 'course_complete',
          message: `🎓 ${student.name} 完成了「${course.name}」！`,
          studentId: action.studentId,
          studentName: student.name,
          courseId: course.id,
          courseName: course.name,
        });
      }
      
      let newState = {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.studentId) {
            let newExp = s.exp;
            let newLevel = s.level;
            let newSkills = s.skills;
            let leveledUp = false;
            let skillUnlocked = false;
            const newGrowthRecords = [...s.growthRecords];
            let expGained = 0;
            
            if (course.effect.type === 'exp_gain') {
              const breakdown = calculateCourseBenefit(
                course.effect.value,
                s,
                course,
                state.buildings,
                state.teachers
              );
              expGained = breakdown.totalExp;
              
              newExp += expGained;
              const oldLevel = s.level;
              while (newExp >= newLevel * 100) {
                newExp -= newLevel * 100;
                newLevel++;
                leveledUp = true;
              }
              if (leveledUp) {
                newGrowthRecords.push({
                  id: `growth_${s.id}_level_${Date.now()}`,
                  type: 'level_up',
                  day: state.day,
                  description: `等级提升: Lv.${oldLevel} → Lv.${newLevel}`,
                  details: { oldLevel, newLevel },
                });
              }
            } else if (course.effect.type === 'skill_unlock' && course.magicType) {
              const skillId = `skill_${s.id}_${course.magicType}`;
              if (!newSkills.find(sk => sk.id === skillId)) {
                const baseDamage = 20 + s.level * 5;
                const finalDamage = calculateEnhancedSkillDamage(baseDamage, s, course, state.teachers);
                const newSkill = {
                  id: skillId,
                  name: `${course.magicType}魔法`,
                  type: course.magicType,
                  damage: finalDamage,
                  cost: 10,
                  description: `${course.magicType}系基础魔法`,
                };
                newSkills = [...newSkills, newSkill];
                skillUnlocked = true;
                
                const skillBonusText: string[] = [];
                if (s.magicType === course.magicType) {
                  skillBonusText.push('系别匹配+15%');
                }
                const teacherResult = calculateTeacherBonus(course, state.teachers, course.magicType);
                if (teacherResult.teacher) {
                  skillBonusText.push(`${teacherResult.teacher.name}+${Math.round(teacherResult.skillBonus * 100)}%`);
                }
                
                newGrowthRecords.push({
                  id: `growth_${s.id}_skill_${Date.now()}`,
                  type: 'skill_unlock',
                  day: state.day,
                  description: `解锁新技能: ${newSkill.name} (伤害:${finalDamage})${skillBonusText.length > 0 ? ` [${skillBonusText.join(' ')}]` : ''}`,
                  details: { skillName: newSkill.name, damage: finalDamage, bonuses: skillBonusText },
                });
              }
            }

            const courseHistoryEntry = {
              id: `course_hist_${s.id}_${Date.now()}`,
              courseId: course.id,
              courseName: course.name,
              startedAt: state.day - course.duration,
              completedAt: state.day,
              expGained,
              leveledUp,
              skillUnlocked,
            };
            
            return {
              ...s,
              status: 'idle' as const,
              assignedCourse: null,
              courseProgress: 0,
              courseDaysRemaining: 0,
              exp: newExp,
              level: newLevel,
              skills: newSkills,
              growthRecords: newGrowthRecords,
              courseHistory: [...s.courseHistory, courseHistoryEntry],
            };
          }
          return s;
        }),
      };
      
      const updatedStudent = newState.students.find(s => s.id === action.studentId);
      if (updatedStudent && updatedStudent.courseQueue && updatedStudent.courseQueue.length > 0) {
        const nextQueued = updatedStudent.courseQueue[0];
        const nextCourse = newState.courses.find(c => c.id === nextQueued.courseId);
        if (nextCourse) {
          const canAffordNext = newState.resources.gold >= nextCourse.cost.gold &&
            newState.resources.mana >= nextCourse.cost.mana &&
            newState.resources.food >= nextCourse.cost.food &&
            newState.resources.reputation >= nextCourse.cost.reputation;
          
          if (canAffordNext && nextCourse.requiredLevel <= updatedStudent.level) {
            newState = {
              ...newState,
              resources: {
                gold: newState.resources.gold - nextCourse.cost.gold,
                mana: newState.resources.mana - nextCourse.cost.mana,
                food: newState.resources.food - nextCourse.cost.food,
                reputation: newState.resources.reputation - nextCourse.cost.reputation,
              },
              students: newState.students.map(s => {
                if (s.id === action.studentId) {
                  return {
                    ...s,
                    assignedCourse: nextCourse.id,
                    status: 'studying' as const,
                    courseProgress: 0,
                    courseDaysRemaining: nextCourse.duration,
                    courseQueue: s.courseQueue.slice(1),
                  };
                }
                return s;
              }),
            };
            todayEvents.push({
              type: 'course_started',
              message: `📚 ${updatedStudent.name} 自动开始「${nextCourse.name}」！`,
              studentId: updatedStudent.id,
              studentName: updatedStudent.name,
              courseId: nextCourse.id,
              courseName: nextCourse.name,
            });
          } else if (!canAffordNext) {
            todayEvents.push({
              type: 'warning',
              message: `⚠️ 资源不足，无法自动开始「${nextCourse.name}」，已从队列移除`,
              studentId: updatedStudent.id,
              studentName: updatedStudent.name,
              courseId: nextCourse.id,
              courseName: nextCourse.name,
            });
            newState = {
              ...newState,
              students: newState.students.map(s => {
                if (s.id === action.studentId) {
                  return { ...s, courseQueue: s.courseQueue.slice(1) };
                }
                return s;
              }),
            };
          } else if (nextCourse.requiredLevel > updatedStudent.level) {
            todayEvents.push({
              type: 'warning',
              message: `⚠️ ${updatedStudent.name} 等级不足(Lv.${updatedStudent.level}/Lv.${nextCourse.requiredLevel})，无法开始「${nextCourse.name}」，已从队列移除`,
              studentId: updatedStudent.id,
              studentName: updatedStudent.name,
              courseId: nextCourse.id,
              courseName: nextCourse.name,
            });
            newState = {
              ...newState,
              students: newState.students.map(s => {
                if (s.id === action.studentId) {
                  return { ...s, courseQueue: s.courseQueue.slice(1) };
                }
                return s;
              }),
            };
          }
        }
      } else if (updatedStudent && (!updatedStudent.courseQueue || updatedStudent.courseQueue.length === 0)) {
        todayEvents.push({
          type: 'queue_empty',
          message: `📭 ${updatedStudent.name} 的学习队列为空`,
          studentId: updatedStudent.id,
          studentName: updatedStudent.name,
        });
      }
      
      const dailyLog: DailyLog = {
        day: state.day,
        events: todayEvents,
      };
      
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      return {
        ...newState,
        dailyLogs: recentLogs,
      };
    }

    case 'QUEUE_COURSE': {
      const course = state.courses.find(c => c.id === action.courseId);
      const student = state.students.find(s => s.id === action.studentId);
      if (!course || !student) return state;
      
      if (student.assignedCourse === action.courseId) return state;
      if (student.courseQueue.some(q => q.courseId === action.courseId)) return state;
      if (course.requiredLevel > student.level) return state;
      
      const canAffordCourse = state.resources.gold >= course.cost.gold &&
        state.resources.mana >= course.cost.mana &&
        state.resources.food >= course.cost.food &&
        state.resources.reputation >= course.cost.reputation;
      if (!canAffordCourse) return state;
      
      const queueEvent: DailyEvent = {
        type: 'course_queued',
        message: `📋 ${student.name} 预约了「${course.name}」`,
        studentId: student.id,
        studentName: student.name,
        courseId: course.id,
        courseName: course.name,
      };
      
      const dailyLog: DailyLog = {
        day: state.day,
        events: [queueEvent],
      };
      
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.studentId) {
            return {
              ...s,
              courseQueue: [...s.courseQueue, { courseId: action.courseId, addedAt: action.day }],
            };
          }
          return s;
        }),
        dailyLogs: recentLogs,
      };
    }

    case 'REMOVE_FROM_QUEUE': {
      const student = state.students.find(s => s.id === action.studentId);
      if (!student) return state;
      
      const removedCourseId = student.courseQueue[action.queueIndex]?.courseId;
      const removedCourse = removedCourseId ? state.courses.find(c => c.id === removedCourseId) : null;
      
      const newQueue = [...student.courseQueue];
      newQueue.splice(action.queueIndex, 1);
      
      if (removedCourse) {
        const removeEvent: DailyEvent = {
          type: 'course_conflict',
          message: `🗑️ ${student.name} 取消了「${removedCourse.name}」的预约`,
          studentId: student.id,
          studentName: student.name,
          courseId: removedCourse.id,
          courseName: removedCourse.name,
        };
        
        const dailyLog: DailyLog = {
          day: state.day,
          events: [removeEvent],
        };
        
        const recentLogs = state.dailyLogs.slice(-29);
        recentLogs.push(dailyLog);
        
        return {
          ...state,
          students: state.students.map(s => {
            if (s.id === action.studentId) {
              return { ...s, courseQueue: newQueue };
            }
            return s;
          }),
          dailyLogs: recentLogs,
        };
      }
      
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.studentId) {
            return { ...s, courseQueue: newQueue };
          }
          return s;
        }),
      };
    }

    case 'REORDER_QUEUE': {
      const student = state.students.find(s => s.id === action.studentId);
      if (!student) return state;
      
      const newQueue = [...student.courseQueue];
      const [removed] = newQueue.splice(action.fromIndex, 1);
      newQueue.splice(action.toIndex, 0, removed);
      
      const movedCourse = removed ? state.courses.find(c => c.id === removed.courseId) : null;
      if (movedCourse) {
        const reorderEvent: DailyEvent = {
          type: 'course_queued',
          message: `📋 ${student.name} 调整了「${movedCourse.name}」的学习顺序`,
          studentId: student.id,
          studentName: student.name,
          courseId: movedCourse.id,
          courseName: movedCourse.name,
        };
        
        const dailyLog: DailyLog = {
          day: state.day,
          events: [reorderEvent],
        };
        
        const recentLogs = state.dailyLogs.slice(-29);
        recentLogs.push(dailyLog);
        
        return {
          ...state,
          students: state.students.map(s => {
            if (s.id === action.studentId) {
              return { ...s, courseQueue: newQueue };
            }
            return s;
          }),
          dailyLogs: recentLogs,
        };
      }
      
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.studentId) {
            return { ...s, courseQueue: newQueue };
          }
          return s;
        }),
      };
    }

    case 'START_NEXT_COURSE': {
      const student = state.students.find(s => s.id === action.studentId);
      if (!student || !student.courseQueue || student.courseQueue.length === 0) return state;
      if (student.status !== 'idle') return state;
      
      const nextQueued = student.courseQueue[0];
      const nextCourse = state.courses.find(c => c.id === nextQueued.courseId);
      if (!nextCourse) return state;
      if (state.resources.gold < nextCourse.cost.gold ||
          state.resources.mana < nextCourse.cost.mana ||
          state.resources.food < nextCourse.cost.food ||
          state.resources.reputation < nextCourse.cost.reputation) {
        return state;
      }
      if (nextCourse.requiredLevel > student.level) return state;
      
      const startEvent: DailyEvent = {
        type: 'course_started',
        message: `📚 ${student.name} 开始「${nextCourse.name}」！`,
        studentId: student.id,
        studentName: student.name,
        courseId: nextCourse.id,
        courseName: nextCourse.name,
      };
      
      const dailyLog: DailyLog = {
        day: state.day,
        events: [startEvent],
      };
      
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      return {
        ...state,
        resources: {
          gold: state.resources.gold - nextCourse.cost.gold,
          mana: state.resources.mana - nextCourse.cost.mana,
          food: state.resources.food - nextCourse.cost.food,
          reputation: state.resources.reputation - nextCourse.cost.reputation,
        },
        students: state.students.map(s => {
          if (s.id === action.studentId) {
            return {
              ...s,
              assignedCourse: nextCourse.id,
              status: 'studying' as const,
              courseProgress: 0,
              courseDaysRemaining: nextCourse.duration,
              courseQueue: s.courseQueue.slice(1),
            };
          }
          return s;
        }),
        dailyLogs: recentLogs,
      };
    }

    case 'COMPLETE_DUNGEON': {
      const dungeon = state.dungeons.find(d => d.id === action.dungeonId);
      if (!dungeon) return state;

      const isFirstClear = !dungeon.firstCleared;
      const rewards = action.stars > 0 ? calculateDungeonRewards(dungeon, action.stars, isFirstClear) : { gold: 0, mana: 0, food: 0, reputation: 0 };
      const victory = action.stars > 0;
      const battleEvents: DailyEvent[] = [];

      const updatedStudents = state.students.map(s => {
        if (!action.team.includes(s.id)) return s;

        let staminaDelta = -dungeon.staminaCost;
        let moraleDelta: number;

        if (action.stars <= 0) {
          moraleDelta = -15;
        } else if (action.stars === 1) {
          moraleDelta = 0;
        } else if (action.stars === 2) {
          moraleDelta = 5;
        } else {
          moraleDelta = 15;
        }

        const hpData = action.studentHpMap[s.id];
        let newCurrentHp = s.currentHp;
        let newMaxHp = s.maxHp;
        
        if (hpData) {
          newMaxHp = hpData.max;
          newCurrentHp = Math.max(0, hpData.current);
          
          const hpPercent = newMaxHp > 0 ? newCurrentHp / newMaxHp : 0;
          if (hpPercent < 0.5) {
            battleEvents.push({
              type: 'battle_injury',
              message: `🩹 ${s.name} 在战斗中受伤，HP: ${newCurrentHp}/${newMaxHp} (${Math.round(hpPercent * 100)}%)`,
              studentId: s.id,
              studentName: s.name,
              value: newCurrentHp,
            });
            moraleDelta -= 5;
            staminaDelta -= 5;
          }
          
          if (newCurrentHp <= 0) {
            moraleDelta -= 10;
            staminaDelta -= 15;
            battleEvents.push({
              type: 'battle_injury',
              message: `💔 ${s.name} 在战斗中倒下了！需要治疗恢复`,
              studentId: s.id,
              studentName: s.name,
            });
          }
        }

        if (action.averageHpPercent < 0.3) {
          moraleDelta -= 5;
          staminaDelta -= 10;
        }

        const dungeonEntry = {
          id: `dungeon_hist_${s.id}_${Date.now()}`,
          dungeonId: dungeon.id,
          dungeonName: dungeon.name,
          challengedAt: state.day,
          victory,
          stars: action.stars,
          survivingMembers: action.survivingMembers,
          totalMembers: action.totalMembers,
          turns: action.totalTurns,
          rewards: victory ? rewards : {},
          isFirstClear,
        };

        return {
          ...s,
          currentHp: newCurrentHp,
          maxHp: newMaxHp,
          morale: clamp(s.morale + moraleDelta, 0, 100),
          stamina: clamp(s.stamina + staminaDelta, 0, 100),
          status: 'idle' as const,
          dungeonHistory: [...s.dungeonHistory, dungeonEntry],
        };
      });

      const recentLogs = state.dailyLogs.slice(-29);
      if (battleEvents.length > 0) {
        recentLogs.push({ day: state.day, events: battleEvents });
      }

      if (action.stars <= 0) {
        return {
          ...state,
          students: updatedStudents,
          dailyLogs: recentLogs,
          dungeons: state.dungeons.map(d =>
            d.id === action.dungeonId ? {
              ...d,
              clearedCount: d.clearedCount + 1,
            } : d
          ),
        };
      }
      
      const newBestStars = Math.max(dungeon.bestStars, action.stars);
      const shouldUpdateTeam = action.stars > dungeon.bestStars;
      const newSweepUnlocked = newBestStars >= 3;
      
      return {
        ...state,
        students: updatedStudents,
        dailyLogs: recentLogs,
        resources: {
          gold: state.resources.gold + rewards.gold,
          mana: state.resources.mana + rewards.mana,
          food: state.resources.food + rewards.food,
          reputation: state.resources.reputation + rewards.reputation,
        },
        dungeons: state.dungeons.map(d =>
          d.id === action.dungeonId ? {
            ...d,
            stars: action.stars,
            bestStars: newBestStars,
            firstCleared: true,
            clearedCount: d.clearedCount + 1,
            bestTeam: shouldUpdateTeam ? action.team : d.bestTeam,
            sweepUnlocked: newSweepUnlocked,
          } : d
        ),
      };
    }

    case 'SWEEP_DUNGEON': {
      const dungeon = state.dungeons.find(d => d.id === action.dungeonId);
      if (!dungeon || !canSweep(dungeon)) return state;
      
      const rewards = calculateSweepRewards(dungeon);
      const teamIds = dungeon.bestTeam;

      const updatedStudents = state.students.map(s => {
        if (!teamIds.includes(s.id)) return s;
        const staminaDelta = -Math.ceil(dungeon.staminaCost * 0.5);
        const moraleDelta = 3;
        return {
          ...s,
          morale: clamp(s.morale + moraleDelta, 0, 100),
          stamina: clamp(s.stamina + staminaDelta, 0, 100),
        };
      });
      
      return {
        ...state,
        students: updatedStudents,
        resources: {
          gold: state.resources.gold + rewards.gold,
          mana: state.resources.mana + rewards.mana,
          food: state.resources.food + rewards.food,
          reputation: state.resources.reputation + rewards.reputation,
        },
        dungeons: state.dungeons.map(d =>
          d.id === action.dungeonId ? {
            ...d,
            clearedCount: d.clearedCount + 1,
            firstCleared: true,
            bestStars: d.bestStars,
            sweepUnlocked: d.bestStars >= 3,
          } : d
        ),
      };
    }

    case 'SAVE_BEST_TEAM': {
      return {
        ...state,
        dungeons: state.dungeons.map(d =>
          d.id === action.dungeonId ? {
            ...d,
            bestTeam: action.team,
          } : d
        ),
      };
    }

    case 'UNLOCK_SWEEP': {
      return {
        ...state,
        dungeons: state.dungeons.map(d =>
          d.id === action.dungeonId ? {
            ...d,
            sweepUnlocked: true,
          } : d
        ),
      };
    }

    case 'HEAL_STUDENT': {
      const student = state.students.find(s => s.id === action.studentId);
      if (!student) return state;
      if (student.currentHp >= student.maxHp) return state;
      
      if (state.resources.gold < action.cost.gold ||
          state.resources.mana < action.cost.mana ||
          state.resources.food < action.cost.food ||
          state.resources.reputation < action.cost.reputation) {
        return state;
      }

      const newHp = Math.min(student.currentHp + action.hpAmount, student.maxHp);
      const actualHealed = newHp - student.currentHp;
      const actualCost = calculateHealCost(actualHealed);

      const healEvent: DailyEvent = {
        type: 'hp_heal',
        message: `💚 ${student.name} 接受治疗，恢复 ${actualHealed} HP (${newHp}/${student.maxHp})`,
        studentId: student.id,
        studentName: student.name,
        value: actualHealed,
      };

      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push({ day: state.day, events: [healEvent] });

      return {
        ...state,
        resources: {
          gold: state.resources.gold - actualCost.gold,
          mana: state.resources.mana - actualCost.mana,
          food: state.resources.food - actualCost.food,
          reputation: state.resources.reputation - actualCost.reputation,
        },
        students: state.students.map(s =>
          s.id === action.studentId ? { ...s, currentHp: newHp } : s
        ),
        dailyLogs: recentLogs,
      };
    }

    case 'HEAL_ALL_STUDENTS': {
      const injuredStudents = state.students.filter(s => s.currentHp < s.maxHp);
      if (injuredStudents.length === 0) return state;

      let totalGoldCost = 0;
      let totalManaCost = 0;
      let totalFoodCost = 0;
      const healEvents: DailyEvent[] = [];

      const updatedStudents = state.students.map(s => {
        if (s.currentHp >= s.maxHp) return s;
        const hpToHeal = s.maxHp - s.currentHp;
        const cost = calculateHealCost(hpToHeal);
        totalGoldCost += cost.gold;
        totalManaCost += cost.mana;
        totalFoodCost += cost.food;
        
        healEvents.push({
          type: 'hp_heal',
          message: `💚 ${s.name} 恢复 ${hpToHeal} HP，已满血`,
          studentId: s.id,
          studentName: s.name,
          value: hpToHeal,
        });
        
        return { ...s, currentHp: s.maxHp };
      });

      if (state.resources.gold < totalGoldCost ||
          state.resources.mana < totalManaCost ||
          state.resources.food < totalFoodCost) {
        return state;
      }

      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push({ day: state.day, events: healEvents });

      return {
        ...state,
        resources: {
          gold: state.resources.gold - totalGoldCost,
          mana: state.resources.mana - totalManaCost,
          food: state.resources.food - totalFoodCost,
          reputation: state.resources.reputation,
        },
        students: updatedStudents,
        dailyLogs: recentLogs,
      };
    }

    case 'NEXT_DAY': {
      const todayEvents: DailyEvent[] = [];
      const libraryLevel = state.buildings.find(b => b.id === 'library')?.level || 0;
      const dormitoryLevel = state.buildings.find(b => b.id === 'dormitory')?.level || 0;
      const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
      const efficiencyBonus = calculateSynergyBonus(state.buildings, 'efficiency');
      const baseExpMultiplier = 1 + libraryLevel * 0.1 + efficiencyBonus * 0.01;

      const dailyIncome = calculateDailyIncome(state.buildings);
      todayEvents.push({
        type: 'income',
        message: `每日产出: +${dailyIncome.gold}金币, +${dailyIncome.mana}魔力, +${dailyIncome.food}食物, +${dailyIncome.reputation}声望`,
      });

      const studentCount = state.students.length;
      const foodNeeded = calculateFoodConsumption(studentCount);
      const hasEnoughFood = state.resources.food + dailyIncome.food >= foodNeeded;
      const actualFoodConsumed = Math.min(foodNeeded, state.resources.food + dailyIncome.food);

      if (!hasEnoughFood) {
        const shortage = foodNeeded - actualFoodConsumed;
        todayEvents.push({
          type: 'food_shortage',
          message: `⚠️ 食物短缺！需要${foodNeeded}，仅有${state.resources.food + dailyIncome.food}，缺${shortage}份`,
          value: shortage,
        });
      } else {
        todayEvents.push({
          type: 'food_consumed',
          message: `消耗${actualFoodConsumed}份食物供养${studentCount}名学员`,
          value: actualFoodConsumed,
        });
      }

      const lowMoraleTracker: Record<string, number> = {};
      state.students.forEach(s => {
        if (s.morale < 20) {
          lowMoraleTracker[s.id] = (lowMoraleTracker[s.id] || 0) + 1;
        }
      });

      const completedCourses: { studentId: string; studentName: string; courseName: string }[] = [];
      const leftStudents: { id: string; name: string }[] = [];

      const workingResources = {
        gold: state.resources.gold + dailyIncome.gold,
        mana: state.resources.mana + dailyIncome.mana,
        food: state.resources.food + dailyIncome.food - actualFoodConsumed,
        reputation: state.resources.reputation + dailyIncome.reputation,
      };

      const updatedStudents: StudentType[] = [];
      for (const student of state.students) {
        const moraleChange = calculateDailyMoraleChange(student, hasEnoughFood, dormitoryLevel);
        const staminaChange = calculateDailyStaminaChange(student, diningHallLevel);
        const hpRecovery = calculateDailyHpRecovery(student, dormitoryLevel);
        const newMorale = clamp(student.morale + moraleChange, 0, 100);
        const newStamina = clamp(student.stamina + staminaChange, 0, 100);
        let newCurrentHp = student.maxHp > 0 ? Math.min(student.currentHp + hpRecovery, student.maxHp) : student.currentHp;

        if (hpRecovery > 0) {
          todayEvents.push({
            type: 'hp_natural_recovery',
            message: `💚 ${student.name} 自然恢复 ${hpRecovery} HP (${newCurrentHp}/${student.maxHp})`,
            value: hpRecovery,
            studentId: student.id,
            studentName: student.name,
          });
        }

        if (moraleChange !== 0 && Math.abs(moraleChange) >= 10) {
          todayEvents.push({
            type: 'morale_change',
            message: `${student.name} 士气${moraleChange > 0 ? '+' : ''}${moraleChange}`,
            value: moraleChange,
            studentId: student.id,
            studentName: student.name,
          });
        }

        const consecutiveLowDays = lowMoraleTracker[student.id] || 0;
        if (shouldStudentLeave(newMorale, consecutiveLowDays)) {
          leftStudents.push({ id: student.id, name: student.name });
          todayEvents.push({
            type: 'student_left',
            message: `😢 ${student.name} 因士气过低离开了学院！`,
            studentId: student.id,
            studentName: student.name,
          });
          continue;
        }

        if (newCurrentHp <= 0) {
          updatedStudents.push({
            ...student,
            currentHp: Math.max(1, newCurrentHp),
            morale: newMorale,
            stamina: newStamina,
            status: 'resting' as const,
          });
          todayEvents.push({
            type: 'warning',
            message: `⚠️ ${student.name} HP耗尽，强制进入休息状态恢复`,
            studentId: student.id,
            studentName: student.name,
          });
          continue;
        }

        if (student.status === 'resting') {
          const hpFull = newCurrentHp >= student.maxHp;
          if (newMorale >= 70 && newStamina >= 80 && hpFull) {
            updatedStudents.push({
              ...student,
              currentHp: newCurrentHp,
              morale: newMorale,
              stamina: newStamina,
              status: 'idle' as const,
            });
            todayEvents.push({
              type: 'rest',
              message: `${student.name} 休息完毕，状态全满，精力充沛！`,
              studentId: student.id,
              studentName: student.name,
            });
          } else {
            updatedStudents.push({
              ...student,
              currentHp: newCurrentHp,
              morale: newMorale,
              stamina: newStamina,
            });
          }
          continue;
        }

        if (student.assignedCourse && student.status === 'studying') {
          const course = state.courses.find(c => c.id === student.assignedCourse);
          if (!course) {
            updatedStudents.push({ ...student, currentHp: newCurrentHp, morale: newMorale, stamina: newStamina });
            continue;
          }

          const moraleMult = calculateMoraleEfficiencyMultiplier(newMorale);
          const staminaMult = calculateStaminaEfficiencyMultiplier(newStamina);
          const hpMult = calculateHpEfficiencyMultiplier(newCurrentHp, student.maxHp);
          const efficiencyMult = moraleMult * staminaMult * hpMult;
          
          if (hpMult < 1) {
            todayEvents.push({
              type: 'warning',
              message: `🩹 ${student.name} 受伤导致学习效率 ×${hpMult.toFixed(2)}`,
              studentId: student.id,
              studentName: student.name,
              value: Math.round(hpMult * 100),
            });
          }

          const baseCourseSpeed = calculateCourseSpeed(1, student);
          const courseSpeed = baseCourseSpeed * efficiencyMult;
          const newProgress = student.courseProgress + courseSpeed;
          const daysRemaining = student.courseDaysRemaining - courseSpeed;

          const dailyBaseExp = 10 * baseExpMultiplier * efficiencyMult;
          const dailyBreakdown = calculateCourseBenefit(
            dailyBaseExp,
            student,
            course,
            state.buildings,
            state.teachers
          );
          const dailyExp = dailyBreakdown.totalExp;
          let newExp = student.exp + dailyExp;
          let newLevel = student.level;

          while (newExp >= newLevel * 100) {
            newExp -= newLevel * 100;
            newLevel++;
          }

          if (daysRemaining <= 0) {
            const baseFinalExp = course.effect.type === 'exp_gain' ? course.effect.value * efficiencyMult : 0;
            let finalExpGain = 0;
            let finalBreakdown: CourseBenefitBreakdown | null = null;
            
            if (baseFinalExp > 0) {
              const breakdown = calculateCourseBenefit(
                baseFinalExp,
                student,
                course,
                state.buildings,
                state.teachers
              );
              finalBreakdown = breakdown;
              finalExpGain = breakdown.totalExp;
            }
            
            let finalExp = newExp + finalExpGain;
            let finalLevel = newLevel;
            let newSkills = student.skills;
            let newCourseQueue = student.courseQueue;
            let newAssignedCourse: string | null = null;
            let newStatus: StudentType['status'] = 'idle';
            let newCourseDaysRemaining = 0;
            const newCourseProgress = 0;
            const newGrowthRecords = [...student.growthRecords];
            let leveledUp = false;
            let skillUnlocked = false;
            const totalExpGained = finalExpGain;

            const oldLevel = student.level;
            while (finalExp >= finalLevel * 100) {
              finalExp -= finalLevel * 100;
              finalLevel++;
              leveledUp = true;
            }
            if (leveledUp) {
              newGrowthRecords.push({
                id: `growth_${student.id}_level_${Date.now()}`,
                type: 'level_up',
                day: state.day,
                description: `等级提升: Lv.${oldLevel} → Lv.${finalLevel}`,
                details: { oldLevel, newLevel: finalLevel },
              });
            }

            if (course.effect.type === 'skill_unlock' && course.magicType) {
              const skillId = `skill_${student.id}_${course.magicType}`;
              if (!newSkills.find(sk => sk.id === skillId)) {
                const baseDamage = 20 + finalLevel * 5;
                const finalDamage = calculateEnhancedSkillDamage(baseDamage, student, course, state.teachers);
                const newSkill = {
                  id: skillId,
                  name: `${course.magicType}魔法`,
                  type: course.magicType,
                  damage: finalDamage,
                  cost: 10,
                  description: `${course.magicType}系基础魔法`,
                };
                newSkills = [...newSkills, newSkill];
                skillUnlocked = true;
                
                const skillBonusText: string[] = [];
                if (student.magicType === course.magicType) {
                  skillBonusText.push('系别匹配+15%');
                }
                const teacherResult = calculateTeacherBonus(course, state.teachers, course.magicType);
                if (teacherResult.teacher) {
                  skillBonusText.push(`${teacherResult.teacher.name}+${Math.round(teacherResult.skillBonus * 100)}%`);
                }
                
                newGrowthRecords.push({
                  id: `growth_${student.id}_skill_${Date.now()}`,
                  type: 'skill_unlock',
                  day: state.day,
                  description: `解锁新技能: ${newSkill.name} (伤害:${finalDamage})${skillBonusText.length > 0 ? ` [${skillBonusText.join(' ')}]` : ''}`,
                  details: { skillName: newSkill.name, damage: finalDamage, bonuses: skillBonusText },
                });
              }
            }

            const courseHistoryEntry = {
              id: `course_hist_${student.id}_${Date.now()}`,
              courseId: course.id,
              courseName: course.name,
              startedAt: state.day - course.duration,
              completedAt: state.day,
              expGained: totalExpGained,
              leveledUp,
              skillUnlocked,
            };

            completedCourses.push({ studentId: student.id, studentName: student.name, courseName: course.name });
            
            if (finalBreakdown && finalBreakdown.totalExp > 0) {
              const benefitText = formatBenefitBreakdown(finalBreakdown);
              todayEvents.push({
                type: 'course_complete',
                message: `🎓 ${student.name} 完成了「${course.name}」！获得${finalBreakdown.totalExp}经验。${benefitText}`,
                studentId: student.id,
                studentName: student.name,
                courseId: course.id,
                courseName: course.name,
                value: finalBreakdown.totalExp,
              });
            } else {
              todayEvents.push({
                type: 'course_complete',
                message: `🎓 ${student.name} 完成了「${course.name}」！`,
                studentId: student.id,
                studentName: student.name,
                courseId: course.id,
                courseName: course.name,
              });
            }

            if (newCourseQueue.length > 0) {
              const nextQueued = newCourseQueue[0];
              const nextCourse = state.courses.find(c => c.id === nextQueued.courseId);
              if (nextCourse) {
                const canAffordNext = workingResources.gold >= nextCourse.cost.gold &&
                  workingResources.mana >= nextCourse.cost.mana &&
                  workingResources.food >= nextCourse.cost.food &&
                  workingResources.reputation >= nextCourse.cost.reputation;
                
                if (canAffordNext && nextCourse.requiredLevel <= finalLevel) {
                  workingResources.gold -= nextCourse.cost.gold;
                  workingResources.mana -= nextCourse.cost.mana;
                  workingResources.food -= nextCourse.cost.food;
                  workingResources.reputation -= nextCourse.cost.reputation;
                  
                  newAssignedCourse = nextCourse.id;
                  newStatus = 'studying';
                  newCourseDaysRemaining = nextCourse.duration;
                  newCourseQueue = newCourseQueue.slice(1);
                  todayEvents.push({
                    type: 'course_started',
                    message: `📚 ${student.name} 自动开始「${nextCourse.name}」！`,
                    studentId: student.id,
                    studentName: student.name,
                    courseId: nextCourse.id,
                    courseName: nextCourse.name,
                  });
                } else if (!canAffordNext) {
                  todayEvents.push({
                    type: 'warning',
                    message: `⚠️ 资源不足，无法自动开始「${nextCourse.name}」，已从队列移除`,
                    studentId: student.id,
                    studentName: student.name,
                    courseId: nextCourse.id,
                    courseName: nextCourse.name,
                  });
                  newCourseQueue = newCourseQueue.slice(1);
                } else if (nextCourse.requiredLevel > finalLevel) {
                  todayEvents.push({
                    type: 'warning',
                    message: `⚠️ ${student.name} 等级不足(Lv.${finalLevel}/Lv.${nextCourse.requiredLevel})，无法开始「${nextCourse.name}」，已从队列移除`,
                    studentId: student.id,
                    studentName: student.name,
                    courseId: nextCourse.id,
                    courseName: nextCourse.name,
                  });
                  newCourseQueue = newCourseQueue.slice(1);
                }
              }
            }

            let finalMaxHp = student.maxHp;
            let finalCurrentHp = newCurrentHp;
            if (finalLevel > student.level || newSkills.length > student.skills.length) {
              const recalculated = recalculateStudentMaxHp({
                ...student,
                level: finalLevel,
                skills: newSkills,
                maxHp: student.maxHp,
                currentHp: newCurrentHp,
              });
              finalMaxHp = recalculated.maxHp;
              finalCurrentHp = recalculated.currentHp;
            }

            updatedStudents.push({
              ...student,
              status: newStatus,
              assignedCourse: newAssignedCourse,
              courseProgress: newCourseProgress,
              courseDaysRemaining: newCourseDaysRemaining,
              courseQueue: newCourseQueue,
              exp: finalExp,
              level: finalLevel,
              skills: newSkills,
              currentHp: finalCurrentHp,
              maxHp: finalMaxHp,
              morale: newMorale,
              stamina: newStamina,
              growthRecords: newGrowthRecords,
              courseHistory: [...student.courseHistory, courseHistoryEntry],
            });
          } else {
            if (daysRemaining <= 1 && student.courseQueue.length > 0) {
              const nextQueued = student.courseQueue[0];
              const nextCourse = state.courses.find(c => c.id === nextQueued.courseId);
              if (nextCourse) {
                todayEvents.push({
                  type: 'study',
                  message: `⏰ ${student.name} 的「${course.name}」即将完成，下一门「${nextCourse.name}」准备中...`,
                  studentId: student.id,
                  studentName: student.name,
                  courseId: course.id,
                  courseName: course.name,
                });
              }
            }
            let progressingMaxHp = student.maxHp;
            let progressingCurrentHp = newCurrentHp;
            if (newLevel > student.level) {
              const recalculated = recalculateStudentMaxHp({
                ...student,
                level: newLevel,
                maxHp: student.maxHp,
                currentHp: newCurrentHp,
              });
              progressingMaxHp = recalculated.maxHp;
              progressingCurrentHp = recalculated.currentHp;
            }
            updatedStudents.push({
              ...student,
              courseProgress: newProgress,
              courseDaysRemaining: daysRemaining,
              exp: newExp,
              level: newLevel,
              currentHp: progressingCurrentHp,
              maxHp: progressingMaxHp,
              morale: newMorale,
              stamina: newStamina,
            });
          }
        } else if (student.status === 'idle' && student.courseQueue.length > 0) {
          const nextQueued = student.courseQueue[0];
          const nextCourse = state.courses.find(c => c.id === nextQueued.courseId);
          let updatedStudent = { ...student, currentHp: newCurrentHp, morale: newMorale, stamina: newStamina };
          
          if (nextCourse) {
            const canAffordNext = workingResources.gold >= nextCourse.cost.gold &&
              workingResources.mana >= nextCourse.cost.mana &&
              workingResources.food >= nextCourse.cost.food &&
              workingResources.reputation >= nextCourse.cost.reputation;
            
            if (canAffordNext && nextCourse.requiredLevel <= student.level) {
              workingResources.gold -= nextCourse.cost.gold;
              workingResources.mana -= nextCourse.cost.mana;
              workingResources.food -= nextCourse.cost.food;
              workingResources.reputation -= nextCourse.cost.reputation;
              
              updatedStudent = {
                ...updatedStudent,
                assignedCourse: nextCourse.id,
                status: 'studying' as const,
                courseProgress: 0,
                courseDaysRemaining: nextCourse.duration,
                courseQueue: student.courseQueue.slice(1),
              };
              todayEvents.push({
                type: 'course_started',
                message: `📚 ${student.name} 开始「${nextCourse.name}」！`,
                studentId: student.id,
                studentName: student.name,
                courseId: nextCourse.id,
                courseName: nextCourse.name,
              });
            } else if (!canAffordNext) {
              todayEvents.push({
                type: 'warning',
                message: `⚠️ 资源不足，无法开始「${nextCourse.name}」，已从队列移除`,
                studentId: student.id,
                studentName: student.name,
                courseId: nextCourse.id,
                courseName: nextCourse.name,
              });
              updatedStudent = { ...updatedStudent, courseQueue: student.courseQueue.slice(1) };
            } else if (nextCourse.requiredLevel > student.level) {
              todayEvents.push({
                type: 'warning',
                message: `⚠️ ${student.name} 等级不足(Lv.${student.level}/Lv.${nextCourse.requiredLevel})，无法开始「${nextCourse.name}」，已从队列移除`,
                studentId: student.id,
                studentName: student.name,
                courseId: nextCourse.id,
                courseName: nextCourse.name,
              });
              updatedStudent = { ...updatedStudent, courseQueue: student.courseQueue.slice(1) };
            }
          }
          updatedStudents.push(updatedStudent);
        } else {
          updatedStudents.push({
            ...student,
            currentHp: newCurrentHp,
            morale: newMorale,
            stamina: newStamina,
          });
        }
      }

      if (leftStudents.length > 0) {
        workingResources.reputation = Math.max(0, workingResources.reputation - leftStudents.length * 5);
        todayEvents.push({
          type: 'warning',
          message: `共${leftStudents.length}名学员离开，声望-${leftStudents.length * 5}`,
        });
      }

      const finalResources = {
        gold: Math.max(0, workingResources.gold),
        mana: Math.max(0, workingResources.mana),
        food: Math.max(0, workingResources.food),
        reputation: Math.max(0, workingResources.reputation),
      };

      const dailyLog: DailyLog = {
        day: state.day,
        events: todayEvents,
      };

      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        day: state.day + 1,
        students: updatedStudents,
        dailyLogs: recentLogs,
        resources: finalResources,
      };
    }

    case 'LOAD_GAME':
      return {
        ...action.state,
        gameStarted: true,
      };

    case 'RESET_GAME':
      return { ...initialState, gameStarted: true };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  canAfford: (cost: Partial<Resource>) => boolean;
  recruitStudent: (quality: 'common' | 'rare' | 'epic' | 'legendary') => GachaResult | null;
  assignStudentToRest: (studentId: string) => void;
  assignStudentToCourse: (studentId: string, courseId: string) => void;
  queueCourse: (studentId: string, courseId: string) => void;
  removeFromQueue: (studentId: string, queueIndex: number) => void;
  reorderQueue: (studentId: string, fromIndex: number, toIndex: number) => void;
  checkCourseConflict: (studentId: string, courseId: string) => { hasConflict: boolean; reason?: string };
  saveGame: () => void;
  loadGame: () => void;
  exportSave: () => string;
  importSave: (json: string) => boolean;
  restoreFromBackup: () => boolean;
  hasBackupAvailable: boolean;
  backupTime: string | null;
  checkPrerequisites: typeof checkPrerequisites;
  getActiveSynergies: typeof getActiveSynergies;
  calculateSynergyBonus: typeof calculateSynergyBonus;
  calculateBattleStars: typeof calculateBattleStars;
  calculateDungeonRewards: typeof calculateDungeonRewards;
  calculateSweepRewards: typeof calculateSweepRewards;
  canSweep: typeof canSweep;
  calculateDailyIncome: typeof calculateDailyIncome;
  calculateFoodConsumption: typeof calculateFoodConsumption;
  getMoraleLabel: (morale: number) => { label: string; color: string };
  getStaminaLabel: (stamina: number) => { label: string; color: string };
  calculateMoraleEfficiencyMultiplier: typeof calculateMoraleEfficiencyMultiplier;
  calculateStaminaEfficiencyMultiplier: typeof calculateStaminaEfficiencyMultiplier;
  getPityThreshold: typeof getPityThreshold;
  getProbabilities: typeof getProbabilities;
  getRecruitQualityBonus: typeof getRecruitQualityBonus;
  computeAdjustedProbabilities: typeof computeAdjustedProbabilities;
  getGuaranteedQuality: typeof getGuaranteedQuality;
  calculateMagicTypeMatchBonus: typeof calculateMagicTypeMatchBonus;
  calculateTeacherBonus: typeof calculateTeacherBonus;
  calculateBuildingMagicBonus: typeof calculateBuildingMagicBonus;
  calculateCourseBenefit: typeof calculateCourseBenefit;
  calculateEnhancedSkillDamage: typeof calculateEnhancedSkillDamage;
  formatBenefitBreakdown: typeof formatBenefitBreakdown;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [activeTab, setActiveTab] = React.useState<TabType>('academy');

  useEffect(() => {
    const result = loadAndMigrateSave();
    if (result) {
      dispatch({ type: 'LOAD_GAME', state: result.state });
    } else {
      dispatch({ type: 'RESET_GAME' });
    }
  }, []);

  const canAfford = (cost: Partial<Resource>): boolean => {
    return (
      state.resources.gold >= (cost.gold || 0) &&
      state.resources.mana >= (cost.mana || 0) &&
      state.resources.food >= (cost.food || 0) &&
      state.resources.reputation >= (cost.reputation || 0)
    );
  };

  const recruitStudent = (ticketQuality: 'common' | 'rare' | 'epic' | 'legendary'): GachaResult | null => {
    if (state.students.length >= state.maxStudents) return null;

    const pityCount = state.pityCounters[ticketQuality];
    const recruitQualityBonus = getRecruitQualityBonus(state.buildings);
    
    const rollResult = rollQuality(ticketQuality, pityCount, recruitQualityBonus);
    const resultQuality = rollResult.quality;
    const isPityTriggered = rollResult.isPity;

    const levelMap = { common: 1, rare: 2, epic: 3, legendary: 5 };
    const traits = generateTraits(resultQuality);
    const potential = generatePotential(resultQuality);
    const initialLevel = levelMap[resultQuality];
    const magicType = getRandomMagicType();
    const studentName = generateStudentName();
    const studentId = `student_${state.currentStudentId}`;
    
    const baseHp = initializeStudentHp({ level: initialLevel, skills: [] });
    
    const newStudent: StudentType = {
      id: studentId,
      name: studentName,
      level: initialLevel,
      exp: 0,
      magicType: magicType,
      skills: [],
      status: 'idle' as const,
      assignedBuilding: null,
      assignedCourse: null,
      courseProgress: 0,
      courseDaysRemaining: 0,
      courseQueue: [],
      quality: resultQuality,
      potential: potential,
      traits: traits,
      morale: INITIAL_STUDENT_MORALE,
      stamina: INITIAL_STUDENT_STAMINA,
      currentHp: baseHp.currentHp,
      maxHp: baseHp.maxHp,
      recruitmentInfo: {
        recruitedAt: state.day,
        recruitmentQuality: resultQuality,
        initialLevel: initialLevel,
        initialPotential: potential,
      },
      growthRecords: [
        {
          id: `growth_${state.currentStudentId}_recruit`,
          type: 'trait_gain',
          day: state.day,
          description: `加入学院，获得${traits.length}个初始特质`,
          details: { traits: traits.map(t => t.name) },
        },
      ],
      courseHistory: [],
      dungeonHistory: [],
    };

    const gachaResult: GachaResult = {
      id: `gacha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketQuality: ticketQuality,
      resultQuality: resultQuality,
      studentId: studentId,
      studentName: studentName,
      isPityTriggered: isPityTriggered,
      pityCountBefore: pityCount,
      timestamp: Date.now(),
      day: state.day,
      details: {
        potential: potential,
        traits: traits.map(t => t.name),
        magicType: magicType,
        initialLevel: initialLevel,
      },
    };

    dispatch({ type: 'ADD_STUDENT', student: newStudent });
    dispatch({ type: 'RECRUIT_STUDENT', result: gachaResult });

    return gachaResult;
  };

  const assignStudentToRest = (studentId: string) => {
    dispatch({ type: 'ASSIGN_STUDENT_TO_REST', studentId });
  };

  const assignStudentToCourse = (studentId: string, courseId: string) => {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;
    if (!canAfford(course.cost)) return;
    
    const conflict = checkCourseConflict(studentId, courseId);
    if (conflict.hasConflict) return;
    
    dispatch({ type: 'SPEND_RESOURCE', resource: course.cost });
    dispatch({ type: 'ASSIGN_STUDENT_TO_COURSE', studentId, courseId, courseDuration: course.duration });
  };

  const queueCourse = (studentId: string, courseId: string) => {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const conflict = checkCourseConflict(studentId, courseId);
    if (conflict.hasConflict) return;
    
    dispatch({ type: 'QUEUE_COURSE', studentId, courseId, day: state.day });
  };

  const removeFromQueue = (studentId: string, queueIndex: number) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', studentId, queueIndex });
  };

  const reorderQueue = (studentId: string, fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_QUEUE', studentId, fromIndex, toIndex });
  };

  const checkCourseConflict = (studentId: string, courseId: string) => {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return { hasConflict: true, reason: '学员不存在' };
    
    if (student.assignedCourse === courseId) {
      return { hasConflict: true, reason: '该学员正在学习此课程' };
    }
    
    if (student.courseQueue.some(q => q.courseId === courseId)) {
      return { hasConflict: true, reason: '该课程已在队列中' };
    }
    
    const course = state.courses.find(c => c.id === courseId);
    if (course && course.requiredLevel > student.level) {
      return { hasConflict: true, reason: `等级不足 (需要 Lv.${course.requiredLevel})` };
    }
    
    if (course) {
      const canAffordCourse = state.resources.gold >= course.cost.gold &&
        state.resources.mana >= course.cost.mana &&
        state.resources.food >= course.cost.food &&
        state.resources.reputation >= course.cost.reputation;
      if (!canAffordCourse) {
        return { hasConflict: true, reason: '资源不足' };
      }
    }
    
    return { hasConflict: false };
  };

  const saveGame = () => {
    createBackup();
    const saveData = { ...state, saveVersion: CURRENT_SAVE_VERSION };
    localStorage.setItem('magicAcademySave', JSON.stringify(saveData));
  };

  const loadGame = () => {
    const result = loadAndMigrateSave();
    if (result) {
      dispatch({ type: 'LOAD_GAME', state: result.state });
    }
  };

  const exportSave = (): string => {
    return exportSaveData({ ...state, saveVersion: CURRENT_SAVE_VERSION });
  };

  const importSave = (json: string): boolean => {
    const result = importSaveData(json);
    if (result) {
      createBackup();
      localStorage.setItem('magicAcademySave', JSON.stringify(result.state));
      dispatch({ type: 'LOAD_GAME', state: result.state });
      return true;
    }
    return false;
  };

  const restoreFromBackup = (): boolean => {
    const backup = restoreBackup();
    if (!backup) return false;
    try {
      const migrated = migrateSave(backup);
      localStorage.setItem('magicAcademySave', JSON.stringify(migrated));
      dispatch({ type: 'LOAD_GAME', state: migrated });
      return true;
    } catch {
      return false;
    }
  };

  const hasBackupAvailable = hasBackup();
  const backupTime = getBackupTime();

  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch, 
      activeTab, 
      setActiveTab, 
      canAfford, 
      recruitStudent,
      assignStudentToRest,
      assignStudentToCourse,
      queueCourse,
      removeFromQueue,
      reorderQueue,
      checkCourseConflict,
      saveGame, 
      loadGame,
      exportSave,
      importSave,
      restoreFromBackup,
      hasBackupAvailable,
      backupTime,
      checkPrerequisites,
      getActiveSynergies,
      calculateSynergyBonus,
      calculateBattleStars,
      calculateDungeonRewards,
      calculateSweepRewards,
      canSweep,
      calculateDailyIncome,
      calculateFoodConsumption,
      getMoraleLabel,
      getStaminaLabel,
      calculateMoraleEfficiencyMultiplier,
      calculateStaminaEfficiencyMultiplier,
      getPityThreshold,
      getProbabilities,
      getRecruitQualityBonus,
      computeAdjustedProbabilities,
      getGuaranteedQuality,
      calculateMagicTypeMatchBonus,
      calculateTeacherBonus,
      calculateBuildingMagicBonus,
      calculateCourseBenefit,
      calculateEnhancedSkillDamage,
      formatBenefitBreakdown,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}