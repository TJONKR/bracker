'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import LevelList from '@/components/profile/LevelList';

const TABS = ['Posts', 'Levels', 'Stats', 'Setup'];

export default function LandingTabs() {
  const [activeTab, setActiveTab] = useState('Posts');

  return (
    <>
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="feed">
        {/* Posts Tab */}
        {activeTab === 'Posts' && (
          <div>
            {/* Pinned */}
            <div className="post">
              <div className="post-avatar">{'\u{1F528}'}</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Bracker</span>
                  <span className="post-handle">buildinpublic</span>
                  <span className="post-time">Pinned</span>
                </div>
                <div className="post-text">{'What if your coding sessions had XP bars?\n\nBracker turns every '}<code>git push</code>{' into progress. Every tweet you post about your work earns XP and unlocks new levels.\n\nYou can\'t reach Legend by just coding. You have to share.\n\nLevel 1 \u2192 Lurker\nLevel 51 \u2192 Legend\n\nThe grind is real. The receipts are public.'}</div>
                <div className="post-actions">
                  <span className="post-action">
                    <svg viewBox="0 0 24 24"><path d="M1.751 10c-.036 0-.07-.006-.104-.018a.75.75 0 0 1-.458-.464l-.009-.03A10.003 10.003 0 0 1 12 1c5.523 0 10 4.478 10 10a10.003 10.003 0 0 1-9.493 9.993.75.75 0 0 1-.544-.47L12 20.5l-.037-.023a.75.75 0 0 1-.205-.066C7.5 19.5 4 16 2 11.5l-.178-.386A.75.75 0 0 1 1.751 10zM12 3.5a8.5 8.5 0 0 0-8.127 6.008 10.146 10.146 0 0 0 5.436 7.075l.388.186.405.175A8.5 8.5 0 0 0 12 3.5z" /></svg>
                    24
                  </span>
                  <span className="post-action">
                    <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg>
                    12
                  </span>
                  <span className="post-action">
                    <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" /></svg>
                    89
                  </span>
                  <span className="post-action">
                    <svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18.25 21V8.5h2V21h-2zM13.5 21V13h2v8h-2zM3.25 21v-6h2v6h-2z" /></svg>
                    1.2K
                  </span>
                </div>
              </div>
            </div>

            {/* How XP works */}
            <div className="post">
              <div className="post-avatar">{'\u{1F528}'}</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Bracker</span>
                  <span className="post-handle">buildinpublic</span>
                  <span className="post-time">2h</span>
                </div>
                <div className="post-text">{'How XP works:\n\n\u2022 1 XP per 100 tokens burned (AI sessions)\n\u2022 1 XP per 10 lines changed (commits)\n\u2022 50 XP per social media post\n\u2022 Streak multiplier: up to 2x for consecutive days\n\u2022 Curve: Level\u00B2 \u00D7 75 XP required\n\nLegend takes ~6 months of daily building.'}</div>
                <div className="post-actions">
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M1.751 10c-.036 0-.07-.006-.104-.018a.75.75 0 0 1-.458-.464l-.009-.03A10.003 10.003 0 0 1 12 1c5.523 0 10 4.478 10 10a10.003 10.003 0 0 1-9.493 9.993.75.75 0 0 1-.544-.47L12 20.5l-.037-.023a.75.75 0 0 1-.205-.066C7.5 19.5 4 16 2 11.5l-.178-.386A.75.75 0 0 1 1.751 10zM12 3.5a8.5 8.5 0 0 0-8.127 6.008 10.146 10.146 0 0 0 5.436 7.075l.388.186.405.175A8.5 8.5 0 0 0 12 3.5z" /></svg> 8</span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg> 5</span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" /></svg> 41</span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18.25 21V8.5h2V21h-2zM13.5 21V13h2v8h-2zM3.25 21v-6h2v6h-2z" /></svg> 680</span>
                </div>
              </div>
            </div>

            {/* Post gates */}
            <div className="post">
              <div className="post-avatar">{'\u{1F528}'}</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Bracker</span>
                  <span className="post-handle">buildinpublic</span>
                  <span className="post-time">4h</span>
                </div>
                <div className="post-text">{'Post gates are the secret sauce.\n\nLevel 1-10: Just build. No posting required.\nLevel 11-20: 1 post per level to unlock.\nLevel 21-30: 2 posts per level.\nLevel 31+: 3 posts per level.\n\nYou literally can\'t level up without sharing your work.\n\nThe best builders share their journey. Bracker makes you.'}</div>
                <div className="post-actions">
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M1.751 10c-.036 0-.07-.006-.104-.018a.75.75 0 0 1-.458-.464l-.009-.03A10.003 10.003 0 0 1 12 1c5.523 0 10 4.478 10 10a10.003 10.003 0 0 1-9.493 9.993.75.75 0 0 1-.544-.47L12 20.5l-.037-.023a.75.75 0 0 1-.205-.066C7.5 19.5 4 16 2 11.5l-.178-.386A.75.75 0 0 1 1.751 10zM12 3.5a8.5 8.5 0 0 0-8.127 6.008 10.146 10.146 0 0 0 5.436 7.075l.388.186.405.175A8.5 8.5 0 0 0 12 3.5z" /></svg> 15</span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg> 9</span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" /></svg> 63</span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18.25 21V8.5h2V21h-2zM13.5 21V13h2v8h-2zM3.25 21v-6h2v6h-2z" /></svg> 920</span>
                </div>
              </div>
            </div>

            {/* Example build log */}
            <div className="post">
              <div className="post-avatar" style={{ background: 'var(--accent-dim)' }}>{'\u26A1'}</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Example Build</span>
                  <span className="post-handle">yourproject</span>
                  <span className="post-time">just now</span>
                </div>
                <div className="post-text">{'Pushed 3 commits to '}<code>my-saas-app</code>{'\n\nfeat: implement JWT authentication\nfix: resolve token refresh race condition\nchore: update dependencies'}</div>
                <div className="code-card">
                  <span className="comment">{'// Build logged automatically'}</span>{'\n'}
                  +350 XP earned (streak: 7 days, 1.7x){'\n'}
                  Level 14 {'\u2192'} <span className="string">Maker</span>{'\n'}
                  {'\n'}
                  <span className="comment">{'// Tweet draft ready:'}</span>{'\n'}
                  <span className="string">{'"Shipped JWT auth today. 3 commits,\n350 XP. Level 14 Maker. #buildinpublic"'}</span>
                </div>
                <div className="post-actions">
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M1.751 10c-.036 0-.07-.006-.104-.018a.75.75 0 0 1-.458-.464l-.009-.03A10.003 10.003 0 0 1 12 1c5.523 0 10 4.478 10 10a10.003 10.003 0 0 1-9.493 9.993.75.75 0 0 1-.544-.47L12 20.5l-.037-.023a.75.75 0 0 1-.205-.066C7.5 19.5 4 16 2 11.5l-.178-.386A.75.75 0 0 1 1.751 10zM12 3.5a8.5 8.5 0 0 0-8.127 6.008 10.146 10.146 0 0 0 5.436 7.075l.388.186.405.175A8.5 8.5 0 0 0 12 3.5z" /></svg></span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg></span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" /></svg></span>
                  <span className="post-action"><svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18.25 21V8.5h2V21h-2zM13.5 21V13h2v8h-2zM3.25 21v-6h2v6h-2z" /></svg></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Levels Tab */}
        {activeTab === 'Levels' && (
          <LevelList />
        )}

        {/* Stats Tab (demo) */}
        {activeTab === 'Stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">12,450</div>
              <div className="stat-label">Total XP</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">14</div>
              <div className="stat-label">Current Level</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">47</div>
              <div className="stat-label">Builds Shipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">18</div>
              <div className="stat-label">Posts Shared</div>
            </div>
            <div className="stat-card wide">
              <div className="stat-value">7 days</div>
              <div className="stat-label">Current Streak (1.7x multiplier)</div>
              <div className="streak-dots">
                <div className="streak-dot active">M</div>
                <div className="streak-dot active">T</div>
                <div className="streak-dot active">W</div>
                <div className="streak-dot active">T</div>
                <div className="streak-dot active">F</div>
                <div className="streak-dot active">S</div>
                <div className="streak-dot active today">S</div>
                <div className="streak-dot">M</div>
                <div className="streak-dot">T</div>
                <div className="streak-dot">W</div>
                <div className="streak-dot">T</div>
                <div className="streak-dot">F</div>
                <div className="streak-dot">S</div>
                <div className="streak-dot">S</div>
              </div>
            </div>
            <div className="stat-card wide">
              <div className="stat-value" style={{ color: 'var(--text)' }}>Post Gate Status</div>
              <div className="stat-label" style={{ marginTop: 8, fontSize: 14 }}>
                Level 14 requires <strong style={{ color: 'var(--accent)' }}>4 posts</strong> &mdash; you have 18. <span style={{ color: 'var(--accent)' }}>Unlocked!</span>
                <br />Next gate at Level 15: 5 posts needed (18/5).
              </div>
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'Setup' && (
          <div>
            <div className="post">
              <div className="post-avatar">1</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Sign Up</span>
                  <span className="post-handle">step 1 of 3</span>
                </div>
                <div className="post-text">Create your account at <a href="/signup">bracker.vercel.app</a> and grab your API key from <a href="/dashboard/settings">Settings</a>.</div>
              </div>
            </div>

            <div className="post">
              <div className="post-avatar">2</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Configure</span>
                  <span className="post-handle">step 2 of 3</span>
                </div>
                <div className="post-text">Add to your Claude Code MCP config at <code>~/.claude/settings.json</code>:</div>
                <div className="code-card">
                  {`{
  "mcpServers": {
    "bracker": {
      "command": "npx",
      "args": ["-y", "bracker"],
      "env": {
        "BRACKER_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
                </div>
              </div>
            </div>

            <div className="post">
              <div className="post-avatar">3</div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-name">Build &amp; Share</span>
                  <span className="post-handle">step 3 of 3</span>
                </div>
                <div className="post-text">{'Start coding with Claude Code. Every session gets tracked. Ask Claude:\n\n'}<code>What&apos;s my bracker level?</code>{'\n'}<code>Suggest a tweet about today&apos;s work</code>{'\n'}<code>Log my tweet: [url]</code>{'\n\nYour XP, levels, and streaks update automatically. Ship code, share progress, level up.'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
