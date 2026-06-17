import React from 'react';
import { useGame } from '../store/GameContext';
import type { TabType, Dungeon as DungeonType, Student as StudentType } from '../types/game';
import './MainLayout.css';

interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

const tabs: TabConfig[] = [
  { id: 'academy', label: '学院建设', icon: '🏰' },
  { id: 'recruit', label: '学员招募', icon: '📜' },
  { id: 'course', label: '课程安排', icon: '📚' },
  { id: 'dungeon', label: '试炼副本', icon: '⚔️' },
  { id: 'settlement', label: '资源结算', icon: '💰' },
  { id: 'settings', label: '设置存档', icon: '⚙️' },
];

interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  type: string;
  isBoss: boolean;
}

export default function MainLayout() {
  const { state, activeTab, setActiveTab } = useGame();

  const getCapacity = () => {
    const baseCapacity = 10;
    const buildingBonus = state.buildings.reduce((acc, b) => {
      if (b.effect.type === 'student_capacity') {
        return acc + b.effect.value * b.level;
      }
      return acc;
    }, 0);
    return baseCapacity + buildingBonus;
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1 className="game-title">✨ 魔法学院 ✨</h1>
        <div className="resource-bar">
          <span className="resource-item">💰 {state.resources.gold}</span>
          <span className="resource-item">🔮 {state.resources.mana}</span>
          <span className="resource-item">🍖 {state.resources.food}</span>
          <span className="resource-item">⭐ {state.resources.reputation}</span>
        </div>
        <div className="day-info">
          <span>第 {state.day} 天</span>
          <span>学员: {state.students.length}/{getCapacity()}</span>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="game-content">
        {activeTab === 'academy' && <AcademyModule />}
        {activeTab === 'recruit' && <RecruitModule />}
        {activeTab === 'course' && <CourseModule />}
        {activeTab === 'dungeon' && <DungeonModule />}
        {activeTab === 'settlement' && <SettlementModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>
    </div>
  );
}

function AcademyModule() {
  const { state, dispatch, canAfford } = useGame();

  return (
    <div className="module academy-module">
      <h2>🏰 学院建设</h2>
      <div className="building-grid">
        {state.buildings.map(building => {
          const cost = {
            gold: building.cost.gold * building.level,
            mana: building.cost.mana * building.level,
            food: building.cost.food * building.level,
            reputation: building.cost.reputation * building.level,
          };
          const affordable = canAfford(cost);
          const maxed = building.level >= building.maxLevel;

          return (
            <div key={building.id} className="building-card">
              <div className="building-header">
                <h3>{building.name}</h3>
                <span className="building-level">Lv.{building.level}</span>
              </div>
              <p className="building-desc">{building.description}</p>
              <div className="building-effect">
                效果: +{building.effect.value * building.level}
              </div>
              {!maxed && (
                <div className="building-cost">
                  <span className={cost.gold > state.resources.gold ? 'insufficient' : ''}>💰{cost.gold}</span>
                  <span className={cost.mana > state.resources.mana ? 'insufficient' : ''}>🔮{cost.mana}</span>
                  <span className={cost.food > state.resources.food ? 'insufficient' : ''}>🍖{cost.food}</span>
                  <span className={cost.reputation > state.resources.reputation ? 'insufficient' : ''}>⭐{cost.reputation}</span>
                </div>
              )}
              {maxed ? (
                <div className="building-maxed">已满级</div>
              ) : (
                <button
                  className={`upgrade-btn ${!affordable ? 'disabled' : ''}`}
                  onClick={() => affordable && dispatch({ type: 'UPGRADE_BUILDING', buildingId: building.id })}
                  disabled={!affordable}
                >
                  升级
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecruitModule() {
  const { state, dispatch, canAfford, recruitStudent } = useGame();
  const getCapacity = () => {
    const baseCapacity = 10;
    const buildingBonus = state.buildings.reduce((acc, b) => {
      if (b.effect.type === 'student_capacity') {
        return acc + b.effect.value * b.level;
      }
      return acc;
    }, 0);
    return baseCapacity + buildingBonus;
  };

  const tickets = [
    { quality: 'common' as const, name: '普通招募', cost: { gold: 100, mana: 50, food: 0, reputation: 0 } },
    { quality: 'rare' as const, name: '稀有招募', cost: { gold: 300, mana: 150, food: 10, reputation: 20 } },
    { quality: 'epic' as const, name: '史诗招募', cost: { gold: 800, mana: 400, food: 30, reputation: 50 } },
  ];

  const isFull = state.students.length >= getCapacity();

  return (
    <div className="module recruit-module">
      <h2>📜 学员招募</h2>
      <div className="student-list">
        <h3>当前学员 ({state.students.length}/{getCapacity()})</h3>
        {state.students.length === 0 ? (
          <p className="empty-message">还没有学员，快去招募吧！</p>
        ) : (
          <div className="student-grid">
            {state.students.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-name">{student.name}</div>
                <div className="student-info">
                  <span className="magic-type" data-type={student.magicType}>
                    {student.magicType === 'fire' && '🔥'}
                    {student.magicType === 'water' && '💧'}
                    {student.magicType === 'earth' && '🪨'}
                    {student.magicType === 'wind' && '💨'}
                    {student.magicType === 'light' && '✨'}
                    {student.magicType === 'dark' && '🌑'}
                  </span>
                  <span>Lv.{student.level}</span>
                </div>
                <div className="student-exp">
                  经验: {student.exp}/{student.level * 100}
                </div>
                <div className="student-status">
                  {student.status === 'idle' && '🟢 空闲'}
                  {student.status === 'studying' && '📚 学习'}
                  {student.status === 'training' && '⚔️ 训练'}
                  {student.status === 'resting' && '😴 休息'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recruitment-section">
        <h3>招募新学员</h3>
        {isFull ? (
          <p className="empty-message">学员已达上限！</p>
        ) : (
          <div className="recruit-options">
            {tickets.map(ticket => (
              <div key={ticket.quality} className="recruit-card">
                <h4>{ticket.name}</h4>
                <div className="recruit-cost">
                  <span className={ticket.cost.gold > state.resources.gold ? 'insufficient' : ''}>💰{ticket.cost.gold}</span>
                  <span className={ticket.cost.mana > state.resources.mana ? 'insufficient' : ''}>🔮{ticket.cost.mana}</span>
                  <span className={ticket.cost.food > state.resources.food ? 'insufficient' : ''}>🍖{ticket.cost.food}</span>
                  <span className={ticket.cost.reputation > state.resources.reputation ? 'insufficient' : ''}>⭐{ticket.cost.reputation}</span>
                </div>
                <button
                  className={`recruit-btn ${ticket.quality} ${!canAfford(ticket.cost) ? 'disabled' : ''}`}
                  onClick={() => {
                    if (canAfford(ticket.cost)) {
                      dispatch({ type: 'SPEND_RESOURCE', resource: ticket.cost });
                      recruitStudent(ticket.quality);
                    }
                  }}
                  disabled={!canAfford(ticket.cost)}
                >
                  招募
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseModule() {
  const { state, dispatch } = useGame();

  const availableStudents = state.students.filter(s => s.status === 'idle' && !s.assignedCourse);

  const handleAssignCourse = (studentId: string, courseId: string) => {
    dispatch({ type: 'ASSIGN_STUDENT_TO_COURSE', studentId, courseId });
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      dispatch({ type: 'UPDATE_STUDENT', student: { ...student, status: 'studying' } });
    }
  };

  return (
    <div className="module course-module">
      <h2>📚 课程安排</h2>
      <div className="course-grid">
        {state.courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.name}</h3>
              <span className="course-level">Lv.{course.level}</span>
            </div>
            <div className="course-info">
              <span>⏱️ 持续 {course.duration} 天</span>
              <span>📖 所需等级 Lv.{course.requiredLevel}</span>
            </div>
            <div className="course-effect">
              {course.effect.type === 'exp_gain' && `经验 +${course.effect.value}`}
              {course.effect.type === 'skill_unlock' && `解锁技能`}
              {course.effect.type === 'stat_boost' && `属性 +${course.effect.value}`}
            </div>
            <div className="course-cost">
              <span>💰{course.cost.gold}</span>
              <span>🔮{course.cost.mana}</span>
              <span>🍖{course.cost.food}</span>
              <span>⭐{course.cost.reputation}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="assignment-section">
        <h3>安排学员上课</h3>
        {availableStudents.length === 0 ? (
          <p className="empty-message">没有空闲学员</p>
        ) : (
          <div className="assignment-list">
            {availableStudents.map(student => (
              <div key={student.id} className="assignment-item">
                <span className="student-name">{student.name}</span>
                <span className="student-level">Lv.{student.level}</span>
                <select
                  className="course-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignCourse(student.id, e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>选择课程</option>
                  {state.courses
                    .filter(c => c.requiredLevel <= student.level)
                    .map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DungeonModule() {
  const { state, dispatch } = useGame();
  const [selectedDungeon, setSelectedDungeon] = React.useState<string | null>(null);

  return (
    <div className="module dungeon-module">
      <h2>⚔️ 试炼副本</h2>
      <div className="dungeon-grid">
        {state.dungeons.map(dungeon => (
          <div key={dungeon.id} className={`dungeon-card ${dungeon.completed ? 'completed' : ''}`}>
            <div className="dungeon-header">
              <h3>{dungeon.name}</h3>
              <span className="dungeon-level">Lv.{dungeon.level}</span>
            </div>
            <div className="dungeon-info">
              <span>🌊 {dungeon.waves} 波</span>
              <span>📍 需要 Lv.{dungeon.requiredLevel}</span>
            </div>
            <div className="dungeon-rewards">
              <span>💰{dungeon.rewards.gold}</span>
              <span>🔮{dungeon.rewards.mana}</span>
              <span>🍖{dungeon.rewards.food}</span>
              <span>⭐{dungeon.rewards.reputation}</span>
            </div>
            {dungeon.completed ? (
              <div className="dungeon-completed">✅ 已通关</div>
            ) : (
              <button
                className="dungeon-btn"
                onClick={() => setSelectedDungeon(dungeon.id)}
                disabled={state.students.filter(s => s.level >= dungeon.requiredLevel).length === 0}
              >
                挑战
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedDungeon && (
        <DungeonBattle
          dungeon={state.dungeons.find(d => d.id === selectedDungeon)!}
          students={state.students}
          onClose={() => setSelectedDungeon(null)}
          onComplete={() => {
            dispatch({ type: 'COMPLETE_DUNGEON', dungeonId: selectedDungeon });
            setSelectedDungeon(null);
          }}
        />
      )}
    </div>
  );
}

interface DungeonBattleProps {
  dungeon: DungeonType;
  students: StudentType[];
  onClose: () => void;
  onComplete: () => void;
}

function DungeonBattle({ dungeon, students, onClose, onComplete }: DungeonBattleProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [battleStarted, setBattleStarted] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<string[]>([]);
  const battleRef = React.useRef<{
    playerTeam: (StudentType & { hp: number })[];
    enemyTeam: Enemy[];
    currentWave: number;
    totalWaves: number;
    battleEnded: boolean;
    animationId: number | null;
  }>({
    playerTeam: [],
    enemyTeam: [],
    currentWave: 1,
    totalWaves: dungeon.waves,
    battleEnded: false,
    animationId: null,
  });

  const eligibleStudents = students.filter(s => s.level >= dungeon.requiredLevel);

  const generateEnemies = (wave: number): Enemy[] => {
    const count = Math.min(1 + Math.floor(wave / 2), 3);
    return Array.from({ length: count }, (_, i) => ({
      id: `enemy_${wave}_${i}`,
      name: wave === dungeon.waves ? 'Boss' : `怪物 ${i + 1}`,
      hp: 50 + wave * 30 + Math.floor(Math.random() * 20),
      maxHp: 50 + wave * 30 + Math.floor(Math.random() * 20),
      damage: 10 + wave * 5,
      type: 'fire',
      isBoss: wave === dungeon.waves,
    }));
  };

  const startBattle = () => {
    if (selectedTeam.length === 0) return;
    const team = eligibleStudents.filter(s => selectedTeam.includes(s.id));
    battleRef.current = {
      playerTeam: team.map(s => ({ ...s, hp: 100 + s.level * 20 })),
      enemyTeam: generateEnemies(1),
      currentWave: 1,
      totalWaves: dungeon.waves,
      battleEnded: false,
      animationId: null,
    };
    setBattleStarted(true);
  };

  React.useEffect(() => {
    if (!battleStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    let enemyActionTimer = 0;

    const gameLoop = (timestamp: number) => {
      if (battleRef.current.battleEnded) return;

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      enemyActionTimer += deltaTime;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`第 ${battleRef.current.currentWave}/${battleRef.current.totalWaves} 波`, 10, 25);

      const { playerTeam, enemyTeam } = battleRef.current;

      playerTeam.forEach((student, i) => {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(50, 50 + i * 60, 150, 40);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${student.name}`, 55, 75 + i * 60);
        ctx.fillText(`HP: ${student.hp}`, 55, 90 + i * 60);
      });

      enemyTeam.forEach((enemy, i) => {
        ctx.fillStyle = enemy.isBoss ? '#f44336' : '#e91e63';
        ctx.fillRect(350, 50 + i * 60, 150, 40);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${enemy.name}`, 355, 75 + i * 60);
        ctx.fillText(`HP: ${enemy.hp}/${enemy.maxHp}`, 355, 90 + i * 60);
      });

      if (enemyActionTimer > 2000) {
        enemyActionTimer = 0;
        if (enemyTeam.length > 0 && playerTeam.length > 0) {
          const target = playerTeam[Math.floor(Math.random() * playerTeam.length)];
          const attacker = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
          target.hp -= attacker.damage;
          if (target.hp <= 0) {
            battleRef.current.playerTeam = playerTeam.filter(s => s.id !== target.id);
          }
        }
      }

      if (playerTeam.length === 0) {
        battleRef.current.battleEnded = true;
        ctx.fillStyle = '#f44336';
        ctx.font = '32px Arial';
        ctx.fillText('战斗失败！', canvas.width / 2 - 80, canvas.height / 2);
      } else if (enemyTeam.length === 0) {
        if (battleRef.current.currentWave < battleRef.current.totalWaves) {
          battleRef.current.currentWave++;
          battleRef.current.enemyTeam = generateEnemies(battleRef.current.currentWave);
        } else {
          battleRef.current.battleEnded = true;
          ctx.fillStyle = '#4CAF50';
          ctx.font = '32px Arial';
          ctx.fillText('战斗胜利！', canvas.width / 2 - 80, canvas.height / 2);
          setTimeout(() => onComplete(), 1000);
        }
      }

      battleRef.current.animationId = requestAnimationFrame(gameLoop);
    };

    battleRef.current.animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (battleRef.current.animationId) {
        cancelAnimationFrame(battleRef.current.animationId);
      }
    };
  }, [battleStarted, onComplete, dungeon.waves]);

  return (
    <div className="dungeon-battle-overlay">
      <div className="dungeon-battle-modal">
        <h3>{dungeon.name}</h3>
        {!battleStarted ? (
          <div className="team-selection">
            <p>选择参战学员 (至少1人):</p>
            <div className="team-select-grid">
              {eligibleStudents.map(student => (
                <label key={student.id} className="team-member-option">
                  <input
                    type="checkbox"
                    checked={selectedTeam.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeam([...selectedTeam, student.id]);
                      } else {
                        setSelectedTeam(selectedTeam.filter(id => id !== student.id));
                      }
                    }}
                  />
                  <span>{student.name} (Lv.{student.level})</span>
                </label>
              ))}
            </div>
            <div className="battle-actions">
              <button onClick={startBattle} disabled={selectedTeam.length === 0}>开始战斗</button>
              <button onClick={onClose}>取消</button>
            </div>
          </div>
        ) : (
          <div className="battle-arena">
            <canvas ref={canvasRef} width={550} height={300} />
          </div>
        )}
      </div>
    </div>
  );
}

function SettlementModule() {
  const { state, dispatch } = useGame();
  const [daysToAdvance, setDaysToAdvance] = React.useState(1);

  const dailyIncome = {
    gold: 50 + state.buildings.filter(b => b.id === 'dining_hall').reduce((acc, b) => acc + b.level * 5, 0),
    mana: 30 + state.buildings.filter(b => b.id === 'mana_tower').reduce((acc, b) => acc + b.level * 10, 0),
    food: 10 + state.buildings.filter(b => b.id === 'dining_hall').reduce((acc, b) => acc + b.level * 3, 0),
    reputation: 5,
  };

  return (
    <div className="module settlement-module">
      <h2>💰 资源结算</h2>

      <div className="daily-production">
        <h3>每日产出</h3>
        <div className="production-grid">
          <div className="production-item">
            <span>💰 金币</span>
            <span>+{dailyIncome.gold}</span>
          </div>
          <div className="production-item">
            <span>🔮 魔力</span>
            <span>+{dailyIncome.mana}</span>
          </div>
          <div className="production-item">
            <span>🍖 食物</span>
            <span>+{dailyIncome.food - Math.ceil(state.students.length * 0.5)} (消耗: -{Math.ceil(state.students.length * 0.5)})</span>
          </div>
          <div className="production-item">
            <span>⭐ 声望</span>
            <span>+{dailyIncome.reputation}</span>
          </div>
        </div>
      </div>

      <div className="advance-time">
        <h3>时间推进</h3>
        <div className="time-controls">
          <input
            type="number"
            min="1"
            max="30"
            value={daysToAdvance}
            onChange={(e) => setDaysToAdvance(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
          />
          <span>天</span>
          <button
            onClick={() => {
              for (let i = 0; i < daysToAdvance; i++) {
                dispatch({ type: 'ADD_RESOURCE', resource: dailyIncome });
                dispatch({ type: 'NEXT_DAY' });
              }
            }}
            disabled={state.resources.food < Math.ceil(state.students.length * 0.5 * daysToAdvance)}
          >
            推进 {daysToAdvance} 天
          </button>
        </div>
        <p className="warning">
          {state.resources.food < Math.ceil(state.students.length * 0.5 * daysToAdvance) &&
            '食物不足！'}
        </p>
      </div>

      <div className="current-resources">
        <h3>当前资源</h3>
        <div className="resource-grid">
          <div className="resource-card">
            <span className="resource-icon">💰</span>
            <span className="resource-value">{state.resources.gold}</span>
            <span className="resource-label">金币</span>
          </div>
          <div className="resource-card">
            <span className="resource-icon">🔮</span>
            <span className="resource-value">{state.resources.mana}</span>
            <span className="resource-label">魔力</span>
          </div>
          <div className="resource-card">
            <span className="resource-icon">🍖</span>
            <span className="resource-value">{state.resources.food}</span>
            <span className="resource-label">食物</span>
          </div>
          <div className="resource-card">
            <span className="resource-icon">⭐</span>
            <span className="resource-value">{state.resources.reputation}</span>
            <span className="resource-label">声望</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModule() {
  const { state, saveGame, loadGame, dispatch } = useGame();

  return (
    <div className="module settings-module">
      <h2>⚙️ 设置存档</h2>

      <div className="save-section">
        <h3>存档管理</h3>
        <div className="save-actions">
          <button onClick={saveGame}>💾 保存游戏</button>
          <button onClick={loadGame}>📂 加载存档</button>
          <button
            className="danger"
            onClick={() => {
              if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
                localStorage.removeItem('magicAcademySave');
                dispatch({ type: 'RESET_GAME' });
              }
            }}
          >
            🗑️ 重置游戏
          </button>
        </div>
      </div>

      <div className="game-stats">
        <h3>游戏统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span>🏰 学院等级</span>
            <span>{Math.max(...state.buildings.map(b => b.level))}</span>
          </div>
          <div className="stat-item">
            <span>👥 学员数量</span>
            <span>{state.students.length}</span>
          </div>
          <div className="stat-item">
            <span>⚔️ 通关副本</span>
            <span>{state.dungeons.filter(d => d.completed).length}/{state.dungeons.length}</span>
          </div>
          <div className="stat-item">
            <span>📅 游戏天数</span>
            <span>{state.day}</span>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h3>关于游戏</h3>
        <p>魔法学院经营游戏 v1.0</p>
        <p>使用 React + TypeScript + Canvas API 构建</p>
      </div>
    </div>
  );
}

export { AcademyModule, RecruitModule, CourseModule, DungeonModule, SettlementModule, SettingsModule };