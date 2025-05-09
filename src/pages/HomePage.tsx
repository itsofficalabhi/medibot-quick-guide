import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MessageSquare, Video, Clock, CheckCircle } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Slider } from '@/components/ui/slider';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Healthcare at Your <span className="text-primary">Fingertips</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                Access quality healthcare from the comfort of your home through our telemedicine services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/doctors">
                  <Button size="lg" className="w-full sm:w-auto">Find a Doctor</Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Sign Up Now</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
                alt="Doctor using telemedicine" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Doctors Online Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Now with Marquee Slider */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer a range of remote healthcare services to meet your needs.
            </p>
          </div>
          
          <Carousel
            opts={{ align: "start" }}
            autoplay={true} // Enable autoplay
            interval={5000} // 5 seconds per slide
            className="w-full mx-auto"
          >
            <CarouselContent>
              {/* Video Consultations */}
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4 pl-4">
                <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="p-3 bg-primary/10 rounded-full mb-4">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Video Consultations</h3>
                      <p className="text-muted-foreground">
                        Connect with doctors face-to-face through secure video calls.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              
              {/* Chat Consultations */}
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4 pl-4">
                <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="p-3 bg-primary/10 rounded-full mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Chat Consultations</h3>
                      <p className="text-muted-foreground">
                        Message doctors directly for non-urgent medical advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              
              {/* Easy Scheduling */}
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4 pl-4">
                <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="p-3 bg-primary/10 rounded-full mb-4">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
                      <p className="text-muted-foreground">
                        Book appointments that fit your schedule with easy rescheduling.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Additional Services */}
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4 pl-4">
                <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="p-3 bg-primary/10 rounded-full mb-4">
                        <Clock className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                      <p className="text-muted-foreground">
                        Get medical assistance any time of day or night with our round-the-clock support.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              
              {/* Duplicate cards to create continuous effect */}
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4 pl-4">
                <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="p-3 bg-primary/10 rounded-full mb-4">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Video Consultations</h3>
                      <p className="text-muted-foreground">
                        Connect with doctors face-to-face through secure video calls.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              
              <CarouselItem className="basis-full md:basis-1/3 lg:basis-1/4 pl-4">
                <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="p-3 bg-primary/10 rounded-full mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Chat Consultations</h3>
                      <p className="text-muted-foreground">
                        Message doctors directly for non-urgent medical advice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Book Appointment Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Book Your Appointment Today</h2>
              <p className="text-muted-foreground mb-8">
                Schedule a consultation with one of our specialists and get the care you need without leaving home.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <p>Choose from a wide range of specialists</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <p>Flexible scheduling options</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <p>Secure video or chat consultations</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <p>Digital prescriptions when appropriate</p>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/doctors">
                  <Button size="lg">Find and Book a Doctor</Button>
                </Link>
              </div>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-md">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold">Quick Appointment</h3>
                <p className="text-muted-foreground">Select a specialty to get started</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button variant="outline" className="justify-start">
                  <span className="flex items-center">
                    General Medicine
                  </span>
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="flex items-center">
                    Dermatology
                  </span>
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="flex items-center">
                    Pediatrics
                  </span>
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="flex items-center">
                    Mental Health
                  </span>
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="flex items-center">
                    Cardiology
                  </span>
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="flex items-center">
                    All Specialties
                  </span>
                </Button>
              </div>
              <Link to="/doctors">
                <Button className="w-full">View Available Doctors</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Now with Marquee Slider */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Patients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear about experiences from patients who have used our telemedicine services.
            </p>
          </div>
          
          <Carousel
            opts={{ align: "start" }}
            autoplay={true} // Enable autoplay
            interval={4000} // 4 seconds per slide
            className="w-full"
          >
            <CarouselContent>
              {[1, 2, 3, 4, 5].map((i, index) => (
                <CarouselItem key={`testimonial-${i}-${index}`} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
                  <Card className="border border-border h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-primary" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-foreground italic">
                          {i === 1 
                            ? "The doctor was very attentive and helpful. The video quality was excellent and I felt like I was in an actual doctor's office."
                            : i === 2 
                            ? "I was skeptical about telemedicine at first, but after my consultation, I'm convinced this is the future of healthcare. So convenient!"
                            : i === 3 
                            ? "Being able to talk to a doctor from home saved me so much time and stress. The prescription was sent directly to my pharmacy."
                            : i === 4 
                            ? "The platform is so easy to use, even for someone like me who isn't tech-savvy. Scheduling an appointment took less than a minute."
                            : "I love that I can access my medical records and past consultations anytime. Makes it easy to track my health progress."
                          }
                        </p>
                        <div className="flex items-center pt-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {String.fromCharCode(64 + i)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">Patient {i}</h4>
                            <p className="text-sm text-muted-foreground">
                              {i % 2 === 0 ? "Chat Consultation" : "Video Consultation"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
          
          {/* Patient Satisfaction Slider - With Slower Animation */}
          <div className="max-w-md mx-auto mt-12 text-center">
            <h3 className="font-medium mb-4">Patient Satisfaction</h3>
            <Slider
              defaultValue={[96]}
              max={100}
              step={1}
              disabled
              animated={true}
              animationSpeed={400} // Slower animation
              className="w-full"
            />
            <p className="mt-2 text-sm text-muted-foreground">96% of our patients are satisfied with our services</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
            Ready to experience healthcare from home?
          </h2>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Create Your Account Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
