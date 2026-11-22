import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { readLocal, setLocalAccount, writeLocal } from "@/lib/local-data";
export interface AuthUser {
  id: string;
  username: string;
}
type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";
interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
  profileName: string;
  setProfileName: (name: string) => void;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [profileName, setName] = useState("");
  const requestVersion = useRef(0);
  const applyUser = useCallback((next: AuthUser | null) => {
    requestVersion.current++;
    setLocalAccount(next?.id ?? null);
    setUser(next);
    setName(next ? readLocal("profileName") || next.username : "Guest");
    setStatus(next ? "authenticated" : "unauthenticated");
    setError(null);
  }, []);
  const restore = useCallback(async () => {
    const version = ++requestVersion.current;
    setStatus("loading");
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (version !== requestVersion.current) return;
      if (res.status === 401) {
        applyUser(null);
        return;
      }
      if (!res.ok)
        throw new Error("We couldn’t check your session. Please try again.");
      const data = await res.json();
      if (version === requestVersion.current) applyUser(data.user);
    } catch (e) {
      if (version !== requestVersion.current) return;
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unable to connect.");
    }
  }, [applyUser]);
  useEffect(() => {
    void restore();
  }, [restore]);
  const login = async (username: string, password: string) => {
    const res = await apiRequest("POST", "/api/login", { username, password });
    const data = await res.json();
    queryClient.clear();
    applyUser(data.user);
  };
  const register = async (username: string, password: string) => {
    await apiRequest("POST", "/api/register", { username, password });
    await login(username, password);
  };
  const logout = async () => {
    await apiRequest("POST", "/api/logout");
    queryClient.clear();
    applyUser(null);
  };
  const setProfileName = (name: string) => {
    if (!writeLocal("profileName", name))
      throw new Error(
        "Your browser could not save this name. Please allow local storage.",
      );
    setName(name);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        isLoggedIn: status === "authenticated",
        login,
        register,
        logout,
        retry: () => void restore(),
        profileName,
        setProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires AuthProvider");
  return value;
}
