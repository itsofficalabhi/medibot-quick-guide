
const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { validationRules, checkValidationResult } = require('../middleware/validation');

// Get prescriptions by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescriptions by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name email')
      .populate('appointmentId')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescriptions by appointment ID
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ appointmentId: req.params.appointmentId })
      .populate('patientId', 'name email')
      .populate('doctorId')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new prescription
router.post('/', validationRules.prescriptionCreation, checkValidationResult, async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      medicines,
      instructions,
      followupDate,
      status,
      doctorSignature // Added doctor signature
    } = req.body;
    
    // If appointment ID is provided, verify it exists
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
    }
    
    const prescription = new Prescription({
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      medicines,
      instructions,
      followupDate,
      status: status || 'active',
      doctorSignature // Store doctor signature
    });
    
    await prescription.save();
    
    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId')
      .populate('appointmentId');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update prescription status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor signature for a prescription
router.patch('/:id/signature', async (req, res) => {
  try {
    const { signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ message: 'Signature is required' });
    }
    
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { doctorSignature: signature },
      { new: true }
    );
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
