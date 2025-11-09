
const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const { validationRules, checkValidationResult } = require('../middleware/validation');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email');
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor's appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.id })
      .populate('patientId', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update doctor profile
router.post('/', validationRules.doctorProfile, checkValidationResult, async (req, res) => {
  try {
    const {
      userId,
      specialty,
      experience,
      availability,
      education,
      languages,
      about,
      profileImage,
      consultationFee,
      phone,
      signature
    } = req.body;
    
    // Verify the user exists and is a doctor
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid user ID or not a doctor' });
    }
    
    // Check if doctor profile already exists
    let doctor = await Doctor.findOne({ userId });
    
    if (doctor) {
      // Update existing doctor
      doctor = await Doctor.findOneAndUpdate(
        { userId },
        { 
          specialty,
          experience,
          availability,
          education,
          languages,
          about,
          profileImage,
          consultationFee,
          phone,
          signature
        },
        { new: true }
      );
    } else {
      // Create new doctor profile
      doctor = new Doctor({
        userId,
        specialty,
        experience,
        availability,
        education,
        languages,
        about,
        profileImage,
        consultationFee,
        phone,
        signature
      });
      
      await doctor.save();
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor signature
router.patch('/:id/signature', async (req, res) => {
  try {
    const { signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ message: 'Signature is required' });
    }
    
    // Try to find by MongoDB ObjectId first
    let doctor = await Doctor.findById(req.params.id);
    
    // If not found, try to find by userId
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: req.params.id });
    }
    
    if (!doctor) {
      // Doctor not found, create a new one with minimal info
      doctor = new Doctor({
        userId: req.params.id,
        specialty: 'General',
        experience: 0,
        consultationFee: 0,
        signature
      });
      
      await doctor.save();
    } else {
      // Update existing doctor's signature
      doctor.signature = signature;
      await doctor.save();
    }
    
    res.json({ 
      message: 'Signature updated successfully',
      doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a patient user account (by doctor)
router.post('/add-patient', async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, address } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user with patient role
    user = new User({
      name,
      email,
      phone,
      password,
      role: 'patient'
    });
    
    // Hash password before saving (handled by User schema pre-save hook)
    const savedUser = await user.save();
    
    // Create patient medical profile with additional info
    const patientProfile = {
      userId: savedUser._id,
      dateOfBirth,
      address,
      medicalHistory: []
    };
    
    // In a real implementation, you'd save this to a Patient model
    // For now we'll just include it in the response
    
    res.status(201).json({ 
      message: 'Patient account created successfully',
      patient: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        dateOfBirth,
        address
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a doctor's patients (based on appointment history)
router.get('/:id/patients', async (req, res) => {
  try {
    // Find all appointments for this doctor
    const doctorId = req.params.id;
    
    // Check if valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(doctorId);
    
    let query = {};
    if (isValidObjectId) {
      query = { doctorId };
    } else {
      // If not a valid ObjectId, try to find doctor by userId
      const doctor = await Doctor.findOne({ userId: doctorId });
      if (doctor) {
        query = { doctorId: doctor._id };
      } else {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }
    
    const appointments = await Appointment.find(query);
    
    // Extract unique patient IDs
    const patientIds = [...new Set(appointments.map(apt => apt.patientId.toString()))];
    
    // Get patient details
    const patients = await User.find({
      _id: { $in: patientIds },
      role: 'patient'
    }).select('name email phone');
    
    // Add appointment count and last visit date for each patient
    const enhancedPatients = await Promise.all(patients.map(async (patient) => {
      const patientAppointments = appointments.filter(apt => 
        apt.patientId.toString() === patient._id.toString()
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const lastVisit = patientAppointments.length > 0 ? patientAppointments[0].date : null;
      
      return {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone || 'N/A',
        appointmentCount: patientAppointments.length,
        lastVisit
      };
    }));
    
    res.json(enhancedPatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor billing statistics
router.get('/:id/billing-stats', async (req, res) => {
  try {
    const { from, to } = req.query;
    const doctorId = req.params.id;
    
    // Build date filter
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    
    // Find doctor by ID or userId
    let query = { doctorId };
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      const doctor = await Doctor.findOne({ userId: doctorId });
      if (doctor) {
        query = { doctorId: doctor._id };
      } else {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }
    
    // Add date filter if provided
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .sort({ date: -1 });
      
    // Calculate statistics
    const totalEarnings = appointments.reduce((sum, apt) => {
      return apt.paymentStatus === 'paid' ? sum + apt.amount : sum;
    }, 0);
    
    const pendingPayments = appointments.reduce((sum, apt) => {
      return apt.paymentStatus === 'pending' ? sum + apt.amount : sum;
    }, 0);
    
    const appointmentsByMonth = appointments.reduce((acc, apt) => {
      const month = new Date(apt.date).toLocaleString('default', { month: 'long' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(apt);
      return acc;
    }, {});
    
    const monthlyEarnings = Object.keys(appointmentsByMonth).map(month => {
      const earnings = appointmentsByMonth[month].reduce((sum, apt) => {
        return apt.paymentStatus === 'paid' ? sum + apt.amount : sum;
      }, 0);
      
      return { month, earnings };
    });
    
    res.json({
      totalEarnings,
      pendingPayments,
      appointmentCount: appointments.length,
      completedCount: appointments.filter(apt => apt.status === 'completed').length,
      cancelledCount: appointments.filter(apt => apt.status === 'cancelled').length,
      monthlyEarnings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
