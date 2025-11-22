/**
 * Type definitions for the dental extension
 */

// Tooth numbering systems
export type ToothNumberingSystem = 'fdi' | 'universal';

export interface ToothNumber {
  fdi: string;        // International (11-48)
  universal: number;  // US system (1-32)
  quadrant: number;   // 1-4
  position: number;   // 1-8
}

// Dental-specific measurement types
export type DentalMeasurementType =
  | 'periapical_length'
  | 'canal_angle'
  | 'crown_width'
  | 'root_length';

export interface DentalMeasurement {
  id: string;
  type: DentalMeasurementType;
  label: string;
  value: number;
  unit: 'mm' | 'degrees';
  toothNumber?: ToothNumber;
  timestamp: string;
  imageId?: string;
  seriesInstanceUID?: string;
  studyInstanceUID?: string;
}

// Theme configuration
export interface DentalTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headerSize: string;
    bodySize: string;
  };
}

// Practice information
export interface PracticeInfo {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
}

// Patient information for dental header
export interface DentalPatientInfo {
  patientId: string;
  patientName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  lastVisit?: string;
}

// Measurement preset configuration
export interface MeasurementPreset {
  id: string;
  label: string;
  type: DentalMeasurementType;
  toolName: string; // Cornerstone tool name
  unit: 'mm' | 'degrees';
  icon?: string;
  color?: string;
}

// Export format
export interface MeasurementExport {
  metadata: {
    exportDate: string;
    patientInfo: DentalPatientInfo;
    studyInstanceUID: string;
    practiceInfo?: PracticeInfo;
  };
  measurements: DentalMeasurement[];
}
