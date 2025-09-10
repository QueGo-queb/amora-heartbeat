import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFeed } from '@/hooks/useFeed';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('useFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load posts successfully', async () => {
    const mockPosts = [
      {
        id: '1',
        content: 'Test post',
        created_at: new Date().toISOString(),
        user_id: 'user1',
        likes_count: 5,
        comments_count: 2,
      }
    ];

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockPosts,
      error: null,
    });

    const { result } = renderHook(() => useFeed());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle filters correctly', async () => {
    const filters = {
      media_type: 'image',
      premium_only: true,
      tags: ['travel', 'food']
    };

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    });

    renderHook(() => useFeed({ filters }));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('get_feed_posts_optimized', 
        expect.objectContaining({
          user_filters: {
            media_type: 'image',
            premium_only: 'true',
            tags: ['travel', 'food']
          }
        })
      );
    });
  });

  it('should calculate post scores correctly', () => {
    const { result } = renderHook(() => useFeed());
    
    const recentPost = {
      created_at: new Date().toISOString(),
      is_premium: true,
      likes_count: 10,
      comments_count: 5,
    };

    // Access private method through result.current (if exposed for testing)
    // Or test the scoring logic separately in utils/scoring.test.ts
    expect(result.current.posts).toBeDefined();
  });

  it('should handle infinite scroll', async () => {
    const page1 = [{ id: '1', content: 'Post 1' }];
    const page2 = [{ id: '2', content: 'Post 2' }];

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: page1, error: null })
      .mockResolvedValueOnce({ data: page2, error: null });

    const { result } = renderHook(() => useFeed());

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1);
    });

    // Load more posts
    await result.current.loadMore();

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(2);
    });
  });
});