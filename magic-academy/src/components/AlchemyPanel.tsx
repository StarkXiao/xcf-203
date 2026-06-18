import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { AlchemyMaterialId, PotionId, AlchemyMaterialRarity, AlchemyMaterialDef } from '../types/game';
import './AlchemyPanel.css';

type AlchemySubTab = 'overview' | 'materials' | 'synthesis' | 'crafting' | 'potions' | 'shop';

export default function AlchemyPanel() {
  const {
    state,
    unlockAlchemy,
    upgradeAlchemyWorkshop,
    craftPotion,
    synthesizeMaterial,
    consumePotion,
    sellPotion,
    sellMaterial,
    canCraftPotion,
    canSynthesizeMaterial,
    getWorkshopUpgradeCost,
    getCraftingSlotsForLevel,
    getWorkshopRequiredReputation,
    ALCHEMY_MATERIALS,
    getAlchemyMaterial,
    ALCHEMY_RARITY_COLORS,
    ALCHEMY_RARITY_NAMES,
  } = useGame();

  const [subTab, setSubTab] = useState<AlchemySubTab>('overview');
  const [craftQty, setCraftQty] = useState<Record<string, number>>({});
  const [sellQty, setSellQty] = useState<Record<string, number>>({});
  const [selectedStudentForPotion, setSelectedStudentForPotion] = useState<string | undefined>(undefined);

  const alchemy = state.alchemy;

  if (!alchemy.unlocked) {
    const alchemyBuilding = state.buildings.find(b => b.id === 'alchemy_workshop');
    const buildingBuilt = alchemyBuilding && alchemyBuilding.level > 0;
    const hasReputation = state.resources.reputation >= getWorkshopRequiredReputation();

    return (
      <div className="alchemy-module">
        <div className="alchemy-locked">
          <div className="alchemy-locked-icon">⚗️</div>
          <h2>炼金工坊</h2>
          <p className="alchemy-locked-desc">在魔法的世界中，炼金术是将平凡材料转化为神奇药剂的艺术。建造炼金工坊，开启你的炼金之旅。</p>
          <div className="alchemy-unlock-reqs">
            <div className={`alchemy-req-item ${buildingBuilt ? 'met' : 'unmet'}`}>
              <span className="req-icon">{buildingBuilt ? '✅' : '❌'}</span>
              <span>建造炼金工坊建筑</span>
            </div>
            <div className={`alchemy-req-item ${hasReputation ? 'met' : 'unmet'}`}>
              <span className="req-icon">{hasReputation ? '✅' : '❌'}</span>
              <span>学院声望 ≥ {getWorkshopRequiredReputation()} (当前: {state.resources.reputation})</span>
            </div>
          </div>
          {buildingBuilt && hasReputation && (
            <button className="alchemy-unlock-btn" onClick={unlockAlchemy}>
              🔓 启用炼金工坊
            </button>
          )}
        </div>
      </div>
    );
  }

  const upgradeCost = getWorkshopUpgradeCost(alchemy.workshopLevel);
  const canUpgrade = alchemy.workshopLevel < alchemy.maxWorkshopLevel &&
    state.resources.gold >= upgradeCost.gold &&
    state.resources.mana >= upgradeCost.mana &&
    state.resources.food >= upgradeCost.food &&
    state.resources.reputation >= upgradeCost.reputation;

  const subTabs: { id: AlchemySubTab; label: string; icon: string }[] = [
    { id: 'overview', label: '总览', icon: '🏠' },
    { id: 'materials', label: '材料仓库', icon: '📦' },
    { id: 'synthesis', label: '材料合成', icon: '🔄' },
    { id: 'crafting', label: '药剂制作', icon: '⚗️' },
    { id: 'potions', label: '药剂背包', icon: '🧪' },
    { id: 'shop', label: '售卖商店', icon: '💰' },
  ];

  const getRarityStyle = (rarity: AlchemyMaterialRarity) => ({
    color: ALCHEMY_RARITY_COLORS[rarity],
    borderColor: ALCHEMY_RARITY_COLORS[rarity],
  });

  const materialsByCategory = () => {
    type MatWithQty = AlchemyMaterialDef & { qty: number };
    const cats: Record<string, MatWithQty[]> = { herb: [], essence: [], crystal: [], special: [] };
    for (const mat of ALCHEMY_MATERIALS) {
      const qty = alchemy.materials[mat.id] || 0;
      cats[mat.category].push({ ...mat, qty });
    }
    return cats;
  };

  const categoryNames: Record<string, string> = {
    herb: '🌿 草药材料',
    essence: '💎 精华材料',
    crystal: '💠 水晶材料',
    special: '⭐ 稀有材料',
  };

  const availableRecipes = alchemy.recipes.filter(r =>
    r.unlocked && r.requiredWorkshopLevel <= alchemy.workshopLevel &&
    state.resources.reputation >= r.requiredReputation
  );

  const lockedRecipes = alchemy.recipes.filter(r =>
    !r.unlocked || r.requiredWorkshopLevel > alchemy.workshopLevel ||
    state.resources.reputation < r.requiredReputation
  );

  const getEffectLabel = (type: string) => {
    const labels: Record<string, string> = {
      heal_hp: '💚 恢复HP',
      restore_mana: '🔮 恢复魔力',
      restore_stamina: '⚡ 恢复体力',
      exp_boost: '📚 经验增幅',
      course_speed_boost: '⏩ 学习加速',
      morale_boost: '😊 士气鼓舞',
      damage_boost: '⚔️ 伤害强化',
      defense_boost: '🛡️ 防御强化',
      sweep_bonus: '🏆 扫荡增幅',
      reputation_gain: '⭐ 声望提升',
      gold_gain: '💰 金币获取',
    };
    return labels[type] || type;
  };

  const getContextLabel = (ctx: string) => {
    const labels: Record<string, string> = {
      any: '🎮 任意',
      course: '📚 课程',
      dungeon: '⚔️ 副本',
    };
    return labels[ctx] || ctx;
  };

  const handleCraft = (potionId: PotionId) => {
    const qty = craftQty[potionId] || 1;
    if (craftPotion(potionId, qty)) {
      setCraftQty(prev => ({ ...prev, [potionId]: 1 }));
    }
  };

  const handleSellPotion = (potionId: PotionId) => {
    const qty = sellQty[`potion_${potionId}`] || 1;
    sellPotion(potionId, qty);
  };

  const handleSellMaterial = (materialId: AlchemyMaterialId) => {
    const qty = sellQty[`mat_${materialId}`] || 1;
    sellMaterial(materialId, qty);
  };

  const handleUsePotion = (potionId: PotionId) => {
    consumePotion(potionId, selectedStudentForPotion);
  };

  const renderOverview = () => (
    <div className="alchemy-overview">
      <div className="alchemy-workshop-info">
        <div className="alchemy-workshop-header">
          <div className="alchemy-workshop-icon">⚗️</div>
          <div className="alchemy-workshop-details">
            <h3>炼金工坊 Lv.{alchemy.workshopLevel}</h3>
            <div className="alchemy-workshop-stats">
              <span>制作位: {alchemy.activeCraftings.length}/{alchemy.craftingSlots}</span>
              <span>已制作: {alchemy.stats.totalCrafted}</span>
              <span>已使用: {alchemy.stats.totalUsed}</span>
              <span>已售出: {alchemy.stats.totalSold}</span>
              <span>总收入: 💰{alchemy.stats.totalGoldEarned}</span>
            </div>
          </div>
        </div>
        {alchemy.workshopLevel < alchemy.maxWorkshopLevel && (
          <div className="alchemy-upgrade-section">
            <div className="alchemy-upgrade-cost">
              <span>升级至 Lv.{alchemy.workshopLevel + 1}</span>
              <span>制作位: {getCraftingSlotsForLevel(alchemy.workshopLevel + 1)}</span>
              <div className="cost-items">
                {upgradeCost.gold > 0 && <span className={state.resources.gold >= upgradeCost.gold ? 'cost-met' : 'cost-unmet'}>💰{upgradeCost.gold}</span>}
                {upgradeCost.mana > 0 && <span className={state.resources.mana >= upgradeCost.mana ? 'cost-met' : 'cost-unmet'}>💎{upgradeCost.mana}</span>}
                {upgradeCost.food > 0 && <span className={state.resources.food >= upgradeCost.food ? 'cost-met' : 'cost-unmet'}>🍞{upgradeCost.food}</span>}
                {upgradeCost.reputation > 0 && <span className={state.resources.reputation >= upgradeCost.reputation ? 'cost-met' : 'cost-unmet'}>⭐{upgradeCost.reputation}</span>}
              </div>
            </div>
            <button
              className={`alchemy-btn ${canUpgrade ? 'primary' : 'disabled'}`}
              onClick={() => canUpgrade && upgradeAlchemyWorkshop()}
              disabled={!canUpgrade}
            >
              ⬆️ 升级工坊
            </button>
          </div>
        )}
      </div>

      {alchemy.activeCraftings.length > 0 && (
        <div className="alchemy-active-craftings">
          <h4>🔨 制作中</h4>
          <div className="crafting-list">
            {alchemy.activeCraftings.map(c => {
              const recipe = alchemy.recipes.find(r => r.id === c.potionId);
              const progress = Math.min(1, (state.day - c.startedAt) / (c.completesAt - c.startedAt));
              const remaining = Math.max(0, c.completesAt - state.day);
              return (
                <div key={c.id} className="crafting-item">
                  <div className="crafting-info">
                    <span className="crafting-icon">{recipe?.icon || '🧪'}</span>
                    <span className="crafting-name">{recipe?.name || c.potionId} ×{c.quantity}</span>
                    <span className="crafting-remaining">
                      {remaining > 0 ? `剩余${remaining}天` : '已完成'}
                    </span>
                  </div>
                  <div className="crafting-progress-bar">
                    <div
                      className="crafting-progress-fill"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alchemy.activeBuffs.length > 0 && (
        <div className="alchemy-active-buffs">
          <h4>✨ 活跃增益</h4>
          <div className="buff-list">
            {alchemy.activeBuffs.map(b => {
              const remaining = Math.max(0, b.expiresAt - state.day);
              return (
                <div key={b.id} className="buff-item">
                  <span className="buff-icon">{b.effects[0] ? getEffectLabel(b.effects[0].type).split(' ')[0] : '✨'}</span>
                  <span className="buff-name">{b.potionName}</span>
                  <span className="buff-remaining">{remaining > 0 ? `${remaining}天` : '已过期'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="alchemy-quick-stats">
        <h4>📊 材料速览</h4>
        <div className="quick-mat-grid">
          {ALCHEMY_MATERIALS.filter(m => (alchemy.materials[m.id] || 0) > 0).map(m => (
            <div key={m.id} className="quick-mat-item" style={getRarityStyle(m.rarity)}>
              <span>{m.icon}</span>
              <span>{m.name}</span>
              <span className="quick-mat-qty">×{alchemy.materials[m.id]}</span>
            </div>
          ))}
          {ALCHEMY_MATERIALS.every(m => (alchemy.materials[m.id] || 0) === 0) && (
            <p className="empty-hint">暂无材料，通关副本获取</p>
          )}
        </div>
        <h4 style={{ marginTop: '1rem' }}>🧪 药剂速览</h4>
        <div className="quick-mat-grid">
          {alchemy.recipes.filter(r => (alchemy.potions[r.id] || 0) > 0).map(r => (
            <div key={r.id} className="quick-mat-item" style={getRarityStyle(r.rarity)}>
              <span>{r.icon}</span>
              <span>{r.name}</span>
              <span className="quick-mat-qty">×{alchemy.potions[r.id]}</span>
            </div>
          ))}
          {alchemy.recipes.every(r => (alchemy.potions[r.id] || 0) === 0) && (
            <p className="empty-hint">暂无药剂，前往制作</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderMaterials = () => {
    const cats = materialsByCategory();
    return (
      <div className="alchemy-materials">
        {Object.entries(cats).map(([cat, mats]) => (
          <div key={cat} className="mat-category">
            <h4>{categoryNames[cat]}</h4>
            <div className="mat-grid">
              {mats.map(m => (
                <div
                  key={m.id}
                  className={`mat-card ${m.qty > 0 ? 'has-stock' : 'no-stock'}`}
                  style={getRarityStyle(m.rarity)}
                >
                  <div className="mat-card-icon">{m.icon}</div>
                  <div className="mat-card-info">
                    <span className="mat-card-name">{m.name}</span>
                    <span className="mat-card-rarity" style={{ color: ALCHEMY_RARITY_COLORS[m.rarity] }}>
                      {ALCHEMY_RARITY_NAMES[m.rarity]}
                    </span>
                  </div>
                  <div className="mat-card-qty">{m.qty}</div>
                  <div className="mat-card-desc">{m.description}</div>
                  <div className="mat-card-sell">售价: 💰{m.sellPrice}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSynthesis = () => (
    <div className="alchemy-synthesis">
      <h4>🔄 材料合成</h4>
      <p className="synthesis-hint">将低级材料合成为高级材料，需要消耗金币和工坊等级</p>
      <div className="synthesis-grid">
        {alchemy.synthesisRecipes.map(recipe => {
          const check = canSynthesizeMaterial(recipe, alchemy.materials, state.resources.gold, alchemy.workshopLevel);
          const outputMat = getAlchemyMaterial(recipe.output.materialId);
          return (
            <div
              key={recipe.id}
              className={`synthesis-card ${check.ok ? 'available' : 'unavailable'}`}
              style={getRarityStyle(outputMat.rarity)}
            >
              <div className="synthesis-header">
                <span className="synthesis-name">{recipe.name}</span>
                <span className="synthesis-level">Lv.{recipe.requiredWorkshopLevel}</span>
              </div>
              <div className="synthesis-body">
                <div className="synthesis-inputs">
                  {Object.entries(recipe.inputs).map(([matId, qty]) => {
                    const mat = getAlchemyMaterial(matId as AlchemyMaterialId);
                    const owned = alchemy.materials[matId as AlchemyMaterialId] || 0;
                    return (
                      <span key={matId} className={`synth-mat ${owned >= qty ? 'enough' : 'lack'}`}>
                        {mat.icon}{mat.name} ×{qty} ({owned})
                      </span>
                    );
                  })}
                </div>
                <div className="synthesis-arrow">⬇️</div>
                <div className="synthesis-output">
                  <span style={getRarityStyle(outputMat.rarity)}>
                    {outputMat.icon}{outputMat.name} ×{recipe.output.quantity}
                  </span>
                </div>
                <div className="synthesis-cost">💰{recipe.goldCost}</div>
              </div>
              {!check.ok && check.reason && (
                <div className="synthesis-error">{check.reason}</div>
              )}
              <button
                className={`alchemy-btn ${check.ok ? 'primary' : 'disabled'}`}
                onClick={() => check.ok && synthesizeMaterial(recipe.id)}
                disabled={!check.ok}
              >
                🔄 合成
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCrafting = () => (
    <div className="alchemy-crafting">
      <div className="crafting-slots-info">
        <span>制作位: {alchemy.activeCraftings.length}/{alchemy.craftingSlots}</span>
        {alchemy.activeCraftings.length >= alchemy.craftingSlots && (
          <span className="slots-full">制作位已满，请等待或升级工坊</span>
        )}
      </div>
      <h4>⚗️ 可制作药剂</h4>
      <div className="recipe-grid">
        {availableRecipes.map(recipe => {
          const qty = craftQty[recipe.id] || 1;
          const check = canCraftPotion(
            recipe, alchemy.materials, state.resources.gold, state.resources.mana,
            alchemy.workshopLevel, alchemy.activeCraftings.length,
            alchemy.craftingSlots, state.resources.reputation
          );
          const maxQty = Math.min(
            ...Object.entries(recipe.materials).map(([matId, need]) =>
              Math.floor((alchemy.materials[matId as AlchemyMaterialId] || 0) / Math.max(1, need))
            ),
            Math.floor(state.resources.gold / Math.max(1, recipe.goldCost)),
            Math.floor(state.resources.mana / Math.max(1, recipe.manaCost)),
            99
          );
          const alchemyBuildingLevel = state.buildings.find(b => b.id === 'alchemy_workshop')?.level || 1;
          const craftTimeReduction = 1 - Math.min(0.5, alchemyBuildingLevel * 0.05);
          const totalTime = Math.max(1, Math.ceil(recipe.craftingTime * craftTimeReduction)) * qty;

          return (
            <div key={recipe.id} className={`recipe-card ${check.ok ? 'available' : 'unavailable'}`} style={getRarityStyle(recipe.rarity)}>
              <div className="recipe-header">
                <span className="recipe-icon">{recipe.icon}</span>
                <div className="recipe-title">
                  <span className="recipe-name">{recipe.name}</span>
                  <span className="recipe-rarity" style={{ color: ALCHEMY_RARITY_COLORS[recipe.rarity] }}>
                    {ALCHEMY_RARITY_NAMES[recipe.rarity]}
                  </span>
                </div>
              </div>
              <div className="recipe-desc">{recipe.description}</div>
              <div className="recipe-effects">
                {recipe.effects.map((e, i) => (
                  <span key={i} className="recipe-effect">{getEffectLabel(e.type)} {e.type.includes('boost') || e.type === 'sweep_bonus' ? `+${Math.round(e.value * 100)}%` : `+${e.value}`}{e.duration ? ` (${e.duration}天)` : ''}</span>
                ))}
              </div>
              <div className="recipe-context">{getContextLabel(recipe.usageContext)}</div>
              <div className="recipe-materials">
                {Object.entries(recipe.materials).map(([matId, need]) => {
                  const mat = getAlchemyMaterial(matId as AlchemyMaterialId);
                  const owned = alchemy.materials[matId as AlchemyMaterialId] || 0;
                  return (
                    <span key={matId} className={`recipe-mat ${owned >= need * qty ? 'enough' : 'lack'}`}>
                      {mat.icon}×{need * qty} ({owned})
                    </span>
                  );
                })}
              </div>
              <div className="recipe-costs">
                {recipe.goldCost * qty > 0 && <span className={state.resources.gold >= recipe.goldCost * qty ? 'cost-met' : 'cost-unmet'}>💰{recipe.goldCost * qty}</span>}
                {recipe.manaCost * qty > 0 && <span className={state.resources.mana >= recipe.manaCost * qty ? 'cost-met' : 'cost-unmet'}>💎{recipe.manaCost * qty}</span>}
                <span className="recipe-time">⏱️{totalTime}天</span>
              </div>
              {!check.ok && check.reason && <div className="recipe-error">{check.reason}</div>}
              <div className="recipe-actions">
                <div className="qty-control">
                  <button onClick={() => setCraftQty(p => ({ ...p, [recipe.id]: Math.max(1, qty - 1) }))}>-</button>
                  <span>{qty}</span>
                  <button onClick={() => setCraftQty(p => ({ ...p, [recipe.id]: Math.min(maxQty, qty + 1) }))}>+</button>
                </div>
                <button
                  className={`alchemy-btn ${check.ok ? 'primary' : 'disabled'}`}
                  onClick={() => handleCraft(recipe.id)}
                  disabled={!check.ok}
                >
                  ⚗️ 制作
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {lockedRecipes.length > 0 && (
        <>
          <h4 style={{ marginTop: '1.5rem', opacity: 0.6 }}>🔒 未解锁配方</h4>
          <div className="recipe-grid locked-grid">
            {lockedRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card locked" style={{ opacity: 0.5 }}>
                <div className="recipe-header">
                  <span className="recipe-icon">{recipe.icon}</span>
                  <span className="recipe-name">{recipe.name}</span>
                </div>
                <div className="recipe-lock-reason">
                  {!recipe.unlocked && '配方未解锁'}
                  {recipe.requiredWorkshopLevel > alchemy.workshopLevel && `需要工坊Lv.${recipe.requiredWorkshopLevel}`}
                  {recipe.requiredReputation > state.resources.reputation && `需要声望${recipe.requiredReputation}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderPotions = () => (
    <div className="alchemy-potions">
      <h4>🧪 药剂背包</h4>
      {state.students.length > 0 && (
        <div className="potion-student-select">
          <span>使用对象:</span>
          <select
            value={selectedStudentForPotion || ''}
            onChange={e => setSelectedStudentForPotion(e.target.value || undefined)}
          >
            <option value="">无指定对象</option>
            {state.students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="potion-grid">
        {alchemy.recipes.filter(r => (alchemy.potions[r.id] || 0) > 0).map(recipe => {
          const count = alchemy.potions[recipe.id] || 0;
          return (
            <div key={recipe.id} className="potion-card" style={getRarityStyle(recipe.rarity)}>
              <div className="potion-header">
                <span className="potion-icon">{recipe.icon}</span>
                <div className="potion-title">
                  <span className="potion-name">{recipe.name}</span>
                  <span className="potion-rarity" style={{ color: ALCHEMY_RARITY_COLORS[recipe.rarity] }}>
                    {ALCHEMY_RARITY_NAMES[recipe.rarity]}
                  </span>
                </div>
                <span className="potion-count">×{count}</span>
              </div>
              <div className="potion-effects">
                {recipe.effects.map((e, i) => (
                  <span key={i} className="potion-effect">
                    {getEffectLabel(e.type)} {e.type.includes('boost') || e.type === 'sweep_bonus' ? `+${Math.round(e.value * 100)}%` : `+${e.value}`}{e.duration ? ` (${e.duration}天)` : ''}
                  </span>
                ))}
              </div>
              <div className="potion-context">{getContextLabel(recipe.usageContext)}</div>
              <button
                className="alchemy-btn primary"
                onClick={() => handleUsePotion(recipe.id)}
              >
                使用
              </button>
            </div>
          );
        })}
        {alchemy.recipes.every(r => (alchemy.potions[r.id] || 0) === 0) && (
          <div className="empty-state">
            <p>背包为空，前往制作药剂吧！</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="alchemy-shop">
      <h4>💰 售卖商店</h4>
      <p className="shop-hint">出售材料或药剂换取金币</p>

      <div className="shop-section">
        <h5>📦 出售材料</h5>
        <div className="shop-grid">
          {ALCHEMY_MATERIALS.filter(m => (alchemy.materials[m.id] || 0) > 0).map(m => {
            const owned = alchemy.materials[m.id] || 0;
            const qty = sellQty[`mat_${m.id}`] || 1;
            return (
              <div key={m.id} className="shop-item" style={getRarityStyle(m.rarity)}>
                <div className="shop-item-info">
                  <span className="shop-item-icon">{m.icon}</span>
                  <span className="shop-item-name">{m.name}</span>
                  <span className="shop-item-qty">库存: {owned}</span>
                  <span className="shop-item-price">💰{m.sellPrice}/个</span>
                </div>
                <div className="shop-item-actions">
                  <div className="qty-control">
                    <button onClick={() => setSellQty(p => ({ ...p, [`mat_${m.id}`]: Math.max(1, qty - 1) }))}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => setSellQty(p => ({ ...p, [`mat_${m.id}`]: Math.min(owned, qty + 1) }))}>+</button>
                  </div>
                  <button
                    className="alchemy-btn sell-btn"
                    onClick={() => handleSellMaterial(m.id)}
                  >
                    💰 获得{m.sellPrice * qty}金
                  </button>
                </div>
              </div>
            );
          })}
          {ALCHEMY_MATERIALS.every(m => (alchemy.materials[m.id] || 0) === 0) && (
            <p className="empty-hint">暂无可出售材料</p>
          )}
        </div>
      </div>

      <div className="shop-section">
        <h5>🧪 出售药剂</h5>
        <div className="shop-grid">
          {alchemy.recipes.filter(r => (alchemy.potions[r.id] || 0) > 0).map(r => {
            const owned = alchemy.potions[r.id] || 0;
            const qty = sellQty[`potion_${r.id}`] || 1;
            return (
              <div key={r.id} className="shop-item" style={getRarityStyle(r.rarity)}>
                <div className="shop-item-info">
                  <span className="shop-item-icon">{r.icon}</span>
                  <span className="shop-item-name">{r.name}</span>
                  <span className="shop-item-qty">库存: {owned}</span>
                  <span className="shop-item-price">💰{r.sellPrice}/个</span>
                </div>
                <div className="shop-item-actions">
                  <div className="qty-control">
                    <button onClick={() => setSellQty(p => ({ ...p, [`potion_${r.id}`]: Math.max(1, qty - 1) }))}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => setSellQty(p => ({ ...p, [`potion_${r.id}`]: Math.min(owned, qty + 1) }))}>+</button>
                  </div>
                  <button
                    className="alchemy-btn sell-btn"
                    onClick={() => handleSellPotion(r.id)}
                  >
                    💰 获得{r.sellPrice * qty}金
                  </button>
                </div>
              </div>
            );
          })}
          {alchemy.recipes.every(r => (alchemy.potions[r.id] || 0) === 0) && (
            <p className="empty-hint">暂无可出售药剂</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="alchemy-module">
      <div className="alchemy-header">
        <h2>⚗️ 炼金工坊 <span className="alchemy-level">Lv.{alchemy.workshopLevel}</span></h2>
        <div className="alchemy-header-info">
          <span>制作位 {alchemy.activeCraftings.length}/{alchemy.craftingSlots}</span>
          <span>💰{state.resources.gold}</span>
          <span>💎{state.resources.mana}</span>
        </div>
      </div>
      <nav className="alchemy-sub-tabs">
        {subTabs.map(t => (
          <button
            key={t.id}
            className={`alchemy-sub-tab ${subTab === t.id ? 'active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>
      <div className="alchemy-content">
        {subTab === 'overview' && renderOverview()}
        {subTab === 'materials' && renderMaterials()}
        {subTab === 'synthesis' && renderSynthesis()}
        {subTab === 'crafting' && renderCrafting()}
        {subTab === 'potions' && renderPotions()}
        {subTab === 'shop' && renderShop()}
      </div>
    </div>
  );
}
