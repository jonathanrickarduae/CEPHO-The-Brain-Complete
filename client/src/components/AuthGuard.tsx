import { useEffect } from "react";
import { useLocation } from "wouter";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // Authentication disabled - allow direct access
  return <>{children}</>;
}
