"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rpcCall } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, KeyRound, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branding, setBranding] = useState<{
    isCustom: boolean;
    name: string;
    logoUrl?: string;
    primaryColor?: string;
  }>({
    isCustom: false,
    name: "CellsInbox",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      rpcCall<{
        isCustom: boolean;
        name: string;
        logoUrl?: string;
        primaryColor?: string;
      }>("auth", "branding", { host: window.location.hostname })
        .then((res) => {
          if (res) setBranding(res);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (requires2FA) {
        // Submit TOTP challenge
        const res = await rpcCall<{ accessToken: string; refreshToken: string }>(
          "auth",
          "totp-verify",
          { userId, code: totpCode.trim() },
        );
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        router.push("/inbox");
        return;
      }

      // Initial credential submission
      const res = await rpcCall<{
        status: "AUTHENTICATED" | "REQUIRES_ONBOARDING" | "REQUIRES_2FA";
        userId: string;
        email: string;
        accessToken?: string;
        refreshToken?: string;
      }>("auth", "login", { email: email.trim(), password });

      if (res.status === "REQUIRES_ONBOARDING") {
        router.push(`/onboarding/security?userId=${res.userId}&email=${encodeURIComponent(res.email)}`);
        return;
      }

      if (res.status === "REQUIRES_2FA") {
        setRequires2FA(true);
        setUserId(res.userId);
        setLoading(false);
        return;
      }

      if (res.status === "AUTHENTICATED" && res.accessToken) {
        localStorage.setItem("accessToken", res.accessToken);
        if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
        router.push("/inbox");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/80 shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.name}
                className="h-10 max-w-[220px] object-contain"
              />
            ) : (
              <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                {requires2FA ? <KeyRound className="size-6" /> : <Mail className="size-6" />}
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {branding.name}
          </CardTitle>
          <CardDescription>
            {requires2FA
              ? "Enter your 6-digit Authenticator Code"
              : `Sign in to your ${branding.isCustom ? branding.name : "sovereign"} mailbox`}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!requires2FA ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@yourdomain.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="totp">Authenticator Code</Label>
                <Input
                  id="totp"
                  type="text"
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  autoFocus
                  className="text-center text-xl tracking-[0.3em] font-mono"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Verifying..." : requires2FA ? "Verify & Sign In" : "Sign In"}
            </Button>
            <div className="text-center">
              <Link href="/onboarding/organization" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                New organization? <span className="font-semibold text-primary underline underline-offset-2">Onboard sovereign domain & keys</span>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
