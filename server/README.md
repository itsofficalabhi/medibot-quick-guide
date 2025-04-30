
# MediClinic Backend

This is the backend server for the MediClinic healthcare platform.

## Setup

1. Install dependencies:
```
cd server
npm install
```

2. Create a `.env` file:
```
cp .env.example .env
```

3. Configure MongoDB:
   - For local development: Make sure MongoDB is installed and running on your machine.
   - For production: Update the MONGODB_URI in .env to point to your MongoDB Atlas cluster or other cloud database.

## Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login a user
- GET `/api/auth/:id` - Get user by ID

### Doctors
- GET `/api/doctors` - Get all doctors
- GET `/api/doctors/:id` - Get doctor by ID
- POST `/api/doctors` - Create or update doctor profile

### Appointments
- GET `/api/appointments/patient/:patientId` - Get appointments by patient ID
- GET `/api/appointments/doctor/:doctorId` - Get appointments by doctor ID
- POST `/api/appointments` - Create a new appointment
- PUT `/api/appointments/:id` - Update appointment status
- DELETE `/api/appointments/:id` - Delete an appointment

### Prescriptions
- GET `/api/prescriptions/patient/:patientId` - Get prescriptions by patient ID
- GET `/api/prescriptions/doctor/:doctorId` - Get prescriptions by doctor ID
- POST `/api/prescriptions` - Create a new prescription
- GET `/api/prescriptions/:id` - Get prescription by ID
