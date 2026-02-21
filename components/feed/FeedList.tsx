import BuildCard from './BuildCard';
import PostCard from './PostCard';

interface Build {
  id: string;
  repo?: string;
  commitMessage?: string;
  xpEarned: number;
  streak: number;
  linesChanged: number;
  createdAt: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  emoji?: string;
}

interface Post {
  id: string;
  url: string;
  platform: string;
  content?: string;
  xpEarned: number;
  createdAt: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  emoji?: string;
}

interface FeedListProps {
  builds: Build[];
  posts: Post[];
  tab: 'builds' | 'posts';
}

export default function FeedList({ builds, posts, tab }: FeedListProps) {
  if (tab === 'builds') {
    if (builds.length === 0) {
      return (
        <div className="post" style={{ justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px 16px' }}>
          No builds yet. Start coding to earn XP!
        </div>
      );
    }
    return (
      <div>
        {builds.map((build) => (
          <BuildCard
            key={build.id}
            repo={build.repo}
            commitMessage={build.commitMessage}
            xpEarned={build.xpEarned}
            streak={build.streak}
            linesChanged={build.linesChanged}
            createdAt={build.createdAt}
            displayName={build.displayName}
            username={build.username}
            avatarUrl={build.avatarUrl}
            emoji={build.emoji}
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="post" style={{ justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px 16px' }}>
        No posts yet. Share your work to earn XP!
      </div>
    );
  }
  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          url={post.url}
          platform={post.platform}
          content={post.content}
          xpEarned={post.xpEarned}
          createdAt={post.createdAt}
          displayName={post.displayName}
          username={post.username}
          avatarUrl={post.avatarUrl}
          emoji={post.emoji}
        />
      ))}
    </div>
  );
}
