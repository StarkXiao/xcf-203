import React from 'react';
import { useGame } from '../store/GameContext';
import type { TabType, Dungeon as DungeonType, Student as StudentType, Course as CourseType } from '../types/game';
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
            {state.students.map(student => {
              const course = student.assignedCourse ? state.courses.find(c => c.id === student.assignedCourse) : null;
              return (
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
                    {student.status === 'studying' && course && (
                      <span className="studying-info">
                        📚 {course.name} ({student.courseDaysRemaining}天)
                      </span>
                    )}
                    {student.status === 'training' && '⚔️ 训练'}
                    {student.status === 'resting' && '😴 休息'}
                  </div>
                  {student.skills.length > 0 && (
                    <div className="student-skills">
                      技能: {student.skills.map(s => s.name).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
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
  const { state, dispatch, canAfford } = useGame();

  const availableStudents = state.students.filter(s => s.status === 'idle');
  const studyingStudents = state.students.filter(s => s.status === 'studying');

  const handleAssignCourse = (studentId: string, courseId: string) => {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;
    if (!canAfford(course.cost)) return;
    
    dispatch({ type: 'SPEND_RESOURCE', resource: course.cost });
    dispatch({ type: 'ASSIGN_STUDENT_TO_COURSE', studentId, courseId, courseDuration: course.duration });
  };

  return (
    <div className="module course-module">
      <h2>📚 课程安排</h2>
      
      <div className="studying-section">
        <h3>正在上课的学员</h3>
        {studyingStudents.length === 0 ? (
          <p className="empty-message">没有学员正在上课</p>
        ) : (
          <div className="studying-list">
            {studyingStudents.map(student => {
              const course = state.courses.find(c => c.id === student.assignedCourse);
              return (
                <div key={student.id} className="studying-item">
                  <span className="student-name">{student.name}</span>
                  <span className="course-name">{course?.name || '未知课程'}</span>
                  <span className="course-progress">
                    进度: {student.courseProgress}/{course?.duration || 0} ({student.courseDaysRemaining}天剩余)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="course-list">
        <h3>可选课程</h3>
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
                {course.effect.type === 'skill_unlock' && course.magicType && `解锁 ${course.magicType} 技能`}
                {course.effect.type === 'stat_boost' && `属性 +${course.effect.value}`}
              </div>
              <div className="course-cost">
                <span className={course.cost.gold > state.resources.gold ? 'insufficient' : ''}>💰{course.cost.gold}</span>
                <span className={course.cost.mana > state.resources.mana ? 'insufficient' : ''}>🔮{course.cost.mana}</span>
                <span className={course.cost.food > state.resources.food ? 'insufficient' : ''}>🍖{course.cost.food}</span>
                <span className={course.cost.reputation > state.resources.reputation ? 'insufficient' : ''}>⭐{course.cost.reputation}</span>
              </div>
            </div>
          ))}
        </div>
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
                      <option key={course.id} value={course.id}>{course.name} ({course.duration}天)</option>
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
          courses={state.courses}
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
  courses: CourseType[];
  onClose: () => void;
  onComplete: () => void;
}

function DungeonBattle({ dungeon, students, courses, onClose, onComplete }: DungeonBattleProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [battleStarted, setBattleStarted] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<string[]>([]);
  const [battleResult, setBattleResult] = React.useState<'win' | 'lose' | null>(null);
  
  const battleRef = React.useRef<{
    playerTeam: (StudentType & { hp: number; maxHp: number })[];
    enemyTeam: Enemy[];
    currentWave: number;
    totalWaves: number;
    battleEnded: boolean;
    animationId: number | null;
    playerActionTimer: number;
    enemyActionTimer: number;
    attackLog: string[];
  }>({
    playerTeam: [],
    enemyTeam: [],
    currentWave: 1,
    totalWaves: dungeon.waves,
    battleEnded: false,
    animationId: null,
    playerActionTimer: 0,
    enemyActionTimer: 0,
    attackLog: [],
  });

  const eligibleStudents = students.filter(s => s.level >= dungeon.requiredLevel);

  const generateEnemies = (wave: number): Enemy[] => {
    const count = Math.min(1 + Math.floor(wave / 2), 3);
    const baseHp = 50 + wave * 30;
    const baseDamage = 10 + wave * 5;
    
    return Array.from({ length: count }, (_, i) => {
      const isBoss = wave === dungeon.waves && i === count - 1;
      return {
        id: `enemy_${wave}_${i}`,
        name: isBoss ? 'Boss' : `怪物 ${i + 1}`,
        hp: isBoss ? baseHp * 2 : baseHp + Math.floor(Math.random() * 20),
        maxHp: isBoss ? baseHp * 2 : baseHp + Math.floor(Math.random() * 20),
        damage: isBoss ? baseDamage * 1.5 : baseDamage,
        type: 'fire',
        isBoss,
      };
    });
  };

  const startBattle = () => {
    if (selectedTeam.length === 0) return;
    const team = eligibleStudents.filter(s => selectedTeam.includes(s.id));
    battleRef.current = {
      playerTeam: team.map(s => ({ 
        ...s, 
        hp: 100 + s.level * 20 + s.skills.length * 10,
        maxHp: 100 + s.level * 20 + s.skills.length * 10
      })),
      enemyTeam: generateEnemies(1),
      currentWave: 1,
      totalWaves: dungeon.waves,
      battleEnded: false,
      animationId: null,
      playerActionTimer: 0,
      enemyActionTimer: 0,
      attackLog: [],
    };
    setBattleStarted(true);
    setBattleResult(null);
  };

  React.useEffect(() => {
    if (!battleStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const gameLoop = (timestamp: number) => {
      if (battleRef.current.battleEnded) return;

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      battleRef.current.playerActionTimer += deltaTime;
      battleRef.current.enemyActionTimer += deltaTime;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`第 ${battleRef.current.currentWave}/${battleRef.current.totalWaves} 波`, 10, 25);

      const { playerTeam, enemyTeam, attackLog } = battleRef.current;

      const playerBaseDamage = 15;
      const playerAttackInterval = 1500;
      const enemyAttackInterval = 2000;

      if (battleRef.current.playerActionTimer > playerAttackInterval && enemyTeam.length > 0 && playerTeam.length > 0) {
        battleRef.current.playerActionTimer = 0;
        
        const attacker = playerTeam[Math.floor(Math.random() * playerTeam.length)];
        const target = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
        
        const skillBonus = attacker.skills.length > 0 ? attacker.skills[0].damage : 0;
        const damage = playerBaseDamage + attacker.level * 3 + skillBonus;
        
        target.hp -= damage;
        attackLog.push(`${attacker.name} 对 ${target.name} 造成 ${damage} 伤害`);
        
        if (attackLog.length > 5) attackLog.shift();
        
        if (target.hp <= 0) {
          battleRef.current.enemyTeam = enemyTeam.filter(e => e.hp > 0);
          attackLog.push(`${target.name} 被击败！`);
        }
      }

      if (battleRef.current.enemyActionTimer > enemyAttackInterval && enemyTeam.length > 0 && playerTeam.length > 0) {
        battleRef.current.enemyActionTimer = 0;
        
        const attacker = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
        const target = playerTeam[Math.floor(Math.random() * playerTeam.length)];
        
        target.hp -= attacker.damage;
        attackLog.push(`${attacker.name} 对 ${target.name} 造成 ${Math.floor(attacker.damage)} 伤害`);
        
        if (attackLog.length > 5) attackLog.shift();
        
        if (target.hp <= 0) {
          battleRef.current.playerTeam = playerTeam.filter(p => p.hp > 0);
          attackLog.push(`${target.name} 被击败！`);
        }
      }

      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaa';
      attackLog.forEach((log, i) => {
        ctx.fillText(log, 10, 280 - i * 18);
      });

      playerTeam.forEach((student, i) => {
        const hpPercent = student.hp / student.maxHp;
        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#f44336';
        ctx.fillRect(50, 50 + i * 70, 150, 50);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${student.name}`, 55, 70 + i * 70);
        ctx.font = '12px Arial';
        ctx.fillText(`HP: ${Math.max(0, Math.floor(student.hp))}/${student.maxHp}`, 55, 90 + i * 70);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(50, 50 + i * 70 + 52, 150, 8);
        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#f44336';
        ctx.fillRect(50, 50 + i * 70 + 52, 150 * Math.max(0, hpPercent), 8);
      });

      enemyTeam.forEach((enemy, i) => {
        const hpPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = enemy.isBoss ? '#f44336' : '#e91e63';
        ctx.fillRect(350, 50 + i * 70, 150, 50);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${enemy.name}`, 355, 70 + i * 70);
        ctx.font = '12px Arial';
        ctx.fillText(`HP: ${Math.max(0, Math.floor(enemy.hp))}/${enemy.maxHp}`, 355, 90 + i * 70);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(350, 50 + i * 70 + 52, 150, 8);
        ctx.fillStyle = enemy.isBoss ? '#f44336' : '#e91e63';
        ctx.fillRect(350, 50 + i * 70 + 52, 150 * Math.max(0, hpPercent), 8);
      });

      if (playerTeam.length === 0) {
        battleRef.current.battleEnded = true;
        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('战斗失败！', canvas.width / 2 - 80, canvas.height / 2);
        setBattleResult('lose');
      } else if (enemyTeam.length === 0) {
        if (battleRef.current.currentWave < battleRef.current.totalWaves) {
          battleRef.current.currentWave++;
          battleRef.current.enemyTeam = generateEnemies(battleRef.current.currentWave);
          battleRef.current.attackLog.push(`进入第 ${battleRef.current.currentWave} 波！`);
        } else {
          battleRef.current.battleEnded = true;
          ctx.fillStyle = '#4CAF50';
          ctx.font = 'bold 32px Arial';
          ctx.fillText('战斗胜利！', canvas.width / 2 - 80, canvas.height / 2);
          setBattleResult('win');
          setTimeout(() => onComplete(), 1500);
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
            <p>选择参战学员 (至少1人，推荐2-3人):</p>
            <div className="team-select-grid">
              {eligibleStudents.map(student => {
                const course = student.assignedCourse ? courses.find(c => c.id === student.assignedCourse) : null;
                return (
                  <label key={student.id} className={`team-member-option ${student.status !== 'idle' ? 'disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedTeam.includes(student.id)}
                      disabled={student.status !== 'idle'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeam([...selectedTeam, student.id]);
                        } else {
                          setSelectedTeam(selectedTeam.filter(id => id !== student.id));
                        }
                      }}
                    />
                    <span>
                      {student.name} (Lv.{student.level})
                      {student.skills.length > 0 && ` [${student.skills.length}技能]`}
                      {student.status !== 'idle' && course && ` - 正在${course.name}`}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="battle-actions">
              <button onClick={startBattle} disabled={selectedTeam.length === 0}>开始战斗</button>
              <button onClick={onClose}>取消</button>
            </div>
          </div>
        ) : (
          <div className="battle-arena">
            <canvas ref={canvasRef} width={550} height={300} />
            {battleResult === 'lose' && (
              <div className="battle-result lose">
                <p>战斗失败，学员需要更多训练！</p>
                <button onClick={onClose}>返回</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SettlementModule() {
  const { state, dispatch } = useGame();
  const [daysToAdvance, setDaysToAdvance] = React.useState(1);

  const libraryLevel = state.buildings.find(b => b.id === 'library')?.level || 0;
  const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
  const manaTowerLevel = state.buildings.find(b => b.id === 'mana_tower')?.level || 0;

  const dailyIncome = {
    gold: 50 + diningHallLevel * 5,
    mana: 30 + manaTowerLevel * 10,
    food: 10 + diningHallLevel * 3,
    reputation: 5 + diningHallLevel * 2,
  };

  const foodConsumption = Math.ceil(state.students.length * 0.5);
  const studyingCount = state.students.filter(s => s.status === 'studying').length;

  return (
    <div className="module settlement-module">
      <h2>💰 资源结算</h2>

      <div className="daily-production">
        <h3>每日产出与消耗</h3>
        <div className="production-grid">
          <div className="production-item">
            <span>💰 金币</span>
            <span className="positive">+{dailyIncome.gold}</span>
          </div>
          <div className="production-item">
            <span>🔮 魔力</span>
            <span className="positive">+{dailyIncome.mana}</span>
          </div>
          <div className="production-item">
            <span>🍖 食物</span>
            <span>+{dailyIncome.food} -{foodConsumption} = {dailyIncome.food - foodConsumption}</span>
          </div>
          <div className="production-item">
            <span>⭐ 声望</span>
            <span className="positive">+{dailyIncome.reputation}</span>
          </div>
        </div>
        
        <div className="production-bonus">
          <p>📚 图书馆 Lv.{libraryLevel}: 课程经验 +{libraryLevel * 10}%</p>
          <p>🍽️ 餐厅 Lv.{diningHallLevel}: 产出 +{diningHallLevel * 5}金币, +{diningHallLevel * 3}食物</p>
          <p>🔮 魔力塔 Lv.{manaTowerLevel}: 魔力 +{manaTowerLevel * 10}</p>
        </div>
        
        {studyingCount > 0 && (
          <div className="studying-status">
            <p>📖 {studyingCount} 名学员正在上课，推进时间可获得经验</p>
          </div>
        )}
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
            disabled={state.resources.food < foodConsumption * daysToAdvance}
          >
            推进 {daysToAdvance} 天
          </button>
        </div>
        <p className="warning">
          {state.resources.food < foodConsumption * daysToAdvance &&
            `食物不足！需要 ${foodConsumption * daysToAdvance}，当前 ${state.resources.food}`}
        </p>
        <p className="tip">
          💡 推进时间会让正在上课的学员获得经验，课程完成后学员会自动结课
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

  const totalSkills = state.students.reduce((acc, s) => acc + s.skills.length, 0);

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
            <span>🏰 最高建筑等级</span>
            <span>{Math.max(...state.buildings.map(b => b.level))}</span>
          </div>
          <div className="stat-item">
            <span>👥 学员数量</span>
            <span>{state.students.length}</span>
          </div>
          <div className="stat-item">
            <span>📊 学员总等级</span>
            <span>{state.students.reduce((acc, s) => acc + s.level, 0)}</span>
          </div>
          <div className="stat-item">
            <span>✨ 已解锁技能</span>
            <span>{totalSkills}</span>
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

      <div className="game-guide">
        <h3>游戏指南</h3>
        <div className="guide-content">
          <p><strong>玩法循环：</strong></p>
          <ol>
            <li>招募学员消耗金币/魔力</li>
            <li>安排学员上课消耗资源，获得经验和技能</li>
            <li>升级建筑增加学员容量和产出</li>
            <li>挑战副本获得大量资源奖励</li>
            <li>推进时间让学员成长，课程自动完成</li>
          </ol>
          <p><strong>建议：</strong>先招募学员，上课获取技能，再挑战副本获取资源升级建筑</p>
        </div>
      </div>

      <div className="about-section">
        <h3>关于游戏</h3>
        <p>魔法学院经营游戏 v1.1</p>
        <p>使用 React + TypeScript + Canvas API 构建</p>
      </div>
    </div>
  );
}

export { AcademyModule, RecruitModule, CourseModule, DungeonModule, SettlementModule, SettingsModule };