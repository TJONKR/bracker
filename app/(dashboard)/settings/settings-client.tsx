'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SettingsProps {
  profile: {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    apiKey: string;
  };
}

export function SettingsClient({ profile }: SettingsProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [apiKey, setApiKey] = useState(profile.apiKey);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [setupCopied, setSetupCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Profile updated.');
    }
    setSaving(false);
  }

  async function handleCopyKey() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateKey() {
    setRegenerating(true);
    setError(null);

    const newKey = crypto.randomUUID();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ api_key: newKey })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setApiKey(newKey);
      setMessage('API key regenerated. Update your MCP config.');
    }
    setRegenerating(false);
  }

  return (
    <>
      <div className="dashboard-header">
        <h1>Settings</h1>
        <p>Manage your profile and API access.</p>
      </div>

      {error && <div className="error-message" style={{ margin: '16px' }}>{error}</div>}
      {message && <div className="success-message" style={{ margin: '16px' }}>{message}</div>}

      {/* API Key */}
      <div className="settings-section">
        <h3>API Key</h3>
        <div className="api-key-box">
          <div className="api-key-value">{apiKey}</div>
          <button className="btn-cta" onClick={handleCopyKey} type="button">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button
            className="btn-cta"
            onClick={handleRegenerateKey}
            disabled={regenerating}
            type="button"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate key'}
          </button>
        </div>
      </div>

      {/* One-click setup */}
      <div className="settings-section">
        <h3>Quick Setup</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
          Paste this in your terminal to configure Bracker + Claude Code in one command:
        </p>
        <button
          className="btn-full btn-primary"
          type="button"
          onClick={() => {
            const cmd = `mkdir -p ~/.bracker && cat > ~/.bracker/config.json << 'EOF'\n{"apiUrl":"https://bracker.vercel.app","apiKey":"${apiKey}","username":"${profile.username}"}\nEOF\nnpx -y bracker@latest --version && echo "Bracker configured for ${profile.username}"`;
            navigator.clipboard.writeText(cmd);
            setSetupCopied(true);
            setTimeout(() => setSetupCopied(false), 3000);
          }}
          style={{ marginBottom: '12px' }}
        >
          {setupCopied ? 'Copied to clipboard!' : 'Copy setup command'}
        </button>
        <div className="code-card" style={{ fontSize: '12px' }}>
          <span className="comment"># Creates ~/.bracker/config.json with your API key</span>
          {'\n'}
          <span className="comment"># Then verifies bracker is installed</span>
          {'\n\n'}
          mkdir -p ~/.bracker
          {'\n'}
          {'echo \'{"apiUrl":"https://bracker.vercel.app","apiKey":"'}
          <span className="string">{apiKey.slice(0, 8)}...</span>
          {'"}\''}
          {' > ~/.bracker/config.json'}
        </div>
      </div>

      {/* MCP Config */}
      <div className="settings-section">
        <h3>MCP Server Config</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
          Add this to <code style={{ color: 'var(--accent)' }}>~/.claude/settings.json</code> under mcpServers:
        </p>
        <div className="code-card">
          <span className="key">{'"bracker"'}</span>: {'{'}
          {'\n'}  <span className="key">{'"command"'}</span>: <span className="string">{'"npx"'}</span>,
          {'\n'}  <span className="key">{'"args"'}</span>: [<span className="string">{'"bracker"'}</span>]
          {'\n'}{'}'}
        </div>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <h3>Profile</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <input
              id="bio"
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Building in public..."
            />
          </div>
          <button className="btn-full btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </>
  );
}
