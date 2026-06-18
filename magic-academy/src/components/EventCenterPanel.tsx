import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { AcademyEventRarity, AcademyEventCategory } from '../types/game';

export default function EventCenterPanel() {
  const {
    state,
    resolveEventCenter,
    dismissEventCenter,
    EVENT_RARITY_COLORS,
    EVENT_RARITY_NAMES,
    EVENT_CATEGORY_ICONS,
    EVENT_CATEGORY_NAMES,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'stats'>(
    state.eventCenter.currentEvent ? 'current' : 'history'
  );
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);

  const { eventCenter } = state;
  const { currentEvent, eventHistory, stats, unlocked } = eventCenter;

  if (!unlocked) {
    return (
      <div className="module event-center-module">
        <h2>🎪 事件中心</h2>
        <div className="ec-locked">
          <div className="ec-locked-icon">🎪</div>
          <p className="ec-locked-title">事件中心尚未开启</p>
          <p className="ec-locked-desc">当学院运营到第3天且拥有至少1名学员时，事件中心将自动开启</p>
        </div>
      </div>
    );
  }

  const getRarityStyle = (rarity: AcademyEventRarity) => ({
    color: EVENT_RARITY_COLORS[rarity],
    borderColor: EVENT_RARITY_COLORS[rarity],
  });

  const getCategoryIcon = (cat: AcademyEventCategory) => EVENT_CATEGORY_ICONS[cat];
  const getCategoryName = (cat: AcademyEventCategory) => EVENT_CATEGORY_NAMES[cat];
  const getRarityName = (rarity: AcademyEventRarity) => EVENT_RARITY_NAMES[rarity];

  const formatResourceChange = (change: Partial<{ gold: number; mana: number; food: number; reputation: number }>) => {
    const parts: string[] = [];
    if (change.gold) parts.push(`💰${change.gold > 0 ? '+' : ''}${change.gold}`);
    if (change.mana) parts.push(`🔮${change.mana > 0 ? '+' : ''}${change.mana}`);
    if (change.food) parts.push(`🍖${change.food > 0 ? '+' : ''}${change.food}`);
    if (change.reputation) parts.push(`⭐${change.reputation > 0 ? '+' : ''}${change.reputation}`);
    return parts.join(' ');
  };

  return (
    <div className="module event-center-module">
      <h2>🎪 事件中心</h2>

      <div className="ec-tabs">
        <button
          className={`ec-tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          📢 当前事件 {currentEvent && <span className="ec-badge">!</span>}
        </button>
        <button
          className={`ec-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 历史记录 ({eventHistory.length})
        </button>
        <button
          className={`ec-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 统计概览
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="ec-current">
          {currentEvent ? (
            <div className="ec-event-active">
              <div className="ec-event-header" style={getRarityStyle(currentEvent.rarity)}>
                <div className="ec-event-icon">{currentEvent.icon}</div>
                <div className="ec-event-info">
                  <h3 className="ec-event-name">{currentEvent.name}</h3>
                  <div className="ec-event-meta">
                    <span className="ec-rarity-tag" style={{ background: `${EVENT_RARITY_COLORS[currentEvent.rarity]}22`, ...getRarityStyle(currentEvent.rarity) }}>
                      {getRarityName(currentEvent.rarity)}
                    </span>
                    <span className="ec-category-tag">
                      {getCategoryIcon(currentEvent.category)} {getCategoryName(currentEvent.category)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="ec-event-desc">{currentEvent.description}</p>

              <div className="ec-choices">
                <h4>作出决策</h4>
                {currentEvent.choices.map(choice => (
                  <div key={choice.id} className="ec-choice-card">
                    <div className="ec-choice-header">
                      <span className="ec-choice-text">{choice.text}</span>
                      {choice.riskProbability != null && choice.riskProbability > 0 && (
                        <span className="ec-risk-tag">
                          ⚠️ 风险 {Math.round(choice.riskProbability * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="ec-choice-desc">{choice.description}</p>
                    <div className="ec-choice-effects">
                      <span className="ec-effect-label">效果：</span>
                      <span className={`ec-effect-value ${Object.values(choice.resourceChange).some(v => (v || 0) > 0) ? 'positive' : ''}`}>
                        {formatResourceChange(choice.resourceChange)}
                      </span>
                      {choice.moraleChange != null && choice.moraleChange !== 0 && (
                        <span className={`ec-effect-extra ${choice.moraleChange > 0 ? 'positive' : 'negative'}`}>
                          士气{choice.moraleChange > 0 ? '+' : ''}{choice.moraleChange}
                        </span>
                      )}
                      {choice.staminaChange != null && choice.staminaChange !== 0 && (
                        <span className={`ec-effect-extra ${choice.staminaChange > 0 ? 'positive' : 'negative'}`}>
                          体力{choice.staminaChange > 0 ? '+' : ''}{choice.staminaChange}
                        </span>
                      )}
                      {choice.reputationBonus != null && choice.reputationBonus > 0 && (
                        <span className="ec-effect-extra positive">
                          额外声望+{choice.reputationBonus}
                        </span>
                      )}
                    </div>
                    {choice.riskProbability != null && choice.riskProbability > 0 && (
                      <div className="ec-risk-info">
                        <span className="ec-risk-label">风险失败：</span>
                        {choice.riskResourceLoss && (
                          <span className="ec-effect-value negative">
                            {formatResourceChange(choice.riskResourceLoss)}
                          </span>
                        )}
                        {choice.riskMoraleLoss != null && choice.riskMoraleLoss < 0 && (
                          <span className="ec-effect-extra negative">
                            士气{choice.riskMoraleLoss}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="ec-choice-actions">
                      <button
                        className="ec-choice-btn"
                        style={{ borderColor: EVENT_RARITY_COLORS[currentEvent.rarity], color: EVENT_RARITY_COLORS[currentEvent.rarity] }}
                        onClick={() => resolveEventCenter(choice.id)}
                      >
                        选择此方案
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ec-dismiss">
                <button className="ec-dismiss-btn" onClick={dismissEventCenter}>
                  忽略此事件
                </button>
              </div>
            </div>
          ) : (
            <div className="ec-no-event">
              <div className="ec-no-event-icon">🌅</div>
              <p className="ec-no-event-title">当前没有待处理事件</p>
              <p className="ec-no-event-desc">每日推进时可能会触发随机事件，请留意通知</p>
              <div className="ec-event-chance">
                <span>事件触发概率：{Math.round(eventCenter.eventChance * 100)}%</span>
                <span>最短间隔：{eventCenter.minDaysBetweenEvents}天</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="ec-history">
          {eventHistory.length === 0 ? (
            <div className="ec-empty">
              <div className="ec-empty-icon">📋</div>
              <p className="ec-empty-title">暂无事件记录</p>
              <p className="ec-empty-desc">处理事件后，记录将显示在这里</p>
            </div>
          ) : (
            <div className="ec-history-layout">
              <div className="ec-history-list">
                {[...eventHistory].reverse().map((inst, idx) => {
                  const eventDef = inst.eventId;
                  const isRisk = inst.wasRiskTriggered;
                  return (
                    <div
                      key={inst.id}
                      className={`ec-history-item ${selectedHistoryIdx === idx ? 'selected' : ''} ${isRisk ? 'risk' : 'safe'}`}
                      onClick={() => setSelectedHistoryIdx(selectedHistoryIdx === idx ? null : idx)}
                    >
                      <div className="ec-history-item-header">
                        <span className="ec-history-day">第{inst.day}天</span>
                        <span className={`ec-history-result ${isRisk ? 'risk' : 'safe'}`}>
                          {isRisk ? '⚠️ 风险触发' : '✅ 顺利'}
                        </span>
                      </div>
                      <p className="ec-history-outcome">{inst.outcomeText}</p>
                      <div className="ec-history-changes">
                        {formatResourceChange(inst.resourceChange)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="ec-stats">
          <div className="ec-stats-grid">
            <div className="ec-stat-card">
              <span className="ec-stat-value">{stats.totalEvents}</span>
              <span className="ec-stat-label">总事件数</span>
            </div>
            <div className="ec-stat-card">
              <span className="ec-stat-value positive">{stats.risksAvoided}</span>
              <span className="ec-stat-label">风险规避</span>
            </div>
            <div className="ec-stat-card">
              <span className="ec-stat-value negative">{stats.risksTriggered}</span>
              <span className="ec-stat-label">风险触发</span>
            </div>
            <div className="ec-stat-card">
              <span className="ec-stat-value">{stats.maxStreak}</span>
              <span className="ec-stat-label">最长连续顺利</span>
            </div>
          </div>

          <div className="ec-stats-section">
            <h4>📊 事件分类统计</h4>
            <div className="ec-category-stats">
              {(Object.entries(stats.eventsByCategory) as [AcademyEventCategory, number][]).map(([cat, count]) => (
                <div key={cat} className="ec-category-row">
                  <span className="ec-category-icon">{getCategoryIcon(cat)}</span>
                  <span className="ec-category-name">{getCategoryName(cat)}</span>
                  <span className="ec-category-count">{count}</span>
                  <div className="ec-category-bar">
                    <div
                      className="ec-category-bar-fill"
                      style={{ width: `${stats.totalEvents > 0 ? (count / stats.totalEvents) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ec-stats-section">
            <h4>💎 品质分布</h4>
            <div className="ec-rarity-stats">
              {(Object.entries(stats.eventsByRarity) as [AcademyEventRarity, number][]).map(([rarity, count]) => (
                <div key={rarity} className="ec-rarity-row">
                  <span className="ec-rarity-tag-sm" style={{ color: EVENT_RARITY_COLORS[rarity] }}>
                    {getRarityName(rarity)}
                  </span>
                  <span className="ec-rarity-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ec-stats-section">
            <h4>💰 资源收支</h4>
            <div className="ec-resource-stats">
              <div className="ec-resource-row">
                <span className="ec-resource-label">总获得</span>
                <span className="ec-resource-value positive">
                  💰{stats.totalResourceGained.gold} 🔮{stats.totalResourceGained.mana} 🍖{stats.totalResourceGained.food} ⭐{stats.totalResourceGained.reputation}
                </span>
              </div>
              <div className="ec-resource-row">
                <span className="ec-resource-label">总损失</span>
                <span className="ec-resource-value negative">
                  💰{stats.totalResourceLost.gold} 🔮{stats.totalResourceLost.mana} 🍖{stats.totalResourceLost.food} ⭐{stats.totalResourceLost.reputation}
                </span>
              </div>
              <div className="ec-resource-row">
                <span className="ec-resource-label">净收益</span>
                <span className={`ec-resource-value ${stats.totalResourceGained.gold - stats.totalResourceLost.gold >= 0 ? 'positive' : 'negative'}`}>
                  💰{stats.totalResourceGained.gold - stats.totalResourceLost.gold} 🔮{stats.totalResourceGained.mana - stats.totalResourceLost.mana} 🍖{stats.totalResourceGained.food - stats.totalResourceLost.food} ⭐{stats.totalResourceGained.reputation - stats.totalResourceLost.reputation}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
