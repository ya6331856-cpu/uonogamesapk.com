import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const check = useCallback(async () => {
    const token = localStorage.getItem("uono_token") || localStorage.getItem("token");
    if (!token) {
      setUser(false);
      setReady(true);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      localStorage.removeItem("uono_token");
      localStorage.removeItem("token");
      setUser(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const login = async (email, password) => {
    const en = email.trim().toLowerCase();
    try {
      const { data } = await api.post("/auth/login", { email: en, password });
      const token = data.token || data.access_token || data;
      localStorage.setItem("uono_token", token);
      localStorage.setItem("token", token);
      setUser(data.user || data);
      return data.user || data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("uono_token");
    localStorage.removeItem("token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
