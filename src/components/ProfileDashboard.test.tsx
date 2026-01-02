import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileDashboard from './ProfileDashboard';

// Mock mixpanel
vi.mock('@/lib/mixpanel', () => ({
  trackTabChanged: vi.fn(),
  trackShareClicked: vi.fn(),
  trackCTAClick: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProfileDashboard', () => {
  it('renders the profile name', () => {
    renderWithProviders(<ProfileDashboard />);
    expect(screen.getByText('Ralph Benedict Bautista')).toBeInTheDocument();
  });

  it('renders the current status', () => {
    renderWithProviders(<ProfileDashboard />);
    expect(screen.getByText(/Building 2 Startups/)).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    renderWithProviders(<ProfileDashboard />);
    expect(screen.getByText('Case Studies')).toBeInTheDocument();
    expect(screen.getByText('The 7 Hats')).toBeInTheDocument();
    expect(screen.getByText('How I Work')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    renderWithProviders(<ProfileDashboard />);
    expect(screen.getByText('See My Work')).toBeInTheDocument();
    // Multiple "Get in Touch" buttons may exist (header + footer), check at least one exists
    expect(screen.getAllByText('Get in Touch').length).toBeGreaterThan(0);
  });

  it('renders availability badge', () => {
    renderWithProviders(<ProfileDashboard />);
    expect(screen.getByText('Accepting 1 more client')).toBeInTheDocument();
  });
});
