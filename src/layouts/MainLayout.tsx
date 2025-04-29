
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MainLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/dashboard';
    return user?.role === 'doctor' ? '/doctor-dashboard' : '/user-dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-card z-30">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6 text-lg font-semibold">
            <Link to="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6 text-primary"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="hidden md:inline-block">MediClinic</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4 text-sm">
              <Link
                to="/"
                className={`${
                  location.pathname === '/'
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                } hover:text-primary transition-colors`}
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className={`${
                  location.pathname.includes('/doctors')
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                } hover:text-primary transition-colors`}
              >
                Find Doctors
              </Link>
              {isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className={`${
                    location.pathname.includes('dashboard')
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  } hover:text-primary transition-colors`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/chat"
                className={`${
                  location.pathname === '/chat'
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                } hover:text-primary transition-colors`}
              >
                Chat Support
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <ModeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-default">
                    <div>
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            
            <div className="block md:hidden">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t py-6 md:py-10">
        <div className="container px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">MediClinic</h3>
              <p className="text-sm text-muted-foreground">
                Providing quality healthcare through telemedicine services.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/doctors" className="text-muted-foreground hover:text-primary transition-colors">
                    Find Doctors
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Services</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">Video Consultations</li>
                <li className="text-muted-foreground">Chat with Doctors</li>
                <li className="text-muted-foreground">Health Records</li>
                <li className="text-muted-foreground">Prescriptions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <address className="not-italic text-sm text-muted-foreground">
                <p className="mb-2">123 Health Street</p>
                <p className="mb-2">San Francisco, CA 94103</p>
                <p className="mb-2">Email: info@mediclinic.com</p>
                <p>Phone: +1 (555) 123-4567</p>
              </address>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MediClinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
