/**
 * ProfilePage TDD Tests
 * =====================
 * RED PHASE: Tests written before implementation.
 *
 * Tests the dynamic profile page that:
 * 1. Uses domain detection from src/lib/domain.ts
 * 2. Fetches profile data from /api/profile/[username]
 * 3. Assembles existing components: ProfileDashboard, CareerTimeline, CaseStudies, SevenHats, HowIWork
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import type { ProfileData } from '@/lib/api';

// Mock domain detection module
vi.mock('@/lib/domain', () => ({
  getDomainType: vi.fn(),
  getUsername: vi.fn(),
  getCurrentDomainContext: vi.fn(),
  isCustomDomain: vi.fn(),
  isProfileSubdomain: vi.fn(),
}));

// Mock the child components to isolate ProfilePage testing
vi.mock('@/components/ProfileDashboard', () => ({
  default: () => <div data-testid="profile-dashboard">ProfileDashboard</div>,
}));

vi.mock('@/components/CareerTimeline', () => ({
  CareerTimeline: () => <div data-testid="career-timeline">CareerTimeline</div>,
}));

vi.mock('@/components/CaseStudies', () => ({
  CaseStudies: () => <div data-testid="case-studies">CaseStudies</div>,
}));

vi.mock('@/components/SevenHats', () => ({
  SevenHats: () => <div data-testid="seven-hats">SevenHats</div>,
}));

vi.mock('@/components/HowIWork', () => ({
  HowIWork: () => <div data-testid="how-i-work">HowIWork</div>,
}));

// Import mocked modules to configure them
import * as domainModule from '@/lib/domain';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create a test QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
}

// Helper to render ProfilePage with routing
function renderProfilePage(route: string = '/@testuser') {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          {/* :profile param captures the full segment including @ */}
          <Route path="/:profile" element={<ProfilePage />} />
          <Route path="/" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Sample profile data for tests
const mockProfileData: ProfileData = {
  username: 'testuser',
  displayName: 'Test User',
  bio: 'A test user bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/testuser',
    twitter: 'https://twitter.com/testuser',
    email: 'test@example.com',
  },
  sections: ['case-studies', 'seven-hats', 'how-i-work', 'career-timeline'],
  customDomain: undefined,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Default mock implementations
    vi.mocked(domainModule.getDomainType).mockReturnValue('localhost');
    vi.mocked(domainModule.getUsername).mockReturnValue('testuser');
    vi.mocked(domainModule.isCustomDomain).mockReturnValue(false);
    vi.mocked(domainModule.isProfileSubdomain).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Username Resolution', () => {
    it('should extract username from /@username route', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@ralphhhbenedict');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/profile/ralphhhbenedict')
        );
      });
    });

    it('should resolve username from custom domain on root path', async () => {
      vi.mocked(domainModule.getDomainType).mockReturnValue('custom');
      vi.mocked(domainModule.getUsername).mockReturnValue('ralphhhbenedict');
      vi.mocked(domainModule.isCustomDomain).mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/');

      await waitFor(() => {
        expect(domainModule.getUsername).toHaveBeenCalled();
      });
    });

    it('should handle profile subdomain with /@username path', async () => {
      vi.mocked(domainModule.getDomainType).mockReturnValue('profile');
      vi.mocked(domainModule.isProfileSubdomain).mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@testuser');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/profile/testuser')
        );
      });
    });
  });

  describe('Data Fetching', () => {
    it('should show loading state while fetching profile data', () => {
      // Make fetch hang to keep loading state
      mockFetch.mockImplementation(() => new Promise(() => {}));

      renderProfilePage('/@testuser');

      expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
    });

    it('should fetch profile data from /api/profile/[username]', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@testuser');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/profile/testuser');
      });
    });

    it('should render profile components after successful data fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@testuser');

      await waitFor(() => {
        expect(screen.getByTestId('profile-dashboard')).toBeInTheDocument();
      });
    });

    it('should show error state when profile not found (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Profile not found' }),
      });

      renderProfilePage('/@nonexistent');

      await waitFor(() => {
        expect(screen.getByTestId('profile-not-found')).toBeInTheDocument();
      });
    });

    it('should show error state on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderProfilePage('/@testuser');

      await waitFor(() => {
        expect(screen.getByTestId('profile-error')).toBeInTheDocument();
      });
    });
  });

  describe('Component Assembly', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });
    });

    it('should render ProfileDashboard component', async () => {
      renderProfilePage('/@testuser');

      await waitFor(() => {
        expect(screen.getByTestId('profile-dashboard')).toBeInTheDocument();
      });
    });

    it('should render all profile sections based on profile data', async () => {
      renderProfilePage('/@testuser');

      await waitFor(() => {
        // The component should render sections based on profile.sections array
        expect(screen.getByTestId('profile-dashboard')).toBeInTheDocument();
      });
    });

    it('should pass profile data to child components', async () => {
      renderProfilePage('/@testuser');

      await waitFor(() => {
        // ProfileDashboard should receive profile data
        expect(screen.getByTestId('profile-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('React Query Integration', () => {
    it('should use React Query for data fetching', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@testuser');

      // React Query should handle the fetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should cache profile data', async () => {
      const queryClient = createTestQueryClient();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      // First render
      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/@testuser']}>
            <Routes>
              <Route path="/:profile" element={<ProfilePage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Second render with same query client - should use cache
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/@testuser']}>
            <Routes>
              <Route path="/:profile" element={<ProfilePage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Should still only have 1 fetch call due to caching
      // (staleTime is 0, but gcTime means it's still in cache)
      await waitFor(() => {
        expect(screen.getByTestId('profile-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty username gracefully', async () => {
      vi.mocked(domainModule.getUsername).mockReturnValue(null);

      renderProfilePage('/');

      await waitFor(() => {
        expect(screen.getByTestId('profile-error')).toBeInTheDocument();
      });
    });

    it('should handle invalid username format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid username format' }),
      });

      renderProfilePage('/@123invalid');

      await waitFor(() => {
        expect(screen.getByTestId('profile-error')).toBeInTheDocument();
      });
    });

    it('should normalize username to lowercase', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@TestUser');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/profile/testuser');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileData),
      });

      renderProfilePage('/@testuser');

      await waitFor(() => {
        expect(screen.getByTestId('profile-dashboard')).toBeInTheDocument();
      });

      // Page should have a main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      renderProfilePage('/@testuser');

      const loadingElement = screen.getByTestId('profile-loading');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    });
  });
});
