import { calculateLevel } from '@/lib/xp';

interface StatsGridProps {
  totalXp: number;
  totalBuilds: number;
  totalPosts: number;
  totalTokens: number;
  currentStreak: number;
  postCount: number;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StatsGrid({
  totalXp,
  totalBuilds,
  totalPosts,
  totalTokens,
  currentStreak,
  postCount,
}: StatsGridProps) {
  const level = calculateLevel(totalXp, postCount);
  const streakMultiplier = Math.min(1 + currentStreak * 0.1, 2.0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{totalXp.toLocaleString()}</div>
        <div className="stat-label">Total XP</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{level.level}</div>
        <div className="stat-label">Current Level</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{totalBuilds}</div>
        <div className="stat-label">Builds Shipped</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{totalPosts}</div>
        <div className="stat-label">Posts Shared</div>
      </div>
      <div className="stat-card wide">
        <div className="stat-value">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</div>
        <div className="stat-label">Current Streak ({streakMultiplier.toFixed(1)}x multiplier)</div>
        <div className="streak-dots">
          {DAY_LABELS.map((label, i) => {
            const isActive = i < currentStreak % 7 || (currentStreak >= 7 && i < 7);
            const isToday = i === (currentStreak > 0 ? (currentStreak - 1) % 7 : 0) && currentStreak > 0;
            return (
              <div
                key={i}
                className={`streak-dot${isActive ? ' active' : ''}${isToday ? ' today' : ''}`}
              >
                {label}
              </div>
            );
          })}
          {DAY_LABELS.map((label, i) => (
            <div key={`next-${i}`} className="streak-dot">
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="stat-card wide">
        <div className="stat-value" style={{ color: 'var(--text)' }}>Post Gate Status</div>
        <div className="stat-label" style={{ marginTop: 8, fontSize: 14 }}>
          {level.isGated ? (
            <>
              Level {level.potentialLevel} requires <strong style={{ color: 'var(--accent)' }}>{level.postsNeeded} more post{level.postsNeeded !== 1 ? 's' : ''}</strong> to unlock.
              You have enough XP but need to share your work!
            </>
          ) : level.postsForNext > 0 ? (
            <>
              Level {level.level} &mdash; <span style={{ color: 'var(--accent)' }}>Unlocked!</span>
              <br />
              Next gate at Level {level.level + 1}: {level.postsForNext} more post{level.postsForNext !== 1 ? 's' : ''} needed.
            </>
          ) : (
            <>
              Level {level.level} &mdash; <span style={{ color: 'var(--accent)' }}>Unlocked!</span>
              <br />
              No posting required for next level.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
