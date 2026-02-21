import { ALL_LEVEL_TIERS } from '@/lib/xp';

export default function LevelList() {
  return (
    <div className="levels-strip">
      {ALL_LEVEL_TIERS.map((tier) => (
        <div className="level-row" key={tier.range}>
          <div className="level-icon">{tier.emoji}</div>
          <div className="level-details">
            <div className="level-title">
              {tier.name} <span className="level-range">{tier.range}</span>
            </div>
            <div className="level-desc">{tier.desc}</div>
            {tier.gate ? (
              <div className="level-gate">{'\u{1F512}'} {tier.gate} to unlock</div>
            ) : (
              <div className="level-gate" style={{ color: 'var(--text-secondary)' }}>{'\u{1F513}'} No posting required</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
