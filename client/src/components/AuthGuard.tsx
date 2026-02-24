import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
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

  return <>{children}</>;
}
