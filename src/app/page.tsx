/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            PhishX
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Advanced Phishing Protection powered by OpenPhish and AdGuard
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link href="/phishx">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Real-time Protection</h3>
              <p className="text-muted-foreground">
                Instant detection and blocking of phishing attempts using OpenPhish's
                extensive database of malicious URLs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">DNS-level Filtering</h3>
              <p className="text-muted-foreground">
                Advanced DNS filtering through AdGuard to block malicious domains
                before they can reach your devices.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Detailed Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive insights into blocked threats, DNS queries, and
                protection status through an intuitive dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <h4 className="text-3xl font-bold text-blue-500">99.9%</h4>
            <p className="text-muted-foreground">Phishing Detection Rate</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-bold text-green-500">24/7</h4>
            <p className="text-muted-foreground">Active Protection</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-bold text-purple-500">1M+</h4>
            <p className="text-muted-foreground">Threats Blocked</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Secure Your Network?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with PhishX today and protect your network from phishing
            threats with our advanced protection system.
          </p>
          <Link href="/adguard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Access Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 PhishX. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
