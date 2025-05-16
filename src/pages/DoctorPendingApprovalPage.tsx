
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const DoctorPendingApprovalPage: React.FC = () => {
  const { logout } = useAuth();
  
  return (
    <div className="container max-w-md mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Application Under Review</CardTitle>
          <CardDescription>
            Your doctor application has been submitted
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
          <p className="mb-6">
            Thank you for applying to join MediClinic as a doctor. Your application is currently being reviewed by our administrators.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            This process typically takes 1-2 business days. You will receive an email notification once your application has been approved.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={logout}>
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DoctorPendingApprovalPage;
