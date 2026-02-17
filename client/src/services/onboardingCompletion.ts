// Onboarding completion service
// Creates sample data and guides user through first experience

import { getDemoData } from './demoMode';

export interface OnboardingCompletionResult {
  success: boolean;
  sampleProjectId?: number;
  message: string;
}

// Sample project to create after onboarding
const SAMPLE_PROJECT = {
  name: 'Welcome to The Brain',
  type: 'onboarding',
  description: 'Your first project to explore how The Brain works. This sample project demonstrates the workflow, AI experts, and deliverables.',
  deliverables: [
    { name: 'Project Overview', status: 'complete', type: 'document' },
    { name: 'Feature Tour', status: 'in_progress', type: 'guide' },
    { name: 'Your First Task', status: 'pending', type: 'task' },
  ],
};

// Actions to suggest after onboarding
export const POST_ONBOARDING_ACTIONS = [
  {
    id: 'explore_brief',
    title: 'Check your Daily Brief',
    description: 'See what your Chief of Staff has prepared for you',
    icon: 'sun',
    path: '/daily-brief',
    priority: 1,
  },
  {
    id: 'start_project',
    title: 'Start Project Genesis',
    description: 'Create your first real project with AI assistance',
    icon: 'sparkles',
    path: '/project-genesis',
    priority: 2,
  },
  {
    id: 'train_twin',
    title: 'Train your Chief of Staff',
    description: 'Upload documents or complete a quick interview',
    icon: 'brain',
    path: '/digital-twin',
    priority: 3,
  },
  {
    id: 'explore_experts',
    title: 'Meet your AI Experts',
    description: 'Browse 287 specialists ready to help',
    icon: 'users',
    path: '/ai-experts',
    priority: 4,
  },
];

// Complete onboarding and set up initial state
export async function completeOnboarding(): Promise<OnboardingCompletionResult> {
  try {
    // Mark onboarding as complete
    localStorage.setItem('brain-onboarding-completed', 'true');
    localStorage.setItem('brain-onboarding-completed-at', new Date().toISOString());
    
    // Initialize demo mode with sample data
    const demoData = getDemoData();
    localStorage.setItem('brain-demo-data-initialized', 'true');
    
    // Store suggested actions
    localStorage.setItem('brain-post-onboarding-actions', JSON.stringify(POST_ONBOARDING_ACTIONS));
    
    // Track onboarding completion for analytics
    trackOnboardingComplete();
    
    return {
      success: true,
      message: 'Welcome to The Brain! Your AI command center is ready.',
    };
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
}

// Get post-onboarding actions
export function getPostOnboardingActions() {
  const stored = localStorage.getItem('brain-post-onboarding-actions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return POST_ONBOARDING_ACTIONS;
    }
  }
  return POST_ONBOARDING_ACTIONS;
}

// Mark an action as completed
export function markActionComplete(actionId: string) {
  const completedKey = 'brain-completed-actions';
  const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
  if (!completed.includes(actionId)) {
    completed.push(actionId);
    localStorage.setItem(completedKey, JSON.stringify(completed));
  }
}

// Get completed actions
export function getCompletedActions(): string[] {
  return JSON.parse(localStorage.getItem('brain-completed-actions') || '[]');
}

// Check if user is in first session after onboarding
export function isFirstSession(): boolean {
  const completedAt = localStorage.getItem('brain-onboarding-completed-at');
  if (!completedAt) return false;
  
  const completedDate = new Date(completedAt);
  const now = new Date();
  const hoursSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceCompletion < 24;
}

// Track onboarding completion (placeholder for analytics)
function trackOnboardingComplete() {
  // This would send to analytics in production
}

// Get onboarding progress
export function getOnboardingProgress() {
  const completed = getCompletedActions();
  const total = POST_ONBOARDING_ACTIONS.length;
  const done = completed.length;
  
  return {
    completed: done,
    total,
    percentage: Math.round((done / total) * 100),
    remaining: POST_ONBOARDING_ACTIONS.filter(a => !completed.includes(a.id)),
  };
}

// Reset onboarding (for testing)
export function resetOnboarding() {
  localStorage.removeItem('brain-onboarding-completed');
  localStorage.removeItem('brain-onboarding-completed-at');
  localStorage.removeItem('brain-post-onboarding-actions');
  localStorage.removeItem('brain-completed-actions');
  localStorage.removeItem('brain-demo-data-initialized');
}
