
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to verify token and role
const authorize = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
      
      // Verify token
      const secret = process.env.JWT_SECRET || 'mediclinic_jwt_secret';
      const decoded = jwt.verify(token, secret);
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
      
      // Check if user has required role
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(401).json({ message: 'Invalid token.' });
    }
  };
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'mediclinic_jwt_secret',
    { expiresIn: '30d' }
  );
};

// Initialize default admin account
const initializeAdmin = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'applied.abhishek@gmail.com' });
    
    if (!adminExists) {
      console.log('Creating default admin account...');
      const adminUser = new User({
        name: 'System Administrator',
        email: 'applied.abhishek@gmail.com',
        password: 'admin',
        role: 'admin',
        mobile: '1234567890'
      });
      
      await adminUser.save();
      console.log('Default admin account created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
};

// Call the function to ensure admin exists
initializeAdmin();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      mobile
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Get all users
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Update user
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, mobile } = req.body;
    
    // Find user
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.mobile = mobile || user.mobile;
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    await user.save();
    
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Delete user
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - Create admin
router.post('/admin', authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new admin user
    user = new User({
      name,
      email,
      password,
      role: 'admin',
      mobile
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Admin created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
