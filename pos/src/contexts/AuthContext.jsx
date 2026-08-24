import { createContext, useEffect, useState } from "react";
import useStorage from "../hooks/useStorage";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser, removeUser] = useStorage("user");
  const [token, setToken, removeToken] = useStorage("token");

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { username, password });
      setToken(res.token);
      setUser(res.user);
      return res;
    } catch (error) {
      return {
        message: error.message,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
