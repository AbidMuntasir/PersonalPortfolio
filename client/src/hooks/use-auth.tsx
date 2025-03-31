import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

type User = {
  id: number;
  username: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  interface SessionResponse {
    authenticated: boolean;
    user?: User;
  }

  // Check session status on mount
  const { data: sessionData } = useQuery<SessionResponse>({
    queryKey: ['/api/session'],
    refetchOnWindowFocus: true,
  });

  // Handle session data changes
  useEffect(() => {
    if (sessionData?.authenticated && sessionData?.user) {
      setUser(sessionData.user);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [sessionData]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(
        'POST',
        '/api/login',
        { username, password }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.user);
        queryClient.invalidateQueries({ queryKey: ['/api/session'] });
        toast({
          title: 'Login Successful',
          description: 'You are now logged in.',
        });
        return result;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Failed to login. Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/logout');
      const result = await response.json();
      
      if (result.success) {
        setUser(null);
        queryClient.invalidateQueries();
        toast({
          title: 'Logged out successfully',
          description: 'You have been logged out of the admin area.',
        });
        setLocation('/login');
      } else {
        throw new Error(result.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'Failed to logout. Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}