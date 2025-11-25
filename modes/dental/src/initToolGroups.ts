/**
 * Initialize Tool Groups for Dental Mode
 * Configures Cornerstone tools for dental imaging workflows
 */

const colours = {
  'viewport-0': 'rgb(43, 122, 155)', // Dental blue
  'viewport-1': 'rgb(43, 155, 122)', // Dental mint
  'viewport-2': 'rgb(155, 122, 43)', // Dental amber
  'viewport-3': 'rgb(122, 43, 155)', // Dental purple
};

function initDefaultToolGroup(extensionManager, toolGroupService, commandsManager, toolGroupId) {
  const utilityModule = extensionManager.getModuleEntry(
    '@ohif/extension-cornerstone.utilityModule.tools'
  );

  const { toolNames, Enums } = utilityModule.exports;

  const tools = {
    active: [
      {
        toolName: toolNames.WindowLevel,
        bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
      },
      {
        toolName: toolNames.Pan,
        bindings: [{ mouseButton: Enums.MouseBindings.Auxiliary }],
      },
      {
        toolName: toolNames.Zoom,
        bindings: [{ mouseButton: Enums.MouseBindings.Secondary }, { numTouchPoints: 2 }],
      },
      {
        toolName: toolNames.StackScroll,
        bindings: [{ mouseButton: Enums.MouseBindings.Wheel }, { numTouchPoints: 3 }],
      },
    ],
    passive: [
      // Dental measurement tools
      { toolName: toolNames.Length }, // For Periapical Length, Crown Width, Root Length
      { toolName: toolNames.Angle }, // For Canal Angle

      // Additional measurement tools
      { toolName: toolNames.Bidirectional },
      { toolName: toolNames.EllipticalROI },
      { toolName: toolNames.CircleROI },
      { toolName: toolNames.RectangleROI },
      { toolName: toolNames.ArrowAnnotate },
      { toolName: toolNames.DragProbe },
      { toolName: toolNames.Probe },
      { toolName: toolNames.CobbAngle },
      { toolName: toolNames.Magnify },
      { toolName: toolNames.CalibrationLine },
      { toolName: toolNames.PlanarFreehandROI },
      { toolName: toolNames.SplineROI },
    ],
    enabled: [
      { toolName: toolNames.ImageOverlayViewer },
      { toolName: toolNames.ReferenceLines },
    ],
    disabled: [],
  };

  toolGroupService.createToolGroupAndAddTools(toolGroupId, tools);
}

function initToolGroups(extensionManager, toolGroupService, commandsManager) {
  // Create dental toolgroup
  initDefaultToolGroup(extensionManager, toolGroupService, commandsManager, 'dental');
}

export default initToolGroups;
