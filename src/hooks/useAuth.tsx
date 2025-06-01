
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, mobile?: string, role?: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  isAdmin: () => boolean;
}

const AUTH_STORAGE_KEY = 'mediclinic_user';
const TOKEN_STORAGE_KEY = 'mediclinic_token';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data && response.data.user && response.data.token) {
        const userInfo = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        };
        
        setUser(userInfo);
        setToken(response.data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userInfo));
        localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        
        toast.success("Login Successful", {
          description: `Welcome back, ${response.data.user.name}!`
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, mobile?: string, role: string = 'user') => {
    try {
      const response = await authAPI.register(name, email, password, role, mobile);
      
      if (response.data && response.data.user && response.data.token) {
        const userInfo = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        };
        
        setUser(userInfo);
        setToken(response.data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userInfo));
        localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        
        toast.success(`${role === 'doctor' ? 'Doctor Registration' : 'Registration'} Successful`, {
          description: "Welcome to MediClinic!"
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('chat_session_id');
    
    toast.success("Logged Out", {
      description: "You have been successfully logged out."
    });
  };

  const forgotPassword = async (email: string) => {
    console.log(`Password reset email would be sent to ${email}`);
    
    toast.success("Password Reset Email Sent", {
      description: `Instructions have been sent to ${email}`
    });
    return true;
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    register,
    logout,
    forgotPassword,
    isAdmin
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
