/**
 * Feature Flag Context
 * ====================
 * React context provider for feature flags.
 * Provides user context for percentage rollout and allowlist features.
 *
 * @example
 * ```tsx
 * // In your app root
 * function App() {
 *   const { user } = useAuth(); // Your auth hook
 *
 *   return (
 *     <FeatureFlagProvider userId={user?.id}>
 *       <YourApp />
 *     </FeatureFlagProvider>
 *   );
 * }
 *
 * // In a component
 * function SettingsPage() {
 *   const isCustomDomainsEnabled = useFeatureFlag(FeatureFlags.CUSTOM_DOMAINS);
 *   // ...
 * }
 * ```
 */

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

/**
 * Context value type
 */
interface FeatureFlagContextValue {
  /**
   * Current user ID for feature flag evaluation
   * When set, enables percentage rollout and allowlist features
   */
  userId: string | undefined;
}

/**
 * Props for FeatureFlagProvider
 */
interface FeatureFlagProviderProps {
  /**
   * Current user ID for feature flag evaluation
   * Pass undefined when user is not authenticated
   */
  userId?: string;

  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * Default context value (no user)
 */
const defaultContextValue: FeatureFlagContextValue = {
  userId: undefined,
};

/**
 * Feature flag context
 */
const FeatureFlagContext = createContext<FeatureFlagContextValue>(
  defaultContextValue
);

/**
 * Feature flag provider component
 *
 * Wrap your app with this provider to enable user-specific feature flags.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { user } = useAuth();
 *
 *   return (
 *     <FeatureFlagProvider userId={user?.id}>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </FeatureFlagProvider>
 *   );
 * }
 * ```
 */
export function FeatureFlagProvider({
  userId,
  children,
}: FeatureFlagProviderProps): React.ReactElement {
  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      userId,
    }),
    [userId]
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access the feature flag context
 *
 * @returns The feature flag context value
 * @throws Error if used outside of FeatureFlagProvider
 */
export function useFeatureFlagContext(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);

  // Note: We don't throw here because the default context is valid
  // This allows the feature flags to work without a provider (global flags only)
  return context;
}

/**
 * HOC to inject feature flag context into class components
 *
 * @example
 * ```tsx
 * class MyComponent extends React.Component<{ featureFlagContext: FeatureFlagContextValue }> {
 *   render() {
 *     const { userId } = this.props.featureFlagContext;
 *     // ...
 *   }
 * }
 *
 * export default withFeatureFlagContext(MyComponent);
 * ```
 */
export function withFeatureFlagContext<P extends object>(
  Component: React.ComponentType<P & { featureFlagContext: FeatureFlagContextValue }>
): React.FC<Omit<P, 'featureFlagContext'>> {
  const WrappedComponent: React.FC<Omit<P, 'featureFlagContext'>> = (props) => {
    const context = useFeatureFlagContext();
    return <Component {...(props as P)} featureFlagContext={context} />;
  };

  WrappedComponent.displayName = `withFeatureFlagContext(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// Re-export types
export type { FeatureFlagContextValue, FeatureFlagProviderProps };
