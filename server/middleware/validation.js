
const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result checker
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Validation Error: ${errorMessages.join('. ')}`, 400));
  }
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  userRegistration: [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'doctor', 'admin']).withMessage('Invalid role'),
    body('mobile').optional().isMobilePhone().withMessage('Please provide a valid mobile number')
  ],

  userLogin: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // Doctor validation
  doctorProfile: [
    body('specialty').trim().isLength({ min: 2 }).withMessage('Specialty is required'),
    body('experience').isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
    body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('education').optional().isArray().withMessage('Education must be an array')
  ],

  // Appointment validation
  appointmentCreation: [
    body('patientId').isMongoId().withMessage('Invalid patient ID'),
    body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    body('date').isISO8601().withMessage('Please provide a valid date'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time in HH:MM format'),
    body('type').isIn(['video', 'phone', 'chat', 'in-person']).withMessage('Invalid appointment type'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
  ],

  // Prescription validation
  prescriptionCreation: [
    body('patientId').isMongoId().withMessage('Invalid patient ID'),
    body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
    body('diagnosis').trim().isLength({ min: 5 }).withMessage('Diagnosis must be at least 5 characters'),
    body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
    body('medicines.*.name').trim().isLength({ min: 2 }).withMessage('Medicine name is required'),
    body('medicines.*.dosage').trim().isLength({ min: 1 }).withMessage('Medicine dosage is required'),
    body('medicines.*.frequency').trim().isLength({ min: 1 }).withMessage('Medicine frequency is required')
  ],

  // Parameter validation
  mongoIdParam: [
    param('id').isMongoId().withMessage('Invalid ID format')
  ],

  // Query validation
  paginationQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  validationRules,
  checkValidationResult
};
