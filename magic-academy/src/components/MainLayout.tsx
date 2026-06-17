import React from 'react';
import { useGame } from '../store/GameContext';
import type { TabType, Dungeon as DungeonType, Student as StudentType, Course as CourseType, DailyEvent } from '../types/game';
import { getStudentStatsSummary, calculateExpGain, calculateSynergyBonus } from '../data/gameData';
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
    const synergyBonus = calculateSynergyBonus(state.buildings, 'capacity');
    return baseCapacity + buildingBonus + synergyBonus;
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
  const { state, dispatch, canAfford, checkPrerequisites, getActiveSynergies } = useGame();
  const activeSynergies = getActiveSynergies(state.buildings);

  return (
    <div className="module academy-module">
      <h2>🏰 学院建设</h2>
      
      {activeSynergies.length > 0 && (
        <div className="synergy-section">
          <h3>✨ 已激活联动效果</h3>
          <div className="synergy-list">
            {activeSynergies.map(({ synergy, totalValue }) => (
              <div key={synergy.name} className="synergy-card active">
                <div className="synergy-header">
                  <span className="synergy-name">🌟 {synergy.name}</span>
                  <span className="synergy-value">+{totalValue}</span>
                </div>
                <p className="synergy-desc">{synergy.description}</p>
                <div className="synergy-requirements">
                  {synergy.requires.map(req => {
                    const b = state.buildings.find(bl => bl.id === req.buildingId);
                    return (
                      <span key={req.buildingId} className="synergy-req met">
                        {b?.name} Lv.{b?.level}/{req.minLevel}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          const prereqCheck = checkPrerequisites(building, state.buildings);
          const canUpgrade = affordable && prereqCheck.met && !maxed;

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
              
              {building.prerequisites && building.prerequisites.length > 0 && (
                <div className="prerequisites">
                  <div className="prereq-label">前置条件:</div>
                  {prereqCheck.requirements.map((req, idx) => (
                    <span 
                      key={idx} 
                      className={`prereq-item ${req.current >= req.required ? 'met' : 'not-met'}`}
                    >
                      {req.name} Lv.{req.current}/{req.required}
                    </span>
                  ))}
                </div>
              )}

              {building.synergyBonus && building.synergyBonus.length > 0 && (
                <div className="synergy-info">
                  <div className="synergy-label">联动效果:</div>
                  {building.synergyBonus.map((synergy, idx) => {
                    const isActive = activeSynergies.some(s => s.synergy.name === synergy.name);
                    return (
                      <div key={idx} className={`synergy-preview ${isActive ? 'active' : ''}`}>
                        <span className="synergy-preview-name">
                          {isActive ? '🌟' : '🔒'} {synergy.name}
                        </span>
                        <div className="synergy-preview-requires">
                          {synergy.requires.map((req, i) => {
                            const b = state.buildings.find(bl => bl.id === req.buildingId);
                            const met = (b?.level || 0) >= req.minLevel;
                            return (
                              <span key={i} className={`synergy-req ${met ? 'met' : 'not-met'}`}>
                                {b?.name} Lv.{b?.level}/{req.minLevel}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
              ) : !prereqCheck.met ? (
                <div className="prereq-blocked">前置条件未满足</div>
              ) : (
                <button
                  className={`upgrade-btn ${!canUpgrade ? 'disabled' : ''}`}
                  onClick={() => canUpgrade && dispatch({ type: 'UPGRADE_BUILDING', buildingId: building.id })}
                  disabled={!canUpgrade}
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
  const { state, dispatch, canAfford, recruitStudent, assignStudentToRest, getMoraleLabel, getStaminaLabel } = useGame();
  const getCapacity = () => {
    const baseCapacity = 10;
    const buildingBonus = state.buildings.reduce((acc, b) => {
      if (b.effect.type === 'student_capacity') {
        return acc + b.effect.value * b.level;
      }
      return acc;
    }, 0);
    const synergyBonus = calculateSynergyBonus(state.buildings, 'capacity');
    return baseCapacity + buildingBonus + synergyBonus;
  };

  const tickets = [
    { 
      quality: 'common' as const, 
      name: '普通招募', 
      cost: { gold: 100, mana: 50, food: 0, reputation: 0 },
      level: '初始 Lv.1',
      traits: '1个普通特质',
      potential: '潜力: 0.5-1.0',
      exp: '经验加成: 50%-100%',
      speed: '课程速度: 75%-100%',
    },
    { 
      quality: 'rare' as const, 
      name: '稀有招募', 
      cost: { gold: 300, mana: 150, food: 10, reputation: 20 },
      level: '初始 Lv.2',
      traits: '1个稀有特质',
      potential: '潜力: 0.9-1.3',
      exp: '经验加成: 90%-130%',
      speed: '课程速度: 95%-115%',
    },
    { 
      quality: 'epic' as const, 
      name: '史诗招募', 
      cost: { gold: 800, mana: 400, food: 30, reputation: 50 },
      level: '初始 Lv.3',
      traits: '2个史诗特质',
      potential: '潜力: 1.2-1.6',
      exp: '经验加成: 120%-160%',
      speed: '课程速度: 110%-130%',
    },
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
              const qualityColors: Record<string, string> = {
                common: '#9e9e9e',
                rare: '#2196f3',
                epic: '#9c27b0',
                legendary: '#ff9800',
              };
              const qualityNames: Record<string, string> = {
                common: '普通',
                rare: '稀有',
                epic: '史诗',
                legendary: '传说',
              };
              const stats = getStudentStatsSummary(student);
              const moraleInfo = getMoraleLabel(student.morale);
              const staminaInfo = getStaminaLabel(student.stamina);
              return (
                <div key={student.id} className="student-card" style={{ borderColor: qualityColors[student.quality] || '#9e9e9e' }}>
                  <div className="student-header">
                    <div className="student-name">{student.name}</div>
                    <span className="student-quality" style={{ color: qualityColors[student.quality] }}>
                      {qualityNames[student.quality]}
                    </span>
                  </div>
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
                  <div className="student-stats">
                    <span className="potential-badge">潜力: {student.potential.toFixed(2)}</span>
                    <span className="stat-badge exp-badge">经验 x{stats.expMultiplier / 100}</span>
                    <span className="stat-badge speed-badge">速度 x{stats.courseSpeedMultiplier / 100}</span>
                  </div>
                  <div className="student-exp">
                    经验: {student.exp}/{student.level * 100}
                  </div>
                  <div className="student-morale-stamina">
                    <div className="morale-bar-wrapper">
                      <div className="morale-label" style={{ color: moraleInfo.color }}>😊 {moraleInfo.label} {student.morale}%</div>
                      <div className="bar-bg">
                        <div className="bar-fill morale-fill" style={{ width: `${student.morale}%`, background: moraleInfo.color }}></div>
                      </div>
                    </div>
                    <div className="stamina-bar-wrapper">
                      <div className="stamina-label" style={{ color: staminaInfo.color }}>⚡ {staminaInfo.label} {student.stamina}%</div>
                      <div className="bar-bg">
                        <div className="bar-fill stamina-fill" style={{ width: `${student.stamina}%`, background: staminaInfo.color }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="student-status">
                    {student.status === 'idle' && '🟢 空闲'}
                    {student.status === 'studying' && course && (
                      <span className="studying-info">
                        📚 {course.name} ({student.courseDaysRemaining.toFixed(1)}天)
                      </span>
                    )}
                    {student.status === 'training' && '⚔️ 训练'}
                    {student.status === 'resting' && '😴 休息中...'}
                  </div>
                  {student.traits.length > 0 && (
                    <div className="student-traits">
                      {student.traits.map(trait => (
                        <span key={trait.id} className={`trait-badge trait-${trait.rarity}`} title={trait.description}>
                          {trait.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {student.skills.length > 0 && (
                    <div className="student-skills">
                      技能: {student.skills.map(s => `${s.name}(${s.damage}伤害)`).join(', ')}
                    </div>
                  )}
                  <div className="student-actions">
                    {student.status === 'idle' && (
                      <button 
                        className="rest-btn"
                        onClick={() => assignStudentToRest(student.id)}
                        title="让学员休息以恢复士气和体力"
                      >
                        😴 安排休息
                      </button>
                    )}
                    {student.status === 'resting' && (
                      <span className="resting-hint">休息中，状态恢复后自动空闲</span>
                    )}
                  </div>
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
            {tickets.map(ticket => {
              const qualityColors: Record<string, string> = {
                common: '#9e9e9e',
                rare: '#2196f3',
                epic: '#9c27b0',
                legendary: '#ff9800',
              };
              return (
                <div key={ticket.quality} className="recruit-card" style={{ borderColor: qualityColors[ticket.quality] }}>
                  <h4 style={{ color: qualityColors[ticket.quality] }}>{ticket.name}</h4>
                  <div className="recruit-info">
                    <span className="level-info">{ticket.level}</span>
                    <span className="trait-info">{ticket.traits}</span>
                    <span className="potential-info">{ticket.potential}</span>
                    <span className="exp-info">{ticket.exp}</span>
                    <span className="speed-info">{ticket.speed}</span>
                  </div>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseModule() {
  const { state, assignStudentToCourse, queueCourse, removeFromQueue, reorderQueue, checkCourseConflict, canAfford } = useGame();
  const [selectedStudentForQueue, setSelectedStudentForQueue] = React.useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = React.useState<string | null>(null);

  const availableStudents = state.students.filter(s => s.status === 'idle');
  const studyingStudents = state.students.filter(s => s.status === 'studying');
  const studentsWithQueue = state.students.filter(s => s.courseQueue && s.courseQueue.length > 0);

  const handleAssignCourse = (studentId: string, courseId: string) => {
    const conflict = checkCourseConflict(studentId, courseId);
    if (conflict.hasConflict && conflict.reason) {
      setConflictMessage(conflict.reason);
      setTimeout(() => setConflictMessage(null), 3000);
      return;
    }
    assignStudentToCourse(studentId, courseId);
  };

  const handleQueueCourse = (studentId: string, courseId: string) => {
    const conflict = checkCourseConflict(studentId, courseId);
    if (conflict.hasConflict && conflict.reason) {
      setConflictMessage(conflict.reason);
      setTimeout(() => setConflictMessage(null), 3000);
      return;
    }
    queueCourse(studentId, courseId);
    setSelectedStudentForQueue(null);
  };

  const moveQueueItem = (studentId: string, fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    reorderQueue(studentId, fromIndex, toIndex);
  };

  const getTotalQueueDays = (student: typeof state.students[0]) => {
    return student.courseQueue.reduce((total, q) => {
      const course = state.courses.find(c => c.id === q.courseId);
      return total + (course?.duration || 0);
    }, 0);
  };

  const renderCourseQueue = (student: typeof state.students[0]) => {
    if (!student.courseQueue || student.courseQueue.length === 0) return null;

    return (
      <div className="course-queue-section">
        <div className="queue-header">
          <span className="queue-title">📋 学习队列 ({student.courseQueue.length}门, 共{getTotalQueueDays(student)}天)</span>
        </div>
        <div className="queue-list">
          {student.courseQueue.map((queued, index) => {
            const course = state.courses.find(c => c.id === queued.courseId);
            if (!course) return null;
            return (
              <div key={`${queued.courseId}-${index}`} className="queue-item">
                <span className="queue-order">#{index + 1}</span>
                <span className="queue-course-name">{course.name}</span>
                <span className="queue-course-duration">({course.duration}天)</span>
                <div className="queue-actions">
                  <button 
                    className="queue-btn move-up"
                    onClick={() => moveQueueItem(student.id, index, 'up')}
                    disabled={index === 0}
                    title="上移"
                  >
                    ↑
                  </button>
                  <button 
                    className="queue-btn move-down"
                    onClick={() => moveQueueItem(student.id, index, 'down')}
                    disabled={index === student.courseQueue.length - 1}
                    title="下移"
                  >
                    ↓
                  </button>
                  <button 
                    className="queue-btn remove"
                    onClick={() => removeFromQueue(student.id, index)}
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQueueCourseSelector = (studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return null;

    return (
      <div className="queue-selector">
        <select
          className="course-select"
          onChange={(e) => {
            if (e.target.value) {
              handleQueueCourse(studentId, e.target.value);
            }
          }}
          defaultValue=""
          autoFocus
        >
          <option value="" disabled>选择要加入队列的课程...</option>
          {state.courses
            .filter(c => c.requiredLevel <= student.level)
            .map(course => {
              const conflict = checkCourseConflict(studentId, course.id);
              const expectedExp = course.effect.type === 'exp_gain' 
                ? calculateExpGain(course.effect.value, student)
                : null;
              const label = expectedExp !== null
                ? `${course.name} (${course.duration}天, 预计+${expectedExp}经验)${conflict.hasConflict ? ' - ' + conflict.reason : ''}`
                : `${course.name} (${course.duration}天)${conflict.hasConflict ? ' - ' + conflict.reason : ''}`;
              return (
                <option 
                  key={course.id} 
                  value={course.id}
                  disabled={conflict.hasConflict}
                >
                  {label}
                </option>
              );
            })}
        </select>
        <button className="cancel-queue-btn" onClick={() => setSelectedStudentForQueue(null)}>取消</button>
      </div>
    );
  };

  const renderCompletionReminder = () => {
    const almostDone = studyingStudents.filter(s => s.courseDaysRemaining <= 1);
    if (almostDone.length === 0) return null;

    return (
      <div className="reminder-section">
        <h3>⏰ 即将完成提醒</h3>
        <div className="reminder-list">
          {almostDone.map(student => {
            const course = state.courses.find(c => c.id === student.assignedCourse);
            const nextCourse = student.courseQueue && student.courseQueue.length > 0 
              ? state.courses.find(c => c.id === student.courseQueue[0].courseId)
              : null;
            return (
              <div key={student.id} className="reminder-item">
                <span className="reminder-icon">⏳</span>
                <span className="reminder-text">
                  <strong>{student.name}</strong> 的「{course?.name}」还有 {student.courseDaysRemaining.toFixed(1)} 天完成
                  {nextCourse && (
                    <span className="next-course-hint"> → 下一门:「{nextCourse.name}」</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="module course-module">
      <h2>📚 课程安排</h2>
      
      {conflictMessage && (
        <div className="conflict-alert">
          ⚠️ {conflictMessage}
        </div>
      )}

      {renderCompletionReminder()}

      <div className="studying-section">
        <h3>正在上课的学员</h3>
        {studyingStudents.length === 0 ? (
          <p className="empty-message">没有学员正在上课</p>
        ) : (
          <div className="studying-list">
            {studyingStudents.map(student => {
              const course = state.courses.find(c => c.id === student.assignedCourse);
              const stats = getStudentStatsSummary(student);
              const progressPercent = course ? (student.courseProgress / course.duration) * 100 : 0;
              return (
                <div key={student.id} className={`studying-item ${student.courseDaysRemaining <= 1 ? 'almost-done' : ''}`}>
                  <div className="studying-main-info">
                    <span className="student-name">{student.name}</span>
                    <span className="course-name">{course?.name || '未知课程'}</span>
                  </div>
                  <div className="studying-progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <div className="studying-details">
                    <span className="course-progress">
                      进度: {student.courseProgress.toFixed(1)}/{course?.duration || 0} ({student.courseDaysRemaining.toFixed(1)}天剩余)
                    </span>
                    <span className="course-stats">
                      经验x{stats.expMultiplier / 100} / 速度x{stats.courseSpeedMultiplier / 100}
                    </span>
                  </div>
                  {renderCourseQueue(student)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {studentsWithQueue.length > 0 && (
        <div className="queue-overview-section">
          <h3>📋 待学习队列概览</h3>
          <div className="queue-overview-list">
            {studentsWithQueue.filter(s => s.status !== 'studying').map(student => (
              <div key={student.id} className="queue-overview-item">
                <div className="queue-overview-header">
                  <span className="student-name">{student.name}</span>
                  <span className="student-level">Lv.{student.level}</span>
                  <span className="queue-count">{student.courseQueue.length}门待学习</span>
                </div>
                {renderCourseQueue(student)}
              </div>
            ))}
          </div>
        </div>
      )}

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
            {availableStudents.map(student => {
              const stats = getStudentStatsSummary(student);
              return (
                <div key={student.id} className="assignment-item">
                  <div className="assignment-student-info">
                    <span className="student-name">{student.name}</span>
                    <span className="student-level">Lv.{student.level}</span>
                    <span className="stat-badge exp-badge">经验x{stats.expMultiplier / 100}</span>
                    <span className="stat-badge speed-badge">速度x{stats.courseSpeedMultiplier / 100}</span>
                    {student.courseQueue.length > 0 && (
                      <span className="queue-count-badge">📋 {student.courseQueue.length}门排队中</span>
                    )}
                  </div>
                  {selectedStudentForQueue === student.id ? (
                    renderQueueCourseSelector(student.id)
                  ) : (
                    <div className="assignment-actions">
                      <select
                        className="course-select"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignCourse(student.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>🎯 立即上课</option>
                        {state.courses
                          .filter(c => c.requiredLevel <= student.level)
                          .map(course => {
                            const conflict = checkCourseConflict(student.id, course.id);
                            const expectedExp = course.effect.type === 'exp_gain' 
                              ? calculateExpGain(course.effect.value, student)
                              : null;
                            const canAffordCourse = canAfford(course.cost);
                            let label = expectedExp !== null
                              ? `${course.name} (${course.duration}天, 预计+${expectedExp}经验)`
                              : `${course.name} (${course.duration}天)`;
                            if (conflict.hasConflict) label += ` - ${conflict.reason}`;
                            else if (!canAffordCourse) label += ' - 资源不足';
                            return (
                              <option 
                                key={course.id} 
                                value={course.id}
                                disabled={conflict.hasConflict || !canAffordCourse}
                              >
                                {label}
                              </option>
                            );
                          })}
                      </select>
                      <button 
                        className="queue-add-btn"
                        onClick={() => setSelectedStudentForQueue(student.id)}
                      >
                        ➕ 加入队列
                      </button>
                    </div>
                  )}
                  {renderCourseQueue(student)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="auto-learning-info">
        <h4>💡 自动连续学习说明</h4>
        <ul>
          <li>加入队列的课程会在当前课程完成后自动开始（需等级和资源足够）</li>
          <li>可以使用 ↑↓ 按钮调整队列顺序，排在最前面的优先学习</li>
          <li>课程即将完成时会有提醒，下一门课程会自动准备</li>
          <li>资源不足或等级不够时，课程会自动跳过并提示</li>
        </ul>
      </div>
    </div>
  );
}

function DungeonModule() {
  const { state, dispatch, calculateSweepRewards, canSweep } = useGame();
  const [selectedDungeon, setSelectedDungeon] = React.useState<string | null>(null);
  const [showSweepConfirm, setShowSweepConfirm] = React.useState<string | null>(null);

  const renderStars = (stars: number, maxStars: number = 3) => {
    return (
      <div className="star-display">
        {Array.from({ length: maxStars }, (_, i) => (
          <span key={i} className={`star ${i < stars ? 'filled' : 'empty'}`}>★</span>
        ))}
      </div>
    );
  };

  const canSweepDungeon = (dungeon: DungeonType): { ok: boolean; reason?: string } => {
    if (!canSweep(dungeon)) return { ok: false, reason: '未解锁扫荡（需3星通关）' };
    if (dungeon.bestTeam.length === 0) return { ok: false, reason: '无最佳阵容记录' };
    const halfStamina = Math.ceil(dungeon.staminaCost * 0.5);
    const availableMembers = dungeon.bestTeam.filter(id => {
      const s = state.students.find(st => st.id === id);
      return s && s.status === 'idle' && s.stamina >= halfStamina;
    });
    if (availableMembers.length === 0) {
      return { ok: false, reason: `最佳阵容体力不足（需${halfStamina}/人）` };
    }
    return { ok: true };
  };

  const handleSweep = (dungeonId: string) => {
    const dungeon = state.dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;
    const sweepCheck = canSweepDungeon(dungeon);
    if (!sweepCheck.ok) return;
    
    dispatch({ type: 'SWEEP_DUNGEON', dungeonId });
    setShowSweepConfirm(null);
  };

  return (
    <div className="module dungeon-module">
      <h2>⚔️ 试炼副本</h2>
      
      <div className="dungeon-info-bar">
        <div className="dungeon-stats">
          <span>📊 总通关次数: {state.dungeons.reduce((acc, d) => acc + d.clearedCount, 0)}</span>
          <span>⭐ 最高星级: {state.dungeons.reduce((acc, d) => acc + d.bestStars, 0)}/{state.dungeons.length * 3}</span>
        </div>
      </div>

      <div className="dungeon-grid">
        {state.dungeons.map(dungeon => {
          const eligibleCount = state.students.filter(s => s.level >= dungeon.requiredLevel).length;
          const battleReadyCount = state.students.filter(s => 
            s.level >= dungeon.requiredLevel && 
            s.status === 'idle' && 
            s.stamina >= dungeon.staminaCost &&
            s.morale >= 15
          ).length;
          const canChallenge = battleReadyCount > 0;
          const sweepable = canSweep(dungeon);
          const hasBestTeam = dungeon.bestTeam.length > 0;
          const sweepRewards = calculateSweepRewards(dungeon);
          const sweepCheck = canSweepDungeon(dungeon);
          const halfStamina = Math.ceil(dungeon.staminaCost * 0.5);
          
          return (
            <div key={dungeon.id} className={`dungeon-card ${dungeon.firstCleared ? 'cleared' : ''}`}>
              <div className="dungeon-header">
                <h3>
                  {dungeon.name}
                  {!dungeon.firstCleared && <span className="first-clear-badge">首通</span>}
                </h3>
                <span className="dungeon-level">Lv.{dungeon.level}</span>
              </div>

              <div className="dungeon-stars-section">
                <div className="best-stars">
                  <span className="stars-label">最高纪录:</span>
                  {renderStars(dungeon.bestStars)}
                </div>
                {dungeon.clearedCount > 0 && (
                  <div className="clear-count">已通关 {dungeon.clearedCount} 次</div>
                )}
              </div>

              <div className="dungeon-info">
                <span>🌊 {dungeon.waves} 波</span>
                <span>📍 需要 Lv.{dungeon.requiredLevel}</span>
                <span>⚡ 消耗 {dungeon.staminaCost} (扫荡{halfStamina})</span>
              </div>

              <div className="dungeon-star-reqs">
                <div className="star-req-title">星级条件:</div>
                <div className="star-req-item"><span className="star-gold">★★★</span> {dungeon.starRequirements.threeStar}</div>
                <div className="star-req-item"><span className="star-silver">★★</span> {dungeon.starRequirements.twoStar}</div>
                <div className="star-req-item"><span className="star-bronze">★</span> {dungeon.starRequirements.oneStar}</div>
              </div>

              <div className="dungeon-rewards">
                <div className="reward-section">
                  <span className="reward-label">普通奖励:</span>
                  <div className="reward-items">
                    <span>💰{dungeon.rewards.gold}</span>
                    <span>🔮{dungeon.rewards.mana}</span>
                    <span>🍖{dungeon.rewards.food}</span>
                    <span>⭐{dungeon.rewards.reputation}</span>
                  </div>
                </div>
                {!dungeon.firstCleared && (
                  <div className="reward-section first-clear">
                    <span className="reward-label">首通奖励:</span>
                    <div className="reward-items">
                      <span className="highlight">💰{dungeon.firstClearRewards.gold}</span>
                      <span className="highlight">🔮{dungeon.firstClearRewards.mana}</span>
                      <span className="highlight">🍖{dungeon.firstClearRewards.food}</span>
                      <span className="highlight">⭐{dungeon.firstClearRewards.reputation}</span>
                    </div>
                  </div>
                )}
                {sweepable && (
                  <div className="reward-section sweep">
                    <span className="reward-label">扫荡奖励 (80%):</span>
                    <div className="reward-items">
                      <span>💰{sweepRewards.gold}</span>
                      <span>🔮{sweepRewards.mana}</span>
                      <span>🍖{sweepRewards.food}</span>
                      <span>⭐{sweepRewards.reputation}</span>
                    </div>
                  </div>
                )}
              </div>

              {hasBestTeam && (
                <div className="best-team-info">
                  <span>👥 最佳阵容: {dungeon.bestTeam.map(id => {
                    const student = state.students.find(s => s.id === id);
                    if (!student) return '未知';
                    const statusEmoji = student.status === 'idle' ? '✅' : '⏳';
                    const staminaOk = student.stamina >= halfStamina ? '' : '⚡低';
                    return `${student.name}${statusEmoji}${staminaOk}`;
                  }).join(', ')}</span>
                </div>
              )}

              <div className="dungeon-actions">
                <button
                  className="dungeon-btn challenge-btn"
                  onClick={() => setSelectedDungeon(dungeon.id)}
                  disabled={!canChallenge}
                >
                  挑战
                </button>
                {sweepable && (
                  <>
                    {showSweepConfirm === dungeon.id ? (
                      <div className="sweep-confirm">
                        <span>确认扫荡？</span>
                        <button className="confirm-btn" onClick={() => handleSweep(dungeon.id)} disabled={!sweepCheck.ok}>确定</button>
                        <button className="cancel-btn" onClick={() => setShowSweepConfirm(null)}>取消</button>
                      </div>
                    ) : (
                      <button
                        className="dungeon-btn sweep-btn"
                        onClick={() => setShowSweepConfirm(dungeon.id)}
                        disabled={!sweepCheck.ok}
                        title={sweepCheck.reason}
                      >
                        ⚡ 扫荡
                      </button>
                    )}
                  </>
                )}
              </div>

              {!canChallenge && (
                <div className="dungeon-locked">
                  {battleReadyCount === 0 && eligibleCount > 0
                    ? `无符合条件的学员（需Lv.${dungeon.requiredLevel}+、体力≥${dungeon.staminaCost}、士气≥15%）`
                    : `需要 Lv.${dungeon.requiredLevel}+ 学员 (${eligibleCount}/${state.students.length} 人等级达标)`}
                </div>
              )}
              {canChallenge && sweepable && !sweepCheck.ok && sweepCheck.reason && (
                <div className="dungeon-locked sweep-locked">
                  扫荡不可用: {sweepCheck.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDungeon && (
        <DungeonBattle
          dungeon={state.dungeons.find(d => d.id === selectedDungeon)!}
          students={state.students}
          courses={state.courses}
          onClose={() => setSelectedDungeon(null)}
          onComplete={(result) => {
            dispatch({
              type: 'COMPLETE_DUNGEON',
              dungeonId: selectedDungeon,
              stars: result.stars,
              survivingMembers: result.survivingMembers,
              totalMembers: result.totalMembers,
              averageHpPercent: result.averageHpPercent,
              totalTurns: result.totalTurns,
              team: result.team,
            });
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
  onComplete: (result: {
    stars: number;
    survivingMembers: number;
    totalMembers: number;
    averageHpPercent: number;
    totalTurns: number;
    team: string[];
  }) => void;
}

interface BattleResultData {
  victory: boolean;
  stars: number;
  survivingMembers: number;
  totalMembers: number;
  averageHpPercent: number;
  totalTurns: number;
  rewards: { gold: number; mana: number; food: number; reputation: number };
  isFirstClear: boolean;
  team: string[];
}

function DungeonBattle({ dungeon, students, courses, onClose, onComplete }: DungeonBattleProps) {
  const { calculateBattleStars, calculateDungeonRewards, getMoraleLabel, getStaminaLabel, calculateMoraleEfficiencyMultiplier, calculateStaminaEfficiencyMultiplier } = useGame();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [battleStarted, setBattleStarted] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<string[]>([]);
  const [battleResult, setBattleResult] = React.useState<BattleResultData | null>(null);
  
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
    turnCount: number;
    teamIds: string[];
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
    turnCount: 0,
    teamIds: [],
  });

  const onCompleteRef = React.useRef(onComplete);
  
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const eligibleStudents = React.useMemo(
    () => students.filter(s => s.level >= dungeon.requiredLevel),
    [students, dungeon.requiredLevel]
  );

  const idleEligibleStudents = React.useMemo(
    () => eligibleStudents.filter(s => s.status === 'idle'),
    [eligibleStudents]
  );

  const canStudentBattle = React.useCallback((student: StudentType): { ok: boolean; reason?: string } => {
    if (student.status !== 'idle') {
      const course = student.assignedCourse ? courses.find(c => c.id === student.assignedCourse) : null;
      if (student.status === 'studying' && course) return { ok: false, reason: `正在学习${course.name}` };
      if (student.status === 'resting') return { ok: false, reason: '正在休息' };
      if (student.status === 'training') return { ok: false, reason: '正在训练' };
      return { ok: false, reason: '状态不可用' };
    }
    if (student.stamina < dungeon.staminaCost) {
      return { ok: false, reason: `体力不足(${student.stamina}/${dungeon.staminaCost})` };
    }
    if (student.morale < 15) {
      return { ok: false, reason: `士气过低(${student.morale}%)拒绝出战` };
    }
    return { ok: true };
  }, [courses, dungeon.staminaCost]);

  const generateEnemies = React.useCallback((wave: number): Enemy[] => {
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
  }, [dungeon.waves]);

  const availableBestTeamIds = React.useMemo(
    () => dungeon.bestTeam.filter(id => {
      const s = idleEligibleStudents.find(st => st.id === id);
      return s && canStudentBattle(s).ok;
    }),
    [dungeon.bestTeam, idleEligibleStudents, canStudentBattle]
  );

  const handleFillBestTeam = React.useCallback(() => {
    if (availableBestTeamIds.length > 0) {
      setSelectedTeam(availableBestTeamIds);
    }
  }, [availableBestTeamIds]);

  const calculateBattleResult = React.useCallback((victory: boolean): BattleResultData => {
    const { playerTeam, turnCount, teamIds } = battleRef.current;
    const totalMembers = teamIds.length;
    const survivingMembers = playerTeam.filter(p => p.hp > 0).length;
    
    const totalHp = playerTeam.reduce((sum, p) => sum + p.maxHp, 0);
    const currentHp = playerTeam.reduce((sum, p) => sum + Math.max(0, p.hp), 0);
    const averageHpPercent = totalHp > 0 ? currentHp / totalHp : 0;

    const stars = victory ? calculateBattleStars(dungeon, survivingMembers, totalMembers, averageHpPercent) : 0;
    const isFirstClear = !dungeon.firstCleared;
    const rewards = calculateDungeonRewards(dungeon, stars, isFirstClear);

    return {
      victory,
      stars,
      survivingMembers,
      totalMembers,
      averageHpPercent,
      totalTurns: turnCount,
      rewards,
      isFirstClear,
      team: teamIds,
    };
  }, [dungeon, calculateBattleStars, calculateDungeonRewards]);

  const startBattle = () => {
    if (selectedTeam.length === 0) return;
    const team = eligibleStudents.filter(s => selectedTeam.includes(s.id));
    const validTeam = team.filter(s => canStudentBattle(s).ok);
    if (validTeam.length === 0) return;

    battleRef.current = {
      playerTeam: validTeam.map(s => ({ 
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
      turnCount: 0,
      teamIds: validTeam.map(s => s.id),
    };
    setBattleStarted(true);
    setBattleResult(null);
  };

  const handleBattleEnd = React.useCallback((victory: boolean) => {
    if (battleRef.current.battleEnded) return;
    const result = calculateBattleResult(victory);
    setBattleResult(result);
  }, [calculateBattleResult]);

  const handleConfirmResult = React.useCallback(() => {
    if (!battleResult) return;
    onCompleteRef.current({
      stars: battleResult.stars,
      survivingMembers: battleResult.survivingMembers,
      totalMembers: battleResult.totalMembers,
      averageHpPercent: battleResult.averageHpPercent,
      totalTurns: battleResult.totalTurns,
      team: battleResult.team,
    });
  }, [battleResult]);

  const handleBattleEndRef = React.useRef(handleBattleEnd);
  
  React.useEffect(() => {
    handleBattleEndRef.current = handleBattleEnd;
  }, [handleBattleEnd]);

  React.useEffect(() => {
    if (!battleStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    let ended = false;

    const gameLoop = (timestamp: number) => {
      if (ended || battleRef.current.battleEnded) return;

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      battleRef.current.playerActionTimer += deltaTime;
      battleRef.current.enemyActionTimer += deltaTime;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`第 ${battleRef.current.currentWave}/${battleRef.current.totalWaves} 波`, 10, 25);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`回合: ${battleRef.current.turnCount}`, 10, 45);

      const { playerTeam, enemyTeam, attackLog } = battleRef.current;

      const playerBaseDamage = 15;
      const playerAttackInterval = 1500;
      const enemyAttackInterval = 2000;

      if (battleRef.current.playerActionTimer > playerAttackInterval && enemyTeam.length > 0 && playerTeam.length > 0) {
        battleRef.current.playerActionTimer = 0;
        battleRef.current.turnCount++;
        
        const attacker = playerTeam[Math.floor(Math.random() * playerTeam.length)];
        const target = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
        
        const skillBonus = attacker.skills.length > 0 ? attacker.skills[0].damage : 0;
        const baseDamage = playerBaseDamage + attacker.level * 3 + skillBonus;
        const moraleMult = calculateMoraleEfficiencyMultiplier(attacker.morale);
        const staminaMult = calculateStaminaEfficiencyMultiplier(attacker.stamina);
        const damage = Math.floor(baseDamage * moraleMult * staminaMult);
        
        target.hp -= damage;
        attackLog.push(`${attacker.name} 对 ${target.name} 造成 ${damage} 伤害${(moraleMult * staminaMult !== 1) ? ` (×${(moraleMult * staminaMult).toFixed(2)})` : ''}`);
        
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
        ended = true;
        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('战斗失败！', canvas.width / 2 - 80, canvas.height / 2);
        handleBattleEndRef.current(false);
      } else if (enemyTeam.length === 0) {
        if (battleRef.current.currentWave < battleRef.current.totalWaves) {
          battleRef.current.currentWave++;
          battleRef.current.enemyTeam = generateEnemies(battleRef.current.currentWave);
          battleRef.current.attackLog.push(`进入第 ${battleRef.current.currentWave} 波！`);
        } else {
          battleRef.current.battleEnded = true;
          ended = true;
          ctx.fillStyle = '#4CAF50';
          ctx.font = 'bold 32px Arial';
          ctx.fillText('战斗胜利！', canvas.width / 2 - 80, canvas.height / 2);
          handleBattleEndRef.current(true);
        }
      }

      if (!ended) {
        battleRef.current.animationId = requestAnimationFrame(gameLoop);
      }
    };

    battleRef.current.animationId = requestAnimationFrame(gameLoop);

    return () => {
      ended = true;
      battleRef.current.battleEnded = true;
      if (battleRef.current.animationId) {
        cancelAnimationFrame(battleRef.current.animationId);
      }
    };
  }, [battleStarted, dungeon.waves, calculateMoraleEfficiencyMultiplier, calculateStaminaEfficiencyMultiplier, generateEnemies]);

  const renderStars = (stars: number, maxStars: number = 3) => {
    return (
      <div className="star-display large">
        {Array.from({ length: maxStars }, (_, i) => (
          <span key={i} className={`star ${i < stars ? 'filled' : 'empty'}`}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="dungeon-battle-overlay">
      <div className="dungeon-battle-modal">
        <h3>{dungeon.name}</h3>
        {!battleStarted && !battleResult ? (
          <div className="team-selection">
            <p>选择参战学员 (至少1人，推荐2-3人):</p>
            {dungeon.bestTeam.length > 0 && (
              <div className="best-team-actions">
                <div className="best-team-hint">
                  💡 已保存最佳阵容 ({availableBestTeamIds.length}/{dungeon.bestTeam.length} 人可用)
                </div>
                {availableBestTeamIds.length > 0 && (
                  <button className="fill-best-team-btn" onClick={handleFillBestTeam}>
                    📋 一键填入最佳阵容
                  </button>
                )}
              </div>
            )}
            <div className="team-select-grid">
              {eligibleStudents.map(student => {
                const course = student.assignedCourse ? courses.find(c => c.id === student.assignedCourse) : null;
                const isInBestTeam = dungeon.bestTeam.includes(student.id);
                const battleCheck = canStudentBattle(student);
                const isDisabled = !battleCheck.ok;
                const moraleInfo = getMoraleLabel(student.morale);
                const staminaInfo = getStaminaLabel(student.stamina);
                return (
                  <label key={student.id} className={`team-member-option ${isDisabled ? 'disabled' : ''} ${isInBestTeam ? 'best-team' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedTeam.includes(student.id)}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeam([...selectedTeam, student.id]);
                        } else {
                          setSelectedTeam(selectedTeam.filter(id => id !== student.id));
                        }
                      }}
                    />
                    <div className="team-member-info">
                      <div className="team-member-name">
                        {student.name} (Lv.{student.level})
                        {student.skills.length > 0 && ` [${student.skills.length}技能]`}
                        {isInBestTeam && ' ⭐'}
                      </div>
                      <div className="team-member-stats">
                        <span style={{ color: moraleInfo.color }}>😊{student.morale}%</span>
                        <span style={{ color: staminaInfo.color }}>⚡{student.stamina}%</span>
                        <span>需体力:{dungeon.staminaCost}</span>
                      </div>
                      {isDisabled && battleCheck.reason && (
                        <div className="team-member-disabled-reason">
                          ❌ {battleCheck.reason}
                        </div>
                      )}
                      {!isDisabled && course && (
                        <div className="team-member-status">
                          📖 正在{course.name}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="battle-hint">
              <p>💡 提示: 士气和体力会影响战斗伤害(±80%~+32%)，注意让学员休息恢复</p>
            </div>
            <div className="battle-actions">
              <button onClick={startBattle} disabled={selectedTeam.length === 0}>开始战斗</button>
              <button onClick={onClose}>取消</button>
            </div>
          </div>
        ) : battleResult ? (
          <div className="battle-result-modal">
            <h4 className={battleResult.victory ? 'victory' : 'defeat'}>
              {battleResult.victory ? '🎉 战斗胜利！' : '💔 战斗失败'}
            </h4>
            
            {battleResult.victory && (
              <>
                <div className="result-stars">
                  {renderStars(battleResult.stars)}
                </div>
                
                {battleResult.isFirstClear && (
                  <div className="first-clear-announce">
                    🏆 首次通关！获得额外奖励！
                  </div>
                )}
                
                <div className="result-stats">
                  <div className="stat-row">
                    <span>存活队员:</span>
                    <span>{battleResult.survivingMembers}/{battleResult.totalMembers}</span>
                  </div>
                  <div className="stat-row">
                    <span>平均剩余HP:</span>
                    <span>{Math.round(battleResult.averageHpPercent * 100)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>总回合数:</span>
                    <span>{battleResult.totalTurns}</span>
                  </div>
                </div>
                
                <div className="result-rewards">
                  <h5>获得奖励:</h5>
                  <div className="reward-list">
                    <span>💰 {battleResult.rewards.gold}</span>
                    <span>🔮 {battleResult.rewards.mana}</span>
                    <span>🍖 {battleResult.rewards.food}</span>
                    <span>⭐ {battleResult.rewards.reputation}</span>
                  </div>
                </div>

                {battleResult.stars >= 3 && (
                  <div className="sweep-unlock-hint">
                    🔓 达成3星！扫荡功能已自动解锁
                  </div>
                )}
              </>
            )}
            
            {!battleResult.victory && (
              <div className="defeat-hint">
                <p>学员们需要更多训练！</p>
                <p>建议: 提升等级、学习更多技能、搭配更强阵容</p>
              </div>
            )}
            
            <button className="confirm-result-btn" onClick={handleConfirmResult}>
              {battleResult.victory ? '确认领取奖励' : '返回'}
            </button>
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
  const { state, dispatch, getActiveSynergies, calculateSynergyBonus, calculateDailyIncome, calculateFoodConsumption, getMoraleLabel } = useGame();
  const [daysToAdvance, setDaysToAdvance] = React.useState(1);

  const libraryLevel = state.buildings.find(b => b.id === 'library')?.level || 0;
  const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
  const manaTowerLevel = state.buildings.find(b => b.id === 'mana_tower')?.level || 0;
  const dormitoryLevel = state.buildings.find(b => b.id === 'dormitory')?.level || 0;

  const efficiencyBonus = calculateSynergyBonus(state.buildings, 'efficiency');
  const reputationBonus = calculateSynergyBonus(state.buildings, 'reputation');
  const capacityBonus = calculateSynergyBonus(state.buildings, 'capacity');
  const activeSynergies = getActiveSynergies(state.buildings);

  const dailyIncome = calculateDailyIncome(state.buildings);
  const foodConsumption = calculateFoodConsumption(state.students.length);
  const studyingCount = state.students.filter(s => s.status === 'studying').length;
  const restingCount = state.students.filter(s => s.status === 'resting').length;
  const avgMorale = state.students.length > 0
    ? Math.round(state.students.reduce((sum, s) => sum + s.morale, 0) / state.students.length)
    : 0;
  const avgStamina = state.students.length > 0
    ? Math.round(state.students.reduce((sum, s) => sum + s.stamina, 0) / state.students.length)
    : 0;
  const lowMoraleCount = state.students.filter(s => s.morale < 30).length;
  const recentLogs = state.dailyLogs.slice(-5).reverse();

  const moraleInfo = avgMorale > 0 ? getMoraleLabel(avgMorale) : { label: '-', color: '#999' };
  const netFood = dailyIncome.food - foodConsumption;
  const foodDaysLeft = foodConsumption > 0 ? Math.floor(state.resources.food / foodConsumption) : Infinity;

  const getEventIcon = (type: DailyEvent['type']) => {
    switch (type) {
      case 'income': return '💰';
      case 'food_consumed': return '🍖';
      case 'food_shortage': return '⚠️';
      case 'morale_change': return '😊';
      case 'student_left': return '😢';
      case 'rest': return '😴';
      case 'study': return '📚';
      case 'course_complete': return '🎓';
      case 'warning': return '⚡';
      default: return '📌';
    }
  };

  return (
    <div className="module settlement-module">
      <h2>💰 资源结算</h2>

      {state.students.length > 0 && (
        <div className="student-status-overview">
          <h3>📊 学员状态概览</h3>
          <div className="status-overview-grid">
            <div className="overview-item">
              <span>👥 总学员</span>
              <span>{state.students.length}</span>
            </div>
            <div className="overview-item">
              <span>📚 学习中</span>
              <span className="studying">{studyingCount}</span>
            </div>
            <div className="overview-item">
              <span>😴 休息中</span>
              <span className="resting">{restingCount}</span>
            </div>
            <div className="overview-item">
              <span>😊 平均士气</span>
              <span style={{ color: moraleInfo.color }}>{avgMorale}% ({moraleInfo.label})</span>
            </div>
            <div className="overview-item">
              <span>⚡ 平均体力</span>
              <span>{avgStamina}%</span>
            </div>
            <div className="overview-item">
              <span>😟 低士气</span>
              <span className={lowMoraleCount > 0 ? 'warning-text' : ''}>{lowMoraleCount}人</span>
            </div>
          </div>
          <div className="efficiency-info">
            <p>📖 士气效率: 高士气+20% ~ 低士气-80%</p>
            <p>⚡ 体力效率: 充沛+10% ~ 精疲力竭-60%</p>
            <p>😴 休息恢复: 士气+15+2×宿舍等级/天，体力+30+3×餐厅等级/天</p>
          </div>
        </div>
      )}

      {activeSynergies.length > 0 && (
        <div className="synergy-overview">
          <h3>✨ 联动效果加成</h3>
          <div className="synergy-overview-grid">
            <div className="synergy-overview-item">
              <span>👥 容量加成</span>
              <span className="positive">+{capacityBonus}</span>
            </div>
            <div className="synergy-overview-item">
              <span>📚 效率加成</span>
              <span className="positive">+{efficiencyBonus}%</span>
            </div>
            <div className="synergy-overview-item">
              <span>⭐ 声望加成</span>
              <span className="positive">+{reputationBonus}/天</span>
            </div>
          </div>
        </div>
      )}

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
            <span className={netFood >= 0 ? 'positive' : 'negative'}>
              +{dailyIncome.food} -{foodConsumption} = {netFood >= 0 ? '+' : ''}{netFood}
            </span>
          </div>
          <div className="production-item">
            <span>⭐ 声望</span>
            <span className="positive">+{dailyIncome.reputation}</span>
          </div>
        </div>

        {state.students.length > 0 && (
          <div className="food-warning">
            {netFood < 0 && (
              <p className="danger">⚠️ 食物入不敷出！每天短缺 {Math.abs(netFood)} 份，请尽快补充或减少学员</p>
            )}
            {foodDaysLeft < 5 && foodDaysLeft !== Infinity && foodDaysLeft >= 0 && (
              <p className="warning-text">⚠️ 按当前消耗速度，食物仅够 {foodDaysLeft} 天！</p>
            )}
            {netFood >= 0 && foodConsumption > 0 && (
              <p className="safe">✅ 食物供应充足，按当前速度可持续供应</p>
            )}
          </div>
        )}
        
        <div className="production-bonus">
          <p>📚 图书馆 Lv.{libraryLevel}: 课程经验 +{libraryLevel * 10}%</p>
          <p>🏠 宿舍 Lv.{dormitoryLevel}: 容量 +{dormitoryLevel * 4}，休息士气恢复 +{dormitoryLevel * 2}</p>
          <p>🍽️ 餐厅 Lv.{diningHallLevel}: 产出 +{diningHallLevel * 5}金币, +{diningHallLevel * 3}食物，体力恢复 +{diningHallLevel * 3}</p>
          <p>🔮 魔力塔 Lv.{manaTowerLevel}: 魔力 +{manaTowerLevel * 10}</p>
          {efficiencyBonus > 0 && (
            <p className="synergy-text">✨ 联动效率: 课程经验额外 +{efficiencyBonus}%</p>
          )}
          {reputationBonus > 0 && (
            <p className="synergy-text">✨ 联动声望: 每日额外 +{reputationBonus} 声望</p>
          )}
          {capacityBonus > 0 && (
            <p className="synergy-text">✨ 联动容量: 学员上限额外 +{capacityBonus}</p>
          )}
        </div>
        
        {studyingCount > 0 && (
          <div className="studying-status">
            <p>📖 {studyingCount} 名学员正在上课，推进时间可获得经验</p>
          </div>
        )}
        {restingCount > 0 && (
          <div className="resting-status">
            <p>😴 {restingCount} 名学员正在休息恢复状态</p>
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
                dispatch({ type: 'NEXT_DAY' });
              }
            }}
          >
            推进 {daysToAdvance} 天
          </button>
        </div>
        <p className="tip">
          💡 推进时间会自动结算资源产出、食物消耗、士气/体力变化、课程进度等
        </p>
        <p className="tip">
          ⚠️ 食物不足会导致士气大幅下降，长期低士气学员可能离开！
        </p>
      </div>

      {recentLogs.length > 0 && (
        <div className="daily-logs-section">
          <h3>📜 最近结算日志</h3>
          <div className="daily-logs">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="daily-log-item">
                <div className="log-day">第 {log.day} 天</div>
                <div className="log-events">
                  {log.events.map((event, eIdx) => (
                    <div key={eIdx} className={`log-event event-${event.type}`}>
                      <span className="event-icon">{getEventIcon(event.type)}</span>
                      <span className="event-message">{event.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <span>{state.dungeons.filter(d => d.firstCleared).length}/{state.dungeons.length}</span>
          </div>
          <div className="stat-item">
            <span>⭐ 累计星级</span>
            <span>{state.dungeons.reduce((acc, d) => acc + d.bestStars, 0)}/{state.dungeons.length * 3}</span>
          </div>
          <div className="stat-item">
            <span>🎯 总挑战次数</span>
            <span>{state.dungeons.reduce((acc, d) => acc + d.clearedCount, 0)}</span>
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