import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { CodexCategory, AchievementType, StudentQuality, MagicType, AchievementRarity } from '../types/game';
import './CodexAchievementPanel.css';

const QUALITY_COLORS: Record<StudentQuality, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

const QUALITY_NAMES: Record<StudentQuality, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const MAGIC_TYPE_NAMES: Record<MagicType, string> = {
  fire: '火',
  water: '水',
  earth: '地',
  wind: '风',
  light: '光',
  dark: '暗',
};

const MAGIC_TYPE_ICONS: Record<MagicType, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🪨',
  wind: '💨',
  light: '✨',
  dark: '🌑',
};

export default function CodexAchievementPanel() {
  const {
    state,
    claimAchievementRewardAction,
    equipTitleAction,
    ACHIEVEMENT_RARITY_COLORS,
    ACHIEVEMENT_RARITY_NAMES,
    ACHIEVEMENT_TYPE_NAMES,
    ACHIEVEMENT_TYPE_ICONS,
    CODEX_CATEGORY_NAMES,
    CODEX_CATEGORY_ICONS,
  } = useGame();

  const [activeMainTab, setActiveMainTab] = useState<'codex' | 'achievement' | 'title'>('codex');
  const [activeCodexTab, setActiveCodexTab] = useState<CodexCategory>('student');
  const [activeAchievementTab, setActiveAchievementTab] = useState<AchievementType | 'all'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const { codex, achievement } = state;

  const getQualityStyle = (quality: StudentQuality) => ({
    color: QUALITY_COLORS[quality],
    borderColor: QUALITY_COLORS[quality],
  });

  const getAchievementRarityStyle = (rarity: string) => ({
    color: ACHIEVEMENT_RARITY_COLORS[rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS],
    borderColor: ACHIEVEMENT_RARITY_COLORS[rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS],
  });

  const renderCodexStudents = () => (
    <div className="codex-grid">
      {codex.students.map(entry => (
        <div
          key={entry.id}
          className={`codex-card ${entry.unlocked ? 'unlocked' : 'locked'}`}
          style={entry.unlocked ? getQualityStyle(entry.quality) : {}}
        >
          <div className="codex-card-icon">
            {entry.unlocked ? entry.icon : '❓'}
          </div>
          <div className="codex-card-name">
            {entry.unlocked ? entry.name : '???'}
          </div>
          {entry.unlocked && (
            <>
              <div className="codex-card-tags">
                <span className="quality-tag" style={{ background: `${QUALITY_COLORS[entry.quality]}22`, color: QUALITY_COLORS[entry.quality] }}>
                  {QUALITY_NAMES[entry.quality]}
                </span>
                <span className="magic-type-tag">
                  {MAGIC_TYPE_ICONS[entry.magicType]} {MAGIC_TYPE_NAMES[entry.magicType]}
                </span>
              </div>
              <div className="codex-card-desc">{entry.description}</div>
              <div className="codex-card-stats">
                <span>已招募: {entry.totalRecruited}次</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderCodexSkills = () => (
    <div className="codex-grid">
      {codex.skills.map(entry => (
        <div
          key={entry.id}
          className={`codex-card ${entry.unlocked ? 'unlocked' : 'locked'}`}
          style={entry.unlocked ? { borderColor: ACHIEVEMENT_RARITY_COLORS[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS] } : {}}
        >
          <div className="codex-card-icon">
            {entry.unlocked ? entry.icon : '❓'}
          </div>
          <div className="codex-card-name">
            {entry.unlocked ? entry.name : '???'}
          </div>
          {entry.unlocked && (
            <>
              <div className="codex-card-tags">
                <span className="quality-tag" style={{ background: `${ACHIEVEMENT_RARITY_COLORS[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS]}22`, color: ACHIEVEMENT_RARITY_COLORS[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS] }}>
                  {ACHIEVEMENT_RARITY_NAMES[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_NAMES]}
                </span>
                <span className="magic-type-tag">
                  {MAGIC_TYPE_ICONS[entry.type]} {MAGIC_TYPE_NAMES[entry.type]}
                </span>
              </div>
              <div className="codex-card-desc">{entry.description}</div>
              <div className="codex-card-stats">
                <span>⚔️ 伤害: {entry.damage}</span>
                <span>🔮 消耗: {entry.cost}</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderCodexBuildings = () => (
    <div className="codex-grid">
      {codex.buildings.map(entry => (
        <div
          key={entry.id}
          className={`codex-card ${entry.unlocked ? 'unlocked' : 'locked'}`}
        >
          <div className="codex-card-icon">
            {entry.unlocked ? '🏛️' : '❓'}
          </div>
          <div className="codex-card-name">
            {entry.unlocked ? entry.name : '???'}
          </div>
          {entry.unlocked && (
            <>
              <div className="codex-card-tags">
                <span className="building-tag">
                  最高等级: {entry.highestLevelReached}/{entry.maxLevel}
                </span>
              </div>
              <div className="codex-card-desc">{entry.description}</div>
              <div className="codex-card-stats">
                <div className="level-progress-bar">
                  <div 
                    className="level-progress-fill"
                    style={{ width: `${(entry.highestLevelReached / entry.maxLevel) * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderCodexDungeons = () => (
    <div className="codex-grid">
      {codex.dungeons.map(entry => (
        <div
          key={entry.id}
          className={`codex-card ${entry.unlocked ? 'unlocked' : 'locked'}`}
        >
          <div className="codex-card-icon">
            {entry.unlocked ? '⚔️' : '❓'}
          </div>
          <div className="codex-card-name">
            {entry.unlocked ? entry.name : '???'}
          </div>
          {entry.unlocked && (
            <>
              <div className="codex-card-tags">
                <span className="dungeon-tag">
                  等级 {entry.level}
                </span>
                <span className="stars-tag">
                  {'⭐'.repeat(entry.bestStars)}{'☆'.repeat(3 - entry.bestStars)}
                </span>
              </div>
              <div className="codex-card-desc">{entry.description}</div>
              <div className="codex-card-stats">
                <span>通关次数: {entry.totalClears}</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderCodexEvents = () => {
    if (codex.events.length === 0) {
      return (
        <div className="empty-codex">
          <div className="empty-icon">📜</div>
          <p className="empty-title">暂无事件记录</p>
          <p className="empty-desc">继续游戏，体验更多精彩事件</p>
        </div>
      );
    }
    
    return (
      <div className="codex-grid">
        {codex.events.map(entry => (
          <div
            key={entry.id}
            className="codex-card unlocked"
            style={{ borderColor: ACHIEVEMENT_RARITY_COLORS[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS] }}
          >
            <div className="codex-card-icon">{entry.icon}</div>
            <div className="codex-card-name">{entry.name}</div>
            <div className="codex-card-tags">
              <span 
                className="rarity-tag" 
                style={{ 
                  background: `${ACHIEVEMENT_RARITY_COLORS[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS]}22`, 
                  color: ACHIEVEMENT_RARITY_COLORS[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS] 
                }}
              >
                {ACHIEVEMENT_RARITY_NAMES[entry.rarity as keyof typeof ACHIEVEMENT_RARITY_NAMES]}
              </span>
              <span className="category-tag">
                {entry.category}
              </span>
            </div>
            <div className="codex-card-desc">{entry.description}</div>
            <div className="codex-card-stats">
              <span>经历次数: {entry.timesEncountered}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCodexContent = () => {
    switch (activeCodexTab) {
      case 'student': return renderCodexStudents();
      case 'skill': return renderCodexSkills();
      case 'building': return renderCodexBuildings();
      case 'dungeon': return renderCodexDungeons();
      case 'event': return renderCodexEvents();
      default: return null;
    }
  };

  const filteredAchievements = activeAchievementTab === 'all'
    ? achievement.achievements
    : achievement.achievements.filter(a => a.type === activeAchievementTab);

  const handleClaimReward = (achievementId: string, stageIndex: number) => {
    claimAchievementRewardAction(achievementId, stageIndex);
  };

  const handleEquipTitle = (titleId: string | null) => {
    equipTitleAction(titleId);
  };

  const renderAchievementList = () => (
    <div className="achievement-list">
      {filteredAchievements.map(ach => {
        const isSelected = selectedAchievement === ach.id;
        const progressPercent = ach.totalStages > 0 
          ? Math.min(100, (ach.currentProgress / ach.stages[ach.currentStage]?.target || 1) * 100)
          : 0;
        
        return (
          <div
            key={ach.id}
            className={`achievement-card ${isSelected ? 'selected' : ''}`}
            onClick={() => setSelectedAchievement(isSelected ? null : ach.id)}
            style={getAchievementRarityStyle(ach.rarity)}
          >
            <div className="achievement-header">
              <div className="achievement-icon">{ach.icon}</div>
              <div className="achievement-info">
                <h4 className="achievement-name">{ach.name}</h4>
                <div className="achievement-meta">
                  <span 
                    className="achievement-type"
                    style={{ color: ACHIEVEMENT_RARITY_COLORS[ach.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS] }}
                  >
                    {ACHIEVEMENT_RARITY_NAMES[ach.rarity as keyof typeof ACHIEVEMENT_RARITY_NAMES]}
                  </span>
                  <span className="achievement-stage">
                    阶段 {ach.currentStage}/{ach.totalStages}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="achievement-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${progressPercent}%`,
                    background: ACHIEVEMENT_RARITY_COLORS[ach.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS]
                  }}
                />
              </div>
              <span className="progress-text">
                {ach.currentStage < ach.totalStages 
                  ? `${ach.currentProgress} / ${ach.stages[ach.currentStage]?.target || 0}`
                  : '已完成所有阶段'
                }
              </span>
            </div>

            {isSelected && (
              <div className="achievement-detail">
                <p className="achievement-desc">{ach.description}</p>
                <div className="achievement-stages">
                  <h5>阶段奖励</h5>
                  {ach.stages.map((stage, idx) => (
                    <div 
                      key={idx}
                      className={`stage-item ${stage.unlocked ? 'unlocked' : 'locked'} ${stage.claimed ? 'claimed' : ''}`}
                    >
                      <div className="stage-info">
                        <span className="stage-number">第{stage.stage}阶段</span>
                        <span className="stage-name">{stage.name}</span>
                      </div>
                      <div className="stage-desc">{stage.description}</div>
                      <div className="stage-reward">
                        <span>奖励: </span>
                        {stage.reward.gold && <span>💰{stage.reward.gold} </span>}
                        {stage.reward.mana && <span>🔮{stage.reward.mana} </span>}
                        {stage.reward.food && <span>🍖{stage.reward.food} </span>}
                        {stage.reward.reputation && <span>⭐{stage.reward.reputation} </span>}
                        {stage.reward.titleId && <span className="title-reward">🏆 称号</span>}
                      </div>
                      {stage.unlocked && !stage.claimed && (
                        <button
                          className="claim-reward-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimReward(ach.id, idx);
                          }}
                        >
                          领取奖励
                        </button>
                      )}
                      {stage.claimed && (
                        <span className="claimed-tag">✓ 已领取</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTitles = () => (
    <div className="titles-section">
      <div className="titles-header">
        <h3>我的称号</h3>
        <p className="titles-subtitle">装备称号可获得特殊效果加成</p>
        {achievement.currentEquippedTitle && (
          <div className="current-title">
            <span>当前装备: </span>
            <span className="current-title-name">
              {achievement.titles.find(t => t.id === achievement.currentEquippedTitle)?.icon} 
              {achievement.titles.find(t => t.id === achievement.currentEquippedTitle)?.name}
            </span>
            <button 
              className="unequip-btn"
              onClick={() => handleEquipTitle(null)}
            >
              卸下
            </button>
          </div>
        )}
      </div>
      
      <div className="titles-grid">
        {achievement.titles.map(title => (
          <div
            key={title.id}
            className={`title-card ${title.unlocked ? 'unlocked' : 'locked'} ${title.equipped ? 'equipped' : ''}`}
            style={title.unlocked ? { borderColor: ACHIEVEMENT_RARITY_COLORS[title.rarity as keyof typeof ACHIEVEMENT_RARITY_COLORS] } : {}}
          >
            <div className="title-icon">{title.unlocked ? title.icon : '🔒'}</div>
            <div className="title-name">
              {title.unlocked ? title.name : '???'}
            </div>
            {title.unlocked && (
              <>
                <div className="title-rarity" style={{ color: ACHIEVEMENT_RARITY_COLORS[title.rarity as AchievementRarity] }}>
                  {ACHIEVEMENT_RARITY_NAMES[title.rarity as AchievementRarity]}
                </div>
                <div className="title-desc">{title.description}</div>
                <div className="title-effect">
                  {title.effect.type === 'recruit_quality_bonus' 
                    ? `效果: ${title.effect.type.replace(/_/g, ' ')} +${title.effect.value}`
                    : `效果: ${title.effect.type.replace(/_/g, ' ')} +${(title.effect.value * 100).toFixed(0)}%`
                  }
                </div>
                {title.equipped ? (
                  <span className="equipped-tag">已装备</span>
                ) : (
                  <button
                    className="equip-title-btn"
                    onClick={() => handleEquipTitle(title.id)}
                  >
                    装备
                  </button>
                )}
              </>
            )}
            {!title.unlocked && (
              <div className="title-locked-hint">
                完成对应成就解锁
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="module codex-achievement-module">
      <h2>📖 图鉴与成就中心</h2>

      <div className="main-tabs">
        <button
          className={`main-tab ${activeMainTab === 'codex' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('codex')}
        >
          📚 图鉴收集
          <span className="tab-badge">
            {codex.stats.completionPercent}%
          </span>
        </button>
        <button
          className={`main-tab ${activeMainTab === 'achievement' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('achievement')}
        >
          🏆 成就系统
          <span className="tab-badge">
            {achievement.totalAchievementPoints} 点
          </span>
        </button>
        <button
          className={`main-tab ${activeMainTab === 'title' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('title')}
        >
          👑 称号
          <span className="tab-badge">
            {achievement.titles.filter(t => t.unlocked).length}/{achievement.titles.length}
          </span>
        </button>
      </div>

      {activeMainTab === 'codex' && (
        <>
          <div className="codex-stats-bar">
            <div className="codex-stat">
              <span className="stat-label">收集进度</span>
              <span className="stat-value">{codex.stats.unlockedEntries}/{codex.stats.totalEntries}</span>
            </div>
            <div className="codex-stat">
              <span className="stat-label">完成度</span>
              <span className="stat-value highlight">{codex.stats.completionPercent}%</span>
            </div>
            {Object.entries(codex.stats.byCategory).map(([cat, stats]) => (
              <div key={cat} className="codex-stat small">
                <span className="stat-icon">{CODEX_CATEGORY_ICONS[cat as CodexCategory]}</span>
                <span className="stat-text">{stats.unlocked}/{stats.total}</span>
              </div>
            ))}
          </div>

          <div className="codex-tabs">
            {(Object.keys(CODEX_CATEGORY_NAMES) as CodexCategory[]).map(cat => (
              <button
                key={cat}
                className={`codex-tab ${activeCodexTab === cat ? 'active' : ''}`}
                onClick={() => setActiveCodexTab(cat)}
              >
                {CODEX_CATEGORY_ICONS[cat]} {CODEX_CATEGORY_NAMES[cat]}
                <span className="codex-tab-count">
                  {codex.stats.byCategory[cat].unlocked}
                </span>
              </button>
            ))}
          </div>

          <div className="codex-content">
            {renderCodexContent()}
          </div>
        </>
      )}

      {activeMainTab === 'achievement' && (
        <>
          <div className="achievement-stats-bar">
            <div className="achievement-stat">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">{achievement.totalAchievementPoints}</span>
              <span className="stat-label">成就点数</span>
            </div>
            <div className="achievement-stat">
              <span className="stat-icon">📜</span>
              <span className="stat-value">
                {achievement.achievements.reduce((sum, a) => sum + a.stages.filter(s => s.unlocked).length, 0)}
                /{achievement.achievements.reduce((sum, a) => sum + a.totalStages, 0)}
              </span>
              <span className="stat-label">已完成阶段</span>
            </div>
            <div className="achievement-stat">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">
                {achievement.titles.filter(t => t.unlocked).length}
              </span>
              <span className="stat-label">已解锁称号</span>
            </div>
          </div>

          <div className="achievement-type-tabs">
            <button
              className={`type-tab ${activeAchievementTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveAchievementTab('all')}
            >
              全部
            </button>
            {(Object.keys(ACHIEVEMENT_TYPE_NAMES) as AchievementType[]).map(type => (
              <button
                key={type}
                className={`type-tab ${activeAchievementTab === type ? 'active' : ''}`}
                onClick={() => setActiveAchievementTab(type)}
              >
                {ACHIEVEMENT_TYPE_ICONS[type]} {ACHIEVEMENT_TYPE_NAMES[type]}
              </button>
            ))}
          </div>

          <div className="achievement-content">
            {renderAchievementList()}
          </div>
        </>
      )}

      {activeMainTab === 'title' && renderTitles()}
    </div>
  );
}
