# Bracker

An MCP (Model Context Protocol) server that gamifies your development process by tracking builds, posts, calculating XP, and generating "build in public" content with social media themed levels.

## 🎮 Features

- **XP System**: Earn XP from tokens burned, lines changed, and social media posts
- **Social Media Levels**: Rise from Lurker to Legend with realistic progression
- **Post Gates**: Level advancement requires posting your progress publicly
- **Streak Bonuses**: Get XP multipliers for consecutive days of building
- **Tweet Generation**: Auto-draft "build in public" content with level context
- **Simple Storage**: JSONL builds log + JSON stats

## 📈 XP Calculation

- **1 XP per 100 tokens** burned in AI sessions
- **1 XP per 10 lines** changed in commits  
- **50 XP per social media post** (encourages building in public)
- **Streak multiplier**: Up to 2x for consecutive building days
- **Steeper curve**: Level² × 75 XP required (Legend takes ~6 months of daily building)

## 🏆 Social Media Themed Levels

- **1-5**: 🫥 **Lurker** - "Nobody. Zero followers energy."
- **6-10**: 🌱 **Seedling** - "First commits, first posts. Sprouting."
- **11-15**: 🔨 **Maker** - "Actually building stuff. People notice."
- **16-20**: 📢 **Broadcaster** - "Posting regularly. Small following."
- **21-25**: 🔥 **Hot Take** - "Content hits different. Growing fast."
- **26-30**: ⚡ **Shipper** - "Ships weekly. Known in the scene."
- **31-35**: 🏗️ **Architect** - "People study your repos."
- **36-40**: 🎯 **Influencer** - "Have you seen what X built?"
- **41-45**: 👑 **Thought Leader** - "Industry talks. Podcast invites."
- **46-50**: 🦄 **Unicorn** - "Everyone knows your name."
- **51+**: 🌍 **Legend** - "Changed the game."

## 🚪 Post Gates - Build AND Share

You can't advance past certain tiers without posting publicly:

- **Level 1-10**: No posting required (just build)
- **Level 11-20**: Need **1 post per level** to unlock (10 total posts)
- **Level 21-30**: Need **2 posts per level** to unlock (20 more posts)
- **Level 31+**: Need **3 posts per level** to unlock

*Why?* Because the best builders share their journey. Level gates encourage authentic building in public.

## 🚀 Installation

### 1. Install the MCP server

```bash
npm install -g bracker
```

Or clone and install locally:

```bash
git clone <this-repo>
cd bracker
npm install
npm link  # Makes 'bracker' available globally
```

### 2. Add to Claude Code config

Add this to your `~/.claude/settings.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "bracker": {
      "command": "bracker",
      "args": []
    }
  }
}
```

### 3. Install git hook (optional)

For automatic build logging on pushes:

```bash
# In your project directory
cp /path/to/bracker/hooks/post-push.sh .git/hooks/post-push
chmod +x .git/hooks/post-push
```

Or use the installer script:

```bash
# From the bracker directory
./hooks/install-hook.sh /path/to/your/project
```

## 🔧 MCP Tools

### `log_build`
Log a build event and calculate XP.

**Parameters:**
- `repo` (string, required): Repository name
- `diff_summary` (string, required): Git diff summary
- `commit_message` (string, required): Git commit message  
- `conversation_summary` (string, optional): What was built/learned
- `tokens_used` (number, optional): AI tokens consumed

**Returns:**
- XP earned, total XP, current level and title
- Post gate warnings if level is blocked
- Tweet draft with level context

### `log_post`
Log a social media post and earn XP.

**Parameters:**
- `url` (string, required): URL of the tweet/post
- `platform` (string, optional): Platform name (default: "twitter")
- `content` (string, optional): What was posted

**Returns:**
- XP earned (50 XP per post)
- Total post count
- Current level and any levels unlocked
- Posts needed for next level

### `get_stats`
Get current build statistics and level progress.

**Returns:**
- Total XP, level, and title with description
- Total builds, posts, and tokens
- Current streak and last build date
- Post gate status (gated/ungated)
- Posts needed to unlock next level

### `suggest_tweet`
Generate a tweet draft from recent builds with level context.

**Parameters:**
- `style` (enum, optional): `raw` | `polished` | `educational` (default: `raw`)

**Returns:**
- Tweet draft including current level
- Builds and posts today
- Gate status and posting encouragement

## 📊 Storage

Data is stored in `~/.bracker/`:
- `builds.jsonl`: Build events (one JSON object per line)
- `stats.json`: Aggregate statistics

## 🔍 Testing

Test the MCP server:

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bracker
```

Should return the available tools.

## 🤖 Usage with Claude Code

Once configured, Claude Code can call bracker tools:

**Log a build:**
```
Log this build: 
- Repo: my-app
- Changes: Added auth system, 150 lines
- Tokens used: 2500
- Commit: "feat: implement JWT authentication"
```

**Log a social media post:**
```
I just tweeted about my progress: https://twitter.com/user/status/123456789
```

**Get current stats:**
```
What's my current level and progress?
```

**Generate a tweet:**
```
Suggest a tweet about today's work (polished style)
```

Claude will track your builds, posts, calculate XP, warn about post gates, and help you build in public!

## 💡 Pro Tips

1. **Session Files**: Create `.claude_session` in your project root with conversation summary and token count for automatic hook detection
2. **Multiple Repos**: Each repo contributes to the same XP pool
3. **Streak Building**: Code every day for maximum XP multipliers
4. **Tweet Styles**: Use different styles for different audiences

## 🛠️ Development

```bash
# Clone the repo
git clone <this-repo>
cd bracker

# Install dependencies
npm install

# Test locally
npm test

# Make changes and test
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node index.js
```

## 📝 License

MIT - Build in public, share the gains! 🚀