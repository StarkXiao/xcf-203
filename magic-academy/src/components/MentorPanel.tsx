import { useState } from 'react';
import { useGame } from '../store/GameContext';
import type { Mentor } from '../types/game';

export default function MentorPanel() {
  const {
    state,
    recruitMentor,
    refreshMentorPool,
    assignMentorToCourse,
    unassignMentorFromCourse,
    assignMentorToDungeon,
    upgradeMentorRank,
    upgradeAcademy,
    unlockAcademy,
    assignMentorToAcademy,
    calculateMentorCourseBonus,
    calculateMentorDungeonBonus,
    calculateMentorPromotionBonus,
    canAssignMentorToCourse,
    canMentorLeadDungeon,
    getAcademyUpgradeCost,
    getNextMentorRank,
    MENTOR_QUALITY_NAMES,
    MENTOR_RANK_NAMES,
    getMentorQualityMultiplier,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'mentors' | 'recruit' | 'academies'>('mentors');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(
    state.mentorState.mentors[0]?.id || null
  );
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(
    state.mentorState.academies.find(a => a.unlocked)?.id || null
  );
  const [showCourseAssign, setShowCourseAssign] = useState(false);
  const [showDungeonAssign, setShowDungeonAssign] = useState(false);

  const { mentors, academies, recruitmentPool } = state.mentorState;
  const selectedMentor = mentors.find(m => m.id === selectedMentorId);
  const selectedAcademy = academies.find(a => a.id === selectedAcademyId);

  const getQualityStyle = (quality: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      common: { bg: 'rgba(156, 163, 175, 0.15)', border: '#9CA3AF', text: '#9CA3AF' },
      rare: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: '#3B82F6' },
      epic: { bg: 'rgba(168, 85, 247, 0.15)', border: '#A855F7', text: '#A855F7' },
      legendary: { bg: 'rgba(251, 191, 36, 0.15)', border: '#FBBF24', text: '#FBBF24' },
      mythic: { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', text: '#EF4444' },
    };
    return colors[quality] || colors.common;
  };

  const getMagicTypeIcon = (type?: string) => {
    if (!type) return '🔮';
    const icons: Record<string, string> = {
      fire: '🔥', water: '💧', earth: '🏔️', wind: '🌪️', light: '✨', dark: '🌙',
    };
    return icons[type] || '🔮';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      idle: { text: '空闲', color: '#9CA3AF' },
      teaching: { text: '授课中', color: '#3B82F6' },
      dungeon_lead: { text: '带队中', color: '#EF4444' },
      researching: { text: '研究中', color: '#A855F7' },
      resting: { text: '休息中', color: '#22C55E' },
    };
    return labels[status] || labels.idle;
  };

  const formatCost = (cost: Partial<{ gold: number; mana: number; food: number; reputation: number }>) => {
    const parts: string[] = [];
    if (cost.gold) parts.push(`💰${cost.gold}`);
    if (cost.mana) parts.push(`💎${cost.mana}`);
    if (cost.food) parts.push(`🍞${cost.food}`);
    if (cost.reputation) parts.push(`⭐${cost.reputation}`);
    return parts.join(' ') || '免费';
  };

  const canAffordCost = (cost: Partial<{ gold: number; mana: number; food: number; reputation: number }>) => {
    return (
      state.resources.gold >= (cost.gold || 0) &&
      state.resources.mana >= (cost.mana || 0) &&
      state.resources.food >= (cost.food || 0) &&
      state.resources.reputation >= (cost.reputation || 0)
    );
  };

  const handleRecruit = (optionId: string) => {
    const option = recruitmentPool.currentOptions.find(o => o.id === optionId);
    if (!option) return;
    if (canAffordCost(option.cost) && state.resources.reputation >= option.requiredReputation) {
      recruitMentor(optionId);
    }
  };

  const handleRefreshPool = (useFree = false) => {
    refreshMentorPool(useFree);
  };

  const renderRecruitPool = () => (
    <div className="mentor-recruit-section">
      <div className="section-header">
        <h3>🎯 导师招募池</h3>
        <div className="refresh-info">
          <span>免费刷新: {recruitmentPool.freeRefreshesPerWeek - recruitmentPool.freeRefreshesUsed}/{recruitmentPool.freeRefreshesPerWeek}</span>
          <button
            className="btn btn-small btn-secondary"
            disabled={recruitmentPool.freeRefreshesUsed >= recruitmentPool.freeRefreshesPerWeek}
            onClick={() => handleRefreshPool(true)}
          >
            免费刷新
          </button>
          <button
            className="btn btn-small btn-primary"
            disabled={!canAffordCost(recruitmentPool.refreshCost)}
            onClick={() => handleRefreshPool(false)}
          >
            付费刷新 ({formatCost(recruitmentPool.refreshCost)})
          </button>
        </div>
      </div>

      <div className="recruit-options-grid">
        {recruitmentPool.currentOptions.length === 0 ? (
          <div className="empty-state">
            <p>招募池已空，请刷新</p>
          </div>
        ) : (
          recruitmentPool.currentOptions.map(option => {
            const qStyle = getQualityStyle(option.mentorTemplate.quality);
            const canRecruit = !option.locked &&
              canAffordCost(option.cost) &&
              state.resources.reputation >= option.requiredReputation &&
              mentors.length < state.mentorState.maxMentors;

            return (
              <div
                key={option.id}
                className={`recruit-card ${option.locked ? 'locked' : ''}`}
                style={{ borderColor: option.locked ? 'var(--border)' : qStyle.border, background: option.locked ? undefined : qStyle.bg }}
              >
                <div className="recruit-card-header">
                  <span className="mentor-avatar">{getMagicTypeIcon(option.mentorTemplate.magicType)}</span>
                  <div>
                    <div className="recruit-name">{option.mentorTemplate.name}</div>
                    <div
                      className="quality-badge"
                      style={{ background: qStyle.bg, color: qStyle.text, borderColor: qStyle.border }}
                    >
                      {MENTOR_QUALITY_NAMES[option.mentorTemplate.quality as keyof typeof MENTOR_QUALITY_NAMES]}
                    </div>
                  </div>
                </div>

                <div className="recruit-card-stats">
                  <div className="stat-row">
                    <span>经验加成</span>
                    <span>+{Math.round((option.mentorTemplate.expBonus - 1) * 100)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>技能加成</span>
                    <span>+{Math.round((option.mentorTemplate.skillBonus - 1) * 100)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>领导力</span>
                    <span>{option.mentorTemplate.leadership}</span>
                  </div>
                  <div className="stat-row">
                    <span>魅力</span>
                    <span>{option.mentorTemplate.charisma}</span>
                  </div>
                  <div className="stat-row">
                    <span>知识</span>
                    <span>{option.mentorTemplate.knowledge}</span>
                  </div>
                </div>

                {option.mentorTemplate.specializations.length > 0 && (
                  <div className="recruit-specs">
                    <div className="specs-label">初始专精:</div>
                    <div className="specs-list">
                      {option.mentorTemplate.specializations.map(s => (
                        <span key={s.id} className="spec-tag">{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="recruit-card-footer">
                  <div className="cost-info">
                    <div>费用: {formatCost(option.cost)}</div>
                    {option.requiredReputation > 0 && (
                      <div className={state.resources.reputation >= option.requiredReputation ? '' : 'not-met'}>
                        需要声望: ⭐{option.requiredReputation}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={!canRecruit}
                    onClick={() => handleRecruit(option.id)}
                  >
                    {option.locked ? '🔒 锁定' : mentors.length >= state.mentorState.maxMentors ? '已满员' : '招募'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mentor-capacity">
        当前导师: {mentors.length}/{state.mentorState.maxMentors}
      </div>
    </div>
  );

  const renderMentorList = () => (
    <div className="mentor-list-section">
      <div className="mentor-list-layout">
        <div className="mentor-sidebar">
          <div className="list-title">导师列表 ({mentors.length})</div>
          <div className="mentor-list">
            {mentors.length === 0 ? (
              <div className="empty-state small">
                <p>暂无导师，前往招募面板招募</p>
              </div>
            ) : (
              mentors.map(mentor => {
                const qStyle = getQualityStyle(mentor.quality);
                const statusInfo = getStatusLabel(mentor.status);
                const isSelected = mentor.id === selectedMentorId;

                return (
                  <div
                    key={mentor.id}
                    className={`mentor-list-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMentorId(mentor.id)}
                    style={{ borderLeftColor: qStyle.border }}
                  >
                    <div className="mentor-list-avatar">{getMagicTypeIcon(mentor.magicType)}</div>
                    <div className="mentor-list-info">
                      <div className="mentor-list-name">{mentor.name}</div>
                      <div className="mentor-list-sub">
                        <span style={{ color: qStyle.text }}>
                          {MENTOR_QUALITY_NAMES[mentor.quality as keyof typeof MENTOR_QUALITY_NAMES]}
                        </span>
                        <span>· Lv.{mentor.level}</span>
                        <span style={{ color: statusInfo.color }}>· {statusInfo.text}</span>
                      </div>
                      <div className="mentor-list-rank">
                        {MENTOR_RANK_NAMES[mentor.rank as keyof typeof MENTOR_RANK_NAMES]}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mentor-detail">
          {selectedMentor ? (
            <>
              <MentorDetail
                mentor={selectedMentor}
                setShowCourseAssign={setShowCourseAssign}
                setShowDungeonAssign={setShowDungeonAssign}
              />

              {showCourseAssign && (
                <CourseAssignModal
                  mentor={selectedMentor}
                  onClose={() => setShowCourseAssign(false)}
                />
              )}

              {showDungeonAssign && (
                <DungeonAssignModal
                  mentor={selectedMentor}
                  onClose={() => setShowDungeonAssign(false)}
                />
              )}
            </>
          ) : (
            <div className="empty-state">
              <p style={{ fontSize: '48px', margin: 0 }}>👨‍🏫</p>
              <p>请选择一位导师查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademies = () => (
    <div className="academy-section">
      <div className="academy-layout">
        <div className="academy-sidebar">
          <div className="list-title">学院列表</div>
          <div className="academy-list">
            {academies.map(academy => {
              const isSelected = academy.id === selectedAcademyId;
              return (
                <div
                  key={academy.id}
                  className={`academy-list-card ${isSelected ? 'selected' : ''} ${!academy.unlocked ? 'locked' : ''}`}
                  onClick={() => academy.unlocked && setSelectedAcademyId(academy.id)}
                >
                  <div className="academy-list-icon">🏛️</div>
                  <div className="academy-list-info">
                    <div className="academy-list-name">{academy.name}</div>
                    <div className="academy-list-sub">
                      {academy.unlocked ? (
                        <>Lv.{academy.level} · 👥 {academy.mentors.length}/{academy.maxMentors}</>
                      ) : (
                        <>🔒 需声望 ⭐{academy.requiredReputation}</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="academy-detail">
          {selectedAcademy ? (
            <AcademyDetail academy={selectedAcademy} />
          ) : (
            <div className="empty-state">
              <p style={{ fontSize: '48px', margin: 0 }}>🏛️</p>
              <p>请选择一个学院查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function MentorDetail({
    mentor,
    setShowCourseAssign,
    setShowDungeonAssign,
  }: {
    mentor: Mentor;
    setShowCourseAssign: (v: boolean) => void;
    setShowDungeonAssign: (v: boolean) => void;
  }) {
    const qStyle = getQualityStyle(mentor.quality);
    const statusInfo = getStatusLabel(mentor.status);
    const nextRank = getNextMentorRank(mentor.rank);
    const expProgress = mentor.exp / Math.max(1, mentor.expToNextRank);
    const qualityMult = getMentorQualityMultiplier(mentor.quality);
    const academy = academies.find(a => a.id === mentor.academyId);

    const assignedCourseObjs = mentor.assignedCourses
      .map(id => state.courses.find(c => c.id === id))
      .filter(Boolean);
    const assignedDungeonObj = mentor.assignedDungeon
      ? state.dungeons.find(d => d.id === mentor.assignedDungeon)
      : null;

    return (
      <div className="mentor-detail-content">
        <div className="detail-header">
          <div className="detail-title-row">
            <div className="big-avatar" style={{ background: qStyle.bg, borderColor: qStyle.border }}>
              {getMagicTypeIcon(mentor.magicType)}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{mentor.name}</h3>
              <div className="detail-subtitle">
                <span className="quality-badge" style={{ background: qStyle.bg, color: qStyle.text, borderColor: qStyle.border }}>
                  {MENTOR_QUALITY_NAMES[mentor.quality as keyof typeof MENTOR_QUALITY_NAMES]}
                </span>
                <span className="rank-badge">{MENTOR_RANK_NAMES[mentor.rank as keyof typeof MENTOR_RANK_NAMES]}</span>
                <span style={{ color: statusInfo.color }}>· {statusInfo.text}</span>
              </div>
              {mentor.description && (
                <p className="mentor-description">{mentor.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>晋升进度</span>
            <span>
              {mentor.exp}/{mentor.expToNextRank}
              {nextRank && (
                <> · 下一级: {MENTOR_RANK_NAMES[nextRank as keyof typeof MENTOR_RANK_NAMES]}</>
              )}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${expProgress * 100}%` }} />
          </div>
          {nextRank && mentor.exp >= mentor.expToNextRank && (
            <button className="btn btn-success mt-small" onClick={() => upgradeMentorRank(mentor.id)}>
              🎉 晋升为 {MENTOR_RANK_NAMES[nextRank as keyof typeof MENTOR_RANK_NAMES]}
            </button>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">Lv.{mentor.level}</div>
              <div className="stat-label">等级</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">+{Math.round((mentor.expBonus - 1) * 100)}%</div>
              <div className="stat-label">经验加成</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚔️</div>
            <div className="stat-content">
              <div className="stat-value">+{Math.round((mentor.skillBonus - 1) * 100)}%</div>
              <div className="stat-label">技能加成</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <div className="stat-value">{mentor.leadership}</div>
              <div className="stat-label">领导力</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💫</div>
            <div className="stat-content">
              <div className="stat-value">{mentor.charisma}</div>
              <div className="stat-label">魅力</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{mentor.knowledge}</div>
              <div className="stat-label">知识</div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>🎓 授课分配</h4>
          <div className="assign-info">
            <span>当前课程: {assignedCourseObjs.length}/{mentor.maxCourses}</span>
            <button className="btn btn-small btn-primary" onClick={() => setShowCourseAssign(true)}>
              管理课程
            </button>
          </div>
          <div className="assigned-list">
            {assignedCourseObjs.length === 0 ? (
              <div className="empty-small">暂无分配课程</div>
            ) : (
              assignedCourseObjs.map(course => course && (
                <div key={course.id} className="assigned-item">
                  <span>📖 {course.name}</span>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => unassignMentorFromCourse(mentor.id, course.id)}
                  >
                    移除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="detail-section">
          <h4>⚔️ 副本带队</h4>
          <div className="assign-info">
            <span>当前带队: {assignedDungeonObj ? assignedDungeonObj.name : '无'}</span>
            <button className="btn btn-small btn-primary" onClick={() => setShowDungeonAssign(true)}>
              管理带队
            </button>
          </div>
          {assignedDungeonObj && (
            <div className="assigned-item">
              <span>🏰 {assignedDungeonObj.name} (Lv.{assignedDungeonObj.level})</span>
              <button
                className="btn btn-small btn-danger"
                onClick={() => assignMentorToDungeon(mentor.id, null)}
              >
                取消带队
              </button>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h4>🏛️ 所属学院</h4>
          <div className="assign-info">
            <span>{academy ? academy.name : '未加入学院'}</span>
          </div>
          <div className="academy-assign-list">
            {academies.filter(a => a.unlocked).map(a => (
              <button
                key={a.id}
                className={`btn btn-small ${mentor.academyId === a.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => assignMentorToAcademy(mentor.id, mentor.academyId === a.id ? null : a.id)}
              >
                {mentor.academyId === a.id ? '✓ ' : ''}{a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>📖 专精技能</h4>
          <div className="specializations-list">
            {mentor.specializations.length === 0 ? (
              <div className="empty-small">暂无专精</div>
            ) : (
              mentor.specializations.map(spec => (
                <div key={spec.id} className="specialization-card">
                  <div className="spec-header">
                    <span className="spec-name">{spec.name}</span>
                    <span className="spec-level">Lv.{spec.level}/{spec.maxLevel}</span>
                  </div>
                  <div className="spec-progress">
                    <div
                      className="spec-progress-fill"
                      style={{ width: `${(spec.currentExp / spec.expToNext) * 100}%` }}
                    />
                  </div>
                  <div className="spec-effect">{spec.effectDescription}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="detail-section">
          <h4>📊 加成效果</h4>
          <MentorBonusDisplay mentor={mentor} />
        </div>

        <div className="detail-section stats-mini">
          <div className="mini-stat">
            <span>已教授学员</span>
            <span>{mentor.totalStudentsTaught}</span>
          </div>
          <div className="mini-stat">
            <span>已带队副本</span>
            <span>{mentor.totalDungeonsLed}</span>
          </div>
          <div className="mini-stat">
            <span>入队天数</span>
            <span>第 {mentor.recruitedAt} 天</span>
          </div>
          <div className="mini-stat">
            <span>品质系数</span>
            <span>x{qualityMult}</span>
          </div>
        </div>
      </div>
    );
  }

  function MentorBonusDisplay({ mentor }: { mentor: Mentor }) {
    const dummyStudent = {
      id: 'dummy', name: '', quality: 'common' as const, magicType: mentor.magicType, level: 1, exp: 0,
      maxExp: 100, potential: 1, traits: [], morale: 100, maxMorale: 100, stamina: 100, maxStamina: 100,
      currentHp: 100, maxHp: 100, skills: [], status: 'idle' as const, assignedBuilding: null,
      assignedCourse: null, courseProgress: 0, courseDaysRemaining: 0, courseQueue: [],
      recruitmentInfo: { recruitedAt: 1, recruitmentQuality: 'common' as const, initialLevel: 1, initialPotential: 1 },
      growthRecords: [], courseHistory: [], dungeonHistory: [],
    };
    const courseBonus = calculateMentorCourseBonus(
      { id: 'dummy', name: '', level: 1, duration: 0, cost: { gold: 0, mana: 0, food: 0, reputation: 0 }, effect: { type: 'exp_gain', value: 0 }, requiredLevel: 0, requiredReputation: 0, magicType: mentor.magicType, assignedTeacher: null },
      [mentor],
      academies
    );
    const dungeonBonus = calculateMentorDungeonBonus(
      { id: 'dummy', name: '', level: 1, waves: 0, enemies: [], rewards: { gold: 0, mana: 0, food: 0, reputation: 0 }, firstClearRewards: { gold: 0, mana: 0, food: 0, reputation: 0 }, requiredLevel: 1, staminaCost: 0, stars: 0, bestStars: 0, firstCleared: false, clearedCount: 0, bestTeam: [], sweepUnlocked: false, starRequirements: { threeStar: '', twoStar: '', oneStar: '' } },
      [dummyStudent],
      [mentor],
      academies
    );
    const promoBonus = calculateMentorPromotionBonus(
      dummyStudent,
      [mentor],
      academies
    );

    return (
      <div className="bonus-display">
        <div className="bonus-grid">
          <div className="bonus-item">
            <span className="bonus-label">课程经验</span>
            <span className="bonus-value">x{courseBonus.expMultiplier.toFixed(2)}</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-label">课程速度</span>
            <span className="bonus-value">x{courseBonus.speedMultiplier.toFixed(2)}</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-label">技能加成</span>
            <span className="bonus-value">x{courseBonus.skillBonusMultiplier.toFixed(2)}</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-label">副本奖励</span>
            <span className="bonus-value">x{dungeonBonus.rewardMultiplier.toFixed(2)}</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-label">经验加成</span>
            <span className="bonus-value">x{dungeonBonus.expMultiplier.toFixed(2)}</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-label">晋升概率</span>
            <span className="bonus-value">+{Math.round(promoBonus.probabilityBonus * 100)}%</span>
          </div>
        </div>
        {courseBonus.academyBonus > 0 && (
          <div className="academy-bonus-tag">
            🏛️ 学院加成: +{Math.round(courseBonus.academyBonus * 100)}%
          </div>
        )}
      </div>
    );
  }

  function CourseAssignModal({
    mentor,
    onClose,
  }: {
    mentor: Mentor;
    onClose: () => void;
  }) {
    const availableCourses = state.courses.filter(course => {
      if (mentor.assignedCourses.includes(course.id)) return false;
      return true;
    });

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>📖 分配课程 - {mentor.name}</h3>
            <button className="btn btn-small btn-secondary" onClick={onClose}>关闭</button>
          </div>
          <div className="modal-body">
            <div className="modal-info">
              已分配: {mentor.assignedCourses.length}/{mentor.maxCourses}
            </div>
            <div className="course-select-list">
              {availableCourses.length === 0 ? (
                <div className="empty-state small">没有可分配的课程</div>
              ) : (
                availableCourses.map(course => {
                  const check = canAssignMentorToCourse(mentor, course.id);
                  const canAssign = check.ok && mentor.assignedCourses.length < mentor.maxCourses;
                  return (
                    <div key={course.id} className="course-select-item">
                      <div>
                        <div className="course-select-name">{course.name}</div>
                        <div className="course-select-sub">Lv.{course.level} · {getMagicTypeIcon(course.magicType)}</div>
                      </div>
                      <button
                        className="btn btn-small btn-primary"
                        disabled={!canAssign}
                        onClick={() => {
                          if (canAssign) {
                            assignMentorToCourse(mentor.id, course.id);
                            onClose();
                          }
                        }}
                      >
                        {check.ok ? '分配' : check.reason}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DungeonAssignModal({
    mentor,
    onClose,
  }: {
    mentor: Mentor;
    onClose: () => void;
  }) {
    const availableDungeons = state.dungeons.filter(d => d.firstCleared);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>⚔️ 分配副本带队 - {mentor.name}</h3>
            <button className="btn btn-small btn-secondary" onClick={onClose}>关闭</button>
          </div>
          <div className="modal-body">
            <div className="dungeon-select-list">
              {availableDungeons.length === 0 ? (
                <div className="empty-state small">没有可带队的副本（需先通关）</div>
              ) : (
                availableDungeons.map(dungeon => {
                  const leadResult = canMentorLeadDungeon(mentor, dungeon.level);
                  const isAssigned = mentor.assignedDungeon === dungeon.id;
                  return (
                    <div key={dungeon.id} className="dungeon-select-item">
                      <div>
                        <div className="dungeon-select-name">🏰 {dungeon.name}</div>
                        <div className="dungeon-select-sub">Lv.{dungeon.level} · 奖励: {formatCost(dungeon.rewards)}</div>
                      </div>
                      <button
                        className={`btn btn-small ${isAssigned ? 'btn-danger' : 'btn-primary'}`}
                        disabled={!leadResult.canLead && !isAssigned}
                        onClick={() => {
                          if (isAssigned) {
                            assignMentorToDungeon(mentor.id, null);
                          } else if (leadResult.canLead) {
                            assignMentorToDungeon(mentor.id, dungeon.id);
                          }
                          onClose();
                        }}
                      >
                        {isAssigned ? '取消' : leadResult.canLead ? '带队' : leadResult.reason}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AcademyDetail({ academy }: { academy: typeof selectedAcademy }) {
    if (!academy) return null;
    const upgradeCost = getAcademyUpgradeCost(academy);
    const canUpgrade = academy.unlocked && academy.level < academy.maxLevel && canAffordCost(upgradeCost);
    const academyMentors = mentors.filter(m => academy.mentors.includes(m.id));
    const nonAcademyMentors = mentors.filter(m => !academy.mentors.includes(m.id));

    return (
      <div className="academy-detail-content">
        <div className="detail-header">
          <div className="detail-title-row">
            <div className="big-avatar academy-avatar">🏛️</div>
            <div>
              <h3 style={{ margin: 0 }}>{academy.name}</h3>
              <div className="detail-subtitle">
                {academy.unlocked ? (
                  <>
                    <span className="rank-badge">Lv.{academy.level}/{academy.maxLevel}</span>
                    <span> · 👥 {academy.mentors.length}/{academy.maxMentors}</span>
                  </>
                ) : (
                  <span>🔒 未解锁</span>
                )}
              </div>
              <p className="mentor-description">{academy.description}</p>
            </div>
            {!academy.unlocked && (
              <button
                className="btn btn-primary"
                disabled={state.resources.reputation < academy.requiredReputation}
                onClick={() => unlockAcademy(academy.id)}
              >
                解锁学院 (需 ⭐{academy.requiredReputation})
              </button>
            )}
            {academy.unlocked && academy.level < academy.maxLevel && (
              <button
                className="btn btn-success"
                disabled={!canUpgrade}
                onClick={() => upgradeAcademy(academy.id)}
              >
                🎉 升级 Lv.{academy.level + 1} ({formatCost(upgradeCost)})
              </button>
            )}
          </div>
        </div>

        {academy.unlocked && (
          <>
            <div className="academy-bonuses">
              <div className="bonus-title">🏛️ 学院加成 (Lv.{academy.level})</div>
              <div className="bonuses-grid">
                {Object.entries(academy.bonuses).map(([key, val]) => {
                  const bonusVal = typeof val === 'number' ? val : 0;
                  const lvlMult = 1 + (academy.level - 1) * 0.1;
                  const actual = bonusVal * lvlMult;
                  const labels: Record<string, string> = {
                    expBonus: '经验加成',
                    skillBonus: '技能加成',
                    speedBonus: '速度加成',
                    dungeonRewardBonus: '副本奖励',
                    promotionBonus: '晋升概率',
                    courseEfficiencyBonus: '课程效率',
                  };
                  return actual > 0 ? (
                    <span key={key} className="bonus-tag">
                      {labels[key] || key}: +{Math.round(actual * 100)}%
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="detail-section">
              <h4>👨‍🏫 学院导师 ({academyMentors.length}/{academy.maxMentors})</h4>
              <div className="academy-mentors-list">
                {academyMentors.length === 0 ? (
                  <div className="empty-small">暂无导师</div>
                ) : (
                  academyMentors.map(m => {
                    const qStyle = getQualityStyle(m.quality);
                    return (
                      <div key={m.id} className="academy-mentor-item" style={{ borderLeftColor: qStyle.border }}>
                        <span className="mentor-mini-avatar">{getMagicTypeIcon(m.magicType)}</span>
                        <div className="academy-mentor-info">
                          <div>{m.name}</div>
                          <div className="mentor-mini-sub">
                            <span style={{ color: qStyle.text }}>
                              {MENTOR_QUALITY_NAMES[m.quality as keyof typeof MENTOR_QUALITY_NAMES]}
                            </span>
                            <span> · Lv.{m.level}</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => assignMentorToAcademy(m.id, null)}
                        >
                          移除
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {academyMentors.length < academy.maxMentors && nonAcademyMentors.length > 0 && (
                <div className="add-mentors-section">
                  <div className="section-sub-title">可添加的导师:</div>
                  <div className="add-mentor-buttons">
                    {nonAcademyMentors.map(m => (
                      <button
                        key={m.id}
                        className="btn btn-small btn-secondary"
                        onClick={() => assignMentorToAcademy(m.id, academy.id)}
                      >
                        + {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="module-container mentor-module">
      <div className="module-header">
        <h2>👨‍🏫 导师养成</h2>
      </div>

      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          📋 导师列表
        </button>
        <button
          className={`tab-btn ${activeTab === 'recruit' ? 'active' : ''}`}
          onClick={() => setActiveTab('recruit')}
        >
          🎯 导师招募
        </button>
        <button
          className={`tab-btn ${activeTab === 'academies' ? 'active' : ''}`}
          onClick={() => setActiveTab('academies')}
        >
          🏛️ 学院系统
        </button>
      </div>

      {activeTab === 'mentors' && renderMentorList()}
      {activeTab === 'recruit' && renderRecruitPool()}
      {activeTab === 'academies' && renderAcademies()}
    </div>
  );
}
