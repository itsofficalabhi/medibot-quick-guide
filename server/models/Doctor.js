
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  availability: {
    days: [String],
    hours: String
  },
  education: [String],
  languages: [String],
  about: String,
  profileImage: String,
  signature: String,
  consultationFee: {
    type: Number,
    required: true
  },
  phone: String,
  address: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  licenseNumber: String,
  specializations: [String],
  hospitalAffiliations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
DoctorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Doctor', DoctorSchema);
