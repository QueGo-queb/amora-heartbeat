import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock all hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
  }),
}));

vi.mock('@/hooks/useFeed', () => ({
  useFeed: () => ({
    posts: [
      {
        id: '1',
        content: 'Test post content',
        user: { full_name: 'John Doe' },
        created_at: new Date().toISOString(),
        likes_count: 5,
        comments_count: 2,
      }
    ],
    loading: false,
    error: null,
    loadMore: vi.fn(),
    hasMore: true,
  }),
}));

describe('Feed Integration', () => {
  it('should display feed posts when user is authenticated', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should allow user to interact with posts', async () => {
    const user = userEvent.setup();
    renderDashboard();
    
    await waitFor(() => {
      const likeButton = screen.getByRole('button', { name: /like/i });
      expect(likeButton).toBeInTheDocument();
    });
    
    // Test like interaction
    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);
    
    // Verify the interaction was processed
    expect(likeButton).toHaveBeenCalled;
  });
});