/**
 * Measurement Export Utilities
 * Handles JSON export of dental measurements with metadata
 */

import { DentalMeasurement, MeasurementExport, DentalPatientInfo, PracticeInfo } from '../types';

/**
 * Format date to ISO string
 */
function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Create measurement export object
 */
export function createMeasurementExport(
  measurements: DentalMeasurement[],
  patientInfo: DentalPatientInfo,
  studyInstanceUID: string,
  practiceInfo?: PracticeInfo
): MeasurementExport {
  return {
    metadata: {
      exportDate: formatDate(),
      patientInfo,
      studyInstanceUID,
      practiceInfo,
    },
    measurements: measurements.map(m => ({
      ...m,
      // Ensure timestamp is formatted consistently
      timestamp: m.timestamp || formatDate(),
    })),
  };
}

/**
 * Convert measurement export to JSON string
 */
export function exportToJSON(exportData: MeasurementExport): string {
  return JSON.stringify(exportData, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(
  jsonString: string,
  filename?: string
): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `dental-measurements-${Date.now()}.json`;
  const finalFilename = filename || defaultFilename;

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export measurements to JSON file
 */
export function exportMeasurements(
  measurements: DentalMeasurement[],
  patientInfo: DentalPatientInfo,
  studyInstanceUID: string,
  practiceInfo?: PracticeInfo,
  filename?: string
): void {
  const exportData = createMeasurementExport(
    measurements,
    patientInfo,
    studyInstanceUID,
    practiceInfo
  );

  const jsonString = exportToJSON(exportData);

  // Generate filename with patient info and date
  const generatedFilename =
    filename ||
    `dental-measurements-${patientInfo.patientId}-${new Date().toISOString().split('T')[0]}.json`;

  downloadJSON(jsonString, generatedFilename);
}

/**
 * Parse imported JSON measurements
 */
export function parseImportedMeasurements(jsonString: string): MeasurementExport {
  try {
    const data = JSON.parse(jsonString);

    // Validate structure
    if (!data.metadata || !data.measurements) {
      throw new Error('Invalid measurement export format');
    }

    return data as MeasurementExport;
  } catch (error) {
    throw new Error(`Failed to parse measurements: ${error.message}`);
  }
}

/**
 * Get measurement summary statistics
 */
export function getMeasurementSummary(measurements: DentalMeasurement[]): {
  total: number;
  byType: Record<string, number>;
  byTooth: Record<string, number>;
} {
  const summary = {
    total: measurements.length,
    byType: {} as Record<string, number>,
    byTooth: {} as Record<string, number>,
  };

  measurements.forEach(m => {
    // Count by type
    summary.byType[m.type] = (summary.byType[m.type] || 0) + 1;

    // Count by tooth (if associated)
    if (m.toothNumber) {
      const toothKey = `#${m.toothNumber.universal}`;
      summary.byTooth[toothKey] = (summary.byTooth[toothKey] || 0) + 1;
    }
  });

  return summary;
}

/**
 * Format measurement value with unit
 */
export function formatMeasurementValue(measurement: DentalMeasurement): string {
  const value = measurement.value.toFixed(2);
  return `${value} ${measurement.unit}`;
}

/**
 * Get measurement type display name
 */
export function getMeasurementTypeLabel(type: string): string {
  const labels = {
    periapical_length: 'Periapical Length',
    canal_angle: 'Canal Angle',
    crown_width: 'Crown Width',
    root_length: 'Root Length',
  };
  return labels[type] || type;
}
