const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const env = require('../config/env');

exports.register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  
  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default role
    const defaultRole = role === 'admin' ? 'admin' : 'user';

    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, passwordHash, phone, defaultRole]
    );

    const payload = {
      id: newUser.rows[0].id,
      role: newUser.rows[0].role
    };

    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      id: user.id,
      role: user.role
    };

    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
};
