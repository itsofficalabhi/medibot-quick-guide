
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// Get system stats for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get appointment stats
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const scheduledAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    
    // Get prescription count
    const totalPrescriptions = await Prescription.countDocuments();
    
    // Get revenue data
    const paidAppointments = await Appointment.find({ paymentStatus: 'paid' });
    const totalRevenue = paidAppointments.reduce((sum, apt) => sum + apt.amount, 0);
    
    // Get recent users
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      userStats: {
        totalUsers,
        totalDoctors,
        totalAdmins,
        recentUsers
      },
      appointmentStats: {
        totalAppointments,
        completedAppointments,
        scheduledAppointments,
        recentAppointments
      },
      prescriptionCount: totalPrescriptions,
      financialStats: {
        totalRevenue,
        paidAppointmentsCount: paidAppointments.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // In a real implementation, you'd fetch from a logs collection
    // For now, return a mock response
    
    res.json({
      logs: [
        { timestamp: new Date(), level: 'info', message: 'System started', userId: null },
        { timestamp: new Date(), level: 'warn', message: 'Failed login attempt', userId: null },
        { timestamp: new Date(), level: 'error', message: 'Database connection error', userId: null }
      ],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalLogs: 3
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending doctor approvals
router.get('/pending-doctors', async (req, res) => {
  try {
    // Find doctors where isVerified is false
    const pendingDoctors = await Doctor.find({ isVerified: false })
      .populate('userId', 'name email createdAt');
    
    res.json(pendingDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve doctor
router.post('/approve-doctor/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.isVerified = true;
    await doctor.save();
    
    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject doctor
router.post('/reject-doctor/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    const doctorId = req.params.id;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // In a real implementation, you might:
    // 1. Send email notification to doctor with reason
    // 2. Move to a rejected collection or set a status field
    // 3. Optionally delete the doctor record
    
    // For now, we'll just delete the doctor
    await doctor.deleteOne();
    
    // Also delete the user if only role is doctor
    const user = await User.findById(doctor.userId);
    if (user && user.role === 'doctor') {
      await user.deleteOne();
    }
    
    res.json({ message: 'Doctor rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activity
router.get('/activity/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's appointments
    let appointments;
    if (user.role === 'user') {
      appointments = await Appointment.find({ patientId: userId })
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        })
        .sort({ date: -1 });
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: userId });
      if (doctor) {
        appointments = await Appointment.find({ doctorId: doctor._id })
          .populate('patientId', 'name email')
          .sort({ date: -1 });
      }
    }
    
    // Get user's prescriptions
    let prescriptions;
    if (user.role === 'user') {
      prescriptions = await Prescription.find({ patientId: userId })
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        })
        .sort({ date: -1 });
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: userId });
      if (doctor) {
        prescriptions = await Prescription.find({ doctorId: doctor._id })
          .populate('patientId', 'name email')
          .sort({ date: -1 });
      }
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      appointments: appointments || [],
      prescriptions: prescriptions || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system settings
router.get('/settings', (req, res) => {
  // In a real implementation, you'd fetch from a settings collection
  // For now, return mock settings
  res.json({
    appointmentSettings: {
      allowSameDayBooking: true,
      maxAdvancedDays: 30,
      defaultAppointmentDuration: 30, // minutes
    },
    emailNotifications: true,
    paymentGateways: ['stripe', 'paypal'],
    maintenanceMode: false,
    version: '1.0.0'
  });
});

// Update system settings
router.put('/settings', (req, res) => {
  // In a real implementation, you'd update a settings collection
  // For now, just return the received settings
  res.json({
    message: 'Settings updated',
    settings: req.body
  });
});

module.exports = router;
