
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
    
  // Admin-specific endpoints
  getAllUsers: () => 
    api.get('/auth/users'),
    
  updateUser: (id: string, userData: any) => 
    api.put(`/auth/${id}`, userData),
    
  deleteUser: (id: string) => 
    api.delete(`/auth/${id}`),
    
  createAdmin: (adminData: any) => 
    api.post('/auth/admin', adminData),
};

// Doctors API
export const doctorsAPI = {
  getAllDoctors: () => 
    api.get('/doctors'),
  
  getDoctorById: (id: string) => 
    api.get(`/doctors/${id}`),
  
  createOrUpdateDoctor: (doctorData: any) => 
    api.post('/doctors', doctorData),
    
  deleteDoctor: (id: string) => 
    api.delete(`/doctors/${id}`),
    
  getDoctorPatients: (doctorId: string) =>
    api.get(`/doctors/${doctorId}/patients`),
    
  addPatient: (patientData: any) =>
    api.post('/doctors/add-patient', patientData),
    
  // New method to update doctor signature
  updateDoctorSignature: (doctorId: string, signatureUrl: string) =>
    api.patch(`/doctors/${doctorId}/signature`, { signature: signatureUrl }),
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
    
  // Admin-specific endpoint
  getAllAppointments: () =>
    api.get('/appointments'),
    
  // New endpoint for billing data
  getDoctorBilling: (doctorId: string, fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    
    return api.get(`/appointments/doctor/${doctorId}/billing?${params.toString()}`);
  }
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
    
  updatePrescriptionSignature: (id: string, signature: string) =>
    api.patch(`/prescriptions/${id}/signature`, { signature }),
    
  // Admin-specific endpoint
  getAllPrescriptions: () =>
    api.get('/prescriptions'),
};

// Chat API using Custom NLP engine
export const chatAPI = {
  sendMessage: (message: string, sessionId?: string) => 
    api.post('/chat/process', { message, sessionId }),
    
  logChat: (sessionId: string, message: string, response: string, userId?: string) =>
    api.post('/chat/log', { sessionId, message, response, userId }),
    
  getChatAnalytics: () =>
    api.get('/chat/analytics'),
};

// Admin API for system management
export const adminAPI = {
  getDashboardStats: () =>
    api.get('/admin/stats'),
    
  getSystemLogs: (page = 1, limit = 50) =>
    api.get(`/admin/logs?page=${page}&limit=${limit}`),
    
  getUserActivity: (userId: string) =>
    api.get(`/admin/activity/${userId}`),
    
  getSystemSettings: () =>
    api.get('/admin/settings'),
    
  updateSystemSettings: (settings: any) =>
    api.put('/admin/settings', settings),
    
  // New endpoints for doctor approval
  getPendingDoctors: () => 
    api.get('/admin/pending-doctors'),
    
  approveDoctorRegistration: (doctorId: string) =>
    api.post(`/admin/approve-doctor/${doctorId}`),
    
  rejectDoctorRegistration: (doctorId: string, reason?: string) =>
    api.post(`/admin/reject-doctor/${doctorId}`, { reason }),
};

export default api;
