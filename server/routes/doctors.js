
const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');

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
      phone
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
          phone
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
        phone
      });
      
      await doctor.save();
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
