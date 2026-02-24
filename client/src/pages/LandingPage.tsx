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
      {/* Animated Neural Network with Electrical Impulses */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rapid-firing neurons with electrical flashes */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-brain-flash"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5)',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 1 + 0.5}s`,
            }}
          />
        ))}
        
        {/* Central brain with intense electrical activity */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px]">
          {/* Outer electrical field */}
          <div className="absolute inset-0 bg-cyan-400/50 rounded-full blur-[120px] animate-electric-pulse" />
          
          {/* Middle energy layer */}
          <div className="absolute inset-[15%] bg-cyan-300/60 rounded-full blur-[80px] animate-electric-pulse-fast" />
          
          {/* Inner bright core - rapid pulsing */}
          <div className="absolute inset-[30%] bg-white/70 rounded-full blur-[50px] animate-brain-core" />
          
          {/* Synaptic firing - neurons in brain structure */}
          {[...Array(20)].map((_, i) => {
            const angle = (i * 360) / 20;
            const radius = 30 + (i % 3) * 8;
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            
            return (
              <div
                key={`synapse-${i}`}
                className="absolute rounded-full bg-white animate-synapse-fire"
                style={{
                  width: `${Math.random() * 25 + 10}px`,
                  height: `${Math.random() * 25 + 10}px`,
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(2px)',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(0, 255, 255, 0.8)',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            );
          })}

          {/* Electrical sparks - random bursts */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute rounded-full bg-cyan-200 animate-spark"
              style={{
                width: '8px',
                height: '8px',
                left: `${40 + Math.random() * 20}%`,
                top: `${40 + Math.random() * 20}%`,
                filter: 'blur(1px)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 1)',
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Electrical pathways - animated connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {[...Array(25)].map((_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            
            return (
              <g key={`path-${i}`}>
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(0, 255, 255, 0.3)"
                  strokeWidth="2"
                  className="animate-pulse-line"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
                {/* Traveling impulse */}
                <circle
                  r="4"
                  fill="rgba(255, 255, 255, 0.9)"
                  filter="url(#glow)"
                  className="animate-travel"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  <animateMotion
                    dur={`${2 + Math.random() * 2}s`}
                    repeatCount="indefinite"
                    begin={`${i * 0.2}s`}
                  >
                    <mpath href={`#path-${i}`} />
                  </animateMotion>
                </circle>
                <path
                  id={`path-${i}`}
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                  fill="none"
                />
              </g>
            );
          })}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo and Branding - Matching original slick design */}
        <div className="text-center mb-20 animate-fade-in">
          {/* Cepho logo with original styling */}
          <h1 
            className="font-bold mb-3 bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#a855f7] bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(4rem, 12vw, 8rem)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            CEPHO.AI
          </h1>
          
          {/* Subtitle with original styling */}
          <p 
            className="text-white/90"
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 2rem)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: 1.4,
            }}
          >
            The Brain - AI-Powered Executive Intelligence
          </p>
        </div>

        {/* Login Button - Matching original design */}
        {showLogin && (
          <div className="w-full max-w-md animate-slide-up">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-16 text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(90deg, #d946ef 0%, #a855f7 100%)',
                fontSize: '1.125rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.01em',
              }}
            >
              Sign in to Continue
            </Button>
          </div>
        )}
      </div>

      {/* Brain-like electrical animations */}
      <style>{`
        @keyframes brain-flash {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          10% {
            opacity: 1;
            transform: scale(1.3);
          }
          20% {
            opacity: 0.3;
            transform: scale(0.9);
          }
          30% {
            opacity: 0.9;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.1;
            transform: scale(0.7);
          }
          70% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes synapse-fire {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(0.8);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.4);
          }
          30% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.3);
          }
        }

        @keyframes spark {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(2);
          }
        }

        @keyframes electric-pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes electric-pulse-fast {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.15);
          }
        }

        @keyframes brain-core {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          25% {
            opacity: 0.95;
            transform: scale(1.08);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
          }
          75% {
            opacity: 0.9;
            transform: scale(1.12);
          }
        }

        @keyframes pulse-line {
          0%, 100% {
            opacity: 0.2;
            stroke-width: 1;
          }
          50% {
            opacity: 0.6;
            stroke-width: 3;
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

        .animate-brain-flash {
          animation: brain-flash linear infinite;
        }

        .animate-synapse-fire {
          animation: synapse-fire 0.8s ease-in-out infinite;
        }

        .animate-spark {
          animation: spark 1.5s ease-in-out infinite;
        }

        .animate-electric-pulse {
          animation: electric-pulse 2s ease-in-out infinite;
        }

        .animate-electric-pulse-fast {
          animation: electric-pulse-fast 1.5s ease-in-out infinite;
        }

        .animate-brain-core {
          animation: brain-core 1s ease-in-out infinite;
        }

        .animate-pulse-line {
          animation: pulse-line 2s ease-in-out infinite;
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
