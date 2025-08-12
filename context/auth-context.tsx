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

  const checkAuth = React.useCallback(async () => {
    if (!baseUrl) return;

    try {
      const response = await fetch(`${baseUrl}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.user) {
          setUserData(data.data.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [baseUrl]);

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
  };

  const logout = async () => {
    try {
      if (baseUrl) {
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setIsLoggedIn(false);
      setUserData(null);
    }
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
