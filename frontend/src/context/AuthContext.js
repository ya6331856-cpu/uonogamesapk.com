import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const check = useCallback(async () => {
    const token = localStorage.getItem("yono_token");
    if (!token) {
      setUser(false);
      setReady(true);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      localStorage.removeItem("yono_token");
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
      const [authMod, fbMod] = await Promise.all([
        import("@/firebase/auth"),
        import("@/lib/firebase")
      ]);
      const signInWithEmailAndPassword = authMod.signInWithEmailAndPassword;
      const firebaseAuth = fbMod.firebaseAuth;

      const cred = await signInWithEmailAndPassword(firebaseAuth, en, password);
      const idToken = await cred.user.getIdToken();
      localStorage.setItem("yono_token", idToken);
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch (fbErr) {
      const { data } = await api.post("/auth/login", { email: en, password });
      localStorage.setItem("yono_token", data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem("yono_token");
    setUser(false);
    import("@/lib/firebase").then(({ signOut, firebaseAuth }) => signOut(firebaseAuth))
      .catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
