import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { TradeMaterialType, TradeOrderType } from '../types/game';
import './TradeHarborPanel.css';

export default function TradeHarborPanel() {
  const {
    state,
    unlockTradeHarbor,
    placeTradeOrder,
    cancelTradeOrder,
    upgradeWarehouse,
    TRADE_MATERIALS,
    getTradeMaterial,
    getRouteInfo,
    calculateTradePriceBonus,
    getTradeBuildingBonuses,
    calculateWarehouseCapacity,
    getTotalWarehouseUsed,
    canPlaceBuyOrder,
    canPlaceSellOrder,
    calculateShipmentDuration,
    calculateShipmentRisk,
  } = useGame();

  const { tradeHarbor, resources, day, buildings } = state;
  const [selectedMaterial, setSelectedMaterial] = useState<TradeMaterialType>('mana_crystal');
  const [orderType, setOrderType] = useState<TradeOrderType>('buy');
  const [quantity, setQuantity] = useState<number>(10);
  const [route, setRoute] = useState<'local' | 'regional' | 'intercontinental'>('local');
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'orders' | 'warehouse' | 'history' | 'stats'>('market');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const tradeHarborBuilding = buildings.find(b => b.id === 'trade_harbor');
  const bonuses = getTradeBuildingBonuses(buildings);
  const warehouseCapacity = calculateWarehouseCapacity(buildings, bonuses.capacityBonus);
  const warehouseUsed = getTotalWarehouseUsed(tradeHarbor.materials);
  const buyMultiplier = calculateTradePriceBonus('buy', bonuses.priceBonus);
  const sellMultiplier = calculateTradePriceBonus('sell', bonuses.priceBonus);

  if (!tradeHarborBuilding || tradeHarborBuilding.level === 0) {
    return (
      <div className="module-container trade-harbor-module">
        <div className="module-header">
          <h2>🏛️ 学院贸易港</h2>
        </div>
        <div className="trade-locked">
          <div className="lock-icon">🔒</div>
          <h3>贸易港尚未建造</h3>
          <p className="lock-desc">请先在「建筑」页面建造「贸易港」以启用此功能</p>
          <p className="lock-requirement">需要：主楼 Lv.3 + 声望 100</p>
        </div>
      </div>
    );
  }

  if (!tradeHarbor.unlocked) {
    return (
      <div className="module-container trade-harbor-module">
        <div className="module-header">
          <h2>🏛️ 学院贸易港</h2>
        </div>
        <div className="trade-locked">
          <div className="lock-icon">🏗️</div>
          <h3>贸易港待启用</h3>
          <p className="lock-desc">贸易港建筑已就绪，点击下方按钮启用贸易系统</p>
          <button className="btn btn-primary btn-large" onClick={unlockTradeHarbor}>
            🚀 启用贸易港
          </button>
        </div>
      </div>
    );
  }

  const selectedMaterialInfo = getTradeMaterial(selectedMaterial);
  const basePrice = tradeHarbor.currentPrices[selectedMaterial];
  const effectiveBuyPrice = Math.round(basePrice * buyMultiplier);
  const effectiveSellPrice = Math.round(basePrice * sellMultiplier);
  const trend = tradeHarbor.priceTrends[selectedMaterial];
  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  const trendColor = trend === 'up' ? '#ff6b6b' : trend === 'down' ? '#51cf66' : '#adb5bd';

  const duration = calculateShipmentDuration(route, bonuses.transportSpeedBonus);

  const canBuy = canPlaceBuyOrder(
    selectedMaterial, quantity, resources.gold,
    effectiveBuyPrice, tradeHarbor.materials, warehouseCapacity
  );
  const canSell = canPlaceSellOrder(selectedMaterial, quantity, tradeHarbor.materials);

  const handlePlaceOrder = () => {
    if (orderType === 'buy' && !canBuy.ok) {
      showMessage(canBuy.reason || '无法创建采购订单', 'error');
      return;
    }
    if (orderType === 'sell' && !canSell.ok) {
      showMessage(canSell.reason || '无法创建销售订单', 'error');
      return;
    }
    const ok = placeTradeOrder(orderType, selectedMaterial, quantity, route);
    if (ok) {
      showMessage(
        orderType === 'buy'
          ? `📦 采购订单已创建：${selectedMaterialInfo.icon}${selectedMaterialInfo.name} ×${quantity}`
          : `📤 销售订单已创建：${selectedMaterialInfo.icon}${selectedMaterialInfo.name} ×${quantity}`,
        'success'
      );
      setQuantity(10);
    } else {
      showMessage('订单创建失败，请检查条件', 'error');
    }
  };

  const handleUpgradeWarehouse = () => {
    const ok = upgradeWarehouse();
    if (ok) {
      showMessage('📦 仓库扩容成功！', 'success');
    } else {
      showMessage('资源不足，无法扩容仓库', 'error');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('确定取消此订单？将扣除30%违约金')) {
      cancelTradeOrder(orderId);
      showMessage('订单已取消', 'info');
    }
  };

  const recentPrices = tradeHarbor.priceHistory.slice(-7);
  const priceChangePercent = recentPrices.length >= 2
    ? ((basePrice - recentPrices[0].prices[selectedMaterial]) / recentPrices[0].prices[selectedMaterial] * 100).toFixed(1)
    : '0.0';

  return (
    <div className="module-container trade-harbor-module">
      <div className="module-header">
        <h2>🏛️ 学院贸易港</h2>
        <div className="trade-bonus-badges">
          {bonuses.priceBonus > 0 && (
            <span className="badge badge-price">💱 价格 {(bonuses.priceBonus * 2).toFixed(0)}%</span>
          )}
          {bonuses.capacityBonus > 0 && (
            <span className="badge badge-capacity">📦 容量 +{bonuses.capacityBonus * 100}</span>
          )}
          {bonuses.transportSpeedBonus > 0 && (
            <span className="badge badge-speed">⚡ 速度 {(bonuses.transportSpeedBonus * 10).toFixed(0)}%</span>
          )}
          {bonuses.riskReduction > 0 && (
            <span className="badge badge-safety">🛡️ 安全 +{(bonuses.riskReduction * 100).toFixed(0)}%</span>
          )}
        </div>
      </div>

      {message && (
        <div className={`trade-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="trade-sub-tabs">
        <button
          className={`sub-tab ${activeSubTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('market')}
        >
          📊 材料市场
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('orders')}
        >
          📋 订单运输
          {tradeHarbor.activeOrders.length > 0 && (
            <span className="order-count">{tradeHarbor.activeOrders.length}</span>
          )}
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'warehouse' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('warehouse')}
        >
          📦 仓储管理
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          📜 历史记录
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('stats')}
        >
          📈 统计数据
        </button>
      </div>

      {activeSubTab === 'market' && (
        <div className="market-content">
          <div className="market-left">
            <div className="material-list">
              <h4>📚 材料列表</h4>
              <div className="materials-grid">
                {TRADE_MATERIALS.map(mat => {
                  const price = tradeHarbor.currentPrices[mat.id];
                  const t = tradeHarbor.priceTrends[mat.id];
                  const tIcon = t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️';
                  const tColor = t === 'up' ? '#ff6b6b' : t === 'down' ? '#51cf66' : '#adb5bd';
                  return (
                    <div
                      key={mat.id}
                      className={`material-card ${selectedMaterial === mat.id ? 'selected' : ''}`}
                      onClick={() => setSelectedMaterial(mat.id)}
                    >
                      <div className="material-icon">{mat.icon}</div>
                      <div className="material-name">{mat.name}</div>
                      <div className="material-price-row">
                        <span className="price-value">{price}</span>
                        <span className="trend-icon" style={{ color: tColor }}>{tIcon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="market-right">
            <div className="material-detail">
              <div className="detail-header">
                <span className="detail-icon">{selectedMaterialInfo.icon}</span>
                <div>
                  <h4>{selectedMaterialInfo.name}</h4>
                  <p className="material-category">
                    {selectedMaterialInfo.category === 'consumable' ? '消耗品' :
                     selectedMaterialInfo.category === 'rare' ? '珍稀品' : '违禁品'}
                  </p>
                </div>
              </div>
              <p className="material-desc">{selectedMaterialInfo.description}</p>

              <div className="price-info-grid">
                <div className="price-cell">
                  <span className="label">基准价</span>
                  <span className="value">{selectedMaterialInfo.basePrice} 💰</span>
                </div>
                <div className="price-cell">
                  <span className="label">当前价</span>
                  <span className="value trend" style={{ color: trendColor }}>
                    {basePrice} 💰 {trendIcon}
                  </span>
                </div>
                <div className="price-cell">
                  <span className="label">采购价</span>
                  <span className="value buy-price">{effectiveBuyPrice} 💰</span>
                </div>
                <div className="price-cell">
                  <span className="label">销售价</span>
                  <span className="value sell-price">{effectiveSellPrice} 💰</span>
                </div>
                <div className="price-cell">
                  <span className="label">7日变化</span>
                  <span
                    className="value"
                    style={{ color: Number(priceChangePercent) > 0 ? '#ff6b6b' : Number(priceChangePercent) < 0 ? '#51cf66' : 'inherit' }}
                  >
                    {Number(priceChangePercent) > 0 ? '+' : ''}{priceChangePercent}%
                  </span>
                </div>
                <div className="price-cell">
                  <span className="label">波动率</span>
                  <span className="value">±{(selectedMaterialInfo.volatility * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="price-chart-mini">
                {(() => {
                  const prices = recentPrices.map(r => r.prices[selectedMaterial]);
                  const max = Math.max(...prices);
                  const min = Math.min(...prices);
                  const range = max - min || 1;
                  return recentPrices.map(r => {
                    const height = ((r.prices[selectedMaterial] - min) / range) * 60 + 20;
                    return (
                      <div key={r.day} className="chart-bar" style={{ height: `${height}%` }} title={`第${r.day}日: ${r.prices[selectedMaterial]}`}>
                        <span className="chart-tooltip">{r.prices[selectedMaterial]}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="order-form">
              <h4>🧾 创建订单</h4>
              <div className="order-type-toggle">
                <button
                  className={`toggle-btn buy ${orderType === 'buy' ? 'active' : ''}`}
                  onClick={() => setOrderType('buy')}
                >
                  🛒 采购
                </button>
                <button
                  className={`toggle-btn sell ${orderType === 'sell' ? 'active' : ''}`}
                  onClick={() => setOrderType('sell')}
                >
                  💼 销售
                </button>
              </div>

              <div className="form-row">
                <label>数量</label>
                <div className="quantity-input-group">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 10))}>-10</button>
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-1</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+1</button>
                  <button className="qty-btn" onClick={() => setQuantity(quantity + 10)}>+10</button>
                  {orderType === 'buy' && (
                    <button className="qty-btn max-btn" onClick={() => {
                      const maxQty = Math.floor(resources.gold / effectiveBuyPrice);
                      setQuantity(Math.max(1, maxQty));
                    }}>最大</button>
                  )}
                  {orderType === 'sell' && (
                    <button className="qty-btn max-btn" onClick={() => setQuantity(tradeHarbor.materials[selectedMaterial] || 1)}>全部</button>
                  )}
                </div>
              </div>

              <div className="form-row">
                <label>运输路线</label>
                <div className="route-options">
                  {(['local', 'regional', 'intercontinental'] as const).map(r => {
                    const info = getRouteInfo(r);
                    const d = calculateShipmentDuration(r, bonuses.transportSpeedBonus);
                    const rr = calculateShipmentRisk(r, bonuses.riskReduction);
                    return (
                      <button
                        key={r}
                        className={`route-card ${route === r ? 'active' : ''}`}
                        onClick={() => setRoute(r)}
                      >
                        <div className="route-icon">{info.icon}</div>
                        <div className="route-name">{info.name}</div>
                        <div className="route-meta">
                          <span>⏱️ {d}日</span>
                          <span style={{ color: rr > 0.15 ? '#ff6b6b' : rr > 0.05 ? '#ffd43b' : '#51cf66' }}>
                            ⚠️ {(rr * 100).toFixed(0)}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>单价</span>
                  <span>{orderType === 'buy' ? effectiveBuyPrice : effectiveSellPrice} 💰</span>
                </div>
                <div className="summary-row">
                  <span>数量</span>
                  <span>×{quantity}</span>
                </div>
                <div className="summary-row total">
                  <span>{orderType === 'buy' ? '总支出' : '总收入'}</span>
                  <span>{(orderType === 'buy' ? effectiveBuyPrice : effectiveSellPrice) * quantity} 💰</span>
                </div>
                <div className="summary-row">
                  <span>预计到货</span>
                  <span>第 {day + duration} 日</span>
                </div>
                {orderType === 'buy' && (
                  <div className="summary-row subtle">
                    <span>当前库存</span>
                    <span>{tradeHarbor.materials[selectedMaterial] || 0}</span>
                  </div>
                )}
                {orderType === 'sell' && (
                  <div className="summary-row subtle">
                    <span>可售库存</span>
                    <span style={{ color: (tradeHarbor.materials[selectedMaterial] || 0) >= quantity ? '#51cf66' : '#ff6b6b' }}>
                      {tradeHarbor.materials[selectedMaterial] || 0}
                    </span>
                  </div>
                )}
              </div>

              <button
                className={`btn btn-large ${orderType === 'buy' ? 'btn-buy' : 'btn-sell'}`}
                onClick={handlePlaceOrder}
                disabled={(orderType === 'buy' ? !canBuy.ok : !canSell.ok)}
              >
                {orderType === 'buy' ? '🛒 创建采购订单' : '💼 创建销售订单'}
              </button>
              {orderType === 'buy' && !canBuy.ok && (
                <p className="form-hint error">{canBuy.reason}</p>
              )}
              {orderType === 'sell' && !canSell.ok && (
                <p className="form-hint error">{canSell.reason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'orders' && (
        <div className="orders-content">
          {tradeHarbor.activeShipments.length === 0 && tradeHarbor.activeOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>暂无进行中的订单，去材料市场开始贸易吧！</p>
            </div>
          ) : (
            <div className="shipments-list">
              <h4>🚚 运输中的货物</h4>
              {tradeHarbor.activeShipments.length === 0 ? (
                <p className="empty-hint">暂无运输中的货物</p>
              ) : (
                <div className="shipments-grid">
                  {tradeHarbor.activeShipments.map(shipment => {
                    const order = tradeHarbor.activeOrders.find(o => o.id === shipment.orderId);
                    const mat = getTradeMaterial(shipment.materialId);
                    const routeInf = getRouteInfo(shipment.route);
                    const progress = Math.min(100, ((day - shipment.startDay) / shipment.durationDays) * 100);
                    const daysLeft = Math.max(0, shipment.estimatedArrival - day);
                    return (
                      <div key={shipment.id} className="shipment-card">
                        <div className="shipment-header">
                          <div className="shipment-type-badge">
                            {order?.type === 'buy' ? '📥 采购' : '📤 销售'}
                          </div>
                          <div className="shipment-status">
                            {daysLeft === 0 ? '🏁 即将到达' : `⏱️ 还剩${daysLeft}日`}
                          </div>
                        </div>
                        <div className="shipment-body">
                          <div className="shipment-material">
                            <span className="big-icon">{mat.icon}</span>
                            <div>
                              <div className="mat-name">{mat.name}</div>
                              <div className="mat-qty">×{shipment.quantity}</div>
                            </div>
                          </div>
                          <div className="shipment-info-grid">
                            <div>
                              <span className="label">路线</span>
                              <span>{routeInf.icon} {routeInf.name}</span>
                            </div>
                            <div>
                              <span className="label">风险</span>
                              <span style={{ color: shipment.risk > 0.15 ? '#ff6b6b' : shipment.risk > 0.05 ? '#ffd43b' : '#51cf66' }}>
                                {(shipment.risk * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div>
                              <span className="label">出发日</span>
                              <span>第{shipment.startDay}日</span>
                            </div>
                            <div>
                              <span className="label">预计到港</span>
                              <span>第{shipment.estimatedArrival}日</span>
                            </div>
                            <div>
                              <span className="label">{order?.type === 'buy' ? '总支出' : '总收入'}</span>
                              <span>{order?.totalPrice} 💰</span>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                            <span className="progress-text">{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="shipment-footer">
                          <button
                            className="btn btn-outline btn-small"
                            onClick={() => order && handleCancelOrder(order.id)}
                          >
                            ❌ 取消订单
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'warehouse' && (
        <div className="warehouse-content">
          <div className="warehouse-overview">
            <div className="warehouse-capacity-card">
              <h4>📦 仓库容量</h4>
              <div className="capacity-bar">
                <div
                  className="capacity-fill"
                  style={{
                    width: `${Math.min(100, (warehouseUsed / warehouseCapacity) * 100)}%`,
                    background: warehouseUsed / warehouseCapacity > 0.9 ? '#ff6b6b' : warehouseUsed / warehouseCapacity > 0.7 ? '#ffd43b' : '#51cf66'
                  }}
                />
                <span className="capacity-text">
                  {warehouseUsed} / {warehouseCapacity}
                </span>
              </div>
              <p className="capacity-sub">
                使用率 {((warehouseUsed / warehouseCapacity) * 100).toFixed(1)}%
              </p>

              <div className="upgrade-warehouse-section">
                <h5>🏗️ 仓库扩容</h5>
                <p className="upgrade-desc">扩容后容量 +50</p>
                <div className="upgrade-cost">
                  <span>💰 {tradeHarbor.warehouse.upgradeCost.gold}</span>
                  <span>💎 {tradeHarbor.warehouse.upgradeCost.mana}</span>
                  <span>🍞 {tradeHarbor.warehouse.upgradeCost.food}</span>
                  <span>⭐ {tradeHarbor.warehouse.upgradeCost.reputation}</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleUpgradeWarehouse}
                >
                  📦 扩容仓库 (+50)
                </button>
              </div>
            </div>
          </div>

          <div className="warehouse-inventory">
            <h4>📋 库存明细</h4>
            <div className="inventory-grid">
              {TRADE_MATERIALS.map(mat => {
                const qty = tradeHarbor.materials[mat.id] || 0;
                const price = tradeHarbor.currentPrices[mat.id];
                const value = qty * price;
                return (
                  <div key={mat.id} className={`inventory-item ${qty > 0 ? 'has-stock' : ''}`}>
                    <div className="inv-left">
                      <span className="inv-icon">{mat.icon}</span>
                      <div>
                        <div className="inv-name">{mat.name}</div>
                        <div className="inv-price">单价 {price} 💰</div>
                      </div>
                    </div>
                    <div className="inv-right">
                      <div className="inv-qty">{qty}</div>
                      <div className="inv-value">≈ {value} 💰</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="inventory-summary">
              <span>📦 库存总价值：</span>
              <strong>
                {TRADE_MATERIALS.reduce((sum, m) => sum + (tradeHarbor.materials[m.id] || 0) * tradeHarbor.currentPrices[m.id], 0)} 💰
              </strong>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="history-content">
          {tradeHarbor.historyOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <p>暂无历史记录</p>
            </div>
          ) : (
            <div className="history-list">
              <h4>📜 历史订单（最近30条）</h4>
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>类型</th>
                      <th>材料</th>
                      <th>数量</th>
                      <th>单价</th>
                      <th>总价</th>
                      <th>损益</th>
                      <th>创建日</th>
                      <th>完成日</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...tradeHarbor.historyOrders].reverse().slice(0, 30).map(order => {
                      const mat = getTradeMaterial(order.materialId);
                      return (
                        <tr key={order.id}>
                          <td>
                            <span className={`order-type-tag ${order.type}`}>
                              {order.type === 'buy' ? '📥 采购' : '📤 销售'}
                            </span>
                          </td>
                          <td>{mat.icon} {mat.name}</td>
                          <td>×{order.quantity}</td>
                          <td>{order.unitPrice}</td>
                          <td>{order.totalPrice}</td>
                          <td style={{ color: (order.profitLoss || 0) > 0 ? '#51cf66' : (order.profitLoss || 0) < 0 ? '#ff6b6b' : 'inherit' }}>
                            {(order.profitLoss || 0) > 0 ? '+' : ''}{order.profitLoss || 0}
                          </td>
                          <td>D{order.createdAt}</td>
                          <td>D{order.fulfilledAt || '-'}</td>
                          <td>
                            <span className={`status-tag ${order.status}`}>
                              {order.status === 'completed' ? '✅ 完成' : order.status === 'cancelled' ? '❌ 取消' : '未知'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'stats' && (
        <div className="stats-content">
          <div className="stats-grid">
            <div className="stat-card total-volume">
              <div className="stat-icon">💹</div>
              <div className="stat-label">累计交易额</div>
              <div className="stat-value">{tradeHarbor.stats.totalVolume.toLocaleString()} 💰</div>
            </div>
            <div className="stat-card total-trades">
              <div className="stat-icon">📊</div>
              <div className="stat-label">总交易次数</div>
              <div className="stat-value">{tradeHarbor.stats.totalTrades} 次</div>
            </div>
            <div className="stat-card buys">
              <div className="stat-icon">📥</div>
              <div className="stat-label">完成采购</div>
              <div className="stat-value">{tradeHarbor.stats.completedBuys} 笔</div>
            </div>
            <div className="stat-card sells">
              <div className="stat-icon">📤</div>
              <div className="stat-label">完成销售</div>
              <div className="stat-value">{tradeHarbor.stats.completedSells} 笔</div>
            </div>
            <div className="stat-card profit">
              <div className="stat-icon">💰</div>
              <div className="stat-label">累计盈利</div>
              <div className="stat-value" style={{ color: '#51cf66' }}>+{tradeHarbor.stats.totalProfit.toLocaleString()}</div>
            </div>
            <div className="stat-card loss">
              <div className="stat-icon">💸</div>
              <div className="stat-label">累计亏损</div>
              <div className="stat-value" style={{ color: '#ff6b6b' }}>-{tradeHarbor.stats.totalLoss.toLocaleString()}</div>
            </div>
            <div className="stat-card net">
              <div className="stat-icon">📈</div>
              <div className="stat-label">净收益</div>
              <div
                className="stat-value"
                style={{ color: (tradeHarbor.stats.totalProfit - tradeHarbor.stats.totalLoss) >= 0 ? '#51cf66' : '#ff6b6b' }}
              >
                {(tradeHarbor.stats.totalProfit - tradeHarbor.stats.totalLoss) >= 0 ? '+' : ''}
                {(tradeHarbor.stats.totalProfit - tradeHarbor.stats.totalLoss).toLocaleString()}
              </div>
            </div>
            <div className="stat-card best">
              <div className="stat-icon">🏆</div>
              <div className="stat-label">最佳单笔</div>
              <div className="stat-value" style={{ color: tradeHarbor.stats.bestTrade > 0 ? '#51cf66' : 'inherit' }}>
                {tradeHarbor.stats.bestTrade > 0 ? '+' : ''}{tradeHarbor.stats.bestTrade}
              </div>
            </div>
            <div className="stat-card worst">
              <div className="stat-icon">📉</div>
              <div className="stat-label">最差单笔</div>
              <div className="stat-value" style={{ color: tradeHarbor.stats.worstTrade < 0 ? '#ff6b6b' : 'inherit' }}>
                {tradeHarbor.stats.worstTrade}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
