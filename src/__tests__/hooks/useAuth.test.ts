import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should set user when session exists', async () => {
    const mockUser = { 
      id: '123', 
      email: 'test@example.com' 
    };
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('should identify admin user correctly', async () => {
    const adminUser = { 
      id: '123', 
      email: 'clodenerc@yahoo.fr' 
    };
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: adminUser } },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAdminLegacy).toBe(true);
    });
  });

  it('should handle sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await result.current.signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle auth state changes', async () => {
    const mockCallback = vi.fn();
    
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderHook(() => useAuth());

    // Simulate sign out event
    mockCallback('SIGNED_OUT', null);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});