/**
 * Wrapper component for DentalPracticeHeader
 * Connects to Zustand store and passes props
 */

import React from 'react';
import DentalPracticeHeader from './DentalPracticeHeader';
import { useDentalStore } from '../stores/useDentalStore';

const DentalPracticeHeaderWrapper = (props: any) => {
  const {
    selectedTeeth,
    selectTooth,
    deselectTooth,
    patientInfo,
    practiceInfo,
  } = useDentalStore();

  return (
    <DentalPracticeHeader
      {...props}
      practiceInfo={practiceInfo}
      patientInfo={patientInfo}
      selectedTeeth={selectedTeeth}
      onToothSelect={selectTooth}
      onToothDeselect={deselectTooth}
      showToothSelector={true}
    />
  );
};

export default DentalPracticeHeaderWrapper;
