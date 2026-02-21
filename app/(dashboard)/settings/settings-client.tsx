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
          Paste this in your terminal — sets up auto-logging for every Claude Code session:
        </p>
        <button
          className="btn-full btn-primary"
          type="button"
          onClick={() => {
            const cmd = `mkdir -p ~/.bracker && mkdir -p ~/.claude

cat > ~/.bracker/config.json << 'EOF'
{"apiUrl":"https://bracker.vercel.app","apiKey":"${apiKey}","username":"${profile.username}"}
EOF

cat > ~/.bracker/stop.sh << 'HOOK'
#!/bin/bash
CONFIG_FILE="$HOME/.bracker/config.json"
if [ ! -f "$CONFIG_FILE" ]; then exit 0; fi
API_URL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8')).apiUrl)" 2>/dev/null)
API_KEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8')).apiKey)" 2>/dev/null)
if [ -z "$API_URL" ] || [ -z "$API_KEY" ]; then exit 0; fi
REPO=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")
DIFF_SUMMARY=$(git diff --stat HEAD~1 HEAD 2>/dev/null | head -20 || echo "no diff available")
COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "Claude Code session")
escape_json() { printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || printf '"%s"' "$1"; }
DIFF_JSON=$(escape_json "$DIFF_SUMMARY")
MSG_JSON=$(escape_json "$COMMIT_MSG")
curl -s -X POST "\${API_URL}/api/builds" -H "Authorization: Bearer \${API_KEY}" -H "Content-Type: application/json" -d "{\\"repo\\":\\"\${REPO}\\",\\"diff_summary\\":\${DIFF_JSON},\\"commit_message\\":\${MSG_JSON},\\"tokens_used\\":0}" --connect-timeout 5 --max-time 10 > /dev/null 2>&1 &
exit 0
HOOK
chmod +x ~/.bracker/stop.sh

node -e 'var fs=require("fs"),p=require("path"),h=require("os").homedir();fs.mkdirSync(p.join(h,".claude"),{recursive:true});var f=p.join(h,".claude","settings.json"),s={};try{s=JSON.parse(fs.readFileSync(f,"utf8"))}catch(e){}if(!s.hooks)s.hooks={};if(!s.hooks.Stop)s.hooks.Stop=[];var cmd="bash "+h+"/.bracker/stop.sh";if(!s.hooks.Stop.some(function(x){return(x.hooks||[]).some(function(y){return(y.command||"").includes("bracker")})})){s.hooks.Stop.push({hooks:[{type:"command",command:cmd}]});fs.writeFileSync(f,JSON.stringify(s,null,2)+"\\n")}'

echo ""
echo "Bracker configured for ${profile.username}"
echo ""
echo "  ~/.bracker/config.json  — API key + username"
echo "  ~/.bracker/stop.sh      — auto-logs builds on session end"
echo "  ~/.claude/settings.json — Stop hook registered"
echo ""
echo "  Restart Claude Code — every session will auto-log builds."
echo ""`;
            navigator.clipboard.writeText(cmd);
            setSetupCopied(true);
            setTimeout(() => setSetupCopied(false), 3000);
          }}
          style={{ marginBottom: '12px' }}
        >
          {setupCopied ? 'Copied to clipboard!' : 'Copy setup command'}
        </button>
        <div className="code-card" style={{ fontSize: '12px' }}>
          <span className="comment"># Creates config, stop hook, and updates Claude Code settings</span>
          {'\n'}
          <span className="comment"># Every Claude Code session will auto-log builds after this</span>
          {'\n\n'}
          <span className="key">~/.bracker/config.json</span>{'    '}
          <span className="comment">API key + username</span>
          {'\n'}
          <span className="key">~/.bracker/stop.sh</span>{'        '}
          <span className="comment">build logging on session end</span>
          {'\n'}
          <span className="key">~/.claude/settings.json</span>{'   '}
          <span className="comment">Stop hook registered</span>
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
