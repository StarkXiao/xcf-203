import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, Resource, TabType, Student as StudentType } from '../types/game';
import { INITIAL_RESOURCES, INITIAL_BUILDINGS, INITIAL_COURSES, INITIAL_DUNGEONS, generateStudentName, getRandomMagicType } from '../data/gameData';

type GameAction =
  | { type: 'ADD_RESOURCE'; resource: Partial<Resource> }
  | { type: 'SPEND_RESOURCE'; resource: Partial<Resource> }
  | { type: 'UPGRADE_BUILDING'; buildingId: string }
  | { type: 'ADD_STUDENT'; student: StudentType }
  | { type: 'REMOVE_STUDENT'; studentId: string }
  | { type: 'UPDATE_STUDENT'; student: StudentType }
  | { type: 'ASSIGN_STUDENT_TO_BUILDING'; studentId: string; buildingId: string | null }
  | { type: 'ASSIGN_STUDENT_TO_COURSE'; studentId: string; courseId: string | null; courseDuration: number }
  | { type: 'COMPLETE_COURSE'; studentId: string; courseId: string }
  | { type: 'START_DUNGEON'; dungeonId: string }
  | { type: 'COMPLETE_DUNGEON'; dungeonId: string }
  | { type: 'NEXT_DAY' }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };

const MAX_STUDENT_CAPACITY = 20;

const initialState: GameState = {
  resources: INITIAL_RESOURCES,
  buildings: INITIAL_BUILDINGS,
  students: [],
  courses: INITIAL_COURSES,
  dungeons: INITIAL_DUNGEONS,
  day: 1,
  maxStudents: MAX_STUDENT_CAPACITY,
  currentStudentId: 1,
  currentDungeonId: 100,
  gameStarted: false,
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

    case 'SPEND_RESOURCE':
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

    case 'UPGRADE_BUILDING': {
      const building = state.buildings.find(b => b.id === action.buildingId);
      if (!building || building.level >= building.maxLevel) return state;
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

    case 'COMPLETE_COURSE': {
      const course = state.courses.find(c => c.id === action.courseId);
      if (!course) return state;
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.studentId) {
            let newExp = s.exp;
            let newLevel = s.level;
            let newSkills = s.skills;
            
            if (course.effect.type === 'exp_gain') {
              newExp += course.effect.value;
              while (newExp >= newLevel * 100) {
                newExp -= newLevel * 100;
                newLevel++;
              }
            } else if (course.effect.type === 'skill_unlock' && course.magicType) {
              const skillId = `skill_${s.id}_${course.magicType}`;
              if (!newSkills.find(sk => sk.id === skillId)) {
                newSkills = [...newSkills, {
                  id: skillId,
                  name: `${course.magicType}魔法`,
                  type: course.magicType,
                  damage: 20 + s.level * 5,
                  cost: 10,
                  description: `${course.magicType}系基础魔法`,
                }];
              }
            }
            
            return {
              ...s,
              status: 'idle' as const,
              assignedCourse: null,
              courseProgress: 0,
              courseDaysRemaining: 0,
              exp: newExp,
              level: newLevel,
              skills: newSkills,
            };
          }
          return s;
        }),
      };
    }

    case 'COMPLETE_DUNGEON':
      const dungeon = state.dungeons.find(d => d.id === action.dungeonId);
      if (!dungeon) return state;
      return {
        ...state,
        resources: {
          gold: state.resources.gold + dungeon.rewards.gold,
          mana: state.resources.mana + dungeon.rewards.mana,
          food: state.resources.food + dungeon.rewards.food,
          reputation: state.resources.reputation + dungeon.rewards.reputation,
        },
        dungeons: state.dungeons.map(d =>
          d.id === action.dungeonId ? { ...d, completed: true } : d
        ),
      };

    case 'NEXT_DAY': {
      const courseSpeedBonus = state.buildings.find(b => b.id === 'library')?.level || 0;
      const expMultiplier = 1 + courseSpeedBonus * 0.1;
      
      const updatedStudents = state.students.map(student => {
        if (student.assignedCourse && student.status === 'studying') {
          const course = state.courses.find(c => c.id === student.assignedCourse);
          if (!course) return student;
          
          const newProgress = student.courseProgress + 1;
          const daysRemaining = student.courseDaysRemaining - 1;
          
          const dailyExp = Math.floor(10 * expMultiplier);
          let newExp = student.exp + dailyExp;
          let newLevel = student.level;
          
          while (newExp >= newLevel * 100) {
            newExp -= newLevel * 100;
            newLevel++;
          }
          
          if (daysRemaining <= 0) {
            let finalExp = newExp + (course.effect.type === 'exp_gain' ? course.effect.value : 0);
            let finalLevel = newLevel;
            let newSkills = student.skills;
            
            while (finalExp >= finalLevel * 100) {
              finalExp -= finalLevel * 100;
              finalLevel++;
            }
            
            if (course.effect.type === 'skill_unlock' && course.magicType) {
              const skillId = `skill_${student.id}_${course.magicType}`;
              if (!newSkills.find(sk => sk.id === skillId)) {
                newSkills = [...newSkills, {
                  id: skillId,
                  name: `${course.magicType}魔法`,
                  type: course.magicType,
                  damage: 20 + finalLevel * 5,
                  cost: 10,
                  description: `${course.magicType}系基础魔法`,
                }];
              }
            }
            
            return {
              ...student,
              status: 'idle' as const,
              assignedCourse: null,
              courseProgress: course.duration,
              courseDaysRemaining: 0,
              exp: finalExp,
              level: finalLevel,
              skills: newSkills,
            };
          }
          
          return {
            ...student,
            courseProgress: newProgress,
            courseDaysRemaining: daysRemaining,
            exp: newExp,
            level: newLevel,
          };
        }
        return student;
      });
      
      const reputationGain = state.buildings.find(b => b.id === 'dining_hall')?.effect.value || 0;
      const totalReputationBonus = 5 + reputationGain * (state.buildings.find(b => b.id === 'dining_hall')?.level || 0);
      
      return {
        ...state,
        day: state.day + 1,
        students: updatedStudents,
        resources: {
          ...state.resources,
          food: Math.max(0, state.resources.food - Math.ceil(state.students.length * 0.5)),
          reputation: state.resources.reputation + totalReputationBonus,
        },
      };
    }

    case 'LOAD_GAME':
      return action.state;

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
  recruitStudent: (quality: 'common' | 'rare' | 'epic' | 'legendary') => void;
  saveGame: () => void;
  loadGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [activeTab, setActiveTab] = React.useState<TabType>('academy');

  useEffect(() => {
    const saved = localStorage.getItem('magicAcademySave');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME', state: { ...parsedState, gameStarted: true } });
      } catch {
        dispatch({ type: 'RESET_GAME' });
      }
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

  const recruitStudent = (quality: 'common' | 'rare' | 'epic' | 'legendary') => {
    const levelMap = { common: 1, rare: 2, epic: 3, legendary: 5 };
    const newStudent: StudentType = {
      id: `student_${state.currentStudentId}`,
      name: generateStudentName(),
      level: levelMap[quality],
      exp: 0,
      magicType: getRandomMagicType(),
      skills: [],
      status: 'idle' as const,
      assignedBuilding: null,
      assignedCourse: null,
      courseProgress: 0,
      courseDaysRemaining: 0,
    };
    dispatch({ type: 'ADD_STUDENT', student: newStudent });
  };

  const saveGame = () => {
    localStorage.setItem('magicAcademySave', JSON.stringify(state));
  };

  const loadGame = () => {
    const saved = localStorage.getItem('magicAcademySave');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME', state: parsedState });
      } catch {
        console.error('Failed to load save');
      }
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, activeTab, setActiveTab, canAfford, recruitStudent, saveGame, loadGame }}>
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