export function getUserFromLocalStorage(): {
  id: string;
  username: string;
} | null {
  try {
    const item = localStorage.getItem("posapp_user");

    if (!item) return null;

    const { user, expiry } = JSON.parse(item);

    if (!user || !user.id || !expiry) {
      console.warn("Invalid user data or expiry missing");
      return null;
    }

    if (Date.now() > expiry) {
      console.warn("Session expired, removing from localStorage");
      localStorage.removeItem("posapp_user");
      localStorage.removeItem("posapp_access_token");
      localStorage.removeItem("posapp_refresh_token");
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem("posapp_access_token");
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem("posapp_access_token", token);
  } catch (error) {
    console.error("Error setting access token:", error);
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem("posapp_refresh_token");
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
}

export function setRefreshToken(token: string): void {
  try {
    localStorage.setItem("posapp_refresh_token", token);
  } catch (error) {
    console.error("Error setting refresh token:", error);
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem("posapp_access_token");
    localStorage.removeItem("posapp_refresh_token");
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
