#!/bin/bash
# Install bracker git hook in a repository

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-git-repo>"
    echo "Example: $0 /Users/me/my-project"
    exit 1
fi

REPO_PATH="$1"
HOOK_SOURCE="$(dirname "$0")/post-push.sh"
HOOK_DEST="$REPO_PATH/.git/hooks/post-push"

# Verify it's a git repo
if [ ! -d "$REPO_PATH/.git" ]; then
    echo "❌ Error: $REPO_PATH is not a git repository"
    exit 1
fi

# Verify source hook exists
if [ ! -f "$HOOK_SOURCE" ]; then
    echo "❌ Error: Hook source not found at $HOOK_SOURCE"
    exit 1
fi

# Copy and make executable
cp "$HOOK_SOURCE" "$HOOK_DEST"
chmod +x "$HOOK_DEST"

echo "✅ Bracker post-push hook installed in $REPO_PATH"
echo "🎮 Your builds will now automatically be tracked!"

# Verify bracker is available
if ! command -v node >/dev/null 2>&1; then
    echo "⚠️  Warning: Node.js not found in PATH. Make sure it's installed."
elif ! node /Users/tjonkr/Projects/bracker/index.js <<< '{"jsonrpc":"2.0","method":"tools/list","id":1}' >/dev/null 2>&1; then
    echo "⚠️  Warning: bracker MCP server not responding. Check your setup."
else
    echo "✅ Bracker MCP server is working correctly"
fi