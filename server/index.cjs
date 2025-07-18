const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const Database = require('./database/database.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'vovzone_secret_2025';

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VovZone API is running' });
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or account not approved' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: `Welcome back, ${user.name}!`
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Designer Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company, phone, website, bio, specialties } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const userData = {
      email,
      password,
      name,
      company,
      phone,
      website,
      bio,
      specialties: specialties || []
    };

    const result = await db.registerDesigner(userData);

    res.json({
      success: true,
      message: 'Application submitted successfully! Our team will review your application and contact you within 2-3 business days.',
      applicationId: result.userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'Email already registered') {
      res.status(409).json({ error: 'Email already registered. Please use a different email address.' });
    } else {
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    // Always fetch the latest user data from the database so that profile information is up-to-date.
    const user = await db.getUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Logout (invalidate token on client side)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a production environment, you might want to store invalidated tokens
  res.json({ success: true, message: 'Logged out successfully' });
});

// Admin Routes

// Get pending designer applications
app.get('/api/admin/applications/pending', authenticateToken, requireAdmin, (req, res) => {
  db.getPendingApplications((err, applications) => {
    if (err) {
      console.error('Error fetching pending applications:', err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
    res.json({ success: true, applications });
  });
});

// Approve designer application
app.post('/api/admin/applications/:userId/approve', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  
  db.approveDesigner(userId, (err, success) => {
    if (err) {
      console.error('Error approving designer:', err);
      return res.status(500).json({ error: 'Failed to approve designer' });
    }
    
    if (success) {
      res.json({ success: true, message: 'Designer approved successfully' });
    } else {
      res.status(404).json({ error: 'Designer application not found' });
    }
  });
});

// Reject designer application
app.post('/api/admin/applications/:userId/reject', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  
  db.rejectDesigner(userId, (err, success) => {
    if (err) {
      console.error('Error rejecting designer:', err);
      return res.status(500).json({ error: 'Failed to reject designer' });
    }
    
    if (success) {
      res.json({ success: true, message: 'Designer application rejected' });
    } else {
      res.status(404).json({ error: 'Designer application not found' });
    }
  });
});

// Designer Routes

// Get designer dashboard data
app.get('/api/designer/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'designer') {
    return res.status(403).json({ error: 'Designer access required' });
  }
  
  // This would fetch designer-specific dashboard data
  res.json({ 
    success: true, 
    message: 'Designer dashboard data',
    stats: {
      totalProjects: 0,
      totalViews: 0,
      totalLikes: 0,
      monthlyViews: []
    }
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VovZone Server running on port ${PORT}`);
  console.log(`📊 Database: SQLite`);
  console.log(`🔑 Admin Login: admin@vovzone.com / vovzone2025`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down server...');
  db.close();
  process.exit(0);
});

module.exports = app;