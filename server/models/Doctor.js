
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
  consultationFee: {
    type: Number,
    required: true
  },
  phone: String
});

module.exports = mongoose.model('Doctor', DoctorSchema);
