import { createContext, useContext, useState, useCallback } from "react";
import { AuthAPI } from "../services/resources";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("mb_token"));

  const login = useCallback(async (password) => {
    const { token } = await AuthAPI.login(password);
    localStorage.setItem("mb_token", token);
    setToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("mb_token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
