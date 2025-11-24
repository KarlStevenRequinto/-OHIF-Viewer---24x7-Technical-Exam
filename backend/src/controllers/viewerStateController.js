/**
 * Viewer State Controller
 * Handles saving and loading viewer state (theme, selected teeth, viewport settings)
 */

const { getDatabase } = require('../config/database');

/**
 * Get viewer state
 * GET /api/viewer-state
 * Query params: patientId, studyInstanceUID
 */
async function getViewerState(req, res) {
  const userId = req.user.id;
  const { patientId, studyInstanceUID } = req.query;

  const db = getDatabase();

  try {
    let query = 'SELECT * FROM viewer_state WHERE user_id = ?';
    const params = [userId];

    if (patientId) {
      query += ' AND patient_id = ?';
      params.push(patientId);
    }

    if (studyInstanceUID) {
      query += ' AND study_instance_uid = ?';
      params.push(studyInstanceUID);
    }

    query += ' ORDER BY last_accessed DESC LIMIT 1';

    const state = await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    db.close();

    if (!state) {
      return res.status(200).json({
        success: true,
        message: 'No saved state found, using defaults',
        data: {
          state: {
            theme: 'dental',
            selectedTeeth: [],
            viewportSettings: null
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        state: {
          theme: state.theme,
          selectedTeeth: state.selected_teeth ? JSON.parse(state.selected_teeth) : [],
          viewportSettings: state.viewport_settings ? JSON.parse(state.viewport_settings) : null,
          patientId: state.patient_id,
          studyInstanceUID: state.study_instance_uid,
          lastAccessed: state.last_accessed
        }
      }
    });
  } catch (error) {
    db.close();
    console.error('Get viewer state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewer state',
      error: error.message
    });
  }
}

/**
 * Save/Update viewer state
 * POST /api/viewer-state
 */
async function saveViewerState(req, res) {
  const userId = req.user.id;
  const {
    patientId,
    studyInstanceUID,
    theme,
    selectedTeeth,
    viewportSettings
  } = req.body;

  const db = getDatabase();

  try {
    // Check if state exists
    const existingState = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM viewer_state
         WHERE user_id = ? AND patient_id = ? AND study_instance_uid = ?`,
        [userId, patientId || null, studyInstanceUID || null],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingState) {
      // Update existing state
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE viewer_state
           SET theme = ?, selected_teeth = ?, viewport_settings = ?,
               last_accessed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            theme || 'dental',
            selectedTeeth ? JSON.stringify(selectedTeeth) : null,
            viewportSettings ? JSON.stringify(viewportSettings) : null,
            existingState.id
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      db.close();

      res.status(200).json({
        success: true,
        message: 'Viewer state updated successfully'
      });
    } else {
      // Create new state
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO viewer_state (
            user_id, patient_id, study_instance_uid,
            theme, selected_teeth, viewport_settings
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            patientId || null,
            studyInstanceUID || null,
            theme || 'dental',
            selectedTeeth ? JSON.stringify(selectedTeeth) : null,
            viewportSettings ? JSON.stringify(viewportSettings) : null
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
        message: 'Viewer state saved successfully',
        data: {
          id: result.id
        }
      });
    }
  } catch (error) {
    db.close();
    console.error('Save viewer state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving viewer state',
      error: error.message
    });
  }
}

/**
 * Delete viewer state
 * DELETE /api/viewer-state
 * Query params: patientId, studyInstanceUID
 */
async function deleteViewerState(req, res) {
  const userId = req.user.id;
  const { patientId, studyInstanceUID } = req.query;

  if (!patientId && !studyInstanceUID) {
    return res.status(400).json({
      success: false,
      message: 'Either patientId or studyInstanceUID is required'
    });
  }

  const db = getDatabase();

  try {
    let query = 'DELETE FROM viewer_state WHERE user_id = ?';
    const params = [userId];

    if (patientId) {
      query += ' AND patient_id = ?';
      params.push(patientId);
    }

    if (studyInstanceUID) {
      query += ' AND study_instance_uid = ?';
      params.push(studyInstanceUID);
    }

    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    db.close();

    res.status(200).json({
      success: true,
      message: `${result.changes} viewer state(s) deleted successfully`
    });
  } catch (error) {
    db.close();
    console.error('Delete viewer state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting viewer state',
      error: error.message
    });
  }
}

module.exports = {
  getViewerState,
  saveViewerState,
  deleteViewerState
};
