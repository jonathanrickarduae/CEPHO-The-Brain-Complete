import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import AnimatedBrainLogo from "@/components/ai-agents/AnimatedBrainLogo";
import { toast } from "sonner";

// Particle system for blue glowing effect
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
      maxOpacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.02 + 0.01;
        this.maxOpacity = Math.random() * 0.8 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;

        // Pulsing opacity
        this.opacity += this.fadeSpeed;
        if (this.opacity > this.maxOpacity || this.opacity < 0.1) {
          this.fadeSpeed = -this.fadeSpeed;
        }
      }

      draw() {
        if (!ctx) return;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 4
        );
        gradient.addColorStop(0, `rgba(96, 165, 250, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = `rgba(147, 197, 253, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particleCount = 150;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - distance / 150) * 0.2 * Math.min(p1.opacity, p2.opacity)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.85 }}
    />
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fetch CSRF token required by server CSRF protection
      const csrfResp = await fetch("/api/csrf-token", { credentials: "include" });
      const csrfData = await csrfResp.json();
      const csrfToken: string = csrfData.csrfToken || "";

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Login successful!");
        // Redirect to dashboard
        setLocation("/nexus");
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4">
      {/* Intense pulsing blue glow - moved higher and more visible */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-cyan-400/80 rounded-full blur-[250px] animate-pulse" />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/90 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-1/6 left-1/4 w-[700px] h-[700px] bg-cyan-500/70 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute top-1/6 right-1/4 w-[700px] h-[700px] bg-blue-400/70 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
      </div>

      {/* Animated particle field - prominent blue effect */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-black/85 backdrop-blur-xl border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(0,212,255,0.5)] animate-[pulse_3s_ease-in-out_infinite]">
        <CardHeader className="space-y-4 text-center">
          {/* CEPHO Logo - Animated neon blue brain */}
          <div className="flex justify-center relative">
            {/* Pulsing blue glow behind brain */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-cyan-400/60 rounded-full blur-[60px] animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-24 bg-blue-500/80 rounded-full blur-[40px] animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </div>
            {/* Brain logo on top */}
            <div className="relative z-10">
              <AnimatedBrainLogo size="xl" intensity="active" color="#00d4ff" />
            </div>
          </div>

          {/* CEPHO Title - Blended neon colors */}
          <div>
            <CardTitle className="text-5xl font-bold text-center bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,212,255,0.8)] animate-pulse">
              Cepho
            </CardTitle>
            <p className="text-center text-cyan-400/80 text-sm mt-1 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
              The Greek for Brain
            </p>
            <p className="text-center text-gray-300 text-base mt-2">
              AI powered Executive Intelligence
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-cyan-400/30 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/5 border-cyan-400/30 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:via-blue-400 hover:to-cyan-400 text-white font-bold shadow-[0_0_30px_rgba(0,212,255,0.6)] hover:shadow-[0_0_50px_rgba(0,212,255,0.8)] transition-all duration-300 animate-pulse"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
