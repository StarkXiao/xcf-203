import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { TabType, Dungeon as DungeonType, Student as StudentType, Course as CourseType, DailyEvent, GachaResult, StudentQuality } from '../types/game';
import { getStudentStatsSummary, calculateExpGain, calculateSynergyBonus, isStudentBattleReady, calculateHpEfficiencyMultiplier, HP_BATTLE_THRESHOLD, calculateHealCost, getMaxHealableHp } from '../data/gameData';
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
  { id: 'records', label: '经营记录', icon: '📊' },
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

interface ConfirmDialogState {
  show: boolean;
  title: string;
  description: string;
  warning?: string;
  cost?: Partial<{ gold: number; mana: number; food: number; reputation: number }>;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MainLayout() {
  const { state, activeTab, setActiveTab } = useGame();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmDialogState>({
    show: false,
    title: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

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

  const selectedStudent = state.students.find(s => s.id === selectedStudentId) || null;

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
          {state.autoSaveConfig.enabled && (
            <span className="auto-save-indicator" title="自动保存已开启">
              💾
            </span>
          )}
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
        {activeTab === 'recruit' && <RecruitModule onStudentClick={setSelectedStudentId} setConfirmDialog={setConfirmDialog} />}
        {activeTab === 'course' && <CourseModule onStudentClick={setSelectedStudentId} />}
        {activeTab === 'dungeon' && <DungeonModule onStudentClick={setSelectedStudentId} setConfirmDialog={setConfirmDialog} />}
        {activeTab === 'settlement' && <SettlementModule setConfirmDialog={setConfirmDialog} />}
        {activeTab === 'records' && <RecordsModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {confirmDialog.show && (
        <ConfirmDialog
          {...confirmDialog}
          onClose={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}

function AcademyModule() {
  const { state, dispatch, canAfford, checkPrerequisites, getActiveSynergies, calculateSynergyBonus } = useGame();
  const activeSynergies = getActiveSynergies(state.buildings);

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

  const capacity = getCapacity();
  const idleStudents = state.students.filter(s => s.status === 'idle').length;
  const studyingStudents = state.students.filter(s => s.status === 'studying').length;
  const challengeableDungeons = state.dungeons.filter(dungeon => {
    const battleReadyCount = state.students.filter(s => 
      s.level >= dungeon.requiredLevel && 
      s.status === 'idle' && 
      s.stamina >= dungeon.staminaCost &&
      s.morale >= 15
    ).length;
    return battleReadyCount > 0;
  }).length;

  const overviewItems = [
    { 
      icon: '👥', 
      label: '学员容量', 
      value: `${state.students.length}/${capacity}`, 
      color: 'var(--primary)',
      sub: `剩余 ${capacity - state.students.length} 名额`
    },
    { 
      icon: '🟢', 
      label: '空闲学员', 
      value: `${idleStudents}`, 
      color: 'var(--success)',
      sub: idleStudents > 0 ? '可安排课程或挑战副本' : '无空闲学员'
    },
    { 
      icon: '📚', 
      label: '进行中课程', 
      value: `${studyingStudents}`, 
      color: '#3b82f6',
      sub: studyingStudents > 0 ? '推进时间可完成课程' : '无课程进行中'
    },
    { 
      icon: '⚔️', 
      label: '可挑战副本', 
      value: `${challengeableDungeons}`, 
      color: 'var(--danger)',
      sub: `共 ${state.dungeons.length} 个副本`
    },
  ];

  return (
    <div className="module academy-module">
      <h2>🏰 学院建设</h2>
      
      <div className="overview-card">
        <h3 className="overview-title">📊 经营总览</h3>
        <div className="overview-grid">
          {overviewItems.map((item, idx) => (
            <div key={idx} className="overview-item" style={{ borderTopColor: item.color }}>
              <div className="overview-item-header">
                <span className="overview-icon">{item.icon}</span>
                <span className="overview-label">{item.label}</span>
              </div>
              <div className="overview-value" style={{ color: item.color }}>{item.value}</div>
              <div className="overview-sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
      
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
                {building.effect.type === 'student_capacity' && `效果: 学员容量 +${building.effect.value * building.level}`}
                {building.effect.type === 'mana_capacity' && `效果: 魔力上限 +${building.effect.value * building.level}`}
                {building.effect.type === 'reputation_gain' && `效果: 声望获取 +${building.effect.value * building.level}`}
                {building.effect.type === 'course_speed' && `效果: 课程速度 +${building.effect.value * building.level}%`}
                {building.effect.type === 'recruit_quality' && `效果: 招募品质加成 +${(building.effect.value * building.level * 0.5).toFixed(1)}`}
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

type SetConfirmDialog = React.Dispatch<React.SetStateAction<ConfirmDialogState>>;

interface ModuleProps {
  onStudentClick?: (studentId: string) => void;
  setConfirmDialog?: SetConfirmDialog;
}

function RecruitModule({ onStudentClick, setConfirmDialog }: ModuleProps) {
  const { state, dispatch, canAfford, recruitStudent, assignStudentToRest, getMoraleLabel, getStaminaLabel, getPityThreshold, computeAdjustedProbabilities, getRecruitQualityBonus, getGuaranteedQuality, shouldConfirmAction, autoSaveIfEnabled } = useGame();
  const [showProbability, setShowProbability] = useState<StudentQuality | null>(null);
  const [gachaAnimation, setGachaAnimation] = useState<{ showing: boolean; result: GachaResult | null; phase: 'rolling' | 'reveal' }>({ showing: false, result: null, phase: 'rolling' });
  const [showHistory, setShowHistory] = useState(false);

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

  const doRecruit = (ticketQuality: StudentQuality) => {
    const ticket = tickets.find(t => t.quality === ticketQuality);
    if (!ticket || !canAfford(ticket.cost) || isFull) return;

    dispatch({ type: 'SPEND_RESOURCE', resource: ticket.cost });
    const result = recruitStudent(ticketQuality);
    
    if (result) {
      if (state.autoSaveConfig.saveOnCriticalAction) {
        autoSaveIfEnabled();
      }
      setGachaAnimation({ showing: true, result, phase: 'rolling' });
      setTimeout(() => {
        setGachaAnimation(prev => ({ ...prev, phase: 'reveal' }));
      }, 1500);
    }
  };

  const handleRecruit = (ticketQuality: StudentQuality) => {
    const ticket = tickets.find(t => t.quality === ticketQuality);
    if (!ticket || !canAfford(ticket.cost) || isFull) return;

    if (shouldConfirmAction() && setConfirmDialog) {
      setConfirmDialog({
        show: true,
        title: `确认${ticket.name}？`,
        description: `将消耗以下资源进行招募：`,
        cost: ticket.cost,
        warning: ticketQuality === 'epic' || ticketQuality === 'legendary' ? '高消耗操作，请确认资源充足' : undefined,
        onConfirm: () => {
          doRecruit(ticketQuality);
          setConfirmDialog(prev => ({ ...prev, show: false }));
        },
        onCancel: () => setConfirmDialog(prev => ({ ...prev, show: false })),
      });
    } else {
      doRecruit(ticketQuality);
    }
  };

  const renderPityProgress = (quality: StudentQuality) => {
    const currentCount = state.pityCounters[quality];
    const threshold = getPityThreshold(quality);
    const progress = Math.min((currentCount / threshold) * 100, 100);
    const guaranteedQuality = getGuaranteedQuality(quality);

    return (
      <div className="pity-progress">
        <div className="pity-info">
          <span className="pity-count">保底: {currentCount}/{threshold}</span>
          <span className="pity-guaranteed" style={{ color: qualityColors[guaranteedQuality] }}>
            保底{qualityNames[guaranteedQuality]}
          </span>
        </div>
        <div className="pity-bar-bg">
          <div 
            className="pity-bar-fill" 
            style={{ 
              width: `${progress}%`, 
              background: progress >= 100 ? qualityColors[guaranteedQuality] : qualityColors[quality],
              boxShadow: progress >= 100 ? `0 0 10px ${qualityColors[guaranteedQuality]}` : 'none'
            }}
          ></div>
        </div>
        {currentCount >= threshold && (
          <div className="pity-ready" style={{ color: qualityColors[guaranteedQuality] }}>
            ✨ 下次招募必出{qualityNames[guaranteedQuality]}！
          </div>
        )}
      </div>
    );
  };

  const renderProbabilityPanel = (quality: StudentQuality) => {
    const pityCount = state.pityCounters[quality];
    const buildingBonus = getRecruitQualityBonus(state.buildings);
    const { adjusted, base } = computeAdjustedProbabilities(quality, pityCount, buildingBonus);
    const qualities: StudentQuality[] = ['legendary', 'epic', 'rare', 'common'];
    const hasAdjustment = buildingBonus > 0 || pityCount > 0;
    const guaranteedQuality = getGuaranteedQuality(quality);
    const threshold = getPityThreshold(quality);

    return (
      <div className="probability-panel">
        <div className="probability-header">
          <span>📊 {qualityNames[quality]}招募概率</span>
          <button className="close-btn" onClick={() => setShowProbability(null)}>✕</button>
        </div>
        {hasAdjustment && (
          <div className="probability-current">
            <div className="probability-section-title">当前实际概率</div>
            <div className="probability-list">
              {qualities.map(q => (
                <div key={q} className="probability-item">
                  <span className="probability-quality" style={{ color: qualityColors[q] }}>{qualityNames[q]}</span>
                  <div className="probability-bar-wrapper">
                    <div 
                      className="probability-bar-fill" 
                      style={{ width: `${adjusted[q] * 100}%`, background: qualityColors[q] }}
                    ></div>
                  </div>
                  <span className="probability-value">{(adjusted[q] * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="probability-base">
          <div className="probability-section-title">{hasAdjustment ? '基础概率' : '当前概率'}</div>
          <div className="probability-list">
            {qualities.map(q => (
              <div key={q} className="probability-item">
                <span className="probability-quality" style={{ color: qualityColors[q] }}>{qualityNames[q]}</span>
                <div className="probability-bar-wrapper">
                  <div 
                    className="probability-bar-fill" 
                    style={{ width: `${base[q] * 100}%`, background: qualityColors[q] }}
                  ></div>
                </div>
                <span className="probability-value">{(base[q] * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="probability-note">
          {buildingBonus > 0 && (
            <p>🏗️ 建筑加成: 训练场/图书馆等级提供品质权重 ×{buildingBonus.toFixed(1)} 加成</p>
          )}
          {pityCount > 0 && (
            <p>🎯 保底进度: {pityCount}/{threshold} (达到{threshold}次必出{qualityNames[guaranteedQuality]})</p>
          )}
          <p>💡 连续招募未获得保底品质时，保底概率逐渐提升</p>
        </div>
      </div>
    );
  };

  const renderGachaAnimation = () => {
    if (!gachaAnimation.showing || !gachaAnimation.result) return null;

    const result = gachaAnimation.result;
    const isRevealPhase = gachaAnimation.phase === 'reveal';

    return (
      <div className="gacha-overlay" onClick={() => isRevealPhase && setGachaAnimation({ showing: false, result: null, phase: 'rolling' })}>
        <div className="gacha-modal" onClick={(e) => e.stopPropagation()}>
          {!isRevealPhase ? (
            <div className="gacha-rolling">
              <div className="gacha-cards">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="gacha-card rolling" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="card-back">✨</div>
                  </div>
                ))}
              </div>
              <div className="gacha-rolling-text">招募中...</div>
            </div>
          ) : (
            <div className="gacha-reveal">
              {result.isPityTriggered && (
                <div className="pity-triggered">
                  🌟 保底触发！连续 {result.pityCountBefore} 次招募后获得保底 🌟
                </div>
              )}
              <div 
                className="gacha-result-card" 
                style={{ 
                  borderColor: qualityColors[result.resultQuality],
                  boxShadow: `0 0 30px ${qualityColors[result.resultQuality]}`,
                  animation: 'revealCard 0.5s ease-out'
                }}
              >
                <div className="gacha-result-header">
                  <span 
                    className="gacha-result-quality" 
                    style={{ color: qualityColors[result.resultQuality] }}
                  >
                    {qualityNames[result.resultQuality]}
                  </span>
                  <span className="gacha-result-ticket">
                    ({qualityNames[result.ticketQuality]}招募)
                  </span>
                </div>
                <div className="gacha-result-name">{result.studentName}</div>
                <div className="gacha-result-details">
                  <div className="detail-row">
                    <span className="detail-label">魔法属性</span>
                    <span className="detail-value">
                      {result.details.magicType === 'fire' && '🔥 火系'}
                      {result.details.magicType === 'water' && '💧 水系'}
                      {result.details.magicType === 'earth' && '🪨 土系'}
                      {result.details.magicType === 'wind' && '💨 风系'}
                      {result.details.magicType === 'light' && '✨ 光系'}
                      {result.details.magicType === 'dark' && '🌑 暗系'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">初始等级</span>
                    <span className="detail-value">Lv.{result.details.initialLevel}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">潜力值</span>
                    <span className="detail-value">{result.details.potential.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">获得特质</span>
                    <span className="detail-value">
                      {result.details.traits.map((trait, i) => (
                        <span key={i} className="gacha-trait">{trait}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                className="gacha-close-btn"
                onClick={() => setGachaAnimation({ showing: false, result: null, phase: 'rolling' })}
              >
                确定
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistoryPanel = () => {
    if (!showHistory) return null;

    const recentResults = [...state.gachaHistory.results].reverse().slice(0, 20);

    return (
      <div className="history-overlay" onClick={() => setShowHistory(false)}>
        <div className="history-modal" onClick={(e) => e.stopPropagation()}>
          <div className="history-header">
            <h3>📜 招募历史</h3>
            <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className="history-stats">
            <div className="stat-item">
              <span className="stat-label">总招募次数</span>
              <span className="stat-value">{state.gachaHistory.totalDraws}</span>
            </div>
            {(['legendary', 'epic', 'rare', 'common'] as StudentQuality[]).map(q => (
              <div key={q} className="stat-item">
                <span className="stat-label" style={{ color: qualityColors[q] }}>{qualityNames[q]}</span>
                <span className="stat-value">
                  {state.gachaHistory.qualityCounts[q]} 
                  ({state.gachaHistory.totalDraws > 0 
                    ? ((state.gachaHistory.qualityCounts[q] / state.gachaHistory.totalDraws) * 100).toFixed(1) 
                    : '0.0'}%)
                </span>
              </div>
            ))}
          </div>
          <div className="history-list">
            {recentResults.length === 0 ? (
              <p className="empty-message">暂无招募记录</p>
            ) : (
              recentResults.map(result => (
                <div 
                  key={result.id} 
                  className="history-item"
                  style={{ borderLeftColor: qualityColors[result.resultQuality] }}
                >
                  <div className="history-item-left">
                    <span 
                      className="history-quality" 
                      style={{ color: qualityColors[result.resultQuality] }}
                    >
                      {qualityNames[result.resultQuality]}
                    </span>
                    <span className="history-name">{result.studentName}</span>
                    {result.isPityTriggered && (
                      <span className="history-pity">🌟保底</span>
                    )}
                  </div>
                  <div className="history-item-right">
                    <span className="history-day">第{result.day}天</span>
                    <span className="history-ticket">({qualityNames[result.ticketQuality]}券)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="module recruit-module">
      <h2>📜 学员招募</h2>
      
      <div className="recruit-header-actions">
        <button 
          className="history-btn"
          onClick={() => setShowHistory(true)}
        >
          📜 招募历史 ({state.gachaHistory.totalDraws})
        </button>
      </div>

      <div className="student-list">
        <h3>当前学员 ({state.students.length}/{getCapacity()})</h3>
        {state.students.length === 0 ? (
          <p className="empty-message">还没有学员，快去招募吧！</p>
        ) : (
          <div className="student-grid">
            {state.students.map(student => {
              const course = student.assignedCourse ? state.courses.find(c => c.id === student.assignedCourse) : null;
              const stats = getStudentStatsSummary(student);
              const moraleInfo = getMoraleLabel(student.morale);
              const staminaInfo = getStaminaLabel(student.stamina);
              return (
                <div key={student.id} className="student-card clickable" style={{ borderColor: qualityColors[student.quality] || '#9e9e9e' }} onClick={() => onStudentClick?.(student.id)} title="点击查看详情">
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
                    {(() => {
                      const hpPercent = student.maxHp > 0 ? (student.currentHp / student.maxHp) * 100 : 0;
                      const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#f44336';
                      return (
                        <div className="hp-bar-wrapper">
                          <div className="hp-label" style={{ color: hpColor }}>❤️ {student.currentHp}/{student.maxHp}</div>
                          <div className="bar-bg">
                            <div className="bar-fill hp-fill" style={{ width: `${hpPercent}%`, background: hpColor }}></div>
                          </div>
                        </div>
                      );
                    })()}
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
                  <div className="student-actions" onClick={(e) => e.stopPropagation()}>
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
              return (
                <div key={ticket.quality} className="recruit-card" style={{ borderColor: qualityColors[ticket.quality] }}>
                  <div className="recruit-card-header">
                    <h4 style={{ color: qualityColors[ticket.quality] }}>{ticket.name}</h4>
                    <button 
                      className="probability-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProbability(showProbability === ticket.quality ? null : ticket.quality);
                      }}
                      title="查看概率"
                    >
                      📊
                    </button>
                  </div>
                  
                  {showProbability === ticket.quality && renderProbabilityPanel(ticket.quality)}
                  
                  {renderPityProgress(ticket.quality)}
                  
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
                    onClick={() => handleRecruit(ticket.quality)}
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

      {renderGachaAnimation()}
      {renderHistoryPanel()}
    </div>
  );
}

function CourseModule({ onStudentClick }: ModuleProps) {
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
      <div className="course-queue-section" onClick={(e) => e.stopPropagation()}>
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
      <div className="queue-selector" onClick={(e) => e.stopPropagation()}>
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
                <div key={student.id} className={`studying-item ${student.courseDaysRemaining <= 1 ? 'almost-done' : ''} clickable`} onClick={() => onStudentClick?.(student.id)} title="点击查看详情">
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
              <div key={student.id} className="queue-overview-item clickable" onClick={() => onStudentClick?.(student.id)} title="点击查看详情">
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
                <div key={student.id} className="assignment-item clickable" onClick={() => onStudentClick?.(student.id)} title="点击查看详情">
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
                    <div className="assignment-actions" onClick={(e) => e.stopPropagation()}>
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

function DungeonModule({ onStudentClick, setConfirmDialog }: ModuleProps) {
  const { state, dispatch, calculateSweepRewards, canSweep, shouldConfirmAction, autoSaveIfEnabled } = useGame();
  const [selectedDungeon, setSelectedDungeon] = React.useState<string | null>(null);

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
      return s && s.status === 'idle' && s.stamina >= halfStamina && isStudentBattleReady(s).ok;
    });
    if (availableMembers.length === 0) {
      return { ok: false, reason: `最佳阵容体力或HP不足` };
    }
    return { ok: true };
  };

  const doSweep = (dungeonId: string) => {
    const dungeon = state.dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;
    const sweepCheck = canSweepDungeon(dungeon);
    if (!sweepCheck.ok) return;
    
    dispatch({ type: 'SWEEP_DUNGEON', dungeonId });
    if (state.autoSaveConfig.saveOnCriticalAction) {
      autoSaveIfEnabled();
    }
  };

  const handleSweepWithConfirm = (dungeonId: string) => {
    const dungeon = state.dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;

    if (shouldConfirmAction() && setConfirmDialog) {
      const sweepRewards = calculateSweepRewards(dungeon);
      const rewardsText = [
        sweepRewards.gold > 0 && `💰 ${sweepRewards.gold} 金币`,
        sweepRewards.mana > 0 && `🔮 ${sweepRewards.mana} 魔力`,
        sweepRewards.food > 0 && `🍖 ${sweepRewards.food} 食物`,
        sweepRewards.reputation > 0 && `⭐ ${sweepRewards.reputation} 声望`,
      ].filter(Boolean).join('  ');
      
      setConfirmDialog({
        show: true,
        title: `确认扫荡「${dungeon.name}」？`,
        description: `扫荡将获得以下奖励（80%收益）：\n${rewardsText}`,
        warning: `消耗最佳阵容体力（约${Math.ceil(dungeon.staminaCost * 0.5)}点/人）`,
        onConfirm: () => {
          doSweep(dungeonId);
          setConfirmDialog(prev => ({ ...prev, show: false }));
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, show: false }));
        },
      });
    } else {
      doSweep(dungeonId);
    }
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
            s.morale >= 15 &&
            isStudentBattleReady(s).ok
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
                  <button
                    className="dungeon-btn sweep-btn"
                    onClick={() => handleSweepWithConfirm(dungeon.id)}
                    disabled={!sweepCheck.ok}
                    title={sweepCheck.reason}
                  >
                    ⚡ 扫荡
                  </button>
                )}
              </div>

              {!canChallenge && (
                <div className="dungeon-locked">
                  {battleReadyCount === 0 && eligibleCount > 0
                    ? `无符合条件的学员（需Lv.${dungeon.requiredLevel}+、体力≥${dungeon.staminaCost}、士气≥15%、HP≥${Math.round(HP_BATTLE_THRESHOLD * 100)}%）`
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
          onStudentClick={onStudentClick}
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
              studentHpMap: result.studentHpMap,
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
  onStudentClick?: (studentId: string) => void;
  onComplete: (result: {
    stars: number;
    survivingMembers: number;
    totalMembers: number;
    averageHpPercent: number;
    totalTurns: number;
    team: string[];
    studentHpMap: Record<string, { current: number; max: number }>;
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
  studentHpMap: Record<string, { current: number; max: number }>;
}

function DungeonBattle({ dungeon, students, courses, onClose, onStudentClick, onComplete }: DungeonBattleProps) {
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
    const hpReady = isStudentBattleReady(student);
    if (!hpReady.ok) {
      return hpReady;
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

    const studentHpMap: Record<string, { current: number; max: number }> = {};
    playerTeam.forEach(p => {
      studentHpMap[p.id] = {
        current: Math.max(0, Math.floor(p.hp)),
        max: p.maxHp,
      };
    });
    teamIds.forEach(id => {
      if (!studentHpMap[id]) {
        const origStudent = students.find(s => s.id === id);
        if (origStudent) {
          studentHpMap[id] = { current: 0, max: origStudent.maxHp };
        }
      }
    });

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
      studentHpMap,
    };
  }, [dungeon, calculateBattleStars, calculateDungeonRewards, students]);

  const startBattle = () => {
    if (selectedTeam.length === 0) return;
    const team = eligibleStudents.filter(s => selectedTeam.includes(s.id));
    const validTeam = team.filter(s => canStudentBattle(s).ok);
    if (validTeam.length === 0) return;

    battleRef.current = {
      playerTeam: validTeam.map(s => ({ 
        ...s, 
        hp: s.currentHp,
        maxHp: s.maxHp,
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
      studentHpMap: battleResult.studentHpMap,
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
                      <div
                        className="team-member-name clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStudentClick?.(student.id);
                        }}
                        title="点击查看详情"
                      >
                        {student.name} (Lv.{student.level})
                        {student.skills.length > 0 && ` [${student.skills.length}技能]`}
                        {isInBestTeam && ' ⭐'}
                      </div>
                      <div className="team-member-stats">
                        <span style={{ color: moraleInfo.color }}>😊{student.morale}%</span>
                        <span style={{ color: staminaInfo.color }}>⚡{student.stamina}%</span>
                        <span style={{ color: student.currentHp / student.maxHp > 0.5 ? '#4CAF50' : student.currentHp / student.maxHp > 0.3 ? '#FF9800' : '#f44336' }}>
                          ❤️{student.currentHp}/{student.maxHp}
                        </span>
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
              <p>💡 提示: 士气和体力会影响战斗伤害，HP低于{Math.round(HP_BATTLE_THRESHOLD * 100)}%无法出战，注意治疗和休息恢复</p>
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
                
                <div className="result-hp-list">
                  <h5>队员战后状态:</h5>
                  {battleResult.team.map(id => {
                    const hpData = battleResult.studentHpMap[id];
                    const s = students.find(st => st.id === id);
                    if (!hpData || !s) return null;
                    const hpPercent = hpData.max > 0 ? hpData.current / hpData.max : 0;
                    const hpColor = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#f44336';
                    return (
                      <div key={id} className="hp-row">
                        <span>{s.name}</span>
                        <span style={{ color: hpColor }}>
                          {hpData.current <= 0 ? '💔 倒下' : `❤️ ${hpData.current}/${hpData.max}`}
                        </span>
                      </div>
                    );
                  })}
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
              <>
                <div className="result-hp-list">
                  <h5>队员战后状态:</h5>
                  {battleResult.team.map(id => {
                    const hpData = battleResult.studentHpMap[id];
                    const s = students.find(st => st.id === id);
                    if (!hpData || !s) return null;
                    const hpPercent = hpData.max > 0 ? hpData.current / hpData.max : 0;
                    const hpColor = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FF9800' : '#f44336';
                    return (
                      <div key={id} className="hp-row">
                        <span>{s.name}</span>
                        <span style={{ color: hpColor }}>
                          {hpData.current <= 0 ? '💔 倒下' : `❤️ ${hpData.current}/${hpData.max}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="defeat-hint">
                  <p>学员们需要更多训练！</p>
                  <p>建议: 提升等级、学习更多技能、搭配更强阵容，记得治疗受伤学员</p>
                </div>
              </>
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

function SettlementModule({ setConfirmDialog }: ModuleProps) {
  const { state, getActiveSynergies, calculateSynergyBonus, calculateDailyIncome, calculateFoodConsumption, getMoraleLabel, nextDayWithSave, shouldConfirmAction } = useGame();
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
      case 'battle_injury': return '🩹';
      case 'hp_natural_recovery': return '💚';
      case 'hp_heal': return '💊';
      case 'course_started': return '📚';
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
        {state.autoSaveConfig.lastAutoSave && (
          <div className="auto-save-info">
            💾 上次自动保存: {new Date(state.autoSaveConfig.lastAutoSave).toLocaleString('zh-CN')}
          </div>
        )}
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
              const doAdvance = () => {
                nextDayWithSave(daysToAdvance);
              };

              if (shouldConfirmAction() && daysToAdvance > 1 && setConfirmDialog) {
                setConfirmDialog({
                  show: true,
                  title: `确认推进 ${daysToAdvance} 天？`,
                  description: `将快速推进 ${daysToAdvance} 天，期间会自动结算资源产出、食物消耗、课程进度等。`,
                  warning: daysToAdvance > 7 ? '推进天数较多，请注意食物储备是否充足' : undefined,
                  onConfirm: () => {
                    doAdvance();
                    setConfirmDialog(prev => ({ ...prev, show: false }));
                  },
                  onCancel: () => setConfirmDialog(prev => ({ ...prev, show: false })),
                });
              } else {
                doAdvance();
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
        {state.autoSaveConfig.enabled && state.autoSaveConfig.saveOnDayAdvance && (
          <p className="tip auto-save-tip">
            ✅ 推进时间时会自动保存游戏进度
          </p>
        )}
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
  const { state, saveGame, loadGame, dispatch, exportSave, importSave, restoreFromBackup, hasBackupAvailable, backupTime, updateAutoSaveConfig } = useGame();
  const [importText, setImportText] = React.useState('');
  const [showImport, setShowImport] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = () => {
    const data = exportSave();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magic-academy-save-day${state.day}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('success', '存档已导出');
  };

  const handleImportText = () => {
    if (!importText.trim()) {
      showMessage('error', '请粘贴存档数据');
      return;
    }
    const ok = importSave(importText.trim());
    if (ok) {
      showMessage('success', '存档导入成功');
      setImportText('');
      setShowImport(false);
    } else {
      showMessage('error', '存档数据无效或格式错误，导入失败');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const ok = importSave(text);
      if (ok) {
        showMessage('success', '存档文件导入成功');
      } else {
        showMessage('error', '存档文件无效或格式错误，导入失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreBackup = () => {
    if (!hasBackupAvailable) return;
    if (!confirm('确定要从备份恢复吗？当前进度将被覆盖！')) return;
    const ok = restoreFromBackup();
    if (ok) {
      showMessage('success', '已从备份恢复存档');
    } else {
      showMessage('error', '备份恢复失败');
    }
  };

  const totalSkills = state.students.reduce((acc, s) => acc + s.skills.length, 0);

  const formatBackupTime = (iso: string | null) => {
    if (!iso) return '未知';
    try {
      return new Date(iso).toLocaleString('zh-CN');
    } catch {
      return iso;
    }
  };

  return (
    <div className="module settings-module">
      <h2>⚙️ 设置存档</h2>

      {message && (
        <div className={`save-message ${message.type}`}>
          {message.type === 'success' && '✅ '}
          {message.type === 'error' && '❌ '}
          {message.type === 'info' && 'ℹ️ '}
          {message.text}
        </div>
      )}

      <div className="save-section">
        <h3>存档管理</h3>
        <div className="save-actions">
          <button onClick={() => { saveGame(); showMessage('success', '游戏已保存'); }}>💾 保存游戏</button>
          <button onClick={() => { loadGame(); showMessage('info', '存档已重新加载'); }}>📂 加载存档</button>
          <button
            className="danger"
            onClick={() => {
              if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
                localStorage.removeItem('magicAcademySave');
                dispatch({ type: 'RESET_GAME' });
                showMessage('info', '游戏已重置');
              }
            }}
          >
            🗑️ 重置游戏
          </button>
        </div>
      </div>

      <div className="save-section">
        <h3>导出 / 导入存档</h3>
        <div className="save-actions">
          <button onClick={handleExport}>📤 导出存档文件</button>
          <button onClick={() => setShowImport(!showImport)}>
            {showImport ? '📥 收起导入' : '📥 导入存档'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
          <button onClick={() => fileInputRef.current?.click()}>📁 选择文件导入</button>
        </div>
        {showImport && (
          <div className="import-section">
            <p className="import-hint">粘贴存档 JSON 数据：</p>
            <textarea
              className="import-textarea"
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='粘贴导出的存档数据...'
            />
            <div className="import-actions">
              <button onClick={handleImportText} disabled={!importText.trim()}>确认导入</button>
              <button onClick={() => { setImportText(''); setShowImport(false); }}>取消</button>
            </div>
          </div>
        )}
      </div>

      <div className="save-section">
        <h3>备份恢复</h3>
        {hasBackupAvailable ? (
          <div className="backup-info">
            <p>📋 上次备份时间: {formatBackupTime(backupTime)}</p>
            <p className="backup-hint">每次保存或加载存档时会自动创建备份，当存档损坏时可从此恢复</p>
            <button onClick={handleRestoreBackup} disabled={!hasBackupAvailable}>
              🔄 从备份恢复
            </button>
          </div>
        ) : (
          <div className="backup-info">
            <p>暂无备份数据</p>
            <p className="backup-hint">保存游戏后会自动创建备份</p>
          </div>
        )}
      </div>

      <div className="save-section">
        <h3>⚙️ 自动保存与操作确认</h3>
        <div className="auto-save-config">
          <label className="config-item">
            <input
              type="checkbox"
              checked={state.autoSaveConfig.enabled}
              onChange={(e) => updateAutoSaveConfig({ enabled: e.target.checked })}
            />
            <span>启用自动保存</span>
          </label>
          <label className="config-item">
            <input
              type="checkbox"
              checked={state.autoSaveConfig.saveOnDayAdvance}
              onChange={(e) => updateAutoSaveConfig({ saveOnDayAdvance: e.target.checked })}
              disabled={!state.autoSaveConfig.enabled}
            />
            <span>推进时间时自动保存</span>
          </label>
          <label className="config-item">
            <input
              type="checkbox"
              checked={state.autoSaveConfig.saveOnCriticalAction}
              onChange={(e) => updateAutoSaveConfig({ saveOnCriticalAction: e.target.checked })}
              disabled={!state.autoSaveConfig.enabled}
            />
            <span>关键操作时自动保存（招募、扫荡等）</span>
          </label>
          <label className="config-item">
            <input
              type="checkbox"
              checked={state.autoSaveConfig.confirmOnCriticalAction}
              onChange={(e) => updateAutoSaveConfig({ confirmOnCriticalAction: e.target.checked })}
            />
            <span>关键操作前弹出确认对话框</span>
          </label>
          <div className="config-item">
            <span>快照保留天数:</span>
            <select
              value={state.autoSaveConfig.maxSnapshots}
              onChange={(e) => updateAutoSaveConfig({ maxSnapshots: parseInt(e.target.value) })}
            >
              <option value={7}>7 天</option>
              <option value={15}>15 天</option>
              <option value={30}>30 天</option>
              <option value={60}>60 天</option>
            </select>
          </div>
          {state.autoSaveConfig.lastAutoSave && (
            <div className="config-item info">
              💾 上次自动保存: {new Date(state.autoSaveConfig.lastAutoSave).toLocaleString('zh-CN')}
            </div>
          )}
          <div className="config-item info">
            📊 已记录 {state.dailySnapshots.length} 天的经营快照
          </div>
        </div>
      </div>

      <div className="save-section">
        <h3>存档版本信息</h3>
        <div className="version-info-grid">
          <div className="version-item">
            <span>当前存档版本</span>
            <span>v{state.saveVersion}</span>
          </div>
          <div className="version-item">
            <span>游戏支持版本</span>
            <span>v2</span>
          </div>
          <div className="version-item">
            <span>存档状态</span>
            <span className={state.saveVersion === 2 ? 'version-ok' : 'version-warn'}>
              {state.saveVersion === 2 ? '✅ 已是最新' : `⚠️ 需迁移 (v${state.saveVersion} → v2)`}
            </span>
          </div>
        </div>
        <p className="version-hint">
          旧版本存档会在加载时自动迁移到最新版本，无需手动操作
        </p>
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
        <p>魔法学院经营游戏 v1.2</p>
        <p>使用 React + TypeScript + Canvas API 构建</p>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

function ConfirmDialog({
  title,
  description,
  warning,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-description">{description}</p>
        {warning && (
          <div className="confirm-warning">
            <span className="warning-icon">⚠️</span>
            {warning}
          </div>
        )}
        <div className="confirm-actions">
          <button className="confirm-cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-ok-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecordsModule() {
  const { state, getSnapshotForDay, getPreviousSnapshot } = useGame();
  const [selectedDay, setSelectedDay] = React.useState<number | null>(state.dailySnapshots.length > 0 ? state.dailySnapshots[state.dailySnapshots.length - 1].day : null);

  const sortedSnapshots = [...state.dailySnapshots].sort((a, b) => b.day - a.day);
  const currentSnapshot = selectedDay !== null ? getSnapshotForDay(selectedDay) : null;
  const prevSnapshot = selectedDay !== null ? getPreviousSnapshot(selectedDay) : null;

  const formatChange = (current: number, previous: number | undefined, isGood = true) => {
    if (previous === undefined) return <span className="change-neutral">--</span>;
    const diff = current - previous;
    if (diff === 0) return <span className="change-neutral">±0</span>;
    const positive = isGood ? diff > 0 : diff < 0;
    return (
      <span className={positive ? 'change-positive' : 'change-negative'}>
        {diff > 0 ? '+' : ''}{diff}
      </span>
    );
  };

  const formatPercentChange = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) return <span className="change-neutral">--</span>;
    const diff = current - previous;
    if (diff === 0) return <span className="change-neutral">±0%</span>;
    const percent = ((diff / previous) * 100).toFixed(1);
    return (
      <span className={diff > 0 ? 'change-positive' : 'change-negative'}>
        {diff > 0 ? '+' : ''}{percent}%
      </span>
    );
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      income: '收入',
      consumption: '消耗',
      event: '事件',
      student: '学员',
      level: '等级',
      warning: '警告',
    };
    return labels[type] || type;
  };

  return (
    <div className="module records-module">
      <h2>📊 经营记录</h2>

      {state.dailySnapshots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-title">暂无经营记录</p>
          <p className="empty-desc">推进时间后会自动记录每日经营快照，方便您回顾学院发展历程</p>
          <p className="empty-tip">💡 提示：确保在设置中开启了自动保存和快照记录功能</p>
        </div>
      ) : (
        <div className="records-container">
          <div className="records-sidebar">
            <h3>📅 选择日期</h3>
            <div className="snapshot-list">
              {sortedSnapshots.map((snapshot) => (
                <button
                  key={snapshot.day}
                  className={`snapshot-item ${selectedDay === snapshot.day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(snapshot.day)}
                >
                  <div className="snapshot-day">第 {snapshot.day} 天</div>
                  <div className="snapshot-summary">
                    <span>💰{snapshot.resources.gold}</span>
                    <span>👥{snapshot.studentCount}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="records-content">
            {currentSnapshot ? (
              <>
                <div className="snapshot-header">
                  <h3>第 {currentSnapshot.day} 天经营详情</h3>
                  <div className="snapshot-time">
                    📅 {new Date(currentSnapshot.timestamp).toLocaleString('zh-CN')}
                  </div>
                </div>

                <div className="snapshot-section">
                  <h4>💰 资源状况</h4>
                  <div className="snapshot-grid">
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">金币</div>
                      <div className="snapshot-card-value">{currentSnapshot.resources.gold}</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatChange(currentSnapshot.resources.gold, prevSnapshot.resources.gold, true)}
                      </div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">魔力</div>
                      <div className="snapshot-card-value">{currentSnapshot.resources.mana}</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatChange(currentSnapshot.resources.mana, prevSnapshot.resources.mana, true)}
                      </div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">食物</div>
                      <div className="snapshot-card-value">{currentSnapshot.resources.food}</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatChange(currentSnapshot.resources.food, prevSnapshot.resources.food, true)}
                      </div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">声望</div>
                      <div className="snapshot-card-value">{currentSnapshot.resources.reputation}</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatChange(currentSnapshot.resources.reputation, prevSnapshot.resources.reputation, true)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="snapshot-section">
                  <h4>📊 收支明细</h4>
                  <div className="snapshot-grid">
                    <div className="snapshot-card income">
                      <div className="snapshot-card-label">💰 当日收入金币</div>
                      <div className="snapshot-card-value">+{currentSnapshot.income.gold}</div>
                    </div>
                    <div className="snapshot-card income">
                      <div className="snapshot-card-label">🔮 当日收入魔力</div>
                      <div className="snapshot-card-value">+{currentSnapshot.income.mana}</div>
                    </div>
                    <div className="snapshot-card income">
                      <div className="snapshot-card-label">🍖 当日收入食物</div>
                      <div className="snapshot-card-value">+{currentSnapshot.income.food}</div>
                    </div>
                    <div className="snapshot-card consumption">
                      <div className="snapshot-card-label">🍖 当日食物消耗</div>
                      <div className="snapshot-card-value">-{currentSnapshot.consumption.food}</div>
                    </div>
                  </div>
                </div>

                <div className="snapshot-section">
                  <h4>👥 学员状况</h4>
                  <div className="snapshot-grid">
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">学员总数</div>
                      <div className="snapshot-card-value">{currentSnapshot.studentCount}</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatChange(currentSnapshot.studentCount, prevSnapshot.studentCount, true)}
                      </div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">📚 学习中</div>
                      <div className="snapshot-card-value">{currentSnapshot.studyingCount}</div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">😴 休息中</div>
                      <div className="snapshot-card-value">{currentSnapshot.restingCount}</div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">😊 平均士气</div>
                      <div className="snapshot-card-value">{currentSnapshot.avgMorale.toFixed(1)}%</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatPercentChange(currentSnapshot.avgMorale, prevSnapshot.avgMorale)}
                      </div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">⚡ 平均体力</div>
                      <div className="snapshot-card-value">{currentSnapshot.avgStamina.toFixed(1)}%</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatPercentChange(currentSnapshot.avgStamina, prevSnapshot.avgStamina)}
                      </div>
                    </div>
                    <div className="snapshot-card">
                      <div className="snapshot-card-label">⭐ 累计经验</div>
                      <div className="snapshot-card-value">{currentSnapshot.totalExp}</div>
                      <div className="snapshot-card-change">
                        {prevSnapshot && formatChange(currentSnapshot.totalExp, prevSnapshot.totalExp, true)}
                      </div>
                    </div>
                  </div>
                </div>

                {currentSnapshot.events.length > 0 && (
                  <div className="snapshot-section">
                    <h4>📜 当日事件</h4>
                    <div className="snapshot-events">
                      {currentSnapshot.events.map((event, idx) => (
                        <div key={idx} className={`snapshot-event event-${event.type}`}>
                          <span className="event-type">[{getEventTypeLabel(event.type)}]</span>
                          <span className="event-message">{event.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="snapshot-section">
                  <h4>🏗️ 建筑等级</h4>
                  <div className="building-levels">
                    {Object.entries(currentSnapshot.buildingLevels).map(([buildingId, level]) => (
                      <div key={buildingId} className="building-level-item">
                        <span className="building-name">{buildingId}</span>
                        <span className="building-level">Lv.{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👆</div>
                <p className="empty-title">请选择日期查看详情</p>
                <p className="empty-desc">从左侧列表选择想要回看的日期</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface StudentDetailModalProps {
  student: StudentType;
  onClose: () => void;
}

type DetailTab = 'overview' | 'skills' | 'growth' | 'history';

function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<DetailTab>('overview');
  const [healAmount, setHealAmount] = React.useState<number>(20);
  const { getMoraleLabel, getStaminaLabel, dispatch, canAfford } = useGame();

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

  const magicTypeNames: Record<string, string> = {
    fire: '火系',
    water: '水系',
    earth: '土系',
    wind: '风系',
    light: '光系',
    dark: '暗系',
  };
  const magicTypeEmojis: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🪨',
    wind: '💨',
    light: '✨',
    dark: '🌑',
  };

  const tabs = [
    { id: 'overview' as const, label: '概览', icon: '📊' },
    { id: 'skills' as const, label: '技能', icon: '⚡' },
    { id: 'growth' as const, label: '成长', icon: '📈' },
    { id: 'history' as const, label: '历史', icon: '📜' },
  ];

  const sortedGrowthRecords = [...student.growthRecords].sort((a, b) => b.day - a.day);
  const sortedCourseHistory = [...student.courseHistory].sort((a, b) => b.completedAt - a.completedAt);
  const sortedDungeonHistory = [...student.dungeonHistory].sort((a, b) => b.challengedAt - a.challengedAt);

  const renderStars = (stars: number, maxStars: number = 3) => (
    <span>
      {Array.from({ length: maxStars }, (_, i) => (
        <span key={i} className={i < stars ? 'star filled' : 'star empty'}>★</span>
      ))}
    </span>
  );

  const totalDungeonRuns = student.dungeonHistory.length;
  const victoryCount = student.dungeonHistory.filter(d => d.victory).length;
  const totalStars = student.dungeonHistory.reduce((acc, d) => acc + d.stars, 0);

  return (
    <div className="student-detail-overlay" onClick={onClose}>
      <div className="student-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header" style={{ borderColor: qualityColors[student.quality] }}>
          <div className="detail-header-info">
            <div className="detail-name-section">
              <h2 className="detail-student-name">{student.name}</h2>
              <span className="detail-student-quality" style={{ color: qualityColors[student.quality] }}>
                {qualityNames[student.quality]}
              </span>
            </div>
            <div className="detail-basic-info">
              <span className="magic-type-badge" data-type={student.magicType}>
                {magicTypeEmojis[student.magicType]} {magicTypeNames[student.magicType]}魔法
              </span>
              <span className="detail-level">Lv.{student.level}</span>
            </div>
          </div>
          <button className="detail-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="detail-stats-bar">
          <div className="detail-stat-item">
            <span className="detail-stat-label">经验</span>
            <div className="detail-exp-bar">
              <div className="detail-exp-fill" style={{ width: `${(student.exp / (student.level * 100)) * 100}%` }}></div>
            </div>
            <span className="detail-stat-value">{student.exp}/{student.level * 100}</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">潜力</span>
            <span className="detail-stat-value highlight">{student.potential.toFixed(2)}</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">经验倍率</span>
            <span className="detail-stat-value">x{(stats.expMultiplier / 100).toFixed(2)}</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">学习速度</span>
            <span className="detail-stat-value">x{(stats.courseSpeedMultiplier / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="detail-status-bars">
          <div className="status-bar-item">
            <div className="status-bar-label" style={{ color: moraleInfo.color }}>😊 士气 {student.morale}%</div>
            <div className="bar-bg">
              <div className="bar-fill morale-fill" style={{ width: `${student.morale}%`, background: moraleInfo.color }}></div>
            </div>
          </div>
          <div className="status-bar-item">
            <div className="status-bar-label" style={{ color: staminaInfo.color }}>⚡ 体力 {student.stamina}%</div>
            <div className="bar-bg">
              <div className="bar-fill stamina-fill" style={{ width: `${student.stamina}%`, background: staminaInfo.color }}></div>
            </div>
          </div>
          <div className="status-bar-item">
            {(() => {
              const hpPercent = student.maxHp > 0 ? (student.currentHp / student.maxHp) * 100 : 0;
              const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FF9800' : '#f44336';
              return (
                <>
                  <div className="status-bar-label" style={{ color: hpColor }}>❤️ HP {student.currentHp}/{student.maxHp}</div>
                  <div className="bar-bg">
                    <div className="bar-fill hp-fill" style={{ width: `${hpPercent}%`, background: hpColor }}></div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="detail-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`detail-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="detail-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="detail-section">
                <h4>🌟 特质</h4>
                <div className="detail-traits">
                  {student.traits.length > 0 ? (
                    student.traits.map(trait => (
                      <div key={trait.id} className={`detail-trait-card trait-${trait.rarity}`}>
                        <div className="trait-name">{trait.name}</div>
                        <div className="trait-desc">{trait.description}</div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">暂无特质</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>📋 当前状态</h4>
                <div className="status-info-grid">
                  <div className="status-info-item">
                    <span className="status-info-label">当前状态</span>
                    <span className="status-info-value">
                      {student.status === 'idle' && '🟢 空闲'}
                      {student.status === 'studying' && '📚 学习中'}
                      {student.status === 'training' && '⚔️ 训练中'}
                      {student.status === 'resting' && '😴 休息中'}
                    </span>
                  </div>
                  {student.assignedCourse && (
                    <div className="status-info-item">
                      <span className="status-info-label">当前课程</span>
                      <span className="status-info-value highlight">
                        {student.assignedCourse}
                      </span>
                    </div>
                  )}
                  {student.courseQueue.length > 0 && (
                    <div className="status-info-item">
                      <span className="status-info-label">队列课程</span>
                      <span className="status-info-value">{student.courseQueue.length} 门</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>💚 治疗恢复</h4>
                {(() => {
                  const maxHealable = getMaxHealableHp(student);
                  const actualHealAmount = Math.min(healAmount, maxHealable);
                  const healCost = calculateHealCost(actualHealAmount);
                  const canAffordHeal = maxHealable > 0 && canAfford(healCost);
                  const hpEfficiency = calculateHpEfficiencyMultiplier(student.currentHp, student.maxHp);

                  return (
                    <div className="heal-section">
                      {maxHealable <= 0 ? (
                        <p className="empty-text">学员已满血，无需治疗</p>
                      ) : (
                        <>
                          <div className="heal-info">
                            {hpEfficiency < 1 && (
                              <p className="heal-warning">
                                ⚠️ 当前 HP 导致学习效率 ×{hpEfficiency.toFixed(2)}，建议尽快治疗
                              </p>
                            )}
                            <p>可恢复: <strong>{maxHealable}</strong> HP</p>
                          </div>
                          
                          <div className="heal-controls">
                            <label>治疗量: {actualHealAmount} HP</label>
                            <input
                              type="range"
                              min="1"
                              max={Math.max(1, maxHealable)}
                              value={Math.min(healAmount, maxHealable)}
                              onChange={(e) => setHealAmount(parseInt(e.target.value))}
                              disabled={maxHealable <= 0}
                            />
                            <div className="heal-cost">
                              <span>消耗:</span>
                              {healCost.gold > 0 && <span>💰{healCost.gold}</span>}
                              {healCost.mana > 0 && <span>🔮{healCost.mana}</span>}
                              {healCost.food > 0 && <span>🍖{healCost.food}</span>}
                            </div>
                          </div>

                          <div className="heal-actions">
                            <button
                              className="heal-btn"
                              onClick={() => dispatch({ type: 'HEAL_STUDENT', studentId: student.id, hpAmount: actualHealAmount, cost: healCost })}
                              disabled={!canAffordHeal}
                            >
                              💚 治疗 ({actualHealAmount} HP)
                            </button>
                            <button
                              className="heal-all-btn"
                              onClick={() => setHealAmount(maxHealable)}
                              disabled={maxHealable <= 0}
                            >
                              📋 全额治疗
                            </button>
                          </div>

                          {!canAffordHeal && maxHealable > 0 && (
                            <p className="heal-warning">资源不足，无法治疗</p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="detail-section">
                <h4>🏆 统计概览</h4>
                <div className="stats-summary-grid">
                  <div className="stats-summary-item">
                    <span className="stats-summary-icon">📚</span>
                    <div className="stats-summary-info">
                      <span className="stats-summary-value">{student.courseHistory.length}</span>
                      <span className="stats-summary-label">已完成课程</span>
                    </div>
                  </div>
                  <div className="stats-summary-item">
                    <span className="stats-summary-icon">⚡</span>
                    <div className="stats-summary-info">
                      <span className="stats-summary-value">{student.skills.length}</span>
                      <span className="stats-summary-label">已学技能</span>
                    </div>
                  </div>
                  <div className="stats-summary-item">
                    <span className="stats-summary-icon">⚔️</span>
                    <div className="stats-summary-info">
                      <span className="stats-summary-value">{totalDungeonRuns}</span>
                      <span className="stats-summary-label">副本挑战</span>
                    </div>
                  </div>
                  <div className="stats-summary-item">
                    <span className="stats-summary-icon">⭐</span>
                    <div className="stats-summary-info">
                      <span className="stats-summary-value">{victoryCount}/{totalDungeonRuns}</span>
                      <span className="stats-summary-label">胜利次数</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>🎯 招募信息</h4>
                <div className="recruitment-info-card">
                  <div className="recruitment-info-row">
                    <span>招募天数</span>
                    <span className="highlight">第 {student.recruitmentInfo?.recruitedAt || '未知'} 天</span>
                  </div>
                  <div className="recruitment-info-row">
                    <span>招募品质</span>
                    <span style={{ color: qualityColors[student.recruitmentInfo?.recruitmentQuality || 'common'] }}>
                      {qualityNames[student.recruitmentInfo?.recruitmentQuality || 'common']}
                    </span>
                  </div>
                  <div className="recruitment-info-row">
                    <span>初始等级</span>
                    <span>Lv.{student.recruitmentInfo?.initialLevel || '-'}</span>
                  </div>
                  <div className="recruitment-info-row">
                    <span>初始潜力</span>
                    <span>{student.recruitmentInfo?.initialPotential?.toFixed(2) || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-tab">
              {student.skills.length > 0 ? (
                <div className="skills-grid">
                  {student.skills.map(skill => (
                    <div key={skill.id} className={`skill-card skill-${skill.type}`}>
                      <div className="skill-header">
                        <span className="skill-icon">{magicTypeEmojis[skill.type]}</span>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                      <div className="skill-stats">
                        <div className="skill-stat">
                          <span className="skill-stat-label">伤害</span>
                          <span className="skill-stat-value damage">{skill.damage}</span>
                        </div>
                        <div className="skill-stat">
                          <span className="skill-stat-label">消耗</span>
                          <span className="skill-stat-value cost">{skill.cost}</span>
                        </div>
                      </div>
                      <p className="skill-desc">{skill.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📖</div>
                  <p className="empty-title">暂无技能</p>
                  <p className="empty-desc">安排学员学习魔法课程来解锁技能</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="growth-tab">
              {sortedGrowthRecords.length > 0 ? (
                <div className="growth-timeline">
                  {sortedGrowthRecords.map(record => (
                    <div key={record.id} className="timeline-item">
                      <div className={`timeline-dot ${record.type}`}>
                        {record.type === 'level_up' && '⬆️'}
                        {record.type === 'skill_unlock' && '⚡'}
                        {record.type === 'trait_gain' && '✨'}
                        {record.type === 'potential_boost' && '📈'}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-day">第 {record.day} 天</div>
                        <div className="timeline-desc">{record.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📈</div>
                  <p className="empty-title">暂无成长记录</p>
                  <p className="empty-desc">随着学员学习和成长，记录会显示在这里</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <div className="history-section">
                <h4>📚 课程历史</h4>
                {sortedCourseHistory.length > 0 ? (
                  <div className="history-list">
                    {sortedCourseHistory.map(entry => (
                      <div key={entry.id} className="history-item course-history">
                        <div className="history-item-header">
                          <span className="history-item-title">{entry.courseName}</span>
                          <span className="history-item-day">第 {entry.completedAt} 天完成</span>
                        </div>
                        <div className="history-item-details">
                          <span className="history-badge exp">+{entry.expGained} 经验</span>
                          {entry.leveledUp && <span className="history-badge level">升级!</span>}
                          {entry.skillUnlocked && <span className="history-badge skill">技能解锁</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">暂无课程记录</p>
                )}
              </div>

              <div className="history-section">
                <h4>⚔️ 副本记录</h4>
                {sortedDungeonHistory.length > 0 ? (
                  <div className="history-list">
                    {sortedDungeonHistory.map(entry => (
                      <div key={entry.id} className={`history-item dungeon-history ${entry.victory ? 'victory' : 'defeat'}`}>
                        <div className="history-item-header">
                          <span className="history-item-title">{entry.dungeonName}</span>
                          <span className="history-item-day">第 {entry.challengedAt} 天</span>
                        </div>
                        <div className="history-item-details">
                          <span className="dungeon-stars">
                            {renderStars(entry.stars)}
                          </span>
                          <span className="history-badge">
                            {entry.survivingMembers}/{entry.totalMembers} 存活
                          </span>
                          <span className="history-badge">
                            {entry.turns} 回合
                          </span>
                          {entry.isFirstClear && (
                            <span className="history-badge first-clear">首通!</span>
                          )}
                        </div>
                        {entry.victory && entry.rewards && (
                          <div className="dungeon-rewards-small">
                            {entry.rewards.gold && <span>💰{entry.rewards.gold}</span>}
                            {entry.rewards.mana && <span>🔮{entry.rewards.mana}</span>}
                            {entry.rewards.food && <span>🍖{entry.rewards.food}</span>}
                            {entry.rewards.reputation && <span>⭐{entry.rewards.reputation}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">暂无副本记录</p>
                )}
              </div>

              <div className="history-section">
                <h4>📊 副本统计</h4>
                <div className="dungeon-stats-grid">
                  <div className="dungeon-stat-card">
                    <span className="dungeon-stat-value">{totalDungeonRuns}</span>
                    <span className="dungeon-stat-label">总挑战次数</span>
                  </div>
                  <div className="dungeon-stat-card">
                    <span className="dungeon-stat-value success">{victoryCount}</span>
                    <span className="dungeon-stat-label">胜利次数</span>
                  </div>
                  <div className="dungeon-stat-card">
                    <span className="dungeon-stat-value star">{totalStars}</span>
                    <span className="dungeon-stat-label">累计星级</span>
                  </div>
                  <div className="dungeon-stat-card">
                    <span className="dungeon-stat-value">
                      {totalDungeonRuns > 0 ? Math.round((victoryCount / totalDungeonRuns) * 100) : 0}%
                    </span>
                    <span className="dungeon-stat-label">胜率</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { AcademyModule, RecruitModule, CourseModule, DungeonModule, SettlementModule, SettingsModule, RecordsModule, StudentDetailModal, ConfirmDialog };