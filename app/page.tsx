import Banner from '@/components/profile/Banner';
import LandingTabs from './LandingTabs';

export default function Home() {
  return (
    <div className="shell">
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--text)">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>
        </div>
        <div className="topbar-info">
          <h2>Bracker</h2>
          <span>build in public, gamified</span>
        </div>
      </div>

      {/* Banner */}
      <Banner />

      {/* Avatar + Auth buttons */}
      <div className="avatar-row">
        <div className="avatar">
          <span className="avatar-emoji">{'\u{1F528}'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <a href="/login" className="btn-cta">Log In</a>
          <a href="/signup" className="btn-cta btn-cta-primary">Sign Up</a>
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <div className="profile-name">
          Bracker
          <span className="verified"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg></span>
        </div>
        <div className="profile-handle">@buildinpublic</div>

        <div className="profile-bio">
          Track builds. Earn XP. Level up. Share your journey.
          <br /><span className="tagline">&ldquo;Building in public is just bragging with receipts.&rdquo;</span>
          <br /><br />
          MCP server for <a href="https://claude.ai/code">Claude Code</a> that gamifies your dev process with social-media-themed levels, post gates, and streak bonuses.
        </div>

        <div className="profile-meta">
          <span>
            <svg viewBox="0 0 24 24"><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm-1 4h12v2H6v-2z" /></svg>
            Shipped Feb 2025
          </span>
          <span>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
            <a href="https://npmjs.com/package/bracker">npmjs.com/package/bracker</a>
          </span>
        </div>

        <div className="profile-stats">
          <div><strong>11</strong> <span>Levels</span></div>
          <div><strong>4</strong> <span>MCP Tools</span></div>
          <div><strong>50</strong> <span>XP / post</span></div>
        </div>
      </div>

      {/* XP bar demo */}
      <div className="xp-section">
        <div className="xp-label">
          <span>Level 14 &mdash; Maker</span>
          <strong>12,450 / 14,700 XP</strong>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: '84.7%' }} />
        </div>
      </div>

      {/* Tabs + Feed */}
      <LandingTabs />
    </div>
  );
}
