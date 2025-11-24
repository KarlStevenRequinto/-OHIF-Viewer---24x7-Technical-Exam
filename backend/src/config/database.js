/**
 * Database Configuration
 * SQLite database connection and initialization
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../dental_viewer.db');

/**
 * Create and return database connection
 */
function getDatabase() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      throw err;
    }
    console.log('✅ Connected to SQLite database:', DB_PATH);
  });
}

/**
 * Initialize database schema
 */
function initializeDatabase() {
  const db = getDatabase();

  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'dentist',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err);
      } else {
        console.log('✅ Users table ready');
      }
    });

    // Measurements table
    db.run(`
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        measurement_id TEXT UNIQUE NOT NULL,
        patient_id TEXT NOT NULL,
        study_instance_uid TEXT NOT NULL,
        type TEXT NOT NULL,
        label TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        tooth_number_universal INTEGER,
        tooth_number_fdi TEXT,
        timestamp DATETIME NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating measurements table:', err);
      } else {
        console.log('✅ Measurements table ready');
      }
    });

    // Viewer state table
    db.run(`
      CREATE TABLE IF NOT EXISTS viewer_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        patient_id TEXT,
        study_instance_uid TEXT,
        theme TEXT DEFAULT 'dental',
        selected_teeth TEXT,
        viewport_settings TEXT,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, patient_id, study_instance_uid)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating viewer_state table:', err);
      } else {
        console.log('✅ Viewer state table ready');
      }
    });

    // Create indices for better query performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_measurements_user_id ON measurements(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_measurements_patient_id ON measurements(patient_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_measurements_study_uid ON measurements(study_instance_uid)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_viewer_state_user_id ON viewer_state(user_id)`);

    console.log('✅ Database indices created');
  });

  return db;
}

module.exports = {
  getDatabase,
  initializeDatabase
};
