import { useAuth } from "@/providers/auth";

export function PlayerNav({ onSignInClick }: { onSignInClick?: () => void }) {
  const { connected, username, signOut } = useAuth();

  if (!connected) {
    if (!onSignInClick) return null;
    return (
      <button
        type="button"
        className="text-lg leading-none lowercase tracking-wide hover:text-raid-yellow"
        onClick={onSignInClick}
      >
        play now
      </button>
    );
  }

  return (
    <div className="group relative">
      <button type="button" className="max-w-48 truncate text-lg leading-none tracking-wide">
        {username}
      </button>
      <div className="invisible absolute top-full right-0 z-50 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="panel min-w-44 px-3 py-2">
          <div className="text-sm text-white/45">Signed in as</div>
          <div className="max-w-48 truncate text-sm text-white/70">{username}</div>
          <button
            type="button"
            className="mt-1 w-full text-left text-xl text-raid-yellow hover:underline"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              signOut();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
