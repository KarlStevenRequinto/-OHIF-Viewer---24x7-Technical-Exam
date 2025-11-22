/**
 * Dental Store - Zustand State Management
 * Manages dental-specific state including measurements, selected teeth, and theme
 */

import { create } from 'zustand';
import { DentalMeasurement, ToothNumber, MeasurementPreset, DentalPatientInfo, PracticeInfo } from '../types';

interface DentalStore {
  // Measurements
  measurements: DentalMeasurement[];
  selectedMeasurementId: string | null;
  activeMeasurementPreset: MeasurementPreset | null;
  measurementsPaletteOpen: boolean;

  // Teeth Selection
  selectedTeeth: ToothNumber[];
  toothSelectorVisible: boolean;

  // Patient & Practice Info
  patientInfo: DentalPatientInfo | null;
  practiceInfo: PracticeInfo | null;

  // Theme
  currentTheme: string;

  // Actions - Measurements
  addMeasurement: (measurement: DentalMeasurement) => void;
  removeMeasurement: (measurementId: string) => void;
  updateMeasurement: (measurementId: string, updates: Partial<DentalMeasurement>) => void;
  setSelectedMeasurementId: (measurementId: string | null) => void;
  setActiveMeasurementPreset: (preset: MeasurementPreset | null) => void;
  setMeasurementsPaletteOpen: (open: boolean) => void;
  clearMeasurements: () => void;

  // Actions - Teeth
  selectTooth: (tooth: ToothNumber) => void;
  deselectTooth: (tooth: ToothNumber) => void;
  clearSelectedTeeth: () => void;
  setToothSelectorVisible: (visible: boolean) => void;

  // Actions - Patient & Practice
  setPatientInfo: (info: DentalPatientInfo | null) => void;
  setPracticeInfo: (info: PracticeInfo | null) => void;

  // Actions - Theme
  setCurrentTheme: (theme: string) => void;

  // Actions - Utility
  reset: () => void;
}

const initialState = {
  measurements: [],
  selectedMeasurementId: null,
  activeMeasurementPreset: null,
  measurementsPaletteOpen: false,
  selectedTeeth: [],
  toothSelectorVisible: false,
  patientInfo: null,
  practiceInfo: null,
  currentTheme: 'default',
};

export const useDentalStore = create<DentalStore>((set, get) => ({
  ...initialState,

  // Measurements Actions
  addMeasurement: (measurement: DentalMeasurement) => {
    set(state => ({
      measurements: [...state.measurements, measurement],
    }));
  },

  removeMeasurement: (measurementId: string) => {
    set(state => ({
      measurements: state.measurements.filter(m => m.id !== measurementId),
      selectedMeasurementId:
        state.selectedMeasurementId === measurementId
          ? null
          : state.selectedMeasurementId,
    }));
  },

  updateMeasurement: (measurementId: string, updates: Partial<DentalMeasurement>) => {
    set(state => ({
      measurements: state.measurements.map(m =>
        m.id === measurementId ? { ...m, ...updates } : m
      ),
    }));
  },

  setSelectedMeasurementId: (measurementId: string | null) => {
    set({ selectedMeasurementId: measurementId });
  },

  setActiveMeasurementPreset: (preset: MeasurementPreset | null) => {
    set({ activeMeasurementPreset: preset });
  },

  setMeasurementsPaletteOpen: (open: boolean) => {
    set({ measurementsPaletteOpen: open });
  },

  clearMeasurements: () => {
    set({
      measurements: [],
      selectedMeasurementId: null,
      activeMeasurementPreset: null,
    });
  },

  // Teeth Actions
  selectTooth: (tooth: ToothNumber) => {
    set(state => {
      // Check if tooth is already selected
      const isSelected = state.selectedTeeth.some(
        t => t.universal === tooth.universal
      );

      if (isSelected) {
        return state; // Already selected, no change
      }

      return {
        selectedTeeth: [...state.selectedTeeth, tooth],
      };
    });
  },

  deselectTooth: (tooth: ToothNumber) => {
    set(state => ({
      selectedTeeth: state.selectedTeeth.filter(
        t => t.universal !== tooth.universal
      ),
    }));
  },

  clearSelectedTeeth: () => {
    set({ selectedTeeth: [] });
  },

  setToothSelectorVisible: (visible: boolean) => {
    set({ toothSelectorVisible: visible });
  },

  // Patient & Practice Actions
  setPatientInfo: (info: DentalPatientInfo | null) => {
    set({ patientInfo: info });
  },

  setPracticeInfo: (info: PracticeInfo | null) => {
    set({ practiceInfo: info });
  },

  // Theme Actions
  setCurrentTheme: (theme: string) => {
    set({ currentTheme: theme });
  },

  // Utility Actions
  reset: () => {
    set(initialState);
  },
}));

// Selectors (for optimized component re-renders)
export const selectMeasurements = (state: DentalStore) => state.measurements;
export const selectSelectedTeeth = (state: DentalStore) => state.selectedTeeth;
export const selectPatientInfo = (state: DentalStore) => state.patientInfo;
export const selectMeasurementsPaletteOpen = (state: DentalStore) =>
  state.measurementsPaletteOpen;

// Helper to get measurement by ID
export const getMeasurementById = (measurementId: string): DentalMeasurement | null => {
  const state = useDentalStore.getState();
  return state.measurements.find(m => m.id === measurementId) || null;
};

// Helper to get measurements for a specific tooth
export const getMeasurementsForTooth = (toothUniversal: number): DentalMeasurement[] => {
  const state = useDentalStore.getState();
  return state.measurements.filter(
    m => m.toothNumber?.universal === toothUniversal
  );
};

export default useDentalStore;
