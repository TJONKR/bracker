#!/bin/bash
# Git post-push hook for bracker
# Install this in your repo's .git/hooks/ directory

# Get repository name
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")

# Get the last commit info
COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s")
COMMIT_HASH=$(git log -1 --pretty=format:"%H")

# Get diff summary from last commit
DIFF_SUMMARY=$(git show --stat --pretty="" "$COMMIT_HASH")

# Try to detect if this was an AI-assisted session
# Look for common patterns in commit messages or recent terminal history
CONVERSATION_SUMMARY=""
TOKENS_USED=0

# Check if there's a recent .claude_session or similar file indicating AI assistance
if [[ -f ".claude_session" || -f ".ai_session" ]]; then
    CONVERSATION_SUMMARY=$(head -1 .claude_session 2>/dev/null || echo "AI-assisted coding session")
    TOKENS_USED=$(tail -1 .claude_session 2>/dev/null | grep -o '[0-9]\+' | head -1 || echo "0")
fi

# Fallback: Basic analysis of commit message
if [[ -z "$CONVERSATION_SUMMARY" ]]; then
    if [[ "$COMMIT_MESSAGE" =~ (fix|bug|issue) ]]; then
        CONVERSATION_SUMMARY="Fixed bugs and issues"
    elif [[ "$COMMIT_MESSAGE" =~ (add|feat|feature) ]]; then
        CONVERSATION_SUMMARY="Added new features"
    elif [[ "$COMMIT_MESSAGE" =~ (refactor|clean|improve) ]]; then
        CONVERSATION_SUMMARY="Code refactoring and improvements"  
    elif [[ "$COMMIT_MESSAGE" =~ (update|change|modify) ]]; then
        CONVERSATION_SUMMARY="Updates and modifications"
    else
        CONVERSATION_SUMMARY="Development progress"
    fi
fi

# Prepare JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 1,
    "params": {
        "name": "log_build",
        "arguments": {
            "repo": "$REPO_NAME",
            "diff_summary": "$DIFF_SUMMARY",
            "conversation_summary": "$CONVERSATION_SUMMARY",
            "tokens_used": $TOKENS_USED,
            "commit_message": "$COMMIT_MESSAGE"
        }
    }
}
EOF
)

# Call bracker MCP server
echo "$JSON_PAYLOAD" | node ~/.local/bin/bracker >/dev/null 2>&1

# Clean up session files
rm -f .claude_session .ai_session

echo "🎮 Build logged to bracker!"