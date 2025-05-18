
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const mongoose = require('mongoose');

// Get patient profile
router.get('/:id', async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient profile
router.put('/:id', async (req, res) => {
  try {
    const { name, email, mobile, address, dateOfBirth, gender } = req.body;
    
    // Find patient
    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update fields
    if (name) patient.name = name;
    if (email) patient.email = email;
    if (mobile) patient.mobile = mobile;
    
    // Save patient with updated info
    await patient.save();
    
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient's medical records (appointments and prescriptions)
router.get('/:id/medical-records', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Get patient's appointments
    const appointments = await Appointment.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ date: -1 });
      
    // Get patient's prescriptions
    const prescriptions = await Prescription.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ date: -1 });
      
    res.json({
      appointments,
      prescriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medical record for patient
router.post('/:id/medical-records', async (req, res) => {
  try {
    const { type, data } = req.body;
    const patientId = req.params.id;
    
    // Validate patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Handle different types of medical records
    let result;
    
    if (type === 'appointment') {
      // Create a new appointment
      const appointment = new Appointment({
        ...data,
        patientId
      });
      result = await appointment.save();
    } else if (type === 'prescription') {
      // Create a new prescription
      const prescription = new Prescription({
        ...data,
        patientId
      });
      result = await prescription.save();
    } else {
      return res.status(400).json({ message: 'Invalid medical record type' });
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
