import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { WaitlistSignup, WaitlistStatus } from '../components/WaitlistReferral';
import { Brain, Sparkles, Shield, Zap, Users, Star } from 'lucide-react';

interface WaitlistPosition {
  position: number;
  totalWaiting: number;
  referralCode: string;
  referralsCount: number;
  positionsGained: number;
}

export default function Waitlist() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [position, setPosition] = useState<WaitlistPosition | null>(null);
  
  // Parse referral code from URL
  const searchParams = new URLSearchParams(searchString);
  const referralCode = searchParams.get('ref');

  // Check if user already joined (from localStorage for demo)
  useEffect(() => {
    const savedPosition = localStorage.getItem('brain_waitlist_position');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  const handleJoin = async (email: string, refCode?: string) => {
    // In production, this would call the API
    const newPosition: WaitlistPosition = {
      position: Math.floor(Math.random() * 3000) + 500,
      totalWaiting: 15847,
      referralCode: `BRAIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      referralsCount: 0,
      positionsGained: refCode ? 500 : 0,
    };
    
    // Apply referral bonus
    if (refCode) {
      newPosition.position = Math.max(100, newPosition.position - 500);
    }
    
    setPosition(newPosition);
    localStorage.setItem('brain_waitlist_position', JSON.stringify(newPosition));
  };

  const features = [
    {
      icon: Brain,
      title: 'Chief of Staff AI',
      description: 'An AI that learns your patterns, preferences, and goals to become your personalized assistant.',
    },
    {
      icon: Sparkles,
      title: '250+ AI Experts',
      description: 'Access specialists in business, health, creativity, and more - all trained to help you.',
    },
    {
      icon: Zap,
      title: 'Smart Scheduling',
      description: 'Auto-schedule tasks based on your energy levels and productivity patterns.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays yours. Full control over what your AI learns and remembers.',
    },
  ];

  const testimonials = [
    {
      quote: "Cepho has completely transformed how I manage my day. It's like having a chief of staff.",
      author: "Sarah K.",
      role: "Startup Founder",
      rating: 5,
    },
    {
      quote: "Finally, an AI that actually understands me. The mood tracking alone is worth it.",
      author: "Michael R.",
      role: "Product Manager",
      rating: 5,
    },
    {
      quote: "I've tried every productivity app. This is the first one that feels truly personal.",
      author: "Emily T.",
      role: "Creative Director",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <span className="text-2xl font-bold text-white">Cepho</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-6">
              <Users className="w-4 h-4" />
              <span>15,847 people on the waitlist</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Chief of Staff
              </span>
            </h1>
            
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
              An AI that learns you—your patterns, preferences, and goals—to help you 
              become the best version of yourself. Getting you to 100.
            </p>

            {/* Referral notice */}
            {referralCode && !position && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                <span>You've been referred! Join now to skip 500 spots in the queue.</span>
              </div>
            )}
          </div>

          {/* Waitlist Form or Status */}
          <div className="max-w-md mx-auto mb-20">
            {position ? (
              <WaitlistStatus position={position} />
            ) : (
              <WaitlistSignup onJoin={handleJoin} />
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              What early users are saying
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-foreground/60">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partners */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Research Partners
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center p-3 mb-4">
                  <img 
                    src="/logos/cambridge-university.png" 
                    alt="University of Cambridge" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">University of Cambridge</h3>
                <p className="text-cyan-400 text-sm mb-3">Research Partner</p>
                <p className="text-foreground/70 text-sm text-center max-w-xs">
                  Collaborating on AI-human collaboration research and cognitive enhancement studies.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center p-3 mb-4">
                  <img 
                    src="/logos/oxford-university.png" 
                    alt="University of Oxford" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">University of Oxford</h3>
                <p className="text-purple-400 text-sm mb-3">Strategic Partner</p>
                <p className="text-foreground/70 text-sm text-center max-w-xs">
                  Advancing ethical AI development and human-machine interface research.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          {!position && (
            <div className="text-center">
              <p className="text-foreground/70 mb-4">
                Join the waitlist today and be among the first to experience Cepho.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Early Access
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground/70">
            <span className="text-xl">🧠</span>
            <span>Cepho © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-foreground/60">
            <a href="#" className="hover:text-foreground/80">Privacy</a>
            <a href="#" className="hover:text-foreground/80">Terms</a>
            <a href="#" className="hover:text-foreground/80">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
