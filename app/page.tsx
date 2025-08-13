"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { LoginResponse } from "@/type/api-response";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl)
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables"
  );

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, login } = useAuth();
  const [viewPassword, setViewPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/tables");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!credentials.id || !credentials.password) {
      setError("Please enter both ID and password");
      setIsLoading(false);
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post<LoginResponse>(
        `${baseUrl}/auth/login`,
        {
          username: credentials.id,
          password: credentials.password,
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Login failed. Please check your credentials.");
      }

      login({
        id: response.data.data.user.id,
        username: response.data.data.user.username,
        role: response.data.data.user.role,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Rato-POS
          </CardTitle>
          <CardDescription className="text-slate-600">
            Restaurant Point of Sale System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">Username</Label>
              <Input
                id="id"
                type="text"
                placeholder="Enter your username"
                value={credentials.id}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, id: e.target.value }))
                }
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="password"
                  type={viewPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="h-12 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setViewPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-500 hover:text-slate-900 focus:outline-none"
                  aria-label={viewPassword ? "Hide password" : "Show password"}
                >
                  {viewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M6.343 6.343A8.962 8.962 0 003 9c0 4.418 3.582 8 8 8 1.657 0 3.234-.336 4.675-.938M17.657 17.657A8.962 8.962 0 0021 15c0-4.418-3.582-8-8-8-1.657 0-3.234.336-4.675.938M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.642 1.627-1.09 2.357M15.535 15.535A6.978 6.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.828.167-1.617.465-2.357"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
