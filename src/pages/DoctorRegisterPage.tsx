
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const specialties = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Psychiatry',
  'Ophthalmology',
  'Gynecology',
  'Urology',
  'Oncology',
  'General Practice'
];

const DoctorRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [about, setAbout] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (!specialty) {
      setErrorMessage('Specialty is required');
      return;
    }

    if (!experience || isNaN(Number(experience)) || Number(experience) < 0) {
      setErrorMessage('Valid experience in years is required');
      return;
    }

    if (!consultationFee || isNaN(Number(consultationFee)) || Number(consultationFee) <= 0) {
      setErrorMessage('Valid consultation fee is required');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Register as a doctor - will be inactive until admin approval
      const success = await register(name, email, password, mobile, 'doctor');
      
      if (success) {
        // Create doctor profile data
        const doctorData = {
          specialty,
          experience: Number(experience),
          about,
          education: education.split(',').map(item => item.trim()),
          languages: languages.split(',').map(item => item.trim()),
          consultationFee: Number(consultationFee),
          phone: mobile,
          isActive: false // Default to inactive until admin approves
        };
        
        // Store doctor profile data to be linked to the user in the backend
        localStorage.setItem('pending_doctor_data', JSON.stringify(doctorData));
        
        toast.success("Registration Submitted", {
          description: "Your application has been submitted for admin approval."
        });
        navigate('/doctor-pending-approval');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Doctor Registration</CardTitle>
          <CardDescription>
            Create an account to join MediClinic as a healthcare provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Phone Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+1 123-456-7890"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select 
                  onValueChange={setSpecialty} 
                  defaultValue={specialty}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="languages">Languages (comma separated)</Label>
                <Input
                  id="languages"
                  type="text"
                  placeholder="English, Spanish, French"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="education">Education & Qualifications (comma separated)</Label>
                <Input
                  id="education"
                  type="text"
                  placeholder="MD Harvard Medical School, Residency Johns Hopkins"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="about">About & Professional Summary</Label>
                <Textarea
                  id="about"
                  placeholder="Briefly describe your professional background and expertise"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              By creating an account, you agree to our 
              <a href="#" className="text-primary hover:underline"> Terms of Service</a> and 
              <a href="#" className="text-primary hover:underline"> Privacy Policy</a>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DoctorRegisterPage;
