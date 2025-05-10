
import axios from 'axios';

// Use a deployed API URL instead of localhost
const API_URL = import.meta.env.VITE_API_URL || 'https://mediclinic-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediclinic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string, role: string = 'user', mobile?: string) => 
    api.post('/auth/register', { name, email, password, role, mobile }),
  
  getUser: (id: string) => 
    api.get(`/auth/${id}`),
};

// Doctors API
export const doctorsAPI = {
  getAllDoctors: () => 
    api.get('/doctors'),
  
  getDoctorById: (id: string) => 
    api.get(`/doctors/${id}`),
  
  createOrUpdateDoctor: (doctorData: any) => 
    api.post('/doctors', doctorData),
};

// Appointments API
export const appointmentsAPI = {
  getPatientAppointments: (patientId: string) => 
    api.get(`/appointments/patient/${patientId}`),
  
  getDoctorAppointments: (doctorId: string) => 
    api.get(`/appointments/doctor/${doctorId}`),
  
  createAppointment: (appointmentData: any) => 
    api.post('/appointments', appointmentData),
  
  updateAppointment: (id: string, updateData: any) => 
    api.put(`/appointments/${id}`, updateData),
  
  deleteAppointment: (id: string) => 
    api.delete(`/appointments/${id}`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getPatientPrescriptions: (patientId: string) => 
    api.get(`/prescriptions/patient/${patientId}`),
  
  getDoctorPrescriptions: (doctorId: string) => 
    api.get(`/prescriptions/doctor/${doctorId}`),
  
  createPrescription: (prescriptionData: any) => 
    api.post('/prescriptions', prescriptionData),
  
  getPrescriptionById: (id: string) => 
    api.get(`/prescriptions/${id}`),
};

// Chat API using OpenAI - simplified to always use OpenAI
export const chatAPI = {
  sendMessage: (message: string) => 
    api.post('/chat/openai', { message }),
};

export default api;
