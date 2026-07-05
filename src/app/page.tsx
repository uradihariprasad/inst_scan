"use client";

import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("upstox_token") : null;
    if (saved) setAccessToken(saved);
    setLoaded(true);
  }, []);

  const handleLogin = (token: string) => {
    setAccessToken(token);
    sessionStorage.setItem("upstox_token", token);
  };

  const handleLogout = () => {
    setAccessToken(null);
    sessionStorage.removeItem("upstox_token");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard accessToken={accessToken} onLogout={handleLogout} />;
}
