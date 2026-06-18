import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { Resource } from '../types/game';

const QUALITY_LABELS: Record<string, { text: string; color: string }> = {
  legend: { text: '传说', color: '#ffd700' },
  elite: { text: '精英', color: '#ff6b6b' },
  hard: { text: '困难', color: '#ff9f43' },
  normal: { text: '普通', color: '#66c2a5' },
  easy: { text: '简单', color: '#88c4ff' },
};

const PERSONALITY_LABELS: Record<string, string> = {
  aggressive: '🔥 激进扩张',
  defensive: '🛡️ 稳健防御',
  balanced: '⚖️ 均衡发展',
  mercantile: '💰 重商主义',
  militaristic: '⚔️ 军事优先',
};

const RESOURCE_ICONS: Record<string, string> = {
  gold: '💰',
  mana: '💎',
  food: '🍞',
  reputation: '⭐',
};

export default function RivalAcademyPanel() {
  const {
    state,
    unlockRivalCompetition,
    startContestation,
    investInContestation,
    placeBid,
    refreshRecruitmentCandidates,
    claimWeeklyRankingReward,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'overview' | 'ranking' | 'contestation' | 'recruitment'>('overview');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(100);
  const [investGold, setInvestGold] = useState<number>(0);

  const { rivalCompetition, resources, students, day } = state;

  if (!rivalCompetition.unlocked) {
    return (
      <div className="module-container">
        <div className="module-header">
          <h2>🏰 多校竞争</h2>
        </div>
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(107, 89, 204, 0.1) 0%, rgba(76, 29, 149, 0.15) 100%)',
          borderRadius: '16px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏰⚔️🏰</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#c9a9ff' }}>
            多校竞争玩法
          </h3>
          <p style={{ color: '#b8b8d0', marginBottom: '24px', lineHeight: '1.8' }}>
            与周边魔法学院展开激烈竞争！争夺资源点、抢招优秀学生、冲击周榜排名。<br />
            称霸魔法教育界，成为最负盛名的魔法学院！
          </p>
          <button
            className="btn btn-primary btn-large"
            onClick={unlockRivalCompetition}
            disabled={day < 7}
          >
            {day < 7 ? `🔒 第7天解锁（还需${7 - day}天）` : '🚀 开启多校竞争'}
          </button>
        </div>
      </div>
    );
  }

  const playerWeeklyScore = rivalCompetition.weeklyRankings.length > 0
    ? rivalCompetition.weeklyRankings[rivalCompetition.weeklyRankings.length - 1].playerScore
    : 0;

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const canStartContestation = (pointId: string): boolean => {
    if (rivalCompetition.activeContestations.length >= rivalCompetition.maxActiveContestations) return false;
    const point = rivalCompetition.resourcePoints.find(p => p.id === pointId);
    if (!point || point.controllerId === 'player') return false;
    return true;
  };

  const handleStartContestation = (pointId: string) => {
    startContestation(pointId);
    setSelectedPointId(null);
  };

  const handleInvest = (contestationId: string) => {
    if (investGold > 0 && resources.gold >= investGold) {
      investInContestation(contestationId, 'gold', investGold);
      setInvestGold(0);
    }
  };

  const handlePlaceBid = (candidateId: string) => {
    if (bidAmount > 0 && resources.gold >= bidAmount && rivalCompetition.bidsUsedToday < rivalCompetition.maxBidsPerDay) {
      placeBid(candidateId, bidAmount);
      setBidAmount(100);
      setSelectedCandidateId(null);
    }
  };

  const currentWeek = rivalCompetition.weeklyRankings.length > 0
    ? rivalCompetition.weeklyRankings[rivalCompetition.weeklyRankings.length - 1]
    : null;

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🏰 多校竞争</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#b8b8d0' }}>
            第 {rivalCompetition.currentWeek} 周
          </span>
          <span style={{
            fontSize: '13px',
            padding: '4px 12px',
            borderRadius: '12px',
            background: 'rgba(255, 215, 0, 0.15)',
            color: '#ffd700',
          }}>
            声望加成 +{((rivalCompetition.reputationBonusMultiplier - 1) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid rgba(107, 89, 204, 0.3)',
        paddingBottom: '12px',
      }}>
        {[
          { id: 'overview', label: '📊 总览', icon: '📊' },
          { id: 'ranking', label: '🏆 周榜', icon: '🏆' },
          { id: 'contestation', label: '⚔️ 争夺', icon: '⚔️' },
          { id: 'recruitment', label: '🎓 招募', icon: '🎓' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #6b59cc 0%, #4c1d95 100%)'
                : 'rgba(107, 89, 204, 0.1)',
              color: activeTab === tab.id ? '#fff' : '#b8b8d0',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(107, 89, 204, 0.12)',
              border: '1px solid rgba(107, 89, 204, 0.25)',
            }}>
              <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>本周积分</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#c9a9ff' }}>
                {formatNumber(playerWeeklyScore)}
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(78, 205, 196, 0.12)',
              border: '1px solid rgba(78, 205, 196, 0.25)',
            }}>
              <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>控制据点</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#4ecdc4' }}>
                {rivalCompetition.resourcePoints.filter(p => p.controllerId === 'player').length}
                <span style={{ fontSize: '14px', color: '#b8b8d0' }}>/{rivalCompetition.resourcePoints.length}</span>
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255, 159, 67, 0.12)',
              border: '1px solid rgba(255, 159, 67, 0.25)',
            }}>
              <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>争夺胜利</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff9f43' }}>
                {rivalCompetition.totalContestationsWon}
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255, 107, 107, 0.12)',
              border: '1px solid rgba(255, 107, 107, 0.25)',
            }}>
              <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>招募成功</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff6b6b' }}>
                {rivalCompetition.totalAuctionsWon}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#c9a9ff' }}>🏫 对手学院</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {rivalCompetition.rivalAcademies.sort((a, b) => b.reputation - a.reputation).map(rival => (
              <div
                key={rival.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `2px solid ${rival.color}33`,
                  borderLeft: `4px solid ${rival.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `${rival.color}22`,
                    border: `2px solid ${rival.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {rival.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#e8e8f0' }}>
                        {rival.name}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: `${QUALITY_LABELS[rival.quality]?.color || '#666'}22`,
                        color: QUALITY_LABELS[rival.quality]?.color || '#666',
                        fontWeight: '600',
                      }}>
                        {QUALITY_LABELS[rival.quality]?.text || '普通'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#b8b8d0' }}>
                      Lv.{rival.level} · {PERSONALITY_LABELS[rival.personality] || '⚖️ 均衡发展'}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  fontSize: '12px',
                  marginBottom: '12px',
                }}>
                  <div>
                    <span style={{ color: '#b8b8d0' }}>⭐ 声望</span>
                    <div style={{ color: '#ffd700', fontWeight: '600' }}>{formatNumber(rival.reputation)}</div>
                  </div>
                  <div>
                    <span style={{ color: '#b8b8d0' }}>👥 学生</span>
                    <div style={{ color: '#4ecdc4', fontWeight: '600' }}>{rival.studentCount}</div>
                  </div>
                  <div>
                    <span style={{ color: '#b8b8d0' }}>⚔️ 战力</span>
                    <div style={{ color: '#ff6b6b', fontWeight: '600' }}>{formatNumber(rival.combatPower)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(76, 175, 80, 0.15)',
                    color: '#81c784',
                  }}>
                    胜 {rival.victoryCount}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(244, 67, 54, 0.15)',
                    color: '#e57373',
                  }}>
                    负 {rival.defeatedCount}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(156, 39, 176, 0.15)',
                    color: '#ba68c8',
                  }}>
                    据点 {rivalCompetition.resourcePoints.filter(p => p.controllerId === rival.id).length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ranking' && (
        <div>
          {currentWeek && (
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 159, 67, 0.1) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.25)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#ffd700', margin: 0 }}>
                    🏆 第 {currentWeek.weekNumber} 周排行榜
                  </h3>
                  <p style={{ fontSize: '13px', color: '#b8b8d0', margin: '4px 0 0 0' }}>
                    结算于第 {currentWeek.settlementDay} 天
                  </p>
                </div>
                {!currentWeek.claimed && (
                  <button
                    className="btn btn-primary"
                    onClick={claimWeeklyRankingReward}
                  >
                    🎁 领取奖励
                  </button>
                )}
                {currentWeek.claimed && (
                  <span style={{ color: '#81c784', fontSize: '14px' }}>✅ 已领取</span>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}>
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>你的排名</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffd700' }}>
                    #{currentWeek.playerRank}
                  </div>
                </div>
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>你的积分</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#c9a9ff' }}>
                    {formatNumber(currentWeek.playerScore)}
                  </div>
                </div>
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '6px' }}>奖励</div>
                  <div style={{ fontSize: '14px', color: '#4ecdc4' }}>
                    {Object.entries(currentWeek.rewards).map(([k, v]) => (
                      <div key={k}>
                        {RESOURCE_ICONS[k] || '📦'} +{v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#c9a9ff' }}>📊 当前周排名</h3>
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.04)',
          }}>
            {[
              {
                id: 'player',
                name: '🏰 我的学院',
                score: playerWeeklyScore,
                isPlayer: true,
                color: '#6b59cc',
              },
              ...rivalCompetition.rivalAcademies.map(r => ({
                id: r.id,
                name: `${r.icon} ${r.name}`,
                score: r.weeklyScore,
                isPlayer: false,
                color: r.color,
              })),
            ]
              .sort((a, b) => b.score - a.score)
              .map((item, idx) => {
                const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 20px',
                      borderBottom: idx < 11 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      background: item.isPlayer ? 'rgba(107, 89, 204, 0.1)' : 'transparent',
                    }}
                  >
                    <div style={{
                      width: '48px',
                      fontSize: idx < 3 ? '24px' : '16px',
                      fontWeight: '700',
                      color: idx < 3 ? '#ffd700' : '#b8b8d0',
                      textAlign: 'center',
                    }}>
                      {rankIcon}
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{
                        width: '6px',
                        height: '24px',
                        borderRadius: '3px',
                        background: item.color,
                      }} />
                      <span style={{
                        fontSize: '15px',
                        color: item.isPlayer ? '#c9a9ff' : '#e8e8f0',
                        fontWeight: item.isPlayer ? '600' : '400',
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffd700',
                    }}>
                      {formatNumber(item.score)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeTab === 'contestation' && (
        <div>
          {rivalCompetition.activeContestations.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#ff6b6b' }}>⚔️ 进行中的争夺</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {rivalCompetition.activeContestations.map(c => {
                  const point = rivalCompetition.resourcePoints.find(p => p.id === c.pointId);
                  const isPlayerChallenger = c.challengerId === 'player';
                  const isPlayerDefender = c.defenderId === 'player';
                  const challengerName = isPlayerChallenger
                    ? '🏰 我的学院'
                    : rivalCompetition.rivalAcademies.find(r => r.id === c.challengerId)?.name || '未知';
                  const defenderName = c.defenderId === 'neutral'
                    ? '⚪ 中立'
                    : isPlayerDefender
                      ? '🏰 我的学院'
                      : rivalCompetition.rivalAcademies.find(r => r.id === c.defenderId)?.name || '未知';
                  const totalProgress = c.challengerProgress + c.defenderProgress || 1;

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 107, 107, 0.08)',
                        border: '1px solid rgba(255, 107, 107, 0.25)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#e8e8f0' }}>
                          📍 {c.pointName}
                        </span>
                        <span style={{ fontSize: '12px', color: '#b8b8d0' }}>
                          第 {c.startDay} 天开始
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        fontSize: '13px',
                      }}>
                        <span style={{ color: isPlayerChallenger ? '#c9a9ff' : '#ff6b6b' }}>
                          ⚔️ {challengerName}
                        </span>
                        <span style={{ color: '#888', fontWeight: '600' }}>VS</span>
                        <span style={{ color: isPlayerDefender ? '#c9a9ff' : '#4ecdc4' }}>
                          🛡️ {defenderName}
                        </span>
                      </div>

                      <div style={{
                        height: '16px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          width: `${(c.challengerProgress / totalProgress) * 100}%`,
                          background: 'linear-gradient(90deg, #ff6b6b, #ff9f43)',
                          transition: 'width 0.3s',
                        }} />
                        <div style={{
                          width: `${(c.defenderProgress / totalProgress) * 100}%`,
                          background: 'linear-gradient(90deg, #4ecdc4, #66c2a5)',
                          transition: 'width 0.3s',
                        }} />
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#b8b8d0',
                      }}>
                        <span>进攻进度: {(c.challengerProgress / point?.defenderBonus * 100 || 0).toFixed(1)}%</span>
                        <span>防守进度: {(c.defenderProgress / point?.defenderBonus * 100 || 0).toFixed(1)}%</span>
                      </div>

                      {(isPlayerChallenger || isPlayerDefender) && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.04)',
                        }}>
                          <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '8px' }}>
                            投入金币影响进度（当前: 💰{isPlayerChallenger ? c.playerChallengerInvestment?.gold || 0 : c.playerDefenderInvestment?.gold || 0}）
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="number"
                              value={investGold}
                              onChange={e => setInvestGold(Math.max(0, Number(e.target.value)))}
                              placeholder="投入金币数量"
                              style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid rgba(107, 89, 204, 0.3)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#e8e8f0',
                                fontSize: '14px',
                                outline: 'none',
                              }}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={() => handleInvest(c.id)}
                              disabled={investGold <= 0 || resources.gold < investGold}
                            >
                              💰 投入
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#c9a9ff' }}>🗺️ 资源据点</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {rivalCompetition.resourcePoints.map(point => {
              const controller = point.controllerId === 'player'
                ? { name: '🏰 我的学院', color: '#6b59cc' }
                : point.controllerId === 'neutral'
                  ? { name: '⚪ 中立', color: '#888' }
                  : (() => {
                      const r = rivalCompetition.rivalAcademies.find(ra => ra.id === point.controllerId);
                      return { name: `${r?.icon || ''} ${r?.name || '未知'}`, color: r?.color || '#666' };
                    })();
              const isActive = selectedPointId === point.id;

              return (
                <div
                  key={point.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isActive
                      ? 'rgba(107, 89, 204, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `2px solid ${isActive ? '#6b59cc' : controller.color}33`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedPointId(isActive ? null : point.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#e8e8f0', marginBottom: '4px' }}>
                        {point.type === 'mana_spring' ? '💎' : point.type === 'ancient_library' ? '📚' : point.type === 'gold_mine' ? '💰' : point.type === 'fertile_lands' ? '🌾' : '🎓'} {point.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b8b8d0' }}>
                        {point.description}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: `${controller.color}22`,
                      color: controller.color,
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}>
                      {controller.name}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#b8b8d0',
                    marginBottom: '12px',
                  }}>
                    每日产出:
                    {Object.entries(point.dailyProduction).map(([k, v]) => (
                      <span key={k} style={{ marginLeft: '8px', color: '#4ecdc4' }}>
                        {RESOURCE_ICONS[k]} +{v}
                      </span>
                    ))}
                  </div>

                  {isActive && point.controllerId !== 'player' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.2)',
                    }}>
                      <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '8px' }}>
                        ⚔️ 攻占需要战力: {point.captureRequired}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '12px' }}>
                        防守加成: +{(point.defenderBonus * 100).toFixed(0)}%
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartContestation(point.id);
                        }}
                        disabled={!canStartContestation(point.id)}
                        style={{ width: '100%' }}
                      >
                        {rivalCompetition.activeContestations.length >= rivalCompetition.maxActiveContestations
                          ? `🔒 争夺数已达上限 (${rivalCompetition.maxActiveContestations})`
                          : '⚔️ 发起争夺'}
                      </button>
                    </div>
                  )}

                  {isActive && point.controllerId === 'player' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(76, 175, 80, 0.1)',
                      fontSize: '12px',
                      color: '#81c784',
                      textAlign: 'center',
                    }}>
                      ✅ 该据点在你的控制下，每日获得产出
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'recruitment' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
          }}>
            <div style={{ fontSize: '14px', color: '#b8b8d0' }}>
              今日竞拍次数: <span style={{ color: '#c9a9ff', fontWeight: '600' }}>
                {rivalCompetition.bidsUsedToday}/{rivalCompetition.maxBidsPerDay}
              </span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => refreshRecruitmentCandidates(4)}
              disabled={resources.gold < 50}
            >
              🔄 刷新候选人 (💰 50)
            </button>
          </div>

          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#c9a9ff' }}>🎓 招募候选人（拍卖）</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {rivalCompetition.recruitmentCandidates.length === 0 && (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#888' }}>
                暂无候选人，点击上方刷新按钮获取新的候选人
              </div>
            )}
            {rivalCompetition.recruitmentCandidates.map(candidate => {
              const myBid = candidate.bids.find(b => b.bidderId === 'player')?.amount || 0;
              const topBid = candidate.bids.length > 0
                ? candidate.bids.reduce((max, b) => Math.max(max, b.amount), 0)
                : 0;
              const isSelected = selectedCandidateId === candidate.id;
              const daysLeft = candidate.expiryDay - day;
              const tierColors: Record<string, string> = {
                S: '#ffd700',
                A: '#ff6b6b',
                B: '#4ecdc4',
                C: '#66c2a5',
                D: '#88c4ff',
              };

              return (
                <div
                  key={candidate.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isSelected
                      ? 'rgba(107, 89, 204, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `2px solid ${isSelected ? '#6b59cc' : (tierColors[candidate.tier] || '#666')}33`,
                    cursor: daysLeft > 0 ? 'pointer' : 'default',
                    opacity: daysLeft <= 0 ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                  onClick={() => daysLeft > 0 && setSelectedCandidateId(isSelected ? null : candidate.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: `${tierColors[candidate.tier]}22`,
                      border: `2px solid ${tierColors[candidate.tier] || '#666'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}>
                      {candidate.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#e8e8f0' }}>
                          {candidate.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          background: `${tierColors[candidate.tier]}22`,
                          color: tierColors[candidate.tier] || '#666',
                          fontWeight: '700',
                        }}>
                          {candidate.tier}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#b8b8d0' }}>
                        {candidate.courseType === 'attack' ? '⚔️ 战斗系' : candidate.courseType === 'support' ? '💚 辅助系' : candidate.courseType === 'healer' ? '💖 治疗系' : '📖 研究系'} · 潜力 {candidate.potential}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '12px',
                        color: daysLeft > 0 ? '#4ecdc4' : '#ff6b6b',
                        fontWeight: '600',
                      }}>
                        {daysLeft > 0 ? `剩余 ${daysLeft} 天` : '已结束'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                        {candidate.bids.length} 人竞拍
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    fontSize: '11px',
                    marginBottom: '12px',
                  }}>
                    <div>
                      <span style={{ color: '#b8b8d0' }}>⚔️ 攻击</span>
                      <div style={{ color: '#ff6b6b', fontWeight: '600' }}>{candidate.stats.attack}</div>
                    </div>
                    <div>
                      <span style={{ color: '#b8b8d0' }}>🛡️ 防御</span>
                      <div style={{ color: '#4ecdc4', fontWeight: '600' }}>{candidate.stats.defense}</div>
                    </div>
                    <div>
                      <span style={{ color: '#b8b8d0' }}>💫 魔力</span>
                      <div style={{ color: '#c9a9ff', fontWeight: '600' }}>{candidate.stats.magic}</div>
                    </div>
                    <div>
                      <span style={{ color: '#b8b8d0' }}>❤️ 体力</span>
                      <div style={{ color: '#66c2a5', fontWeight: '600' }}>{candidate.stats.stamina}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                  }}>
                    <span style={{ color: '#b8b8d0' }}>当前最高</span>
                    <span style={{ color: '#ffd700', fontWeight: '700' }}>
                      💰 {topBid > 0 ? formatNumber(topBid) : '无'}
                    </span>
                  </div>

                  {myBid > 0 && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: myBid >= topBid
                        ? 'rgba(76, 175, 80, 0.15)'
                        : 'rgba(244, 67, 54, 0.15)',
                      color: myBid >= topBid ? '#81c784' : '#e57373',
                      textAlign: 'center',
                    }}>
                      {myBid >= topBid ? '🥇 你的出价领先！' : `📉 你的出价 💰${formatNumber(myBid)} 已落后`}
                    </div>
                  )}

                  {isSelected && daysLeft > 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '14px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.25)',
                    }}>
                      <div style={{ fontSize: '12px', color: '#b8b8d0', marginBottom: '10px' }}>
                        最低加价: 💰 {Math.max(candidate.minBid, topBid + 50)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={e => setBidAmount(Math.max(candidate.minBid, Number(e.target.value)))}
                          min={Math.max(candidate.minBid, topBid + 50)}
                          placeholder="输入出价"
                          onClick={e => e.stopPropagation()}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(107, 89, 204, 0.3)',
                            background: 'rgba(0,0,0,0.2)',
                            color: '#e8e8f0',
                            fontSize: '14px',
                            outline: 'none',
                          }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaceBid(candidate.id);
                          }}
                          disabled={
                            bidAmount <= topBid ||
                            resources.gold < bidAmount ||
                            rivalCompetition.bidsUsedToday >= rivalCompetition.maxBidsPerDay
                          }
                        >
                          🔨 出价
                        </button>
                      </div>
                      {rivalCompetition.bidsUsedToday >= rivalCompetition.maxBidsPerDay && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          color: '#ff6b6b',
                          textAlign: 'center',
                        }}>
                          ⚠️ 今日竞拍次数已用完
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {rivalCompetition.bidResults.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#c9a9ff' }}>📜 拍卖结果</h3>
              <div style={{
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                maxHeight: '300px',
                overflowY: 'auto',
              }}>
                {rivalCompetition.bidResults.slice().reverse().map((result, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 18px',
                      borderBottom: idx < rivalCompetition.bidResults.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{result.won ? '🎉' : '😢'}</span>
                      <div>
                        <div style={{ fontSize: '14px', color: '#e8e8f0' }}>
                          {result.candidateName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          第 {result.settlementDay} 天
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: result.won ? '#81c784' : '#e57373', fontWeight: '600' }}>
                        {result.won ? '竞拍成功' : '竞拍失败'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#ffd700' }}>
                        💰 {formatNumber(result.finalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
