import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../store/GameContext';
import type { Dungeon as DungeonType, BattleState, BattleSkillResult, TeamCompBonus, BattleSettlement, DungeonWaveConfig, MagicType } from '../types/game';
import {
  generateDungeonWaves,
  initializeBattleState,
  startBattle,
  selectSkill,
  executeSkill,
  executeAITurn,
  nextTurn,
  getCurrentUnit,
  evaluateTeamComposition,
  calculateBattleSettlement,
  applyBattleResultToStudents,
  generateWaveEnemies,
  ELEMENT_COLORS,
  ELEMENT_NAMES,
  ELEMENT_ICONS,
  getElementAdvantage,
  getGradeColor,
  getStrongAgainst,
  getWeakAgainst,
} from '../data/battleSystem';
import { isStudentBattleReady, canMentorLeadDungeon } from '../data/gameData';
import './DungeonPanel.css';

type SetConfirmDialog = React.Dispatch<React.SetStateAction<{
  show: boolean;
  title: string;
  description: string;
  warning?: string;
  cost?: Partial<{ gold: number; mana: number; food: number; reputation: number }>;
  onConfirm: () => void;
  onCancel: () => void;
}>>;

interface DungeonPanelProps {
  onStudentClick?: (studentId: string) => void;
  setConfirmDialog?: SetConfirmDialog;
}

type ViewMode = 'list' | 'teamSelect' | 'battle' | 'settlement';

export default function DungeonPanel({ onStudentClick, setConfirmDialog }: DungeonPanelProps) {
  const { state, dispatch, calculateSweepRewards, canSweep, shouldConfirmAction, autoSaveIfEnabled } = useGame();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonType | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [waveConfigs, setWaveConfigs] = useState<DungeonWaveConfig[]>([]);
  const [teamEvaluation, setTeamEvaluation] = useState<ReturnType<typeof evaluateTeamComposition> | null>(null);
  const [settlement, setSettlement] = useState<BattleSettlement | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (selectedTeam.length > 0 && selectedDungeon) {
      const teamStudents = state.students.filter(s => selectedTeam.includes(s.id));
      const evaluation = evaluateTeamComposition(teamStudents);
      setTeamEvaluation(evaluation);
    } else {
      setTeamEvaluation(null);
    }
  }, [selectedTeam, selectedDungeon, state.students]);

  const renderStars = (stars: number, maxStars: number = 3) => {
    return (
      <div className="star-display">
        {Array.from({ length: maxStars }, (_, i) => (
          <span key={i} className={`star ${i < stars ? 'filled' : 'empty'}`}>★</span>
        ))}
      </div>
    );
  };

  const handleSelectDungeon = (dungeon: DungeonType) => {
    setSelectedDungeon(dungeon);
    setSelectedTeam(dungeon.bestTeam.length > 0 ? [...dungeon.bestTeam] : []);
    setViewMode('teamSelect');
  };

  const handleToggleTeamMember = (studentId: string) => {
    setSelectedTeam(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, studentId];
    });
  };

  const handleStartBattle = () => {
    if (!selectedDungeon || selectedTeam.length === 0) return;
    
    const teamStudents = state.students.filter(s => selectedTeam.includes(s.id));
    const waves = generateDungeonWaves(selectedDungeon);
    setWaveConfigs(waves);
    
    const initialState = initializeBattleState(teamStudents, selectedDungeon, waves);
    setBattleState(initialState);
    setBattleLog([]);
    setSettlement(null);
    setViewMode('battle');
  };

  const handleBeginBattle = () => {
    if (!battleState) return;
    const started = startBattle(battleState);
    setBattleState(started);
    addLog('⚔️ 战斗开始！');
    
    const firstUnit = getCurrentUnit(started);
    if (firstUnit) {
      addLog(`${firstUnit.isPlayer ? '👤' : '👹'} ${firstUnit.name} 准备行动`);
    }
  };

  const addLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev.slice(-50), message]);
  }, []);

  const formatSkillResult = (result: BattleSkillResult) => {
    const parts: string[] = [];
    parts.push(`${result.casterName} 使用 ${result.skillName}`);
    
    if (result.elementRelation === 'strong') {
      parts.push(`🔥 克制! x${result.elementMultiplier.toFixed(1)}`);
    } else if (result.elementRelation === 'weak') {
      parts.push(`💧 被克! x${result.elementMultiplier.toFixed(1)}`);
    }
    
    if (result.isCritical) {
      parts.push(`💥 暴击! x${result.criticalMultiplier.toFixed(1)}`);
    }
    
    parts.push(`对 ${result.targetNames.join(', ')} 造成 ${result.finalDamage} 点伤害`);
    
    if (result.kills.length > 0) {
      parts.push(`💀 击杀!`);
    }
    
    return parts.join(' | ');
  };

  const handleSelectSkill = (skillId: string) => {
    if (!battleState || !battleState.isPlayerTurn || isAnimating) return;
    const updated = selectSkill(battleState, skillId);
    setBattleState(updated);
  };

  const handleSelectTarget = (targetId: string) => {
    if (!battleState || !battleState.selectedSkillId || !battleState.isPlayerTurn || isAnimating) return;
    if (!battleState.targetableUnitIds.includes(targetId)) return;

    setIsAnimating(true);
    
    const teamBonuses = teamEvaluation?.bonuses || [];
    const result = executeSkill(battleState, targetId, teamBonuses);
    
    if (result) {
      setBattleState(result.newState);
      addLog(`👤 ${formatSkillResult(result.result)}`);
      
      setTimeout(() => {
        const afterTurn = nextTurn(result.newState);
        handleAfterTurn(afterTurn, teamBonuses);
      }, 500);
    }
  };

  const handleAfterTurn = (newState: BattleState, teamBonuses: TeamCompBonus[]) => {
    setBattleState(newState);
    
    if (newState.status === 'victory' || newState.status === 'defeat') {
      handleBattleEnd(newState);
      return;
    }
    
    const currentUnit = getCurrentUnit(newState);
    if (currentUnit) {
      addLog(`${currentUnit.isPlayer ? '👤' : '👹'} ${currentUnit.name} 准备行动`);
      
      if (!currentUnit.isPlayer && !newState.isPlayerTurn) {
        setTimeout(() => {
          executeAI(newState, teamBonuses);
        }, 800);
      } else {
        setIsAnimating(false);
      }
    } else {
      setIsAnimating(false);
    }
  };

  const executeAI = (state: BattleState, teamBonuses: TeamCompBonus[]) => {
    const result = executeAITurn(state, teamBonuses);
    
    if (result) {
      setBattleState(result.newState);
      addLog(`👹 ${formatSkillResult(result.result)}`);
      
      setTimeout(() => {
        const afterTurn = nextTurn(result.newState);
        handleAfterTurn(afterTurn, teamBonuses);
      }, 500);
    } else {
      const afterTurn = nextTurn(state);
      handleAfterTurn(afterTurn, teamBonuses);
    }
  };

  const handleNextWave = () => {
    if (!battleState || !selectedDungeon) return;
    
    const nextWaveNum = battleState.currentWave + 1;
    if (nextWaveNum > battleState.totalWaves) {
      handleBattleEnd({ ...battleState, status: 'victory' });
      return;
    }
    
    const waveConfig = waveConfigs[nextWaveNum - 1];
    const newEnemies = generateWaveEnemies(waveConfig, selectedDungeon.level);
    
    const updatedState: BattleState = {
      ...battleState,
      currentWave: nextWaveNum,
      enemyUnits: newEnemies,
      selectedSkillId: null,
      targetableUnitIds: [],
      turnCount: 0,
      currentUnitIndex: 0,
      isPlayerTurn: true,
    };
    
    setBattleState(updatedState);
    addLog(`🌊 第 ${nextWaveNum} 波敌人出现！`);
    
    setTimeout(() => {
      const started = startBattle(updatedState);
      setBattleState(started);
      const firstUnit = getCurrentUnit(started);
      if (firstUnit) {
        addLog(`${firstUnit.isPlayer ? '👤' : '👹'} ${firstUnit.name} 准备行动`);
        if (!firstUnit.isPlayer) {
          setTimeout(() => {
            executeAI(started, teamEvaluation?.bonuses || []);
          }, 800);
        }
      }
    }, 500);
  };

  const handleBattleEnd = (finalState: BattleState) => {
    if (!selectedDungeon) return;
    
    const assignedMentor = state.mentorState.mentors.find(m => m.assignedDungeon === selectedDungeon.id);
    let mentorBonus = undefined;
    
    if (assignedMentor) {
      const leadResult = canMentorLeadDungeon(assignedMentor, selectedDungeon.level);
      if (leadResult.canLead) {
        mentorBonus = leadResult.bonuses;
      }
    }
    
    const settlementResult = calculateBattleSettlement(
      finalState,
      selectedDungeon,
      teamEvaluation?.bonuses || [],
      mentorBonus,
      !selectedDungeon.firstCleared
    );
    
    setSettlement(settlementResult);
    setIsAnimating(false);
    
    if (settlementResult.victory && settlementResult.stars > 0) {
      dispatch({
        type: 'COMPLETE_DUNGEON',
        dungeonId: selectedDungeon.id,
        stars: settlementResult.stars,
        survivingMembers: settlementResult.survivingMembers,
        totalMembers: settlementResult.totalMembers,
        averageHpPercent: settlementResult.averageHpPercent,
        totalTurns: settlementResult.totalTurns,
        team: selectedTeam,
        studentHpMap: finalState.playerUnits.reduce((acc, u) => {
          acc[u.id] = { current: u.currentHp, max: u.maxHp };
          return acc;
        }, {} as Record<string, { current: number; max: number }>),
      });
      
      if (settlementResult.stars === 3) {
        dispatch({ type: 'SAVE_BEST_TEAM', dungeonId: selectedDungeon.id, team: selectedTeam });
        dispatch({ type: 'UNLOCK_SWEEP', dungeonId: selectedDungeon.id });
      }
      
      const updatedStudents = applyBattleResultToStudents(state.students, finalState.playerUnits, settlementResult);
      updatedStudents.forEach(student => {
        dispatch({ type: 'UPDATE_STUDENT', student });
      });
      
      if (state.alchemy.unlocked) {
        dispatch({ type: 'ADD_DUNGEON_MATERIAL_DROPS', dungeonId: selectedDungeon.id, stars: settlementResult.stars });
      }
      
      if (state.autoSaveConfig.saveOnCriticalAction) {
        autoSaveIfEnabled();
      }
    }
    
    addLog(settlementResult.victory ? '🎉 战斗胜利！' : '💔 战斗失败...');
    setViewMode('settlement');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedDungeon(null);
    setSelectedTeam([]);
    setBattleState(null);
    setWaveConfigs([]);
    setTeamEvaluation(null);
    setSettlement(null);
    setBattleLog([]);
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
    if (state.alchemy.unlocked) {
      dispatch({ type: 'ADD_DUNGEON_MATERIAL_DROPS', dungeonId, stars: 3 });
    }
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

  const renderDungeonList = () => (
    <div className="module dungeon-module">
      <h2>⚔️ 试炼副本</h2>
      
      <div className="dungeon-info-bar">
        <div className="dungeon-stats">
          <span>📊 总通关次数: {state.dungeons.reduce((acc, d) => acc + d.clearedCount, 0)}</span>
          <span>⭐ 最高星级: {state.dungeons.reduce((acc, d) => acc + d.bestStars, 0)}/{state.dungeons.length * 3}</span>
        </div>
      </div>

      <div className="element-cheat-sheet">
        <h4>📖 元素克制关系</h4>
        <div className="element-relations">
          {(['fire', 'water', 'earth', 'wind', 'light', 'dark'] as MagicType[]).map(element => (
            <div key={element} className="element-relation-item">
              <span className="element-icon" style={{ color: ELEMENT_COLORS[element] }}>
                {ELEMENT_ICONS[element]} {ELEMENT_NAMES[element]}
              </span>
              <span className="element-strong">克制: {getStrongAgainst(element).map(e => ELEMENT_NAMES[e]).join(', ')}</span>
              <span className="element-weak">被克: {getWeakAgainst(element).map(e => ELEMENT_NAMES[e]).join(', ')}</span>
            </div>
          ))}
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
          const sweepCheck = canSweepDungeon(dungeon);

          return (
            <div key={dungeon.id} className="dungeon-card">
              <div className="dungeon-header">
                <h3>{dungeon.name}</h3>
                <span className="dungeon-level">Lv.{dungeon.level}</span>
              </div>
              
              <div className="dungeon-stars">
                {renderStars(dungeon.bestStars)}
              </div>
              
              <div className="dungeon-info">
                <p><span>🌊 波次:</span> {dungeon.waves} 波</p>
                <p><span>⚡ 体力消耗:</span> {dungeon.staminaCost}</p>
                <p><span>📋 等级要求:</span> Lv.{dungeon.requiredLevel}</p>
                <p><span>👥 可出战:</span> {battleReadyCount}/{eligibleCount} 人</p>
              </div>
              
              <div className="dungeon-rewards">
                <h4>🎁 通关奖励</h4>
                <div className="reward-items">
                  <span>💰 {dungeon.rewards.gold}</span>
                  <span>🔮 {dungeon.rewards.mana}</span>
                  <span>🍖 {dungeon.rewards.food}</span>
                  <span>⭐ {dungeon.rewards.reputation}</span>
                </div>
                {dungeon.firstCleared === false && (
                  <div className="first-clear-bonus">
                    <span className="bonus-label">🎊 首通奖励翻倍!</span>
                  </div>
                )}
              </div>

              <div className="dungeon-star-reqs">
                <h4>⭐ 星级要求</h4>
                <p>⭐⭐⭐ {dungeon.starRequirements.threeStar}</p>
                <p>⭐⭐ {dungeon.starRequirements.twoStar}</p>
                <p>⭐ {dungeon.starRequirements.oneStar}</p>
              </div>
              
              <div className="dungeon-actions">
                <button
                  className={`challenge-btn ${!canChallenge ? 'disabled' : ''}`}
                  onClick={() => canChallenge && handleSelectDungeon(dungeon)}
                  disabled={!canChallenge}
                >
                  ⚔️ 挑战
                </button>
                {sweepable && hasBestTeam && (
                  <button
                    className={`sweep-btn ${!sweepCheck.ok ? 'disabled' : ''}`}
                    onClick={() => sweepCheck.ok && handleSweepWithConfirm(dungeon.id)}
                    disabled={!sweepCheck.ok}
                    title={sweepCheck.reason}
                  >
                    🔄 扫荡
                  </button>
                )}
              </div>
              
              {!canChallenge && (
                <div className="dungeon-warning">
                  {battleReadyCount === 0 ? '暂无符合条件的出战学员' : `需要至少1名可出战学员 (当前: ${battleReadyCount})`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTeamSelect = () => {
    if (!selectedDungeon) return null;
    
    const availableStudents = state.students.filter(s => 
      s.level >= selectedDungeon.requiredLevel && 
      s.status === 'idle' && 
      s.stamina >= selectedDungeon.staminaCost &&
      s.morale >= 15 &&
      isStudentBattleReady(s).ok
    );

    return (
      <div className="module team-select-module">
        <div className="module-header">
          <button className="back-btn" onClick={handleBackToList}>← 返回</button>
          <h2>🎯 布阵 - {selectedDungeon.name}</h2>
        </div>

        <div className="team-select-content">
          <div className="selected-team-section">
            <h3>📋 已选队伍 ({selectedTeam.length}/4)</h3>
            <div className="selected-team-grid">
              {selectedTeam.map((studentId, index) => {
                const student = state.students.find(s => s.id === studentId);
                if (!student) return null;
                return (
                  <div 
                    key={studentId} 
                    className="team-slot selected"
                    style={{ borderColor: ELEMENT_COLORS[student.magicType] }}
                    onClick={() => handleToggleTeamMember(studentId)}
                  >
                    <span className="slot-position">{index + 1}</span>
                    <div className="student-avatar" style={{ backgroundColor: ELEMENT_COLORS[student.magicType] + '30' }}>
                      <span className="element-badge">{ELEMENT_ICONS[student.magicType]}</span>
                    </div>
                    <div className="student-info">
                      <span className="student-name">{student.name}</span>
                      <span className="student-level">Lv.{student.level}</span>
                    </div>
                    <div className="student-hp">
                      <div className="hp-bar">
                        <div 
                          className="hp-fill" 
                          style={{ 
                            width: `${(student.currentHp / student.maxHp) * 100}%`,
                            backgroundColor: student.currentHp / student.maxHp > 0.5 ? '#4CAF50' : '#f44336'
                          }}
                        />
                      </div>
                      <span className="hp-text">{student.currentHp}/{student.maxHp}</span>
                    </div>
                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleToggleTeamMember(studentId); }}>✕</button>
                  </div>
                );
              })}
              {Array.from({ length: 4 - selectedTeam.length }).map((_, i) => (
                <div key={`empty-${i}`} className="team-slot empty">
                  <span className="slot-position">{selectedTeam.length + i + 1}</span>
                  <div className="empty-slot-icon">+</div>
                  <span className="empty-slot-text">请选择学员</span>
                </div>
              ))}
            </div>
          </div>

          {teamEvaluation && (
            <div className="team-evaluation-section">
              <div className="evaluation-header">
                <h3>📊 队伍评价</h3>
                <span className="grade-badge" style={{ color: getGradeColor(teamEvaluation.grade) }}>
                  {teamEvaluation.grade} 级
                </span>
              </div>
              <div className="evaluation-score">
                <span className="score-label">综合评分:</span>
                <span className="score-value">{teamEvaluation.score}</span>
              </div>
              
              {teamEvaluation.bonuses.length > 0 && (
                <div className="team-bonuses">
                  <h4>✨ 激活加成</h4>
                  <div className="bonus-list">
                    {teamEvaluation.bonuses.map((bonus, idx) => (
                      <div key={idx} className="bonus-item">
                        <span className="bonus-icon">{bonus.icon}</span>
                        <div className="bonus-info">
                          <span className="bonus-name">{bonus.name}</span>
                          <span className="bonus-desc">{bonus.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {teamEvaluation.strengths.length > 0 && (
                <div className="team-strengths">
                  <h4>💪 克制元素: {teamEvaluation.strengths.map(e => ELEMENT_NAMES[e]).join(', ')}</h4>
                </div>
              )}

              {teamEvaluation.weaknesses.length > 0 && (
                <div className="team-weaknesses">
                  <h4>⚠️ 被克元素: {teamEvaluation.weaknesses.map(e => ELEMENT_NAMES[e]).join(', ')}</h4>
                </div>
              )}

              {teamEvaluation.recommendations.length > 0 && (
                <div className="team-recommendations">
                  <h4>💡 建议</h4>
                  <ul>
                    {teamEvaluation.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="available-students-section">
            <h3>👥 可选学员 ({availableStudents.length})</h3>
            <div className="students-grid">
              {availableStudents.map(student => {
                const isSelected = selectedTeam.includes(student.id);
                const battleReady = isStudentBattleReady(student);
                return (
                  <div
                    key={student.id}
                    className={`student-card ${isSelected ? 'selected' : ''} ${!battleReady.ok ? 'unavailable' : ''}`}
                    style={{ borderColor: isSelected ? ELEMENT_COLORS[student.magicType] : undefined }}
                    onClick={() => battleReady.ok && handleToggleTeamMember(student.id)}
                    onDoubleClick={() => onStudentClick && onStudentClick(student.id)}
                  >
                    <div className="student-card-header">
                      <span 
                        className="element-icon-large"
                        style={{ color: ELEMENT_COLORS[student.magicType] }}
                      >
                        {ELEMENT_ICONS[student.magicType]}
                      </span>
                      <div className="student-basic-info">
                        <span className="student-name">{student.name}</span>
                        <span className="student-quality" style={{ 
                          color: student.quality === 'legendary' ? '#FF9800' : 
                                 student.quality === 'epic' ? '#9C27B0' : 
                                 student.quality === 'rare' ? '#2196F3' : '#9E9E9E' 
                        }}>
                          {student.quality === 'legendary' ? '传说' : 
                           student.quality === 'epic' ? '史诗' : 
                           student.quality === 'rare' ? '稀有' : '普通'}
                        </span>
                      </div>
                      <span className="student-level-badge">Lv.{student.level}</span>
                    </div>
                    
                    <div className="student-stats">
                      <div className="stat-row">
                        <span>❤️ HP</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill hp" 
                            style={{ width: `${(student.currentHp / student.maxHp) * 100}%` }}
                          />
                        </div>
                        <span>{student.currentHp}/{student.maxHp}</span>
                      </div>
                      <div className="stat-row">
                        <span>⚡ 体力</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill stamina" 
                            style={{ width: `${student.stamina}%` }}
                          />
                        </div>
                        <span>{student.stamina}</span>
                      </div>
                    </div>

                    <div className="student-skills">
                      {student.skills.slice(0, 2).map(skill => (
                        <span key={skill.id} className="skill-tag">
                          {skill.name} ({skill.damage})
                        </span>
                      ))}
                    </div>

                    {!battleReady.ok && (
                      <div className="unavailable-reason">{battleReady.reason}</div>
                    )}
                    {isSelected && <div className="selected-indicator">✓ 已选</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="team-actions">
            <button className="cancel-btn" onClick={handleBackToList}>取消</button>
            <button
              className={`start-battle-btn ${selectedTeam.length === 0 ? 'disabled' : ''}`}
              onClick={handleStartBattle}
              disabled={selectedTeam.length === 0}
            >
              ⚔️ 开始战斗
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBattle = () => {
    if (!battleState || !selectedDungeon) return null;
    
    const currentUnit = getCurrentUnit(battleState);
    const aliveEnemyUnits = battleState.enemyUnits.filter(u => u.currentHp > 0);

    const renderHpBar = (unit: { currentHp: number; maxHp: number }) => {
      const percent = Math.max(0, (unit.currentHp / unit.maxHp) * 100);
      const color = percent > 50 ? '#4CAF50' : percent > 25 ? '#FFC107' : '#f44336';
      return (
        <div className="battle-hp-bar">
          <div 
            className="battle-hp-fill" 
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
          <span className="battle-hp-text">{unit.currentHp}/{unit.maxHp}</span>
        </div>
      );
    };

    const renderUnit = (unit: typeof battleState.playerUnits[0], isPlayer: boolean) => {
      const isTargetable = battleState.targetableUnitIds.includes(unit.id);
      const isCurrentUnit = currentUnit?.id === unit.id;
      const isDead = unit.currentHp <= 0;
      const elementAdvantage = currentUnit && !isPlayer ? getElementAdvantage(currentUnit.magicType, unit.magicType) : null;

      return (
        <div
          key={unit.id}
          className={`battle-unit ${isPlayer ? 'player' : 'enemy'} ${isDead ? 'dead' : ''} ${isTargetable ? 'targetable' : ''} ${isCurrentUnit ? 'current-turn' : ''}`}
          style={{ borderColor: ELEMENT_COLORS[unit.magicType] }}
          onClick={() => isTargetable && handleSelectTarget(unit.id)}
        >
          <div className="unit-element-badge" style={{ backgroundColor: ELEMENT_COLORS[unit.magicType] }}>
            {ELEMENT_ICONS[unit.magicType]}
          </div>
          
          {unit.isBoss && <div className="boss-badge">BOSS</div>}
          
          {elementAdvantage === 'strong' && <div className="advantage-badge strong">🔥克制</div>}
          {elementAdvantage === 'weak' && <div className="advantage-badge weak">💧被克</div>}
          
          <div className="unit-info">
            <span className="unit-name">{unit.name}</span>
            <span className="unit-level">Lv.{unit.level}</span>
          </div>
          
          {renderHpBar(unit)}
          
          <div className="unit-stats">
            <span>⚔️{unit.attack}</span>
            <span>🛡️{unit.defense}</span>
            <span>💨{unit.speed}</span>
          </div>

          {isDead && <div className="death-overlay">💀</div>}
        </div>
      );
    };

    return (
      <div className="module battle-module">
        <div className="battle-header">
          <div className="battle-info">
            <h2>⚔️ {selectedDungeon.name}</h2>
            <span className="wave-info">🌊 波次: {battleState.currentWave}/{battleState.totalWaves}</span>
            <span className="turn-info">⏱️ 回合: {battleState.turnCount}</span>
          </div>
        </div>

        {battleState.status === 'preparing' ? (
          <div className="battle-preparing">
            <h3>🎯 准备战斗</h3>
            <div className="preparing-team">
              <h4>我方阵容</h4>
              <div className="preparing-units">
                {battleState.playerUnits.map(unit => (
                  <div key={unit.id} className="preparing-unit" style={{ borderColor: ELEMENT_COLORS[unit.magicType] }}>
                    <span className="element-icon" style={{ color: ELEMENT_COLORS[unit.magicType] }}>
                      {ELEMENT_ICONS[unit.magicType]}
                    </span>
                    <span>{unit.name}</span>
                    <span>Lv.{unit.level}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="preparing-enemies">
              <h4>敌方阵容</h4>
              <div className="preparing-units">
                {battleState.enemyUnits.map(unit => (
                  <div key={unit.id} className="preparing-unit enemy" style={{ borderColor: ELEMENT_COLORS[unit.magicType] }}>
                    <span className="element-icon" style={{ color: ELEMENT_COLORS[unit.magicType] }}>
                      {ELEMENT_ICONS[unit.magicType]}
                    </span>
                    <span>{unit.name}</span>
                    <span>Lv.{unit.level}</span>
                    {unit.isBoss && <span className="boss-tag">BOSS</span>}
                  </div>
                ))}
              </div>
            </div>
            <button className="begin-battle-btn" onClick={handleBeginBattle}>
              ⚔️ 开始战斗
            </button>
          </div>
        ) : (
          <>
            <div className="battle-arena">
              <div className="enemy-side">
                <h4>👹 敌方</h4>
                <div className="units-row">
                  {battleState.enemyUnits.map(unit => renderUnit(unit, false))}
                </div>
              </div>

              <div className="battle-divider">
                <span className="vs-text">VS</span>
              </div>

              <div className="player-side">
                <h4>👤 我方</h4>
                <div className="units-row">
                  {battleState.playerUnits.map(unit => renderUnit(unit, true))}
                </div>
              </div>
            </div>

            {battleState.isPlayerTurn && currentUnit?.isPlayer && !isAnimating && (
              <div className="skill-panel">
                <h4>🎯 {currentUnit.name} 的回合 - 选择技能</h4>
                <div className="skill-buttons">
                  {currentUnit.skills.map(skill => (
                    <button
                      key={skill.id}
                      className={`skill-btn ${battleState.selectedSkillId === skill.id ? 'selected' : ''}`}
                      style={{ borderColor: ELEMENT_COLORS[skill.type] }}
                      onClick={() => handleSelectSkill(skill.id)}
                      disabled={isAnimating}
                    >
                      <span className="skill-element" style={{ color: ELEMENT_COLORS[skill.type] }}>
                        {ELEMENT_ICONS[skill.type]}
                      </span>
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-damage">⚔️ {skill.damage}</span>
                    </button>
                  ))}
                </div>
                {battleState.selectedSkillId && (
                  <div className="target-hint">
                    💡 请点击要攻击的目标
                  </div>
                )}
              </div>
            )}

            {!battleState.isPlayerTurn && (
              <div className="enemy-turn-indicator">
                👹 敌方回合...
              </div>
            )}

            <div className="battle-log">
              <h4>📜 战斗记录</h4>
              <div className="log-content">
                {battleLog.map((log, idx) => (
                  <div key={idx} className="log-entry">{log}</div>
                ))}
              </div>
            </div>

            {battleState.status === 'victory' && aliveEnemyUnits.length === 0 && (
              <div className="battle-victory">
                {battleState.currentWave < battleState.totalWaves ? (
                  <button className="next-wave-btn" onClick={handleNextWave}>
                    🌊 进入下一波
                  </button>
                ) : (
                  <div className="battle-complete">
                    <h3>🎉 全部波次完成!</h3>
                    <button className="show-settlement-btn" onClick={() => handleBattleEnd(battleState)}>
                      查看结算
                    </button>
                  </div>
                )}
              </div>
            )}

            {battleState.status === 'defeat' && (
              <div className="battle-defeat">
                <h3>💔 战斗失败</h3>
                <button className="show-settlement-btn" onClick={() => handleBattleEnd(battleState)}>
                  查看结算
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderSettlement = () => {
    if (!settlement || !selectedDungeon) return null;

    return (
      <div className="module settlement-module">
        <div className="settlement-header">
          <h2>{settlement.victory ? '🎉 战斗胜利!' : '💔 战斗失败'}</h2>
          <div className="settlement-stars">
            {renderStars(settlement.stars)}
          </div>
        </div>

        <div className="settlement-content">
          <div className="settlement-section">
            <h3>📊 战斗统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">总回合</span>
                <span className="stat-value">{settlement.totalTurns}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">完成波次</span>
                <span className="stat-value">{settlement.wavesCompleted}/{settlement.totalMembers > 0 ? battleState?.totalWaves || 0 : 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">存活成员</span>
                <span className="stat-value">{settlement.survivingMembers}/{settlement.totalMembers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">平均HP</span>
                <span className="stat-value">{Math.round(settlement.averageHpPercent * 100)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">总伤害</span>
                <span className="stat-value">{settlement.totalDamageDealt}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">承受伤害</span>
                <span className="stat-value">{settlement.totalDamageTaken}</span>
              </div>
              {settlement.mostValuablePlayer && (
                <div className="stat-item mvp">
                  <span className="stat-label">🏆 MVP</span>
                  <span className="stat-value">{settlement.mostValuablePlayer}</span>
                </div>
              )}
            </div>
          </div>

          <div className="settlement-section">
            <h3>🎁 获得奖励</h3>
            <div className="rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">💰</span>
                <span className="reward-name">金币</span>
                <span className="reward-value">{settlement.rewards.gold}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🔮</span>
                <span className="reward-name">魔力</span>
                <span className="reward-value">{settlement.rewards.mana}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🍖</span>
                <span className="reward-name">食物</span>
                <span className="reward-value">{settlement.rewards.food}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">⭐</span>
                <span className="reward-name">声望</span>
                <span className="reward-value">{settlement.rewards.reputation}</span>
              </div>
              <div className="reward-item exp">
                <span className="reward-icon">✨</span>
                <span className="reward-name">总经验</span>
                <span className="reward-value">{settlement.rewards.exp}</span>
              </div>
            </div>
          </div>

          <div className="settlement-section">
            <h3>📈 经验分配</h3>
            <div className="exp-distribution">
              {Object.entries(settlement.rewards.expPerStudent).map(([studentId, exp]) => {
                const student = state.students.find(s => s.id === studentId);
                const unit = battleState?.playerUnits.find(u => u.id === studentId);
                return (
                  <div key={studentId} className="exp-item">
                    <span className="student-name">{student?.name || '未知'}</span>
                    <span className="exp-gain">+{exp} EXP</span>
                    {unit && unit.currentHp <= 0 && <span className="dead-tag">💀</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="settlement-section">
            <h3>🔮 元素伤害统计</h3>
            <div className="element-damage">
              {(['fire', 'water', 'earth', 'wind', 'light', 'dark'] as MagicType[]).map(element => {
                const data = settlement.elementBreakdown[element];
                if (data.damage === 0 && data.kills === 0) return null;
                return (
                  <div key={element} className="element-damage-item">
                    <span className="element-icon" style={{ color: ELEMENT_COLORS[element] }}>
                      {ELEMENT_ICONS[element]} {ELEMENT_NAMES[element]}
                    </span>
                    <div className="damage-bar-container">
                      <div 
                        className="damage-bar" 
                        style={{ 
                          width: `${Math.min(100, (data.damage / Math.max(1, settlement.totalDamageDealt)) * 100)}%`,
                          backgroundColor: ELEMENT_COLORS[element]
                        }}
                      />
                    </div>
                    <span className="damage-value">{data.damage}</span>
                    <span className="kill-count">💀 {data.kills}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="settlement-actions">
          <button className="continue-btn" onClick={handleBackToList}>
            返回副本列表
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewMode === 'list' && renderDungeonList()}
      {viewMode === 'teamSelect' && renderTeamSelect()}
      {viewMode === 'battle' && renderBattle()}
      {viewMode === 'settlement' && renderSettlement()}
    </>
  );
}
