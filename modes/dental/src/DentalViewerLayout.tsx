/**
 * Dental Viewer Layout
 * Custom layout that replaces the standard OHIF header with the Dental Practice Header
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icons, useModal } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { preserveQueryParameters } from '@ohif/app';
import { Types } from '@ohif/core';

// Import the Dental Practice Header
import { DentalPracticeHeader, useDentalStore } from '@ohif/extension-dental';

/**
 * Dental Viewer Layout Component
 * This layout uses the Dental Practice Header instead of the standard OHIF ViewerHeader
 */
function DentalViewerLayout({
  children,
  leftPanels,
  rightPanels,
  viewports,
  servicesManager,
  commandsManager,
  extensionManager,
}) {
  const { customizationService } = servicesManager.services;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { show } = useModal();

  // Get dental store data
  const { selectedTeeth, selectTooth, deselectTooth, patientInfo, practiceInfo } =
    useDentalStore();

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);

    const dataSourceName = pathname.substring(dataSourceIdx + 1);
    const existingDataSource = extensionManager.getDataSources(dataSourceName);

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1 && existingDataSource) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery);

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Dental Practice Header - replaces standard OHIF header */}
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

      {/* Main content area - render children */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

DentalViewerLayout.propTypes = {
  children: PropTypes.node,
  leftPanels: PropTypes.array,
  rightPanels: PropTypes.array,
  viewports: PropTypes.array,
  servicesManager: PropTypes.object,
  commandsManager: PropTypes.object,
  extensionManager: PropTypes.object,
};

export default DentalViewerLayout;
