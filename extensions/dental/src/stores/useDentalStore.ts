/**
 * Dental Store - Zustand State Management
 * Manages dental-specific state including measurements, selected teeth, and theme
 * Syncs with backend API for persistence
 */

import { create } from 'zustand';
import { DentalMeasurement, ToothNumber, MeasurementPreset, DentalPatientInfo, PracticeInfo } from '../types';
import apiService from '../services/apiService';

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

  // Backend sync state
  isSyncing: boolean;
  lastSyncError: string | null;

  // Actions - Measurements (with backend sync)
  addMeasurement: (measurement: DentalMeasurement) => Promise<void>;
  removeMeasurement: (measurementId: string) => Promise<void>;
  updateMeasurement: (measurementId: string, updates: Partial<DentalMeasurement>) => void;
  setSelectedMeasurementId: (measurementId: string | null) => void;
  setActiveMeasurementPreset: (preset: MeasurementPreset | null) => void;
  setMeasurementsPaletteOpen: (open: boolean) => void;
  clearMeasurements: () => void;
  loadMeasurementsFromBackend: (patientId?: string, studyInstanceUID?: string) => Promise<void>;

  // Actions - Teeth
  selectTooth: (tooth: ToothNumber) => void;
  deselectTooth: (tooth: ToothNumber) => void;
  clearSelectedTeeth: () => void;
  setToothSelectorVisible: (visible: boolean) => void;

  // Actions - Patient & Practice
  setPatientInfo: (info: DentalPatientInfo | null) => void;
  setPracticeInfo: (info: PracticeInfo | null) => void;

  // Actions - Theme (with backend sync)
  setCurrentTheme: (theme: string) => void;
  saveViewerStateToBackend: () => Promise<void>;
  loadViewerStateFromBackend: (patientId?: string, studyInstanceUID?: string) => Promise<void>;

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
  isSyncing: false,
  lastSyncError: null,
};

export const useDentalStore = create<DentalStore>((set, get) => ({
  ...initialState,

  // Measurements Actions
  addMeasurement: async (measurement: DentalMeasurement) => {
    // Add to local state immediately (optimistic update)
    set(state => ({
      measurements: [...state.measurements, measurement],
    }));

    // Sync to backend if authenticated
    if (apiService.isAuthenticated()) {
      try {
        set({ isSyncing: true, lastSyncError: null });

        const patientInfo = get().patientInfo;
        await apiService.createMeasurement({
          id: measurement.id,
          patientId: patientInfo?.patientId || 'unknown',
          studyInstanceUID: patientInfo?.studyInstanceUID || 'unknown',
          type: measurement.type,
          label: measurement.label,
          value: measurement.value,
          unit: measurement.unit,
          toothNumber: measurement.toothNumber,
          timestamp: measurement.timestamp,
          metadata: measurement.metadata,
        });

        console.log('✅ Measurement synced to backend:', measurement.id);
      } catch (error: any) {
        console.error('❌ Failed to sync measurement to backend:', error);
        set({ lastSyncError: error.message || 'Sync failed' });
        // Keep measurement in local state even if sync fails
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  removeMeasurement: async (measurementId: string) => {
    // Remove from local state immediately (optimistic update)
    set(state => ({
      measurements: state.measurements.filter(m => m.id !== measurementId),
      selectedMeasurementId:
        state.selectedMeasurementId === measurementId
          ? null
          : state.selectedMeasurementId,
    }));

    // Sync to backend if authenticated
    if (apiService.isAuthenticated()) {
      try {
        set({ isSyncing: true, lastSyncError: null });
        await apiService.deleteMeasurement(measurementId);
        console.log('✅ Measurement deleted from backend:', measurementId);
      } catch (error: any) {
        console.error('❌ Failed to delete measurement from backend:', error);
        set({ lastSyncError: error.message || 'Delete failed' });
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  loadMeasurementsFromBackend: async (patientId?: string, studyInstanceUID?: string) => {
    if (!apiService.isAuthenticated()) {
      console.warn('⚠️ Not authenticated, skipping measurement load');
      return;
    }

    try {
      set({ isSyncing: true, lastSyncError: null });

      const response = await apiService.getMeasurements(patientId, studyInstanceUID);

      if (response.success && response.data) {
        const backendMeasurements = response.data.measurements.map((m: any) => ({
          id: m.id,
          type: m.type,
          label: m.label,
          value: m.value,
          unit: m.unit,
          toothNumber: m.toothNumber,
          timestamp: m.timestamp,
          metadata: m.metadata,
        }));

        set({ measurements: backendMeasurements });
        console.log(`✅ Loaded ${backendMeasurements.length} measurements from backend`);
      }
    } catch (error: any) {
      console.error('❌ Failed to load measurements from backend:', error);
      set({ lastSyncError: error.message || 'Load failed' });
    } finally {
      set({ isSyncing: false });
    }
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
    // Auto-save viewer state when theme changes
    const store = get();
    if (apiService.isAuthenticated()) {
      store.saveViewerStateToBackend().catch(err => {
        console.error('Failed to save theme change:', err);
      });
    }
  },

  // Viewer State Backend Sync
  saveViewerStateToBackend: async () => {
    if (!apiService.isAuthenticated()) {
      console.warn('⚠️ Not authenticated, skipping viewer state save');
      return;
    }

    try {
      set({ isSyncing: true, lastSyncError: null });

      const state = get();
      const patientInfo = state.patientInfo;

      await apiService.saveViewerState({
        patientId: patientInfo?.patientId,
        studyInstanceUID: patientInfo?.studyInstanceUID,
        theme: state.currentTheme,
        selectedTeeth: state.selectedTeeth,
        viewportSettings: null, // Can be extended later
      });

      console.log('✅ Viewer state saved to backend');
    } catch (error: any) {
      console.error('❌ Failed to save viewer state to backend:', error);
      set({ lastSyncError: error.message || 'Save viewer state failed' });
    } finally {
      set({ isSyncing: false });
    }
  },

  loadViewerStateFromBackend: async (patientId?: string, studyInstanceUID?: string) => {
    if (!apiService.isAuthenticated()) {
      console.warn('⚠️ Not authenticated, skipping viewer state load');
      return;
    }

    try {
      set({ isSyncing: true, lastSyncError: null });

      const response = await apiService.getViewerState(patientId, studyInstanceUID);

      if (response.success && response.data?.state) {
        const state = response.data.state;

        set({
          currentTheme: state.theme || 'default',
          selectedTeeth: state.selectedTeeth || [],
        });

        console.log('✅ Viewer state loaded from backend');
      }
    } catch (error: any) {
      console.error('❌ Failed to load viewer state from backend:', error);
      set({ lastSyncError: error.message || 'Load viewer state failed' });
    } finally {
      set({ isSyncing: false });
    }
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
