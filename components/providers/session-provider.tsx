"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { identifyUser, resetAnalytics } from "@/lib/posthog";

interface Props {
  children: ReactNode;
}

function PostHogIdentifier({ children }: Props) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      // Identify user in PostHog
      identifyUser(session.user.email, {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
    } else {
      // Reset user identification when session is lost
      resetAnalytics();
    }
  }, [session]);

  return <>{children}</>;
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <PostHogIdentifier>{children}</PostHogIdentifier>
    </SessionProvider>
  );
}
