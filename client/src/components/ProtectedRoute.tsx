import { useEffect } from 'react';
import { useLocation } from 'wouter';
import BrainLayout from '@/components/ai-agents/BrainLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, navigate] = useLocation();

  useEffect(() => {
    const authToken = localStorage.getItem('cepho_auth_token');
    
    if (!authToken) {
      navigate('/login');
    }
  }, [navigate]);

  const authToken = localStorage.getItem('cepho_auth_token');
  
  if (!authToken) {
    return null;
  }

  return <BrainLayout>{children}</BrainLayout>;
}
