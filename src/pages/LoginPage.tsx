
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginTab, setLoginTab] = useState('user');
  
  const from = (location.state as { from?: string })?.from || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const success = await login(email, password);
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage('Invalid email or password');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail('applied.abhishek@gmail.com');
    setPassword('admin');
    setLoginTab('admin');
  };

  const DemoAccounts = () => (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-2">Demo Accounts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-primary">Admin Account</h4>
          <div className="text-xs text-muted-foreground">
            <p>Email: applied.abhishek@gmail.com</p>
            <p>Password: admin</p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs" 
              onClick={handleAdminLogin}
            >
              Auto-fill
            </Button>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-primary">Doctor Accounts</h4>
          <div className="text-xs text-muted-foreground">
            <p>Email: doctor1@test.com</p>
            <p>Password: doctor123</p>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-primary">Patient Accounts</h4>
          <div className="text-xs text-muted-foreground">
            <p>Email: patient1@test.com</p>
            <p>Password: patient123</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <Card className="border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Log in to your MediClinic account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          
          <Tabs value={loginTab} onValueChange={setLoginTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="user">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium block mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          
          <DemoAccounts />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
