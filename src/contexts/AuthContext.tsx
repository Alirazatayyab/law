import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userService, UserProfile } from '../services/userService';
import { n8nService } from '../services/n8nService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: UserProfile }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: UserProfile };

const authReducer = (state: any, action: AuthAction): any => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return { 
        user: action.payload, 
        isAuthenticated: true, 
        isLoading: false 
      };
    case 'AUTH_FAILURE':
      return { 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      };
    case 'LOGOUT':
      return { 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: action.payload 
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored user data
        const storedUser = localStorage.getItem('pocketlaw_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Demo credentials
      if (email === 'umar@pocketlaw.com' && password === 'password') {
        const mockUser: UserProfile = {
          id: '1',
          email: 'umar@pocketlaw.com',
          name: 'Umar Khan',
          role: 'admin',
          department: 'Legal',
          phone: '+1 (555) 123-4567',
          bio: 'Legal professional with 10+ years of experience in contract management and corporate law.',
          createdAt: new Date('2023-01-01').toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        
        // Store user data
        localStorage.setItem('pocketlaw_user', JSON.stringify(mockUser));
        
        // Send N8N webhook for login
        await n8nService.systemLogin(mockUser);
        
        dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
        return;
      }

      // Additional demo users
      if (email === 'team@pocketlaw.com' && password === 'password') {
        const teamUser: UserProfile = {
          id: '2',
          email: 'team@pocketlaw.com',
          name: 'Team Member',
          role: 'team',
          department: 'Legal',
          phone: '+1 (555) 123-4568',
          bio: 'Team member focused on document management and client collaboration.',
          createdAt: new Date('2023-06-01').toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        
        localStorage.setItem('pocketlaw_user', JSON.stringify(teamUser));
        await n8nService.systemLogin(teamUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: teamUser });
        return;
      }

      if (email === 'client@pocketlaw.com' && password === 'password') {
        const clientUser: UserProfile = {
          id: '3',
          email: 'client@pocketlaw.com',
          name: 'Client User',
          role: 'client',
          department: 'External',
          phone: '+1 (555) 123-4569',
          bio: 'External client with limited access to assigned documents.',
          createdAt: new Date('2023-09-01').toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        
        localStorage.setItem('pocketlaw_user', JSON.stringify(clientUser));
        await n8nService.systemLogin(clientUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: clientUser });
        return;
      }

      throw new Error('Invalid credentials');
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Mock signup - in real app this would create a new user
      const newUser: UserProfile = {
        id: Date.now().toString(),
        email,
        name: userData.name || email.split('@')[0],
        role: 'team',
        department: userData.department || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      };

      localStorage.setItem('pocketlaw_user', JSON.stringify(newUser));
      await n8nService.systemLogin(newUser);
      dispatch({ type: 'AUTH_SUCCESS', payload: newUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.user) {
        await n8nService.systemLogout(state.user);
      }
    } catch (error) {
      console.error('Error sending logout webhook:', error);
    }
    
    localStorage.removeItem('pocketlaw_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: any) => {
    try {
      if (!state.user) throw new Error('No user logged in');
      
      const updatedUser = { ...state.user, ...userData, updatedAt: new Date().toISOString() };
      localStorage.setItem('pocketlaw_user', JSON.stringify(updatedUser));
      
      // Send N8N webhook for profile update
      await n8nService.userProfileUpdated(updatedUser, userData);
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};