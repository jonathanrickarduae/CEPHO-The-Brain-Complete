/**
 * CEPHO.Ai Business Model Page
 * 
 * Comprehensive view of the CEPHO.Ai business model including:
 * - Organizational Structure
 * - Value Proposition
 * - Revenue Model
 * - Key Differentiators
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CEPHOOrgChart } from "@/components/CEPHOOrgChart";
import {
  Building2,
  Users,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  Lightbulb,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Brain,
  BarChart3,
  FileText,
  Download
} from "lucide-react";

// =============================================================================
// VALUE PROPOSITIONS
// =============================================================================

const VALUE_PROPS = [
  {
    icon: Brain,
    title: "AI-Powered Executive Team",
    description: "Access a full C-suite of AI experts without the overhead of traditional executive hires",
    benefit: "90% cost reduction vs traditional executive team"
  },
  {
    icon: Zap,
    title: "24/7 Operational Intelligence",
    description: "Continuous monitoring, analysis, and recommendations that never sleep",
    benefit: "Always-on strategic support"
  },
  {
    icon: Target,
    title: "Personalized to Your Business",
    description: "AI that learns your preferences, style, and business context over time",
    benefit: "Increasingly accurate recommendations"
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Your data stays private with bank-level encryption and compliance",
    benefit: "SOC 2 Type II compliant"
  }
];

// =============================================================================
// REVENUE MODEL
// =============================================================================

const PRICING_TIERS = [
  {
    name: "Founder",
    price: "£99",
    period: "/month",
    description: "For solo founders and early-stage startups",
    features: [
      "Virtual Chief of Staff",
      "3 AI SME Experts",
      "Morning Signal Briefings",
      "Basic Document Generation",
      "Email Support"
    ],
    highlight: false
  },
  {
    name: "Scale-Up",
    price: "£299",
    period: "/month",
    description: "For growing businesses with complex needs",
    features: [
      "Everything in Founder",
      "Full AI SME Team (8+ experts)",
      "Digital Twin Simulation",
      "Advanced Analytics",
      "Priority Support",
      "Custom Integrations"
    ],
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations requiring bespoke solutions",
    features: [
      "Everything in Scale-Up",
      "Dedicated AI Training",
      "White-Label Options",
      "API Access",
      "Dedicated Success Manager",
      "Custom SLAs"
    ],
    highlight: false
  }
];

// =============================================================================
// DIFFERENTIATORS
// =============================================================================

const DIFFERENTIATORS = [
  {
    title: "One Employee Model",
    description: "Unlike traditional businesses requiring large teams, CEPHO.Ai enables a single CEO to operate with the capability of a full executive team through AI amplification.",
    icon: Users
  },
  {
    title: "Learning System",
    description: "The Chief of Staff continuously learns from every interaction, building a deep understanding of your preferences, communication style, and business context.",
    icon: Lightbulb
  },
  {
    title: "Expert Panel Reviews",
    description: "Every major decision gets reviewed by a panel of AI SME experts, providing diverse perspectives and catching blind spots before they become problems.",
    icon: BarChart3
  },
  {
    title: "Advisory Network Integration",
    description: "Seamlessly connects to the world's knowledge through real-time data feeds, research papers, market intelligence, and expert networks.",
    icon: Globe
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function BusinessModelPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#E91E8C]/20 to-purple-500/20 border border-[#E91E8C]/30">
              <Building2 className="h-8 w-8 text-[#E91E8C]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">CEPHO.Ai Business Model</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The AI-powered executive platform that transforms how businesses operate
          </p>
          <div className="flex justify-center gap-3">
            <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90">
              <FileText className="h-4 w-4 mr-2" />
              Download Business Plan
            </Button>
            <Button variant="outline" className="border-gray-700">
              <Download className="h-4 w-4 mr-2" />
              Export Pitch Deck
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-gray-900/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="differentiators">Differentiators</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8">
            <div className="space-y-8">
              {/* Mission Statement */}
              <Card className="bg-gradient-to-br from-[#E91E8C]/10 to-purple-500/10 border-[#E91E8C]/30">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-8 w-8 text-[#E91E8C] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Our Mission</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    To democratize access to executive-level intelligence, enabling every founder and CEO 
                    to operate with the strategic capability of a Fortune 500 company through AI amplification.
                  </p>
                </CardContent>
              </Card>

              {/* Value Propositions */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Value Proposition</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {VALUE_PROPS.map((prop, idx) => {
                    const Icon = prop.icon;
                    return (
                      <Card key={idx} className="bg-gray-900/50 border-gray-800">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-xl bg-[#E91E8C]/20">
                              <Icon className="h-6 w-6 text-[#E91E8C]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{prop.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
                              <Badge variant="outline" className="mt-2 text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                {prop.benefit}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-[#E91E8C]">1</p>
                    <p className="text-sm text-muted-foreground">Employee Required</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-purple-400">8+</p>
                    <p className="text-sm text-muted-foreground">AI SME Experts</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-cyan-400">24/7</p>
                    <p className="text-sm text-muted-foreground">Availability</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-green-400">90%</p>
                    <p className="text-sm text-muted-foreground">Cost Savings</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization" className="mt-8">
            <CEPHOOrgChart variant="full" showDetails={true} />
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="mt-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Simple, Transparent Pricing</h2>
                <p className="text-muted-foreground">Choose the plan that fits your business stage</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRICING_TIERS.map((tier, idx) => (
                  <Card 
                    key={idx} 
                    className={`${tier.highlight 
                      ? "bg-gradient-to-br from-[#E91E8C]/20 to-purple-500/10 border-[#E91E8C]" 
                      : "bg-gray-900/50 border-gray-800"
                    }`}
                  >
                    <CardHeader>
                      {tier.highlight && (
                        <Badge className="w-fit bg-[#E91E8C] mb-2">Most Popular</Badge>
                      )}
                      <CardTitle className="text-white">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="pt-4">
                        <span className="text-4xl font-bold text-white">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {tier.features.map((feature, fidx) => (
                          <li key={fidx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full mt-6 ${tier.highlight ? "bg-[#E91E8C]" : ""}`}
                        variant={tier.highlight ? "default" : "outline"}
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Differentiators Tab */}
          <TabsContent value="differentiators" className="mt-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">What Makes CEPHO.Ai Different</h2>
                <p className="text-muted-foreground">Key differentiators that set us apart</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DIFFERENTIATORS.map((diff, idx) => {
                  const Icon = diff.icon;
                  return (
                    <Card key={idx} className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#E91E8C]/20">
                            <Icon className="h-6 w-6 text-[#E91E8C]" />
                          </div>
                          <CardTitle className="text-white text-lg">{diff.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{diff.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Competitive Comparison */}
              <Card className="bg-gray-900/50 border-gray-800 mt-8">
                <CardHeader>
                  <CardTitle className="text-white">CEPHO.Ai vs Traditional Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 text-muted-foreground">Aspect</th>
                          <th className="text-center py-3 text-muted-foreground">Traditional</th>
                          <th className="text-center py-3 text-[#E91E8C]">CEPHO.Ai</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Executive Team Cost</td>
                          <td className="text-center py-3">£500K+ / year</td>
                          <td className="text-center py-3 text-green-400">£3.6K / year</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Time to Hire</td>
                          <td className="text-center py-3">3-6 months</td>
                          <td className="text-center py-3 text-green-400">Instant</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Availability</td>
                          <td className="text-center py-3">Business hours</td>
                          <td className="text-center py-3 text-green-400">24/7</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Scalability</td>
                          <td className="text-center py-3">Linear (hire more)</td>
                          <td className="text-center py-3 text-green-400">Instant</td>
                        </tr>
                        <tr>
                          <td className="py-3">Knowledge Retention</td>
                          <td className="text-center py-3">Leaves with employee</td>
                          <td className="text-center py-3 text-green-400">Permanent</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
