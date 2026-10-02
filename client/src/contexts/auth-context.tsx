import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const LOGGED_IN_KEY = "isLoggedIn";
const PROFILE_NAME_KEY = "profileName";
const DEFAULT_PROFILE_NAME = "Ambrish.S";

interface AuthContextValue {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  profileName: string;
  setProfileName: (name: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); state still works in memory.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read synchronously so protected pages don't redirect before the stored session is restored.
  const [isLoggedIn, setIsLoggedIn] = useState(() => readStorage(LOGGED_IN_KEY) === "true");
  const [profileName, setProfileNameState] = useState(
    () => readStorage(PROFILE_NAME_KEY) || DEFAULT_PROFILE_NAME,
  );

  const login = useCallback(() => {
    setIsLoggedIn(true);
    writeStorage(LOGGED_IN_KEY, "true");
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    writeStorage(LOGGED_IN_KEY, "false");
  }, []);

  const setProfileName = useCallback((name: string) => {
    setProfileNameState(name);
    writeStorage(PROFILE_NAME_KEY, name);
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, login, logout, profileName, setProfileName }),
    [isLoggedIn, login, logout, profileName, setProfileName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
