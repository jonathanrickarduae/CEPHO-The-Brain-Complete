import BrainLayout from "@/components/ai-agents/BrainLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Authentication disabled - allow direct access
  return <BrainLayout>{children}</BrainLayout>;
}
