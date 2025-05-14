
const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
  duration: String
});

const PrescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  medicines: [MedicineSchema],
  instructions: String,
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'active'
  },
  followupDate: Date
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
