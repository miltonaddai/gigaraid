import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthContextValue {
  connected: boolean;
  username: string;
  playerId: string;
  signIn: (username: string) => string;
  signOut: () => void;
}

const PLAYER_KEY = "gigaraid-player";
export const USERNAME_MAX = 18;

export function normalizeUsername(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, USERNAME_MAX);
}

export function playerIdFor(username: string) {
  return `player:${normalizeUsername(username).toLowerCase()}`;
}

function readStored() {
  try {
    return normalizeUsername(localStorage.getItem(PLAYER_KEY) ?? "");
  } catch {
    return "";
  }
}

function writeStored(username: string) {
  try {
    if (username) localStorage.setItem(PLAYER_KEY, username);
    else localStorage.removeItem(PLAYER_KEY);
  } catch {
    return;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function PlayerAuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState(readStored);

  const signIn = useCallback((raw: string) => {
    const next = normalizeUsername(raw);
    if (!next) throw new Error("Pick a username first.");
    writeStored(next);
    setUsername(next);
    return playerIdFor(next);
  }, []);

  const signOut = useCallback(() => {
    writeStored("");
    setUsername("");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      connected: Boolean(username),
      username,
      playerId: username ? playerIdFor(username) : "",
      signIn,
      signOut,
    }),
    [username, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside PlayerAuthProvider");
  }
  return ctx;
}
