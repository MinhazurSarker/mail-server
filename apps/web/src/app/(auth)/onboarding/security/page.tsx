"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { rpcCall } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, QrCode } from "lucide-react";

function OnboardingSecurityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!userId) {
      router.push("/login");
      return;
    }

    rpcCall<{ secret: string; otpauthUri: string }>("auth", "totp-setup", { userId })
      .then((res) => {
        if (!isMounted) return;
        setTotpSecret(res.secret);
        setOtpauthUri(res.otpauthUri);
        if (res.otpauthUri) {
          QRCode.toDataURL(res.otpauthUri, {
            width: 180,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          })
            .then((url) => {
              if (isMounted) setQrDataUrl(url);
            })
            .catch((qrErr) => {
              console.error("Local QR generation failed:", qrErr);
            });
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to initialize 2-Step Verification.");
      })
      .finally(() => {
        if (isMounted) setSetupLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, router]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword && newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!totpToken || totpToken.trim().length !== 6) {
      setError("Please enter the 6-digit verification code from your authenticator app.");
      return;
    }

    setLoading(true);

    try {
      const res = await rpcCall<{ accessToken: string; refreshToken: string }>(
        "auth",
        "onboarding-complete",
        {
          userId,
          newPassword: newPassword || undefined,
          totpSecret,
          totpToken: totpToken.trim(),
        },
      );

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      router.push("/inbox");
    } catch (err: any) {
      setError(err.message || "Failed to complete security setup. Check your 6-digit code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-border/80 shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Security Onboarding</CardTitle>
          <CardDescription>
            Welcome, <span className="font-semibold text-primary">{email}</span>. Configure 2-Step Verification before accessing your mailbox.
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleComplete}>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password (Optional, replace temporary)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep temporary password"
                  autoComplete="new-password"
                />
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="size-4 text-primary" />
                  <span className="font-semibold text-sm">Scan with Authenticator App</span>
                </div>
                <Badge variant="secondary">TOTP</Badge>
              </div>

              {setupLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse">Generating your security keys...</p>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md">
                    {qrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={qrDataUrl}
                        alt="Authenticator QR"
                        className="size-36 rounded"
                      />
                    ) : (
                      <div className="size-36 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">Or enter manual key:</span>
                    <p className="font-mono text-xs font-semibold tracking-wider text-primary select-all mt-1">
                      {totpSecret}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totpToken">Enter 6-Digit Code from App</Label>
              <Input
                id="totpToken"
                type="text"
                required
                maxLength={6}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
                placeholder="123456"
                className="text-center text-xl tracking-[0.3em] font-mono"
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" disabled={loading || setupLoading} className="w-full" size="lg">
              {loading ? "Activating Security..." : "Complete Setup & Access Mail"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function OnboardingSecurityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading onboarding...</div>}>
      <OnboardingSecurityContent />
    </Suspense>
  );
}
