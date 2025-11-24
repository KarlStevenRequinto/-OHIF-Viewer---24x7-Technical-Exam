/**
 * Viewer State Routes
 */

const express = require('express');
const router = express.Router();
const {
  getViewerState,
  saveViewerState,
  deleteViewerState
} = require('../controllers/viewerStateController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/viewer-state
 * @desc    Get viewer state for authenticated user
 * @query   patientId, studyInstanceUID
 * @access  Private
 */
router.get('/', getViewerState);

/**
 * @route   POST /api/viewer-state
 * @desc    Save/Update viewer state
 * @access  Private
 */
router.post('/', saveViewerState);

/**
 * @route   DELETE /api/viewer-state
 * @desc    Delete viewer state
 * @query   patientId, studyInstanceUID
 * @access  Private
 */
router.delete('/', deleteViewerState);

module.exports = router;
