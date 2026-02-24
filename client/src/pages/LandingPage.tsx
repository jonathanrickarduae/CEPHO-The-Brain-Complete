import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Loader2, Lock, Mail } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import LoadingScreen from '@/components/LoadingScreen';

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('cepho_email');
    const savedRemember = localStorage.getItem('cepho_remember') === 'true';
    
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Show login form after animation
    setTimeout(() => setShowLogin(true), 1500);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('cepho_email', email);
      localStorage.setItem('cepho_remember', 'true');
    } else {
      localStorage.removeItem('cepho_email');
      localStorage.removeItem('cepho_remember');
    }

    // Simulate login (replace with actual auth)
    setTimeout(() => {
      // Save auth token
      localStorage.setItem('cepho_auth_token', 'authenticated');
      toast.success('Welcome to CEPHO.AI');
      navigate('/dashboard');
    }, 2000);
  };

  if (isLoading) {
    return <LoadingScreen message="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Animated Brain Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-6 relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-cyan-500/30 animate-pulse" />
            
            {/* Brain icon */}
            <div className="relative z-10 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-2xl shadow-cyan-500/50">
              <Brain className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            CEPHO.AI
          </h1>
          <p className="text-gray-400 text-lg">
            The Brain - AI-Powered Executive Intelligence
          </p>
        </div>

        {/* Login Form */}
        <div 
          className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl transition-all duration-1000 ${
            showLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-11 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-11 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-400 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Contact Sales
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 CEPHO.AI. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
