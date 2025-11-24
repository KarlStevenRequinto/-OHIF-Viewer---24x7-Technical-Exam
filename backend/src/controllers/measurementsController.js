/**
 * Measurements Controller
 * Handles CRUD operations for dental measurements
 */

const { getDatabase } = require('../config/database');

/**
 * Get all measurements for authenticated user
 * GET /api/measurements
 * Query params: patientId, studyInstanceUID
 */
async function getMeasurements(req, res) {
  const { patientId, studyInstanceUID } = req.query;
  const userId = req.user.id;

  const db = getDatabase();

  try {
    let query = 'SELECT * FROM measurements WHERE user_id = ?';
    const params = [userId];

    if (patientId) {
      query += ' AND patient_id = ?';
      params.push(patientId);
    }

    if (studyInstanceUID) {
      query += ' AND study_instance_uid = ?';
      params.push(studyInstanceUID);
    }

    query += ' ORDER BY timestamp DESC';

    const measurements = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Parse JSON fields
    const formattedMeasurements = measurements.map(m => ({
      id: m.measurement_id,
      type: m.type,
      label: m.label,
      value: m.value,
      unit: m.unit,
      toothNumber: m.tooth_number_universal ? {
        universal: m.tooth_number_universal,
        fdi: m.tooth_number_fdi
      } : null,
      timestamp: m.timestamp,
      patientId: m.patient_id,
      studyInstanceUID: m.study_instance_uid,
      metadata: m.metadata ? JSON.parse(m.metadata) : null,
      createdAt: m.created_at
    }));

    db.close();

    res.status(200).json({
      success: true,
      count: formattedMeasurements.length,
      data: {
        measurements: formattedMeasurements
      }
    });
  } catch (error) {
    db.close();
    console.error('Get measurements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching measurements',
      error: error.message
    });
  }
}

/**
 * Create new measurement
 * POST /api/measurements
 */
async function createMeasurement(req, res) {
  const userId = req.user.id;
  const {
    measurementId,
    patientId,
    studyInstanceUID,
    type,
    label,
    value,
    unit,
    toothNumber,
    timestamp,
    metadata
  } = req.body;

  // Validation
  if (!measurementId || !patientId || !studyInstanceUID || !type || !label || value === undefined || !unit) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: measurementId, patientId, studyInstanceUID, type, label, value, unit'
    });
  }

  const db = getDatabase();

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO measurements (
          user_id, measurement_id, patient_id, study_instance_uid,
          type, label, value, unit,
          tooth_number_universal, tooth_number_fdi,
          timestamp, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          measurementId,
          patientId,
          studyInstanceUID,
          type,
          label,
          value,
          unit,
          toothNumber?.universal || null,
          toothNumber?.fdi || null,
          timestamp || new Date().toISOString(),
          metadata ? JSON.stringify(metadata) : null
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    db.close();

    res.status(201).json({
      success: true,
      message: 'Measurement created successfully',
      data: {
        id: measurementId,
        dbId: result.id
      }
    });
  } catch (error) {
    db.close();

    // Handle unique constraint violation
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        message: 'Measurement with this ID already exists'
      });
    }

    console.error('Create measurement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating measurement',
      error: error.message
    });
  }
}

/**
 * Bulk create measurements
 * POST /api/measurements/bulk
 */
async function bulkCreateMeasurements(req, res) {
  const userId = req.user.id;
  const { measurements } = req.body;

  if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'measurements array is required and must not be empty'
    });
  }

  const db = getDatabase();

  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO measurements (
        user_id, measurement_id, patient_id, study_instance_uid,
        type, label, value, unit,
        tooth_number_universal, tooth_number_fdi,
        timestamp, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let insertedCount = 0;

    for (const m of measurements) {
      try {
        stmt.run(
          userId,
          m.id || m.measurementId,
          m.patientId,
          m.studyInstanceUID,
          m.type,
          m.label,
          m.value,
          m.unit,
          m.toothNumber?.universal || null,
          m.toothNumber?.fdi || null,
          m.timestamp || new Date().toISOString(),
          m.metadata ? JSON.stringify(m.metadata) : null
        );
        insertedCount++;
      } catch (err) {
        console.warn('Skipping duplicate measurement:', m.id || m.measurementId);
      }
    }

    stmt.finalize();
    db.close();

    res.status(201).json({
      success: true,
      message: `${insertedCount} measurements created successfully`,
      data: {
        insertedCount,
        totalSubmitted: measurements.length
      }
    });
  } catch (error) {
    db.close();
    console.error('Bulk create measurements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating measurements',
      error: error.message
    });
  }
}

/**
 * Delete measurement
 * DELETE /api/measurements/:id
 */
async function deleteMeasurement(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const db = getDatabase();

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM measurements WHERE measurement_id = ? AND user_id = ?',
        [id, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    db.close();

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Measurement deleted successfully'
    });
  } catch (error) {
    db.close();
    console.error('Delete measurement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting measurement',
      error: error.message
    });
  }
}

/**
 * Delete all measurements for a study
 * DELETE /api/measurements/study/:studyInstanceUID
 */
async function deleteStudyMeasurements(req, res) {
  const userId = req.user.id;
  const { studyInstanceUID } = req.params;

  const db = getDatabase();

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM measurements WHERE study_instance_uid = ? AND user_id = ?',
        [studyInstanceUID, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    db.close();

    res.status(200).json({
      success: true,
      message: `${result.changes} measurements deleted successfully`
    });
  } catch (error) {
    db.close();
    console.error('Delete study measurements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting measurements',
      error: error.message
    });
  }
}

module.exports = {
  getMeasurements,
  createMeasurement,
  bulkCreateMeasurements,
  deleteMeasurement,
  deleteStudyMeasurements
};
