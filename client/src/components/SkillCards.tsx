/**
 * Skill Cards Component
 * Quick access to all 7 OpenClaw skills
 */

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function SkillCards() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const skills = [
    {
      id: "project-genesis",
      name: "Project Genesis",
      icon: "🚀",
      description: "6-phase venture development",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "ai-sme",
      name: "AI-SME Experts",
      icon: "🧠",
      description: "310 expert consultations",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "qms",
      name: "Quality Gates",
      icon: "✅",
      description: "QMS validation & compliance",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "due-diligence",
      name: "Due Diligence",
      icon: "🔍",
      description: "Structured DD process",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "financial",
      name: "Financial Modeling",
      icon: "💰",
      description: "Investor-ready models",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "data-room",
      name: "Data Room",
      icon: "🔐",
      description: "Secure document management",
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: "digital-twin",
      name: "Digital Twin",
      icon: "👤",
      description: "Your AI Chief of Staff",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {skills.map((skill) => (
        <div
          key={skill.id}
          onClick={() => setActiveSkill(skill.id)}
          className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          {/* Gradient background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="text-4xl mb-3">{skill.icon}</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {skill.name}
            </h3>
            <p className="text-sm text-muted-foreground">{skill.description}</p>

            {/* Action button */}
            <button className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Launch
            </button>
          </div>

          {/* Active indicator */}
          {activeSkill === skill.id && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}
