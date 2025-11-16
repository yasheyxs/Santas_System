import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "@/lib/constants";

export interface AuthUser {
  id: number;
  telefono: string;
  nombre: string;
  email: string;
  rol_id: number;
  activo?: boolean;
  fecha_creacion?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (telefono: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = "santas:user";
const TOKEN_STORAGE_KEY = "santas:token";

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );

  const login = useCallback(async (telefono: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "No se pudo iniciar sesión");
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
    }),
    [login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
