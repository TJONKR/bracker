#!/bin/bash
# Claude Code PostToolUse hook — logs build to Bracker on git push
# Receives JSON on stdin from Claude Code with tool_name, tool_input, etc.
# Only fires when the Bash tool runs a "git push" command.

INPUT=$(cat)

# Check if this was a git push command
HAS_PUSH=$(echo "$INPUT" | node -e "
  const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(/git\s+push/.test(d.tool_input?.command||'')?'yes':'no');
" 2>/dev/null)

if [ "$HAS_PUSH" != "yes" ]; then exit 0; fi

CONFIG_FILE="$HOME/.bracker/config.json"
if [ ! -f "$CONFIG_FILE" ]; then exit 0; fi

API_URL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8')).apiUrl)" 2>/dev/null)
API_KEY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8')).apiKey)" 2>/dev/null)

if [ -z "$API_URL" ] || [ -z "$API_KEY" ]; then exit 0; fi

REPO=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")
DIFF_SUMMARY=$(git diff --stat HEAD~1 HEAD 2>/dev/null | head -20 || echo "no diff available")
COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "Claude Code session")

escape_json() {
  printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || printf '"%s"' "$1"
}

DIFF_JSON=$(escape_json "$DIFF_SUMMARY")
MSG_JSON=$(escape_json "$COMMIT_MSG")

curl -s -X POST "${API_URL}/api/builds" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"repo\":\"${REPO}\",\"diff_summary\":${DIFF_JSON},\"commit_message\":${MSG_JSON},\"tokens_used\":0}" \
  --connect-timeout 5 \
  --max-time 10 \
  > /dev/null 2>&1 &

exit 0
