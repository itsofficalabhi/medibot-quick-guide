
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

// Get all appointments (admin endpoint)
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'userId')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ date: -1 });
      
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    // Check if patientId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }
    
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ date: 1 });
      
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    // Check if doctorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.doctorId)) {
      // Try to find doctor by userId if not a valid ObjectId
      const doctor = await Doctor.findOne({ userId: req.params.doctorId });
      if (doctor) {
        const appointments = await Appointment.find({ doctorId: doctor._id })
          .populate('patientId', 'name email')
          .sort({ date: 1 });
          
        return res.json(appointments);
      } else {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }
    
    // If doctorId is a valid ObjectId, proceed normally
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name email')
      .sort({ date: 1 });
      
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor billing information
router.get('/doctor/:doctorId/billing', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    
    // Find doctor by ID or userId
    let doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      const doctor = await Doctor.findOne({ userId: doctorId });
      if (doctor) {
        doctorId = doctor._id;
      } else {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }
    
    // Query for appointments with payment status and dates
    const query = { doctorId };
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .sort({ date: -1 });
      
    // Calculate billing statistics
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
      monthlyEarnings,
      appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new appointment
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      type,
      amount,
      status = 'scheduled',
      paymentStatus = 'pending'
    } = req.body;
    
    // Verify patient exists
    let patient;
    try {
      patient = await User.findById(patientId);
      if (!patient) {
        return res.status(400).json({ message: 'Patient not found' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }
    
    // Verify doctor exists
    let doctor;
    try {
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        doctor = await Doctor.findById(doctorId);
      } else {
        doctor = await Doctor.findOne({ userId: doctorId });
      }
      
      if (!doctor) {
        return res.status(400).json({ message: 'Doctor not found' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId: doctor._id,
      date: new Date(date),
      time,
      type,
      amount,
      status,
      paymentStatus
    });
    
    await appointment.save();
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.put('/:id', async (req, res) => {
  try {
    const { status, paymentStatus, paymentId, meetingLink } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (status) appointment.status = status;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    if (paymentId) appointment.paymentId = paymentId;
    if (meetingLink) appointment.meetingLink = meetingLink;
    
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.deleteOne();
    
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
