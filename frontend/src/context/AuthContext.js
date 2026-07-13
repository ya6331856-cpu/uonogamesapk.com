import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = checking, false = logged out, object = logged in
  const [ready, setReady] = useState(false);

  const check = useCallback(async () => {
    const token = localStorage.getItem("uono_token");
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
      setUser(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  // Login: try Firebase Auth first (loaded lazily so public pages never touch
  // the Firebase SDK); fall back to legacy JWT so the panel keeps working even
  // while the Firebase Email/Password provider is being enabled.
  const login = async (email, password) => {
    const em = email.trim().toLowerCase();
    try {
      const [{ signInWithEmailAndPassword }, { firebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase"),
      ]);
      const cred = await signInWithEmailAndPassword(firebaseAuth, em, password);
      const idToken = await cred.user.getIdToken();
      localStorage.setItem("uono_token", idToken);
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch (fbErr) {
      const { data } = await api.post("/auth/login", { email: em, password });
      localStorage.setItem("uono_token", data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem("uono_token");
    setUser(false);
    import("@/lib/firebase")
      .then(({ firebaseAuth }) => import("firebase/auth").then(({ signOut }) => signOut(firebaseAuth)))
      .catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
