// MorningSignal — Victoria's daily briefing page
// Design: Meridian Light — white bg, electric cyan, neon pink
// Layout: Left-anchored, asymmetric, signal-first hierarchy

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Sun,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedBrainLogo from "@/components/AnimatedBrainLogo";

type RAGStatus = "red" | "amber" | "green";

interface ProjectAction {
  id: string;
  project: string;
  projectColor: string;
  action: string;
  priority: "high" | "medium" | "low";
  status: RAGStatus;
  dueTime?: string;
}

interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  preview: string;
  project: string;
  projectColor: string;
  approved: boolean | null;
}

interface OvernightTask {
  id: string;
  task: string;
  project: string;
  projectColor: string;
  completedAt: string;
  completedBy: string;
}

const projectActions: ProjectAction[] = [
  {
    id: "1",
    project: "Perfect",
    projectColor: "#F59E0B",
    action: "Escalate 3 overdue deliverables to supplier — deadline passed yesterday",
    priority: "high",
    status: "red",
    dueTime: "09:00",
  },
  {
    id: "2",
    project: "Celadon",
    projectColor: "#10B981",
    action: "Follow up on licence renewal — renewal window closes in 5 days",
    priority: "high",
    status: "amber",
    dueTime: "10:30",
  },
  {
    id: "3",
    project: "Boundless",
    projectColor: "#EF4444",
    action: "Review supplier contract terms before Thursday board meeting",
    priority: "medium",
    status: "amber",
    dueTime: "14:00",
  },
  {
    id: "4",
    project: "Celanova",
    projectColor: "#8B5CF6",
    action: "Review Q3 roadmap draft and approve for team distribution",
    priority: "medium",
    status: "green",
    dueTime: "16:00",
  },
  {
    id: "5",
    project: "Olmack",
    projectColor: "#3B82F6",
    action: "Prepare monthly review deck — meeting scheduled for Friday",
    priority: "low",
    status: "green",
  },
  {
    id: "6",
    project: "Personal",
    projectColor: "#EC4899",
    action: "Complete weekly review — 4 open items from last week",
    priority: "low",
    status: "green",
  },
];

const emailDrafts: EmailDraft[] = [
  {
    id: "e1",
    to: "Mark Davies <mark@perfect-supplier.com>",
    subject: "Urgent: Overdue Deliverables — Action Required",
    preview:
      "Following up on the three deliverables that were due on 18 June. We need confirmation of revised delivery dates by end of business today...",
    project: "Perfect",
    projectColor: "#F59E0B",
    approved: null,
  },
  {
    id: "e2",
    to: "Licensing Team <licensing@celadon.gov>",
    subject: "Licence Renewal — Reference #CLD-2024-881",
    preview:
      "I am writing to initiate the renewal process for our operating licence (ref #CLD-2024-881). Our current licence expires on 26 June 2026...",
    project: "Celadon",
    projectColor: "#10B981",
    approved: null,
  },
  {
    id: "e3",
    to: "Sarah Chen <sarah@boundless-supply.com>",
    subject: "Contract Review Request — Boundless Supply Agreement",
    preview:
      "Please could you send over the latest version of the supply agreement ahead of our Thursday board meeting? We need to review the revised terms...",
    project: "Boundless",
    projectColor: "#EF4444",
    approved: null,
  },
];

const overnightTasks: OvernightTask[] = [
  {
    id: "o1",
    task: "Celanova Q2 financial summary compiled and formatted",
    project: "Celanova",
    projectColor: "#8B5CF6",
    completedAt: "02:14",
    completedBy: "Victoria",
  },
  {
    id: "o2",
    task: "Olmack supplier database updated with 12 new contacts",
    project: "Olmack",
    projectColor: "#3B82F6",
    completedAt: "03:47",
    completedBy: "Victoria",
  },
  {
    id: "o3",
    task: "Perfect project risk register updated — 3 new risks flagged",
    project: "Perfect",
    projectColor: "#F59E0B",
    completedAt: "04:22",
    completedBy: "Victoria",
  },
];

const ragBorder: Record<RAGStatus, string> = {
  red: "border-l-red-500",
  amber: "border-l-amber-400",
  green: "border-l-emerald-500",
};

const ragDot: Record<RAGStatus, string> = {
  red: "bg-red-500",
  amber: "bg-amber-400",
  green: "bg-emerald-500",
};

const priorityLabel: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityColor: Record<string, string> = {
  high: "text-red-600 bg-red-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-emerald-600 bg-emerald-50",
};

function getDateString() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function MorningSignal() {
  const [, setLocation] = useLocation();
  const [emailStates, setEmailStates] = useState<Record<string, boolean | null | undefined>>(
    Object.fromEntries(emailDrafts.map((e) => [e.id, null]))
  );
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const redCount = projectActions.filter((a) => a.status === "red").length;
  const amberCount = projectActions.filter((a) => a.status === "amber").length;
  const pendingEmails = Object.values(emailStates).filter((v) => v === null).length;

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const approveEmail = (id: string, approved: boolean | null) => {
    setEmailStates((prev) => ({ ...prev, [id]: approved }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-background px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Morning Signal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {getGreeting()}, Jonathan
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{getDateString()}</p>
            </div>
            {/* Summary chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
              {redCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-700">
                    {redCount} critical
                  </span>
                </div>
              )}
              {amberCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-semibold text-amber-700">
                    {amberCount} in progress
                  </span>
                </div>
              )}
              {pendingEmails > 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                  style={{
                    background: "oklch(0.78 0.18 195 / 0.08)",
                    borderColor: "oklch(0.78 0.18 195 / 0.3)",
                  }}
                >
                  <Mail className="h-3 w-3" style={{ color: "oklch(0.78 0.18 195)" }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.55 0.18 195)" }}
                  >
                    {pendingEmails} drafts pending
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Victoria briefing strip */}
          <div
            className="mt-4 p-4 rounded-xl border flex items-start gap-3"
            style={{
              background: "oklch(0.78 0.18 195 / 0.05)",
              borderColor: "oklch(0.78 0.18 195 / 0.2)",
            }}
          >
            <AnimatedBrainLogo size="xs" intensity="active" color="oklch(0.78 0.18 195)" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "oklch(0.55 0.18 195)" }}
                >
                  Victoria
                </span>
                <span className="text-xs text-muted-foreground">· AI Chief of Staff</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                You have <strong>1 critical issue</strong> (Perfect deliverables overdue) and{" "}
                <strong>2 items requiring action today</strong>. I've drafted 3 emails ready for
                your approval. Overnight I completed 3 background tasks across Celanova, Olmack,
                and Perfect. Your highest-priority action is the Perfect supplier escalation —
                recommend addressing before 09:00.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue="actions">
          <TabsList className="mb-4 sm:mb-6 bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
            <TabsTrigger value="actions" className="rounded-lg text-sm">
              Today's Actions
              <span className="ml-2 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                {projectActions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-lg text-sm">
              Email Drafts
              {pendingEmails > 0 && (
                <span
                  className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: "oklch(0.78 0.18 195 / 0.15)",
                    color: "oklch(0.45 0.18 195)",
                  }}
                >
                  {pendingEmails}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overnight" className="rounded-lg text-sm">
              Overnight
              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                {overnightTasks.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* TODAY'S ACTIONS */}
          <TabsContent value="actions">
            <div className="flex flex-col gap-3">
              {projectActions.map((action) => {
                const done = completedActions.has(action.id);
                return (
                  <div
                    key={action.id}
                    className={`bg-white border border-border rounded-xl p-4 border-l-4 ${ragBorder[action.status]} transition-all ${done ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleAction(action.id)}
                        className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          done
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: action.projectColor }}
                          >
                            {action.project}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityColor[action.priority]}`}
                          >
                            {priorityLabel[action.priority]}
                          </span>
                          {action.dueTime && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {action.dueTime}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm text-foreground leading-snug ${done ? "line-through text-muted-foreground" : ""}`}
                        >
                          {action.action}
                        </p>
                      </div>

                      {/* Navigate to project */}
                      <button
                        onClick={() => setLocation(`/projects/${action.project.toLowerCase()}`)}
                        className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* EMAIL DRAFTS */}
          <TabsContent value="emails">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Victoria has drafted these emails based on your project status. Review and approve
                before sending.
              </p>
              {emailDrafts.map((email) => {
                const state = emailStates[email.id];
                return (
                  <div
                    key={email.id}
                    className={`bg-white border rounded-xl p-5 transition-all ${
                      state === true
                        ? "border-emerald-300 bg-emerald-50/30"
                        : state === false
                          ? "border-border opacity-50"
                          : "border-border"
                    }`}
                  >
                    {/* Email header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: email.projectColor }}
                          >
                            {email.project}
                          </span>
                          {state === true && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </span>
                          )}
                          {state === false && (
                            <span className="text-xs font-semibold text-muted-foreground">
                              Declined
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-0.5">To: {email.to}</p>
                        <p className="text-sm font-semibold text-foreground">{email.subject}</p>
                      </div>
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>

                    {/* Preview */}
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3 mb-4">
                      {email.preview}
                    </p>

                    {/* Actions */}
                    {state === null && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveEmail(email.id, true)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 active:scale-95 transition-all"
                          style={{ minHeight: 44 }}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve & Send
                        </button>
                        <button
                          onClick={() => approveEmail(email.id, false)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-medium hover:bg-muted/80 active:scale-95 transition-all"
                          style={{ minHeight: 44 }}
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </button>
                      </div>
                    )}
                    {state === true && (
                      <p className="text-xs text-emerald-600 font-medium">
                        Email queued for sending.
                      </p>
                    )}
                    {state === false && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => approveEmail(email.id, null)}
                        className="text-xs h-8 px-3 text-muted-foreground"
                      >
                        Undo
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* OVERNIGHT TASKS */}
          <TabsContent value="overnight">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground mb-1">
                Tasks completed by Victoria while you were away.
              </p>
              {overnightTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-border rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: task.projectColor }}
                      >
                        {task.project}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.completedAt} · {task.completedBy}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{task.task}</p>
                  </div>
                </div>
              ))}

              {/* Victoria overnight summary */}
              <div
                className="mt-2 p-4 rounded-xl border flex items-start gap-3"
                style={{
                  background: "oklch(0.78 0.18 195 / 0.04)",
                  borderColor: "oklch(0.78 0.18 195 / 0.15)",
                }}
              >
                <Sparkles
                  className="h-4 w-4 shrink-0 mt-0.5"
                  style={{ color: "oklch(0.78 0.18 195)" }}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Victoria completed <strong>3 background tasks</strong> overnight across 3
                  projects. No errors or blockers were encountered. All outputs are available in
                  the relevant project portals.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
