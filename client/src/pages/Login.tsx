import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Login successful!');
        // Redirect to dashboard
        setLocation('/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4">
      {/* Animated neon blob background - more prominent blue */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main blue neon blob - larger and more prominent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        
        {/* Pink accent blob */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Purple accent blob */}
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Additional blue glow for prominence */}
        <div className="absolute top-1/3 left-1/3 w-[700px] h-[700px] bg-cyan-400/20 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-black/80 backdrop-blur-xl border-2 border-white/10">
        <CardHeader className="space-y-4 text-center">
          {/* CEPHO Logo - Neon blue, no background */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Neon glow effect */}
              <div className="absolute inset-0 bg-blue-500/50 blur-xl rounded-full" />
              {/* Brain icon - clear neon blue */}
              <Brain className="w-20 h-20 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* CEPHO Title - Blended neon colors */}
          <div>
            <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              CEPHO.AI
            </CardTitle>
            <CardDescription className="text-center text-gray-400 mt-2">
              Sign in to access your AI command center
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-400/50 focus:ring-blue-400/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-400/50 focus:ring-blue-400/20"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 hover:from-pink-600 hover:via-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          {/* Additional neon accent line */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
