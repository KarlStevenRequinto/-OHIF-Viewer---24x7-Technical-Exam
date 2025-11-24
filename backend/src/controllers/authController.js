/**
 * Authentication Controller
 * Handles user registration and login
 */

const { getDatabase } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Register new user
 * POST /api/auth/register
 */
async function register(req, res) {
  const { email, password, fullName, role } = req.body;

  // Validation
  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and full name are required'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  const db = getDatabase();

  try {
    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      db.close();
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)`,
        [email, hashedPassword, fullName, role || 'dentist'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Generate token
    const token = generateToken({
      userId: result.id,
      email,
      role: role || 'dentist'
    });

    db.close();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: result.id,
          email,
          fullName,
          role: role || 'dentist'
        },
        token
      }
    });
  } catch (error) {
    db.close();
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const db = getDatabase();

  try {
    // Find user
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      db.close();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      db.close();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    db.close();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    db.close();
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  const db = getDatabase();

  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, full_name, role, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      db.close();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    db.close();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    db.close();
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
};
