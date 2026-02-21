#!/bin/bash
# Claude Code stop hook — logs build to Bracker
# This runs when a Claude Code session ends.
# It silently posts build info to the Bracker API.
# If anything fails, it exits cleanly without blocking.

CONFIG_FILE="$HOME/.bracker/config.json"
if [ ! -f "$CONFIG_FILE" ]; then exit 0; fi

API_URL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8')).apiUrl)" 2>/dev/null)
API_KEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8')).apiKey)" 2>/dev/null)

if [ -z "$API_URL" ] || [ -z "$API_KEY" ]; then exit 0; fi

# Gather build info — gracefully handle missing git
REPO=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")
DIFF_SUMMARY=$(git diff --stat HEAD~1 HEAD 2>/dev/null | head -20 || echo "no diff available")
COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "Claude Code session")

# Escape JSON strings — handle newlines and special chars
escape_json() {
  printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || printf '"%s"' "$1"
}

DIFF_JSON=$(escape_json "$DIFF_SUMMARY")
MSG_JSON=$(escape_json "$COMMIT_MSG")

# POST to API — run in background so we never block exit
curl -s -X POST "${API_URL}/api/builds" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"repo\":\"${REPO}\",\"diff_summary\":${DIFF_JSON},\"commit_message\":${MSG_JSON},\"tokens_used\":0}" \
  --connect-timeout 5 \
  --max-time 10 \
  > /dev/null 2>&1 &

exit 0
