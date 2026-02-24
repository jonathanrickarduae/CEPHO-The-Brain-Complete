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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#0a3a3a] to-black">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Few large floating orbs - like in the image */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-gentle"
            style={{
              width: `${60 + Math.random() * 40}px`,
              height: `${60 + Math.random() * 40}px`,
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 60}%`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, rgba(255, 150, 50, 0.3) 50%, transparent 100%)'
                : 'radial-gradient(circle, rgba(100, 200, 255, 0.4) 0%, rgba(50, 150, 255, 0.2) 50%, transparent 100%)',
              filter: 'blur(20px)',
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
        
        {/* Soft central glow - subtle brain area */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px]">
          {/* Soft outer glow */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(0, 200, 200, 0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          
          {/* Inner soft glow */}
          <div 
            className="absolute inset-[20%] rounded-full animate-pulse-slower"
            style={{
              background: 'radial-gradient(circle, rgba(100, 220, 255, 0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Small sparkles in center */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const radius = 25;
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            
            return (
              <div
                key={`sparkle-${i}`}
                className="absolute rounded-full animate-twinkle"
                style={{
                  width: '4px',
                  height: '4px',
                  left: `${x}%`,
                  top: `${y}%`,
                  background: 'rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 0 8px rgba(100, 200, 255, 0.8)',
                  filter: 'blur(0.5px)',
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo and Branding */}
        <div className="text-center mb-16 animate-fade-in">
          {/* Cepho logo with mixed colors - cream/white tones */}
          <h1 
            className="font-bold mb-4"
            style={{
              fontSize: 'clamp(4rem, 12vw, 7rem)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #f5f5dc 0%, #ffffff 25%, #ffe4b5 50%, #ffffff 75%, #f0e68c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
            }}
          >
            Cepho
          </h1>
          
          {/* Tagline - white, smaller */}
          <p 
            className="text-white/80 mb-2"
            style={{
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              letterSpacing: '0.05em',
              lineHeight: 1.5,
            }}
          >
            The Greek for Brain
          </p>

          {/* Subtitle - white, smaller */}
          <p 
            className="text-white/70"
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: 1.5,
            }}
          >
            AI powered Executive Intelligence
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
                      className="text-base text-gray-300 cursor-pointer select-none"
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
            </div>
          </div>
        )}
      </div>

      {/* Subtle animations */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.4;
          }
          33% {
            transform: translate(30px, -20px);
            opacity: 0.6;
          }
          66% {
            transform: translate(-20px, 30px);
            opacity: 0.5;
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

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.08);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float-gentle {
          animation: float-gentle linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 5s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
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
