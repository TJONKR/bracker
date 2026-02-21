interface ProfileInfoProps {
  displayName: string;
  username: string;
  bio?: string;
  joinedDate?: string;
  link?: string;
}

export default function ProfileInfo({ displayName, username, bio, joinedDate, link }: ProfileInfoProps) {
  return (
    <div className="profile-info">
      <div className="profile-name">
        {displayName}
        <span className="verified">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
        </span>
      </div>
      <div className="profile-handle">@{username}</div>

      {bio && (
        <div className="profile-bio">{bio}</div>
      )}

      <div className="profile-meta">
        {joinedDate && (
          <span>
            <svg viewBox="0 0 24 24"><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm-1 4h12v2H6v-2z" /></svg>
            Joined {joinedDate}
          </span>
        )}
        {link && (
          <span>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
            <a href={link}>{link.replace(/^https?:\/\//, '')}</a>
          </span>
        )}
      </div>
    </div>
  );
}
