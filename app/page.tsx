"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import SignInButton from "@/components/auth/sign-in-button";
import SignOutButton from "@/components/auth/sign-out-button";
import UserProfile from "@/components/auth/user-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 items-center max-w-4xl mx-auto">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        {/* Authentication Status */}
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Status</CardTitle>
            <CardDescription>
              {status === "loading" && "Checking authentication..."}
              {status === "authenticated" && "You are successfully signed in"}
              {status === "unauthenticated" && "Please sign in to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {status === "authenticated" && (
              <div className="space-y-4">
                <UserProfile />
                <SignOutButton />
              </div>
            )}
            {status === "unauthenticated" && (
              <div className="space-y-4">
                <SignInButton />
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="w-full max-w-lg" />

        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="font-medium">OAuth Status:</span>
                <span className="text-muted-foreground">✅ Configured</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">User Status:</span>
                <span className="text-muted-foreground">
                  {session
                    ? `Signed in as ${session.user?.name}`
                    : "Not signed in"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Provider:</span>
                <span className="text-muted-foreground">Google OAuth 2.0</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button asChild size="lg">
            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
              />
              Deploy now
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our docs
            </a>
          </Button>
        </div>

        <footer className="flex gap-4 flex-wrap items-center justify-center mt-16">
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Go to nextjs.org →
            </a>
          </Button>
        </footer>
      </div>
    </div>
  );
}
