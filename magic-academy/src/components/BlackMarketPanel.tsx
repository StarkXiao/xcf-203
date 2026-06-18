import { useState, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import type { BlackMarketItemCategory, BlackMarketItem } from '../types/game';
import './BlackMarketPanel.css';

export default function BlackMarketPanel() {
  const {
    state,
    unlockBlackMarket,
    refreshBlackMarket,
    buyBlackMarketItem,
    resolveBlackMarketPenalty,
    openMysteryBox,
    BLACK_MARKET_RARITY_COLORS,
    BLACK_MARKET_RARITY_NAMES,
    BLACK_MARKET_CATEGORY_NAMES,
    BLACK_MARKET_CATEGORY_ICONS,
    AUDIT_LEVEL_INFO,
    PENALTY_SEVERITY_COLORS,
    PENALTY_SEVERITY_NAMES,
    canBuyBlackMarketItemCtx,
    getBlackMarketBuildingBonusCtx,
  } = useGame();

  const { blackMarket, resources, day, buildings } = state;
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'penalties' | 'history' | 'stats'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<BlackMarketItemCategory | 'all'>('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const buildingBonus = getBlackMarketBuildingBonusCtx(buildings);
  const auditLevelInfo = AUDIT_LEVEL_INFO[blackMarket.auditLevel];

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return blackMarket.currentItems;
    return blackMarket.currentItems.filter(item => item.category === selectedCategory);
  }, [blackMarket.currentItems, selectedCategory]);

  const categories: Array<{ id: BlackMarketItemCategory | 'all'; name: string; icon: string }> = [
    { id: 'all', name: '全部', icon: '📦' },
    { id: 'rare_ticket', name: BLACK_MARKET_CATEGORY_NAMES.rare_ticket, icon: BLACK_MARKET_CATEGORY_ICONS.rare_ticket },
    { id: 'forbidden_material', name: BLACK_MARKET_CATEGORY_NAMES.forbidden_material, icon: BLACK_MARKET_CATEGORY_ICONS.forbidden_material },
    { id: 'limited_discount', name: BLACK_MARKET_CATEGORY_NAMES.limited_discount, icon: BLACK_MARKET_CATEGORY_ICONS.limited_discount },
    { id: 'mystery_box', name: BLACK_MARKET_CATEGORY_NAMES.mystery_box, icon: BLACK_MARKET_CATEGORY_ICONS.mystery_box },
  ];

  if (!blackMarket.unlocked) {
    const canUnlock = day >= 7 && resources.reputation >= 100;
    return (
      <div className="module-container black-market-module">
        <div className="module-header">
          <h2>🎭 神秘黑市</h2>
        </div>
        <div className="black-market-locked">
          <div className="lock-icon">🎭</div>
          <h3>神秘黑市</h3>
          <p className="lock-desc">在学院的阴影角落，隐藏着一个不为人知的交易市场...</p>
          <div className="lock-requirements">
            <p className={day >= 7 ? 'req-met' : 'req-unmet'}>
              {day >= 7 ? '✅' : '❌'} 学院天数 ≥ 7 天
            </p>
            <p className={resources.reputation >= 100 ? 'req-met' : 'req-unmet'}>
              {resources.reputation >= 100 ? '✅' : '❌'} 学院声望 ≥ 100
            </p>
          </div>
          {canUnlock ? (
            <button className="btn btn-primary btn-large" onClick={unlockBlackMarket}>
              🔓 探索黑市
            </button>
          ) : (
            <p className="lock-hint">满足条件后自动解锁黑市</p>
          )}
        </div>
      </div>
    );
  }

  const handleRefresh = (useFree: boolean = false) => {
    const success = refreshBlackMarket(useFree);
    if (success) {
      showMessage('商品已刷新！', 'success');
    } else {
      showMessage(useFree ? '今日免费刷新次数已用完' : '资源不足，无法刷新', 'error');
    }
  };

  const handleBuy = (item: BlackMarketItem) => {
    const canBuy = canBuyBlackMarketItemCtx(
      item,
      1,
      resources.gold,
      resources.reputation,
      blackMarket.auditValue,
      blackMarket.maxAuditValue,
      buildingBonus
    );
    if (!canBuy.ok) {
      showMessage(canBuy.reason || '无法购买', 'error');
      return;
    }
    const success = buyBlackMarketItem(item.id, 1);
    if (success) {
      showMessage(`成功购买 ${item.name}！`, 'success');
    } else {
      showMessage('购买失败', 'error');
    }
  };

  const handleOpenMysteryBox = (item: BlackMarketItem, tier: number) => {
    const success = openMysteryBox(item.id, tier);
    if (success) {
      showMessage('神秘宝箱已开启！', 'success');
    }
  };

  const handleResolvePenalty = (penaltyId: string) => {
    const success = resolveBlackMarketPenalty(penaltyId);
    if (success) {
      showMessage('处罚已解决！', 'success');
    } else {
      showMessage('资源不足，无法解决处罚', 'error');
    }
  };

  const getDiscountedPrice = (item: BlackMarketItem) => {
    return Math.floor(item.currentPrice * (1 - buildingBonus.priceDiscount));
  };

  return (
    <div className="module-container black-market-module">
      <div className="module-header">
        <h2>🎭 神秘黑市</h2>
        <div className="audit-status">
          <div className="audit-label">审查值</div>
          <div className="audit-bar">
            <div
              className="audit-fill"
              style={{
                width: `${(blackMarket.auditValue / blackMarket.maxAuditValue) * 100}%`,
                backgroundColor: auditLevelInfo.color,
              }}
            />
          </div>
          <div className="audit-value" style={{ color: auditLevelInfo.color }}>
            {blackMarket.auditValue}/{blackMarket.maxAuditValue}
          </div>
          <div className="audit-level" style={{ color: auditLevelInfo.color }}>
            {auditLevelInfo.name}
          </div>
        </div>
      </div>

      {message && (
        <div className={`black-market-message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="sub-tabs">
        {[
          { id: 'shop', name: '商品', icon: '🛒' },
          { id: 'penalties', name: '处罚', icon: '🚨' },
          { id: 'history', name: '记录', icon: '📜' },
          { id: 'stats', name: '统计', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`sub-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
          >
            {tab.icon} {tab.name}
            {tab.id === 'penalties' && blackMarket.activePenalties.length > 0 && (
              <span className="badge-count">{blackMarket.activePenalties.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeSubTab === 'shop' && (
        <div className="shop-section">
          <div className="shop-toolbar">
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            <div className="refresh-section">
              <div className="free-refresh-info">
                免费刷新：{blackMarket.freeRefreshesPerDay - blackMarket.freeRefreshesUsed}/{blackMarket.freeRefreshesPerDay}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handleRefresh(true)}
                disabled={blackMarket.freeRefreshesUsed >= blackMarket.freeRefreshesPerDay}
              >
                免费刷新
              </button>
              <button className="btn btn-primary" onClick={() => handleRefresh(false)}>
                💰 {blackMarket.refreshCost.gold} 金币刷新
              </button>
            </div>
          </div>

          <div className="items-grid">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`item-card rarity-${item.rarity}`}
                style={{ borderColor: BLACK_MARKET_RARITY_COLORS[item.rarity] }}
              >
                <div className="item-header">
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-rarity" style={{ color: BLACK_MARKET_RARITY_COLORS[item.rarity] }}>
                    {BLACK_MARKET_RARITY_NAMES[item.rarity]}
                  </span>
                </div>
                <h3 className="item-name">{item.name}</h3>
                <p className="item-desc">{item.description}</p>
                
                {item.isLimited && (
                  <div className="limited-badge">⏰ 限时特惠</div>
                )}
                
                {item.discount > 0 && (
                  <div className="discount-badge">-{Math.round(item.discount * 100)}%</div>
                )}

                <div className="item-stats">
                  <div className="stat-row">
                    <span>价格</span>
                    <span className="stat-value price">
                      <span className="original-price">{item.basePrice !== item.currentPrice && item.basePrice}</span>
                      💰 {getDiscountedPrice(item)}
                    </span>
                  </div>
                  {item.reputationCost > 0 && (
                    <div className="stat-row">
                      <span>声望消耗</span>
                      <span className="stat-value reputation-cost">⭐ {item.reputationCost}</span>
                    </div>
                  )}
                  <div className="stat-row">
                    <span>审查风险</span>
                    <span className="stat-value audit-risk">⚠️ +{calculateAuditRisk(item.auditRisk, buildingBonus.riskReduction + blackMarket.riskReduction, 1)}</span>
                  </div>
                  <div className="stat-row">
                    <span>库存</span>
                    <span className="stat-value">📦 {item.stock}/{item.maxStock}</span>
                  </div>
                </div>

                {item.category === 'mystery_box' ? (
                  <div className="mystery-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenMysteryBox(item, 1)}
                      disabled={item.stock < 1}
                    >
                      🎁 开启
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary buy-btn"
                    onClick={() => handleBuy(item)}
                    disabled={!canBuyBlackMarketItemCtx(item, 1, resources.gold, resources.reputation, blackMarket.auditValue, blackMarket.maxAuditValue, buildingBonus).ok}
                  >
                    购买
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'penalties' && (
        <div className="penalties-section">
          {blackMarket.activePenalties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>暂无活跃处罚</p>
              <p className="empty-desc">保持审查值在安全范围内可以避免处罚</p>
            </div>
          ) : (
            <div className="penalties-list">
              {blackMarket.activePenalties.map(penalty => (
                <div
                  key={penalty.id}
                  className={`penalty-card severity-${penalty.severity}`}
                  style={{ borderColor: PENALTY_SEVERITY_COLORS[penalty.severity] }}
                >
                  <div className="penalty-header">
                    <span className="penalty-icon">{penalty.icon}</span>
                    <div>
                      <h4 className="penalty-name">{penalty.name}</h4>
                      <span
                        className="penalty-severity"
                        style={{ color: PENALTY_SEVERITY_COLORS[penalty.severity] }}
                      >
                        {PENALTY_SEVERITY_NAMES[penalty.severity]}
                      </span>
                    </div>
                  </div>
                  <p className="penalty-desc">{penalty.description}</p>
                  <div className="penalty-info">
                    <div className="penalty-days">
                      剩余 {penalty.remainingDays} 天
                    </div>
                  </div>
                  {penalty.resolveCost && (
                    <div className="resolve-section">
                      <div className="resolve-cost">
                        解决费用：
                        {penalty.resolveCost.gold && <span>💰 {penalty.resolveCost.gold}</span>}
                        {penalty.resolveCost.reputation && <span>⭐ {penalty.resolveCost.reputation}</span>}
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleResolvePenalty(penalty.id)}
                      >
                        立即解决
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {blackMarket.penaltyHistory.length > 0 && (
            <div className="history-section">
              <h3>历史处罚</h3>
              <div className="history-list">
                {blackMarket.penaltyHistory.slice(-10).reverse().map((penalty, idx) => (
                  <div key={idx} className="history-item">
                    <span>{penalty.icon}</span>
                    <span className="history-name">{penalty.name}</span>
                    <span className="history-severity" style={{ color: PENALTY_SEVERITY_COLORS[penalty.severity] }}>
                      {PENALTY_SEVERITY_NAMES[penalty.severity]}
                    </span>
                    <span className="history-day">第 {penalty.appliedAt} 天</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="history-section">
          <h3>交易记录</h3>
          {blackMarket.transactionHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <p>暂无交易记录</p>
            </div>
          ) : (
            <div className="history-list">
              {blackMarket.transactionHistory.slice(-20).reverse().map((tx, idx) => (
                <div key={idx} className="history-item">
                  <span className="history-type">{tx.type === 'buy' ? '🛒' : '💵'}</span>
                  <span className="history-name">{tx.itemName} ×{tx.quantity}</span>
                  <span className="history-price">💰 {tx.price}</span>
                  <span className="history-audit">
                    {tx.auditChange > 0 ? '⚠️ +' : '✅ '}{tx.auditChange}
                  </span>
                  <span className="history-day">第 {tx.day} 天</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'stats' && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <div className="stat-value">{blackMarket.totalBought}</div>
                <div className="stat-label">总购买数量</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">{blackMarket.totalGoldSpent}</div>
                <div className="stat-label">总消费金币</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <div className="stat-value">{blackMarket.totalAuditGained}</div>
                <div className="stat-label">累计审查值</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{blackMarket.successfulDeals}</div>
                <div className="stat-label">成功交易</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <div className="stat-value">{blackMarket.failedDeals}</div>
                <div className="stat-label">失败交易</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎁</div>
              <div className="stat-info">
                <div className="stat-value">{blackMarket.mysteryBoxOpened}</div>
                <div className="stat-label">神秘宝箱</div>
              </div>
            </div>
          </div>

          <div className="audit-info-card">
            <h3>审查等级说明</h3>
            <div className="audit-levels-list">
              {Object.entries(AUDIT_LEVEL_INFO).map(([level, info]) => (
                <div key={level} className="audit-level-item">
                  <span className="level-dot" style={{ backgroundColor: info.color }}></span>
                  <div>
                    <div className="level-name" style={{ color: info.color }}>{info.name}</div>
                    <div className="level-desc">{info.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bonus-info-card">
            <h3>建筑加成</h3>
            <div className="bonus-list">
              <div className="bonus-item">
                <span>💰 价格折扣</span>
                <span className="bonus-value">-{Math.round(buildingBonus.priceDiscount * 100)}%</span>
              </div>
              <div className="bonus-item">
                <span>📦 商品栏位</span>
                <span className="bonus-value">+{buildingBonus.itemSlotBonus}</span>
              </div>
              <div className="bonus-item">
                <span>🛡️ 风险降低</span>
                <span className="bonus-value">-{Math.round(buildingBonus.riskReduction * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateAuditRisk(baseRisk: number, reduction: number, quantity: number = 1): number {
  return Math.ceil(baseRisk * (1 - reduction) * quantity);
}
