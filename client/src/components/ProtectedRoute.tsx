// p5-5: Auto-redirect new users to onboarding wizard
import { useEffect } from "react";
import { useLocation } from "wouter";
import BrainLayout from "@/components/ai-agents/BrainLayout";
import { trpc } from "@/lib/trpc";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // p5-5: If the user exists but hasn't completed onboarding, redirect them
    // Skip if already on the onboarding route to avoid infinite loop
    if (
      !isLoading &&
      user &&
      user.onboardingComplete === false &&
      location !== "/onboarding"
    ) {
      setLocation("/onboarding");
    }
  }, [isLoading, user, location, setLocation]);

  return <BrainLayout>{children}</BrainLayout>;
}
