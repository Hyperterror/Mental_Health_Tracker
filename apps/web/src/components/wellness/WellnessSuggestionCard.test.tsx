import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WellnessSuggestionCard } from './WellnessSuggestionCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

// Mock axios client
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('WellnessSuggestionCard', () => {
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

  it('renders loading state initially', () => {
    vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const { container } = renderWithClient(<WellnessSuggestionCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders nothing if no markdown is returned', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: null } });
    
    const { container } = renderWithClient(<WellnessSuggestionCard />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders sanitized markdown when data is fetched', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { markdown: '**Take a deep breath**' } },
    });
    
    renderWithClient(<WellnessSuggestionCard />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Wellness Insight')).toBeInTheDocument();
      // "Take a deep breath" will be wrapped in <strong> by marked
      expect(screen.getByText('Take a deep breath')).toBeInTheDocument();
      expect(screen.getByText('Take a deep breath').tagName).toBe('STRONG');
    });
  });
});
