/**
 * Feature Flags Hook (Remediation Task 6.3)
 *
 * Deterministic percentage-based rollout, user-specific overrides,
 * and admin management — all without any external service.
 *
 * Usage:
 *   const { isEnabled } = useFeatureFlags();
 *   if (isEnabled('digital_twin')) { ... }
 *
 *   // Or check a single flag reactively:
 *   const enabled = useFlag('innovation_hub');
 */

import { trpc } from "@/lib/trpc";

// Known feature flag keys (for type safety)
export type FeatureFlagKey =
  | "ai_chat"
  | "digital_twin"
  | "voice_notes"
  | "innovation_hub"
  | "evening_review"
  | "two_factor_auth"
  | "feedback_widget"
  | "storybook"
  | string; // allow unknown flags to not break

/**
 * Get all feature flags at once (cached, refetched every 5 minutes)
 */
export function useFeatureFlags() {
  const { data: flags, isLoading } = trpc.featureFlags.getAll.useQuery(
    undefined,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const isEnabled = (key: FeatureFlagKey): boolean => {
    if (!flags) return false; // default to disabled while loading
    return flags[key] ?? false;
  };

  return { flags: flags ?? {}, isEnabled, isLoading };
}

/**
 * Check a single feature flag reactively
 */
export function useFlag(key: FeatureFlagKey): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}
