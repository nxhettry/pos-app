export function getUserIdFromLocalStorage(): string | null {
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
      return null;
    }

    return String(user.id);
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
