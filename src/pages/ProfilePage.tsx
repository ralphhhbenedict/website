/**
 * ProfilePage - Dynamic Profile Page
 * ===================================
 * GREEN PHASE: Minimum implementation to pass tests.
 *
 * A dynamic profile page that:
 * 1. Uses domain detection from src/lib/domain.ts
 * 2. Fetches profile data from /api/profile/[username]
 * 3. Assembles existing components: ProfileDashboard, CareerTimeline, CaseStudies, SevenHats, HowIWork
 */

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDomainType, getUsername, isCustomDomain } from '@/lib/domain';
import type { ProfileData } from '@/lib/api';

// Import profile components
import ProfileDashboard from '@/components/ProfileDashboard';
import { CareerTimeline } from '@/components/CareerTimeline';
import { CaseStudies } from '@/components/CaseStudies';
import { SevenHats } from '@/components/SevenHats';
import { HowIWork } from '@/components/HowIWork';

// Loading skeleton component
const ProfileLoading = () => (
  <div
    data-testid="profile-loading"
    aria-busy="true"
    aria-label="Loading profile"
    className="min-h-screen bg-background flex items-center justify-center"
  >
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p className="text-muted-foreground">Loading profile...</p>
    </div>
  </div>
);

// Error component for profile not found
const ProfileNotFound = ({ username }: { username: string }) => (
  <div
    data-testid="profile-not-found"
    className="min-h-screen bg-background flex items-center justify-center"
  >
    <div className="text-center space-y-4 max-w-md px-4">
      <div className="text-6xl">404</div>
      <h1 className="text-2xl font-bold">Profile Not Found</h1>
      <p className="text-muted-foreground">
        The profile for <span className="font-mono">@{username}</span> does not exist or has been removed.
      </p>
    </div>
  </div>
);

// Generic error component
const ProfileError = ({ message }: { message?: string }) => (
  <div
    data-testid="profile-error"
    className="min-h-screen bg-background flex items-center justify-center"
  >
    <div className="text-center space-y-4 max-w-md px-4">
      <div className="text-6xl text-destructive">!</div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">
        {message || 'Unable to load this profile. Please try again later.'}
      </p>
    </div>
  </div>
);

/**
 * Fetch profile data from API
 */
async function fetchProfile(username: string): Promise<ProfileData> {
  const response = await fetch(`/api/profile/${username.toLowerCase()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to fetch profile: ${response.status}`);
  }

  return response.json();
}

/**
 * Resolve username from URL params or domain
 */
function useResolvedUsername(): string | null {
  // :profile param includes the @ symbol (e.g., "@username")
  const { profile } = useParams<{ profile: string }>();

  // Get hostname safely (for SSR compatibility)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // First, check URL params (/@username route)
  // Extract username by removing the @ prefix
  if (profile && profile.startsWith('@')) {
    return profile.slice(1).toLowerCase();
  }

  // If on a custom domain, resolve username from domain
  if (isCustomDomain(hostname)) {
    const domainUsername = getUsername(pathname, hostname);
    return domainUsername?.toLowerCase() || null;
  }

  // Try to extract from path using domain detection
  const pathUsername = getUsername(pathname, hostname);
  return pathUsername?.toLowerCase() || null;
}

/**
 * ProfilePage Component
 *
 * Renders a dynamic profile page based on username from URL or domain.
 * Uses React Query for data fetching with caching.
 */
export default function ProfilePage() {
  const username = useResolvedUsername();

  // Use React Query for data fetching
  const {
    data: profile,
    isLoading,
    isError,
    error
  } = useQuery<ProfileData, Error>({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username!),
    enabled: !!username, // Only fetch if we have a username
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Handle no username case
  if (!username) {
    return <ProfileError message="No username provided. Please specify a profile to view." />;
  }

  // Handle loading state
  if (isLoading) {
    return <ProfileLoading />;
  }

  // Handle errors
  if (isError) {
    const errorMessage = error?.message || '';

    // Check if it's a 404 error
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return <ProfileNotFound username={username} />;
    }

    return <ProfileError message={errorMessage} />;
  }

  // Handle no profile data
  if (!profile) {
    return <ProfileNotFound username={username} />;
  }

  // Render profile with components
  return (
    <main className="min-h-screen bg-background">
      {/* ProfileDashboard is the main component that already includes
          CaseStudies, SevenHats, and HowIWork in its tabs */}
      <ProfileDashboard />
    </main>
  );
}
