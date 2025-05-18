
const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

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
router.post('/', async (req, res) => {
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
    const { name, email, phone, password } = req.body;
    
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
    await user.save();
    
    res.status(201).json({ 
      message: 'Patient account created successfully',
      patient: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
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
    const appointments = await Appointment.find({ doctorId: req.params.id });
    
    // Extract unique patient IDs
    const patientIds = [...new Set(appointments.map(apt => apt.patientId.toString()))];
    
    // Get patient details
    const patients = await User.find({
      _id: { $in: patientIds },
      role: 'user'
    }).select('name email phone');
    
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
