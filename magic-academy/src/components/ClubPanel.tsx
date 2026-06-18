import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { MagicType } from '../types/game';

export default function ClubPanel() {
  const {
    state,
    joinClub,
    leaveClub,
    unlockClub,
    levelUpClub,
    claimClubTask,
    purchaseClubShopItem,
    refreshClubShop,
    canUnlockClub,
    calculateClubLevelProgress,
    getClubLevelRequirement,
    calculateDiscountedClubShopCost,
    getClubReputationLevel,
    getClubMemberBonus,
    CLUB_REPUTATION_LEVELS,
  } = useGame();

  const [selectedClubId, setSelectedClubId] = useState<string | null>(
    state.clubs.clubs.find(c => c.unlocked)?.id || null
  );
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'shop' | 'members'>('info');
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  const { clubs, tasks, shopItems, contributionLogs, activeBuffs } = state.clubs;
  const selectedClub = clubs.find(c => c.id === selectedClubId);

  const getMagicTypeLabel = (type: MagicType | 'mixed') => {
    const labels: Record<string, string> = {
      fire: '🔥 火系',
      water: '💧 水系',
      earth: '🏔️ 土系',
      wind: '🌪️ 风系',
      light: '✨ 光系',
      dark: '🌙 暗系',
      mixed: '🌈 综合',
    };
    return labels[type] || type;
  };

  const getFocusLabel = (focus: string) => {
    const labels: Record<string, string> = {
      combat: '⚔️ 战斗专精',
      research: '📚 研究专精',
      support: '💚 辅助专精',
      balanced: '⚖️ 均衡发展',
    };
    return labels[focus] || focus;
  };

  const getDifficultyLabel = (diff: string) => {
    const styles: Record<string, { label: string; color: string; bg: string }> = {
      easy: { label: '简单', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)' },
      normal: { label: '普通', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.15)' },
      hard: { label: '困难', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.15)' },
      legendary: { label: '传说', color: '#9C27B0', bg: 'rgba(156, 39, 176, 0.15)' },
    };
    return styles[diff] || styles.normal;
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      resource: '📦 资源',
      buff: '✨ 增益',
      consumable: '🧪 消耗品',
      unlock: '🎁 解锁',
    };
    return labels[cat] || cat;
  };

  const formatReward = (reward: Partial<{ gold: number; mana: number; food: number; reputation: number; contributionPoints: number }>) => {
    const parts: string[] = [];
    if (reward.gold) parts.push(`💰${reward.gold}`);
    if (reward.mana) parts.push(`💎${reward.mana}`);
    if (reward.food) parts.push(`🍞${reward.food}`);
    if (reward.reputation) parts.push(`⭐${reward.reputation}`);
    if (reward.contributionPoints) parts.push(`🏅${reward.contributionPoints}`);
    return parts.join(' ');
  };

  const formatCost = (cost: Partial<{ gold: number; mana: number; food: number; reputation: number; contributionPoints: number }>) => {
    const parts: string[] = [];
    if (cost.contributionPoints) parts.push(`🏅${cost.contributionPoints}`);
    if (cost.gold) parts.push(`💰${cost.gold}`);
    if (cost.mana) parts.push(`💎${cost.mana}`);
    if (cost.food) parts.push(`🍞${cost.food}`);
    if (cost.reputation) parts.push(`⭐${cost.reputation}`);
    return parts.join(' ');
  };

  const clubTasks = selectedClub ? tasks.filter(t => t.clubId === selectedClub.id) : [];
  const clubMembers = selectedClub ? state.students.filter(s => selectedClub.members.includes(s.id)) : [];
  const nonMembers = state.students.filter(s => !clubs.some(c => c.members.includes(s.id)));

  const selectedClubRepLevel = selectedClub ? getClubReputationLevel(selectedClub.reputation) : null;
  const selectedClubLevelProgress = selectedClub
    ? calculateClubLevelProgress(selectedClub.totalContributionPoints, selectedClub.level, selectedClub.maxLevel)
    : null;
  const memberBonus = selectedClub ? getClubMemberBonus(selectedClub, state.students) : null;

  if (!selectedClub) {
    return (
      <div className="module-container club-module">
        <div className="module-header">
          <h2>🎭 魔法社团</h2>
        </div>
        <div className="empty-state">
          <p style={{ fontSize: '48px', margin: 0 }}>🏛️</p>
          <p>暂无可用社团，请先提升学院声望解锁社团</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container club-module">
      <div className="module-header">
        <h2>🎭 魔法社团</h2>
      </div>

      <div className="club-layout">
        <div className="club-sidebar">
          <div className="club-list-title">社团列表</div>
          <div className="club-list">
            {clubs.map(club => {
              const unlockInfo = canUnlockClub(club, state.resources.reputation, state.buildings);
              const isSelected = club.id === selectedClubId;
              const clubRepLevel = getClubReputationLevel(club.reputation);

              return (
                <div
                  key={club.id}
                  className={`club-card ${isSelected ? 'selected' : ''} ${!club.unlocked ? 'locked' : ''}`}
                  onClick={() => club.unlocked && setSelectedClubId(club.id)}
                >
                  <div className="club-card-header">
                    <span className="club-icon">{club.icon}</span>
                    <div className="club-card-info">
                      <div className="club-name">{club.name}</div>
                      <div className="club-type">{getMagicTypeLabel(club.primaryMagicType)}</div>
                    </div>
                  </div>
                  <div className="club-card-stats">
                    {club.unlocked ? (
                      <>
                        <span className="stat-badge">Lv.{club.level}</span>
                        <span className="stat-badge secondary">
                          {clubRepLevel.name}
                        </span>
                        <span className="stat-badge members">
                          👥 {club.members.length}
                        </span>
                      </>
                    ) : (
                      <div className="club-lock-info">
                        {!unlockInfo.canUnlock && (
                          <div className="lock-requirements">
                            {unlockInfo.requirements.map((req, i) => (
                              <span
                                key={i}
                                className={`req-item ${req.current >= req.required ? 'met' : ''}`}
                              >
                                {req.name}: {req.current}/{req.required}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          className="btn btn-small btn-primary"
                          disabled={!unlockInfo.canUnlock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (unlockInfo.canUnlock) unlockClub(club.id);
                          }}
                        >
                          {unlockInfo.canUnlock ? '解锁' : '🔒 未解锁'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="club-main-content">
          <div className="club-detail-header">
            <div className="club-title-row">
              <span className="club-big-icon">{selectedClub.icon}</span>
              <div>
                <h3 style={{ margin: 0 }}>{selectedClub.name}</h3>
                <div className="club-subtitle">
                  {getMagicTypeLabel(selectedClub.primaryMagicType)} · {getFocusLabel(selectedClub.focus)} · Lv.{selectedClub.level}
                </div>
              </div>
              {selectedClubLevelProgress?.canLevelUp && selectedClub.level < selectedClub.maxLevel && (
                <button
                  className="btn btn-success"
                  onClick={() => levelUpClub(selectedClub.id)}
                >
                  🎉 升级到 Lv.{selectedClub.level + 1}
                </button>
              )}
            </div>
            <p className="club-description">{selectedClub.description}</p>
          </div>

          {selectedClubLevelProgress && selectedClub.level < selectedClub.maxLevel && (
            <div className="progress-section">
              <div className="progress-label">
                <span>社团升级进度</span>
                <span>
                  {Math.floor(selectedClubLevelProgress.progress * 100)}% · 下一级需要{' '}
                  {getClubLevelRequirement(selectedClub.level + 1)} 总贡献
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${selectedClubLevelProgress.progress * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="club-stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">🏅</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{selectedClub.contributionPoints}</div>
                <div className="stat-card-label">贡献点余额</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">⭐</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{selectedClub.reputation}</div>
                <div className="stat-card-label">
                  社团声望 · {selectedClubRepLevel?.name}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">📈</div>
              <div className="stat-card-content">
                <div className="stat-card-value">{selectedClub.totalContributionPoints}</div>
                <div className="stat-card-label">累计总贡献</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-content">
                <div className="stat-card-value">
                  {selectedClub.members.length}/
                  {selectedClub.maxMembers + (selectedClubRepLevel?.bonuses.maxMembersBonus || 0)}
                </div>
                <div className="stat-card-label">成员数量</div>
              </div>
            </div>
          </div>

          {selectedClubRepLevel && (
            <div className="reputation-bonuses">
              <div className="bonuses-title">
                🎖️ 声望等级「{selectedClubRepLevel.name}」加成
              </div>
              <div className="bonuses-grid">
                {selectedClubRepLevel.bonuses.taskRewardBonus > 0 && (
                  <span className="bonus-tag">
                    任务奖励 +{Math.round(selectedClubRepLevel.bonuses.taskRewardBonus * 100)}%
                  </span>
                )}
                {selectedClubRepLevel.bonuses.shopDiscount > 0 && (
                  <span className="bonus-tag">
                    商店折扣 -{Math.round(selectedClubRepLevel.bonuses.shopDiscount * 100)}%
                  </span>
                )}
                {selectedClubRepLevel.bonuses.maxMembersBonus > 0 && (
                  <span className="bonus-tag">
                    成员上限 +{selectedClubRepLevel.bonuses.maxMembersBonus}
                  </span>
                )}
                {selectedClubRepLevel.bonuses.contributionGainBonus > 0 && (
                  <span className="bonus-tag">
                    贡献获取 +{Math.round(selectedClubRepLevel.bonuses.contributionGainBonus * 100)}%
                  </span>
                )}
                <span className="bonus-tag">
                  每日声望 +{selectedClubRepLevel.bonuses.dailyReputationBonus}
                </span>
              </div>
            </div>
          )}

          {memberBonus && memberBonus.memberCount > 0 && (
            <div className="member-bonus-section">
              <div className="bonuses-title">
                👥 成员协作加成（{memberBonus.memberCount}名成员）
              </div>
              <div className="bonuses-grid">
                {memberBonus.expBonus > 0 && (
                  <span className="bonus-tag">经验获取 +{Math.round(memberBonus.expBonus * 100)}%</span>
                )}
                {memberBonus.damageBonus > 0 && (
                  <span className="bonus-tag">技能伤害 +{Math.round(memberBonus.damageBonus * 100)}%</span>
                )}
                {memberBonus.courseSpeedBonus > 0 && (
                  <span className="bonus-tag">
                    课程速度 +{Math.round(memberBonus.courseSpeedBonus * 100)}%
                  </span>
                )}
              </div>
            </div>
          )}

          {activeBuffs.filter(b => b.clubId === selectedClub.id).length > 0 && (
            <div className="active-buffs">
              <div className="bonuses-title">✨ 激活中的增益效果</div>
              <div className="buffs-list">
                {activeBuffs
                  .filter(b => b.clubId === selectedClub.id)
                  .map(buff => (
                    <div key={buff.id} className="buff-item">
                      <span className="buff-name">{buff.name}</span>
                      <span className="buff-duration">剩余 {buff.remainingDays} 天</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              📋 概览
            </button>
            <button
              className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              🎯 社团任务
            </button>
            <button
              className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              🛒 贡献商店
            </button>
            <button
              className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              👥 成员管理
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'info' && (
              <div className="info-tab">
                <div className="info-section">
                  <h4>🏗️ 关联建筑加成</h4>
                  <div className="related-buildings">
                    {selectedClub.buildingBonus.map(bId => {
                      const building = state.buildings.find(b => b.id === bId);
                      return building ? (
                        <div key={bId} className="building-tag">
                          {building.name} Lv.{building.level}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {contributionLogs.filter(l => l.clubId === selectedClub.id).length > 0 && (
                  <div className="info-section">
                    <h4>📜 最近贡献记录</h4>
                    <div className="contribution-logs">
                      {contributionLogs
                        .filter(l => l.clubId === selectedClub.id)
                        .slice(0, 10)
                        .map(log => (
                          <div key={log.id} className="log-item">
                            <span className="log-day">第{log.day}天</span>
                            <span className="log-desc">{log.description}</span>
                            <span className="log-amount">+{log.amount}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="info-section">
                  <h4>📊 社团声望阶梯</h4>
                  <div className="reputation-ladder">
                    {CLUB_REPUTATION_LEVELS.map(level => {
                      const achieved = selectedClub.reputation >= level.minReputation;
                      return (
                        <div
                          key={level.level}
                          className={`ladder-item ${achieved ? 'achieved' : ''}`}
                        >
                          <span className="ladder-level">Lv.{level.level}</span>
                          <span className="ladder-name">{level.name}</span>
                          <span className="ladder-req">{level.minReputation}声望</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="tasks-tab">
                {clubTasks.length === 0 ? (
                  <div className="empty-state">
                    <p>暂无可接取的任务，请提升社团等级解锁更多任务</p>
                  </div>
                ) : (
                  <div className="tasks-list">
                    {clubTasks.map(task => {
                      const diffStyle = getDifficultyLabel(task.difficulty);
                      const progress = Math.min(1, task.current / task.target);

                      return (
                        <div
                          key={task.id}
                          className={`task-card ${task.completed ? 'completed' : ''} ${!task.unlocked ? 'locked' : ''}`}
                        >
                          <div className="task-header">
                            <div>
                              <div className="task-name">
                                {task.name}
                                <span
                                  className="difficulty-tag"
                                  style={{ color: diffStyle.color, background: diffStyle.bg }}
                                >
                                  {diffStyle.label}
                                </span>
                              </div>
                              <div className="task-desc">{task.description}</div>
                            </div>
                            {task.unlocked ? (
                              <button
                                className={`btn ${task.claimed ? 'btn-disabled' : task.completed ? 'btn-success' : 'btn-disabled'}`}
                                disabled={!task.completed || task.claimed}
                                onClick={() => task.completed && !task.claimed && claimClubTask(task.id)}
                              >
                                {task.claimed ? '已领取' : task.completed ? '领取奖励' : '进行中'}
                              </button>
                            ) : (
                              <span className="lock-indicator">🔒 未解锁</span>
                            )}
                          </div>
                          <div className="task-progress-section">
                            <div className="progress-label">
                              <span>进度</span>
                              <span>{task.current} / {task.target}</span>
                            </div>
                            <div className="progress-bar small">
                              <div
                                className="progress-fill"
                                style={{ width: `${progress * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="task-reward">
                            <span className="reward-label">奖励:</span>
                            <span className="reward-value">{formatReward(task.reward)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="shop-tab">
                <div className="shop-header">
                  <div className="shop-balance">
                    <span>当前贡献点: </span>
                    <strong style={{ color: '#FFD700' }}>🏅 {selectedClub.contributionPoints}</strong>
                  </div>
                  <button className="btn btn-small btn-secondary" onClick={refreshClubShop}>
                    🔄 刷新库存
                  </button>
                </div>

                <div className="shop-items-grid">
                  {shopItems.map(item => {
                    const discountedCost = calculateDiscountedClubShopCost(
                      item.cost,
                      selectedClub.reputation
                    );
                    const canAfford =
                      selectedClub.contributionPoints >= (discountedCost.contributionPoints || 0) &&
                      state.resources.gold >= (discountedCost.gold || 0) &&
                      state.resources.mana >= (discountedCost.mana || 0) &&
                      state.resources.food >= (discountedCost.food || 0) &&
                      state.resources.reputation >= (discountedCost.reputation || 0);
                    const levelLocked = selectedClub.level < item.requiredClubLevel;
                    const repLocked =
                      item.requiredClubReputation &&
                      selectedClub.reputation < item.requiredClubReputation;
                    const stockOut = item.stock <= 0 || item.purchasedCount >= item.purchaseLimit;
                    const cannotBuy = levelLocked || repLocked || stockOut || !canAfford;

                    return (
                      <div
                        key={item.id}
                        className={`shop-item-card ${cannotBuy ? 'disabled' : ''}`}
                      >
                        <div className="shop-item-icon">{item.icon}</div>
                        <div className="shop-item-info">
                          <div className="shop-item-name">{item.name}</div>
                          <div className="shop-item-desc">{item.description}</div>
                          <div className="shop-item-category">{getCategoryLabel(item.category)}</div>
                        </div>
                        <div className="shop-item-details">
                          <div className="shop-item-stock">
                            库存: {item.stock}/{item.maxStock} · 限购: {item.purchaseLimit - item.purchasedCount}
                          </div>
                          <div className="shop-item-cost">{formatCost(discountedCost)}</div>
                          {levelLocked ? (
                            <span className="shop-item-req">需要社团 Lv.{item.requiredClubLevel}</span>
                          ) : repLocked ? (
                            <span className="shop-item-req">
                              需要{selectedClub.name}声望 {item.requiredClubReputation}
                            </span>
                          ) : stockOut ? (
                            <span className="shop-item-req">已售罄</span>
                          ) : (
                            <button
                              className={`btn btn-small ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
                              disabled={!canAfford}
                              onClick={() => purchaseClubShopItem(item.id, selectedClub.id)}
                            >
                              购买
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="members-tab">
                <div className="members-header">
                  <div className="members-count">
                    当前成员: {selectedClub.members.length} /{' '}
                    {selectedClub.maxMembers + (selectedClubRepLevel?.bonuses.maxMembersBonus || 0)}
                  </div>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => setShowMemberSelect(!showMemberSelect)}
                    disabled={
                      selectedClub.members.length >=
                      selectedClub.maxMembers + (selectedClubRepLevel?.bonuses.maxMembersBonus || 0)
                    }
                  >
                    {showMemberSelect ? '取消选择' : '+ 招募成员'}
                  </button>
                </div>

                {showMemberSelect && (
                  <div className="member-select-panel">
                    <div className="select-title">选择要加入「{selectedClub.name}」的学员</div>
                    {nonMembers.length === 0 ? (
                      <div className="empty-state small">
                        <p>所有学员都已加入社团了</p>
                      </div>
                    ) : (
                      <div className="selectable-members">
                        {nonMembers.map(student => {
                          const isMatch =
                            selectedClub.primaryMagicType === 'mixed' ||
                            student.magicType === selectedClub.primaryMagicType;
                          return (
                            <div
                              key={student.id}
                              className={`student-select-card ${isMatch ? 'match' : ''}`}
                              onClick={() => {
                                joinClub(selectedClub.id, student.id);
                              }}
                            >
                              <div className="student-avatar">
                                {getMagicTypeLabel(student.magicType).split(' ')[0]}
                              </div>
                              <div className="student-info">
                                <div className="student-name">{student.name}</div>
                                <div className="student-stats">
                                  Lv.{student.level} · 潜力{student.potential.toFixed(2)}
                                </div>
                              </div>
                              {isMatch && (
                                <span className="match-badge">✨ 系别匹配</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {clubMembers.length === 0 ? (
                  <div className="empty-state">
                    <p style={{ fontSize: '48px', margin: 0 }}>👥</p>
                    <p>还没有成员，点击上方按钮招募学员加入吧！</p>
                  </div>
                ) : (
                  <div className="members-list">
                    {clubMembers.map(student => {
                      const isMatch =
                        selectedClub.primaryMagicType === 'mixed' ||
                        student.magicType === selectedClub.primaryMagicType;
                      return (
                        <div
                          key={student.id}
                          className={`member-card ${isMatch ? 'match' : ''}`}
                        >
                          <div className="member-avatar">
                            {getMagicTypeLabel(student.magicType).split(' ')[0]}
                          </div>
                          <div className="member-info">
                            <div className="member-name-row">
                              <span className="member-name">{student.name}</span>
                              {isMatch && <span className="match-badge small">✨系别匹配</span>}
                            </div>
                            <div className="member-stats-row">
                              <span className="member-stat">Lv.{student.level}</span>
                              <span className="member-stat">经验: {student.exp}</span>
                              <span className="member-stat">技能: {student.skills.length}个</span>
                              <span className="member-stat">潜力: {student.potential.toFixed(2)}</span>
                            </div>
                            <div className="member-status-row">
                              <span className={`status-tag ${student.status}`}>
                                {student.status === 'studying'
                                  ? '📚 学习中'
                                  : student.status === 'resting'
                                    ? '😴 休息中'
                                    : student.status === 'training'
                                      ? '💪 训练中'
                                      : '😊 空闲'}
                              </span>
                              <span className="hp-bar">
                                HP: {student.currentHp}/{student.maxHp}
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn btn-small btn-danger-outline"
                            onClick={() => leaveClub(selectedClub.id, student.id)}
                          >
                            退出
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
