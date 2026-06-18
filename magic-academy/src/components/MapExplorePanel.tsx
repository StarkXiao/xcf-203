import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { MapAreaId, MapArea, MapGatheringNode, MapRoute, MapAreaRarity, MapAreaStatus, MapEventCategory, GatheringNodeType, RouteType } from '../types/game';
import './MapExplorePanel.css';

const RARITY_COLORS: Record<MapAreaRarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

const RARITY_NAMES: Record<MapAreaRarity, string> = {
  common: '普通',
  uncommon: '优质',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const STATUS_NAMES: Record<MapAreaStatus, string> = {
  locked: '未解锁',
  unlocked: '已解锁',
  explored: '已探索',
  mastered: '已精通',
};

const STATUS_COLORS: Record<MapAreaStatus, string> = {
  locked: '#757575',
  unlocked: '#4CAF50',
  explored: '#2196F3',
  mastered: '#FF9800',
};

const CATEGORY_NAMES: Record<MapEventCategory, string> = {
  encounter: '遭遇',
  discovery: '发现',
  danger: '危险',
  treasure: '宝箱',
  npc: 'NPC',
  course_material: '课程素材',
};

const GATHERING_TYPE_NAMES: Record<GatheringNodeType, string> = {
  herb: '草药',
  crystal: '水晶',
  essence: '精华',
  ore: '矿石',
  artifact: '遗物',
};

const ROUTE_TYPE_NAMES: Record<RouteType, string> = {
  safe: '安全',
  normal: '普通',
  dangerous: '危险',
  hidden: '隐藏',
};

export default function MapExplorePanel() {
  const {
    state,
    unlockMapExplore,
    unlockMapArea,
    exploreMapArea,
    gatherMapNode,
    resolveMapExploreEventAction,
    dismissMapExploreEvent,
    travelMapRoute,
    canUnlockMapAreaCtx,
    canExploreAreaCtx,
    canGatherNodeCtx,
    canTravelRouteCtx,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'map' | 'gather' | 'routes' | 'stats'>('map');
  const [selectedAreaId, setSelectedAreaId] = useState<MapAreaId | null>(null);

  const { mapExplore, day } = state;
  const { unlocked, areas, gatheringNodes, events, routes, currentEvent, stats } = mapExplore;

  const dailyExploresUsed = mapExplore.lastDailyResetDay !== day ? 0 : mapExplore.dailyExploresUsed;
  const remainingExplores = mapExplore.maxDailyExplores - dailyExploresUsed;

  if (!unlocked) {
    return (
      <div className="module map-explore-module">
        <h2>🗺️ 学院地图</h2>
        <div className="me-locked">
          <div className="me-locked-icon">🗺️</div>
          <p className="me-locked-title">学院地图探索尚未开启</p>
          <p className="me-locked-desc">当学院声望达到100且运营3天后，可解锁地图探索功能</p>
          {state.resources.reputation >= 100 && day >= 3 && (
            <button className="me-unlock-btn" onClick={() => unlockMapExplore()}>
              🗺️ 开启地图探索
            </button>
          )}
        </div>
      </div>
    );
  }

  const selectedArea = selectedAreaId ? areas.find(a => a.id === selectedAreaId) : null;
  const areaNodes = selectedAreaId ? gatheringNodes.filter(n => n.areaId === selectedAreaId) : [];
  const areaRoutes = selectedAreaId ? routes.filter(r => r.discovered && (r.fromAreaId === selectedAreaId || r.toAreaId === selectedAreaId)) : [];

  const formatResource = (res: Partial<{ gold: number; mana: number; food: number; reputation: number }>) => {
    const parts: string[] = [];
    if (res.gold) parts.push(`💰${res.gold > 0 ? '+' : ''}${res.gold}`);
    if (res.mana) parts.push(`🔮${res.mana > 0 ? '+' : ''}${res.mana}`);
    if (res.food) parts.push(`🍖${res.food > 0 ? '+' : ''}${res.food}`);
    if (res.reputation) parts.push(`⭐${res.reputation > 0 ? '+' : ''}${res.reputation}`);
    return parts.join(' ');
  };

  const renderAreaCard = (area: MapArea) => {
    const canUnlock = area.status === 'locked' && canUnlockMapAreaCtx(area, state.resources.reputation, day, state.students.length, areas, state.buildings);
    const canExplore = area.status !== 'locked' && canExploreAreaCtx(area, 100, dailyExploresUsed, mapExplore.maxDailyExplores, day);
    const isSelected = selectedAreaId === area.id;

    return (
      <div
        key={area.id}
        className={`me-area-card me-area-${area.status} ${isSelected ? 'me-area-selected' : ''}`}
        style={{ borderColor: RARITY_COLORS[area.rarity] }}
        onClick={() => {
          if (area.status !== 'locked') setSelectedAreaId(area.id);
        }}
      >
        <div className="me-area-header">
          <span className="me-area-icon">{area.icon}</span>
          <span className="me-area-name">{area.name}</span>
          <span className="me-area-rarity" style={{ color: RARITY_COLORS[area.rarity] }}>
            {RARITY_NAMES[area.rarity]}
          </span>
        </div>
        <div className="me-area-status" style={{ color: STATUS_COLORS[area.status] }}>
          {STATUS_NAMES[area.status]}
        </div>
        {area.status !== 'locked' && (
          <div className="me-area-progress">
            <div className="me-mastery-bar">
              <div
                className="me-mastery-fill"
                style={{
                  width: `${Math.min(100, (area.masteryProgress / area.masteryThreshold) * 100)}%`,
                  backgroundColor: area.status === 'mastered' ? '#FF9800' : '#2196F3',
                }}
              />
            </div>
            <span className="me-mastery-text">{area.masteryProgress}/{area.masteryThreshold}</span>
          </div>
        )}
        {area.status === 'locked' && canUnlock && (
          <button className="me-action-btn me-unlock-area-btn" onClick={(e) => { e.stopPropagation(); unlockMapArea(area.id); }}>
            🔓 解锁 ({formatResource(area.unlockCondition.cost)})
          </button>
        )}
        {area.status === 'locked' && !canUnlock && (
          <div className="me-area-locked-reason">
            {area.unlockCondition.minReputation > state.resources.reputation && `需声望${area.unlockCondition.minReputation} `}
            {area.unlockCondition.minDay > day && `需第${area.unlockCondition.minDay}天 `}
            {area.unlockCondition.minStudentCount > state.students.length && `需${area.unlockCondition.minStudentCount}名学员`}
          </div>
        )}
        {area.status !== 'locked' && (
          <div className="me-area-features">
            {area.features.map((f, i) => (
              <span key={i} className="me-feature-tag">{f.icon} {f.name}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEventModal = () => {
    if (!currentEvent) return null;
    const area = areas.find(a => a.id === currentEvent.areaId);

    return (
      <div className="me-event-overlay">
        <div className="me-event-modal" style={{ borderColor: RARITY_COLORS[currentEvent.rarity] }}>
          <div className="me-event-header">
            <span className="me-event-icon">{currentEvent.icon}</span>
            <span className="me-event-name">{currentEvent.name}</span>
            <span className="me-event-rarity" style={{ color: RARITY_COLORS[currentEvent.rarity] }}>
              {RARITY_NAMES[currentEvent.rarity]}
            </span>
          </div>
          <div className="me-event-area">📍 {area?.name || '未知区域'}</div>
          <div className="me-event-category">{CATEGORY_NAMES[currentEvent.category]}</div>
          <p className="me-event-desc">{currentEvent.description}</p>
          <div className="me-event-choices">
            {currentEvent.choices.map(choice => (
              <div key={choice.id} className="me-event-choice">
                <div className="me-choice-header">{choice.text}</div>
                <div className="me-choice-desc">{choice.description}</div>
                <div className="me-choice-rewards">
                  {formatResource(choice.resourceChange)}
                  {choice.moraleChange ? ` 😊${choice.moraleChange > 0 ? '+' : ''}${choice.moraleChange}` : ''}
                  {choice.staminaChange ? ` ⚡${choice.staminaChange > 0 ? '+' : ''}${choice.staminaChange}` : ''}
                  {choice.expReward ? ` 📖+${choice.expReward}exp` : ''}
                </div>
                {choice.riskProbability != null && choice.riskProbability > 0 && (
                  <div className="me-choice-risk">
                    ⚠️ 风险概率: {Math.round(choice.riskProbability * 100)}%
                    {choice.riskOutcomeText && <span> - {choice.riskOutcomeText}</span>}
                  </div>
                )}
                <button className="me-choice-btn" onClick={() => resolveMapExploreEventAction(currentEvent.id, choice.id)}>
                  选择
                </button>
              </div>
            ))}
          </div>
          <button className="me-dismiss-btn" onClick={() => dismissMapExploreEvent()}>跳过</button>
        </div>
      </div>
    );
  };

  const renderGatherTab = () => {
    const unlockedAreas = areas.filter(a => a.status !== 'locked');
    return (
      <div className="me-gather-tab">
        {unlockedAreas.map(area => {
          const nodes = gatheringNodes.filter(n => n.areaId === area.id);
          if (nodes.length === 0) return null;
          return (
            <div key={area.id} className="me-gather-area">
              <h4>{area.icon} {area.name}</h4>
              <div className="me-gather-nodes">
                {nodes.map(node => {
                  const onCooldown = node.currentCooldown > 0 && day <= node.lastGatheredDay + node.currentCooldown;
                  const canGather = canGatherNodeCtx(node, 100, day) && !onCooldown && area.status !== 'locked';
                  return (
                    <div key={node.id} className={`me-gather-node ${onCooldown ? 'me-node-cooldown' : ''}`}>
                      <div className="me-node-info">
                        <span className="me-node-icon">{node.icon}</span>
                        <span className="me-node-name">{node.name}</span>
                        <span className="me-node-type">{GATHERING_TYPE_NAMES[node.type]}</span>
                        <span className="me-node-rarity" style={{ color: RARITY_COLORS[node.rarity] }}>
                          {RARITY_NAMES[node.rarity]}
                        </span>
                      </div>
                      <div className="me-node-rewards">{formatResource(node.rewards)}</div>
                      {onCooldown && (
                        <div className="me-node-cd">冷却中: {node.lastGatheredDay + node.currentCooldown - day}天</div>
                      )}
                      <button
                        className="me-action-btn me-gather-btn"
                        disabled={!canGather}
                        onClick={() => canGather && gatherMapNode(node.id)}
                      >
                        ⛏️ 采集
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRoutesTab = () => {
    const discoveredRoutes = routes.filter(r => r.discovered);
    return (
      <div className="me-routes-tab">
        {discoveredRoutes.length === 0 ? (
          <div className="me-empty">尚未发现任何路线，解锁更多区域以发现路线</div>
        ) : (
          discoveredRoutes.map(route => {
            const fromArea = areas.find(a => a.id === route.fromAreaId);
            const toArea = areas.find(a => a.id === route.toAreaId);
            const canTravel = canTravelRouteCtx(route, 100) && fromArea && toArea && fromArea.status !== 'locked' && toArea.status !== 'locked';
            return (
              <div key={route.id} className={`me-route-card me-route-${route.type}`}>
                <div className="me-route-header">
                  <span className="me-route-name">🛤️ {route.name}</span>
                  <span className="me-route-type">{ROUTE_TYPE_NAMES[route.type]}</span>
                </div>
                <div className="me-route-path">
                  {fromArea?.icon} {fromArea?.name} → {toArea?.icon} {toArea?.name}
                </div>
                <div className="me-route-info">
                  <span>💰 路线收益: {formatResource(route.rewards)}</span>
                  {route.dangerLevel > 0 && <span>⚠️ 危险度: {Math.round(route.dangerLevel * 100)}%</span>}
                  {route.bonusTriggerChance > 0 && <span>✨ 额外奖励概率: {Math.round(route.bonusTriggerChance * 100)}%</span>}
                  <span>📊 已旅行: {route.travelCount}次</span>
                </div>
                <button className="me-action-btn me-travel-btn" disabled={!canTravel} onClick={() => canTravel && travelMapRoute(route.id)}>
                  🚶 旅行
                </button>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderStatsTab = () => (
    <div className="me-stats-tab">
      <div className="me-stats-section">
        <h4>📊 探索统计</h4>
        <div className="me-stats-grid">
          <div className="me-stat-item"><span className="me-stat-label">总探索次数</span><span className="me-stat-value">{stats.totalExplores}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">今日剩余</span><span className="me-stat-value">{remainingExplores}/{mapExplore.maxDailyExplores}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">触发事件</span><span className="me-stat-value">{stats.totalEventsTriggered}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">采集次数</span><span className="me-stat-value">{stats.totalGatheringActions}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">路线旅行</span><span className="me-stat-value">{stats.totalRoutesTraveled}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">已解锁区域</span><span className="me-stat-value">{stats.areasUnlocked}/{areas.length}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">已精通区域</span><span className="me-stat-value">{stats.areasMastered}</span></div>
        </div>
      </div>
      <div className="me-stats-section">
        <h4>📦 资源统计</h4>
        <div className="me-stats-grid">
          <div className="me-stat-item"><span className="me-stat-label">总获取金币</span><span className="me-stat-value">💰{stats.totalResourceGained.gold}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">总获取魔力</span><span className="me-stat-value">🔮{stats.totalResourceGained.mana}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">总获取声望</span><span className="me-stat-value">⭐{stats.totalResourceGained.reputation}</span></div>
        </div>
      </div>
      <div className="me-stats-section">
        <h4>🎰 事件分类</h4>
        <div className="me-stats-grid">
          {(Object.entries(stats.eventsByCategory) as [MapEventCategory, number][]).map(([cat, count]) => (
            <div key={cat} className="me-stat-item">
              <span className="me-stat-label">{CATEGORY_NAMES[cat]}</span>
              <span className="me-stat-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="me-stats-section">
        <h4>⛏️ 采集分类</h4>
        <div className="me-stats-grid">
          {(Object.entries(stats.gatheringByType) as [GatheringNodeType, number][]).map(([type, count]) => (
            <div key={type} className="me-stat-item">
              <span className="me-stat-label">{GATHERING_TYPE_NAMES[type]}</span>
              <span className="me-stat-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="me-stats-section">
        <h4>⚠️ 风险统计</h4>
        <div className="me-stats-grid">
          <div className="me-stat-item"><span className="me-stat-label">风险触发</span><span className="me-stat-value">{stats.risksTriggered}</span></div>
          <div className="me-stat-item"><span className="me-stat-label">风险规避</span><span className="me-stat-value">{stats.risksAvoided}</span></div>
        </div>
      </div>
    </div>
  );

  const renderAreaDetail = () => {
    if (!selectedArea) return null;
    const canExplore = canExploreAreaCtx(selectedArea, 100, dailyExploresUsed, mapExplore.maxDailyExplores, day);
    const areaEventHistory = mapExplore.eventHistory.filter(e => e.areaId === selectedArea.id);

    return (
      <div className="me-area-detail">
        <div className="me-area-detail-header">
          <button className="me-back-btn" onClick={() => setSelectedAreaId(null)}>← 返回</button>
          <span className="me-area-detail-icon">{selectedArea.icon}</span>
          <span className="me-area-detail-name">{selectedArea.name}</span>
          <span className="me-area-detail-status" style={{ color: STATUS_COLORS[selectedArea.status] }}>
            {STATUS_NAMES[selectedArea.status]}
          </span>
        </div>
        <p className="me-area-detail-desc">{selectedArea.description}</p>
        <div className="me-area-detail-progress">
          <span>探索精通: {selectedArea.masteryProgress}/{selectedArea.masteryThreshold}</span>
          <div className="me-mastery-bar">
            <div className="me-mastery-fill" style={{ width: `${(selectedArea.masteryProgress / selectedArea.masteryThreshold) * 100}%`, backgroundColor: selectedArea.status === 'mastered' ? '#FF9800' : '#2196F3' }} />
          </div>
        </div>
        <div className="me-area-detail-info">
          <span>📍 探索次数: {selectedArea.exploreCount}</span>
          <span>📦 探索收益: {formatResource(selectedArea.explorationYield)}</span>
          <span>🎲 事件概率: {Math.round(selectedArea.exploreEventChance * 100)}%</span>
        </div>
        <button
          className="me-action-btn me-explore-btn"
          disabled={!canExplore}
          onClick={() => exploreMapArea(selectedArea.id)}
        >
          🗺️ 探索此区域 ({remainingExplores}次剩余)
        </button>
        {areaNodes.length > 0 && (
          <div className="me-area-nodes">
            <h4>⛏️ 可采集资源</h4>
            {areaNodes.map(node => {
              const onCooldown = node.currentCooldown > 0 && day <= node.lastGatheredDay + node.currentCooldown;
              const canGather = canGatherNodeCtx(node, 100, day) && !onCooldown;
              return (
                <div key={node.id} className={`me-gather-node ${onCooldown ? 'me-node-cooldown' : ''}`}>
                  <span className="me-node-icon">{node.icon}</span>
                  <span className="me-node-name">{node.name}</span>
                  <span className="me-node-type">{GATHERING_TYPE_NAMES[node.type]}</span>
                  <span className="me-node-rewards">{formatResource(node.rewards)}</span>
                  {onCooldown && <span className="me-node-cd">冷却{node.lastGatheredDay + node.currentCooldown - day}天</span>}
                  <button className="me-action-btn me-gather-btn" disabled={!canGather} onClick={() => canGather && gatherMapNode(node.id)}>⛏️</button>
                </div>
              );
            })}
          </div>
        )}
        {areaRoutes.length > 0 && (
          <div className="me-area-routes">
            <h4>🛤️ 可用路线</h4>
            {areaRoutes.map(route => {
              const targetId = route.fromAreaId === selectedArea.id ? route.toAreaId : route.fromAreaId;
              const targetArea = areas.find(a => a.id === targetId);
              const canTravel = canTravelRouteCtx(route, 100) && targetArea && targetArea.status !== 'locked';
              return (
                <div key={route.id} className="me-route-inline">
                  <span>🛤️ {route.name} → {targetArea?.icon} {targetArea?.name}</span>
                  <span className="me-route-rewards">{formatResource(route.rewards)}</span>
                  <button className="me-action-btn me-travel-btn" disabled={!canTravel} onClick={() => canTravel && travelMapRoute(route.id)}>🚶</button>
                </div>
              );
            })}
          </div>
        )}
        {selectedArea.features.length > 0 && (
          <div className="me-area-features-detail">
            <h4>✨ 区域特色</h4>
            {selectedArea.features.map((f, i) => (
              <div key={i} className="me-feature-item">
                <span>{f.icon} {f.name}</span>
                <span className="me-feature-desc">{f.description}</span>
              </div>
            ))}
          </div>
        )}
        {areaEventHistory.length > 0 && (
          <div className="me-area-event-history">
            <h4>📜 近期事件</h4>
            {areaEventHistory.slice(-5).map(eh => (
              <div key={eh.id} className="me-event-history-item">
                <span className="me-eh-day">第{eh.day}天</span>
                <span className="me-eh-outcome">{eh.outcomeText}</span>
                {eh.wasRiskTriggered && <span className="me-eh-risk">⚠️</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="module map-explore-module">
      <h2>🗺️ 学院地图</h2>
      <div className="me-daily-info">
        📅 第{day}天 | 🗺️ 今日探索: {remainingExplores}/{mapExplore.maxDailyExplores} | 📍 已解锁: {stats.areasUnlocked}/{areas.length}
      </div>

      {currentEvent && renderEventModal()}

      <div className="me-tabs">
        <button className={`me-tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>🗺️ 地图</button>
        <button className={`me-tab ${activeTab === 'gather' ? 'active' : ''}`} onClick={() => setActiveTab('gather')}>⛏️ 采集</button>
        <button className={`me-tab ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>🛤️ 路线</button>
        <button className={`me-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 统计</button>
      </div>

      {activeTab === 'map' && (
        selectedAreaId && selectedArea ? renderAreaDetail() : (
          <div className="me-map-grid">
            {areas.map(area => renderAreaCard(area))}
          </div>
        )
      )}
      {activeTab === 'gather' && renderGatherTab()}
      {activeTab === 'routes' && renderRoutesTab()}
      {activeTab === 'stats' && renderStatsTab()}
    </div>
  );
}
