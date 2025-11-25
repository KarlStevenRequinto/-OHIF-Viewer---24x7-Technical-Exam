/**
 * Toolbar Buttons Configuration for Dental Mode
 * Adds custom dental measurement button alongside default tools
 */

const toolbarButtons = [
  // Measurement tools group
  {
    id: 'MeasurementTools',
    uiType: 'ohif.splitButton',
    props: {
      groupId: 'MeasurementTools',
      primary: {
        id: 'Length',
        icon: 'tool-length',
        label: 'Length',
        type: 'tool',
        commands: [
          {
            commandName: 'setToolActive',
            commandOptions: {
              toolName: 'Length',
            },
            context: 'CORNERSTONE',
          },
        ],
      },
      secondary: {
        icon: 'chevron-down',
        label: '',
        isActive: true,
        tooltip: 'More Measure Tools',
      },
      items: [
        {
          id: 'Length',
          icon: 'tool-length',
          label: 'Length',
          type: 'tool',
          commands: [
            {
              commandName: 'setToolActive',
              commandOptions: {
                toolName: 'Length',
              },
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'Angle',
          icon: 'tool-angle',
          label: 'Angle',
          type: 'tool',
          commands: [
            {
              commandName: 'setToolActive',
              commandOptions: {
                toolName: 'Angle',
              },
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'Bidirectional',
          icon: 'tool-bidirectional',
          label: 'Bidirectional',
          type: 'tool',
          commands: [
            {
              commandName: 'setToolActive',
              commandOptions: {
                toolName: 'Bidirectional',
              },
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'EllipticalROI',
          icon: 'tool-elipse',
          label: 'Ellipse',
          type: 'tool',
          commands: [
            {
              commandName: 'setToolActive',
              commandOptions: {
                toolName: 'EllipticalROI',
              },
              context: 'CORNERSTONE',
            },
          ],
        },
      ],
    },
  },

  // 🦷 DENTAL MEASUREMENTS BUTTON
  {
    id: 'DentalMeasurements',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-measure',
      label: 'Dental Measurements',
      commands: [
        {
          commandName: 'toggleDentalMeasurementsPalette',
          commandOptions: {},
          context: 'DENTAL',
        },
      ],
    },
  },

  // Zoom tools
  {
    id: 'Zoom',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-zoom',
      label: 'Zoom',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'Zoom',
          },
          context: 'CORNERSTONE',
        },
      ],
    },
  },

  // Window level
  {
    id: 'WindowLevel',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-window-level',
      label: 'Window Level',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'WindowLevel',
          },
          context: 'CORNERSTONE',
        },
      ],
    },
  },

  // Pan
  {
    id: 'Pan',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-move',
      label: 'Pan',
      commands: [
        {
          commandName: 'setToolActive',
          commandOptions: {
            toolName: 'Pan',
          },
          context: 'CORNERSTONE',
        },
      ],
    },
  },

  // Capture
  {
    id: 'Capture',
    uiType: 'ohif.radioGroup',
    props: {
      icon: 'tool-capture',
      label: 'Capture',
      commands: [
        {
          commandName: 'showDownloadViewportModal',
          commandOptions: {},
          context: 'CORNERSTONE',
        },
      ],
    },
  },

  // Layout
  {
    id: 'Layout',
    uiType: 'ohif.layoutSelector',
    props: {
      rows: 3,
      columns: 3,
    },
  },

  // More tools
  {
    id: 'MoreTools',
    uiType: 'ohif.splitButton',
    props: {
      groupId: 'MoreTools',
      primary: {
        id: 'Reset',
        icon: 'tool-reset',
        label: 'Reset',
        type: 'tool',
        commands: [
          {
            commandName: 'resetViewport',
            commandOptions: {},
            context: 'CORNERSTONE',
          },
        ],
      },
      secondary: {
        icon: 'chevron-down',
        label: '',
        isActive: true,
        tooltip: 'More Tools',
      },
      items: [
        {
          id: 'Reset',
          icon: 'tool-reset',
          label: 'Reset View',
          type: 'tool',
          commands: [
            {
              commandName: 'resetViewport',
              commandOptions: {},
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'Rotate Right',
          icon: 'tool-rotate-right',
          label: 'Rotate Right',
          type: 'tool',
          commands: [
            {
              commandName: 'rotateViewportCW',
              commandOptions: {},
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'Flip Horizontal',
          icon: 'tool-flip-horizontal',
          label: 'Flip Horizontally',
          type: 'tool',
          commands: [
            {
              commandName: 'flipViewportHorizontal',
              commandOptions: {},
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'Invert',
          icon: 'tool-invert',
          label: 'Invert',
          type: 'tool',
          commands: [
            {
              commandName: 'invertViewport',
              commandOptions: {},
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'Magnify',
          icon: 'tool-magnify',
          label: 'Magnify',
          type: 'tool',
          commands: [
            {
              commandName: 'setToolActive',
              commandOptions: {
                toolName: 'Magnify',
              },
              context: 'CORNERSTONE',
            },
          ],
        },
        {
          id: 'CalibrationLine',
          icon: 'tool-calibration',
          label: 'Calibration',
          type: 'tool',
          commands: [
            {
              commandName: 'setToolActive',
              commandOptions: {
                toolName: 'CalibrationLine',
              },
              context: 'CORNERSTONE',
            },
          ],
        },
      ],
    },
  },
];

export default toolbarButtons;
