"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getStoredUser = () => {
    try {
      const item = localStorage.getItem("posapp_user");
      if (!item) return null;
      const { user, expiry } = JSON.parse(item);
      if (!user || !expiry) return null;
      if (Date.now() > expiry) {
        localStorage.removeItem("posapp_user");
        return null;
      }
      return user;
    } catch {
      return null;
    }
  };

  const checkAuth = React.useCallback(async () => {
    try {
      const user = getStoredUser();
      if (user) {
        setIsLoggedIn(true);
        setUserData(user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await checkAuth();
      setIsLoading(false);
    };

    initializeAuth();
  }, [checkAuth]);

  const login = (user: User) => {
    setIsLoggedIn(true);
    setUserData(user);
    const expiry = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem("posapp_user", JSON.stringify({ user, expiry }));
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("posapp_user");
    localStorage.removeItem("posapp_access_token");
    localStorage.removeItem("posapp_refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, login, logout, isLoading, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
