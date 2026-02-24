import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Lock, Mail } from 'lucide-react';
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
    setTimeout(() => setShowLogin(true), 1000);
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
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0f2f2f] via-[#0a7a6e] to-black">
      {/* Animated Neural Network */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Fast-moving neurons */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-neuron"
            style={{
              width: `${Math.random() * 20 + 8}px`,
              height: `${Math.random() * 20 + 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.3,
              filter: 'blur(2px)',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 3}s`,
            }}
          />
        ))}
        
        {/* Central brain cluster with intense glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px]">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-cyan-400/40 rounded-full blur-[100px] animate-pulse-slow" />
          
          {/* Middle glow */}
          <div className="absolute inset-[20%] bg-cyan-300/50 rounded-full blur-[60px] animate-pulse-medium" />
          
          {/* Inner bright core */}
          <div className="absolute inset-[35%] bg-cyan-200/60 rounded-full blur-[40px] animate-pulse-fast" />
          
          {/* Active neurons in cluster */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            const radius = 35 + Math.random() * 15;
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            
            return (
              <div
                key={`cluster-${i}`}
                className="absolute rounded-full bg-white animate-pulse-fast"
                style={{
                  width: `${Math.random() * 30 + 15}px`,
                  height: `${Math.random() * 30 + 15}px`,
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.9,
                  filter: 'blur(3px)',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            );
          })}
        </div>

        {/* Connection lines between neurons */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {[...Array(15)].map((_, i) => (
            <line
              key={`line-${i}`}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              className="animate-pulse"
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo and Branding */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
            Cepho-AI
          </h1>
          <p className="text-white text-2xl md:text-3xl font-light tracking-wide">
            Your AI Chief of Staff
          </p>
        </div>

        {/* Login Form */}
        {showLogin && (
          <div className="w-full max-w-md animate-slide-up">
            <div className="backdrop-blur-xl bg-black/40 p-8 rounded-3xl border border-white/10 shadow-2xl">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 rounded-xl transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 rounded-xl transition-all"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-300 cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-600/60 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in to Continue'
                  )}
                </Button>
              </form>

              <p className="text-center text-gray-400 text-sm mt-6">
                Don't have an account?{' '}
                <a href="/waitlist" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Join the waitlist
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes neuron {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translate(30px, -30px) scale(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translate(-30px, 30px) scale(0.9);
            opacity: 0.5;
          }
          75% {
            transform: translate(30px, 30px) scale(1.1);
            opacity: 0.7;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes pulse-medium {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.08);
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.12);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-neuron {
          animation: neuron linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-medium {
          animation: pulse-medium 3s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
