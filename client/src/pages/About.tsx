import { 
  Brain, Fingerprint, Users, Sparkles, Target, 
  Zap, Shield, TrendingUp, Heart, BookOpen,
  MessageSquare, Lightbulb, Layers, ArrowRight
} from 'lucide-react';
import { useLocation } from 'wouter';
import NeonBrain from '@/components/NeonBrain';

export default function About() {
  const [, setLocation] = useLocation();

  const pillars = [
    {
      icon: Fingerprint,
      title: "Chief of Staff",
      description: "Your AI counterpart that learns your patterns, preferences, and decision-making style. It grows smarter with every interaction, eventually thinking and acting like you.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "AI-SME Engine",
      description: "Access 294+ specialized AI Subject Matter Experts across business, health, creativity, and more. Get perspectives from strategists, lawyers, coaches, and specialists on demand.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Zap,
      title: "Daily Flow",
      description: "Morning Signal → AI Consultation → Workflow Execution → Evening Review. A structured rhythm that maximizes your productivity and wellbeing.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "The Hippocampus",
      description: "Your secure knowledge base. Store documents, insights, and learnings that your Chief of Staff can access to make better decisions on your behalf.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const concepts = [
    {
      icon: Target,
      title: "Getting You to a 10",
      description: "Cepho's core mission is optimizing your daily wellness score. Through mood tracking, task management, and AI guidance, we help you reach peak performance."
    },
    {
      icon: Lightbulb,
      title: "Collective Intelligence",
      description: "Combine your knowledge with AI expertise. Cepho aggregates insights from multiple AI-SMEs to give you well-rounded perspectives on any challenge."
    },
    {
      icon: Layers,
      title: "Continuous Learning",
      description: "Every conversation, decision, and preference trains your Chief of Staff. Over time, it becomes an extension of your thinking—able to draft, decide, and act like you."
    },
    {
      icon: Heart,
      title: "Human-AI Collaboration",
      description: "You're always in control. Cepho suggests, drafts, and prepares—but you approve. It's designed to amplify your capabilities, not replace your judgment."
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <NeonBrain size="xl" className="w-48 h-48 md:w-64 md:h-64" state="thinking" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-wider bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(236,72,153,0.5)] mb-2">
          CEPHO
        </h1>
        <p className="text-lg text-muted-foreground italic mb-4">
          From the Greek for brain. Where intelligence begins.
        </p>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          One interface to manage your life, amplified by AI that thinks like you.
        </p>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          <span className="text-primary font-semibold">Highly secure.</span> Freeing you to focus on what matters most. Keeping you operating at a <span className="text-primary font-semibold">10</span>.
        </p>
      </div>

      {/* Brand Story */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-6 md:p-8 mb-8 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">The Story Behind Cepho</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-white">Cepho</strong> derives from the Greek root that gives us "encephalon" — the scientific word for the brain itself. It connects to "cephalisation," the evolutionary process that created intelligence.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We are continuing the story of how thinking emerged in the universe. Cepho represents the next evolution: a <strong className="text-white">Chief of Staff</strong> that learns from you, thinks like you, and works alongside you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With access to <strong className="text-white">294+ AI Subject Matter Experts</strong> and secure storage in The Hippocampus, Cepho consolidates your tools, optimizes your workflow, and keeps you operating at peak performance.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-card/60 rounded-2xl p-6 md:p-8 mb-8 border border-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">The Vision</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Cepho is your personal AI command center that creates a <strong className="text-white">Chief of Staff</strong> of you—learning your patterns, decisions, and communication style—so it can eventually act autonomously on your behalf.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              It consolidates all your tools (Asana, email, calendar, health data), provides access to <strong className="text-white">294+ AI-SMEs</strong>, and optimizes your daily performance through structured workflows.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Everything stays <strong className="text-green-400">highly secure in The Hippocampus</strong>. Your data, your control, your Chief of Staff—working to free you up for what truly matters in life.
            </p>
          </div>
        </div>
      </div>

      {/* Four Pillars */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        The Four Pillars
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {pillars.map((pillar) => (
          <div 
            key={pillar.title}
            className="bg-card/60 rounded-xl p-5 border border-border hover:border-primary/30 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <pillar.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{pillar.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
          </div>
        ))}
      </div>

      {/* Core Concepts */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" />
        Core Concepts
      </h2>
      <div className="space-y-4 mb-10">
        {concepts.map((concept) => (
          <div 
            key={concept.title}
            className="flex items-start gap-4 bg-card/40 rounded-xl p-4 border border-border/50"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <concept.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{concept.title}</h3>
              <p className="text-sm text-muted-foreground">{concept.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-primary" />
        How It Works
      </h2>
      <div className="bg-card/60 rounded-xl p-6 border border-border mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: 1, title: "The Signal", desc: "Start your day with priorities, mood check, and AI insights" },
            { step: 2, title: "AI Consultation", desc: "Get expert perspectives on decisions and challenges" },
            { step: 3, title: "Execute & Capture", desc: "Work through tasks while Cepho learns from you" },
            { step: 4, title: "Evening Review", desc: "Reflect, celebrate wins, and train your Chief of Staff" }
          ].map((item, i) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-3">
                  <span className="font-bold text-primary">{item.step}</span>
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {i < 3 && (
                <ArrowRight className="hidden md:block absolute top-5 -right-2 w-4 h-4 text-primary/40" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Partners */}
      <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
        Trusted By
      </h2>
      <div className="bg-card/60 rounded-xl p-6 border border-border mb-10">
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-2">
              <img 
                src="/logos/cambridge-university.png" 
                alt="University of Cambridge" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">University of Cambridge</p>
              <p className="text-xs text-muted-foreground">Research Partner</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-2">
              <img 
                src="/logos/oxford-university.png" 
                alt="University of Oxford" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">University of Oxford</p>
              <p className="text-xs text-muted-foreground">Strategic Partner</p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Collaborating with world-leading institutions to advance AI-human collaboration research.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => setLocation('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(255,16,240,0.3)] hover:shadow-[0_0_30px_rgba(255,16,240,0.5)] transition-all"
        >
          <Brain className="w-5 h-5" />
          Enter Cepho
        </button>
        <p className="text-sm text-muted-foreground mt-3">
          Start your journey to peak performance
        </p>
      </div>
    </div>
  );
}
