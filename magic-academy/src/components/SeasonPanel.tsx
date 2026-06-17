import { useGame } from '../store/GameContext';
import type { SeasonGoalType, Resource } from '../types/game';
import { calculateSeasonRank, getRankBonus } from '../data/gameData';

export default function SeasonPanel() {
  const { 
    state, 
    claimSeasonGoal, 
    claimSeasonStageReward, 
    settleSeason, 
    startNewSeason, 
    getSeasonProgress,
    claimSeasonSettlementReward,
  } = useGame();
  
  const { season, seasonHistory } = state;
  const progress = getSeasonProgress();
  
  const currentRank = calculateSeasonRank(season.totalPointsEarned);
  const rankColors: Record<string, string> = {
    S: '#ffd700',
    A: '#ff6b6b',
    B: '#4ecdc4',
    C: '#45b7d1',
    D: '#96ceb4',
  };
  
  const formatReward = (reward: Partial<Resource>) => {
    const parts: string[] = [];
    if (reward.gold) parts.push(`💰 ${reward.gold}`);
    if (reward.mana) parts.push(`💎 ${reward.mana}`);
    if (reward.food) parts.push(`🍞 ${reward.food}`);
    if (reward.reputation) parts.push(`⭐ ${reward.reputation}`);
    return parts.join(' ');
  };
  
  const getTypeIcon = (type: SeasonGoalType) => {
    switch (type) {
      case 'building': return '🏗️';
      case 'course': return '📚';
      case 'dungeon': return '⚔️';
      case 'recruit': return '👤';
      case 'reputation': return '⭐';
      case 'comprehensive': return '✨';
      default: return '🎯';
    }
  };
  
  const completedGoals = season.goals.filter(g => g.completed).length;
  const unlockedStages = season.stageRewards.filter(s => s.unlocked).length;
  
  if (season.seasonEnded && !season.seasonSettled) {
    return (
      <div className="module-container season-module">
        <div className="module-header">
          <h2>🏆 第{season.seasonNumber}赛季「{season.seasonName}」</h2>
        </div>
        
        <div className="season-settlement">
          <div className="settlement-header">
            <h3>🎉 赛季结束！</h3>
            <p className="season-subtitle">点击下方按钮进行赛季结算</p>
          </div>
          
          <div className="settlement-preview">
            <div className="settlement-item">
              <span className="settlement-label">赛季积分</span>
              <span className="settlement-value">{season.totalPointsEarned}</span>
            </div>
            <div className="settlement-item">
              <span className="settlement-label">预计评级</span>
              <span className="settlement-value" style={{ color: rankColors[currentRank] }}>
                {currentRank} 级
              </span>
            </div>
            <div className="settlement-item">
              <span className="settlement-label">完成目标</span>
              <span className="settlement-value">{completedGoals}/{season.goals.length}</span>
            </div>
            <div className="settlement-item">
              <span className="settlement-label">解锁阶段</span>
              <span className="settlement-value">{unlockedStages}/{season.stageRewards.length}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-primary btn-large settle-btn"
            onClick={settleSeason}
          >
            📊 结算赛季
          </button>
        </div>
      </div>
    );
  }
  
  if (season.seasonSettled && !season.settlementClaimed) {
    const rankBonus = season.settlementRewards || getRankBonus(season.settlementRank || 'D');
    
    return (
      <div className="module-container season-module">
        <div className="module-header">
          <h2>🏆 第{season.seasonNumber}赛季「{season.seasonName}」</h2>
        </div>
        
        <div className="season-rewards">
          <div className="rewards-header">
            <h3>🎊 赛季结算完成！</h3>
            <p className="season-subtitle">恭喜获得以下评级和奖励</p>
          </div>
          
          <div className="rank-display" style={{ borderColor: rankColors[season.settlementRank || 'D'] }}>
            <div className="rank-label">最终评级</div>
            <div className="rank-value" style={{ color: rankColors[season.settlementRank || 'D'] }}>
              {season.settlementRank}
            </div>
            <div className="rank-points">总积分: {season.totalPointsEarned}</div>
          </div>
          
          <div className="settlement-rewards">
            <h4>🎁 结算奖励</h4>
            <div className="reward-list">
              {formatReward(rankBonus)}
            </div>
          </div>
          
          <button 
            className="btn btn-primary btn-large claim-btn"
            onClick={claimSeasonSettlementReward}
          >
            ✨ 领取奖励
          </button>
        </div>
      </div>
    );
  }
  
  if (season.seasonSettled && season.settlementClaimed) {
    return (
      <div className="module-container season-module">
        <div className="module-header">
          <h2>🏆 第{season.seasonNumber}赛季「{season.seasonName}」</h2>
        </div>
        
        <div className="season-complete">
          <div className="complete-header">
            <h3>✅ 赛季已完成</h3>
            <p className="season-subtitle">第{season.seasonNumber}赛季奖励已领取</p>
          </div>
          
          <div className="season-stats">
            <div className="stat-item">
              <span className="stat-label">最终评级</span>
              <span className="stat-value" style={{ color: rankColors[season.settlementRank || 'D'] }}>
                {season.settlementRank}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">总积分</span>
              <span className="stat-value">{season.totalPointsEarned}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">完成目标</span>
              <span className="stat-value">{completedGoals}/{season.goals.length}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-primary btn-large new-season-btn"
            onClick={startNewSeason}
          >
            🚀 开启新赛季
          </button>
          
          {seasonHistory.length > 0 && (
            <div className="season-history-section">
              <h3>📜 赛季历史</h3>
              <div className="history-list">
                {[...seasonHistory].reverse().map(h => (
                  <div key={h.seasonNumber} className="history-item">
                    <div className="history-left">
                      <span className="history-number">第{h.seasonNumber}赛季</span>
                      <span className="history-name">「{h.seasonName}」</span>
                    </div>
                    <div className="history-right">
                      <span className="history-rank" style={{ color: rankColors[h.rank] }}>
                        {h.rank}级
                      </span>
                      <span className="history-points">{h.finalPoints}分</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="module-container season-module">
      <div className="module-header">
        <h2>🏆 第{season.seasonNumber}赛季「{season.seasonName}」</h2>
      </div>
      
      <div className="season-overview">
        <div className="overview-card season-overview-card">
          <h3>📅 赛季进度</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ 
                width: `${(progress.currentDay / progress.totalDays) * 100}%`, 
                backgroundColor: '#8b5cf6' 
              }}
            />
          </div>
          <p>第 {progress.currentDay} 天 / 共 {progress.totalDays} 天</p>
          <p className="small-text">剩余 {progress.daysLeft} 天</p>
        </div>
        
        <div className="overview-card season-overview-card">
          <h3>⭐ 赛季积分</h3>
          <div className="season-points-display">
            <span className="points-value">{season.totalPointsEarned}</span>
            <span className="points-label">积分</span>
          </div>
          <p className="small-text">
            当前评级: 
            <span style={{ color: rankColors[currentRank], marginLeft: '8px' }}>
              {currentRank} 级
            </span>
          </p>
        </div>
        
        <div className="overview-card season-overview-card">
          <h3>🎯 完成进度</h3>
          <div className="progress-stats">
            <div>
              <span className="stat-number">{completedGoals}</span>
              <span className="stat-label">/{season.goals.length} 目标</span>
            </div>
            <div>
              <span className="stat-number">{unlockedStages}</span>
              <span className="stat-label">/{season.stageRewards.length} 阶段</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="goals-section">
        <h3>🎯 赛季目标</h3>
        <div className="goals-grid">
          {season.goals.map(goal => {
            const isComplete = goal.current >= goal.target;
            return (
              <div
                key={goal.id}
                className={`goal-card ${goal.completed ? 'completed' : ''} ${goal.claimed ? 'claimed' : ''}`}
              >
                <div className="goal-header">
                  <span className="goal-icon">{getTypeIcon(goal.type)}</span>
                  <div className="goal-info">
                    <h4>{goal.name}</h4>
                    <p>{goal.description}</p>
                  </div>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                        backgroundColor: isComplete ? '#10b981' : '#8b5cf6',
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {goal.current} / {goal.target}
                  </span>
                </div>
                <div className="goal-footer">
                  <span className="reward-text">
                    积分: +{goal.seasonPoints}
                  </span>
                  {!goal.claimed && goal.completed && (
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => claimSeasonGoal(goal.id)}
                    >
                      领取
                    </button>
                  )}
                  {goal.claimed && <span className="claimed-badge">✓ 已领取</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="goals-section">
        <h3>🎁 阶段奖励</h3>
        <div className="stage-rewards-list">
          {season.stageRewards.map((stage, index) => {
            const isUnlocked = stage.unlocked;
            const isClaimed = stage.claimed;
            const prevStage = index > 0 ? season.stageRewards[index - 1] : null;
            const progressWidth = prevStage 
              ? Math.min(100, ((season.totalPointsEarned - prevStage.requiredPoints) / (stage.requiredPoints - prevStage.requiredPoints)) * 100)
              : Math.min(100, (season.totalPointsEarned / stage.requiredPoints) * 100);
            
            return (
              <div
                key={stage.id}
                className={`stage-reward-item ${isUnlocked ? 'unlocked' : ''} ${isClaimed ? 'claimed' : ''}`}
              >
                <div className="stage-reward-header">
                  <span className="stage-badge">阶段 {index + 1}</span>
                  <span className="stage-points">{stage.requiredPoints} 积分解锁</span>
                </div>
                <div className="stage-reward-content">
                  <div className="stage-reward-info">
                    <span className="reward-label">奖励: </span>
                    <span className="reward-value">{formatReward(stage.reward)}</span>
                  </div>
                  {!isUnlocked && (
                    <div className="stage-progress">
                      <div className="progress-bar small">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.max(0, progressWidth)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isUnlocked && !isClaimed && (
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => claimSeasonStageReward(stage.id)}
                    >
                      领取奖励
                    </button>
                  )}
                  {isClaimed && <span className="claimed-badge">✓ 已领取</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {seasonHistory.length > 0 && (
        <div className="goals-section">
          <h3>📜 赛季历史</h3>
          <div className="history-list">
            {[...seasonHistory].reverse().slice(0, 5).map(h => (
              <div key={h.seasonNumber} className="history-item">
                <div className="history-left">
                  <span className="history-number">第{h.seasonNumber}赛季</span>
                  <span className="history-name">「{h.seasonName}」</span>
                </div>
                <div className="history-right">
                  <span className="history-rank" style={{ color: rankColors[h.rank] }}>
                    {h.rank}级
                  </span>
                  <span className="history-points">{h.finalPoints}分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
