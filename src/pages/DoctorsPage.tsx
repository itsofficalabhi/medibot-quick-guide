
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { doctors, specialties } from '@/data/doctorsData';
import { Search } from 'lucide-react';

const DoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const filteredDoctors = doctors.filter(doctor => {
    // Filter by search term
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by specialty
    const matchesSpecialty = selectedSpecialty === '' || doctor.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Doctors</h1>
        <p className="text-muted-foreground max-w-2xl">
          Find and book appointments with qualified doctors for online consultations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
        {/* Filters - Desktop */}
        <div className="hidden md:block md:col-span-3">
          <div className="sticky top-24">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-lg mb-4">Filter Doctors</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium mb-2">
                  Search
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              {/* Specialty Filter */}
              <div className="mb-6">
                <label htmlFor="specialty" className="block text-sm font-medium mb-2">
                  Specialty
                </label>
                <div className="grid gap-2">
                  <div 
                    className={`cursor-pointer px-3 py-2 rounded-md text-sm ${selectedSpecialty === '' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedSpecialty('')}
                  >
                    All Specialties
                  </div>
                  {specialties.map((specialty) => (
                    <div 
                      key={specialty}
                      className={`cursor-pointer px-3 py-2 rounded-md text-sm ${selectedSpecialty === specialty ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedSpecialty(specialty)}
                    >
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Filters */}
        <div className="md:hidden w-full mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              <Button 
                variant={selectedSpecialty === '' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedSpecialty('')}
              >
                All
              </Button>
              {specialties.map((specialty) => (
                <Button 
                  key={specialty}
                  variant={selectedSpecialty === specialty ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedSpecialty(specialty)}
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Listings */}
        <div className="md:col-span-9">
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDoctors.map(doctor => (
                <Link key={doctor.id} to={`/doctors/${doctor.id}`}>
                  <Card className="overflow-hidden border hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3 h-40 sm:h-auto">
                          <img 
                            src={doctor.profileImage} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover aspect-square"
                          />
                        </div>
                        <div className="p-5 flex-grow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{doctor.name}</h3>
                              <p className="text-primary text-sm mb-1">{doctor.specialty}</p>
                              <div className="flex items-center gap-1 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? "text-yellow-400" : "text-muted"}`} viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">({doctor.reviewCount})</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-sm">${doctor.consultationFee}</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{doctor.about}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">{doctor.experience} years exp.</div>
                            <Button size="sm">Book Now</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">No doctors found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
