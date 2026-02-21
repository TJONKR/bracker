import Avatar from '@/components/profile/Avatar';

interface PostCardProps {
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({
  url,
  platform,
  content,
  xpEarned,
  createdAt,
  displayName,
  username,
  avatarUrl,
  emoji,
}: PostCardProps) {
  return (
    <div className="post">
      <Avatar avatarUrl={avatarUrl} emoji={emoji || '\u{1F528}'} size="small" />
      <div className="post-body">
        <div className="post-header">
          <span className="post-name">{displayName || 'Post'}</span>
          {username && <span className="post-handle">{username}</span>}
          <span className="post-time">{timeAgo(createdAt)}</span>
        </div>
        <div className="post-text">
          Shared on {platform} (+{xpEarned} XP)
          {content && <>{'\n\n'}{content}</>}
        </div>
        <div className="post-card">
          <div className="post-card-body">
            <div className="post-card-title">{platform} post</div>
            <div className="post-card-desc">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url.replace(/^https?:\/\//, '').slice(0, 60)}
              </a>
            </div>
          </div>
        </div>
        <div className="post-actions">
          <span className="post-action">
            <svg viewBox="0 0 24 24"><path d="M1.751 10c-.036 0-.07-.006-.104-.018a.75.75 0 0 1-.458-.464l-.009-.03A10.003 10.003 0 0 1 12 1c5.523 0 10 4.478 10 10a10.003 10.003 0 0 1-9.493 9.993.75.75 0 0 1-.544-.47L12 20.5l-.037-.023a.75.75 0 0 1-.205-.066C7.5 19.5 4 16 2 11.5l-.178-.386A.75.75 0 0 1 1.751 10zM12 3.5a8.5 8.5 0 0 0-8.127 6.008 10.146 10.146 0 0 0 5.436 7.075l.388.186.405.175A8.5 8.5 0 0 0 12 3.5z" /></svg>
          </span>
          <span className="post-action">
            <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg>
          </span>
          <span className="post-action">
            <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" /></svg>
          </span>
          <span className="post-action">
            <svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18.25 21V8.5h2V21h-2zM13.5 21V13h2v8h-2zM3.25 21v-6h2v6h-2z" /></svg>
          </span>
        </div>
      </div>
    </div>
  );
}
