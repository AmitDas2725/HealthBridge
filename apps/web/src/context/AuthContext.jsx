import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "healthbridge-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed.token) {
        setLoading(false);
        return;
      }

      setToken(parsed.token);
      fetchCurrentUser(parsed.token)
        .then((response) => setUser(response.data.user))
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setToken("");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
    }
  }, []);

  async function login(payload) {
    const response = await loginUser(payload);
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
    return response;
  }

  async function register(payload) {
    const response = await registerUser(payload);
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
    return response;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

