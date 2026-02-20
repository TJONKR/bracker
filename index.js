#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Storage paths
const STORAGE_DIR = path.join(os.homedir(), '.bracker');
const BUILDS_FILE = path.join(STORAGE_DIR, 'builds.jsonl');
const STATS_FILE = path.join(STORAGE_DIR, 'stats.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Level system - Social Media Themed
const LEVEL_TITLES = {
  1: { emoji: '🫥', name: 'Lurker', desc: 'Nobody. Zero followers energy.' },
  6: { emoji: '🌱', name: 'Seedling', desc: 'First commits, first posts. Sprouting.' },
  11: { emoji: '🔨', name: 'Maker', desc: 'Actually building stuff. People notice.' },
  16: { emoji: '📢', name: 'Broadcaster', desc: 'Posting regularly. Small following.' },
  21: { emoji: '🔥', name: 'Hot Take', desc: 'Content hits different. Growing fast.' },
  26: { emoji: '⚡', name: 'Shipper', desc: 'Ships weekly. Known in the scene.' },
  31: { emoji: '🏗️', name: 'Architect', desc: 'People study your repos.' },
  36: { emoji: '🎯', name: 'Influencer', desc: 'Have you seen what X built?' },
  41: { emoji: '👑', name: 'Thought Leader', desc: 'Industry talks. Podcast invites.' },
  46: { emoji: '🦄', name: 'Unicorn', desc: 'Everyone knows your name.' },
  51: { emoji: '🌍', name: 'Legend', desc: 'Changed the game.' }
};

function getLevelInfo(level) {
  let currentTier = LEVEL_TITLES[1]; // Default to Lurker
  
  for (const [minLevel, tierInfo] of Object.entries(LEVEL_TITLES)) {
    if (level >= parseInt(minLevel)) {
      currentTier = tierInfo;
    }
  }
  
  return currentTier;
}

function getPostsRequiredForLevel(level) {
  if (level <= 10) return 0; // No posting required for levels 1-10
  if (level <= 20) return level - 10; // 1 post per level above 10
  if (level <= 30) return 10 + (level - 20) * 2; // 10 + 2 posts per level above 20  
  return 30 + (level - 30) * 3; // 30 + 3 posts per level above 30
}

function calculateLevel(xp, postCount = 0) {
  let level = 1;
  let totalRequired = 0;
  
  // Use new steeper curve: level² * 75
  while (true) {
    const requiredXp = level * level * 75;
    if (totalRequired + requiredXp > xp) break;
    totalRequired += requiredXp;
    level++;
  }
  
  // Check for post gating
  const postsNeeded = getPostsRequiredForLevel(level);
  const actualLevel = postCount >= postsNeeded ? level : Math.min(level, getMaxLevelForPosts(postCount));
  const isGated = level > actualLevel;
  
  const levelInfo = getLevelInfo(actualLevel);
  
  return { 
    level: actualLevel, 
    potentialLevel: level,
    title: `${levelInfo.emoji} ${levelInfo.name}`,
    description: levelInfo.desc,
    isGated,
    postsNeeded: postsNeeded - postCount,
    postsForNext: getPostsRequiredForLevel(actualLevel + 1) - postCount
  };
}

function getMaxLevelForPosts(postCount) {
  if (postCount < 1) return 10; // Can reach level 10 without posting
  if (postCount < 10) return 10 + postCount; // 1 post per level 11-20
  if (postCount < 30) return 20 + Math.floor((postCount - 10) / 2); // 2 posts per level 21-30
  return 30 + Math.floor((postCount - 30) / 3); // 3 posts per level 31+
}

function loadBuilds() {
  if (!fs.existsSync(BUILDS_FILE)) return [];
  
  const content = fs.readFileSync(BUILDS_FILE, 'utf8');
  return content.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
}

function loadPosts() {
  const builds = loadBuilds();
  return builds.filter(entry => entry.type === 'post');
}

function getPostCount() {
  return loadPosts().length;
}

function loadStats() {
  if (!fs.existsSync(STATS_FILE)) {
    return { totalXp: 0, totalBuilds: 0, totalPosts: 0, totalTokens: 0, lastBuildDate: null };
  }
  
  const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
  // Ensure totalPosts exists (for backwards compatibility)
  if (typeof stats.totalPosts === 'undefined') {
    stats.totalPosts = getPostCount();
    saveStats(stats);
  }
  
  return stats;
}

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function appendBuild(build) {
  fs.appendFileSync(BUILDS_FILE, JSON.stringify(build) + '\n');
}

function calculateStreak() {
  const builds = loadBuilds();
  if (builds.length === 0) return 0;
  
  // Group builds by date
  const buildDates = new Set();
  builds.forEach(build => {
    const date = new Date(build.timestamp).toDateString();
    buildDates.add(date);
  });
  
  const sortedDates = Array.from(buildDates).sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const dateStr of sortedDates) {
    const buildDate = new Date(dateStr);
    const daysDiff = Math.floor((currentDate - buildDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff === streak + 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function extractLinesChanged(diffSummary) {
  // Simple regex to extract +/- lines from diff summary
  const match = diffSummary.match(/(\d+)\s*insertions?.*(\d+)\s*deletions?|(\d+)\s*changes?/i);
  if (match) {
    if (match[3]) return parseInt(match[3]); // "N changes"
    return (parseInt(match[1]) || 0) + (parseInt(match[2]) || 0); // insertions + deletions
  }
  
  // Fallback: count lines mentioned
  const lines = diffSummary.split('\n').length - 1;
  return Math.max(1, lines);
}

function generateTweetDraft(builds, style = 'raw', levelInfo = null, isGated = false) {
  if (builds.length === 0 && !levelInfo) return "Just shipped something! 🚀 #buildinpublic";
  
  const totalXp = builds.reduce((sum, b) => sum + b.xpEarned, 0);
  const repos = [...new Set(builds.filter(b => b.repo).map(b => b.repo))];
  
  const levelText = levelInfo ? `${levelInfo.title} (Level ${levelInfo.level})` : '';
  const gateText = isGated ? `Need more posts to unlock next level! 📝` : '';
  
  const templates = {
    raw: [
      `Pushed ${builds.length} commits today. ${levelText} • XP +${totalXp} 💪 ${gateText} #buildinpublic`,
      `${builds.length} builds shipped ✅ ${levelText} Working on: ${repos.join(', ')} #buildinpublic`,
      `Another day, another ${builds.length} commits 🔥 ${levelText} • +${totalXp} XP ${gateText} #buildinpublic`
    ],
    polished: [
      `Productive coding session! Shipped ${builds.length} features across ${repos.length} projects. ${levelText} The grind continues! ${gateText} #buildinpublic`,
      `Daily dev log: ${builds.length} commits pushed, ${totalXp} XP earned. ${levelText} Building something cool! ⚡️ #buildinpublic`
    ],
    educational: [
      `Today I learned: ${builds[0]?.conversationSummary || 'Code is poetry in motion'} 📚 ${levelText} • ${builds.length} commits • ${totalXp} XP #buildinpublic`,
      `Dev insight: ${levelText} Working on ${repos.join(' + ')} taught me patience and persistence 🧠 ${gateText} #buildinpublic`
    ]
  };
  
  const options = templates[style] || templates.raw;
  return options[Math.floor(Math.random() * options.length)];
}

// Create MCP server
const server = new Server({
  name: 'bracker',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'log_build',
        description: 'Log a build event with XP calculation',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string', description: 'Repository name' },
            diff_summary: { type: 'string', description: 'Git diff summary' },
            conversation_summary: { type: 'string', description: 'Summary of what was built/learned' },
            tokens_used: { type: 'number', description: 'Tokens consumed in the session' },
            commit_message: { type: 'string', description: 'Git commit message' }
          },
          required: ['repo', 'diff_summary', 'commit_message']
        }
      },
      {
        name: 'log_post',
        description: 'Log a social media post with XP reward',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL of the tweet/post' },
            platform: { type: 'string', description: 'Platform (twitter, linkedin, etc.)', default: 'twitter' },
            content: { type: 'string', description: 'Optional: what was posted' }
          },
          required: ['url']
        }
      },
      {
        name: 'get_stats',
        description: 'Get current build statistics and level progress',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'suggest_tweet',
        description: 'Generate a tweet draft from recent builds, including level info',
        inputSchema: {
          type: 'object',
          properties: {
            style: { 
              type: 'string', 
              enum: ['raw', 'polished', 'educational'],
              description: 'Tweet style',
              default: 'raw'
            }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'log_build') {
    const { repo, diff_summary, conversation_summary, tokens_used = 0, commit_message } = args;
    
    // Calculate XP
    const linesChanged = extractLinesChanged(diff_summary);
    const tokenXp = Math.floor(tokens_used / 100);
    const lineXp = Math.floor(linesChanged / 10);
    const baseXp = tokenXp + lineXp;
    
    // Streak bonus
    const currentStreak = calculateStreak();
    const streakMultiplier = Math.min(1 + (currentStreak * 0.1), 2.0); // Max 2x multiplier
    const totalXp = Math.floor(baseXp * streakMultiplier);
    
    // Build entry
    const build = {
      type: 'build',
      timestamp: new Date().toISOString(),
      repo,
      diffSummary: diff_summary,
      conversationSummary: conversation_summary,
      tokensUsed: tokens_used,
      commitMessage: commit_message,
      linesChanged,
      xpEarned: totalXp,
      streak: currentStreak
    };
    
    // Save build
    appendBuild(build);
    
    // Update stats
    const stats = loadStats();
    stats.totalXp += totalXp;
    stats.totalBuilds += 1;
    stats.totalTokens += tokens_used;
    stats.lastBuildDate = build.timestamp;
    saveStats(stats);
    
    const postCount = getPostCount();
    const levelInfo = calculateLevel(stats.totalXp, postCount);
    const tweetDraft = generateTweetDraft([build], 'raw', levelInfo, levelInfo.isGated);
    
    let message = `XP earned: ${totalXp} | Level: ${levelInfo.level} ${levelInfo.title}`;
    
    // Check for post gating
    if (levelInfo.isGated) {
      const postsNeeded = levelInfo.postsNeeded;
      message += `\n⚠️ You have enough XP for level ${levelInfo.potentialLevel} but need ${postsNeeded} more posts to unlock it!`;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            xpEarned: totalXp,
            totalXp: stats.totalXp,
            level: levelInfo.level,
            title: levelInfo.title,
            description: levelInfo.description,
            streak: currentStreak,
            isGated: levelInfo.isGated,
            potentialLevel: levelInfo.potentialLevel,
            postsNeeded: levelInfo.postsNeeded,
            tweetDraft,
            message
          }, null, 2)
        }
      ]
    };
  }
  
  if (name === 'log_post') {
    const { url, platform = 'twitter', content } = args;
    
    // Post awards flat XP
    const postXp = 50;
    
    // Create post entry
    const post = {
      type: 'post',
      timestamp: new Date().toISOString(),
      url,
      platform,
      content: content || '',
      xpEarned: postXp
    };
    
    // Save post
    appendBuild(post);
    
    // Update stats  
    const stats = loadStats();
    stats.totalXp += postXp;
    stats.totalPosts += 1;
    saveStats(stats);
    
    const postCount = getPostCount();
    const levelInfo = calculateLevel(stats.totalXp, postCount);
    
    let levelsUnlocked = [];
    if (levelInfo.level > calculateLevel(stats.totalXp - postXp, postCount - 1).level) {
      levelsUnlocked.push(levelInfo.level);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            xpEarned: postXp,
            totalXp: stats.totalXp,
            postCount,
            level: levelInfo.level,
            title: levelInfo.title,
            description: levelInfo.description,
            levelsUnlocked,
            postsForNext: levelInfo.postsForNext
          }, null, 2)
        }
      ]
    };
  }
  
  if (name === 'get_stats') {
    const stats = loadStats();
    const postCount = getPostCount();
    const levelInfo = calculateLevel(stats.totalXp, postCount);
    const streak = calculateStreak();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalXp: stats.totalXp,
            level: levelInfo.level,
            title: levelInfo.title,
            description: levelInfo.description,
            totalBuilds: stats.totalBuilds,
            totalPosts: stats.totalPosts || postCount,
            totalTokens: stats.totalTokens,
            streak,
            lastBuildDate: stats.lastBuildDate,
            isGated: levelInfo.isGated,
            potentialLevel: levelInfo.potentialLevel,
            postsNeeded: levelInfo.postsNeeded,
            postsForNext: levelInfo.postsForNext
          }, null, 2)
        }
      ]
    };
  }
  
  if (name === 'suggest_tweet') {
    const { style = 'raw' } = args;
    
    // Get today's builds and posts
    const builds = loadBuilds();
    const today = new Date().toDateString();
    const todaysBuilds = builds.filter(build => 
      new Date(build.timestamp).toDateString() === today && build.type === 'build'
    );
    const todaysPosts = builds.filter(build => 
      new Date(build.timestamp).toDateString() === today && build.type === 'post'
    );
    
    // Get current level info
    const stats = loadStats();
    const postCount = getPostCount();
    const levelInfo = calculateLevel(stats.totalXp, postCount);
    
    const tweetDraft = generateTweetDraft(todaysBuilds, style, levelInfo, levelInfo.isGated);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tweetDraft,
            buildsToday: todaysBuilds.length,
            postsToday: todaysPosts.length,
            currentLevel: levelInfo.level,
            title: levelInfo.title,
            isGated: levelInfo.isGated,
            postsNeeded: levelInfo.postsNeeded
          }, null, 2)
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});