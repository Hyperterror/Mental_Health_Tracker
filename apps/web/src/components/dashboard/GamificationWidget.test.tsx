import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GamificationWidget } from './GamificationWidget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('GamificationWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders loading skeleton initially', () => {
    vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {})); 
    
    const { container } = renderWithClient(<GamificationWidget />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders correctly with user gamification data', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { level: 5, xp: 2500, streak: 12 } },
    });
    
    renderWithClient(<GamificationWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Progress')).toBeInTheDocument();
      // Level is 5
      expect(screen.getByText('5')).toBeInTheDocument();
      // Streak is 12
      expect(screen.getByText('12')).toBeInTheDocument();
      // XP display: 2500 / 5000 XP
      expect(screen.getByText('2500 / 5000 XP')).toBeInTheDocument();
    });
  });

  it('defaults to level 1 and 0 streak if missing', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { xp: 500 } }, // Missing level and streak
    });
    
    renderWithClient(<GamificationWidget />);
    
    await waitFor(() => {
      // Level 1 default
      expect(screen.getByText('1')).toBeInTheDocument();
      // Streak 0 default
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('500 / 1000 XP')).toBeInTheDocument();
    });
  });
});
