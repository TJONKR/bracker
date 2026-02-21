// XP, Level, and Streak logic — pure TypeScript, no dependencies
// Ported from index.js lines 20-202

export const LEVEL_TITLES: Record<number, { emoji: string; name: string; desc: string }> = {
  1: { emoji: '🫥', name: 'Lurker', desc: 'Nobody. Zero followers energy.' },
  6: { emoji: '🌱', name: 'Seedling', desc: 'First commits, first posts. Sprouting.' },
  11: { emoji: '🔨', name: 'Maker', desc: 'Actually building stuff. People notice.' },
  16: { emoji: '📢', name: 'Broadcaster', desc: 'Posting regularly. Small following.' },
  21: { emoji: '🔥', name: 'Hot Take', desc: 'Content hits different. Growing fast.' },
  26: { emoji: '⚡', name: 'Shipper', desc: 'Ships weekly. Known in the scene.' },
  31: { emoji: '🏗️', name: 'Architect', desc: 'People study your repos.' },
  36: { emoji: '🎯', name: 'Influencer', desc: '"Have you seen what X built?"' },
  41: { emoji: '👑', name: 'Thought Leader', desc: 'Industry talks. Podcast invites.' },
  46: { emoji: '🦄', name: 'Unicorn', desc: 'Everyone knows your name.' },
  51: { emoji: '🌍', name: 'Legend', desc: 'Changed the game.' },
};

export function getLevelInfo(level: number) {
  let currentTier = LEVEL_TITLES[1];
  for (const [minLevel, tierInfo] of Object.entries(LEVEL_TITLES)) {
    if (level >= parseInt(minLevel)) {
      currentTier = tierInfo;
    }
  }
  return currentTier;
}

export function getPostsRequiredForLevel(level: number): number {
  if (level <= 10) return 0;
  if (level <= 20) return level - 10;
  if (level <= 30) return 10 + (level - 20) * 2;
  return 30 + (level - 30) * 3;
}

export function getMaxLevelForPosts(postCount: number): number {
  if (postCount < 1) return 10;
  if (postCount < 10) return 10 + postCount;
  if (postCount < 30) return 20 + Math.floor((postCount - 10) / 2);
  return 30 + Math.floor((postCount - 30) / 3);
}

export interface LevelInfo {
  level: number;
  potentialLevel: number;
  title: string;
  description: string;
  isGated: boolean;
  postsNeeded: number;
  postsForNext: number;
  emoji: string;
  name: string;
}

export function calculateLevel(xp: number, postCount = 0): LevelInfo {
  let level = 1;
  let totalRequired = 0;

  while (true) {
    const requiredXp = level * level * 75;
    if (totalRequired + requiredXp > xp) break;
    totalRequired += requiredXp;
    level++;
  }

  const postsNeeded = getPostsRequiredForLevel(level);
  const actualLevel =
    postCount >= postsNeeded ? level : Math.min(level, getMaxLevelForPosts(postCount));
  const isGated = level > actualLevel;

  const levelInfo = getLevelInfo(actualLevel);

  return {
    level: actualLevel,
    potentialLevel: level,
    title: `${levelInfo.emoji} ${levelInfo.name}`,
    description: levelInfo.desc,
    isGated,
    postsNeeded: postsNeeded - postCount,
    postsForNext: getPostsRequiredForLevel(actualLevel + 1) - postCount,
    emoji: levelInfo.emoji,
    name: levelInfo.name,
  };
}

export function xpRequiredForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * i * 75;
  }
  return total;
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 75;
}

export function xpProgress(xp: number): { current: number; required: number; percentage: number } {
  let level = 1;
  let totalRequired = 0;

  while (true) {
    const requiredXp = level * level * 75;
    if (totalRequired + requiredXp > xp) {
      return {
        current: xp - totalRequired,
        required: requiredXp,
        percentage: ((xp - totalRequired) / requiredXp) * 100,
      };
    }
    totalRequired += requiredXp;
    level++;
  }
}

export function extractLinesChanged(diffSummary: string): number {
  const match = diffSummary.match(/(\d+)\s*insertions?.*(\d+)\s*deletions?|(\d+)\s*changes?/i);
  if (match) {
    if (match[3]) return parseInt(match[3]);
    return (parseInt(match[1]) || 0) + (parseInt(match[2]) || 0);
  }
  const lines = diffSummary.split('\n').length - 1;
  return Math.max(1, lines);
}

export function calculateBuildXp(
  tokensUsed: number,
  linesChanged: number,
  currentStreak: number
): { tokenXp: number; lineXp: number; baseXp: number; streakMultiplier: number; totalXp: number } {
  const tokenXp = Math.floor(tokensUsed / 100);
  const lineXp = Math.floor(linesChanged / 10);
  const baseXp = tokenXp + lineXp;
  const streakMultiplier = Math.min(1 + currentStreak * 0.1, 2.0);
  const totalXp = Math.floor(baseXp * streakMultiplier);
  return { tokenXp, lineXp, baseXp, streakMultiplier, totalXp };
}

export function calculateStreak(buildDates: string[]): number {
  if (buildDates.length === 0) return 0;

  const uniqueDates = [...new Set(buildDates.map((d) => new Date(d).toDateString()))];
  const sorted = uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const now = new Date();

  for (const dateStr of sorted) {
    const buildDate = new Date(dateStr);
    const daysDiff = Math.floor((now.getTime() - buildDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak || daysDiff === streak + 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export const POST_XP = 50;

export function generateTweetDraft(
  builds: Array<{ repo?: string; xpEarned: number; conversationSummary?: string }>,
  style: 'raw' | 'polished' | 'educational' = 'raw',
  levelInfo?: LevelInfo
): string {
  if (builds.length === 0 && !levelInfo) return 'Just shipped something! #buildinpublic';

  const totalXp = builds.reduce((sum, b) => sum + b.xpEarned, 0);
  const repos = [...new Set(builds.filter((b) => b.repo).map((b) => b.repo))];
  const levelText = levelInfo ? `${levelInfo.title} (Level ${levelInfo.level})` : '';
  const gateText = levelInfo?.isGated ? 'Need more posts to unlock next level!' : '';

  const templates: Record<string, string[]> = {
    raw: [
      `Pushed ${builds.length} commits today. ${levelText} XP +${totalXp} ${gateText} #buildinpublic`,
      `${builds.length} builds shipped ${levelText} Working on: ${repos.join(', ')} #buildinpublic`,
      `Another day, another ${builds.length} commits ${levelText} +${totalXp} XP ${gateText} #buildinpublic`,
    ],
    polished: [
      `Productive coding session! Shipped ${builds.length} features across ${repos.length} projects. ${levelText} The grind continues! ${gateText} #buildinpublic`,
      `Daily dev log: ${builds.length} commits pushed, ${totalXp} XP earned. ${levelText} Building something cool! #buildinpublic`,
    ],
    educational: [
      `Today I learned: ${builds[0]?.conversationSummary || 'Code is poetry in motion'} ${levelText} ${builds.length} commits ${totalXp} XP #buildinpublic`,
      `Dev insight: ${levelText} Working on ${repos.join(' + ')} taught me patience and persistence ${gateText} #buildinpublic`,
    ],
  };

  const options = templates[style] || templates.raw;
  return options[Math.floor(Math.random() * options.length)];
}

// All level tiers for display
export const ALL_LEVEL_TIERS = [
  { range: '1-5', emoji: '🫥', name: 'Lurker', desc: 'Nobody. Zero followers energy.', gate: null },
  { range: '6-10', emoji: '🌱', name: 'Seedling', desc: 'First commits, first posts. Sprouting.', gate: null },
  { range: '11-15', emoji: '🔨', name: 'Maker', desc: 'Actually building stuff. People notice.', gate: '1 post per level' },
  { range: '16-20', emoji: '📢', name: 'Broadcaster', desc: 'Posting regularly. Small following.', gate: '1 post per level' },
  { range: '21-25', emoji: '🔥', name: 'Hot Take', desc: 'Content hits different. Growing fast.', gate: '2 posts per level' },
  { range: '26-30', emoji: '⚡', name: 'Shipper', desc: 'Ships weekly. Known in the scene.', gate: '2 posts per level' },
  { range: '31-35', emoji: '🏗️', name: 'Architect', desc: 'People study your repos.', gate: '3 posts per level' },
  { range: '36-40', emoji: '🎯', name: 'Influencer', desc: '"Have you seen what X built?"', gate: '3 posts per level' },
  { range: '41-45', emoji: '👑', name: 'Thought Leader', desc: 'Industry talks. Podcast invites.', gate: '3 posts per level' },
  { range: '46-50', emoji: '🦄', name: 'Unicorn', desc: 'Everyone knows your name.', gate: '3 posts per level' },
  { range: '51+', emoji: '🌍', name: 'Legend', desc: 'Changed the game.', gate: '3 posts per level' },
];
