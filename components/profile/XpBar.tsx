import { xpProgress, calculateLevel } from '@/lib/xp';

interface XpBarProps {
  totalXp: number;
  postCount: number;
}

export default function XpBar({ totalXp, postCount }: XpBarProps) {
  const progress = xpProgress(totalXp);
  const level = calculateLevel(totalXp, postCount);

  return (
    <div className="xp-section">
      <div className="xp-label">
        <span>Level {level.level} &mdash; {level.name}</span>
        <strong>{progress.current.toLocaleString()} / {progress.required.toLocaleString()} XP</strong>
      </div>
      <div className="xp-bar">
        <div
          className="xp-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
