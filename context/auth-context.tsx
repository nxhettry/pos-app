"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  const login = (user: User) => {
    setIsLoggedIn(true);
    setUserData(user);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, login, logout }}>
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
