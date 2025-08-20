"use client";

import { useSession } from "next-auth/react";
import SignInButton from "@/components/auth/sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PayButton from "@/components/razorpay/PayButton";

export default function Home() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return (
      <main className="container mx-auto px-4 py-8">
        <div>Loading...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInButton />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <PayButton amount={499} />
    </main>
  );
}
