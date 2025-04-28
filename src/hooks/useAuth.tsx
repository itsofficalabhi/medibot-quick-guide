
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

// Test accounts data
const testAccounts = {
  doctors: [
    {
      id: 'doc1',
      email: 'doctor1@test.com',
      password: 'doctor123',
      name: 'Dr. Sarah Johnson',
      role: 'doctor' as const
    },
    {
      id: 'doc2',
      email: 'doctor2@test.com',
      password: 'doctor123',
      name: 'Dr. Michael Chen',
      role: 'doctor' as const
    }
  ],
  users: [
    {
      id: 'user1',
      email: 'patient1@test.com',
      password: 'patient123',
      name: 'John Smith',
      role: 'user' as const
    },
    {
      id: 'user2',
      email: 'patient2@test.com',
      password: 'patient123',
      name: 'Jane Doe',
      role: 'user' as const
    }
  ]
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check against test accounts
      const doctorAccount = testAccounts.doctors.find(
        doc => doc.email === email && doc.password === password
      );
      
      const userAccount = testAccounts.users.find(
        user => user.email === email && user.password === password
      );

      const account = doctorAccount || userAccount;

      if (account) {
        const { password: _, ...userInfo } = account;
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // For demo, create a new user account
      const newUser = {
        id: `user${Date.now()}`,
        name,
        email,
        role: 'user' as const
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const forgotPassword = async (email: string) => {
    // Mock forgot password functionality
    console.log(`Password reset email would be sent to ${email}`);
    return true;
  };

  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword
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
