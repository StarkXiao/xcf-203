import { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import type { RestActivity, DormitoryEventInstance } from '../types/game';
import './DormitoryPanel.css';

export default function DormitoryPanel() {
  const {
    state,
    assignDormitoryActivity,
    resolveDormitoryEvent,
    refreshDormitoryRooms,
    updateDormitoryBonuses,
    calculateDormitoryComfort,
    calculateRoomCapacity,
    calculateRestActivityResult,
    getRelationshipLevel,
    getRelationshipInfo,
    RELATIONSHIP_LEVELS,
    REST_ACTIVITIES,
    DORMITORY_EVENTS,
    getRestActivityIcon,
    getRestActivityName,
    getMoraleLabel,
    getStaminaLabel,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'rest' | 'relationships' | 'events'>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

  const dormitoryLevel = state.buildings.find(b => b.id === 'dormitory')?.level || 0;
  const diningHallLevel = state.buildings.find(b => b.id === 'dining_hall')?.level || 0;
  const { dormitory } = state;
  const { dailyBonus } = dormitory;
  const comfort = calculateDormitoryComfort(dormitoryLevel, diningHallLevel);
  const roomCapacity = calculateRoomCapacity(dormitoryLevel);

  useEffect(() => {
    if (state.students.length > 0 && dormitory.rooms.length === 0) {
      refreshDormitoryRooms();
    }
    updateDormitoryBonuses();
  }, [state.students.length, dormitory.rooms.length]);

  const unresolvedEvents = dormitory.recentEvents.filter(e => !e.resolved);
  useEffect(() => {
    if (unresolvedEvents.length > 0 && !pendingEventId) {
      setPendingEventId(unresolvedEvents[0].id);
    }
  }, [unresolvedEvents.length]);

  const getStudentName = (id: string) => state.students.find(s => s.id === id)?.name || '未知学员';

  const getRelationshipBetween = (id1: string, id2: string) => {
    return dormitory.relationships.find(
      r => (r.studentId1 === id1 && r.studentId2 === id2) || (r.studentId1 === id2 && r.studentId2 === id1)
    );
  };

  const getStudentRoom = (studentId: string) => {
    return dormitory.rooms.find(r => r.residentIds.includes(studentId));
  };

  const getStudentSchedule = (studentId: string) => {
    return dormitory.schedules.find(s => s.studentId === studentId && s.day === state.day);
  };

  const restingOrIdleStudents = state.students.filter(s => s.status === 'resting' || s.status === 'idle');

  const handleAssignActivity = (studentId: string, activity: RestActivity) => {
    assignDormitoryActivity(studentId, activity, state.day);
  };

  const handleResolveEvent = (eventId: string, choiceId?: string) => {
    resolveDormitoryEvent(eventId, choiceId);
    setPendingEventId(null);
  };

  const pendingEvent = dormitory.recentEvents.find(e => e.id === pendingEventId && !e.resolved);
  const pendingEventDef = pendingEvent ? DORMITORY_EVENTS.find(e => e.id === pendingEvent.eventId) : null;

  const friendCount = dormitory.relationships.filter(r =>
    r.level === 'friend' || r.level === 'close_friend' || r.level === 'bonded'
  ).length;

  const tabs = [
    { id: 'overview' as const, label: '总览', icon: '🏠' },
    { id: 'rooms' as const, label: '房间', icon: '🛏️' },
    { id: 'rest' as const, label: '休息安排', icon: '😴' },
    { id: 'relationships' as const, label: '关系', icon: '💝' },
    { id: 'events' as const, label: '事件', icon: '🎪' },
  ];

  return (
    <div className="dormitory-module">
      {pendingEvent && pendingEventDef && (
        <div className="dormitory-event-overlay">
          <div className="dormitory-event-modal">
            <div className="dormitory-event-header">
              <span className="dormitory-event-icon">{pendingEventDef.icon}</span>
              <h3>{pendingEventDef.name}</h3>
            </div>
            <p className="dormitory-event-desc">{pendingEventDef.description}</p>
            <div className="dormitory-event-participants">
              <span>参与者:</span>
              {pendingEvent.participantIds.map(id => (
                <span key={id} className="participant-tag">{getStudentName(id)}</span>
              ))}
            </div>
            <div className="dormitory-event-effects">
              {pendingEventDef.effects.moraleChange && (
                <span className={pendingEventDef.effects.moraleChange > 0 ? 'effect-positive' : 'effect-negative'}>
                  心情{pendingEventDef.effects.moraleChange > 0 ? '+' : ''}{pendingEventDef.effects.moraleChange}
                </span>
              )}
              {pendingEventDef.effects.staminaChange && (
                <span className={pendingEventDef.effects.staminaChange > 0 ? 'effect-positive' : 'effect-negative'}>
                  体力{pendingEventDef.effects.staminaChange > 0 ? '+' : ''}{pendingEventDef.effects.staminaChange}
                </span>
              )}
              {pendingEventDef.effects.relationshipExpChange && (
                <span className={pendingEventDef.effects.relationshipExpChange > 0 ? 'effect-positive' : 'effect-negative'}>
                  关系{pendingEventDef.effects.relationshipExpChange > 0 ? '+' : ''}{pendingEventDef.effects.relationshipExpChange}
                </span>
              )}
              {pendingEventDef.effects.reputationChange && (
                <span className="effect-positive">
                  声望+{pendingEventDef.effects.reputationChange}
                </span>
              )}
            </div>
            {pendingEventDef.choices ? (
              <div className="dormitory-event-choices">
                {pendingEventDef.choices.map(choice => (
                  <button
                    key={choice.id}
                    className="dormitory-choice-btn"
                    onClick={() => handleResolveEvent(pendingEvent!.id, choice.id)}
                  >
                    <span className="choice-text">{choice.text}</span>
                    <span className="choice-desc">{choice.description}</span>
                    {choice.riskProbability && (
                      <span className="choice-risk">⚠️ 风险率{Math.round(choice.riskProbability * 100)}%</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <button className="dormitory-resolve-btn" onClick={() => handleResolveEvent(pendingEvent!.id)}>
                确认
              </button>
            )}
          </div>
        </div>
      )}

      <div className="dormitory-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`dormitory-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'events' && unresolvedEvents.length > 0 && (
              <span className="tab-badge">{unresolvedEvents.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="dormitory-overview">
          <div className="dormitory-stats-grid">
            <div className="dormitory-stat-card comfort">
              <span className="stat-icon">🏠</span>
              <span className="stat-value">{comfort}</span>
              <span className="stat-label">宿舍舒适度</span>
            </div>
            <div className="dormitory-stat-card morale">
              <span className="stat-icon">😊</span>
              <span className="stat-value">{dormitory.avgMorale}</span>
              <span className="stat-label">平均心情</span>
            </div>
            <div className="dormitory-stat-card stamina">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">{dormitory.avgStamina}</span>
              <span className="stat-label">平均体力</span>
            </div>
            <div className="dormitory-stat-card rooms">
              <span className="stat-icon">🛏️</span>
              <span className="stat-value">{dormitory.rooms.length}</span>
              <span className="stat-label">房间数</span>
            </div>
          </div>

          <div className="dormitory-bonus-panel">
            <h3>📊 宿舍加成</h3>
            <div className="bonus-grid">
              <div className={`bonus-item ${dailyBonus.courseEfficiency > 0 ? 'active' : ''}`}>
                <span className="bonus-icon">📚</span>
                <span className="bonus-label">课程效率</span>
                <span className="bonus-value">+{dailyBonus.courseEfficiency}%</span>
              </div>
              <div className={`bonus-item ${dailyBonus.battleBonus > 0 ? 'active' : ''}`}>
                <span className="bonus-icon">⚔️</span>
                <span className="bonus-label">战斗加成</span>
                <span className="bonus-value">+{dailyBonus.battleBonus}%</span>
              </div>
              <div className={`bonus-item ${dailyBonus.reputationBonus > 0 ? 'active' : ''}`}>
                <span className="bonus-icon">⭐</span>
                <span className="bonus-label">声望加成</span>
                <span className="bonus-value">+{dailyBonus.reputationBonus}</span>
              </div>
              <div className={`bonus-item ${dailyBonus.staminaRegenBonus > 0 ? 'active' : ''}`}>
                <span className="bonus-icon">💤</span>
                <span className="bonus-label">体力恢复</span>
                <span className="bonus-value">+{dailyBonus.staminaRegenBonus}%</span>
              </div>
              <div className={`bonus-item ${dailyBonus.moraleRegenBonus > 0 ? 'active' : ''}`}>
                <span className="bonus-icon">💚</span>
                <span className="bonus-label">心情恢复</span>
                <span className="bonus-value">+{dailyBonus.moraleRegenBonus}%</span>
              </div>
            </div>
          </div>

          <div className="dormitory-summary">
            <h3>📋 宿舍概况</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span>宿舍等级: Lv.{dormitoryLevel}</span>
                <span>房间容量: {roomCapacity}人/间</span>
              </div>
              <div className="summary-item">
                <span>好友关系: {friendCount}对</span>
                <span>最佳关系: {RELATIONSHIP_LEVELS.find(l => l.level === dormitory.bestRelationshipLevel)?.name || '陌生'}</span>
              </div>
              <div className="summary-item">
                <span>累计事件: {dormitory.totalEventsTriggered}次</span>
                <span>社交互动: {dormitory.totalSocialInteractions}次</span>
              </div>
            </div>
          </div>

          <div className="dormitory-influence">
            <h3>🔗 影响系统</h3>
            <div className="influence-cards">
              <div className="influence-card course">
                <div className="influence-header">📚 课程效率</div>
                <p>宿舍舒适度与心情越高，学员学习效率越强。心情≥80时额外+5%效率。</p>
              </div>
              <div className="influence-card battle">
                <div className="influence-header">⚔️ 战斗表现</div>
                <p>羁绊/挚友/朋友组队时获得额外伤害与生命加成，最高+25%。</p>
              </div>
              <div className="influence-card recruit">
                <div className="influence-header">📜 招募口碑</div>
                <p>学员心情高、社交活跃时，学院口碑提升，招募品质概率提高。</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="dormitory-rooms">
          <div className="rooms-header">
            <h3>🛏️ 房间分配</h3>
            <span className="rooms-info">共 {dormitory.rooms.length} 间 | 每间{roomCapacity}人 | 舒适度 {comfort}</span>
          </div>
          {dormitory.rooms.length === 0 ? (
            <div className="rooms-empty">
              <p>暂无房间，请先招募学员</p>
              <button className="refresh-btn" onClick={refreshDormitoryRooms}>刷新房间</button>
            </div>
          ) : (
            <div className="rooms-grid">
              {dormitory.rooms.map(room => (
                <div key={room.id} className="room-card">
                  <div className="room-header">
                    <span className="room-id">🏠 {room.id.replace('room_', '房间')}</span>
                    <span className="room-occupancy">{room.residentIds.length}/{room.capacity}</span>
                  </div>
                  <div className="room-comfort-bar">
                    <div className="comfort-fill" style={{ width: `${room.comfort}%` }} />
                    <span className="comfort-text">舒适度 {room.comfort}</span>
                  </div>
                  <div className="room-residents">
                    {room.residentIds.map(id => {
                      const student = state.students.find(s => s.id === id);
                      if (!student) return null;
                      const moraleInfo = getMoraleLabel(student.morale);
                      const staminaInfo = getStaminaLabel(student.stamina);
                      return (
                        <div key={id} className="resident-card">
                          <div className="resident-header">
                            <span className="resident-name">{student.name}</span>
                            <span className="resident-quality" data-quality={student.quality}>
                              {student.quality}
                            </span>
                          </div>
                          <div className="resident-bars">
                            <div className="mini-bar morale-bar">
                              <div className="mini-bar-fill" style={{ width: `${student.morale}%`, background: moraleInfo.color }} />
                              <span className="mini-bar-text">😊{student.morale}</span>
                            </div>
                            <div className="mini-bar stamina-bar">
                              <div className="mini-bar-fill" style={{ width: `${student.stamina}%`, background: staminaInfo.color }} />
                              <span className="mini-bar-text">⚡{student.stamina}</span>
                            </div>
                          </div>
                          <div className="resident-status">
                            {student.status === 'studying' && '📚 学习中'}
                            {student.status === 'resting' && '😴 休息中'}
                            {student.status === 'idle' && '🔄 空闲'}
                            {student.status === 'training' && '⚔️ 训练中'}
                          </div>
                        </div>
                      );
                    })}
                    {room.residentIds.length < room.capacity && (
                      <div className="room-slot-empty">
                        <span>+ 空位</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rest' && (
        <div className="dormitory-rest">
          <h3>😴 休息安排</h3>
          <p className="rest-hint">为空闲/休息中的学员安排今日休息活动，影响体力、心情与关系成长</p>
          <div className="activities-reference">
            {REST_ACTIVITIES.map(a => (
              <div key={a.id} className="activity-ref-card">
                <span className="activity-ref-icon">{a.icon}</span>
                <span className="activity-ref-name">{a.name}</span>
                <span className="activity-ref-desc">{a.description}</span>
                <div className="activity-ref-effects">
                  {a.staminaEffect !== 0 && <span className={a.staminaEffect > 0 ? 'effect-positive' : 'effect-negative'}>体力{a.staminaEffect > 0 ? '+' : ''}{a.staminaEffect}</span>}
                  {a.moraleEffect !== 0 && <span className={a.moraleEffect > 0 ? 'effect-positive' : 'effect-negative'}>心情{a.moraleEffect > 0 ? '+' : ''}{a.moraleEffect}</span>}
                  {a.hpEffect !== 0 && <span className="effect-positive">HP+{a.hpEffect}</span>}
                </div>
              </div>
            ))}
          </div>
          {restingOrIdleStudents.length === 0 ? (
            <p className="empty-text">暂无空闲/休息中的学员</p>
          ) : (
            <div className="rest-students-list">
              {restingOrIdleStudents.map(student => {
                const currentSchedule = getStudentSchedule(student.id);
                const room = getStudentRoom(student.id);
                const moraleInfo = getMoraleLabel(student.morale);
                const staminaInfo = getStaminaLabel(student.stamina);
                return (
                  <div key={student.id} className="rest-student-card">
                    <div className="rest-student-info">
                      <span className="rest-student-name">{student.name}</span>
                      <span className="rest-student-quality" data-quality={student.quality}>{student.quality}</span>
                      <span className="rest-student-room">{room ? room.id.replace('room_', '房间') : '未分配'}</span>
                    </div>
                    <div className="rest-student-bars">
                      <div className="mini-bar morale-bar">
                        <div className="mini-bar-fill" style={{ width: `${student.morale}%`, background: moraleInfo.color }} />
                        <span className="mini-bar-text">😊{student.morale}</span>
                      </div>
                      <div className="mini-bar stamina-bar">
                        <div className="mini-bar-fill" style={{ width: `${student.stamina}%`, background: staminaInfo.color }} />
                        <span className="mini-bar-text">⚡{student.stamina}</span>
                      </div>
                    </div>
                    <div className="rest-activity-select">
                      {REST_ACTIVITIES.map(a => {
                        const result = calculateRestActivityResult(a.id, dormitoryLevel, diningHallLevel, room?.comfort || comfort);
                        const isActive = currentSchedule?.activity === a.id;
                        return (
                          <button
                            key={a.id}
                            className={`activity-btn ${isActive ? 'active' : ''}`}
                            onClick={() => handleAssignActivity(student.id, a.id)}
                            title={`体力${result.staminaChange >= 0 ? '+' : ''}${result.staminaChange} 心情${result.moraleChange >= 0 ? '+' : ''}${result.moraleChange} HP+${result.hpChange}`}
                          >
                            <span className="activity-btn-icon">{a.icon}</span>
                            <span className="activity-btn-name">{a.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'relationships' && (
        <div className="dormitory-relationships">
          <h3>💝 学员关系</h3>
          {dormitory.relationships.length === 0 ? (
            <p className="empty-text">暂无关系数据，需招募2名以上学员</p>
          ) : (
            <div className="relationships-grid">
              {dormitory.relationships
                .sort((a, b) => {
                  const levelOrder = RELATIONSHIP_LEVELS.find(l => l.level === a.level);
                  const levelOrderB = RELATIONSHIP_LEVELS.find(l => l.level === b.level);
                  return (RELATIONSHIP_LEVELS.indexOf(levelOrderB!)) - (RELATIONSHIP_LEVELS.indexOf(levelOrder!));
                })
                .slice(0, 30)
                .map(rel => {
                  const info = RELATIONSHIP_LEVELS.find(l => l.level === rel.level)!;
                  const nextInfo = RELATIONSHIP_LEVELS[RELATIONSHIP_LEVELS.indexOf(info) + 1];
                  const progress = nextInfo ? Math.min(100, Math.round((rel.exp / nextInfo.minExp) * 100)) : 100;
                  return (
                    <div key={`${rel.studentId1}_${rel.studentId2}`} className="relationship-card">
                      <div className="relationship-pair">
                        <span className="rel-student">{getStudentName(rel.studentId1)}</span>
                        <span className="rel-bond" style={{ color: info.color }}>♥</span>
                        <span className="rel-student">{getStudentName(rel.studentId2)}</span>
                      </div>
                      <div className="relationship-level" style={{ color: info.color }}>
                        {info.name}
                      </div>
                      <div className="relationship-progress">
                        <div className="rel-bar">
                          <div className="rel-bar-fill" style={{ width: `${progress}%`, background: info.color }} />
                        </div>
                        <span className="rel-exp">{rel.exp}{nextInfo ? `/${nextInfo.minExp}` : ' MAX'}</span>
                      </div>
                      {rel.dailyInteracted && <span className="rel-interacted">💬 今日互动</span>}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="dormitory-events">
          <h3>🎪 宿舍事件</h3>
          {dormitory.recentEvents.length === 0 ? (
            <p className="empty-text">暂无宿舍事件，随时间推移会随机触发</p>
          ) : (
            <div className="events-list">
              {[...dormitory.recentEvents].reverse().map(event => {
                const eventDef = DORMITORY_EVENTS.find(e => e.id === event.eventId);
                if (!eventDef) return null;
                return (
                  <div key={event.id} className={`event-card ${event.resolved ? 'resolved' : 'pending'} ${eventDef.category}`}>
                    <div className="event-header">
                      <span className="event-icon">{eventDef.icon}</span>
                      <span className="event-name">{eventDef.name}</span>
                      <span className="event-day">第{event.day}天</span>
                      {event.resolved ? (
                        <span className="event-status resolved">已解决</span>
                      ) : (
                        <button className="event-status pending" onClick={() => setPendingEventId(event.id)}>
                          待处理
                        </button>
                      )}
                    </div>
                    <p className="event-desc">{eventDef.description}</p>
                    <div className="event-participants-small">
                      {event.participantIds.map(id => (
                        <span key={id} className="participant-tag-small">{getStudentName(id)}</span>
                      ))}
                    </div>
                    {event.resolved && (
                      <div className="event-result">
                        {event.wasRiskTriggered && <span className="risk-triggered">⚠️ 风险触发</span>}
                        {(event.effects.moraleChange || 0) !== 0 && (
                          <span className={event.effects.moraleChange! > 0 ? 'effect-positive' : 'effect-negative'}>
                            心情{event.effects.moraleChange! > 0 ? '+' : ''}{event.effects.moraleChange}
                          </span>
                        )}
                        {(event.effects.staminaChange || 0) !== 0 && (
                          <span className={event.effects.staminaChange! > 0 ? 'effect-positive' : 'effect-negative'}>
                            体力{event.effects.staminaChange! > 0 ? '+' : ''}{event.effects.staminaChange}
                          </span>
                        )}
                        {(event.effects.relationshipExpChange || 0) !== 0 && (
                          <span className={event.effects.relationshipExpChange! > 0 ? 'effect-positive' : 'effect-negative'}>
                            关系{event.effects.relationshipExpChange! > 0 ? '+' : ''}{event.effects.relationshipExpChange}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
