import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { KingdomCommission } from '../types/game';
import './KingdomCommissionPanel.css';

type CommissionTab = 'available' | 'active' | 'completed' | 'ranking';

export default function KingdomCommissionPanel() {
  const { state, unlockKingdomCommission, refreshAvailableCommissions, acceptCommission, abandonCommission, deliverCommissionResource, claimCommissionStageReward, claimCommissionReward, assignStudentToCommission, unassignStudentFromCommission, getCommissionRank, getNextCommissionRank, getMaxActiveCommissions, applyCommissionRewardBonus, COMMISSION_DIFFICULTY_NAMES, COMMISSION_DIFFICULTY_COLORS, COMMISSION_TYPE_NAMES, COMMISSION_TYPE_ICONS, COMMISSION_RANK_INFO } = useGame();
  const [activeTab, setActiveTab] = useState<CommissionTab>('available');
  const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);

  const kc = state.kingdomCommission;
  const currentRank = getCommissionRank(kc.rankPoints);
  const nextRank = getNextCommissionRank(kc.rankPoints);
  const maxActive = getMaxActiveCommissions(currentRank);

  if (!kc.unlocked) {
    return (
      <div className="kingdom-commission-panel">
        <div className="commission-unlock-prompt">
          <h2>🏰 王国委托系统</h2>
          <p className="unlock-description">
            完成王国发布的委托任务，获得丰厚奖励和声望！
            <br />
            委托类型包括：课程培养、队伍派遣、资源交付等多种形式。
          </p>
          <div className="unlock-requirements">
            <p>解锁条件：</p>
            <ul>
              <li>⭐ 声望达到 50 点</li>
              <li>🏫 学院等级达到 1 级</li>
            </ul>
          </div>
          <button
            className="unlock-button"
            onClick={unlockKingdomCommission}
            disabled={state.resources.reputation < 50}
          >
            {state.resources.reputation >= 50 ? '🔓 解锁王国委托' : '🔒 声望不足'}
          </button>
        </div>
      </div>
    );
  }

  const selectedCommission = [...kc.availableCommissions, ...kc.activeCommissions, ...kc.completedCommissions]
    .find(c => c.id === selectedCommissionId);

  const renderCommissionCard = (commission: KingdomCommission, isAvailable: boolean = false) => {
    const difficultyColor = COMMISSION_DIFFICULTY_COLORS[commission.difficulty];
    const typeIcon = COMMISSION_TYPE_ICONS[commission.type];
    const typeName = COMMISSION_TYPE_NAMES[commission.type];
    const difficultyName = COMMISSION_DIFFICULTY_NAMES[commission.difficulty];

    const progress = commission.stages.filter(s => s.completed).length / commission.totalStages;

    return (
      <div
        key={commission.id}
        className={`commission-card ${selectedCommissionId === commission.id ? 'selected' : ''}`}
        style={{ borderLeftColor: difficultyColor }}
        onClick={() => setSelectedCommissionId(commission.id)}
      >
        <div className="commission-card-header">
          <div className="commission-type-icon">{typeIcon}</div>
          <div className="commission-info">
            <h3 className="commission-name">{commission.name}</h3>
            <div className="commission-meta">
              <span className="commission-difficulty" style={{ color: difficultyColor }}>
                {difficultyName}
              </span>
              <span className="commission-type">{typeName}</span>
            </div>
          </div>
        </div>

        <div className="commission-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress * 100}%`, backgroundColor: difficultyColor }}
            />
          </div>
          <span className="progress-text">
            {commission.stages.filter(s => s.completed).length}/{commission.totalStages} 阶段
          </span>
        </div>

        <div className="commission-rewards-preview">
          <span className="reward-item">🏆 +{commission.reputationReward} 声望</span>
          {commission.overallReward.gold && <span className="reward-item">💰 {commission.overallReward.gold}</span>}
          {commission.overallReward.mana && <span className="reward-item">🔮 {commission.overallReward.mana}</span>}
        </div>

        {isAvailable && (
          <button
            className="accept-button"
            style={{ backgroundColor: difficultyColor }}
            onClick={(e) => {
              e.stopPropagation();
              acceptCommission(commission.id);
            }}
            disabled={!acceptCommission}
          >
            接受委托
          </button>
        )}
      </div>
    );
  };

  const renderCommissionDetail = () => {
    if (!selectedCommission) {
      return (
        <div className="commission-detail-empty">
          <p>选择一个委托查看详情</p>
        </div>
      );
    }

    const difficultyColor = COMMISSION_DIFFICULTY_COLORS[selectedCommission.difficulty];
    const typeIcon = COMMISSION_TYPE_ICONS[selectedCommission.type];
    const typeName = COMMISSION_TYPE_NAMES[selectedCommission.type];
    const difficultyName = COMMISSION_DIFFICULTY_NAMES[selectedCommission.difficulty];
    const currentRankInfo = getCommissionRank(kc.rankPoints);
    const bonusReward = applyCommissionRewardBonus(selectedCommission.overallReward, currentRankInfo);

    return (
      <div className="commission-detail">
        <div className="detail-header" style={{ borderBottomColor: difficultyColor }}>
          <div className="detail-type-icon">{typeIcon}</div>
          <div className="detail-title">
            <h2>{selectedCommission.name}</h2>
            <div className="detail-tags">
              <span className="tag difficulty-tag" style={{ backgroundColor: difficultyColor }}>
                {difficultyName}
              </span>
              <span className="tag type-tag">{typeName}</span>
            </div>
          </div>
        </div>

        <p className="commission-description">{selectedCommission.description}</p>

        <div className="detail-section">
          <h3>📋 委托阶段</h3>
          <div className="stages-list">
            {selectedCommission.stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`stage-item ${stage.unlocked ? 'unlocked' : 'locked'} ${stage.completed ? 'completed' : ''} ${stage.claimed ? 'claimed' : ''}`}
              >
                <div className="stage-header">
                  <span className="stage-number">
                    {stage.completed ? '✅' : stage.unlocked ? `${index + 1}` : '🔒'}
                  </span>
                  <span className="stage-name">{stage.name}</span>
                  {stage.completed && !stage.claimed && (
                    <button
                      className="claim-stage-btn"
                      onClick={() => claimCommissionStageReward(selectedCommission.id, stage.id)}
                    >
                      领取奖励
                    </button>
                  )}
                  {stage.type === 'resource' && stage.unlocked && !stage.completed && (
                    <button
                      className="deliver-btn"
                      onClick={() => deliverCommissionResource(selectedCommission.id, stage.id)}
                      disabled={state.resources[stage.resourceType!] < (stage.target - stage.current)}
                    >
                      交付资源
                    </button>
                  )}
                </div>
                <div className="stage-progress">
                  <div className="stage-progress-bar">
                    <div
                      className="stage-progress-fill"
                      style={{ width: `${(stage.current / stage.target) * 100}%` }}
                    />
                  </div>
                  <span className="stage-progress-text">
                    {stage.current} / {stage.target}
                  </span>
                </div>
                <div className="stage-rewards">
                  {stage.reward.gold && <span>💰 +{stage.reward.gold}</span>}
                  {stage.reward.mana && <span>🔮 +{stage.reward.mana}</span>}
                  {stage.reward.food && <span>🍖 +{stage.reward.food}</span>}
                  {stage.reward.reputation && <span>⭐ +{stage.reward.reputation}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h3>🎁 最终奖励</h3>
          <div className="final-rewards">
            <div className="reward-row">
              <span>基础奖励:</span>
              <div className="reward-items">
                {selectedCommission.overallReward.gold && <span>💰 {selectedCommission.overallReward.gold}</span>}
                {selectedCommission.overallReward.mana && <span>🔮 {selectedCommission.overallReward.mana}</span>}
                {selectedCommission.overallReward.food && <span>🍖 {selectedCommission.overallReward.food}</span>}
                <span>⭐ {selectedCommission.reputationReward} 声望</span>
              </div>
            </div>
            {currentRankInfo.bonuses.commissionRewardBonus > 0 && (
              <div className="reward-row bonus">
                <span>段位加成 ({currentRankInfo.name}):</span>
                <div className="reward-items">
                  {bonusReward.gold && <span>💰 +{bonusReward.gold - (selectedCommission.overallReward.gold || 0)}</span>}
                  {bonusReward.mana && <span>🔮 +{bonusReward.mana - (selectedCommission.overallReward.mana || 0)}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>👥 派遣队伍 ({selectedCommission.assignedStudents.length}/{selectedCommission.maxStudents})</h3>
          <div className="team-assignment">
            {selectedCommission.assignedStudents.length === 0 ? (
              <p className="empty-team">暂未派遣学员</p>
            ) : (
              <div className="team-members">
                {selectedCommission.assignedStudents.map(studentId => {
                  const student = state.students.find(s => s.id === studentId);
                  if (!student) return null;
                  return (
                    <div key={studentId} className="team-member">
                      <span className="member-name">{student.name}</span>
                      <span className="member-level">Lv.{student.level}</span>
                      <button
                        className="remove-member-btn"
                        onClick={() => unassignStudentFromCommission(selectedCommission.id, studentId)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedCommission.status === 'in_progress' && (
              <div className="available-students">
                <p>可派遣学员:</p>
                <div className="student-list">
                  {state.students
                    .filter(s => s.status === 'idle' && !selectedCommission.assignedStudents.includes(s.id))
                    .slice(0, 5)
                    .map(student => (
                      <button
                        key={student.id}
                        className="student-item"
                        onClick={() => assignStudentToCommission(selectedCommission.id, student.id)}
                        disabled={selectedCommission.assignedStudents.length >= selectedCommission.maxStudents}
                      >
                        <span>{student.name}</span>
                        <span className="student-level">Lv.{student.level}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-actions">
          {selectedCommission.status === 'stage_complete' && (
            <button
              className="claim-final-btn"
              style={{ backgroundColor: difficultyColor }}
              onClick={() => claimCommissionReward(selectedCommission.id)}
            >
              🏆 领取最终奖励
            </button>
          )}
          {selectedCommission.status === 'in_progress' && (
            <button
              className="abandon-btn"
              onClick={() => {
                if (confirm('确定要放弃这个委托吗？已完成的进度将丢失。')) {
                  abandonCommission(selectedCommission.id);
                  setSelectedCommissionId(null);
                }
              }}
            >
              放弃委托
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRankingPanel = () => {
    const rankProgress = nextRank
      ? (kc.rankPoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)
      : 1;

    return (
      <div className="ranking-panel">
        <div className="current-rank-card">
          <div className="rank-badge">
            <span className="rank-icon">🏆</span>
            <span className="rank-name">{currentRank.name}</span>
            <span className="rank-level">Lv.{currentRank.rank}</span>
          </div>
          <div className="rank-progress">
            <div className="progress-bar large">
              <div className="progress-fill gold" style={{ width: `${rankProgress * 100}%` }} />
            </div>
            <div className="progress-labels">
              <span>{kc.rankPoints} 积分</span>
              <span>{nextRank ? `${nextRank.name} (${nextRank.minPoints}积分)` : '已达最高段位'}</span>
            </div>
          </div>
        </div>

        <div className="rank-stats">
          <div className="stat-card">
            <span className="stat-value">{kc.totalCommissionsCompleted}</span>
            <span className="stat-label">完成委托</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{kc.totalReputationEarned}</span>
            <span className="stat-label">获得声望</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{kc.rankPoints}</span>
            <span className="stat-label">累计积分</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{maxActive}</span>
            <span className="stat-label">同时进行</span>
          </div>
        </div>

        <div className="rank-benefits">
          <h3>🎖️ 当前段位加成</h3>
          <ul>
            <li>💰 委托奖励 +{Math.round(currentRank.bonuses.commissionRewardBonus * 100)}%</li>
            <li>📋 额外委托槽位 +{currentRank.bonuses.extraCommissionSlots}</li>
            <li>⭐ 声望加成 +{currentRank.bonuses.reputationBonus}</li>
          </ul>
        </div>

        <div className="all-ranks">
          <h3>📊 段位一览</h3>
          <div className="ranks-list">
            {COMMISSION_RANK_INFO.map(rank => (
              <div
                key={rank.rank}
                className={`rank-item ${kc.rankPoints >= rank.minPoints ? 'achieved' : ''} ${currentRank.rank === rank.rank ? 'current' : ''}`}
              >
                <span className="rank-level-badge">{rank.rank}</span>
                <span className="rank-item-name">{rank.name}</span>
                <span className="rank-points">{rank.minPoints} 积分</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="kingdom-commission-panel">
      <div className="panel-header">
        <h2>🏰 王国委托</h2>
        <div className="rank-summary">
          <span className="rank-badge-small">{currentRank.name}</span>
          <span className="points-badge">{kc.rankPoints} 积分</span>
        </div>
      </div>

      <div className="commission-tabs">
        <button
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          📜 可接委托 <span className="badge">{kc.availableCommissions.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          ⚔️ 进行中 <span className="badge">{kc.activeCommissions.length}/{maxActive}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ 已完成 <span className="badge">{kc.completedCommissions.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          🏆 段位排名
        </button>
      </div>

      <div className="panel-content">
        <div className="commission-list">
          {activeTab === 'available' && (
            <>
              <div className="list-header">
                <h3>可接委托</h3>
                <button
                  className="refresh-btn"
                  onClick={refreshAvailableCommissions}
                  disabled={state.resources.gold < (kc.refreshCost.gold || 0) || state.resources.reputation < (kc.refreshCost.reputation || 0)}
                >
                  🔄 刷新
                  <span className="refresh-cost">
                    (💰{kc.refreshCost.gold} ⭐{kc.refreshCost.reputation})
                  </span>
                </button>
              </div>
              {kc.availableCommissions.length === 0 ? (
                <p className="empty-text">暂无可接委托，请刷新</p>
              ) : (
                <div className="commissions-grid">
                  {kc.availableCommissions.map(c => renderCommissionCard(c, true))}
                </div>
              )}
            </>
          )}

          {activeTab === 'active' && (
            <>
              <div className="list-header">
                <h3>进行中的委托</h3>
              </div>
              {kc.activeCommissions.length === 0 ? (
                <p className="empty-text">暂无进行中的委托</p>
              ) : (
                <div className="commissions-grid">
                  {kc.activeCommissions.map(c => renderCommissionCard(c))}
                </div>
              )}
            </>
          )}

          {activeTab === 'completed' && (
            <>
              <div className="list-header">
                <h3>待领取 / 已完成</h3>
              </div>
              {kc.completedCommissions.length === 0 ? (
                <p className="empty-text">暂无完成的委托</p>
              ) : (
                <div className="commissions-grid">
                  {kc.completedCommissions.map(c => renderCommissionCard(c))}
                </div>
              )}
            </>
          )}

          {activeTab === 'ranking' && renderRankingPanel()}
        </div>

        {(activeTab === 'available' || activeTab === 'active' || activeTab === 'completed') && (
          <div className="commission-detail-panel">
            {renderCommissionDetail()}
          </div>
        )}
      </div>
    </div>
  );
}
