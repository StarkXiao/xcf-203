import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { ClassId, SkillTreeNodeEffect, StudentQuality } from '../types/game';
import {
  CLASS_DEFINITIONS,
  CLASS_TRANSFER_NAMES,
  CLASS_TRANSFER_ICONS,
  SPECIALIZATION_NAMES,
  SPECIALIZATION_ICONS,
  getClassDefinition,
  canTransferToClass,
  canUnlockSkillNode,
  canUnlockSpecialization,
  calculateClassExpToLevel,
  calculateClassStatBonuses,
} from '../data/gameData';
import './ClassTransferPanel.css';

type ClassTransferSubTab = 'overview' | 'transfer' | 'skillTree' | 'specialization';

const EFFECT_DISPLAY: Record<string, { icon: string; label: string; isPercent: boolean }> = {
  attack_bonus: { icon: '⚔', label: '攻击', isPercent: true },
  defense_bonus: { icon: '🛡', label: '防御', isPercent: true },
  hp_bonus: { icon: '❤', label: '生命', isPercent: true },
  speed_bonus: { icon: '💨', label: '速度', isPercent: true },
  crit_chance: { icon: '💥', label: '暴击率', isPercent: true },
  crit_damage: { icon: '🔥', label: '暴击伤害', isPercent: true },
  skill_damage_bonus: { icon: '🎯', label: '技能伤害', isPercent: true },
  exp_bonus: { icon: '📈', label: '经验', isPercent: true },
  dungeon_bonus: { icon: '🏛️', label: '副本加成', isPercent: true },
  course_speed_bonus: { icon: '⚡', label: '课程速度', isPercent: true },
  special_skill: { icon: '✨', label: '特殊技能', isPercent: false },
};

const getEffectDisplay = (effect: SkillTreeNodeEffect): { icon: string; label: string; value: string } => {
  const display = EFFECT_DISPLAY[effect.type] || { icon: '✨', label: effect.type, isPercent: true };
  const valueStr = display.isPercent ? `${(effect.value * 100).toFixed(0)}%` : `${effect.value}`;
  return { icon: display.icon, label: display.label, value: valueStr };
};

const qualityOrder: Record<StudentQuality, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

export default function ClassTransferPanel() {
  const {
    state,
    unlockClassTransfer,
    transferClass,
    unlockSkillNode,
    unlockSpecializationBranch,
    addSpecializationPoint,
  } = useGame();

  const [subTab, setSubTab] = useState<ClassTransferSubTab>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<ClassId | null>(null);

  const classTransfer = state.classTransfer;

  if (!classTransfer.unlocked) {
    const hasLevel = state.day >= 10;
    const hasReputation = state.resources.reputation >= 50;
    const hasStudents = state.students.length >= 3;

    return (
      <div className="ct-module">
        <div className="ct-locked">
          <div className="ct-locked-icon">⚔️</div>
          <h2>学员转职</h2>
          <p className="ct-locked-desc">
            当学员修炼到一定程度，便可通过转职觉醒更强大的力量。
            选择适合的职业道路，解锁专属技能与专精分支，让学员的成长突破极限。
          </p>
          <div className="ct-unlock-reqs">
            <div className={`ct-req-item ${hasLevel ? 'met' : 'unmet'}`}>
              <span className="req-icon">{hasLevel ? '✅' : '❌'}</span>
              <span>学院运行 ≥ 10天 (当前: {state.day}天)</span>
            </div>
            <div className={`ct-req-item ${hasReputation ? 'met' : 'unmet'}`}>
              <span className="req-icon">{hasReputation ? '✅' : '❌'}</span>
              <span>学院声望 ≥ 50 (当前: {state.resources.reputation})</span>
            </div>
            <div className={`ct-req-item ${hasStudents ? 'met' : 'unmet'}`}>
              <span className="req-icon">{hasStudents ? '✅' : '❌'}</span>
              <span>拥有 ≥ 3名学员 (当前: {state.students.length}名)</span>
            </div>
          </div>
          {hasLevel && hasReputation && hasStudents && (
            <button className="ct-unlock-btn" onClick={unlockClassTransfer}>
              🔓 开启转职体系
            </button>
          )}
        </div>
      </div>
    );
  }

  const transferredStudents = state.students.filter(
    s => classTransfer.studentClasses[s.id]?.classId
  );
  const untransferredStudents = state.students.filter(
    s => !classTransfer.studentClasses[s.id]?.classId
  );

  const selectedStudent = state.students.find(s => s.id === selectedStudentId);
  const selectedClassState = selectedStudentId
    ? classTransfer.studentClasses[selectedStudentId]
    : null;

  const subTabs: { id: ClassTransferSubTab; label: string; icon: string }[] = [
    { id: 'overview', label: '转职总览', icon: '📊' },
    { id: 'transfer', label: '转职选择', icon: '⚔️' },
    { id: 'skillTree', label: '技能树', icon: '🌳' },
    { id: 'specialization', label: '专精分支', icon: '⚡' },
  ];

  const renderOverview = () => (
    <div className="ct-overview">
      <div className="ct-stats-grid">
        <div className="ct-stat-card">
          <div className="ct-stat-icon">⚔️</div>
          <div className="ct-stat-value">{classTransfer.totalTransfers}</div>
          <div className="ct-stat-label">累计转职</div>
        </div>
        <div className="ct-stat-card">
          <div className="ct-stat-icon">🎓</div>
          <div className="ct-stat-value">{transferredStudents.length}</div>
          <div className="ct-stat-label">已转职学员</div>
        </div>
        <div className="ct-stat-card">
          <div className="ct-stat-icon">📈</div>
          <div className="ct-stat-value">Lv.{classTransfer.highestClassLevel}</div>
          <div className="ct-stat-label">最高职业等级</div>
        </div>
      </div>

      {transferredStudents.length > 0 && (
        <div className="ct-student-list">
          <h3>已转职学员</h3>
          <div className="ct-student-grid">
            {transferredStudents.map(student => {
              const cs = classTransfer.studentClasses[student.id];
              if (!cs?.classId) return null;
              const classDef = getClassDefinition(cs.classId);
              return (
                <div
                  key={student.id}
                  className={`ct-student-card ${selectedStudentId === student.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <div className="ct-student-class-icon">{CLASS_TRANSFER_ICONS[cs.classId]}</div>
                  <div className="ct-student-info">
                    <div className="ct-student-name">{student.name}</div>
                    <div className="ct-student-class">{CLASS_TRANSFER_NAMES[cs.classId]} Lv.{cs.classLevel}</div>
                    <div className="ct-student-exp-bar">
                      <div
                        className="ct-student-exp-fill"
                        style={{
                          width: `${Math.min(100, (cs.classExp / calculateClassExpToLevel(cs.classLevel)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="ct-student-details">
                      <span>技能点: {cs.skillPoints}</span>
                      {cs.specializationId && (
                        <span>专精: {SPECIALIZATION_NAMES[cs.specializationId]}</span>
                      )}
                    </div>
                  </div>
                  {classDef && (() => {
                    const bonuses = calculateClassStatBonuses(classDef, cs);
                    return (
                      <div className="ct-student-bonuses">
                        <span className="bonus-atk">⚔+{bonuses.attack}</span>
                        <span className="bonus-def">🛡+{bonuses.defense}</span>
                        <span className="bonus-hp">❤+{bonuses.hp}</span>
                        <span className="bonus-spd">💨+{bonuses.speed}</span>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {untransferredStudents.length > 0 && (
        <div className="ct-student-list">
          <h3>未转职学员</h3>
          <div className="ct-student-grid">
            {untransferredStudents.map(student => (
              <div
                key={student.id}
                className={`ct-student-card untransferred ${selectedStudentId === student.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setSubTab('transfer');
                }}
              >
                <div className="ct-student-class-icon">❓</div>
                <div className="ct-student-info">
                  <div className="ct-student-name">{student.name}</div>
                  <div className="ct-student-class">Lv.{student.level} {student.magicType}</div>
                  <div className="ct-student-hint">点击选择职业</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTransfer = () => {
    const student = selectedStudent || untransferredStudents[0];
    if (!student) {
      return (
        <div className="ct-empty">
          <p>没有可转职的学员</p>
        </div>
      );
    }

    const studentClassState = classTransfer.studentClasses[student.id];
    if (studentClassState?.classId) {
      return (
        <div className="ct-already-transferred">
          <div className="ct-at-icon">{CLASS_TRANSFER_ICONS[studentClassState.classId]}</div>
          <h3>{student.name} 已转职为 {CLASS_TRANSFER_NAMES[studentClassState.classId]}</h3>
          <p>职业等级: Lv.{studentClassState.classLevel}</p>
          <p className="ct-at-note">每位学员只能转职一次，请谨慎选择</p>
        </div>
      );
    }

    const hasCourse = (courseId: string | null) =>
      courseId ? student.courseHistory.some(ch => ch.courseId === courseId) : true;
    const hasDungeon = (dungeonId: string | null) =>
      dungeonId ? student.dungeonHistory.some(dh => dh.dungeonId === dungeonId && dh.victory) : true;
    const hasMentor = (magicType: string | null) =>
      magicType ? state.mentorState.mentors.some(m => m.magicType === magicType) : true;

    return (
      <div className="ct-transfer">
        <div className="ct-transfer-student-select">
          <h3>选择学员</h3>
          <div className="ct-transfer-students">
            {untransferredStudents.map(s => (
              <div
                key={s.id}
                className={`ct-transfer-student ${student.id === s.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedStudentId(s.id);
                  setSelectedClassId(null);
                }}
              >
                <span className="ct-ts-name">{s.name}</span>
                <span className="ct-ts-level">Lv.{s.level}</span>
                <span className="ct-ts-quality">{s.quality}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ct-transfer-class-select">
          <h3>选择职业</h3>
          <div className="ct-class-grid">
            {CLASS_DEFINITIONS.map(classDef => {
              const { canTransfer, unmetRequirements } = canTransferToClass(
                classDef, student, state.mentorState.mentors, state.resources, false
              );
              const isSelected = selectedClassId === classDef.id;
              const req = classDef.requirements;
              const meetsLevel = student.level >= req.requiredLevel;
              const meetsQuality = qualityOrder[student.quality] >= qualityOrder[req.requiredQuality];
              const meetsCourse = hasCourse(req.requiredCourseId);
              const meetsDungeon = hasDungeon(req.requiredDungeonId);
              const meetsMentor = hasMentor(req.requiredMentorMagicType);

              return (
                <div
                  key={classDef.id}
                  className={`ct-class-card ${isSelected ? 'selected' : ''} ${canTransfer ? 'available' : 'locked'}`}
                  onClick={() => canTransfer && setSelectedClassId(classDef.id)}
                >
                  <div className="ct-class-header">
                    <span className="ct-class-icon">{CLASS_TRANSFER_ICONS[classDef.id]}</span>
                    <span className="ct-class-name">{classDef.name}</span>
                  </div>
                  <p className="ct-class-desc">{classDef.description}</p>
                  <div className="ct-class-reqs">
                    <div className={`ct-req-mini ${meetsLevel ? 'met' : 'unmet'}`}>
                      等级 ≥ {req.requiredLevel}
                    </div>
                    <div className={`ct-req-mini ${meetsQuality ? 'met' : 'unmet'}`}>
                      品质 ≥ {req.requiredQuality}
                    </div>
                    {req.requiredCourseId && (
                      <div className={`ct-req-mini ${meetsCourse ? 'met' : 'unmet'}`}>
                        课程: {req.requiredCourseId}
                      </div>
                    )}
                    {req.requiredDungeonId && (
                      <div className={`ct-req-mini ${meetsDungeon ? 'met' : 'unmet'}`}>
                        副本: {req.requiredDungeonId}
                      </div>
                    )}
                    {req.requiredMentorMagicType && (
                      <div className={`ct-req-mini ${meetsMentor ? 'met' : 'unmet'}`}>
                        导师: {req.requiredMentorMagicType}系
                      </div>
                    )}
                  </div>
                  {unmetRequirements.length > 0 && (
                    <div className="ct-unmet-list">
                      {unmetRequirements.map((req, i) => (
                        <div key={i} className="ct-unmet-item">❌ {req.description}: {req.current} / {req.required}</div>
                      ))}
                    </div>
                  )}
                  <div className="ct-class-cost">
                    <span>💰{req.cost.gold}</span>
                    <span>💎{req.cost.mana}</span>
                    <span>🍞{req.cost.food}</span>
                    <span>⭐{req.cost.reputation}</span>
                  </div>
                  <div className="ct-class-bonuses">
                    <span>⚔+{classDef.baseStatBonus.attack}</span>
                    <span>🛡+{classDef.baseStatBonus.defense}</span>
                    <span>❤+{classDef.baseStatBonus.hp}</span>
                    <span>💨+{classDef.baseStatBonus.speed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedClassId && (() => {
          const classDef = CLASS_DEFINITIONS.find(c => c.id === selectedClassId);
          if (!classDef) return null;
          const { canTransfer, unmetRequirements } = canTransferToClass(
            classDef, student, state.mentorState.mentors, state.resources, false
          );

          return (
            <div className="ct-transfer-confirm">
              <div className="ct-confirm-info">
                <span>{student.name}</span>
                <span className="ct-confirm-arrow">➡</span>
                <span>{CLASS_TRANSFER_ICONS[selectedClassId]} {CLASS_TRANSFER_NAMES[selectedClassId]}</span>
              </div>
              {canTransfer ? (
                <button
                  className="ct-confirm-btn"
                  onClick={() => {
                    transferClass(student.id, selectedClassId);
                    setSelectedClassId(null);
                    setSubTab('overview');
                  }}
                >
                  ⚔️ 确认转职
                </button>
              ) : (
                <div className="ct-cannot-transfer">
                  <p>不满足转职条件：</p>
                  {unmetRequirements.map((req, i) => (
                    <span key={i} className="ct-unmet-tag">❌ {req.description}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderSkillTree = () => {
    if (!selectedStudent || !selectedClassState?.classId) {
      return (
        <div className="ct-empty">
          <p>请先在总览中选择已转职的学员</p>
          {transferredStudents.length > 0 && (
            <div className="ct-quick-select">
              {transferredStudents.map(s => {
                const cs = classTransfer.studentClasses[s.id];
                return (
                  <button
                    key={s.id}
                    className="ct-quick-btn"
                    onClick={() => setSelectedStudentId(s.id)}
                  >
                    {CLASS_TRANSFER_ICONS[cs!.classId!]} {s.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const classDef = getClassDefinition(selectedClassState.classId);
    if (!classDef) return null;

    const skillTree = classDef.skillTree;
    const unlockedNodes = selectedClassState.unlockedNodes;

    const nodesByRow: Record<number, typeof skillTree> = {};
    skillTree.forEach(node => {
      if (!nodesByRow[node.row]) nodesByRow[node.row] = [];
      nodesByRow[node.row].push(node);
    });

    return (
      <div className="ct-skill-tree">
        <div className="ct-skill-header">
          <h3>{selectedStudent.name} - {CLASS_TRANSFER_NAMES[selectedClassState.classId]} 技能树</h3>
          <div className="ct-skill-points">
            可用技能点: <span className="ct-sp-value">{selectedClassState.skillPoints}</span>
          </div>
        </div>

        {Object.keys(nodesByRow).sort((a, b) => Number(a) - Number(b)).map(row => (
          <div key={row} className="ct-skill-row">
            <div className="ct-skill-row-label">第 {Number(row) + 1} 层</div>
            <div className="ct-skill-row-nodes">
              {nodesByRow[Number(row)].map(node => {
                const isUnlocked = unlockedNodes.includes(node.id);
                const { canUnlock } = canUnlockSkillNode(node.id, classDef, selectedClassState);
                const prereqsMet = node.prerequisites.every(p => unlockedNodes.includes(p));

                return (
                  <div
                    key={node.id}
                    className={`ct-skill-node ${isUnlocked ? 'unlocked' : canUnlock ? 'available' : 'locked'} ${node.isClassSpecific ? 'class-specific' : ''}`}
                    onClick={() => canUnlock && unlockSkillNode(selectedStudent!.id, node.id)}
                  >
                    <div className="ct-node-icon">{node.icon}</div>
                    <div className="ct-node-name">{node.name}</div>
                    <div className="ct-node-desc">{node.description}</div>
                    <div className="ct-node-cost">
                      {isUnlocked ? '✅ 已解锁' : `消耗: ${node.cost} 技能点`}
                    </div>
                    {!prereqsMet && !isUnlocked && (
                      <div className="ct-node-prereq">
                        需要: {node.prerequisites.map(p => skillTree.find(n => n.id === p)?.name).join(', ')}
                      </div>
                    )}
                    <div className="ct-node-effects">
                      {node.effects.map((effect, i) => {
                        const display = getEffectDisplay(effect);
                        return (
                          <span key={i} className="ct-effect-tag">
                            {display.icon} {display.label}+{display.value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSpecialization = () => {
    if (!selectedStudent || !selectedClassState?.classId) {
      return (
        <div className="ct-empty">
          <p>请先在总览中选择已转职的学员</p>
          {transferredStudents.length > 0 && (
            <div className="ct-quick-select">
              {transferredStudents.map(s => {
                const cs = classTransfer.studentClasses[s.id];
                return (
                  <button
                    key={s.id}
                    className="ct-quick-btn"
                    onClick={() => setSelectedStudentId(s.id)}
                  >
                    {CLASS_TRANSFER_ICONS[cs!.classId!]} {s.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const classDef = getClassDefinition(selectedClassState.classId);
    if (!classDef) return null;

    return (
      <div className="ct-specialization">
        <div className="ct-spec-header">
          <h3>{selectedStudent.name} - 专精分支</h3>
          <div className="ct-spec-info">
            <span>职业: {CLASS_TRANSFER_ICONS[selectedClassState.classId]} {CLASS_TRANSFER_NAMES[selectedClassState.classId]} Lv.{selectedClassState.classLevel}</span>
            <span>技能点: {selectedClassState.skillPoints}</span>
          </div>
        </div>

        <div className="ct-spec-branches">
          {classDef.specializations.map(branch => {
            const isActive = selectedClassState.specializationId === branch.id;
            const { canUnlock } = canUnlockSpecialization(branch.id, classDef, selectedClassState);
            const currentPoints = isActive ? selectedClassState.specializationPoints : 0;
            const canAddPoint = isActive && selectedClassState.skillPoints >= 1 && currentPoints < branch.maxPoints;
            const meetsLevel = selectedClassState.classLevel >= branch.requiredClassLevel;
            const meetsNodes = branch.requiredNodes.every(n => selectedClassState.unlockedNodes.includes(n));

            const bonusDisplay = getEffectDisplay(branch.bonusPerPoint);

            return (
              <div
                key={branch.id}
                className={`ct-spec-card ${isActive ? 'active' : canUnlock ? 'available' : 'locked'}`}
              >
                <div className="ct-spec-card-header">
                  <span className="ct-spec-icon">{SPECIALIZATION_ICONS[branch.id]}</span>
                  <span className="ct-spec-name">{SPECIALIZATION_NAMES[branch.id]}</span>
                  {isActive && <span className="ct-spec-badge">当前专精</span>}
                </div>
                <p className="ct-spec-desc">{branch.description}</p>
                <div className="ct-spec-reqs">
                  <span className={`ct-spec-req ${meetsLevel ? 'met' : 'unmet'}`}>
                    职业等级 ≥ {branch.requiredClassLevel}
                  </span>
                  <span className={`ct-spec-req ${selectedClassState.skillPoints >= branch.unlockCost ? 'met' : 'unmet'}`}>
                    技能点 ≥ {branch.unlockCost}
                  </span>
                  {branch.requiredNodes.length > 0 && (
                    <span className={`ct-spec-req ${meetsNodes ? 'met' : 'unmet'}`}>
                      需要技能: {branch.requiredNodes.map(n => classDef.skillTree.find(s => s.id === n)?.name).join(', ')}
                    </span>
                  )}
                </div>

                <div className="ct-spec-bonuses">
                  <h4>分支加成 (每点)</h4>
                  <div className="ct-spec-bonus">
                    <span>{bonusDisplay.icon} {bonusDisplay.label}</span>
                    <span>+{bonusDisplay.value}</span>
                  </div>
                </div>

                {isActive && (
                  <div className="ct-spec-progress">
                    <div className="ct-spec-progress-bar">
                      <div
                        className="ct-spec-progress-fill"
                        style={{ width: `${(currentPoints / branch.maxPoints) * 100}%` }}
                      />
                    </div>
                    <span className="ct-spec-progress-text">{currentPoints} / {branch.maxPoints}</span>
                  </div>
                )}

                {isActive && branch.maxPointsBonus && (
                  <div className="ct-spec-bonuses">
                    <h4>满级额外奖励</h4>
                    <div className="ct-spec-bonus">
                      <span>{getEffectDisplay(branch.maxPointsBonus).icon} {getEffectDisplay(branch.maxPointsBonus).label}</span>
                      <span>+{getEffectDisplay(branch.maxPointsBonus).value}</span>
                    </div>
                  </div>
                )}

                <div className="ct-spec-actions">
                  {!isActive && canUnlock && (
                    <button
                      className="ct-spec-unlock-btn"
                      onClick={() => unlockSpecializationBranch(selectedStudent!.id, branch.id)}
                    >
                      🔓 解锁专精 (消耗{branch.unlockCost}技能点)
                    </button>
                  )}
                  {isActive && canAddPoint && (
                    <button
                      className="ct-spec-add-btn"
                      onClick={() => addSpecializationPoint(selectedStudent!.id)}
                    >
                      ⬆️ 投入专精点
                    </button>
                  )}
                  {isActive && currentPoints >= branch.maxPoints && (
                    <span className="ct-spec-maxed">✅ 已满级</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedClassState.specializationId && (() => {
          const branch = classDef.specializations.find(b => b.id === selectedClassState.specializationId);
          if (!branch) return null;
          const currentPoints = selectedClassState.specializationPoints;

          const totalBonuses: { type: string; value: string; icon: string; label: string }[] = [];
          if (currentPoints > 0) {
            const baseEffect = { ...branch.bonusPerPoint, value: branch.bonusPerPoint.value * currentPoints };
            const display = getEffectDisplay(baseEffect);
            totalBonuses.push({ type: branch.bonusPerPoint.type, value: display.value, icon: display.icon, label: display.label });
          }
          if (currentPoints >= branch.maxPoints && branch.maxPointsBonus) {
            const display = getEffectDisplay(branch.maxPointsBonus);
            totalBonuses.push({ type: branch.maxPointsBonus.type, value: display.value, icon: display.icon, label: display.label });
          }

          if (totalBonuses.length === 0) return null;

          return (
            <div className="ct-spec-summary">
              <h4>当前专精通点加成汇总</h4>
              {totalBonuses.map((bonus, i) => (
                <span key={i} className="ct-spec-total-bonus">
                  {bonus.icon} {bonus.label}+{bonus.value}
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="ct-module">
      <div className="ct-tabs">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            className={`ct-tab ${subTab === tab.id ? 'active' : ''}`}
            onClick={() => setSubTab(tab.id)}
          >
            <span className="ct-tab-icon">{tab.icon}</span>
            <span className="ct-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ct-content">
        {subTab === 'overview' && renderOverview()}
        {subTab === 'transfer' && renderTransfer()}
        {subTab === 'skillTree' && renderSkillTree()}
        {subTab === 'specialization' && renderSpecialization()}
      </div>
    </div>
  );
}
