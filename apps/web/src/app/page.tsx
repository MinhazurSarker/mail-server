import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Mail, Server, Lock, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 border-primary/30 text-primary">
          <ShieldCheck className="size-3.5" />
          Sovereign Multi-Tenant Email Infrastructure
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          CellsInbox Enterprise Mail
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Self-hosted sovereign email platform featuring direct Port 25 STARTTLS inbound/outbound, 2048-bit DKIM signing, BYOS S3 attachment offload, and a fast webmail client.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Access Webmail
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="lg">
              Admin Governance Panel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="border border-border/60 hover:border-border transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="size-5 text-primary" />
              <CardTitle className="text-lg">Inbound SMTP (Port 25)</CardTitle>
            </div>
            <CardDescription>
              RFC 5322 MIME Parser & BYOS S3 Storage
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Directly receives sovereign email over Port 25 with STARTTLS, parses multi-part MIME payloads, and offloads heavy raw blobs to your own S3/R2 storage buckets.
          </CardContent>
        </Card>

        <Card className="border border-border/60 hover:border-border transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Server className="size-5 text-emerald-500" />
              <CardTitle className="text-lg">Direct Outbound MTA</CardTitle>
            </div>
            <CardDescription>
              2048-bit DKIM & MX Direct-to-Mailbox
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Asynchronously dispatches emails directly to destination MX hosts with automated SPF/DKIM signing and graceful secondary Amazon SES failover.
          </CardContent>
        </Card>

        <Card className="border border-border/60 hover:border-border transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="size-5 text-violet-500" />
              <CardTitle className="text-lg">Zero-Knowledge Governance</CardTitle>
            </div>
            <CardDescription>
              WebAuthn Passkeys & SendGrid APIs
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Platform admins manage DNS, domains, and quotas with zero message-body visibility. Developers send high-volume transactional emails via SendGrid-compatible REST endpoints.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
