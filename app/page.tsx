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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="h-12"
                disabled={isLoading}
              />
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
