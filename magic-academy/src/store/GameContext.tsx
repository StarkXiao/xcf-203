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
  | { type: 'ASSIGN_STUDENT_TO_COURSE'; studentId: string; courseId: string | null }
  | { type: 'COMPLETE_COURSE'; courseId: string }
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
          s.id === action.studentId ? { ...s, assignedBuilding: action.buildingId, assignedCourse: null } : s
        ),
      };

    case 'ASSIGN_STUDENT_TO_COURSE':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.studentId ? { ...s, assignedCourse: action.courseId } : s
        ),
      };

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
      const updatedStudents = state.students.map(student => {
        if (student.assignedCourse) {
          const newExp = student.exp + 10;
          if (newExp >= student.level * 100) {
            return { ...student, exp: newExp - student.level * 100, level: student.level + 1 };
          }
          return { ...student, exp: newExp };
        }
        return student;
      });
      return {
        ...state,
        day: state.day + 1,
        students: updatedStudents,
        resources: {
          ...state.resources,
          food: Math.max(0, state.resources.food - Math.ceil(state.students.length * 0.5)),
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
      status: 'idle',
      assignedBuilding: null,
      assignedCourse: null,
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