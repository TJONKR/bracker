interface AvatarProps {
  avatarUrl?: string;
  emoji?: string;
  size?: 'large' | 'small';
}

export default function Avatar({ avatarUrl, emoji = '\u{1F528}', size = 'large' }: AvatarProps) {
  if (size === 'small') {
    return (
      <div className="post-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          emoji
        )}
      </div>
    );
  }

  return (
    <div className="avatar">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" />
      ) : (
        <span className="avatar-emoji">{emoji}</span>
      )}
    </div>
  );
}
