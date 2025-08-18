const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'vovzone.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.init();
  }

  init() {
    // Create tables if they don't exist
    this.db.serialize(() => {
      // Users table for authentication
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'designer', 'visitor')),
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          applied_at DATETIME,
          approved_at DATETIME,
          rejected_at DATETIME
        )
      `);

      // Designers table for detailed designer information
      this.db.run(`
        CREATE TABLE IF NOT EXISTS designers (
          id TEXT PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          company TEXT,
          phone TEXT,
          website TEXT,
          address TEXT,
          avatar TEXT,
          bio TEXT,
          experience INTEGER DEFAULT 0,
          completed_projects INTEGER DEFAULT 0,
          rating REAL DEFAULT 0.0,
          verified BOOLEAN DEFAULT FALSE,
          portfolio_views INTEGER DEFAULT 0,
          portfolio_likes INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Designer specialties table (many-to-many relationship)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS designer_specialties (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          designer_id TEXT NOT NULL,
          specialty TEXT NOT NULL,
          FOREIGN KEY (designer_id) REFERENCES designers (id) ON DELETE CASCADE
        )
      `);

      // Projects table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL CHECK(category IN ('residential', 'commercial', 'hospitality', 'office', 'retail')),
          room_type TEXT,
          class TEXT NOT NULL CHECK(class IN ('economical', 'premium', 'luxury', 'ultra-luxury')),
          location TEXT NOT NULL,
          year INTEGER NOT NULL,
          designer_id TEXT NOT NULL,
          likes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          featured BOOLEAN DEFAULT FALSE,
          status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (designer_id) REFERENCES designers (id) ON DELETE CASCADE
        )
      `);

      // Project images table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS project_images (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          url TEXT NOT NULL,
          filename TEXT NOT NULL,
          size INTEGER DEFAULT 0,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);

      // Project tags table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS project_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);

      // Sessions table for JWT token management
      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Analytics table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          designer_id TEXT NOT NULL,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          projects INTEGER DEFAULT 0,
          FOREIGN KEY (designer_id) REFERENCES designers (id) ON DELETE CASCADE
        )
      `);

      // Create admin user if doesn't exist
      this.createDefaultAdmin();
    });
  }

  async createDefaultAdmin() {
    const adminEmail = 'admin@vovzone.com';
    const adminPassword = 'vovzone2025';
    
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM users WHERE email = ?', [adminEmail], async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          const adminId = `admin_${Date.now()}`;

          this.db.run(
            'INSERT INTO users (id, email, password, name, role, status, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [adminId, adminEmail, hashedPassword, 'VovZone Admin', 'admin', 'approved', new Date().toISOString()],
            function(err) {
              if (err) {
                reject(err);
              } else {
                console.log('Default admin user created successfully');
                resolve(this.lastID);
              }
            }
          );
        } else {
          resolve(null);
        }
      });
    });
  }

  // User authentication methods
  async authenticateUser(email, password) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ? AND status = "approved"',
        [email],
        async (err, user) => {
          if (err) {
            reject(err);
            return;
          }

          if (!user) {
            resolve(null);
            return;
          }

          try {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (isValidPassword) {
              // If it's a designer, get designer details too
              if (user.role === 'designer') {
                this.getDesignerDetails(user.id, (err, designer) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  resolve({ ...user, designer });
                });
              } else {
                resolve(user);
              }
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Get designer details with specialties
  getDesignerDetails(userId, callback) {
    this.db.get(
      'SELECT * FROM designers WHERE user_id = ?',
      [userId],
      (err, designer) => {
        if (err) {
          callback(err, null);
          return;
        }

        if (!designer) {
          callback(null, null);
          return;
        }

        // Get specialties
        this.db.all(
          'SELECT specialty FROM designer_specialties WHERE designer_id = ?',
          [designer.id],
          (err, specialties) => {
            if (err) {
              callback(err, null);
              return;
            }

            designer.specialties = specialties.map(s => s.specialty);
            callback(null, designer);
          }
        );
      }
    );
  }

  // Register new designer
  async registerDesigner(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if email already exists
        this.db.get('SELECT id FROM users WHERE email = ?', [userData.email], async (err, existingUser) => {
          if (err) {
            reject(err);
            return;
          }

          if (existingUser) {
            reject(new Error('Email already registered'));
            return;
          }

          const hashedPassword = await bcrypt.hash(userData.password, 10);
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const designerId = `designer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          this.db.serialize(() => {
            this.db.run('BEGIN TRANSACTION');

            // Insert user
            this.db.run(
              'INSERT INTO users (id, email, password, name, role, status, applied_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [userId, userData.email, hashedPassword, userData.name, 'designer', 'pending', new Date().toISOString()],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }
              }
            );

            // Insert designer details
            this.db.run(
              'INSERT INTO designers (id, user_id, company, phone, website, bio) VALUES (?, ?, ?, ?, ?, ?)',
              [designerId, userId, userData.company || null, userData.phone || null, userData.website || null, userData.bio || null],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }
              }
            );

            // Insert specialties
            if (userData.specialties && userData.specialties.length > 0) {
              const specialtyStmt = this.db.prepare('INSERT INTO designer_specialties (designer_id, specialty) VALUES (?, ?)');
              userData.specialties.forEach(specialty => {
                specialtyStmt.run(designerId, specialty);
              });
              specialtyStmt.finalize();
            }

            this.db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({ userId, designerId });
              }
            });
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get pending designer applications
  getPendingApplications(callback) {
    this.db.all(`
      SELECT u.*, d.company, d.phone, d.website, d.bio 
      FROM users u 
      LEFT JOIN designers d ON u.id = d.user_id 
      WHERE u.role = 'designer' AND u.status = 'pending' 
      ORDER BY u.applied_at DESC
    `, [], (err, applications) => {
      if (err) {
        callback(err, null);
        return;
      }

      // Get specialties for each application
      let completed = 0;
      const total = applications.length;

      if (total === 0) {
        callback(null, []);
        return;
      }

      applications.forEach((app, index) => {
        this.db.all(
          'SELECT specialty FROM designer_specialties ds JOIN designers d ON ds.designer_id = d.id WHERE d.user_id = ?',
          [app.id],
          (err, specialties) => {
            if (!err) {
              applications[index].specialties = specialties.map(s => s.specialty);
            }
            completed++;
            if (completed === total) {
              callback(null, applications);
            }
          }
        );
      });
    });
  }

  // Approve designer
  approveDesigner(userId, callback) {
    this.db.run(
      'UPDATE users SET status = "approved", approved_at = ? WHERE id = ?',
      [new Date().toISOString(), userId],
      function(err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, this.changes > 0);
      }
    );
  }

  // Reject designer
  rejectDesigner(userId, callback) {
    this.db.run(
      'UPDATE users SET status = "rejected", rejected_at = ? WHERE id = ?',
      [new Date().toISOString(), userId],
      function(err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, this.changes > 0);
      }
    );
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

module.exports = Database;