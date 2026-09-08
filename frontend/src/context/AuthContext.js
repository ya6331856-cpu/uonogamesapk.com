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
      const { data } = await api.get("/auth/me");[span_0](start_span)[span_0](end_span)
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
      const [authMod, fbMod] = await Promise.all([
        import("@/firebase/auth"),
        import("@/lib/firebase")
      ]);
      const signInWithEmailAndPassword = authMod.signInWithEmailAndPassword;
      const firebaseAuth = fbMod.firebaseAuth;

      const cred = await signInWithEmailAndPassword(firebaseAuth, en, password);
      const idToken = await cred.user.getIdToken();
      localStorage.setItem("uono_token", idToken);
      localStorage.setItem("token", idToken);
      const { data } = await api.get("/auth/me");[span_1](start_span)[span_1](end_span)
      setUser(data);
      return data;
    } catch (fbErr) {
      const { data } = await api.post("/auth/login", { email: en, password });[span_2](start_span)[span_2](end_span)
      const token = data.token || data.access_token || data;
      localStorage.setItem("uono_token", token);
      localStorage.setItem("token", token);
      setUser(data.user || data);
      return data.user || data;
    }
  };

  const logout = () => {
    localStorage.removeItem("uono_token");
    localStorage.removeItem("token");
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
