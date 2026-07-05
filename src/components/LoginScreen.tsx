"use client";

import { useState } from "react";

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!token.trim()) {
      setError("Please enter your Upstox access token");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        onLogin(token.trim());
      } else {
        setError(data.error || "Invalid token. Please check and try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Institutional Momentum Intelligence
          </h1>
          <p className="text-text-secondary text-sm">
            AI-Powered NSE F&O Trading Platform
          </p>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Connect to Upstox</h2>
          <p className="text-text-secondary text-sm mb-4">
            Enter your Upstox API access token to connect live market data.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Access Token
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your Upstox access token here..."
                rows={3}
                className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-muted text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                <p className="text-accent-red text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Validating...
                </>
              ) : (
                "Connect & Launch Platform"
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
            <p className="text-text-muted text-xs leading-relaxed">
              💡 Your token is used client-side to fetch live data from Upstox API.
              It is never stored on our servers.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "📊", label: "Live Market Data" },
            { icon: "🏦", label: "Institutional Flow" },
            { icon: "🎯", label: "AI Recommendations" },
          ].map((feat) => (
            <div key={feat.label} className="bg-bg-card/50 border border-border/50 rounded-lg p-3 text-center">
              <div className="text-xl mb-1">{feat.icon}</div>
              <p className="text-text-secondary text-xs">{feat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
