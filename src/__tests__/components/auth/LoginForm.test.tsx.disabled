import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Auth from '@/pages/Auth';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

// Mock hooks
vi.mock('@/hooks/use-loader', () => ({
  useLoader: () => ({
    showLoader: vi.fn(),
    hideLoader: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );
};

describe('Auth - Login Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderAuth();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderAuth();
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });
    
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);
    
    renderAuth();
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error for invalid credentials', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });
    
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn);
    
    renderAuth();
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
    });
  });
});