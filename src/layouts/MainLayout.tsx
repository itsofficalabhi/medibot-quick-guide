
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Menu, X, Phone, MessageSquare, Calendar, User } from 'lucide-react';
import Footer from '@/components/Footer';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary mr-2"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="text-xl font-semibold text-primary">MediClinic</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">Home</Link>
            <Link to="/doctors" className="text-foreground/70 hover:text-foreground transition-colors">Doctors</Link>
            <Link to="/chat" className="text-foreground/70 hover:text-foreground transition-colors">AI Assistant</Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            {isDesktop ? (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !isDesktop && (
          <div className="container pb-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="flex items-center py-2" onClick={toggleMobileMenu}>Home</Link>
              <Link to="/doctors" className="flex items-center py-2" onClick={toggleMobileMenu}>Doctors</Link>
              <Link to="/chat" className="flex items-center py-2" onClick={toggleMobileMenu}>AI Assistant</Link>
              <div className="border-t pt-4 mt-2">
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={toggleMobileMenu}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register" onClick={toggleMobileMenu}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
