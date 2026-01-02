/**
 * useFeatureFlag Hook
 * ===================
 * React hook for checking feature flag status in components.
 * Integrates with FeatureFlagContext for user context.
 */

import { useMemo } from 'react';
import { useFeatureFlagContext } from '@/context/FeatureFlagContext';
import {
  FeatureFlags,
  isFeatureEnabled,
  getEnabledFeatures,
} from '@/lib/featureFlags';

/**
 * Check if a specific feature flag is enabled
 *
 * @param flag - The feature flag to check
 * @returns true if the feature is enabled for the current user
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isCustomDomainsEnabled = useFeatureFlag(FeatureFlags.CUSTOM_DOMAINS);
 *
 *   if (!isCustomDomainsEnabled) {
 *     return <div>Custom domains coming soon!</div>;
 *   }
 *
 *   return <CustomDomainsSettings />;
 * }
 * ```
 */
export function useFeatureFlag(flag: FeatureFlags): boolean {
  const { userId } = useFeatureFlagContext();

  return useMemo(() => {
    return isFeatureEnabled(flag, userId);
  }, [flag, userId]);
}

/**
 * Get all enabled feature flags for the current user
 *
 * @returns Array of enabled feature flags
 *
 * @example
 * ```tsx
 * function FeatureDebug() {
 *   const enabledFeatures = useEnabledFeatures();
 *
 *   return (
 *     <div>
 *       <h3>Enabled Features:</h3>
 *       <ul>
 *         {enabledFeatures.map(flag => (
 *           <li key={flag}>{flag}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnabledFeatures(): FeatureFlags[] {
  const { userId } = useFeatureFlagContext();

  return useMemo(() => {
    return getEnabledFeatures(userId);
  }, [userId]);
}

/**
 * Check multiple feature flags at once
 *
 * @param flags - Array of feature flags to check
 * @returns Object with flag names as keys and boolean values
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const flags = useFeatureFlags([
 *     FeatureFlags.CUSTOM_DOMAINS,
 *     FeatureFlags.ANALYTICS_V2
 *   ]);
 *
 *   return (
 *     <div>
 *       {flags.CUSTOM_DOMAINS && <CustomDomainsCard />}
 *       {flags.ANALYTICS_V2 && <AnalyticsV2Dashboard />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlags<T extends FeatureFlags[]>(
  flags: T
): Record<T[number], boolean> {
  const { userId } = useFeatureFlagContext();

  return useMemo(() => {
    const result = {} as Record<T[number], boolean>;

    for (const flag of flags) {
      result[flag as T[number]] = isFeatureEnabled(flag, userId);
    }

    return result;
  }, [flags, userId]);
}

// Re-export FeatureFlags enum for convenience
export { FeatureFlags };
