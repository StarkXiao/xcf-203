/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, Resource, TabType, Student as StudentType, GachaResult, StudentQuality, CourseBenefitBreakdown, DailySnapshot, AutoSaveConfig, GoalType, SeasonGoalType, ClubContributionLog, ClubBuff, ClubBuffEffect, TradeMaterialType, TradeOrderType, Mentor, MentorSpecialization, SpecializationType, MentorDungeonBonus, GrowthRecord, AlchemyMaterialId, PotionId, ActiveCrafting, ActivePotionBuff, AcademyEventDefinition, KingdomCommission, CommissionStageType, RestActivity, DormitoryState, DormitoryRoom, StudentRelationship, RelationshipLevel, DormitoryEventInstance } from '../types/game';
import { CURRENT_SAVE_VERSION } from '../types/game';
import { 
  INITIAL_RESOURCES, 
  INITIAL_BUILDINGS, 
  INITIAL_COURSES, 
  INITIAL_DUNGEONS, 
  INITIAL_TEACHERS,
  REPUTATION_LEVELS,
  RECRUITMENT_TICKETS,
  getReputationLevel,
  getNextReputationLevel,
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
  calculateDiscountedCost,
  canAccessCourse,
  canAccessBuilding,
  canAccessRecruitmentTicket,
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
  INITIAL_GOAL_PROGRESS,
  INITIAL_WEEKLY_GOALS,
  INITIAL_STAGE_TASKS_STATE,
  updateWeeklyGoalProgress,
  updateStageTaskProgress,
  unlockNextStageTasks,
  checkWeeklyReset,
  generateWeeklyGoals,
  getCurrentWeek,
  INITIAL_SEASON_STATE,
  createSeasonSnapshot,
  updateSeasonGoalProgress,
  updateSeasonStageRewards,
  getCurrentSeasonStage,
  calculateSeasonSettlement,
  checkSeasonEnd,
  createSeasonHistory,
  initializeNewSeason,
  addToSeasonHistory,
  getRankBonus,
  INITIAL_CLUBS_STATE,
  INITIAL_CLUBS,
  canUnlockClub,
  calculateClubLevelProgress,
  getClubLevelRequirement,
  calculateClubTaskProgress,
  unlockPrerequisiteTasks,
  calculateDiscountedClubShopCost,
  getClubReputationLevel,
  refreshClubShop,
  generateClubTasks,
  getClubMemberBonus,
  CLUB_REPUTATION_LEVELS,
  TRADE_MATERIALS,
  getTradeMaterial,
  calculateDailyPrices,
  INITIAL_TRADE_HARBOR_STATE,
  calculateShipmentDuration,
  calculateShipmentRisk,
  calculateTradePriceBonus,
  getTotalWarehouseUsed,
  calculateWarehouseCapacity,
  getTradeBuildingBonuses,
  canPlaceBuyOrder,
  canPlaceSellOrder,
  generateTradeOrderId,
  generateShipmentId,
  getRouteInfo,
  updateTradeHarborBonuses,
  INITIAL_MENTOR_STATE,
  refreshMentorRecruitmentPool,
  calculateMentorCourseBonus,
  calculateMentorDungeonBonus,
  calculateMentorPromotionBonus,
  tryStudentPromotion,
  applyQualityUpgradeToStudent,
  canAssignMentorToCourse,
  canMentorLeadDungeon,
  getAcademyUpgradeCost,
  getMentorRankExpRequirement,
  getNextMentorRank,
  getSpecializationExpRequirement,
  SPECIALIZATION_TEMPLATES,
  MENTOR_QUALITY_NAMES,
  MENTOR_QUALITY_COLORS,
  MENTOR_RANK_NAMES,
  getMentorQualityMultiplier,
  INITIAL_ALCHEMY_STATE,
  ALCHEMY_MATERIALS,
  getAlchemyMaterial,
  canCraftPotion,
  canSynthesizeMaterial,
  getWorkshopUpgradeCost,
  getCraftingSlotsForLevel,
  getWorkshopRequiredReputation,
  rollDungeonMaterialDrops,
  ALCHEMY_RARITY_COLORS,
  ALCHEMY_RARITY_NAMES,
  getPotionCourseBuffs,
  getPotionDungeonBuffs,
  INITIAL_EVENT_CENTER_STATE,
  selectRandomEvent,
  resolveEventChoice,
  ACADEMY_EVENTS,
  EVENT_RARITY_COLORS,
  EVENT_RARITY_NAMES,
  EVENT_CATEGORY_ICONS,
  EVENT_CATEGORY_NAMES,
  INITIAL_KINGDOM_COMMISSION_STATE,
  COMMISSION_RANK_INFO,
  COMMISSION_DIFFICULTY_NAMES,
  COMMISSION_DIFFICULTY_COLORS,
  COMMISSION_TYPE_NAMES,
  COMMISSION_TYPE_ICONS,
  getCommissionRank,
  getNextCommissionRank,
  generateAvailableCommissions,
  updateCommissionStageProgress,
  deliverCommissionResource,
  claimStageReward,
  claimCommissionReward,
  getMaxActiveCommissions,
  applyCommissionRewardBonus,
  INITIAL_DORMITORY_STATE,
  calculateDormitoryBonus,
  calculateDormitoryComfort,
  calculateRoomCapacity,
  calculateRestActivityResult,
  calculateRelationshipExpGain,
  generateDormitoryRooms,
  initializeRelationships,
  triggerRandomDormitoryEvent,
  getRelationshipLevel,
  getRelationshipInfo,
  getRelationshipLevelOrder,
  getBattleRelationshipBonus,
  RELATIONSHIP_LEVELS,
  REST_ACTIVITIES,
  DORMITORY_EVENTS,
  getRestActivityIcon,
  getRestActivityName,
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
  | { type: 'RESET_GAME' }
  | { type: 'ADD_DAILY_SNAPSHOT'; snapshot: DailySnapshot }
  | { type: 'UPDATE_AUTO_SAVE_CONFIG'; config: Partial<AutoSaveConfig> }
  | { type: 'CLEAR_OLD_SNAPSHOTS' }
  | { type: 'TRIGGER_CRITICAL_SAVE' }
  | { type: 'UPDATE_GOAL_PROGRESS'; goalType: GoalType; amount?: number }
  | { type: 'CLAIM_WEEKLY_GOAL'; goalId: string }
  | { type: 'CLAIM_STAGE_TASK'; taskId: string }
  | { type: 'RESET_WEEKLY_GOALS' }
  | { type: 'UPDATE_SEASON_GOAL_PROGRESS'; goalType: SeasonGoalType; amount?: number }
  | { type: 'CLAIM_SEASON_GOAL'; goalId: string }
  | { type: 'CLAIM_SEASON_STAGE_REWARD'; stageId: string }
  | { type: 'END_SEASON' }
  | { type: 'SETTLE_SEASON' }
  | { type: 'CLAIM_SEASON_SETTLEMENT_REWARD' }
  | { type: 'START_NEW_SEASON' }
  | { type: 'JOIN_CLUB'; clubId: string; studentId: string }
  | { type: 'LEAVE_CLUB'; clubId: string; studentId: string }
  | { type: 'UNLOCK_CLUB'; clubId: string }
  | { type: 'LEVEL_UP_CLUB'; clubId: string }
  | { type: 'CLAIM_CLUB_TASK'; taskId: string }
  | { type: 'UPDATE_CLUB_TASK_PROGRESS'; actionType: 'course' | 'dungeon' | 'recruit' | 'building'; amount?: number; isThreeStar?: boolean }
  | { type: 'PURCHASE_CLUB_SHOP_ITEM'; itemId: string; clubId: string }
  | { type: 'REFRESH_CLUB_SHOP' }
  | { type: 'ADD_CLUB_BUFF'; buff: ClubBuff; clubId: string }
  | { type: 'ADD_CLUB_CONTRIBUTION_LOG'; log: ClubContributionLog }
  | { type: 'USE_RECRUIT_TICKET'; quality: 'common' | 'rare' | 'epic' | 'legendary' }
  | { type: 'ADD_RECRUIT_TICKET'; quality: 'common' | 'rare' | 'epic' | 'legendary'; amount: number }
  | { type: 'UNLOCK_TRADE_HARBOR' }
  | { type: 'PLACE_TRADE_ORDER'; orderType: TradeOrderType; materialId: TradeMaterialType; quantity: number; route: 'local' | 'regional' | 'intercontinental' }
  | { type: 'CANCEL_TRADE_ORDER'; orderId: string }
  | { type: 'COMPLETE_TRADE_SHIPMENT'; shipmentId: string }
  | { type: 'REFRESH_TRADE_PRICES' }
  | { type: 'UPGRADE_WAREHOUSE' }
  | { type: 'RECRUIT_MENTOR'; optionId: string }
  | { type: 'REFRESH_MENTOR_POOL'; useFree?: boolean }
  | { type: 'ASSIGN_MENTOR_TO_COURSE'; mentorId: string; courseId: string }
  | { type: 'UNASSIGN_MENTOR_FROM_COURSE'; mentorId: string; courseId: string }
  | { type: 'ASSIGN_MENTOR_TO_DUNGEON'; mentorId: string; dungeonId: string | null }
  | { type: 'ADD_MENTOR_EXP'; mentorId: string; exp: number }
  | { type: 'UPGRADE_MENTOR_RANK'; mentorId: string }
  | { type: 'UPGRADE_MENTOR_SPECIALIZATION'; mentorId: string; specializationId: SpecializationType; exp: number }
  | { type: 'UNLOCK_MENTOR_SPECIALIZATION'; mentorId: string; specializationId: SpecializationType }
  | { type: 'ASSIGN_MENTOR_TO_ACADEMY'; mentorId: string; academyId: string | null }
  | { type: 'UPGRADE_ACADEMY'; academyId: string }
  | { type: 'UNLOCK_ACADEMY'; academyId: string }
  | { type: 'UPDATE_MENTOR'; mentor: Mentor }
  | { type: 'UNLOCK_ALCHEMY' }
  | { type: 'UPGRADE_ALCHEMY_WORKSHOP' }
  | { type: 'CRAFT_POTION'; potionId: PotionId; quantity: number }
  | { type: 'COMPLETE_CRAFTING'; craftingId: string }
  | { type: 'SYNTHESIZE_MATERIAL'; recipeId: string }
  | { type: 'USE_POTION'; potionId: PotionId; studentId?: string; dungeonId?: string }
  | { type: 'SELL_POTION'; potionId: PotionId; quantity: number }
  | { type: 'SELL_MATERIAL'; materialId: AlchemyMaterialId; quantity: number }
  | { type: 'ADD_DUNGEON_MATERIAL_DROPS'; dungeonId: string; stars: number }
  | { type: 'TICK_ALCHEMY_CRAFTINGS' }
  | { type: 'EXPIRE_ALCHEMY_BUFFS' }
  | { type: 'UNLOCK_EVENT_CENTER' }
  | { type: 'TRIGGER_EVENT_CENTER'; event: AcademyEventDefinition }
  | { type: 'RESOLVE_EVENT_CENTER'; choiceId: string }
  | { type: 'DISMISS_EVENT_CENTER' }
  | { type: 'CLAIM_EVENT_REWARD' }
  | { type: 'UNLOCK_KINGDOM_COMMISSION' }
  | { type: 'REFRESH_AVAILABLE_COMMISSIONS' }
  | { type: 'ACCEPT_COMMISSION'; commissionId: string }
  | { type: 'ABANDON_COMMISSION'; commissionId: string }
  | { type: 'UPDATE_COMMISSION_PROGRESS'; stageType: CommissionStageType; amount?: number; resourceType?: keyof Resource }
  | { type: 'DELIVER_COMMISSION_RESOURCE'; commissionId: string; stageId: string }
  | { type: 'CLAIM_COMMISSION_STAGE_REWARD'; commissionId: string; stageId: string }
  | { type: 'CLAIM_COMMISSION_REWARD'; commissionId: string }
  | { type: 'ASSIGN_STUDENT_TO_COMMISSION'; commissionId: string; studentId: string }
  | { type: 'UNASSIGN_STUDENT_FROM_COMMISSION'; commissionId: string; studentId: string }
  | { type: 'ASSIGN_DORMITORY_ACTIVITY'; studentId: string; activity: RestActivity; day: number }
  | { type: 'REASSIGN_DORMITORY_ROOM'; studentId: string; roomId: string }
  | { type: 'RESOLVE_DORMITORY_EVENT'; eventInstanceId: string; choiceId?: string }
  | { type: 'REFRESH_DORMITORY_ROOMS' }
  | { type: 'UPDATE_DORMITORY_BONUSES' };

const MAX_STUDENT_CAPACITY = 20;

const initialAutoSaveConfig: AutoSaveConfig = {
  enabled: true,
  saveOnDayAdvance: true,
  saveOnCriticalAction: true,
  maxSnapshots: 30,
  lastAutoSave: null,
  confirmOnCriticalAction: true,
};

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
  dailySnapshots: [],
  autoSaveConfig: initialAutoSaveConfig,
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
  recruitTickets: {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  },
  goalProgress: INITIAL_GOAL_PROGRESS,
  weeklyGoals: INITIAL_WEEKLY_GOALS,
  stageTasks: INITIAL_STAGE_TASKS_STATE,
  season: INITIAL_SEASON_STATE,
  seasonHistory: [],
  clubs: INITIAL_CLUBS_STATE,
  tradeHarbor: INITIAL_TRADE_HARBOR_STATE,
  mentorState: INITIAL_MENTOR_STATE,
  alchemy: INITIAL_ALCHEMY_STATE,
  eventCenter: INITIAL_EVENT_CENTER_STATE,
  kingdomCommission: INITIAL_KINGDOM_COMMISSION_STATE,
  dormitory: INITIAL_DORMITORY_STATE,
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
      
      if (!canAccessBuilding(building, state.resources.reputation)) return state;
      
      const prereqCheck = checkPrerequisites(building, state.buildings);
      if (!prereqCheck.met) return state;
      
      const baseCost = {
        gold: building.cost.gold * building.level,
        mana: building.cost.mana * building.level,
        food: building.cost.food * building.level,
        reputation: building.cost.reputation * building.level,
      };
      const cost = calculateDiscountedCost(baseCost, state.resources.reputation, 'building');
      
      if (state.resources.gold < cost.gold || state.resources.mana < cost.mana ||
          state.resources.food < cost.food || state.resources.reputation < cost.reputation) {
        return state;
      }
      const newGoalProgress = {
        ...state.goalProgress,
        buildingUpgrades: state.goalProgress.buildingUpgrades + 1,
      };
      
      const newWeeklyGoals = {
        ...state.weeklyGoals,
        goals: updateWeeklyGoalProgress(state.weeklyGoals.goals, 'building'),
      };
      
      const newStageTasks = {
        ...state.stageTasks,
        tasks: updateStageTaskProgress(state.stageTasks.tasks, 'building'),
      };
      
      const { goals: newSeasonGoals, pointsGained } = updateSeasonGoalProgress(
        state.season.goals,
        'building',
        1
      );
      const newSeasonTotalPoints = state.season.totalPointsEarned + pointsGained;
      const newSeasonStageRewards = updateSeasonStageRewards(
        state.season.stageRewards,
        newSeasonTotalPoints
      );
      const newSeasonCurrentStage = getCurrentSeasonStage(newSeasonStageRewards, newSeasonTotalPoints);
      
      const updatedClubTasks = calculateClubTaskProgress(
        state.clubs.tasks,
        'building',
        1
      );
      
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
        goalProgress: newGoalProgress,
        weeklyGoals: newWeeklyGoals,
        stageTasks: newStageTasks,
        season: {
          ...state.season,
          goals: newSeasonGoals,
          totalPointsEarned: newSeasonTotalPoints,
          seasonPoints: newSeasonTotalPoints,
          stageRewards: newSeasonStageRewards,
          currentStage: newSeasonCurrentStage,
        },
        clubs: {
          ...state.clubs,
          tasks: updatedClubTasks,
        },
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

      const newGoalProgress = {
        ...state.goalProgress,
        recruits: state.goalProgress.recruits + 1,
        totalStudents: state.students.length + 1,
      };
      
      const newWeeklyGoals = {
        ...state.weeklyGoals,
        goals: updateWeeklyGoalProgress(state.weeklyGoals.goals, 'recruit'),
      };
      
      const newStageTasks = {
        ...state.stageTasks,
        tasks: updateStageTaskProgress(state.stageTasks.tasks, 'recruit'),
      };
      
      const { goals: newSeasonGoals, pointsGained } = updateSeasonGoalProgress(
        state.season.goals,
        'recruit',
        1
      );
      const newSeasonTotalPoints = state.season.totalPointsEarned + pointsGained;
      const newSeasonStageRewards = updateSeasonStageRewards(
        state.season.stageRewards,
        newSeasonTotalPoints
      );
      const newSeasonCurrentStage = getCurrentSeasonStage(newSeasonStageRewards, newSeasonTotalPoints);
      
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
        goalProgress: newGoalProgress,
        weeklyGoals: newWeeklyGoals,
        stageTasks: newStageTasks,
        season: {
          ...state.season,
          goals: newSeasonGoals,
          totalPointsEarned: newSeasonTotalPoints,
          seasonPoints: newSeasonTotalPoints,
          stageRewards: newSeasonStageRewards,
          currentStage: newSeasonCurrentStage,
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
      const potionBuffs = getPotionCourseBuffs(state.alchemy.activeBuffs, action.studentId);
      
      if (student && course.effect.type === 'exp_gain') {
        const breakdown = calculateCourseBenefit(
          course.effect.value,
          student,
          course,
          state.buildings,
          state.teachers,
          state.mentorState.mentors,
          state.mentorState.academies,
          potionBuffs
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
                state.teachers,
                state.mentorState.mentors,
                state.mentorState.academies,
                potionBuffs
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
      
      const newGoalProgress = {
        ...state.goalProgress,
        coursesCompleted: state.goalProgress.coursesCompleted + 1,
      };
      
      const newWeeklyGoals = {
        ...state.weeklyGoals,
        goals: updateWeeklyGoalProgress(state.weeklyGoals.goals, 'course'),
      };
      
      const newStageTasks = {
        ...state.stageTasks,
        tasks: updateStageTaskProgress(state.stageTasks.tasks, 'course'),
      };
      
      const { goals: newSeasonGoals, pointsGained } = updateSeasonGoalProgress(
        state.season.goals,
        'course',
        1
      );
      const newSeasonTotalPoints = state.season.totalPointsEarned + pointsGained;
      const newSeasonStageRewards = updateSeasonStageRewards(
        state.season.stageRewards,
        newSeasonTotalPoints
      );
      const newSeasonCurrentStage = getCurrentSeasonStage(newSeasonStageRewards, newSeasonTotalPoints);
      
      const dailyLog: DailyLog = {
        day: state.day,
        events: todayEvents,
      };
      
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      const updatedClubTasks = calculateClubTaskProgress(
        state.clubs.tasks,
        'course',
        1
      );
      
      const courseMentors = state.mentorState.mentors.filter(m => m.assignedCourses.includes(course.id));
      const updatedMentorsForCourse = state.mentorState.mentors.map(m => {
        if (!courseMentors.find(cm => cm.id === m.id)) return m;
        const mentorExpGain = 5 + course.level * 2;
        let newMentorExp = m.exp + mentorExpGain;
        let newMentorRank = m.rank;
        let newExpToNext = m.expToNextRank;
        const nextRank = getNextMentorRank(m.rank);
        if (nextRank && newMentorExp >= m.expToNextRank) {
          newMentorExp -= m.expToNextRank;
          newMentorRank = nextRank;
          newExpToNext = getMentorRankExpRequirement(nextRank);
        }
        return {
          ...m,
          exp: newMentorExp,
          rank: newMentorRank,
          expToNextRank: newExpToNext,
          totalStudentsTaught: m.totalStudentsTaught + 1,
        };
      });
      
      const kc = state.kingdomCommission;
      let newKingdomCommission = kc;
      if (kc.unlocked && kc.activeCommissions.length > 0) {
        const { updated, completedStages, completedCommissions } = updateCommissionStageProgress(
          kc.activeCommissions,
          'course',
          1
        );
        
        if (completedStages.length > 0 || completedCommissions.length > 0) {
          const completedCommList = updated.filter(c => c.status === 'stage_complete');
          const stillActive = updated.filter(c => c.status !== 'stage_complete');
          
          newKingdomCommission = {
            ...kc,
            activeCommissions: stillActive,
            completedCommissions: [...kc.completedCommissions, ...completedCommList],
          };
        } else {
          newKingdomCommission = { ...kc, activeCommissions: updated };
        }
      }
      
      return {
        ...newState,
        dailyLogs: recentLogs,
        goalProgress: newGoalProgress,
        weeklyGoals: newWeeklyGoals,
        stageTasks: newStageTasks,
        season: {
          ...state.season,
          goals: newSeasonGoals,
          totalPointsEarned: newSeasonTotalPoints,
          seasonPoints: newSeasonTotalPoints,
          stageRewards: newSeasonStageRewards,
          currentStage: newSeasonCurrentStage,
        },
        clubs: {
          ...state.clubs,
          tasks: updatedClubTasks,
        },
        mentorState: {
          ...state.mentorState,
          mentors: updatedMentorsForCourse,
        },
        alchemy: {
          ...state.alchemy,
          activeBuffs: state.alchemy.activeBuffs.filter(b => !potionBuffs.usedBuffIds.includes(b.id)),
        },
        kingdomCommission: newKingdomCommission,
      };
    }

    case 'QUEUE_COURSE': {
      const course = state.courses.find(c => c.id === action.courseId);
      const student = state.students.find(s => s.id === action.studentId);
      if (!course || !student) return state;
      
      if (student.assignedCourse === action.courseId) return state;
      if (student.courseQueue.some(q => q.courseId === action.courseId)) return state;
      if (!canAccessCourse(course, student.level, state.resources.reputation)) return state;
      
      const discountedCost = calculateDiscountedCost(course.cost, state.resources.reputation, 'course');
      const canAffordCourse = state.resources.gold >= discountedCost.gold &&
        state.resources.mana >= discountedCost.mana &&
        state.resources.food >= discountedCost.food &&
        state.resources.reputation >= discountedCost.reputation;
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
      if (!canAccessCourse(nextCourse, student.level, state.resources.reputation)) return state;
      
      const discountedCost = calculateDiscountedCost(nextCourse.cost, state.resources.reputation, 'course');
      if (state.resources.gold < discountedCost.gold ||
          state.resources.mana < discountedCost.mana ||
          state.resources.food < discountedCost.food ||
          state.resources.reputation < discountedCost.reputation) {
        return state;
      }
      
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
          gold: state.resources.gold - discountedCost.gold,
          mana: state.resources.mana - discountedCost.mana,
          food: state.resources.food - discountedCost.food,
          reputation: state.resources.reputation - discountedCost.reputation,
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
      const teamStudents = state.students.filter(s => action.team.includes(s.id));
      const assignedMentor = state.mentorState.mentors.find(m => m.assignedDungeon === action.dungeonId);
      let mentorDungeonBonus: MentorDungeonBonus | undefined;
      if (assignedMentor) {
        const leadResult = calculateMentorDungeonBonus(
          dungeon,
          teamStudents,
          [assignedMentor],
          state.mentorState.academies
        );
        mentorDungeonBonus = leadResult;
      }
      const potionDungeonBuffs = getPotionDungeonBuffs(state.alchemy.activeBuffs, action.dungeonId, action.team);
      const rewards = action.stars > 0 ? calculateDungeonRewards(dungeon, action.stars, isFirstClear, mentorDungeonBonus, { damageBoost: potionDungeonBuffs.damageBoost, defenseBoost: potionDungeonBuffs.defenseBoost }) : { gold: 0, mana: 0, food: 0, reputation: 0 };
      const victory = action.stars > 0;
      const battleEvents: DailyEvent[] = [];

      if (potionDungeonBuffs.damageBoost > 0) {
        battleEvents.push({
          type: 'alchemy_potion_used',
          message: `⚔️ 战斗强化药剂生效，伤害+${Math.round(potionDungeonBuffs.damageBoost * 100)}%`,
          value: Math.round(potionDungeonBuffs.damageBoost * 100),
        });
      }
      if (potionDungeonBuffs.defenseBoost > 0) {
        battleEvents.push({
          type: 'alchemy_potion_used',
          message: `🛡️ 防御强化药剂生效，减伤+${Math.round(potionDungeonBuffs.defenseBoost * 100)}%`,
          value: Math.round(potionDungeonBuffs.defenseBoost * 100),
        });
      }

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

        let newExp = s.exp;
        let newLevel = s.level;
        const newGrowthRecords = [...s.growthRecords];
        let leveledUp = false;
        if (victory) {
          const baseExp = 15 + dungeon.level * 5 + action.stars * 10;
          const expMultiplier = mentorDungeonBonus?.expMultiplier ?? 1;
          const gainedExp = Math.floor(baseExp * expMultiplier);
          newExp += gainedExp;
          const oldLevel = s.level;
          while (newExp >= newLevel * 100) {
            newExp -= newLevel * 100;
            newLevel++;
            leveledUp = true;
          }
          if (leveledUp) {
            newGrowthRecords.push({
              id: `growth_${s.id}_dungeon_${Date.now()}`,
              type: 'level_up',
              day: state.day,
              description: `副本升级: Lv.${oldLevel} → Lv.${newLevel}`,
              details: { oldLevel, newLevel, source: 'dungeon' },
            });
          }
        }

        let updatedStudent: StudentType = {
          ...s,
          currentHp: newCurrentHp,
          maxHp: newMaxHp,
          morale: clamp(s.morale + moraleDelta, 0, 100),
          stamina: clamp(s.stamina + staminaDelta, 0, 100),
          status: 'idle' as const,
          exp: newExp,
          level: newLevel,
          growthRecords: newGrowthRecords,
          dungeonHistory: [...s.dungeonHistory, dungeonEntry],
        };

        if (leveledUp && victory) {
          const dungeonPromoResult = tryStudentPromotion(
            updatedStudent,
            state.mentorState.mentors,
            state.mentorState.academies
          );

          if (dungeonPromoResult.qualityUpgraded && dungeonPromoResult.newQuality) {
            updatedStudent = applyQualityUpgradeToStudent(
              updatedStudent,
              dungeonPromoResult.newQuality,
              state.day
            );
            battleEvents.push({
              type: 'student_promoted',
              message: `🌟 ${s.name} 品质晋升！${dungeonPromoResult.oldQuality} → ${dungeonPromoResult.newQuality}`,
              studentId: s.id,
              studentName: s.name,
              value: 1,
            });
          }

          if (dungeonPromoResult.bonusExpGained > 0) {
            let bonusExp = updatedStudent.exp + dungeonPromoResult.bonusExpGained;
            let bonusLevel = updatedStudent.level;
            let bonusLeveledUp = false;
            const oldBonusLevel = bonusLevel;
            while (bonusExp >= bonusLevel * 100) {
              bonusExp -= bonusLevel * 100;
              bonusLevel++;
              bonusLeveledUp = true;
            }
            if (bonusLeveledUp) {
              const levelRecord: GrowthRecord = {
                id: `growth_${s.id}_dungeon_bonus_${Date.now()}`,
                type: 'level_up',
                day: state.day,
                description: `导师加成升级: Lv.${oldBonusLevel} → Lv.${bonusLevel}`,
                details: { oldLevel: oldBonusLevel, newLevel: bonusLevel, fromMentor: true },
              };
              updatedStudent = {
                ...updatedStudent,
                level: bonusLevel,
                exp: bonusExp,
                growthRecords: [...updatedStudent.growthRecords, levelRecord],
              };
            } else {
              updatedStudent = { ...updatedStudent, exp: bonusExp };
            }
          }
        }

        return updatedStudent;
      });

      let updatedMentors = state.mentorState.mentors;
      if (assignedMentor && victory) {
        updatedMentors = state.mentorState.mentors.map(m => {
          if (m.id !== assignedMentor.id) return m;
          const mentorExpGain = 10 + dungeon.level * 3;
          let newMentorExp = m.exp + mentorExpGain;
          let newMentorRank = m.rank;
          let newExpToNext = m.expToNextRank;
          const nextRank = getNextMentorRank(m.rank);
          if (nextRank && newMentorExp >= m.expToNextRank) {
            newMentorExp -= m.expToNextRank;
            newMentorRank = nextRank;
            newExpToNext = getMentorRankExpRequirement(nextRank);
          }
          return {
            ...m,
            exp: newMentorExp,
            rank: newMentorRank,
            expToNextRank: newExpToNext,
            totalDungeonsLed: m.totalDungeonsLed + 1,
          };
        });
      }

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
          mentorState: {
            ...state.mentorState,
            mentors: updatedMentors,
          },
          alchemy: {
            ...state.alchemy,
            activeBuffs: state.alchemy.activeBuffs.filter(b => !potionDungeonBuffs.usedBuffIds.includes(b.id)),
          },
        };
      }
      
      const newBestStars = Math.max(dungeon.bestStars, action.stars);
      const shouldUpdateTeam = action.stars > dungeon.bestStars;
      const newSweepUnlocked = newBestStars >= 3;
      
      const newGoalProgress = {
        ...state.goalProgress,
        dungeonClears: state.goalProgress.dungeonClears + 1,
        reputationGained: state.goalProgress.reputationGained + rewards.reputation,
      };
      
      const newWeeklyGoals = {
        ...state.weeklyGoals,
        goals: updateWeeklyGoalProgress(state.weeklyGoals.goals, 'dungeon'),
      };
      
      const newStageTasks = {
        ...state.stageTasks,
        tasks: updateStageTaskProgress(state.stageTasks.tasks, 'dungeon'),
      };
      
      if (isFirstClear) {
        const completedTask = newStageTasks.tasks.find(t => t.completed && !t.claimed);
        if (completedTask) {
          newStageTasks.tasks = unlockNextStageTasks(newStageTasks.tasks, completedTask.id);
        }
      }
      
      let seasonGoals = state.season.goals;
      let seasonPointsGained = 0;
      
      const dungeonUpdate = updateSeasonGoalProgress(seasonGoals, 'dungeon', 1);
      seasonGoals = dungeonUpdate.goals;
      seasonPointsGained += dungeonUpdate.pointsGained;
      
      if (rewards.reputation > 0) {
        const reputationUpdate = updateSeasonGoalProgress(seasonGoals, 'reputation', rewards.reputation);
        seasonGoals = reputationUpdate.goals;
        seasonPointsGained += reputationUpdate.pointsGained;
      }
      
      const newSeasonTotalPoints = state.season.totalPointsEarned + seasonPointsGained;
      const newSeasonStageRewards = updateSeasonStageRewards(
        state.season.stageRewards,
        newSeasonTotalPoints
      );
      const newSeasonCurrentStage = getCurrentSeasonStage(newSeasonStageRewards, newSeasonTotalPoints);
      
      const isThreeStar = action.stars >= 3;
      const updatedClubTasks = calculateClubTaskProgress(
        state.clubs.tasks,
        'dungeon',
        1,
        isThreeStar
      );
      
      const dungeonKc = state.kingdomCommission;
      let newDungeonKingdomCommission = dungeonKc;
      if (dungeonKc.unlocked && dungeonKc.activeCommissions.length > 0) {
        const { updated, completedStages, completedCommissions } = updateCommissionStageProgress(
          dungeonKc.activeCommissions,
          'dungeon',
          1
        );
        
        if (completedStages.length > 0 || completedCommissions.length > 0) {
          const completedCommList = updated.filter(c => c.status === 'stage_complete');
          const stillActive = updated.filter(c => c.status !== 'stage_complete');
          
          newDungeonKingdomCommission = {
            ...dungeonKc,
            activeCommissions: stillActive,
            completedCommissions: [...dungeonKc.completedCommissions, ...completedCommList],
          };
        } else {
          newDungeonKingdomCommission = { ...dungeonKc, activeCommissions: updated };
        }
      }
      
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
        goalProgress: newGoalProgress,
        weeklyGoals: newWeeklyGoals,
        stageTasks: newStageTasks,
        season: {
          ...state.season,
          goals: seasonGoals,
          totalPointsEarned: newSeasonTotalPoints,
          seasonPoints: newSeasonTotalPoints,
          stageRewards: newSeasonStageRewards,
          currentStage: newSeasonCurrentStage,
        },
        clubs: {
          ...state.clubs,
          tasks: updatedClubTasks,
        },
        mentorState: {
          ...state.mentorState,
          mentors: updatedMentors,
        },
        alchemy: {
          ...state.alchemy,
          activeBuffs: state.alchemy.activeBuffs.filter(b => !potionDungeonBuffs.usedBuffIds.includes(b.id)),
        },
        kingdomCommission: newDungeonKingdomCommission,
      };
    }

    case 'SWEEP_DUNGEON': {
      const dungeon = state.dungeons.find(d => d.id === action.dungeonId);
      if (!dungeon || !canSweep(dungeon)) return state;
      
      const teamIds = dungeon.bestTeam;
      const potionDungeonBuffs = getPotionDungeonBuffs(state.alchemy.activeBuffs, action.dungeonId, teamIds);
      const rewards = calculateSweepRewards(dungeon, potionDungeonBuffs.sweepBonus);

      const sweepEvents: DailyEvent[] = [];
      if (potionDungeonBuffs.sweepBonus > 0) {
        sweepEvents.push({
          type: 'alchemy_potion_used',
          message: `🏆 扫荡增幅药剂生效，奖励+${Math.round(potionDungeonBuffs.sweepBonus * 100)}%`,
          value: Math.round(potionDungeonBuffs.sweepBonus * 100),
        });
      }

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
      
      const newGoalProgress = {
        ...state.goalProgress,
        dungeonClears: state.goalProgress.dungeonClears + 1,
        reputationGained: state.goalProgress.reputationGained + rewards.reputation,
      };
      
      const newWeeklyGoals = {
        ...state.weeklyGoals,
        goals: updateWeeklyGoalProgress(state.weeklyGoals.goals, 'dungeon'),
      };
      
      const newStageTasks = {
        ...state.stageTasks,
        tasks: updateStageTaskProgress(state.stageTasks.tasks, 'dungeon'),
      };
      
      let seasonGoals = state.season.goals;
      let seasonPointsGained = 0;
      
      const dungeonUpdate = updateSeasonGoalProgress(seasonGoals, 'dungeon', 1);
      seasonGoals = dungeonUpdate.goals;
      seasonPointsGained += dungeonUpdate.pointsGained;
      
      if (rewards.reputation > 0) {
        const reputationUpdate = updateSeasonGoalProgress(seasonGoals, 'reputation', rewards.reputation);
        seasonGoals = reputationUpdate.goals;
        seasonPointsGained += reputationUpdate.pointsGained;
      }
      
      const newSeasonTotalPoints = state.season.totalPointsEarned + seasonPointsGained;
      const newSeasonStageRewards = updateSeasonStageRewards(
        state.season.stageRewards,
        newSeasonTotalPoints
      );
      const newSeasonCurrentStage = getCurrentSeasonStage(newSeasonStageRewards, newSeasonTotalPoints);
      
      const sweepLogs = state.dailyLogs.slice(-29);
      if (sweepEvents.length > 0) {
        sweepLogs.push({ day: state.day, events: sweepEvents });
      }

      const sweepKc = state.kingdomCommission;
      let newSweepKingdomCommission = sweepKc;
      if (sweepKc.unlocked && sweepKc.activeCommissions.length > 0) {
        const { updated, completedStages, completedCommissions } = updateCommissionStageProgress(
          sweepKc.activeCommissions,
          'dungeon',
          1
        );
        
        if (completedStages.length > 0 || completedCommissions.length > 0) {
          const completedCommList = updated.filter(c => c.status === 'stage_complete');
          const stillActive = updated.filter(c => c.status !== 'stage_complete');
          
          newSweepKingdomCommission = {
            ...sweepKc,
            activeCommissions: stillActive,
            completedCommissions: [...sweepKc.completedCommissions, ...completedCommList],
          };
        } else {
          newSweepKingdomCommission = { ...sweepKc, activeCommissions: updated };
        }
      }

      return {
        ...state,
        students: updatedStudents,
        dailyLogs: sweepLogs,
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
        goalProgress: newGoalProgress,
        weeklyGoals: newWeeklyGoals,
        stageTasks: newStageTasks,
        season: {
          ...state.season,
          goals: seasonGoals,
          totalPointsEarned: newSeasonTotalPoints,
          seasonPoints: newSeasonTotalPoints,
          stageRewards: newSeasonStageRewards,
          currentStage: newSeasonCurrentStage,
        },
        alchemy: {
          ...state.alchemy,
          activeBuffs: state.alchemy.activeBuffs.filter(b => !potionDungeonBuffs.usedBuffIds.includes(b.id)),
        },
        kingdomCommission: newSweepKingdomCommission,
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

    case 'UPDATE_GOAL_PROGRESS': {
      const amount = action.amount || 1;
      return {
        ...state,
        weeklyGoals: {
          ...state.weeklyGoals,
          goals: updateWeeklyGoalProgress(state.weeklyGoals.goals, action.goalType, amount),
        },
        stageTasks: {
          ...state.stageTasks,
          tasks: updateStageTaskProgress(state.stageTasks.tasks, action.goalType, amount),
        },
      };
    }

    case 'CLAIM_WEEKLY_GOAL': {
      const goal = state.weeklyGoals.goals.find(g => g.id === action.goalId);
      if (!goal || !goal.completed || goal.claimed) return state;

      const newGoals = state.weeklyGoals.goals.map(g =>
        g.id === action.goalId ? { ...g, claimed: true } : g
      );

      return {
        ...state,
        resources: {
          gold: state.resources.gold + (goal.reward.gold || 0),
          mana: state.resources.mana + (goal.reward.mana || 0),
          food: state.resources.food + (goal.reward.food || 0),
          reputation: state.resources.reputation + (goal.reward.reputation || 0),
        },
        weeklyGoals: {
          ...state.weeklyGoals,
          goals: newGoals,
        },
      };
    }

    case 'CLAIM_STAGE_TASK': {
      const task = state.stageTasks.tasks.find(t => t.id === action.taskId);
      if (!task || !task.completed || task.claimed) return state;

      let newTasks = state.stageTasks.tasks.map(t =>
        t.id === action.taskId ? { ...t, claimed: true } : t
      );

      newTasks = unlockNextStageTasks(newTasks, action.taskId);

      const allStageTasks = newTasks.filter(t => t.stage === task.stage);
      const allClaimed = allStageTasks.every(t => t.claimed);
      const newCurrentStage = allClaimed ? task.stage + 1 : state.stageTasks.currentStage;

      return {
        ...state,
        resources: {
          gold: state.resources.gold + (task.reward.gold || 0),
          mana: state.resources.mana + (task.reward.mana || 0),
          food: state.resources.food + (task.reward.food || 0),
          reputation: state.resources.reputation + (task.reward.reputation || 0),
        },
        stageTasks: {
          ...state.stageTasks,
          tasks: newTasks,
          currentStage: newCurrentStage,
        },
      };
    }

    case 'RESET_WEEKLY_GOALS': {
      const newWeekNumber = state.weeklyGoals.weeklyResetCount + 2;
      return {
        ...state,
        weeklyGoals: {
          weekStartDay: state.day,
          goals: generateWeeklyGoals(newWeekNumber),
          weeklyResetCount: state.weeklyGoals.weeklyResetCount + 1,
        },
      };
    }

    case 'UPDATE_SEASON_GOAL_PROGRESS': {
      if (state.season.seasonEnded) return state;
      
      const amount = action.amount || 1;
      const { goals: updatedGoals, pointsGained } = updateSeasonGoalProgress(
        state.season.goals,
        action.goalType,
        amount
      );
      
      const newTotalPoints = state.season.totalPointsEarned + pointsGained;
      const updatedStageRewards = updateSeasonStageRewards(
        state.season.stageRewards,
        newTotalPoints
      );
      const newCurrentStage = getCurrentSeasonStage(updatedStageRewards, newTotalPoints);
      
      return {
        ...state,
        season: {
          ...state.season,
          goals: updatedGoals,
          seasonPoints: newTotalPoints,
          totalPointsEarned: newTotalPoints,
          stageRewards: updatedStageRewards,
          currentStage: newCurrentStage,
        },
      };
    }

    case 'CLAIM_SEASON_GOAL': {
      const goal = state.season.goals.find(g => g.id === action.goalId);
      if (!goal || !goal.completed || goal.claimed) return state;

      const newGoals = state.season.goals.map(g =>
        g.id === action.goalId ? { ...g, claimed: true } : g
      );

      return {
        ...state,
        resources: {
          gold: state.resources.gold + (goal.reward.gold || 0),
          mana: state.resources.mana + (goal.reward.mana || 0),
          food: state.resources.food + (goal.reward.food || 0),
          reputation: state.resources.reputation + (goal.reward.reputation || 0),
        },
        season: {
          ...state.season,
          goals: newGoals,
        },
      };
    }

    case 'CLAIM_SEASON_STAGE_REWARD': {
      const stage = state.season.stageRewards.find(s => s.id === action.stageId);
      if (!stage || !stage.unlocked || stage.claimed) return state;

      const newStageRewards = state.season.stageRewards.map(s =>
        s.id === action.stageId ? { ...s, claimed: true } : s
      );

      return {
        ...state,
        resources: {
          gold: state.resources.gold + (stage.reward.gold || 0),
          mana: state.resources.mana + (stage.reward.mana || 0),
          food: state.resources.food + (stage.reward.food || 0),
          reputation: state.resources.reputation + (stage.reward.reputation || 0),
        },
        season: {
          ...state.season,
          stageRewards: newStageRewards,
        },
      };
    }

    case 'END_SEASON': {
      if (state.season.seasonEnded) return state;
      
      return {
        ...state,
        season: {
          ...state.season,
          seasonEnded: true,
        },
      };
    }
    
    case 'SETTLE_SEASON': {
      if (!state.season.seasonEnded || state.season.seasonSettled) return state;
      
      const settlement = calculateSeasonSettlement(state.season);
      const rankBonus = getRankBonus(settlement.rank);
      const totalRewards = {
        gold: (rankBonus.gold || 0) + (settlement.carryOverBonus.gold || 0),
        mana: (rankBonus.mana || 0) + (settlement.carryOverBonus.mana || 0),
        food: (rankBonus.food || 0) + (settlement.carryOverBonus.food || 0),
        reputation: (rankBonus.reputation || 0) + (settlement.carryOverBonus.reputation || 0),
      };
      
      return {
        ...state,
        season: {
          ...state.season,
          seasonSettled: true,
          settlementRank: settlement.rank,
          settlementRewards: totalRewards,
        },
      };
    }

    case 'CLAIM_SEASON_SETTLEMENT_REWARD': {
      if (!state.season.seasonSettled || state.season.settlementClaimed || !state.season.settlementRewards) return state;
      
      const historyRecord = createSeasonHistory(
        state.season,
        state.resources,
        state.students,
        state.buildings,
        state.goalProgress
      );
      
      const newSeasonHistory = addToSeasonHistory(state.seasonHistory, historyRecord);
      
      return {
        ...state,
        resources: {
          gold: state.resources.gold + (state.season.settlementRewards.gold || 0),
          mana: state.resources.mana + (state.season.settlementRewards.mana || 0),
          food: state.resources.food + (state.season.settlementRewards.food || 0),
          reputation: state.resources.reputation + (state.season.settlementRewards.reputation || 0),
        },
        season: {
          ...state.season,
          settlementClaimed: true,
        },
        seasonHistory: newSeasonHistory,
      };
    }

    case 'START_NEW_SEASON': {
      if (!state.season.seasonEnded || !state.season.settlementClaimed) return state;
      
      const newSeasonNumber = state.season.seasonNumber + 1;
      const initialSnapshot = createSeasonSnapshot(
        state.resources,
        state.buildings,
        state.students,
        state.goalProgress
      );
      const newSeason = initializeNewSeason(newSeasonNumber, state.day, initialSnapshot);
      
      return {
        ...state,
        season: newSeason,
      };
    }

    case 'JOIN_CLUB': {
      const student = state.students.find(s => s.id === action.studentId);
      const club = state.clubs.clubs.find(c => c.id === action.clubId);
      if (!student || !club || !club.unlocked) return state;
      
      const repLevel = getClubReputationLevel(club.reputation);
      const effectiveMaxMembers = club.maxMembers + repLevel.bonuses.maxMembersBonus;
      if (club.members.length >= effectiveMaxMembers) return state;
      
      if (club.members.includes(action.studentId)) return state;
      
      const isInOtherClub = state.clubs.clubs.some(c => c.members.includes(action.studentId));
      
      const joinEvent: DailyEvent = {
        type: 'club_joined',
        message: `🎊 ${student.name} 加入了「${club.name}」！`,
        studentId: student.id,
        studentName: student.name,
        clubId: club.id,
        clubName: club.name,
      };
      
      const dailyLog: DailyLog = { day: state.day, events: [joinEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      return {
        ...state,
        dailyLogs: recentLogs,
        clubs: {
          ...state.clubs,
          clubs: state.clubs.clubs.map(c => {
            if (c.id === action.clubId) {
              return { ...c, members: [...c.members, action.studentId] };
            }
            if (isInOtherClub && c.members.includes(action.studentId)) {
              return { ...c, members: c.members.filter(m => m !== action.studentId) };
            }
            return c;
          }),
        },
      };
    }

    case 'LEAVE_CLUB': {
      const club = state.clubs.clubs.find(c => c.id === action.clubId);
      if (!club || !club.members.includes(action.studentId)) return state;
      
      return {
        ...state,
        clubs: {
          ...state.clubs,
          clubs: state.clubs.clubs.map(c =>
            c.id === action.clubId
              ? { ...c, members: c.members.filter(m => m !== action.studentId) }
              : c
          ),
        },
      };
    }

    case 'UNLOCK_CLUB': {
      const club = state.clubs.clubs.find(c => c.id === action.clubId);
      if (!club || club.unlocked) return state;
      
      const { canUnlock } = canUnlockClub(club, state.resources.reputation, state.buildings);
      if (!canUnlock) return state;
      
      const newTasks = generateClubTasks(club.id, club.level);
      
      return {
        ...state,
        clubs: {
          ...state.clubs,
          clubs: state.clubs.clubs.map(c =>
            c.id === action.clubId ? { ...c, unlocked: true } : c
          ),
          tasks: [...state.clubs.tasks, ...newTasks],
        },
      };
    }

    case 'LEVEL_UP_CLUB': {
      const club = state.clubs.clubs.find(c => c.id === action.clubId);
      if (!club) return state;
      if (club.level >= club.maxLevel) return state;
      
      const { canLevelUp } = calculateClubLevelProgress(
        club.totalContributionPoints,
        club.level,
        club.maxLevel
      );
      if (!canLevelUp) return state;
      
      const newLevel = club.level + 1;
      const newTasks = generateClubTasks(club.id, newLevel).filter(
        t => !state.clubs.tasks.some(et => et.id === t.id)
      );
      
      const levelUpEvent: DailyEvent = {
        type: 'club_level_up',
        message: `🎉 「${club.name}」升级到 Lv.${newLevel}！解锁更多任务和奖励`,
        clubId: club.id,
        clubName: club.name,
        value: newLevel,
      };
      
      const dailyLog: DailyLog = { day: state.day, events: [levelUpEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      return {
        ...state,
        dailyLogs: recentLogs,
        clubs: {
          ...state.clubs,
          clubs: state.clubs.clubs.map(c =>
            c.id === action.clubId ? { ...c, level: newLevel } : c
          ),
          tasks: [...state.clubs.tasks, ...newTasks],
        },
      };
    }

    case 'CLAIM_CLUB_TASK': {
      const task = state.clubs.tasks.find(t => t.id === action.taskId);
      if (!task || !task.completed || task.claimed) return state;
      
      const club = state.clubs.clubs.find(c => c.id === task.clubId);
      if (!club) return state;
      
      const repLevel = getClubReputationLevel(club.reputation);
      const rewardBonus = 1 + repLevel.bonuses.taskRewardBonus;
      const contributionBonus = 1 + repLevel.bonuses.contributionGainBonus;
      
      const baseContribution = task.reward.contributionPoints || 0;
      const actualContribution = Math.floor(baseContribution * contributionBonus);
      
      const goldReward = Math.floor((task.reward.gold || 0) * rewardBonus);
      const manaReward = Math.floor((task.reward.mana || 0) * rewardBonus);
      const foodReward = Math.floor((task.reward.food || 0) * rewardBonus);
      const reputationReward = Math.floor((task.reward.reputation || 0) * rewardBonus);
      
      const newTotalContribution = club.totalContributionPoints + actualContribution;
      const { canLevelUp } = calculateClubLevelProgress(
        newTotalContribution,
        club.level,
        club.maxLevel
      );
      
      const completedEvent: DailyEvent = {
        type: 'club_task_complete',
        message: `🏆 「${club.name}」完成任务「${task.name}」！获得 ${actualContribution}贡献点${goldReward > 0 ? `, +${goldReward}金币` : ''}${manaReward > 0 ? `, +${manaReward}魔力` : ''}${reputationReward > 0 ? `, +${reputationReward}声望` : ''}`,
        clubId: club.id,
        clubName: club.name,
        value: actualContribution,
      };
      
      const dailyLog: DailyLog = { day: state.day, events: [completedEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);
      
      const contributionLog: ClubContributionLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        clubId: club.id,
        type: 'task_complete',
        amount: actualContribution,
        day: state.day,
        description: `完成任务: ${task.name}`,
        timestamp: Date.now(),
      };
      
      let newTasks = state.clubs.tasks.map(t =>
        t.id === action.taskId ? { ...t, claimed: true } : t
      );
      newTasks = unlockPrerequisiteTasks(newTasks, task.id);
      
      const newClubReputation = club.reputation + (reputationReward > 0 ? Math.floor(reputationReward / 2) : 5);
      const repGainEvent = reputationReward > 0 ? [{
        type: 'club_reputation_gain' as const,
        message: `🌟 「${club.name}」声望提升！当前: ${newClubReputation}`,
        clubId: club.id,
        clubName: club.name,
        value: newClubReputation,
      }] : [];
      
      if (repGainEvent.length > 0) {
        const repLog: DailyLog = { day: state.day, events: repGainEvent };
        recentLogs.push(repLog);
      }
      
      return {
        ...state,
        dailyLogs: recentLogs,
        resources: {
          gold: state.resources.gold + goldReward,
          mana: state.resources.mana + manaReward,
          food: state.resources.food + foodReward,
          reputation: state.resources.reputation + reputationReward,
        },
        clubs: {
          ...state.clubs,
          totalContributionEarned: state.clubs.totalContributionEarned + actualContribution,
          clubs: state.clubs.clubs.map(c =>
            c.id === club.id
              ? {
                  ...c,
                  contributionPoints: c.contributionPoints + actualContribution,
                  totalContributionPoints: newTotalContribution,
                  reputation: newClubReputation,
                  level: canLevelUp ? c.level + 1 : c.level,
                }
              : c
          ),
          tasks: newTasks,
          contributionLogs: [contributionLog, ...state.clubs.contributionLogs].slice(0, 100),
        },
      };
    }

    case 'UPDATE_CLUB_TASK_PROGRESS': {
      const amount = action.amount || 1;
      const newTasks = calculateClubTaskProgress(
        state.clubs.tasks,
        action.actionType,
        amount,
        action.isThreeStar
      );
      return {
        ...state,
        clubs: { ...state.clubs, tasks: newTasks },
      };
    }

    case 'PURCHASE_CLUB_SHOP_ITEM': {
      const item = state.clubs.shopItems.find(i => i.id === action.itemId);
      const club = state.clubs.clubs.find(c => c.id === action.clubId);
      if (!item || !club) return state;
      
      if (item.stock <= 0 || item.purchasedCount >= item.purchaseLimit) return state;
      if (club.level < item.requiredClubLevel) return state;
      if (item.requiredClubReputation && club.reputation < item.requiredClubReputation) return state;
      
      const discountedCost = calculateDiscountedClubShopCost(item.cost, club.reputation);
      
      if (club.contributionPoints < (discountedCost.contributionPoints || 0)) return state;
      if ((discountedCost.gold || 0) > state.resources.gold) return state;
      if ((discountedCost.mana || 0) > state.resources.mana) return state;
      if ((discountedCost.food || 0) > state.resources.food) return state;
      if ((discountedCost.reputation || 0) > state.resources.reputation) return state;
      
      const newResources = { ...state.resources };
      const newClubState = { ...state.clubs };
      const newActiveBuffs = [...state.clubs.activeBuffs];
      const events: DailyEvent[] = [];
      
      newResources.gold -= (discountedCost.gold || 0);
      newResources.mana -= (discountedCost.mana || 0);
      newResources.food -= (discountedCost.food || 0);
      newResources.reputation -= (discountedCost.reputation || 0);
      
      newClubState.clubs = state.clubs.clubs.map(c =>
        c.id === club.id
          ? { ...c, contributionPoints: c.contributionPoints - (discountedCost.contributionPoints || 0) }
          : c
      );
      
      newClubState.shopItems = state.clubs.shopItems.map(i =>
        i.id === item.id
          ? { ...i, stock: i.stock - 1, purchasedCount: i.purchasedCount + 1 }
          : i
      );
      
      const makeRecentLogs = (extraEvents: DailyEvent[] = []) => {
        const allEvents = [...events, ...extraEvents];
        const dailyLog: DailyLog = { day: state.day, events: allEvents };
        const recent = state.dailyLogs.slice(-29);
        recent.push(dailyLog);
        return recent;
      };
      
      switch (item.effect.type) {
        case 'resource_gain': {
          const target = item.effect.target as keyof Resource;
          if (target && target in newResources) {
            newResources[target] += item.effect.value;
          }
          break;
        }
        case 'reputation_boost': {
          newResources.reputation += item.effect.value;
          break;
        }
        case 'stat_buff': {
          if (item.effect.target === 'stamina_regen') {
            state.students.forEach(s => {
              const idx = state.students.findIndex(st => st.id === s.id);
              if (idx >= 0) {
                state.students[idx].stamina = clamp(s.stamina + item.effect.value, 0, 100);
              }
            });
          } else if (item.effect.target === 'morale_regen') {
            state.students.forEach(s => {
              const idx = state.students.findIndex(st => st.id === s.id);
              if (idx >= 0) {
                state.students[idx].morale = clamp(s.morale + item.effect.value, 0, 100);
              }
            });
          } else if (item.effect.duration) {
            const buff: ClubBuff = {
              id: `buff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              clubId: club.id,
              name: item.name,
              description: item.description,
              effect: {
                type: item.effect.target as ClubBuffEffect['type'],
                value: item.effect.value,
              },
              remainingDays: item.effect.duration,
              totalDays: item.effect.duration,
              source: item.id,
            };
            newActiveBuffs.push(buff);
          }
          break;
        }
        case 'recruit_ticket': {
          const ticketQuality = item.effect.quality as 'common' | 'rare' | 'epic' | 'legendary';
          const ticketValue = item.effect.value || 1;
          newClubState.clubs = newClubState.clubs.map(c =>
            c.id === club.id
              ? { ...c, contributionPoints: c.contributionPoints - (discountedCost.contributionPoints || 0) }
              : c
          );
          const purchaseEvent: DailyEvent = {
            type: 'club_shop_purchase',
            message: `🛒 从「${club.name}」商店购买了「${item.name}」`,
            clubId: club.id,
            clubName: club.name,
          };
          return {
            ...state,
            resources: newResources,
            clubs: {
              ...newClubState,
              activeBuffs: newActiveBuffs,
            },
            recruitTickets: {
              ...state.recruitTickets,
              [ticketQuality]: state.recruitTickets[ticketQuality] + ticketValue,
            },
            dailyLogs: makeRecentLogs([purchaseEvent]),
          };
        }
      }
      
      events.push({
        type: 'club_shop_purchase',
        message: `🛒 从「${club.name}」商店购买了「${item.name}」`,
        clubId: club.id,
        clubName: club.name,
      });
      
      const recentLogs = makeRecentLogs();
      
      return {
        ...state,
        dailyLogs: recentLogs,
        resources: newResources,
        clubs: {
          ...newClubState,
          activeBuffs: newActiveBuffs,
        },
      };
    }

    case 'REFRESH_CLUB_SHOP': {
      return {
        ...state,
        clubs: {
          ...state.clubs,
          shopItems: refreshClubShop(state.clubs.shopItems),
          shopRefreshDay: state.day,
        },
      };
    }

    case 'ADD_CLUB_BUFF': {
      return {
        ...state,
        clubs: {
          ...state.clubs,
          activeBuffs: [...state.clubs.activeBuffs, action.buff],
        },
      };
    }

    case 'ADD_CLUB_CONTRIBUTION_LOG': {
      return {
        ...state,
        clubs: {
          ...state.clubs,
          contributionLogs: [action.log, ...state.clubs.contributionLogs].slice(0, 100),
        },
      };
    }

    case 'USE_RECRUIT_TICKET': {
      const currentTickets = state.recruitTickets[action.quality];
      if (currentTickets <= 0) return state;
      return {
        ...state,
        recruitTickets: {
          ...state.recruitTickets,
          [action.quality]: currentTickets - 1,
        },
      };
    }

    case 'ADD_RECRUIT_TICKET': {
      return {
        ...state,
        recruitTickets: {
          ...state.recruitTickets,
          [action.quality]: state.recruitTickets[action.quality] + action.amount,
        },
      };
    }

    case 'UNLOCK_TRADE_HARBOR': {
      if (state.tradeHarbor.unlocked) return state;
      const tradeHarborBuilding = state.buildings.find(b => b.id === 'trade_harbor');
      if (!tradeHarborBuilding || tradeHarborBuilding.level === 0) return state;

      const updatedTradeHarbor = updateTradeHarborBonuses(
        { ...state.tradeHarbor, unlocked: true },
        state.buildings
      );

      const unlockEvent: DailyEvent = {
        type: 'trade_harbor_upgrade',
        message: '🏛️ 学院贸易港正式启用！开始你的商业帝国吧',
      };
      const dailyLog: DailyLog = { day: state.day, events: [unlockEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        tradeHarbor: updatedTradeHarbor,
      };
    }

    case 'PLACE_TRADE_ORDER': {
      const { orderType, materialId, quantity, route } = action;
      if (!state.tradeHarbor.unlocked) return state;
      if (quantity <= 0) return state;

      const bonuses = getTradeBuildingBonuses(state.buildings);
      const priceMultiplier = calculateTradePriceBonus(orderType, bonuses.priceBonus);
      const basePrice = state.tradeHarbor.currentPrices[materialId];
      const effectivePrice = Math.round(basePrice * priceMultiplier);
      const totalPrice = effectivePrice * quantity;
      const material = getTradeMaterial(materialId);

      const warehouseCapacity = calculateWarehouseCapacity(state.buildings, bonuses.capacityBonus);

      if (orderType === 'buy') {
        const check = canPlaceBuyOrder(
          materialId, quantity, state.resources.gold,
          effectivePrice, state.tradeHarbor.materials, warehouseCapacity
        );
        if (!check.ok) return state;

        const duration = calculateShipmentDuration(route, bonuses.transportSpeedBonus);
        const risk = calculateShipmentRisk(route, bonuses.riskReduction);

        const orderId = generateTradeOrderId();
        const shipmentId = generateShipmentId();

        const order = {
          id: orderId,
          type: orderType,
          materialId,
          quantity,
          unitPrice: effectivePrice,
          totalPrice,
          createdAt: state.day,
          fulfilledAt: null,
          status: 'fulfilling' as const,
          shipmentId,
        };

        const shipment = {
          id: shipmentId,
          orderId,
          materialId,
          quantity,
          status: 'shipping' as const,
          startDay: state.day,
          durationDays: duration,
          estimatedArrival: state.day + duration,
          arrivedAt: null,
          route,
          risk,
        };

        const placeEvent: DailyEvent = {
          type: 'trade_order_placed',
          message: `📦 采购订单：${material.icon}${material.name} ×${quantity}，共${totalPrice}金币，预计${shipment.estimatedArrival}日到港`,
          materialId,
          materialName: material.name,
          value: totalPrice,
        };
        const dailyLog: DailyLog = { day: state.day, events: [placeEvent] };
        const recentLogs = state.dailyLogs.slice(-29);
        recentLogs.push(dailyLog);

        return {
          ...state,
          dailyLogs: recentLogs,
          resources: { ...state.resources, gold: state.resources.gold - totalPrice },
          tradeHarbor: {
            ...state.tradeHarbor,
            activeOrders: [...state.tradeHarbor.activeOrders, order],
            activeShipments: [...state.tradeHarbor.activeShipments, shipment],
            stats: {
              ...state.tradeHarbor.stats,
              totalTrades: state.tradeHarbor.stats.totalTrades + 1,
              totalVolume: state.tradeHarbor.stats.totalVolume + totalPrice,
            },
          },
        };
      } else {
        const check = canPlaceSellOrder(materialId, quantity, state.tradeHarbor.materials);
        if (!check.ok) return state;

        const duration = calculateShipmentDuration(route, bonuses.transportSpeedBonus);
        const risk = calculateShipmentRisk(route, bonuses.riskReduction);

        const orderId = generateTradeOrderId();
        const shipmentId = generateShipmentId();

        const order = {
          id: orderId,
          type: orderType,
          materialId,
          quantity,
          unitPrice: effectivePrice,
          totalPrice,
          createdAt: state.day,
          fulfilledAt: null,
          status: 'fulfilling' as const,
          shipmentId,
        };

        const shipment = {
          id: shipmentId,
          orderId,
          materialId,
          quantity,
          status: 'shipping' as const,
          startDay: state.day,
          durationDays: duration,
          estimatedArrival: state.day + duration,
          arrivedAt: null,
          route,
          risk,
        };

        const placeEvent: DailyEvent = {
          type: 'trade_order_placed',
          message: `📤 销售订单：${material.icon}${material.name} ×${quantity}，总价${totalPrice}金币，预计${shipment.estimatedArrival}日回款`,
          materialId,
          materialName: material.name,
          value: totalPrice,
        };
        const dailyLog: DailyLog = { day: state.day, events: [placeEvent] };
        const recentLogs = state.dailyLogs.slice(-29);
        recentLogs.push(dailyLog);

        const updatedMaterials = { ...state.tradeHarbor.materials };
        updatedMaterials[materialId] -= quantity;

        return {
          ...state,
          dailyLogs: recentLogs,
          tradeHarbor: {
            ...state.tradeHarbor,
            materials: updatedMaterials,
            warehouse: {
              ...state.tradeHarbor.warehouse,
              usedCapacity: getTotalWarehouseUsed(updatedMaterials),
            },
            activeOrders: [...state.tradeHarbor.activeOrders, order],
            activeShipments: [...state.tradeHarbor.activeShipments, shipment],
            stats: {
              ...state.tradeHarbor.stats,
              totalTrades: state.tradeHarbor.stats.totalTrades + 1,
              totalVolume: state.tradeHarbor.stats.totalVolume + totalPrice,
            },
          },
        };
      }
    }

    case 'CANCEL_TRADE_ORDER': {
      const order = state.tradeHarbor.activeOrders.find(o => o.id === action.orderId);
      if (!order || order.status === 'completed') return state;

      const material = getTradeMaterial(order.materialId);
      const penaltyPrice = Math.round(order.totalPrice * 0.3);

      const newMaterials = { ...state.tradeHarbor.materials };
      let goldRefund = 0;

      if (order.type === 'buy') {
        goldRefund = order.totalPrice - penaltyPrice;
      } else {
        newMaterials[order.materialId] = (newMaterials[order.materialId] || 0) + order.quantity;
      }

      const cancelEvent: DailyEvent = {
        type: 'warning',
        message: `❌ 取消${order.type === 'buy' ? '采购' : '销售'}订单：${material.icon}${material.name}×${order.quantity}，违约金${penaltyPrice}金币`,
        materialId: order.materialId,
        materialName: material.name,
      };
      const dailyLog: DailyLog = { day: state.day, events: [cancelEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: { ...state.resources, gold: state.resources.gold + goldRefund },
        tradeHarbor: {
          ...state.tradeHarbor,
          materials: newMaterials,
          warehouse: {
            ...state.tradeHarbor.warehouse,
            usedCapacity: getTotalWarehouseUsed(newMaterials),
          },
          activeOrders: state.tradeHarbor.activeOrders.map(o =>
            o.id === action.orderId ? { ...o, status: 'cancelled' as const } : o
          ),
          historyOrders: [
            ...state.tradeHarbor.historyOrders,
            { ...order, status: 'cancelled' as const, fulfilledAt: state.day },
          ],
          activeShipments: state.tradeHarbor.activeShipments.filter(s => s.orderId !== action.orderId),
        },
      };
    }

    case 'COMPLETE_TRADE_SHIPMENT': {
      const shipment = state.tradeHarbor.activeShipments.find(s => s.id === action.shipmentId);
      if (!shipment || shipment.status === 'arrived') return state;

      const order = state.tradeHarbor.activeOrders.find(o => o.id === shipment.orderId);
      if (!order) return state;

      const material = getTradeMaterial(shipment.materialId);
      const bonuses = getTradeBuildingBonuses(state.buildings);
      const warehouseCapacity = calculateWarehouseCapacity(state.buildings, bonuses.capacityBonus);

      let lossAmount = 0;
      const riskRoll = Math.random();
      if (riskRoll < shipment.risk) {
        const maxLossRate = Math.min(0.4, shipment.risk * 2);
        const lossRate = Math.random() * maxLossRate;
        lossAmount = Math.floor(shipment.quantity * lossRate);
      }

      const actualQuantity = shipment.quantity - lossAmount;
      const newMaterials = { ...state.tradeHarbor.materials };
      let newGold = state.resources.gold;

      if (order.type === 'buy') {
        const warehouseUsed = getTotalWarehouseUsed(newMaterials);
        const spaceAvailable = Math.max(0, warehouseCapacity - warehouseUsed);
        const finalQuantity = Math.min(actualQuantity, spaceAvailable);
        newMaterials[shipment.materialId] = (newMaterials[shipment.materialId] || 0) + finalQuantity;
        if (finalQuantity < actualQuantity) {
          lossAmount += actualQuantity - finalQuantity;
        }
      } else {
        const actualRevenue = Math.round(order.unitPrice * actualQuantity);
        newGold += actualRevenue;
      }
      const profitLoss = order.type === 'buy'
        ? -order.totalPrice
        : Math.round(order.unitPrice * actualQuantity) - order.unitPrice * order.quantity;

      const completeEvents: DailyEvent[] = [];
      if (lossAmount > 0) {
        completeEvents.push({
          type: 'trade_shipment_risk',
          message: `⚠️ 运输途中损失${lossAmount}份${material.icon}${material.name}！`,
          materialId: shipment.materialId,
          materialName: material.name,
          value: lossAmount,
        });
      }

      completeEvents.push({
        type: 'trade_shipment_arrived',
        message: order.type === 'buy'
          ? `🚛 到港：${material.icon}${material.name} ×${actualQuantity}已入库`
          : `💰 回款：${material.icon}${material.name}销售回款${Math.round(order.unitPrice * actualQuantity)}金币`,
        materialId: shipment.materialId,
        materialName: material.name,
      });

      const dailyLog: DailyLog = { day: state.day, events: completeEvents };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      const completedOrder = {
        ...order,
        status: 'completed' as const,
        fulfilledAt: state.day,
        profitLoss,
      };

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: { ...state.resources, gold: newGold },
        tradeHarbor: {
          ...state.tradeHarbor,
          materials: newMaterials,
          warehouse: {
            ...state.tradeHarbor.warehouse,
            usedCapacity: getTotalWarehouseUsed(newMaterials),
          },
          activeOrders: state.tradeHarbor.activeOrders.filter(o => o.id !== order.id),
          historyOrders: [...state.tradeHarbor.historyOrders, completedOrder],
          activeShipments: state.tradeHarbor.activeShipments.map(s =>
            s.id === action.shipmentId
              ? { ...s, status: 'arrived' as const, arrivedAt: state.day, lossAmount }
              : s
          ),
          stats: {
            ...state.tradeHarbor.stats,
            completedBuys: order.type === 'buy' ? state.tradeHarbor.stats.completedBuys + 1 : state.tradeHarbor.stats.completedBuys,
            completedSells: order.type === 'sell' ? state.tradeHarbor.stats.completedSells + 1 : state.tradeHarbor.stats.completedSells,
            totalProfit: profitLoss > 0 ? state.tradeHarbor.stats.totalProfit + profitLoss : state.tradeHarbor.stats.totalProfit,
            totalLoss: profitLoss < 0 ? state.tradeHarbor.stats.totalLoss + Math.abs(profitLoss) : state.tradeHarbor.stats.totalLoss,
            bestTrade: profitLoss > state.tradeHarbor.stats.bestTrade ? profitLoss : state.tradeHarbor.stats.bestTrade,
            worstTrade: profitLoss < state.tradeHarbor.stats.worstTrade ? profitLoss : state.tradeHarbor.stats.worstTrade,
          },
        },
      };
    }

    case 'REFRESH_TRADE_PRICES': {
      const { prices, trends } = calculateDailyPrices(
        state.day,
        state.tradeHarbor.currentPrices,
        state.tradeHarbor.priceTrends
      );
      const historyRecord = { day: state.day, prices, trends };
      const priceHistory = [...state.tradeHarbor.priceHistory, historyRecord].slice(-30);

      return {
        ...state,
        tradeHarbor: {
          ...state.tradeHarbor,
          currentPrices: prices,
          priceTrends: trends,
          priceHistory,
        },
      };
    }

    case 'UPGRADE_WAREHOUSE': {
      const cost = state.tradeHarbor.warehouse.upgradeCost;
      if (
        state.resources.gold < cost.gold ||
        state.resources.mana < cost.mana ||
        state.resources.food < cost.food ||
        state.resources.reputation < cost.reputation
      ) return state;

      const newCapacity = state.tradeHarbor.warehouse.capacity + 50;
      const nextUpgradeCost = {
        gold: Math.round(cost.gold * 1.5),
        mana: Math.round(cost.mana * 1.5),
        food: Math.round(cost.food * 1.3),
        reputation: Math.round(cost.reputation * 1.4),
      };

      const upgradeEvent: DailyEvent = {
        type: 'trade_harbor_upgrade',
        message: `📦 仓库扩容完成！容量从 ${state.tradeHarbor.warehouse.capacity} 提升到 ${newCapacity}`,
        value: newCapacity,
      };
      const dailyLog: DailyLog = { day: state.day, events: [upgradeEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: {
          gold: state.resources.gold - cost.gold,
          mana: state.resources.mana - cost.mana,
          food: state.resources.food - cost.food,
          reputation: state.resources.reputation - cost.reputation,
        },
        tradeHarbor: {
          ...state.tradeHarbor,
          warehouse: {
            ...state.tradeHarbor.warehouse,
            capacity: newCapacity,
            upgradeCost: nextUpgradeCost,
          },
        },
      };
    }

    case 'RECRUIT_MENTOR': {
      const option = state.mentorState.recruitmentPool.currentOptions.find(o => o.id === action.optionId);
      if (!option || option.locked) return state;
      if (state.mentorState.mentors.length >= state.mentorState.maxMentors) return state;
      if (state.resources.reputation < option.requiredReputation) return state;
      if (state.resources.gold < option.cost.gold ||
          state.resources.mana < option.cost.mana ||
          state.resources.food < option.cost.food ||
          state.resources.reputation < option.cost.reputation) return state;

      const newMentor: Mentor = {
        ...option.mentorTemplate,
        id: `mentor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        status: 'idle',
        assignedCourses: [],
        assignedDungeon: null,
        recruitedAt: state.day,
        totalStudentsTaught: 0,
        totalDungeonsLed: 0,
      };

      const recruitEvent: DailyEvent = {
        type: 'mentor_recruited',
        message: `🎉 招募了新导师「${newMentor.name}」(${MENTOR_QUALITY_NAMES[newMentor.quality]})`,
        mentorId: newMentor.id,
        mentorName: newMentor.name,
      };
      const dailyLog: DailyLog = { day: state.day, events: [recruitEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: {
          gold: state.resources.gold - option.cost.gold,
          mana: state.resources.mana - option.cost.mana,
          food: state.resources.food - option.cost.food,
          reputation: state.resources.reputation - option.cost.reputation,
        },
        mentorState: {
          ...state.mentorState,
          mentors: [...state.mentorState.mentors, newMentor],
          recruitmentPool: {
            ...state.mentorState.recruitmentPool,
            currentOptions: state.mentorState.recruitmentPool.currentOptions.filter(o => o.id !== action.optionId),
          },
        },
      };
    }

    case 'REFRESH_MENTOR_POOL': {
      const pool = state.mentorState.recruitmentPool;
      const cost = pool.refreshCost;
      
      if (action.useFree) {
        if (pool.freeRefreshesUsed >= pool.freeRefreshesPerWeek) return state;
      } else {
        if (state.resources.gold < cost.gold ||
            state.resources.mana < cost.mana ||
            state.resources.food < cost.food ||
            state.resources.reputation < cost.reputation) return state;
      }

      const newOptions = refreshMentorRecruitmentPool(state.day, state.resources.reputation);

      return {
        ...state,
        resources: action.useFree ? state.resources : {
          gold: state.resources.gold - cost.gold,
          mana: state.resources.mana - cost.mana,
          food: state.resources.food - cost.food,
          reputation: state.resources.reputation - cost.reputation,
        },
        mentorState: {
          ...state.mentorState,
          recruitmentPool: {
            ...pool,
            currentOptions: newOptions,
            lastRefreshDay: state.day,
            freeRefreshesUsed: action.useFree ? pool.freeRefreshesUsed + 1 : pool.freeRefreshesUsed,
          },
        },
      };
    }

    case 'ASSIGN_MENTOR_TO_COURSE': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor) return state;
      const check = canAssignMentorToCourse(mentor, action.courseId);
      if (!check.ok) return state;

      const course = state.courses.find(c => c.id === action.courseId);
      const assignEvent: DailyEvent = {
        type: 'mentor_assigned',
        message: `👨‍🏫 ${mentor.name} 开始负责课程「${course?.name || action.courseId}」`,
        mentorId: mentor.id,
        mentorName: mentor.name,
        courseId: action.courseId,
        courseName: course?.name,
      };
      const dailyLog: DailyLog = { day: state.day, events: [assignEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? { ...m, assignedCourses: [...m.assignedCourses, action.courseId], status: 'teaching' as const }
              : m
          ),
        },
      };
    }

    case 'UNASSIGN_MENTOR_FROM_COURSE': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor || !mentor.assignedCourses.includes(action.courseId)) return state;

      const newCourses = mentor.assignedCourses.filter(c => c !== action.courseId);
      const newStatus = newCourses.length === 0 && !mentor.assignedDungeon ? 'idle' : mentor.status;

      return {
        ...state,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? { ...m, assignedCourses: newCourses, status: newStatus as Mentor['status'] }
              : m
          ),
        },
      };
    }

    case 'ASSIGN_MENTOR_TO_DUNGEON': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor && action.dungeonId) return state;

      if (action.dungeonId && mentor) {
        const dungeon = state.dungeons.find(d => d.id === action.dungeonId);
        if (!dungeon) return state;
        const leadResult = canMentorLeadDungeon(mentor, dungeon.level);
        if (!leadResult.canLead) return state;
      }

      const newMentors = state.mentorState.mentors.map(m => {
        if (action.dungeonId && m.id === action.mentorId) {
          return { ...m, assignedDungeon: action.dungeonId, status: 'dungeon_lead' as const };
        }
        if (!action.dungeonId && m.id === action.mentorId) {
          const newStatus = m.assignedCourses.length === 0 ? 'idle' : m.status;
          return { ...m, assignedDungeon: null, status: newStatus as Mentor['status'] };
        }
        if (action.dungeonId && m.assignedDungeon === action.dungeonId) {
          const newStatus = m.assignedCourses.length === 0 ? 'idle' : 'teaching';
          return { ...m, assignedDungeon: null, status: newStatus as Mentor['status'] };
        }
        return m;
      });

      return {
        ...state,
        mentorState: {
          ...state.mentorState,
          mentors: newMentors,
        },
      };
    }

    case 'ADD_MENTOR_EXP': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor) return state;

      let newExp = mentor.exp + action.exp;
      let newLevel = mentor.level;
      let leveledUp = false;

      while (newExp >= newLevel * 100) {
        newExp -= newLevel * 100;
        newLevel++;
        leveledUp = true;
      }

      const events: DailyEvent[] = [];
      if (leveledUp) {
        events.push({
          type: 'mentor_level_up',
          message: `⬆️ ${mentor.name} 升级到 Lv.${newLevel}！`,
          mentorId: mentor.id,
          mentorName: mentor.name,
          value: newLevel,
        });
      }

      const recentLogs = state.dailyLogs.slice(-29);
      if (events.length > 0) {
        recentLogs.push({ day: state.day, events });
      }

      return {
        ...state,
        dailyLogs: recentLogs,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? { ...m, exp: newExp, level: newLevel }
              : m
          ),
        },
      };
    }

    case 'UPGRADE_MENTOR_RANK': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor) return state;

      const nextRank = getNextMentorRank(mentor.rank);
      if (!nextRank) return state;
      if (mentor.exp < mentor.expToNextRank) return state;

      const rankUpEvent: DailyEvent = {
        type: 'mentor_rank_up',
        message: `🏆 ${mentor.name} 晋升为「${MENTOR_RANK_NAMES[nextRank]}」！`,
        mentorId: mentor.id,
        mentorName: mentor.name,
      };
      const dailyLog: DailyLog = { day: state.day, events: [rankUpEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      const newExpToNext = getMentorRankExpRequirement(nextRank);

      return {
        ...state,
        dailyLogs: recentLogs,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? {
                  ...m,
                  rank: nextRank,
                  exp: m.exp - m.expToNextRank,
                  expToNextRank: newExpToNext,
                  expBonus: m.expBonus * 1.1,
                  skillBonus: m.skillBonus * 1.1,
                  maxCourses: Math.min(6, m.maxCourses + 1),
                }
              : m
          ),
        },
      };
    }

    case 'UPGRADE_MENTOR_SPECIALIZATION': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor) return state;

      const spec = mentor.specializations.find(s => s.id === action.specializationId);
      if (!spec || spec.level >= spec.maxLevel) return state;

      let newCurrentExp = spec.currentExp + action.exp;
      let newLevel = spec.level;
      let leveledUp = false;

      while (newCurrentExp >= spec.expToNext && newLevel < spec.maxLevel) {
        newCurrentExp -= spec.expToNext;
        newLevel++;
        leveledUp = true;
      }

      const events: DailyEvent[] = [];
      if (leveledUp) {
        events.push({
          type: 'mentor_specialization_up',
          message: `📚 ${mentor.name} 的「${spec.name}」专精升级到 Lv.${newLevel}！`,
          mentorId: mentor.id,
          mentorName: mentor.name,
          value: newLevel,
        });
      }

      const recentLogs = state.dailyLogs.slice(-29);
      if (events.length > 0) {
        recentLogs.push({ day: state.day, events });
      }

      return {
        ...state,
        dailyLogs: recentLogs,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? {
                  ...m,
                  specializations: m.specializations.map(s =>
                    s.id === action.specializationId
                      ? {
                          ...s,
                          level: newLevel,
                          currentExp: newCurrentExp,
                          expToNext: getSpecializationExpRequirement(newLevel),
                        }
                      : s
                  ),
                }
              : m
          ),
        },
      };
    }

    case 'UNLOCK_MENTOR_SPECIALIZATION': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor) return state;
      if (mentor.specializations.some(s => s.id === action.specializationId)) return state;

      const template = SPECIALIZATION_TEMPLATES[action.specializationId];
      if (!template) return state;

      const newSpec: MentorSpecialization = {
        ...template,
        level: 1,
        currentExp: 0,
        expToNext: getSpecializationExpRequirement(1),
      };

      return {
        ...state,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? { ...m, specializations: [...m.specializations, newSpec] }
              : m
          ),
        },
      };
    }

    case 'ASSIGN_MENTOR_TO_ACADEMY': {
      const mentor = state.mentorState.mentors.find(m => m.id === action.mentorId);
      if (!mentor) return state;

      if (action.academyId) {
        const academy = state.mentorState.academies.find(a => a.id === action.academyId);
        if (!academy || !academy.unlocked) return state;
        const currentAcademyMentors = academy.mentors.filter(id => id !== action.mentorId);
        if (currentAcademyMentors.length >= academy.maxMentors) return state;
      }

      const newAcademies = state.mentorState.academies.map(a => {
        if (mentor.academyId && a.id === mentor.academyId) {
          return { ...a, mentors: a.mentors.filter(id => id !== action.mentorId) };
        }
        if (action.academyId && a.id === action.academyId && !a.mentors.includes(action.mentorId)) {
          return { ...a, mentors: [...a.mentors, action.mentorId] };
        }
        return a;
      });

      return {
        ...state,
        mentorState: {
          ...state.mentorState,
          academies: newAcademies,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentorId
              ? { ...m, academyId: action.academyId }
              : m
          ),
        },
      };
    }

    case 'UPGRADE_ACADEMY': {
      const academy = state.mentorState.academies.find(a => a.id === action.academyId);
      if (!academy || academy.level >= academy.maxLevel) return state;
      if (!academy.unlocked) return state;

      const cost = getAcademyUpgradeCost(academy);
      if (state.resources.gold < cost.gold ||
          state.resources.mana < cost.mana ||
          state.resources.food < cost.food ||
          state.resources.reputation < cost.reputation) return state;

      const upgradeEvent: DailyEvent = {
        type: 'academy_level_up',
        message: `🏛️ 「${academy.name}」升级到 Lv.${academy.level + 1}！`,
        academyId: academy.id,
        academyName: academy.name,
        value: academy.level + 1,
      };
      const dailyLog: DailyLog = { day: state.day, events: [upgradeEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: {
          gold: state.resources.gold - cost.gold,
          mana: state.resources.mana - cost.mana,
          food: state.resources.food - cost.food,
          reputation: state.resources.reputation - cost.reputation,
        },
        mentorState: {
          ...state.mentorState,
          academies: state.mentorState.academies.map(a =>
            a.id === action.academyId
              ? { ...a, level: a.level + 1, maxMentors: a.maxMentors + (a.level % 2 === 0 ? 1 : 0) }
              : a
          ),
        },
      };
    }

    case 'UNLOCK_ACADEMY': {
      const academy = state.mentorState.academies.find(a => a.id === action.academyId);
      if (!academy || academy.unlocked) return state;
      if (state.resources.reputation < academy.requiredReputation) return state;

      const unlockCost: Resource = {
        gold: 500 * (academy.type === 'mixed' ? 1.5 : 1),
        mana: 300 * (academy.type === 'mixed' ? 1.5 : 1),
        food: 100,
        reputation: academy.requiredReputation,
      };

      if (state.resources.gold < unlockCost.gold ||
          state.resources.mana < unlockCost.mana ||
          state.resources.food < unlockCost.food) return state;

      return {
        ...state,
        resources: {
          gold: state.resources.gold - unlockCost.gold,
          mana: state.resources.mana - unlockCost.mana,
          food: state.resources.food - unlockCost.food,
          reputation: state.resources.reputation - unlockCost.reputation,
        },
        mentorState: {
          ...state.mentorState,
          academies: state.mentorState.academies.map(a =>
            a.id === action.academyId
              ? { ...a, unlocked: true, level: 1 }
              : a
          ),
        },
      };
    }

    case 'UPDATE_MENTOR': {
      return {
        ...state,
        mentorState: {
          ...state.mentorState,
          mentors: state.mentorState.mentors.map(m =>
            m.id === action.mentor.id ? action.mentor : m
          ),
        },
      };
    }

    case 'UNLOCK_ALCHEMY': {
      if (state.alchemy.unlocked) return state;
      const alchemyBuilding = state.buildings.find(b => b.id === 'alchemy_workshop');
      if (!alchemyBuilding || alchemyBuilding.level === 0) return state;
      if (state.resources.reputation < getWorkshopRequiredReputation()) return state;

      const unlockEvent: DailyEvent = {
        type: 'alchemy_workshop_upgraded',
        message: '⚗️ 炼金工坊正式启用！开始你的炼金之旅吧',
      };
      const dailyLog: DailyLog = { day: state.day, events: [unlockEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        alchemy: { ...state.alchemy, unlocked: true },
      };
    }

    case 'UPGRADE_ALCHEMY_WORKSHOP': {
      if (!state.alchemy.unlocked) return state;
      if (state.alchemy.workshopLevel >= state.alchemy.maxWorkshopLevel) return state;
      const cost = getWorkshopUpgradeCost(state.alchemy.workshopLevel);
      if (state.resources.gold < cost.gold || state.resources.mana < cost.mana ||
          state.resources.food < cost.food || state.resources.reputation < cost.reputation) return state;

      const newLevel = state.alchemy.workshopLevel + 1;
      const newSlots = getCraftingSlotsForLevel(newLevel);
      const upgradeEvent: DailyEvent = {
        type: 'alchemy_workshop_upgraded',
        message: `⚗️ 炼金工坊升级到 Lv.${newLevel}！制作位: ${newSlots}`,
        value: newLevel,
      };
      const dailyLog: DailyLog = { day: state.day, events: [upgradeEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: {
          gold: state.resources.gold - cost.gold,
          mana: state.resources.mana - cost.mana,
          food: state.resources.food - cost.food,
          reputation: state.resources.reputation - cost.reputation,
        },
        alchemy: {
          ...state.alchemy,
          workshopLevel: newLevel,
          craftingSlots: newSlots,
        },
      };
    }

    case 'CRAFT_POTION': {
      const recipe = state.alchemy.recipes.find(r => r.id === action.potionId);
      if (!recipe) return state;
      const check = canCraftPotion(
        recipe, state.alchemy.materials, state.resources.gold, state.resources.mana,
        state.alchemy.workshopLevel, state.alchemy.activeCraftings.length,
        state.alchemy.craftingSlots, state.resources.reputation
      );
      if (!check.ok) return state;

      const newMaterials = { ...state.alchemy.materials };
      for (const [matId, qty] of Object.entries(recipe.materials)) {
        newMaterials[matId as AlchemyMaterialId] -= qty;
      }

      const craftingId = `craft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const alchemyBuildingLevel = state.buildings.find(b => b.id === 'alchemy_workshop')?.level || 1;
      const craftTimeReduction = 1 - Math.min(0.5, alchemyBuildingLevel * 0.05);
      const craftingTime = Math.max(1, Math.ceil(recipe.craftingTime * craftTimeReduction)) * action.quantity;
      const newCrafting: ActiveCrafting = {
        id: craftingId,
        potionId: action.potionId,
        startedAt: state.day,
        completesAt: state.day + craftingTime,
        quantity: action.quantity,
      };

      return {
        ...state,
        resources: {
          gold: state.resources.gold - recipe.goldCost * action.quantity,
          mana: state.resources.mana - recipe.manaCost * action.quantity,
          food: state.resources.food,
          reputation: state.resources.reputation,
        },
        alchemy: {
          ...state.alchemy,
          materials: newMaterials,
          activeCraftings: [...state.alchemy.activeCraftings, newCrafting],
        },
      };
    }

    case 'COMPLETE_CRAFTING': {
      const crafting = state.alchemy.activeCraftings.find(c => c.id === action.craftingId);
      if (!crafting) return state;
      if (state.day < crafting.completesAt) return state;

      const recipe = state.alchemy.recipes.find(r => r.id === crafting.potionId);
      const potionName = recipe?.name || crafting.potionId;
      const newPotions = { ...state.alchemy.potions };
      newPotions[crafting.potionId] = (newPotions[crafting.potionId] || 0) + crafting.quantity;

      const newPotionsCrafted = { ...state.alchemy.stats.potionsCrafted };
      newPotionsCrafted[crafting.potionId] = (newPotionsCrafted[crafting.potionId] || 0) + crafting.quantity;

      const completeEvent: DailyEvent = {
        type: 'alchemy_craft_complete',
        message: `⚗️ ${potionName} ×${crafting.quantity} 制作完成！`,
        value: crafting.quantity,
      };
      const dailyLog: DailyLog = { day: state.day, events: [completeEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        alchemy: {
          ...state.alchemy,
          potions: newPotions,
          activeCraftings: state.alchemy.activeCraftings.filter(c => c.id !== action.craftingId),
          stats: {
            ...state.alchemy.stats,
            totalCrafted: state.alchemy.stats.totalCrafted + crafting.quantity,
            potionsCrafted: newPotionsCrafted,
          },
        },
      };
    }

    case 'SYNTHESIZE_MATERIAL': {
      const recipe = state.alchemy.synthesisRecipes.find(r => r.id === action.recipeId);
      if (!recipe) return state;
      const check = canSynthesizeMaterial(recipe, state.alchemy.materials, state.resources.gold, state.alchemy.workshopLevel);
      if (!check.ok) return state;

      const newMaterials = { ...state.alchemy.materials };
      for (const [matId, qty] of Object.entries(recipe.inputs)) {
        newMaterials[matId as AlchemyMaterialId] -= qty;
      }
      newMaterials[recipe.output.materialId] = (newMaterials[recipe.output.materialId] || 0) + recipe.output.quantity;

      const outputMat = getAlchemyMaterial(recipe.output.materialId);
      const synthEvent: DailyEvent = {
        type: 'alchemy_material_synthesized',
        message: `⚗️ 合成 ${outputMat.icon}${outputMat.name} ×${recipe.output.quantity}`,
        value: recipe.output.quantity,
      };
      const dailyLog: DailyLog = { day: state.day, events: [synthEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: {
          ...state.resources,
          gold: state.resources.gold - recipe.goldCost,
        },
        alchemy: {
          ...state.alchemy,
          materials: newMaterials,
          stats: {
            ...state.alchemy.stats,
            totalMaterialsSynthesized: state.alchemy.stats.totalMaterialsSynthesized + 1,
          },
        },
      };
    }

    case 'USE_POTION': {
      const potionCount = state.alchemy.potions[action.potionId] || 0;
      if (potionCount <= 0) return state;
      const recipe = state.alchemy.recipes.find(r => r.id === action.potionId);
      if (!recipe) return state;

      const newPotions = { ...state.alchemy.potions };
      newPotions[action.potionId] -= 1;

      const newResources = { ...state.resources };
      const newStudents = [...state.students];
      const newBuffs = [...state.alchemy.activeBuffs];
      const useEvents: DailyEvent[] = [];

      for (const effect of recipe.effects) {
        switch (effect.type) {
          case 'heal_hp': {
            if (action.studentId) {
              const idx = newStudents.findIndex(s => s.id === action.studentId);
              if (idx >= 0) {
                const healed = Math.min(effect.value, newStudents[idx].maxHp - newStudents[idx].currentHp);
                newStudents[idx] = { ...newStudents[idx], currentHp: newStudents[idx].currentHp + healed };
                useEvents.push({
                  type: 'hp_heal',
                  message: `💚 ${newStudents[idx].name} 使用${recipe.name}，恢复${healed} HP`,
                  studentId: action.studentId,
                  value: healed,
                });
              }
            }
            break;
          }
          case 'restore_mana': {
            newResources.mana += effect.value;
            useEvents.push({
              type: 'alchemy_potion_used',
              message: `🔮 使用${recipe.name}，恢复${effect.value}魔力`,
              value: effect.value,
            });
            break;
          }
          case 'restore_stamina': {
            if (action.studentId) {
              const idx = newStudents.findIndex(s => s.id === action.studentId);
              if (idx >= 0) {
                newStudents[idx] = { ...newStudents[idx], stamina: clamp(newStudents[idx].stamina + effect.value, 0, 100) };
                useEvents.push({
                  type: 'alchemy_potion_used',
                  message: `⚡ ${newStudents[idx].name} 使用${recipe.name}，恢复${effect.value}体力`,
                  studentId: action.studentId,
                  value: effect.value,
                });
              }
            }
            break;
          }
          case 'morale_boost': {
            if (action.studentId) {
              const idx = newStudents.findIndex(s => s.id === action.studentId);
              if (idx >= 0) {
                newStudents[idx] = { ...newStudents[idx], morale: clamp(newStudents[idx].morale + effect.value, 0, 100) };
              }
            }
            useEvents.push({
              type: 'alchemy_potion_used',
              message: `😊 使用${recipe.name}，士气+${effect.value}`,
              value: effect.value,
            });
            break;
          }
          case 'reputation_gain': {
            newResources.reputation += effect.value;
            useEvents.push({
              type: 'alchemy_potion_used',
              message: `⭐ 使用${recipe.name}，获得${effect.value}声望`,
              value: effect.value,
            });
            break;
          }
          case 'gold_gain': {
            newResources.gold += effect.value;
            useEvents.push({
              type: 'alchemy_potion_used',
              message: `💰 使用${recipe.name}，获得${effect.value}金币`,
              value: effect.value,
            });
            break;
          }
          case 'exp_boost':
          case 'course_speed_boost':
          case 'damage_boost':
          case 'defense_boost':
          case 'sweep_bonus': {
            const buff: ActivePotionBuff = {
              id: `buff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              potionId: action.potionId,
              potionName: recipe.name,
              effects: [effect],
              appliedAt: state.day,
              expiresAt: state.day + (effect.duration || 1),
              studentId: action.studentId,
              dungeonId: action.dungeonId,
            };
            newBuffs.push(buff);
            useEvents.push({
              type: 'alchemy_potion_used',
              message: `✨ 使用${recipe.name}，获得增益效果`,
              value: effect.value,
            });
            break;
          }
        }
      }

      const dailyLog: DailyLog = { day: state.day, events: useEvents };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: newResources,
        students: newStudents,
        alchemy: {
          ...state.alchemy,
          potions: newPotions,
          activeBuffs: newBuffs,
          stats: {
            ...state.alchemy.stats,
            totalUsed: state.alchemy.stats.totalUsed + 1,
          },
        },
      };
    }

    case 'SELL_POTION': {
      const potionCount = state.alchemy.potions[action.potionId] || 0;
      if (potionCount < action.quantity) return state;
      const recipe = state.alchemy.recipes.find(r => r.id === action.potionId);
      if (!recipe) return state;

      const sellGold = recipe.sellPrice * action.quantity;
      const newPotions = { ...state.alchemy.potions };
      newPotions[action.potionId] -= action.quantity;

      const sellEvent: DailyEvent = {
        type: 'alchemy_potion_sold',
        message: `💰 出售${recipe.name} ×${action.quantity}，获得${sellGold}金币`,
        value: sellGold,
      };
      const dailyLog: DailyLog = { day: state.day, events: [sellEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: { ...state.resources, gold: state.resources.gold + sellGold },
        alchemy: {
          ...state.alchemy,
          potions: newPotions,
          stats: {
            ...state.alchemy.stats,
            totalSold: state.alchemy.stats.totalSold + action.quantity,
            totalGoldEarned: state.alchemy.stats.totalGoldEarned + sellGold,
          },
        },
      };
    }

    case 'SELL_MATERIAL': {
      const matCount = state.alchemy.materials[action.materialId] || 0;
      if (matCount < action.quantity) return state;
      const matDef = getAlchemyMaterial(action.materialId);
      const sellGold = matDef.sellPrice * action.quantity;

      const newMaterials = { ...state.alchemy.materials };
      newMaterials[action.materialId] -= action.quantity;

      const sellEvent: DailyEvent = {
        type: 'alchemy_potion_sold',
        message: `💰 出售${matDef.icon}${matDef.name} ×${action.quantity}，获得${sellGold}金币`,
        value: sellGold,
      };
      const dailyLog: DailyLog = { day: state.day, events: [sellEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        resources: { ...state.resources, gold: state.resources.gold + sellGold },
        alchemy: {
          ...state.alchemy,
          materials: newMaterials,
          stats: {
            ...state.alchemy.stats,
            totalSold: state.alchemy.stats.totalSold + action.quantity,
            totalGoldEarned: state.alchemy.stats.totalGoldEarned + sellGold,
          },
        },
      };
    }

    case 'ADD_DUNGEON_MATERIAL_DROPS': {
      const drops = rollDungeonMaterialDrops(action.dungeonId, action.stars);
      if (Object.keys(drops).length === 0) return state;

      const newMaterials = { ...state.alchemy.materials };
      const dropMessages: string[] = [];
      for (const [matId, qty] of Object.entries(drops)) {
        newMaterials[matId as AlchemyMaterialId] = (newMaterials[matId as AlchemyMaterialId] || 0) + qty;
        const matDef = getAlchemyMaterial(matId as AlchemyMaterialId);
        dropMessages.push(`${matDef.icon}${matDef.name}×${qty}`);
      }

      const dropEvent: DailyEvent = {
        type: 'alchemy_material_synthesized',
        message: `⚗️ 副本材料掉落: ${dropMessages.join(' ')}`,
        value: Object.values(drops).reduce((a, b) => a + b, 0),
      };
      const dailyLog: DailyLog = { day: state.day, events: [dropEvent] };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        alchemy: {
          ...state.alchemy,
          materials: newMaterials,
        },
      };
    }

    case 'TICK_ALCHEMY_CRAFTINGS': {
      const completed: ActiveCrafting[] = [];
      const stillActive: ActiveCrafting[] = [];
      for (const c of state.alchemy.activeCraftings) {
        if (state.day >= c.completesAt) {
          completed.push(c);
        } else {
          stillActive.push(c);
        }
      }
      if (completed.length === 0) return state;

      const newPotions = { ...state.alchemy.potions };
      const newPotionsCrafted = { ...state.alchemy.stats.potionsCrafted };
      let totalCrafted = state.alchemy.stats.totalCrafted;
      const completeEvents: DailyEvent[] = [];

      for (const c of completed) {
        newPotions[c.potionId] = (newPotions[c.potionId] || 0) + c.quantity;
        newPotionsCrafted[c.potionId] = (newPotionsCrafted[c.potionId] || 0) + c.quantity;
        totalCrafted += c.quantity;
        const recipe = state.alchemy.recipes.find(r => r.id === c.potionId);
        completeEvents.push({
          type: 'alchemy_craft_complete',
          message: `⚗️ ${recipe?.name || c.potionId} ×${c.quantity} 制作完成！`,
          value: c.quantity,
        });
      }

      const dailyLog: DailyLog = { day: state.day, events: completeEvents };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      return {
        ...state,
        dailyLogs: recentLogs,
        alchemy: {
          ...state.alchemy,
          potions: newPotions,
          activeCraftings: stillActive,
          stats: {
            ...state.alchemy.stats,
            totalCrafted,
            potionsCrafted: newPotionsCrafted,
          },
        },
      };
    }

    case 'EXPIRE_ALCHEMY_BUFFS': {
      const active: ActivePotionBuff[] = [];
      const expired: ActivePotionBuff[] = [];
      for (const b of state.alchemy.activeBuffs) {
        if (state.day >= b.expiresAt) {
          expired.push(b);
        } else {
          active.push(b);
        }
      }
      if (expired.length === 0) return state;
      return {
        ...state,
        alchemy: {
          ...state.alchemy,
          activeBuffs: active,
        },
      };
    }

    case 'NEXT_DAY': {
      const todayEvents: DailyEvent[] = [];
      const libraryLevel = state.buildings.find(b => b.id === 'library')?.level || 0;
      const dormitoryLevel = state.buildings.find(b => b.id === 'dormitory')?.level || 0;
      const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
      const efficiencyBonus = calculateSynergyBonus(state.buildings, 'efficiency');
      const baseExpMultiplier = 1 + libraryLevel * 0.1 + efficiencyBonus * 0.01;

      const dormitoryBonus = state.dormitory.dailyBonus;
      if (dormitoryBonus.courseEfficiency > 0 || dormitoryBonus.staminaRegenBonus > 0 || dormitoryBonus.moraleRegenBonus > 0) {
        const bonusParts: string[] = [];
        if (dormitoryBonus.courseEfficiency > 0) bonusParts.push(`课程效率+${dormitoryBonus.courseEfficiency}%`);
        if (dormitoryBonus.staminaRegenBonus > 0) bonusParts.push(`体力恢复+${dormitoryBonus.staminaRegenBonus}%`);
        if (dormitoryBonus.moraleRegenBonus > 0) bonusParts.push(`心情恢复+${dormitoryBonus.moraleRegenBonus}%`);
        todayEvents.push({
          type: 'dormitory_bonus_applied',
          message: `🏠 宿舍加成生效: ${bonusParts.join(', ')}`,
        });
      }

      const dailyIncome = calculateDailyIncome(state.buildings, state.resources.reputation);
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

      const completedCourses: { studentId: string; studentName: string; courseId: string; courseName: string }[] = [];
      const leftStudents: { id: string; name: string }[] = [];
      const dailyUsedPotionBuffIds = new Set<string>();

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
        const dormMoraleBonus = dormitoryBonus.moraleRegenBonus > 0 ? Math.ceil(dormitoryBonus.moraleRegenBonus) : 0;
        const dormStaminaBonus = dormitoryBonus.staminaRegenBonus > 0 ? Math.ceil(dormitoryBonus.staminaRegenBonus) : 0;

        let restActivityStaminaBonus = 0;
        let restActivityMoraleBonus = 0;
        let restActivityHpBonus = 0;
        const todaySchedule = state.dormitory.schedules.find(
          s => s.studentId === student.id && s.day === state.day
        );
        if (todaySchedule) {
          const studentRoom = state.dormitory.rooms.find(r => r.residentIds.includes(student.id));
          const roomComfort = studentRoom?.comfort || calculateDormitoryComfort(dormitoryLevel, diningHallLevel);
          const restResult = calculateRestActivityResult(
            todaySchedule.activity,
            dormitoryLevel,
            diningHallLevel,
            roomComfort
          );
          restActivityStaminaBonus = restResult.staminaChange;
          restActivityMoraleBonus = restResult.moraleChange;
          restActivityHpBonus = restResult.hpChange;
          if (restActivityStaminaBonus !== 0 || restActivityMoraleBonus !== 0 || restActivityHpBonus !== 0) {
            const activityDef = REST_ACTIVITIES.find(a => a.id === todaySchedule.activity);
            todayEvents.push({
              type: 'dormitory_rest_activity',
              message: `${activityDef?.icon || '😴'} ${student.name} 进行「${activityDef?.name || todaySchedule.activity}」`,
              studentId: student.id,
              studentName: student.name,
            });
          }
        }

        const newMorale = clamp(student.morale + moraleChange + dormMoraleBonus + restActivityMoraleBonus, 0, 100);
        const newStamina = clamp(student.stamina + staminaChange + dormStaminaBonus + restActivityStaminaBonus, 0, 100);
        const newCurrentHp = student.maxHp > 0 ? Math.min(student.currentHp + hpRecovery + restActivityHpBonus, student.maxHp) : student.currentHp;

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
          const dormCourseBonus = 1 + dormitoryBonus.courseEfficiency / 100;
          const efficiencyMult = moraleMult * staminaMult * hpMult * dormCourseBonus;
          
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
          const studentPotionBuffs = getPotionCourseBuffs(state.alchemy.activeBuffs, student.id);
          const dailyBreakdown = calculateCourseBenefit(
            dailyBaseExp,
            student,
            course,
            state.buildings,
            state.teachers,
            state.mentorState.mentors,
            state.mentorState.academies,
            studentPotionBuffs
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
                state.teachers,
                state.mentorState.mentors,
                state.mentorState.academies,
                studentPotionBuffs
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
            let newGrowthRecords = [...student.growthRecords];
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

            completedCourses.push({ studentId: student.id, studentName: student.name, courseId: course.id, courseName: course.name });
            for (const id of studentPotionBuffs.usedBuffIds) dailyUsedPotionBuffIds.add(id);
            
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

            let promotedStudent: StudentType = {
              ...student,
              level: finalLevel,
              exp: finalExp,
              skills: newSkills,
              maxHp: finalMaxHp,
              currentHp: finalCurrentHp,
              growthRecords: newGrowthRecords,
              morale: newMorale,
              stamina: newStamina,
            };

            const promotionResult = tryStudentPromotion(
              promotedStudent,
              state.mentorState.mentors,
              state.mentorState.academies
            );

            if (promotionResult.qualityUpgraded && promotionResult.newQuality) {
              promotedStudent = applyQualityUpgradeToStudent(
                promotedStudent,
                promotionResult.newQuality,
                state.day
              );
              todayEvents.push({
                type: 'student_promoted',
                message: `🌟 ${student.name} 品质晋升！${promotionResult.oldQuality} → ${promotionResult.newQuality}`,
                studentId: student.id,
                studentName: student.name,
                value: 1,
              });
            }

            if (promotionResult.bonusExpGained > 0) {
              let bonusExp = promotedStudent.exp + promotionResult.bonusExpGained;
              let bonusLevel = promotedStudent.level;
              let bonusLeveledUp = false;
              const oldBonusLevel = bonusLevel;
              while (bonusExp >= bonusLevel * 100) {
                bonusExp -= bonusLevel * 100;
                bonusLevel++;
                bonusLeveledUp = true;
              }
              if (bonusLeveledUp) {
                const levelRecord: GrowthRecord = {
                  id: `growth_${student.id}_bonus_${Date.now()}`,
                  type: 'level_up',
                  day: state.day,
                  description: `导师加成升级: Lv.${oldBonusLevel} → Lv.${bonusLevel}`,
                  details: { oldLevel: oldBonusLevel, newLevel: bonusLevel, fromMentor: true },
                };
                promotedStudent = {
                  ...promotedStudent,
                  level: bonusLevel,
                  exp: bonusExp,
                  growthRecords: [...promotedStudent.growthRecords, levelRecord],
                };
                const hpRecalc = recalculateStudentMaxHp({
                  ...promotedStudent,
                  maxHp: promotedStudent.maxHp,
                  currentHp: promotedStudent.currentHp,
                });
                promotedStudent.maxHp = hpRecalc.maxHp;
                promotedStudent.currentHp = hpRecalc.currentHp;
              } else {
                promotedStudent = { ...promotedStudent, exp: bonusExp };
              }
            }

            finalLevel = promotedStudent.level;
            finalExp = promotedStudent.exp;
            newSkills = promotedStudent.skills;
            finalMaxHp = promotedStudent.maxHp;
            finalCurrentHp = promotedStudent.currentHp;
            newGrowthRecords = promotedStudent.growthRecords;

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

            let progressStudent: StudentType = {
              ...student,
              level: newLevel,
              exp: newExp,
              maxHp: progressingMaxHp,
              currentHp: progressingCurrentHp,
              morale: newMorale,
              stamina: newStamina,
            };

            if (newLevel > student.level) {
              const dailyPromoResult = tryStudentPromotion(
                progressStudent,
                state.mentorState.mentors,
                state.mentorState.academies
              );

              if (dailyPromoResult.qualityUpgraded && dailyPromoResult.newQuality) {
                progressStudent = applyQualityUpgradeToStudent(
                  progressStudent,
                  dailyPromoResult.newQuality,
                  state.day
                );
                todayEvents.push({
                  type: 'student_promoted',
                  message: `🌟 ${student.name} 品质晋升！${dailyPromoResult.oldQuality} → ${dailyPromoResult.newQuality}`,
                  studentId: student.id,
                  studentName: student.name,
                  value: 1,
                });
              }

              if (dailyPromoResult.bonusExpGained > 0) {
                let bonusExp = progressStudent.exp + dailyPromoResult.bonusExpGained;
                let bonusLevel = progressStudent.level;
                let bonusLeveledUp = false;
                const oldBonusLevel = bonusLevel;
                while (bonusExp >= bonusLevel * 100) {
                  bonusExp -= bonusLevel * 100;
                  bonusLevel++;
                  bonusLeveledUp = true;
                }
                if (bonusLeveledUp) {
                  const levelRecord: GrowthRecord = {
                    id: `growth_${student.id}_daily_bonus_${Date.now()}`,
                    type: 'level_up',
                    day: state.day,
                    description: `导师加成升级: Lv.${oldBonusLevel} → Lv.${bonusLevel}`,
                    details: { oldLevel: oldBonusLevel, newLevel: bonusLevel, fromMentor: true },
                  };
                  progressStudent = {
                    ...progressStudent,
                    level: bonusLevel,
                    exp: bonusExp,
                    growthRecords: [...progressStudent.growthRecords, levelRecord],
                  };
                  const hpRecalc = recalculateStudentMaxHp({
                    ...progressStudent,
                    maxHp: progressStudent.maxHp,
                    currentHp: progressStudent.currentHp,
                  });
                  progressStudent.maxHp = hpRecalc.maxHp;
                  progressStudent.currentHp = hpRecalc.currentHp;
                } else {
                  progressStudent = { ...progressStudent, exp: bonusExp };
                }
              }
            }

            updatedStudents.push({
              ...progressStudent,
              courseProgress: newProgress,
              courseDaysRemaining: daysRemaining,
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

      let finalResources = {
        gold: Math.max(0, workingResources.gold),
        mana: Math.max(0, workingResources.mana),
        food: Math.max(0, workingResources.food),
        reputation: Math.max(0, workingResources.reputation),
      };

      const newDay = state.day + 1;

      let newTradeHarbor = { ...state.tradeHarbor };
      if (state.tradeHarbor.unlocked) {
        const tradeBonuses = getTradeBuildingBonuses(state.buildings);
        newTradeHarbor = updateTradeHarborBonuses(newTradeHarbor, state.buildings);

        const { prices, trends } = calculateDailyPrices(
          newDay,
          newTradeHarbor.currentPrices,
          newTradeHarbor.priceTrends
        );
        const historyRecord = { day: newDay, prices, trends };
        newTradeHarbor.priceHistory = [...newTradeHarbor.priceHistory, historyRecord].slice(-30);
        newTradeHarbor.currentPrices = prices;
        newTradeHarbor.priceTrends = trends;

        const tempMaterials = { ...newTradeHarbor.materials };
        let tempGold = finalResources.gold;
        const completedShipmentIds: string[] = [];
        const completedOrderIds: string[] = [];

        for (const shipment of newTradeHarbor.activeShipments) {
          if (shipment.status !== 'shipping') continue;
          if (newDay < shipment.estimatedArrival) continue;

          const order = newTradeHarbor.activeOrders.find(o => o.id === shipment.orderId);
          if (!order) continue;

          const material = getTradeMaterial(shipment.materialId);
          const warehouseCapacity = calculateWarehouseCapacity(state.buildings, tradeBonuses.capacityBonus);

          let lossAmount = 0;
          const riskRoll = Math.random();
          if (riskRoll < shipment.risk) {
            const maxLossRate = Math.min(0.4, shipment.risk * 2);
            const lossRate = Math.random() * maxLossRate;
            lossAmount = Math.floor(shipment.quantity * lossRate);
          }

          const actualQuantity = shipment.quantity - lossAmount;
          let finalReceivedQuantity = actualQuantity;

          if (order.type === 'buy') {
            const warehouseUsed = getTotalWarehouseUsed(tempMaterials);
            const spaceAvailable = Math.max(0, warehouseCapacity - warehouseUsed);
            finalReceivedQuantity = Math.min(actualQuantity, spaceAvailable);
            tempMaterials[shipment.materialId] = (tempMaterials[shipment.materialId] || 0) + finalReceivedQuantity;
            if (finalReceivedQuantity < actualQuantity) {
              lossAmount += actualQuantity - finalReceivedQuantity;
            }
          } else {
            const actualRevenue = Math.round(order.unitPrice * actualQuantity);
            tempGold += actualRevenue;
          }
          const profitLoss = order.type === 'buy'
            ? -order.totalPrice
            : Math.round(order.unitPrice * actualQuantity) - order.unitPrice * order.quantity;

          if (lossAmount > 0) {
            todayEvents.push({
              type: 'trade_shipment_risk',
              message: `⚠️ 运输途中损失${lossAmount}份${material.icon}${material.name}！`,
              materialId: shipment.materialId,
              materialName: material.name,
              value: lossAmount,
            });
          }

          todayEvents.push({
            type: 'trade_shipment_arrived',
            message: order.type === 'buy'
              ? `🚛 到港：${material.icon}${material.name} ×${finalReceivedQuantity}已入库`
              : `💰 回款：${material.icon}${material.name}销售回款${Math.round(order.unitPrice * actualQuantity)}金币`,
            materialId: shipment.materialId,
            materialName: material.name,
          });

          completedShipmentIds.push(shipment.id);
          completedOrderIds.push(order.id);

          newTradeHarbor.stats = {
            ...newTradeHarbor.stats,
            completedBuys: order.type === 'buy' ? newTradeHarbor.stats.completedBuys + 1 : newTradeHarbor.stats.completedBuys,
            completedSells: order.type === 'sell' ? newTradeHarbor.stats.completedSells + 1 : newTradeHarbor.stats.completedSells,
            totalProfit: profitLoss > 0 ? newTradeHarbor.stats.totalProfit + profitLoss : newTradeHarbor.stats.totalProfit,
            totalLoss: profitLoss < 0 ? newTradeHarbor.stats.totalLoss + Math.abs(profitLoss) : newTradeHarbor.stats.totalLoss,
            bestTrade: profitLoss > newTradeHarbor.stats.bestTrade ? profitLoss : newTradeHarbor.stats.bestTrade,
            worstTrade: profitLoss < newTradeHarbor.stats.worstTrade ? profitLoss : newTradeHarbor.stats.worstTrade,
          };

          newTradeHarbor.historyOrders.push({
            ...order,
            status: 'completed',
            fulfilledAt: newDay,
            profitLoss,
          });
        }

        newTradeHarbor.activeShipments = newTradeHarbor.activeShipments
          .filter(s => !completedShipmentIds.includes(s.id));
        newTradeHarbor.activeOrders = newTradeHarbor.activeOrders
          .filter(o => !completedOrderIds.includes(o.id));
        newTradeHarbor.materials = tempMaterials;
        newTradeHarbor.warehouse = {
          ...newTradeHarbor.warehouse,
          usedCapacity: getTotalWarehouseUsed(tempMaterials),
        };
        finalResources = { ...finalResources, gold: tempGold };
      }

      let newEventCenter = { ...state.eventCenter };
      if (state.eventCenter.unlocked && !state.eventCenter.currentEvent && state.students.length > 0) {
        const daysSinceLastEvent = newDay - state.eventCenter.lastEventDay;
        if (daysSinceLastEvent >= state.eventCenter.minDaysBetweenEvents) {
          if (Math.random() < state.eventCenter.eventChance) {
            const triggered = selectRandomEvent(
              newDay,
              state.resources.reputation,
              updatedStudents.length,
              state.eventCenter.cooldowns,
              null
            );
            if (triggered) {
              newEventCenter = { ...newEventCenter, currentEvent: triggered };
              todayEvents.push({
                type: 'event_center_triggered',
                message: `${triggered.icon} 事件发生：${triggered.name}！请到事件中心处理`,
              });
            }
          }
        }
      } else if (!state.eventCenter.unlocked && state.day >= 3 && updatedStudents.length >= 1) {
        newEventCenter = { ...newEventCenter, unlocked: true };
        todayEvents.push({
          type: 'event_center_triggered',
          message: '📢 学院事件中心已开启！每日推进时可能触发随机事件',
        });
      }

      const dailyLog: DailyLog = {
        day: state.day,
        events: todayEvents,
      };

      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push(dailyLog);

      let newDailySnapshots = state.dailySnapshots;
      if (state.autoSaveConfig.saveOnDayAdvance) {
        const avgMorale = updatedStudents.length > 0
          ? updatedStudents.reduce((sum, s) => sum + s.morale, 0) / updatedStudents.length
          : 0;
        const avgStamina = updatedStudents.length > 0
          ? updatedStudents.reduce((sum, s) => sum + s.stamina, 0) / updatedStudents.length
          : 0;
        const studyingCount = updatedStudents.filter(s => s.status === 'studying').length;
        const restingCount = updatedStudents.filter(s => s.status === 'resting').length;
        const totalExp = updatedStudents.reduce((sum, s) => sum + s.exp, 0);
        const buildingLevels: Record<string, number> = {};
        state.buildings.forEach(b => { buildingLevels[b.id] = b.level; });

        const dailySnapshot: DailySnapshot = {
          day: state.day,
          timestamp: Date.now(),
          resources: { ...finalResources },
          studentCount: updatedStudents.length,
          buildingLevels,
          avgMorale,
          avgStamina,
          studyingCount,
          restingCount,
          totalExp,
          events: [...todayEvents],
          income: { ...dailyIncome },
          consumption: { food: actualFoodConsumed },
          netChange: {
            gold: finalResources.gold - state.resources.gold,
            mana: finalResources.mana - state.resources.mana,
            food: finalResources.food - state.resources.food,
            reputation: finalResources.reputation - state.resources.reputation,
          },
        };

        newDailySnapshots = [...state.dailySnapshots, dailySnapshot];
        const maxSnapshots = state.autoSaveConfig.maxSnapshots;
        if (newDailySnapshots.length > maxSnapshots) {
          newDailySnapshots = newDailySnapshots.slice(newDailySnapshots.length - maxSnapshots);
        }
      }

      let finalWeeklyGoals = state.weeklyGoals;
      if (checkWeeklyReset(newDay, state.weeklyGoals.weekStartDay)) {
        const newWeekNumber = state.weeklyGoals.weeklyResetCount + 2;
        finalWeeklyGoals = {
          weekStartDay: newDay,
          goals: generateWeeklyGoals(newWeekNumber),
          weeklyResetCount: state.weeklyGoals.weeklyResetCount + 1,
        };
        todayEvents.push({
          type: 'income',
          message: `📅 新的一周开始了！周目标已重置`,
        });
      }

      const finalSeason = { ...state.season };
      if (!state.season.seasonEnded) {
        finalSeason.currentDay = newDay;
        
        if (!finalSeason.initialSnapshot) {
          finalSeason.initialSnapshot = createSeasonSnapshot(
            state.resources,
            state.buildings,
            state.students,
            state.goalProgress
          );
        }
        
        if (checkSeasonEnd(newDay, state.season.seasonStartDay, state.season.seasonDuration)) {
          finalSeason.seasonEnded = true;
          todayEvents.push({
            type: 'income',
            message: `🏆 第${state.season.seasonNumber}赛季「${state.season.seasonName}」已结束！请到赛季页面领取结算奖励`,
          });
        }
      }

      const updatedClubBuffs = state.clubs.activeBuffs
        .map(buff => ({ ...buff, remainingDays: buff.remainingDays - 1 }))
        .filter(buff => buff.remainingDays > 0);
      
      let dailyClubReputation = 0;
      const updatedClubs = state.clubs.clubs.map(club => {
        if (!club.unlocked) return club;
        const repLevel = getClubReputationLevel(club.reputation);
        const clubDailyRep = repLevel.bonuses.dailyReputationBonus;
        dailyClubReputation += clubDailyRep;
        return { ...club, reputation: club.reputation + clubDailyRep };
      });
      
      if (dailyClubReputation > 0) {
        todayEvents.push({
          type: 'club_reputation_gain',
          message: `🌟 所有社团声望每日增长 +${dailyClubReputation}`,
        });
      }

      const completedCourseIds = [...new Set(completedCourses.map(c => c.courseId))];
      const dailyMentorUpdates = new Map<string, { exp: number; students: number }>();
      for (const courseId of completedCourseIds) {
        const course = state.courses.find(c => c.id === courseId);
        if (!course) continue;
        const courseMentors = state.mentorState.mentors.filter(m => m.assignedCourses.includes(courseId));
        for (const mentor of courseMentors) {
          const existing = dailyMentorUpdates.get(mentor.id) || { exp: 0, students: 0 };
          dailyMentorUpdates.set(mentor.id, {
            exp: existing.exp + 5 + course.level * 2,
            students: existing.students + completedCourses.filter(c => c.courseId === courseId).length,
          });
        }
      }
      const updatedDailyMentors = state.mentorState.mentors.map(m => {
        const update = dailyMentorUpdates.get(m.id);
        if (!update) return m;
        let newMentorExp = m.exp + update.exp;
        let newMentorRank = m.rank;
        let newExpToNext = m.expToNextRank;
        const nextRank = getNextMentorRank(m.rank);
        if (nextRank && newMentorExp >= m.expToNextRank) {
          newMentorExp -= m.expToNextRank;
          newMentorRank = nextRank;
          newExpToNext = getMentorRankExpRequirement(nextRank);
        }
        return {
          ...m,
          exp: newMentorExp,
          rank: newMentorRank,
          expToNextRank: newExpToNext,
          totalStudentsTaught: m.totalStudentsTaught + update.students,
        };
      });

      const alchemyCraftTickState = gameReducer(state, { type: 'TICK_ALCHEMY_CRAFTINGS' });
      const alchemyBuffExpireState = gameReducer(alchemyCraftTickState, { type: 'EXPIRE_ALCHEMY_BUFFS' });

      const dormEventInstance = triggerRandomDormitoryEvent(
        state.dormitory.relationships,
        state.students.map(s => s.id),
        newDay,
        state.dormitory.lastEventDay
      );
      const newDormRecentEvents = [...state.dormitory.recentEvents];
      let dormTotalEventsTriggered = state.dormitory.totalEventsTriggered;
      if (dormEventInstance) {
        newDormRecentEvents.push(dormEventInstance);
        if (newDormRecentEvents.length > 20) newDormRecentEvents.shift();
        dormTotalEventsTriggered++;
        const eventDef = DORMITORY_EVENTS.find(e => e.id === dormEventInstance.eventId);
        if (eventDef) {
          todayEvents.push({
            type: 'dormitory_event',
            message: `${eventDef.icon} 宿舍发生事件「${eventDef.name}」！`,
            value: 1,
          });
        }
      }

      let dormTotalSocialInteractions = state.dormitory.totalSocialInteractions;
      const dormRelationshipsWithExp: StudentRelationship[] = state.dormitory.relationships.map(r => ({ ...r }));

      for (const room of state.dormitory.rooms) {
        if (room.residentIds.length < 2) continue;
        for (let i = 0; i < room.residentIds.length; i++) {
          for (let j = i + 1; j < room.residentIds.length; j++) {
            const id1 = room.residentIds[i];
            const id2 = room.residentIds[j];
            let relIndex = dormRelationshipsWithExp.findIndex(
              r => (r.studentId1 === id1 && r.studentId2 === id2) ||
              r.studentId1 === id2 && r.studentId2 === id1
            );
            let rel: StudentRelationship;
            if (relIndex >= 0) {
              rel = dormRelationshipsWithExp[relIndex];
            } else {
              rel = {
                studentId1: id1,
                studentId2: id2,
                exp: 0,
                level: 'stranger' as const,
                dailyInteracted: false,
              };
              dormRelationshipsWithExp.push(rel);
              relIndex = dormRelationshipsWithExp.length - 1;
            }

            const schedule1 = state.dormitory.schedules.find(s => s.studentId === id1 && s.day === state.day);
            const schedule2 = state.dormitory.schedules.find(s => s.studentId === id2 && s.day === state.day);
            const socialActivity = schedule1 && schedule2 && schedule1.activity === schedule2.activity &&
              (schedule1.activity === 'socialize' || schedule1.activity === 'study_leisure' || schedule1.activity === 'cook_together');

            let expGain = 1;
            if (socialActivity) {
              expGain = calculateRelationshipExpGain(schedule1!.activity, true, room.comfort);
              dormTotalSocialInteractions++;
            }

            if (expGain > 0) {
              const newExp = rel.exp + expGain;
              const newLevel = getRelationshipLevel(newExp);
              dormRelationshipsWithExp[relIndex] = {
                ...rel,
                exp: newExp,
                level: newLevel,
                dailyInteracted: socialActivity ? true : rel.dailyInteracted,
              };
              if (newLevel !== rel.level) {
                const s1 = state.students.find(s => s.id === id1);
                const s2 = state.students.find(s => s.id === id2);
                todayEvents.push({
                  type: 'relationship_level_up',
                  message: `💕 ${s1?.name || id1} 和 ${s2?.name || id2} 关系提升为「${getRelationshipInfo(newLevel).name}」！`,
                  value: 1,
                });
              }
            }
          }
        }
      }

      const dormBestRelationshipLevel = dormRelationshipsWithExp.reduce(
        (best, rel) => {
          const relRank = ['stranger', 'acquaintance', 'friend', 'close_friend', 'bonded'].indexOf(rel.level);
          const bestRank = ['stranger', 'acquaintance', 'friend', 'close_friend', 'bonded'].indexOf(best);
          return relRank > bestRank ? rel.level : best;
        },
        state.dormitory.bestRelationshipLevel
      );

      const dormUpdatedRelationships = dormRelationshipsWithExp.map(r => ({
        ...r,
        dailyInteracted: false,
      }));

      const dormAvgMorale = updatedStudents.length > 0 ? Math.round(updatedStudents.reduce((sum, s) => sum + s.morale, 0) / updatedStudents.length) : 0;
      const dormAvgStamina = updatedStudents.length > 0 ? Math.round(updatedStudents.reduce((sum, s) => sum + s.stamina, 0) / updatedStudents.length) : 0;

      const updatedDormitoryState: DormitoryState = {
        ...state.dormitory,
        relationships: dormUpdatedRelationships,
        recentEvents: newDormRecentEvents,
        lastEventDay: dormEventInstance ? newDay : state.dormitory.lastEventDay,
        avgMorale: dormAvgMorale,
        avgStamina: dormAvgStamina,
        totalSocialInteractions: dormTotalSocialInteractions,
        bestRelationshipLevel: dormBestRelationshipLevel,
        totalEventsTriggered: dormTotalEventsTriggered,
      };
      const recalculatedDormBonus = calculateDormitoryBonus(updatedDormitoryState, dormitoryLevel, diningHallLevel);
      updatedDormitoryState.dailyBonus = recalculatedDormBonus;

      const dormRepBonus = recalculatedDormBonus.reputationBonus > 0 ? Math.ceil(recalculatedDormBonus.reputationBonus) : 0;
      if (dormRepBonus > 0) {
        finalResources.reputation += dormRepBonus;
      }

      return {
        ...state,
        day: newDay,
        students: updatedStudents,
        dailyLogs: [...recentLogs, ...(alchemyCraftTickState.dailyLogs.slice(-1).filter(l => l.day === newDay)), ...(alchemyBuffExpireState.dailyLogs.slice(-1).filter(l => l.day === newDay))].length > recentLogs.length
          ? [...recentLogs, ...alchemyCraftTickState.dailyLogs.slice(-1).filter(l => l.day === newDay && !recentLogs.some(rl => rl.day === l.day && rl.events.some(e => e.type === 'alchemy_craft_complete'))), ...alchemyBuffExpireState.dailyLogs.slice(-1).filter(l => l.day === newDay)]
          : recentLogs,
        resources: finalResources,
        dailySnapshots: newDailySnapshots,
        weeklyGoals: finalWeeklyGoals,
        season: finalSeason,
        clubs: {
          ...state.clubs,
          clubs: updatedClubs,
          activeBuffs: updatedClubBuffs,
        },
        tradeHarbor: newTradeHarbor,
        mentorState: {
          ...state.mentorState,
          mentors: updatedDailyMentors,
        },
        alchemy: {
          ...alchemyBuffExpireState.alchemy,
          activeBuffs: alchemyBuffExpireState.alchemy.activeBuffs.filter(b => !dailyUsedPotionBuffIds.has(b.id)),
        },
        eventCenter: newEventCenter,
        dormitory: updatedDormitoryState,
      };
    }

    case 'LOAD_GAME':
      return {
        ...action.state,
        gameStarted: true,
      };

    case 'RESET_GAME': {
      const newState = { ...initialState, gameStarted: true };
      const initialSnapshot = createSeasonSnapshot(
        newState.resources,
        newState.buildings,
        newState.students,
        newState.goalProgress
      );
      return {
        ...newState,
        season: {
          ...newState.season,
          initialSnapshot,
        },
      };
    }

    case 'ADD_DAILY_SNAPSHOT': {
      const maxSnapshots = state.autoSaveConfig.maxSnapshots;
      const newSnapshots = [...state.dailySnapshots, action.snapshot];
      if (newSnapshots.length > maxSnapshots) {
        newSnapshots.splice(0, newSnapshots.length - maxSnapshots);
      }
      return {
        ...state,
        dailySnapshots: newSnapshots,
      };
    }

    case 'UPDATE_AUTO_SAVE_CONFIG':
      return {
        ...state,
        autoSaveConfig: {
          ...state.autoSaveConfig,
          ...action.config,
        },
      };

    case 'CLEAR_OLD_SNAPSHOTS':
      return {
        ...state,
        dailySnapshots: state.dailySnapshots.slice(-state.autoSaveConfig.maxSnapshots),
      };

    case 'TRIGGER_CRITICAL_SAVE':
      return state;

    case 'UNLOCK_EVENT_CENTER':
      return {
        ...state,
        eventCenter: {
          ...state.eventCenter,
          unlocked: true,
        },
      };

    case 'TRIGGER_EVENT_CENTER':
      return {
        ...state,
        eventCenter: {
          ...state.eventCenter,
          currentEvent: action.event,
        },
      };

    case 'RESOLVE_EVENT_CENTER': {
      const event = state.eventCenter.currentEvent;
      if (!event) return state;

      const result = resolveEventChoice(
        event,
        action.choiceId,
        state.students.map(s => ({ id: s.id, magicType: s.magicType }))
      );

      const choice = event.choices.find(c => c.id === action.choiceId);
      const reputationBonus = choice?.reputationBonus || 0;

      const instance = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: event.id,
        day: state.day,
        choiceId: action.choiceId,
        resolved: true,
        wasRiskTriggered: result.wasRiskTriggered,
        resourceChange: result.resourceChange,
        moraleChange: result.moraleChange,
        staminaChange: result.staminaChange,
        studentIdsAffected: result.affectedStudentIds,
        outcomeText: result.outcomeText,
      };

      const baseResources = {
        gold: (result.resourceChange.gold || 0),
        mana: (result.resourceChange.mana || 0),
        food: (result.resourceChange.food || 0),
        reputation: (result.resourceChange.reputation || 0) + reputationBonus,
      };

      const rarityBonus: Partial<Resource> = {};
      if (!result.wasRiskTriggered) {
        switch (event.rarity) {
          case 'uncommon':
            rarityBonus.gold = 10;
            rarityBonus.mana = 5;
            break;
          case 'rare':
            rarityBonus.gold = 30;
            rarityBonus.mana = 15;
            rarityBonus.food = 10;
            break;
          case 'epic':
            rarityBonus.gold = 80;
            rarityBonus.mana = 40;
            rarityBonus.food = 25;
            rarityBonus.reputation = 10;
            break;
          case 'legendary':
            rarityBonus.gold = 200;
            rarityBonus.mana = 100;
            rarityBonus.food = 60;
            rarityBonus.reputation = 30;
            break;
        }
      }

      const totalResources = {
        gold: Math.max(0, state.resources.gold + baseResources.gold),
        mana: Math.max(0, state.resources.mana + baseResources.mana),
        food: Math.max(0, state.resources.food + baseResources.food),
        reputation: Math.max(0, state.resources.reputation + baseResources.reputation),
      };

      const allAffectedIds = new Set<string>(result.affectedStudentIds);
      if (result.moraleChange !== 0 || result.staminaChange !== 0) {
        state.students.forEach(s => allAffectedIds.add(s.id));
      }

      const updatedStudents = state.students.map(s => {
        const isAffected = allAffectedIds.has(s.id);
        if (!isAffected) return s;
        return {
          ...s,
          morale: Math.max(0, Math.min(100, s.morale + (result.moraleChange || 0))),
          stamina: Math.max(0, Math.min(100, s.stamina + (result.staminaChange || 0))),
          currentHp: result.hpChange !== 0 ? Math.max(1, Math.min(s.maxHp, s.currentHp + (result.hpChange || 0))) : s.currentHp,
        };
      });

      const cooldowns = [
        ...state.eventCenter.cooldowns.filter(c => c.eventId !== event.id),
        { eventId: event.id, lastTriggeredDay: state.day },
      ];

      const gained: Partial<Resource> = {};
      const lost: Partial<Resource> = {};
      for (const [key, val] of Object.entries(result.resourceChange)) {
        const k = key as keyof Resource;
        if ((val || 0) > 0) gained[k] = (gained[k] || 0) + val;
        if ((val || 0) < 0) lost[k] = (lost[k] || 0) + Math.abs(val || 0);
      }

      const isGood = !result.wasRiskTriggered;
      const newStreak = isGood ? state.eventCenter.stats.streakResolved + 1 : 0;

      const pendingReward = Object.keys(rarityBonus).length > 0 ? rarityBonus : null;

      const eventLog: DailyEvent = {
        type: result.wasRiskTriggered ? 'event_center_risk' : 'event_center_resolved',
        message: `${event.icon} ${event.name}：${result.outcomeText}${pendingReward ? '（可领取结局奖励）' : ''}`,
        value: Object.values(result.resourceChange).reduce((a, b) => a + (b || 0), 0),
      };

      const recentLogs = [...state.dailyLogs];
      if (recentLogs.length > 0 && recentLogs[recentLogs.length - 1].day === state.day) {
        recentLogs[recentLogs.length - 1].events.push(eventLog);
      } else {
        recentLogs.push({ day: state.day, events: [eventLog] });
      }
      const finalLogs = recentLogs.slice(-30);

      return {
        ...state,
        resources: totalResources,
        students: updatedStudents,
        dailyLogs: finalLogs,
        eventCenter: {
          ...state.eventCenter,
          currentEvent: null,
          eventHistory: [...state.eventCenter.eventHistory, instance].slice(-50),
          cooldowns,
          stats: {
            ...state.eventCenter.stats,
            totalEvents: state.eventCenter.stats.totalEvents + 1,
            eventsByCategory: {
              ...state.eventCenter.stats.eventsByCategory,
              [event.category]: (state.eventCenter.stats.eventsByCategory[event.category] || 0) + 1,
            },
            eventsByRarity: {
              ...state.eventCenter.stats.eventsByRarity,
              [event.rarity]: (state.eventCenter.stats.eventsByRarity[event.rarity] || 0) + 1,
            },
            totalResourceGained: {
              gold: state.eventCenter.stats.totalResourceGained.gold + (gained.gold || 0) + (rarityBonus.gold || 0),
              mana: state.eventCenter.stats.totalResourceGained.mana + (gained.mana || 0) + (rarityBonus.mana || 0),
              food: state.eventCenter.stats.totalResourceGained.food + (gained.food || 0) + (rarityBonus.food || 0),
              reputation: state.eventCenter.stats.totalResourceGained.reputation + (gained.reputation || 0) + (rarityBonus.reputation || 0),
            },
            totalResourceLost: {
              gold: state.eventCenter.stats.totalResourceLost.gold + (lost.gold || 0),
              mana: state.eventCenter.stats.totalResourceLost.mana + (lost.mana || 0),
              food: state.eventCenter.stats.totalResourceLost.food + (lost.food || 0),
              reputation: state.eventCenter.stats.totalResourceLost.reputation + (lost.reputation || 0),
            },
            risksTriggered: state.eventCenter.stats.risksTriggered + (result.wasRiskTriggered ? 1 : 0),
            risksAvoided: state.eventCenter.stats.risksAvoided + (!result.wasRiskTriggered && choice?.riskProbability ? 1 : 0),
            bestReward: gained,
            worstLoss: lost,
            streakResolved: newStreak,
            maxStreak: Math.max(newStreak, state.eventCenter.stats.maxStreak),
          },
          lastEventDay: state.day,
          pendingReward,
        },
      };
    }

    case 'CLAIM_EVENT_REWARD': {
      const reward = state.eventCenter.pendingReward;
      if (!reward) return state;

      const claimLog: DailyEvent = {
        type: 'event_center_resolved',
        message: `🎁 已领取事件结局奖励：${Object.entries(reward)
          .filter(([, v]) => v && v > 0)
          .map(([k, v]) => {
            const icons: Record<string, string> = { gold: '💰', mana: '🔮', food: '🍖', reputation: '⭐' };
            return `${icons[k] || ''}+${v}`;
          })
          .join(' ')}`,
      };

      const recentLogs = [...state.dailyLogs];
      if (recentLogs.length > 0 && recentLogs[recentLogs.length - 1].day === state.day) {
        recentLogs[recentLogs.length - 1].events.push(claimLog);
      } else {
        recentLogs.push({ day: state.day, events: [claimLog] });
      }
      const finalLogs = recentLogs.slice(-30);

      return {
        ...state,
        resources: {
          gold: state.resources.gold + (reward.gold || 0),
          mana: state.resources.mana + (reward.mana || 0),
          food: state.resources.food + (reward.food || 0),
          reputation: state.resources.reputation + (reward.reputation || 0),
        },
        dailyLogs: finalLogs,
        eventCenter: {
          ...state.eventCenter,
          pendingReward: null,
        },
      };
    }

    case 'UNLOCK_KINGDOM_COMMISSION': {
      if (state.kingdomCommission.unlocked) return state;
      
      const academyLevel = 1;
      const initialCommissions = generateAvailableCommissions(academyLevel, state.resources.reputation, 5);
      
      return {
        ...state,
        kingdomCommission: {
          ...state.kingdomCommission,
          unlocked: true,
          availableCommissions: initialCommissions,
          lastRefreshDay: state.day,
        },
      };
    }

    case 'REFRESH_AVAILABLE_COMMISSIONS': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked) return state;
      
      const refreshCost = kc.refreshCost;
      if (state.resources.gold < (refreshCost.gold || 0) || 
          state.resources.reputation < (refreshCost.reputation || 0)) {
        return state;
      }
      
      const academyLevel = Math.floor(state.resources.reputation / 100) + 1;
      const newCommissions = generateAvailableCommissions(academyLevel, state.resources.reputation, 5);
      
      return {
        ...state,
        resources: {
          ...state.resources,
          gold: state.resources.gold - (refreshCost.gold || 0),
          reputation: state.resources.reputation - (refreshCost.reputation || 0),
        },
        kingdomCommission: {
          ...kc,
          availableCommissions: newCommissions,
          lastRefreshDay: state.day,
        },
      };
    }

    case 'ACCEPT_COMMISSION': {
      const kc = state.kingdomCommission;
      const commission = kc.availableCommissions.find(c => c.id === action.commissionId);
      
      if (!commission || !kc.unlocked) return state;
      
      const currentRank = getCommissionRank(kc.rankPoints);
      const maxActive = getMaxActiveCommissions(currentRank);
      
      if (kc.activeCommissions.length >= maxActive) return state;
      if (state.resources.reputation < commission.requiredReputation) return state;
      
      const acceptedCommission: KingdomCommission = {
        ...commission,
        status: 'in_progress',
        acceptedAt: state.day,
      };
      
      return {
        ...state,
        kingdomCommission: {
          ...kc,
          availableCommissions: kc.availableCommissions.filter(c => c.id !== action.commissionId),
          activeCommissions: [...kc.activeCommissions, acceptedCommission],
        },
      };
    }

    case 'ABANDON_COMMISSION': {
      const kc = state.kingdomCommission;
      const commission = kc.activeCommissions.find(c => c.id === action.commissionId);
      
      if (!commission || !kc.unlocked) return state;
      
      return {
        ...state,
        kingdomCommission: {
          ...kc,
          activeCommissions: kc.activeCommissions.filter(c => c.id !== action.commissionId),
          failedCommissions: [...kc.failedCommissions, { ...commission, status: 'failed' }],
        },
      };
    }

    case 'UPDATE_COMMISSION_PROGRESS': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked || kc.activeCommissions.length === 0) return state;
      
      const { updated, completedStages, completedCommissions } = updateCommissionStageProgress(
        kc.activeCommissions,
        action.stageType,
        action.amount,
        action.resourceType
      );
      
      if (completedStages.length === 0 && completedCommissions.length === 0) {
        return {
          ...state,
          kingdomCommission: { ...kc, activeCommissions: updated },
        };
      }
      
      const completedCommList = updated.filter(c => c.status === 'stage_complete');
      const stillActive = updated.filter(c => c.status !== 'stage_complete');
      
      return {
        ...state,
        kingdomCommission: {
          ...kc,
          activeCommissions: stillActive,
          completedCommissions: [...kc.completedCommissions, ...completedCommList],
        },
      };
    }

    case 'DELIVER_COMMISSION_RESOURCE': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked) return state;
      
      const commissionIndex = kc.activeCommissions.findIndex(c => c.id === action.commissionId);
      if (commissionIndex === -1) return state;
      
      const commission = kc.activeCommissions[commissionIndex];
      const { updatedCommission, delivered, cost } = deliverCommissionResource(
        commission,
        action.stageId,
        state.resources
      );
      
      if (!delivered) return state;
      
      const newActiveCommissions = [...kc.activeCommissions];
      newActiveCommissions[commissionIndex] = updatedCommission;
      
      let finalActiveCommissions = newActiveCommissions;
      let newCompletedCommissions = kc.completedCommissions;
      
      if (updatedCommission.status === 'stage_complete') {
        finalActiveCommissions = newActiveCommissions.filter(c => c.id !== action.commissionId);
        newCompletedCommissions = [...kc.completedCommissions, updatedCommission];
      }
      
      const newResources = { ...state.resources };
      (Object.keys(cost) as (keyof Resource)[]).forEach(key => {
        const value = cost[key];
        if (value !== undefined) {
          newResources[key] = newResources[key] - value;
        }
      });
      
      return {
        ...state,
        resources: newResources,
        kingdomCommission: {
          ...kc,
          activeCommissions: finalActiveCommissions,
          completedCommissions: newCompletedCommissions,
        },
      };
    }

    case 'CLAIM_COMMISSION_STAGE_REWARD': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked) return state;
      
      const commissionIndex = kc.activeCommissions.findIndex(c => c.id === action.commissionId);
      if (commissionIndex === -1) return state;
      
      const commission = kc.activeCommissions[commissionIndex];
      const { updatedCommission, reward } = claimStageReward(commission, action.stageId);
      
      if (Object.keys(reward).length === 0) return state;
      
      const currentRank = getCommissionRank(kc.rankPoints);
      const bonusReward = applyCommissionRewardBonus(reward, currentRank);
      
      const newActiveCommissions = [...kc.activeCommissions];
      newActiveCommissions[commissionIndex] = updatedCommission;
      
      const newResources = { ...state.resources };
      (Object.keys(bonusReward) as (keyof Resource)[]).forEach(key => {
        const value = bonusReward[key];
        if (value !== undefined) {
          newResources[key] = newResources[key] + value;
        }
      });
      
      return {
        ...state,
        resources: newResources,
        kingdomCommission: {
          ...kc,
          activeCommissions: newActiveCommissions,
        },
      };
    }

    case 'CLAIM_COMMISSION_REWARD': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked) return state;
      
      const commissionIndex = kc.completedCommissions.findIndex(c => c.id === action.commissionId);
      if (commissionIndex === -1) return state;
      
      const commission = kc.completedCommissions[commissionIndex];
      const { updatedCommission, reward, reputation, points } = claimCommissionReward(commission);
      
      if (points === 0) return state;
      
      const currentRank = getCommissionRank(kc.rankPoints);
      const bonusReward = applyCommissionRewardBonus(reward, currentRank);
      const bonusReputation = Math.floor(reputation * (1 + currentRank.bonuses.reputationBonus / 100));
      
      const newRankPoints = kc.rankPoints + points;
      const newRank = getCommissionRank(newRankPoints);
      const newBestRank = Math.max(kc.bestRank, newRank.rank);
      
      const newResources = { ...state.resources };
      (Object.keys(bonusReward) as (keyof Resource)[]).forEach(key => {
        const value = bonusReward[key];
        if (value !== undefined) {
          newResources[key] = newResources[key] + value;
        }
      });
      newResources.reputation += bonusReputation;
      
      const claimLog: DailyEvent = {
        type: 'warning',
        message: `🏆 完成委托「${commission.name}」：获得${Object.entries(bonusReward)
          .filter(([, v]) => v && v > 0)
          .map(([k, v]) => {
            const icons: Record<string, string> = { gold: '💰', mana: '🔮', food: '🍖', reputation: '⭐' };
            return `${icons[k] || ''}${v}`;
          })
          .join(' ')} ⭐+${bonusReputation}声望 📈+${points}积分`,
      };
      
      const recentLogs = [...state.dailyLogs];
      if (recentLogs.length > 0 && recentLogs[recentLogs.length - 1].day === state.day) {
        recentLogs[recentLogs.length - 1].events.push(claimLog);
      } else {
        recentLogs.push({ day: state.day, events: [claimLog] });
      }
      const finalLogs = recentLogs.slice(-30);
      
      const newHistory = [...kc.commissionHistory, updatedCommission];
      const finalHistory = newHistory.slice(-kc.maxHistorySize);
      
      return {
        ...state,
        resources: newResources,
        dailyLogs: finalLogs,
        kingdomCommission: {
          ...kc,
          completedCommissions: kc.completedCommissions.filter((_, i) => i !== commissionIndex),
          totalCommissionsCompleted: kc.totalCommissionsCompleted + 1,
          totalReputationEarned: kc.totalReputationEarned + bonusReputation,
          currentRank: newRank.rank,
          bestRank: newBestRank,
          rankPoints: newRankPoints,
          weeklyCommissionCount: kc.weeklyCommissionCount + 1,
          commissionHistory: finalHistory,
        },
      };
    }

    case 'ASSIGN_STUDENT_TO_COMMISSION': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked) return state;
      
      const commissionIndex = kc.activeCommissions.findIndex(c => c.id === action.commissionId);
      if (commissionIndex === -1) return state;
      
      const commission = kc.activeCommissions[commissionIndex];
      if (commission.assignedStudents.length >= commission.maxStudents) return state;
      if (commission.assignedStudents.includes(action.studentId)) return state;
      
      const student = state.students.find(s => s.id === action.studentId);
      if (!student || student.status !== 'idle') return state;
      
      const newActiveCommissions = [...kc.activeCommissions];
      newActiveCommissions[commissionIndex] = {
        ...commission,
        assignedStudents: [...commission.assignedStudents, action.studentId],
      };
      
      return {
        ...state,
        kingdomCommission: {
          ...kc,
          activeCommissions: newActiveCommissions,
        },
      };
    }

    case 'UNASSIGN_STUDENT_FROM_COMMISSION': {
      const kc = state.kingdomCommission;
      if (!kc.unlocked) return state;
      
      const commissionIndex = kc.activeCommissions.findIndex(c => c.id === action.commissionId);
      if (commissionIndex === -1) return state;
      
      const commission = kc.activeCommissions[commissionIndex];
      if (!commission.assignedStudents.includes(action.studentId)) return state;
      
      const newActiveCommissions = [...kc.activeCommissions];
      newActiveCommissions[commissionIndex] = {
        ...commission,
        assignedStudents: commission.assignedStudents.filter(id => id !== action.studentId),
      };
      
      return {
        ...state,
        kingdomCommission: {
          ...kc,
          activeCommissions: newActiveCommissions,
        },
      };
    }

    case 'ASSIGN_DORMITORY_ACTIVITY': {
      const student = state.students.find(s => s.id === action.studentId);
      if (!student) return state;
      if (student.status !== 'resting' && student.status !== 'idle') return state;

      const newSchedules = state.dormitory.schedules.filter(
        s => !(s.studentId === action.studentId && s.day === action.day)
      );
      newSchedules.push({
        studentId: action.studentId,
        activity: action.activity,
        day: action.day,
      });

      const activityDef = REST_ACTIVITIES.find(a => a.id === action.activity);
      const activityEvent: DailyEvent = {
        type: 'dormitory_rest_activity',
        message: `${activityDef?.icon || '😴'} ${student.name} 进行「${activityDef?.name || action.activity}」`,
        studentId: student.id,
        studentName: student.name,
      };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push({ day: state.day, events: [activityEvent] });

      return {
        ...state,
        dailyLogs: recentLogs,
        dormitory: {
          ...state.dormitory,
          schedules: newSchedules,
        },
      };
    }

    case 'REASSIGN_DORMITORY_ROOM': {
      const student = state.students.find(s => s.id === action.studentId);
      if (!student) return state;
      const targetRoom = state.dormitory.rooms.find(r => r.id === action.roomId);
      if (!targetRoom) return state;
      if (targetRoom.residentIds.length >= targetRoom.capacity) return state;

      const newRooms = state.dormitory.rooms.map(r => {
        const hasStudent = r.residentIds.includes(action.studentId);
        if (hasStudent) {
          return { ...r, residentIds: r.residentIds.filter(id => id !== action.studentId) };
        }
        if (r.id === action.roomId) {
          return { ...r, residentIds: [...r.residentIds, action.studentId] };
        }
        return r;
      }).filter(r => r.residentIds.length > 0 || r.id === action.roomId);

      const roomEvent: DailyEvent = {
        type: 'dormitory_room_assigned',
        message: `🏠 ${student.name} 搬入了${targetRoom.id.replace('room_', '房间')}`,
        studentId: student.id,
        studentName: student.name,
      };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push({ day: state.day, events: [roomEvent] });

      return {
        ...state,
        dailyLogs: recentLogs,
        dormitory: {
          ...state.dormitory,
          rooms: newRooms,
        },
      };
    }

    case 'RESOLVE_DORMITORY_EVENT': {
      const eventInstance = state.dormitory.recentEvents.find(e => e.id === action.eventInstanceId);
      if (!eventInstance || eventInstance.resolved) return state;

      const eventDef = DORMITORY_EVENTS.find(e => e.id === eventInstance.eventId);
      if (!eventDef) return state;

      let finalEffects = { ...eventInstance.effects };
      let wasRiskTriggered = false;

      if (action.choiceId && eventDef.choices) {
        const choice = eventDef.choices.find(c => c.id === action.choiceId);
        if (choice) {
          finalEffects = { ...choice.effects };
          if (choice.riskProbability && Math.random() < choice.riskProbability && choice.riskEffects) {
            wasRiskTriggered = true;
            for (const key of Object.keys(choice.riskEffects)) {
              const k = key as keyof typeof choice.riskEffects;
              if (choice.riskEffects[k] !== undefined) {
                (finalEffects as Record<string, number>)[k] = ((finalEffects as Record<string, number>)[k] || 0) + (choice.riskEffects[k] || 0);
              }
            }
          }
        }
      }

      const updatedStudents = state.students.map(s => {
        if (!eventInstance.participantIds.includes(s.id)) return s;
        return {
          ...s,
          morale: clamp(s.morale + (finalEffects.moraleChange || 0), 0, 100),
          stamina: clamp(s.stamina + (finalEffects.staminaChange || 0), 0, 100),
          currentHp: Math.max(1, Math.min(s.maxHp, s.currentHp + (finalEffects.hpChange || 0))),
        };
      });

      const updatedRelationships = state.dormitory.relationships.map(r => {
        const involvesParticipants = eventInstance.participantIds.includes(r.studentId1) && eventInstance.participantIds.includes(r.studentId2);
        if (!involvesParticipants) return r;
        const expChange = finalEffects.relationshipExpChange || 0;
        const newExp = Math.max(0, r.exp + expChange);
        const newLevel = getRelationshipLevel(newExp);
        const nextLevelIndex = RELATIONSHIP_LEVELS.findIndex(l => l.level === newLevel) + 1;
        const nextLevel = nextLevelIndex < RELATIONSHIP_LEVELS.length ? RELATIONSHIP_LEVELS[nextLevelIndex] : null;
        return {
          ...r,
          exp: newExp,
          level: newLevel,
          expToNext: nextLevel ? nextLevel.minExp - newExp : 0,
          dailyInteracted: true,
        };
      });

      const eventEvent: DailyEvent = {
        type: 'dormitory_event',
        message: `${eventDef.icon} 宿舍事件「${eventDef.name}」已解决${wasRiskTriggered ? '（风险触发！）' : ''}`,
        value: finalEffects.moraleChange || 0,
      };
      const recentLogs = state.dailyLogs.slice(-29);
      recentLogs.push({ day: state.day, events: [eventEvent] });

      const newReputationChange = finalEffects.reputationChange || 0;

      const bestRelLevel = updatedRelationships.reduce((best, r) => {
        return getRelationshipLevelOrder(r.level) > getRelationshipLevelOrder(best) ? r.level : best;
      }, state.dormitory.bestRelationshipLevel);

      return {
        ...state,
        dailyLogs: recentLogs,
        students: updatedStudents,
        resources: {
          ...state.resources,
          reputation: state.resources.reputation + newReputationChange,
        },
        dormitory: {
          ...state.dormitory,
          relationships: updatedRelationships,
          recentEvents: state.dormitory.recentEvents.map(e =>
            e.id === action.eventInstanceId ? { ...e, resolved: true, chosenOption: action.choiceId, wasRiskTriggered, effects: finalEffects } : e
          ),
          totalEventsTriggered: state.dormitory.totalEventsTriggered + 1,
          bestRelationshipLevel: bestRelLevel,
          totalSocialInteractions: state.dormitory.totalSocialInteractions + (finalEffects.relationshipExpChange && finalEffects.relationshipExpChange > 0 ? 1 : 0),
        },
      };
    }

    case 'REFRESH_DORMITORY_ROOMS': {
      const dormitoryLevel = state.buildings.find(b => b.id === 'dormitory')?.level || 0;
      const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
      const studentIds = state.students.map(s => s.id);
      const rooms = generateDormitoryRooms(studentIds, dormitoryLevel);
      
      const missingRelationships = initializeRelationships(studentIds);
      const existingPairs = new Set(state.dormitory.relationships.map(r => `${r.studentId1}_${r.studentId2}`));
      const newRelationships = [
        ...state.dormitory.relationships,
        ...missingRelationships.filter(r => !existingPairs.has(`${r.studentId1}_${r.studentId2}`)),
      ];

      const avgMorale = state.students.length > 0 ? Math.round(state.students.reduce((sum, s) => sum + s.morale, 0) / state.students.length) : 0;
      const avgStamina = state.students.length > 0 ? Math.round(state.students.reduce((sum, s) => sum + s.stamina, 0) / state.students.length) : 0;
      
      const updatedState: DormitoryState = {
        ...state.dormitory,
        rooms,
        relationships: newRelationships,
        avgMorale,
        avgStamina,
      };
      
      const dailyBonus = calculateDormitoryBonus(updatedState, dormitoryLevel, diningHallLevel);
      updatedState.dailyBonus = dailyBonus;

      return {
        ...state,
        dormitory: updatedState,
      };
    }

    case 'UPDATE_DORMITORY_BONUSES': {
      const dormitoryLevel = state.buildings.find(b => b.id === 'dormitory')?.level || 0;
      const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
      const avgMorale = state.students.length > 0 ? Math.round(state.students.reduce((sum, s) => sum + s.morale, 0) / state.students.length) : 0;
      const avgStamina = state.students.length > 0 ? Math.round(state.students.reduce((sum, s) => sum + s.stamina, 0) / state.students.length) : 0;
      
      const updatedState: DormitoryState = {
        ...state.dormitory,
        avgMorale,
        avgStamina,
      };
      
      const dailyBonus = calculateDormitoryBonus(updatedState, dormitoryLevel, diningHallLevel);
      updatedState.dailyBonus = dailyBonus;

      return {
        ...state,
        dormitory: updatedState,
      };
    }

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
  recordDailySnapshot: (events?: DailyEvent[]) => void;
  updateAutoSaveConfig: (config: Partial<AutoSaveConfig>) => void;
  autoSaveIfEnabled: () => void;
  getSnapshotForDay: (day: number) => DailySnapshot | undefined;
  getPreviousSnapshot: (day?: number) => DailySnapshot | undefined;
  nextDayWithSave: (days?: number) => void;
  shouldConfirmAction: () => boolean;
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
  getReputationLevel: typeof getReputationLevel;
  getNextReputationLevel: typeof getNextReputationLevel;
  calculateDiscountedCost: typeof calculateDiscountedCost;
  canAccessCourse: typeof canAccessCourse;
  canAccessBuilding: typeof canAccessBuilding;
  canAccessRecruitmentTicket: typeof canAccessRecruitmentTicket;
  REPUTATION_LEVELS: typeof REPUTATION_LEVELS;
  claimWeeklyGoal: (goalId: string) => void;
  claimStageTask: (taskId: string) => void;
  resetWeeklyGoals: () => void;
  getCurrentWeek: typeof getCurrentWeek;
  getWeeklyProgress: () => { current: number; total: number; daysLeft: number };
  claimSeasonGoal: (goalId: string) => void;
  claimSeasonStageReward: (stageId: string) => void;
  settleSeason: () => void;
  startNewSeason: () => void;
  getSeasonProgress: () => { currentDay: number; daysLeft: number; totalDays: number };
  claimSeasonSettlementReward: () => void;
  joinClub: (clubId: string, studentId: string) => void;
  leaveClub: (clubId: string, studentId: string) => void;
  unlockClub: (clubId: string) => void;
  levelUpClub: (clubId: string) => void;
  claimClubTask: (taskId: string) => void;
  purchaseClubShopItem: (itemId: string, clubId: string) => void;
  refreshClubShop: () => void;
  canUnlockClub: typeof canUnlockClub;
  calculateClubLevelProgress: typeof calculateClubLevelProgress;
  getClubLevelRequirement: typeof getClubLevelRequirement;
  calculateDiscountedClubShopCost: typeof calculateDiscountedClubShopCost;
  getClubReputationLevel: typeof getClubReputationLevel;
  getClubMemberBonus: typeof getClubMemberBonus;
  CLUB_REPUTATION_LEVELS: typeof CLUB_REPUTATION_LEVELS;
  INITIAL_CLUBS: typeof INITIAL_CLUBS;
  consumeRecruitTicket: (quality: 'common' | 'rare' | 'epic' | 'legendary') => boolean;
  addRecruitTicket: (quality: 'common' | 'rare' | 'epic' | 'legendary', amount: number) => void;
  unlockTradeHarbor: () => void;
  placeTradeOrder: (orderType: TradeOrderType, materialId: TradeMaterialType, quantity: number, route: 'local' | 'regional' | 'intercontinental') => boolean;
  cancelTradeOrder: (orderId: string) => void;
  completeTradeShipment: (shipmentId: string) => void;
  refreshTradePrices: () => void;
  upgradeWarehouse: () => boolean;
  TRADE_MATERIALS: typeof TRADE_MATERIALS;
  getTradeMaterial: typeof getTradeMaterial;
  getRouteInfo: typeof getRouteInfo;
  calculateTradePriceBonus: typeof calculateTradePriceBonus;
  getTradeBuildingBonuses: typeof getTradeBuildingBonuses;
  calculateWarehouseCapacity: typeof calculateWarehouseCapacity;
  getTotalWarehouseUsed: typeof getTotalWarehouseUsed;
  canPlaceBuyOrder: typeof canPlaceBuyOrder;
  canPlaceSellOrder: typeof canPlaceSellOrder;
  calculateShipmentDuration: typeof calculateShipmentDuration;
  calculateShipmentRisk: typeof calculateShipmentRisk;
  recruitMentor: (optionId: string) => boolean;
  refreshMentorPool: (useFree?: boolean) => boolean;
  assignMentorToCourse: (mentorId: string, courseId: string) => boolean;
  unassignMentorFromCourse: (mentorId: string, courseId: string) => void;
  assignMentorToDungeon: (mentorId: string, dungeonId: string | null) => void;
  addMentorExp: (mentorId: string, exp: number) => void;
  upgradeMentorRank: (mentorId: string) => boolean;
  upgradeMentorSpecialization: (mentorId: string, specializationId: SpecializationType, exp: number) => void;
  unlockMentorSpecialization: (mentorId: string, specializationId: SpecializationType) => boolean;
  assignMentorToAcademy: (mentorId: string, academyId: string | null) => boolean;
  upgradeAcademy: (academyId: string) => boolean;
  unlockAcademy: (academyId: string) => boolean;
  updateMentor: (mentor: Mentor) => void;
  calculateMentorCourseBonus: typeof calculateMentorCourseBonus;
  calculateMentorDungeonBonus: typeof calculateMentorDungeonBonus;
  calculateMentorPromotionBonus: typeof calculateMentorPromotionBonus;
  canAssignMentorToCourse: typeof canAssignMentorToCourse;
  canMentorLeadDungeon: typeof canMentorLeadDungeon;
  getAcademyUpgradeCost: typeof getAcademyUpgradeCost;
  getMentorRankExpRequirement: typeof getMentorRankExpRequirement;
  getNextMentorRank: typeof getNextMentorRank;
  getSpecializationExpRequirement: typeof getSpecializationExpRequirement;
  MENTOR_QUALITY_NAMES: typeof MENTOR_QUALITY_NAMES;
  MENTOR_QUALITY_COLORS: typeof MENTOR_QUALITY_COLORS;
  MENTOR_RANK_NAMES: typeof MENTOR_RANK_NAMES;
  getMentorQualityMultiplier: typeof getMentorQualityMultiplier;
  unlockAlchemy: () => void;
  upgradeAlchemyWorkshop: () => boolean;
  craftPotion: (potionId: PotionId, quantity: number) => boolean;
  synthesizeMaterial: (recipeId: string) => boolean;
  consumePotion: (potionId: PotionId, studentId?: string, dungeonId?: string) => boolean;
  sellPotion: (potionId: PotionId, quantity: number) => boolean;
  sellMaterial: (materialId: AlchemyMaterialId, quantity: number) => boolean;
  canCraftPotion: typeof canCraftPotion;
  canSynthesizeMaterial: typeof canSynthesizeMaterial;
  getWorkshopUpgradeCost: typeof getWorkshopUpgradeCost;
  getCraftingSlotsForLevel: typeof getCraftingSlotsForLevel;
  getWorkshopRequiredReputation: typeof getWorkshopRequiredReputation;
  ALCHEMY_MATERIALS: typeof ALCHEMY_MATERIALS;
  getAlchemyMaterial: typeof getAlchemyMaterial;
  ALCHEMY_RARITY_COLORS: typeof ALCHEMY_RARITY_COLORS;
  ALCHEMY_RARITY_NAMES: typeof ALCHEMY_RARITY_NAMES;
  unlockEventCenter: () => void;
  resolveEventCenter: (choiceId: string) => void;
  dismissEventCenter: () => void;
  claimEventReward: () => void;
  selectRandomEvent: typeof selectRandomEvent;
  ACADEMY_EVENTS: typeof ACADEMY_EVENTS;
  EVENT_RARITY_COLORS: typeof EVENT_RARITY_COLORS;
  EVENT_RARITY_NAMES: typeof EVENT_RARITY_NAMES;
  EVENT_CATEGORY_ICONS: typeof EVENT_CATEGORY_ICONS;
  EVENT_CATEGORY_NAMES: typeof EVENT_CATEGORY_NAMES;
  unlockKingdomCommission: () => void;
  refreshAvailableCommissions: () => void;
  acceptCommission: (commissionId: string) => boolean;
  abandonCommission: (commissionId: string) => void;
  deliverCommissionResource: (commissionId: string, stageId: string) => boolean;
  claimCommissionStageReward: (commissionId: string, stageId: string) => void;
  claimCommissionReward: (commissionId: string) => void;
  assignStudentToCommission: (commissionId: string, studentId: string) => boolean;
  unassignStudentFromCommission: (commissionId: string, studentId: string) => void;
  getCommissionRank: typeof getCommissionRank;
  getNextCommissionRank: typeof getNextCommissionRank;
  getMaxActiveCommissions: typeof getMaxActiveCommissions;
  applyCommissionRewardBonus: typeof applyCommissionRewardBonus;
  COMMISSION_RANK_INFO: typeof COMMISSION_RANK_INFO;
  COMMISSION_DIFFICULTY_NAMES: typeof COMMISSION_DIFFICULTY_NAMES;
  COMMISSION_DIFFICULTY_COLORS: typeof COMMISSION_DIFFICULTY_COLORS;
  COMMISSION_TYPE_NAMES: typeof COMMISSION_TYPE_NAMES;
  COMMISSION_TYPE_ICONS: typeof COMMISSION_TYPE_ICONS;
  assignDormitoryActivity: (studentId: string, activity: RestActivity, day: number) => void;
  reassignDormitoryRoom: (studentId: string, roomId: string) => void;
  resolveDormitoryEvent: (eventInstanceId: string, choiceId?: string) => void;
  refreshDormitoryRooms: () => void;
  updateDormitoryBonuses: () => void;
  calculateDormitoryBonus: typeof calculateDormitoryBonus;
  calculateDormitoryComfort: typeof calculateDormitoryComfort;
  calculateRoomCapacity: typeof calculateRoomCapacity;
  calculateRestActivityResult: typeof calculateRestActivityResult;
  calculateRelationshipExpGain: typeof calculateRelationshipExpGain;
  getBattleRelationshipBonus: typeof getBattleRelationshipBonus;
  getRelationshipLevel: typeof getRelationshipLevel;
  getRelationshipInfo: typeof getRelationshipInfo;
  getRelationshipLevelOrder: typeof getRelationshipLevelOrder;
  RELATIONSHIP_LEVELS: typeof RELATIONSHIP_LEVELS;
  REST_ACTIVITIES: typeof REST_ACTIVITIES;
  DORMITORY_EVENTS: typeof DORMITORY_EVENTS;
  getRestActivityIcon: typeof getRestActivityIcon;
  getRestActivityName: typeof getRestActivityName;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [activeTab, setActiveTab] = React.useState<TabType>('academy');

  const lastSavedDayRef = React.useRef<number>(state.day);
  const lastSavedSnapshotsLenRef = React.useRef<number>(state.dailySnapshots.length);
  const criticalSaveRequestedRef = React.useRef<number>(0);

  useEffect(() => {
    const result = loadAndMigrateSave();
    if (result) {
      dispatch({ type: 'LOAD_GAME', state: result.state });
      lastSavedDayRef.current = result.state.day;
      lastSavedSnapshotsLenRef.current = result.state.dailySnapshots.length;
    } else {
      dispatch({ type: 'RESET_GAME' });
      lastSavedDayRef.current = initialState.day;
      lastSavedSnapshotsLenRef.current = initialState.dailySnapshots.length;
    }
  }, []);

  useEffect(() => {
    const dayChanged = state.day !== lastSavedDayRef.current;
    const snapshotAdded = state.dailySnapshots.length !== lastSavedSnapshotsLenRef.current;
    const criticalSaveRequested = criticalSaveRequestedRef.current > 0;

    const shouldSaveOnDayAdvance = (dayChanged || snapshotAdded) 
      && state.autoSaveConfig.enabled 
      && state.autoSaveConfig.saveOnDayAdvance;
    const shouldSaveOnCritical = criticalSaveRequested 
      && state.autoSaveConfig.enabled 
      && state.autoSaveConfig.saveOnCriticalAction;

    if (shouldSaveOnDayAdvance || shouldSaveOnCritical) {
      try {
        const saveData = JSON.stringify({
          saveVersion: state.saveVersion,
          state,
          savedAt: new Date().toISOString(),
        });
        const backupData = localStorage.getItem('magicAcademySave');
        if (backupData) {
          localStorage.setItem('magicAcademyBackup', backupData);
          localStorage.setItem('magicAcademyBackupTime', new Date().toISOString());
        }
        localStorage.setItem('magicAcademySave', saveData);
        dispatch({ type: 'UPDATE_AUTO_SAVE_CONFIG', config: { lastAutoSave: Date.now() } });
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }

    if (dayChanged || snapshotAdded) {
      lastSavedDayRef.current = state.day;
      lastSavedSnapshotsLenRef.current = state.dailySnapshots.length;
    }
    if (criticalSaveRequested) {
      criticalSaveRequestedRef.current = 0;
    }
  }, [state]);

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

    const ticket = RECRUITMENT_TICKETS.find((t: { quality: string }) => t.quality === ticketQuality);
    if (ticket && !canAccessRecruitmentTicket(ticket, state.resources.reputation)) return null;

    const pityCount = state.pityCounters[ticketQuality];
    const recruitQualityBonus = getRecruitQualityBonus(state.buildings, state.resources.reputation);
    
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
    dispatch({ type: 'UPDATE_CLUB_TASK_PROGRESS', actionType: 'recruit', amount: 1 });

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

  const recordDailySnapshot = (events?: DailyEvent[]) => {
    const income = calculateDailyIncome(state.buildings, state.resources.reputation);
    const foodConsumption = calculateFoodConsumption(state.students.length);
    const buildingLevels: Record<string, number> = {};
    state.buildings.forEach(b => {
      buildingLevels[b.id] = b.level;
    });
    const avgMorale = state.students.length > 0
      ? Math.round(state.students.reduce((sum, s) => sum + s.morale, 0) / state.students.length)
      : 0;
    const avgStamina = state.students.length > 0
      ? Math.round(state.students.reduce((sum, s) => sum + s.stamina, 0) / state.students.length)
      : 0;
    const totalExp = state.students.reduce((sum, s) => sum + s.exp + s.level * 100, 0);
    const studyingCount = state.students.filter(s => s.status === 'studying').length;
    const restingCount = state.students.filter(s => s.status === 'resting').length;

    const snapshot: DailySnapshot = {
      day: state.day,
      timestamp: Date.now(),
      resources: { ...state.resources },
      studentCount: state.students.length,
      buildingLevels,
      avgMorale,
      avgStamina,
      studyingCount,
      restingCount,
      totalExp,
      events: events || [],
      income,
      consumption: { food: foodConsumption },
      netChange: {
        gold: income.gold,
        mana: income.mana,
        food: income.food - foodConsumption,
        reputation: income.reputation,
      },
    };

    dispatch({ type: 'ADD_DAILY_SNAPSHOT', snapshot });
  };

  const updateAutoSaveConfig = (config: Partial<AutoSaveConfig>) => {
    dispatch({ type: 'UPDATE_AUTO_SAVE_CONFIG', config });
  };

  const autoSaveIfEnabled = () => {
    if (state.autoSaveConfig.enabled && state.autoSaveConfig.saveOnCriticalAction) {
      criticalSaveRequestedRef.current += 1;
      dispatch({ type: 'TRIGGER_CRITICAL_SAVE' });
    }
  };

  const getSnapshotForDay = (day: number): DailySnapshot | undefined => {
    return state.dailySnapshots.find(s => s.day === day);
  };

  const getPreviousSnapshot = (day?: number): DailySnapshot | undefined => {
    if (state.dailySnapshots.length === 0) return undefined;
    const sorted = [...state.dailySnapshots].sort((a, b) => a.day - b.day);
    if (day === undefined) {
      return sorted[sorted.length - 1];
    }
    const idx = sorted.findIndex(s => s.day === day);
    if (idx > 0) return sorted[idx - 1];
    return undefined;
  };

  const nextDayWithSave = (days: number = 1) => {
    const safeDays = Math.max(1, Math.min(30, days));
    for (let i = 0; i < safeDays; i++) {
      dispatch({ type: 'NEXT_DAY' });
    }
  };

  const shouldConfirmAction = (): boolean => {
    return state.autoSaveConfig.confirmOnCriticalAction;
  };

  const claimWeeklyGoal = (goalId: string) => {
    dispatch({ type: 'CLAIM_WEEKLY_GOAL', goalId });
    autoSaveIfEnabled();
  };

  const claimStageTask = (taskId: string) => {
    dispatch({ type: 'CLAIM_STAGE_TASK', taskId });
    autoSaveIfEnabled();
  };

  const resetWeeklyGoals = () => {
    dispatch({ type: 'RESET_WEEKLY_GOALS' });
  };

  const getWeeklyProgress = () => {
    const completed = state.weeklyGoals.goals.filter(g => g.completed).length;
    const total = state.weeklyGoals.goals.length;
    const daysLeft = Math.max(0, 7 - (state.day - state.weeklyGoals.weekStartDay));
    return { current: completed, total, daysLeft };
  };
  
  const claimSeasonGoal = (goalId: string) => {
    dispatch({ type: 'CLAIM_SEASON_GOAL', goalId });
    autoSaveIfEnabled();
  };
  
  const claimSeasonStageReward = (stageId: string) => {
    dispatch({ type: 'CLAIM_SEASON_STAGE_REWARD', stageId });
    autoSaveIfEnabled();
  };
  
  const settleSeason = () => {
    dispatch({ type: 'SETTLE_SEASON' });
    autoSaveIfEnabled();
  };
  
  const startNewSeason = () => {
    dispatch({ type: 'START_NEW_SEASON' });
    autoSaveIfEnabled();
  };
  
  const getSeasonProgress = () => {
    const currentDay = state.season.seasonEnded 
      ? state.season.seasonDuration 
      : state.day - state.season.seasonStartDay + 1;
    const daysLeft = Math.max(0, state.season.seasonDuration - currentDay + 1);
    return { 
      currentDay: Math.max(1, Math.min(currentDay, state.season.seasonDuration)), 
      daysLeft, 
      totalDays: state.season.seasonDuration 
    };
  };
  
  const claimSeasonSettlementReward = () => {
    dispatch({ type: 'CLAIM_SEASON_SETTLEMENT_REWARD' });
    autoSaveIfEnabled();
  };

  const joinClub = (clubId: string, studentId: string) => {
    dispatch({ type: 'JOIN_CLUB', clubId, studentId });
    autoSaveIfEnabled();
  };

  const leaveClub = (clubId: string, studentId: string) => {
    dispatch({ type: 'LEAVE_CLUB', clubId, studentId });
    autoSaveIfEnabled();
  };

  const unlockClub = (clubId: string) => {
    dispatch({ type: 'UNLOCK_CLUB', clubId });
    autoSaveIfEnabled();
  };

  const levelUpClub = (clubId: string) => {
    dispatch({ type: 'LEVEL_UP_CLUB', clubId });
    autoSaveIfEnabled();
  };

  const claimClubTask = (taskId: string) => {
    dispatch({ type: 'CLAIM_CLUB_TASK', taskId });
    autoSaveIfEnabled();
  };

  const purchaseClubShopItem = (itemId: string, clubId: string) => {
    dispatch({ type: 'PURCHASE_CLUB_SHOP_ITEM', itemId, clubId });
    autoSaveIfEnabled();
  };

  const refreshClubShop = () => {
    dispatch({ type: 'REFRESH_CLUB_SHOP' });
    autoSaveIfEnabled();
  };

  const consumeRecruitTicket = (quality: 'common' | 'rare' | 'epic' | 'legendary'): boolean => {
    if (state.recruitTickets[quality] <= 0) return false;
    dispatch({ type: 'USE_RECRUIT_TICKET', quality });
    return true;
  };

  const addRecruitTicket = (quality: 'common' | 'rare' | 'epic' | 'legendary', amount: number) => {
    dispatch({ type: 'ADD_RECRUIT_TICKET', quality, amount });
    autoSaveIfEnabled();
  };

  const unlockTradeHarbor = () => {
    dispatch({ type: 'UNLOCK_TRADE_HARBOR' });
    autoSaveIfEnabled();
  };

  const placeTradeOrder = (
    orderType: TradeOrderType,
    materialId: TradeMaterialType,
    quantity: number,
    route: 'local' | 'regional' | 'intercontinental'
  ): boolean => {
    const bonuses = getTradeBuildingBonuses(state.buildings);
    const priceMultiplier = calculateTradePriceBonus(orderType, bonuses.priceBonus);
    const basePrice = state.tradeHarbor.currentPrices[materialId];
    const effectivePrice = Math.round(basePrice * priceMultiplier);

    if (orderType === 'buy') {
      const warehouseCapacity = calculateWarehouseCapacity(state.buildings, bonuses.capacityBonus);
      const check = canPlaceBuyOrder(
        materialId, quantity, state.resources.gold,
        effectivePrice, state.tradeHarbor.materials, warehouseCapacity
      );
      if (!check.ok) return false;
    } else {
      const check = canPlaceSellOrder(materialId, quantity, state.tradeHarbor.materials);
      if (!check.ok) return false;
    }

    dispatch({ type: 'PLACE_TRADE_ORDER', orderType, materialId, quantity, route });
    autoSaveIfEnabled();
    return true;
  };

  const cancelTradeOrder = (orderId: string) => {
    dispatch({ type: 'CANCEL_TRADE_ORDER', orderId });
    autoSaveIfEnabled();
  };

  const completeTradeShipment = (shipmentId: string) => {
    dispatch({ type: 'COMPLETE_TRADE_SHIPMENT', shipmentId });
    autoSaveIfEnabled();
  };

  const refreshTradePrices = () => {
    dispatch({ type: 'REFRESH_TRADE_PRICES' });
    autoSaveIfEnabled();
  };

  const upgradeWarehouse = (): boolean => {
    const cost = state.tradeHarbor.warehouse.upgradeCost;
    if (
      state.resources.gold < cost.gold ||
      state.resources.mana < cost.mana ||
      state.resources.food < cost.food ||
      state.resources.reputation < cost.reputation
    ) {
      return false;
    }
    dispatch({ type: 'UPGRADE_WAREHOUSE' });
    autoSaveIfEnabled();
    return true;
  };

  const recruitMentor = (optionId: string): boolean => {
    const option = state.mentorState.recruitmentPool.currentOptions.find(o => o.id === optionId);
    if (!option) return false;
    if (state.mentorState.mentors.length >= state.mentorState.maxMentors) return false;
    if (state.resources.reputation < option.requiredReputation) return false;
    if (
      state.resources.gold < option.cost.gold ||
      state.resources.mana < option.cost.mana ||
      state.resources.food < option.cost.food ||
      state.resources.reputation < option.cost.reputation
    ) {
      return false;
    }
    dispatch({ type: 'RECRUIT_MENTOR', optionId });
    autoSaveIfEnabled();
    return true;
  };

  const refreshMentorPool = (useFree = false): boolean => {
    const pool = state.mentorState.recruitmentPool;
    if (useFree) {
      if (pool.freeRefreshesUsed >= pool.freeRefreshesPerWeek) return false;
    } else {
      if (
        state.resources.gold < pool.refreshCost.gold ||
        state.resources.mana < pool.refreshCost.mana ||
        state.resources.food < pool.refreshCost.food ||
        state.resources.reputation < pool.refreshCost.reputation
      ) {
        return false;
      }
    }
    dispatch({ type: 'REFRESH_MENTOR_POOL', useFree });
    autoSaveIfEnabled();
    return true;
  };

  const assignMentorToCourse = (mentorId: string, courseId: string): boolean => {
    const mentor = state.mentorState.mentors.find(m => m.id === mentorId);
    if (!mentor) return false;
    const check = canAssignMentorToCourse(mentor, courseId);
    if (!check.ok) return false;
    dispatch({ type: 'ASSIGN_MENTOR_TO_COURSE', mentorId, courseId });
    autoSaveIfEnabled();
    return true;
  };

  const unassignMentorFromCourse = (mentorId: string, courseId: string) => {
    dispatch({ type: 'UNASSIGN_MENTOR_FROM_COURSE', mentorId, courseId });
    autoSaveIfEnabled();
  };

  const assignMentorToDungeon = (mentorId: string, dungeonId: string | null) => {
    dispatch({ type: 'ASSIGN_MENTOR_TO_DUNGEON', mentorId, dungeonId });
    autoSaveIfEnabled();
  };

  const addMentorExp = (mentorId: string, exp: number) => {
    dispatch({ type: 'ADD_MENTOR_EXP', mentorId, exp });
    autoSaveIfEnabled();
  };

  const upgradeMentorRank = (mentorId: string): boolean => {
    const mentor = state.mentorState.mentors.find(m => m.id === mentorId);
    if (!mentor) return false;
    const nextRank = getNextMentorRank(mentor.rank);
    if (!nextRank) return false;
    if (mentor.exp < mentor.expToNextRank) return false;
    dispatch({ type: 'UPGRADE_MENTOR_RANK', mentorId });
    autoSaveIfEnabled();
    return true;
  };

  const upgradeMentorSpecialization = (mentorId: string, specializationId: SpecializationType, exp: number) => {
    dispatch({ type: 'UPGRADE_MENTOR_SPECIALIZATION', mentorId, specializationId, exp });
    autoSaveIfEnabled();
  };

  const unlockMentorSpecialization = (mentorId: string, specializationId: SpecializationType): boolean => {
    const mentor = state.mentorState.mentors.find(m => m.id === mentorId);
    if (!mentor) return false;
    if (mentor.specializations.some(s => s.id === specializationId)) return false;
    dispatch({ type: 'UNLOCK_MENTOR_SPECIALIZATION', mentorId, specializationId });
    autoSaveIfEnabled();
    return true;
  };

  const assignMentorToAcademy = (mentorId: string, academyId: string | null): boolean => {
    const mentor = state.mentorState.mentors.find(m => m.id === mentorId);
    if (!mentor) return false;
    if (academyId) {
      const academy = state.mentorState.academies.find(a => a.id === academyId);
      if (!academy || !academy.unlocked) return false;
      const currentMentors = academy.mentors.filter(id => id !== mentorId);
      if (currentMentors.length >= academy.maxMentors) return false;
    }
    dispatch({ type: 'ASSIGN_MENTOR_TO_ACADEMY', mentorId, academyId });
    autoSaveIfEnabled();
    return true;
  };

  const upgradeAcademy = (academyId: string): boolean => {
    const academy = state.mentorState.academies.find(a => a.id === academyId);
    if (!academy || academy.level >= academy.maxLevel || !academy.unlocked) return false;
    const cost = getAcademyUpgradeCost(academy);
    if (
      state.resources.gold < cost.gold ||
      state.resources.mana < cost.mana ||
      state.resources.food < cost.food ||
      state.resources.reputation < cost.reputation
    ) {
      return false;
    }
    dispatch({ type: 'UPGRADE_ACADEMY', academyId });
    autoSaveIfEnabled();
    return true;
  };

  const unlockAcademy = (academyId: string): boolean => {
    const academy = state.mentorState.academies.find(a => a.id === academyId);
    if (!academy || academy.unlocked) return false;
    if (state.resources.reputation < academy.requiredReputation) return false;
    const unlockCost: Resource = {
      gold: 500 * (academy.type === 'mixed' ? 1.5 : 1),
      mana: 300 * (academy.type === 'mixed' ? 1.5 : 1),
      food: 100,
      reputation: academy.requiredReputation,
    };
    if (
      state.resources.gold < unlockCost.gold ||
      state.resources.mana < unlockCost.mana ||
      state.resources.food < unlockCost.food
    ) {
      return false;
    }
    dispatch({ type: 'UNLOCK_ACADEMY', academyId });
    autoSaveIfEnabled();
    return true;
  };

  const updateMentor = (mentor: Mentor) => {
    dispatch({ type: 'UPDATE_MENTOR', mentor });
    autoSaveIfEnabled();
  };

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
      recordDailySnapshot,
      updateAutoSaveConfig,
      autoSaveIfEnabled,
      getSnapshotForDay,
      getPreviousSnapshot,
      nextDayWithSave,
      shouldConfirmAction,
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
      getReputationLevel,
      getNextReputationLevel,
      calculateDiscountedCost,
      canAccessCourse,
      canAccessBuilding,
      canAccessRecruitmentTicket,
      REPUTATION_LEVELS,
      claimWeeklyGoal,
      claimStageTask,
      resetWeeklyGoals,
      getCurrentWeek,
      getWeeklyProgress,
      claimSeasonGoal,
      claimSeasonStageReward,
      settleSeason,
      startNewSeason,
      getSeasonProgress,
      claimSeasonSettlementReward,
      joinClub,
      leaveClub,
      unlockClub,
      levelUpClub,
      claimClubTask,
      purchaseClubShopItem,
      refreshClubShop,
      canUnlockClub,
      calculateClubLevelProgress,
      getClubLevelRequirement,
      calculateDiscountedClubShopCost,
      getClubReputationLevel,
      getClubMemberBonus,
      CLUB_REPUTATION_LEVELS,
      INITIAL_CLUBS,
      consumeRecruitTicket,
      addRecruitTicket,
      unlockTradeHarbor,
      placeTradeOrder,
      cancelTradeOrder,
      completeTradeShipment,
      refreshTradePrices,
      upgradeWarehouse,
      TRADE_MATERIALS,
      getTradeMaterial,
      getRouteInfo,
      calculateTradePriceBonus,
      getTradeBuildingBonuses,
      calculateWarehouseCapacity,
      getTotalWarehouseUsed,
      canPlaceBuyOrder,
      canPlaceSellOrder,
      calculateShipmentDuration,
      calculateShipmentRisk,
      recruitMentor,
      refreshMentorPool,
      assignMentorToCourse,
      unassignMentorFromCourse,
      assignMentorToDungeon,
      addMentorExp,
      upgradeMentorRank,
      upgradeMentorSpecialization,
      unlockMentorSpecialization,
      assignMentorToAcademy,
      upgradeAcademy,
      unlockAcademy,
      updateMentor,
      calculateMentorCourseBonus,
      calculateMentorDungeonBonus,
      calculateMentorPromotionBonus,
      canAssignMentorToCourse,
      canMentorLeadDungeon,
      getAcademyUpgradeCost,
      getMentorRankExpRequirement,
      getNextMentorRank,
      getSpecializationExpRequirement,
      MENTOR_QUALITY_NAMES,
      MENTOR_QUALITY_COLORS,
      MENTOR_RANK_NAMES,
      getMentorQualityMultiplier,

      unlockAlchemy: () => { dispatch({ type: 'UNLOCK_ALCHEMY' }); },
      upgradeAlchemyWorkshop: () => {
        if (state.alchemy.workshopLevel >= state.alchemy.maxWorkshopLevel) return false;
        const cost = getWorkshopUpgradeCost(state.alchemy.workshopLevel);
        if (state.resources.gold < cost.gold || state.resources.mana < cost.mana ||
            state.resources.food < cost.food || state.resources.reputation < cost.reputation) return false;
        dispatch({ type: 'UPGRADE_ALCHEMY_WORKSHOP' });
        return true;
      },
      craftPotion: (potionId, quantity) => {
        const recipe = state.alchemy.recipes.find(r => r.id === potionId);
        if (!recipe) return false;
        const check = canCraftPotion(
          recipe, state.alchemy.materials, state.resources.gold, state.resources.mana,
          state.alchemy.workshopLevel, state.alchemy.activeCraftings.length,
          state.alchemy.craftingSlots, state.resources.reputation
        );
        if (!check.ok) return false;
        dispatch({ type: 'CRAFT_POTION', potionId, quantity });
        return true;
      },
      synthesizeMaterial: (recipeId) => {
        const recipe = state.alchemy.synthesisRecipes.find(r => r.id === recipeId);
        if (!recipe) return false;
        const check = canSynthesizeMaterial(recipe, state.alchemy.materials, state.resources.gold, state.alchemy.workshopLevel);
        if (!check.ok) return false;
        dispatch({ type: 'SYNTHESIZE_MATERIAL', recipeId });
        return true;
      },
      consumePotion: (potionId, studentId, dungeonId) => {
        if ((state.alchemy.potions[potionId] || 0) <= 0) return false;
        dispatch({ type: 'USE_POTION', potionId, studentId, dungeonId });
        return true;
      },
      sellPotion: (potionId, quantity) => {
        if ((state.alchemy.potions[potionId] || 0) < quantity) return false;
        dispatch({ type: 'SELL_POTION', potionId, quantity });
        return true;
      },
      sellMaterial: (materialId, quantity) => {
        if ((state.alchemy.materials[materialId] || 0) < quantity) return false;
        dispatch({ type: 'SELL_MATERIAL', materialId, quantity });
        return true;
      },
      canCraftPotion,
      canSynthesizeMaterial,
      getWorkshopUpgradeCost,
      getCraftingSlotsForLevel,
      getWorkshopRequiredReputation,
      ALCHEMY_MATERIALS,
      getAlchemyMaterial,
      ALCHEMY_RARITY_COLORS,
      ALCHEMY_RARITY_NAMES,
      unlockEventCenter: () => dispatch({ type: 'UNLOCK_EVENT_CENTER' }),
      resolveEventCenter: (choiceId: string) => dispatch({ type: 'RESOLVE_EVENT_CENTER', choiceId }),
      dismissEventCenter: () => dispatch({ type: 'DISMISS_EVENT_CENTER' }),
      claimEventReward: () => dispatch({ type: 'CLAIM_EVENT_REWARD' }),
      selectRandomEvent,
      ACADEMY_EVENTS,
      EVENT_RARITY_COLORS,
      EVENT_RARITY_NAMES,
      EVENT_CATEGORY_ICONS,
      EVENT_CATEGORY_NAMES,
      unlockKingdomCommission: () => dispatch({ type: 'UNLOCK_KINGDOM_COMMISSION' }),
      refreshAvailableCommissions: () => dispatch({ type: 'REFRESH_AVAILABLE_COMMISSIONS' }),
      acceptCommission: (commissionId: string) => {
        const kc = state.kingdomCommission;
        const commission = kc.availableCommissions.find(c => c.id === commissionId);
        if (!commission) return false;
        const currentRank = getCommissionRank(kc.rankPoints);
        const maxActive = getMaxActiveCommissions(currentRank);
        if (kc.activeCommissions.length >= maxActive) return false;
        if (state.resources.reputation < commission.requiredReputation) return false;
        dispatch({ type: 'ACCEPT_COMMISSION', commissionId });
        return true;
      },
      abandonCommission: (commissionId: string) => dispatch({ type: 'ABANDON_COMMISSION', commissionId }),
      deliverCommissionResource: (commissionId: string, stageId: string) => {
        const kc = state.kingdomCommission;
        const commission = kc.activeCommissions.find(c => c.id === commissionId);
        if (!commission) return false;
        const stage = commission.stages.find(s => s.id === stageId);
        if (!stage || stage.type !== 'resource' || !stage.resourceType || stage.completed) return false;
        const available = state.resources[stage.resourceType];
        const remaining = stage.target - stage.current;
        if (available <= 0 || remaining <= 0) return false;
        dispatch({ type: 'DELIVER_COMMISSION_RESOURCE', commissionId, stageId });
        return true;
      },
      claimCommissionStageReward: (commissionId: string, stageId: string) => dispatch({ type: 'CLAIM_COMMISSION_STAGE_REWARD', commissionId, stageId }),
      claimCommissionReward: (commissionId: string) => dispatch({ type: 'CLAIM_COMMISSION_REWARD', commissionId }),
      assignStudentToCommission: (commissionId: string, studentId: string) => {
        const kc = state.kingdomCommission;
        const commission = kc.activeCommissions.find(c => c.id === commissionId);
        if (!commission) return false;
        if (commission.assignedStudents.length >= commission.maxStudents) return false;
        if (commission.assignedStudents.includes(studentId)) return false;
        const student = state.students.find(s => s.id === studentId);
        if (!student || student.status !== 'idle') return false;
        dispatch({ type: 'ASSIGN_STUDENT_TO_COMMISSION', commissionId, studentId });
        return true;
      },
      unassignStudentFromCommission: (commissionId: string, studentId: string) => dispatch({ type: 'UNASSIGN_STUDENT_FROM_COMMISSION', commissionId, studentId }),
      getCommissionRank,
      getNextCommissionRank,
      getMaxActiveCommissions,
      applyCommissionRewardBonus,
      COMMISSION_RANK_INFO,
      COMMISSION_DIFFICULTY_NAMES,
      COMMISSION_DIFFICULTY_COLORS,
      COMMISSION_TYPE_NAMES,
      COMMISSION_TYPE_ICONS,
      assignDormitoryActivity: (studentId: string, activity: RestActivity, day: number) => dispatch({ type: 'ASSIGN_DORMITORY_ACTIVITY', studentId, activity, day }),
      reassignDormitoryRoom: (studentId: string, roomId: string) => dispatch({ type: 'REASSIGN_DORMITORY_ROOM', studentId, roomId }),
      resolveDormitoryEvent: (eventInstanceId: string, choiceId?: string) => dispatch({ type: 'RESOLVE_DORMITORY_EVENT', eventInstanceId, choiceId }),
      refreshDormitoryRooms: () => dispatch({ type: 'REFRESH_DORMITORY_ROOMS' }),
      updateDormitoryBonuses: () => dispatch({ type: 'UPDATE_DORMITORY_BONUSES' }),
      calculateDormitoryBonus,
      calculateDormitoryComfort,
      calculateRoomCapacity,
      calculateRestActivityResult,
      calculateRelationshipExpGain,
      getBattleRelationshipBonus,
      getRelationshipLevel,
      getRelationshipInfo,
      getRelationshipLevelOrder,
      RELATIONSHIP_LEVELS,
      REST_ACTIVITIES,
      DORMITORY_EVENTS,
      getRestActivityIcon,
      getRestActivityName,
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