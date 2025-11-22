/**
 * Layout Template Module for Dental Extension
 * Provides a custom layout with the Dental Practice Header
 * This wraps the default OHIF ViewerLayout
 */

import React from 'react';

function DentalLayoutTemplate(props) {
  // Import dental components
  const DentalPracticeHeader = require('./components/DentalPracticeHeader').default;
  const { useDentalStore } = require('./stores/useDentalStore');

  // Import the default ViewerLayout
  const ViewerLayout = require('@ohif/extension-default').ViewerLayout;

  // Get dental store data
  const { selectedTeeth, selectTooth, deselectTooth, patientInfo, practiceInfo } =
    useDentalStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dental Practice Header - replaces the standard OHIF header */}
      <div className="flex-shrink-0">
        <DentalPracticeHeader
          practiceInfo={practiceInfo}
          patientInfo={patientInfo}
          selectedTeeth={selectedTeeth}
          onToothSelect={selectTooth}
          onToothDeselect={deselectTooth}
          showToothSelector={true}
        />
      </div>

      {/* Default OHIF ViewerLayout (without its header) */}
      <div className="flex-1 overflow-hidden">
        <ViewerLayout {...props} hideHeader={true} />
      </div>
    </div>
  );
}

function getLayoutTemplateModule() {
  return [
    {
      name: 'dentalViewerLayout',
      id: 'dentalViewerLayout',
      component: DentalLayoutTemplate,
    },
  ];
}

export default getLayoutTemplateModule;
