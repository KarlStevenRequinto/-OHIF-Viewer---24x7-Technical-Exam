/**
 * Measurements Routes
 */

const express = require('express');
const router = express.Router();
const {
  getMeasurements,
  createMeasurement,
  bulkCreateMeasurements,
  deleteMeasurement,
  deleteStudyMeasurements
} = require('../controllers/measurementsController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/measurements
 * @desc    Get all measurements for authenticated user
 * @query   patientId, studyInstanceUID
 * @access  Private
 */
router.get('/', getMeasurements);

/**
 * @route   POST /api/measurements
 * @desc    Create new measurement
 * @access  Private
 */
router.post('/', createMeasurement);

/**
 * @route   POST /api/measurements/bulk
 * @desc    Bulk create measurements
 * @access  Private
 */
router.post('/bulk', bulkCreateMeasurements);

/**
 * @route   DELETE /api/measurements/:id
 * @desc    Delete measurement by ID
 * @access  Private
 */
router.delete('/:id', deleteMeasurement);

/**
 * @route   DELETE /api/measurements/study/:studyInstanceUID
 * @desc    Delete all measurements for a study
 * @access  Private
 */
router.delete('/study/:studyInstanceUID', deleteStudyMeasurements);

module.exports = router;
