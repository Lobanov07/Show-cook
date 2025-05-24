import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token); // синхронизируем при загрузке
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true); // <--- ВАЖНО
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false); // <--- ВАЖНО
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.info('AuthContext: Проверка токена при загрузке, storedToken:', storedToken);
    if (storedToken && !token) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}