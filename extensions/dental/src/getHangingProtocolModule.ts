/**
 * Hanging Protocol Module for Dental Mode
 * Defines the 2x2 layout protocol for dental imaging workflows
 */

/**
 * Dental 2x2 Hanging Protocol
 * Layout:
 *   Top-left: Current/Active image
 *   Top-right: Prior exam (same modality for comparison)
 *   Bottom-left: Bitewing placeholder
 *   Bottom-right: Bitewing placeholder
 */
const dental2x2Protocol = {
  id: 'dental2x2',
  name: 'Dental 2x2',
  createdDate: '2025-01-22',
  modifiedDate: '2025-01-22',
  availableTo: {},
  editableBy: {},
  protocolMatchingRules: [
    {
      id: 'dentalStudyMatch',
      weight: 25,
      attribute: 'StudyDescription',
      constraint: {
        contains: {
          value: 'dental',
        },
      },
      required: false,
    },
    {
      id: 'dentalModalityMatch',
      weight: 20,
      attribute: 'Modality',
      constraint: {
        equals: {
          value: 'DX', // Digital Radiography
        },
      },
      required: false,
    },
  ],
  displaySetSelectors: {
    currentImageSelector: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'numImageFrames',
          constraint: {
            greaterThan: {
              value: 0,
            },
          },
        },
      ],
      studyMatchingRules: [],
    },
    priorImageSelector: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'numImageFrames',
          constraint: {
            greaterThan: {
              value: 0,
            },
          },
        },
      ],
      studyMatchingRules: [],
    },
    bitewing1Selector: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'numImageFrames',
          constraint: {
            greaterThan: {
              value: 0,
            },
          },
        },
      ],
      studyMatchingRules: [],
    },
    bitewing2Selector: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'numImageFrames',
          constraint: {
            greaterThan: {
              value: 0,
            },
          },
        },
      ],
      studyMatchingRules: [],
    },
  },
  stages: [
    {
      id: 'dental2x2Stage',
      name: 'Dental 2x2 Layout',
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 2,
          columns: 2,
        },
      },
      viewports: [
        {
          viewportOptions: {
            viewportId: 'dental-current',
            viewportType: 'stack',
            orientation: 'axial',
            toolGroupId: 'dental',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'voi',
                id: 'dental-voi',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'currentImageSelector',
            },
          ],
          x: 0,
          y: 0,
          width: 1,
          height: 1,
        },
        {
          viewportOptions: {
            viewportId: 'dental-prior',
            viewportType: 'stack',
            orientation: 'axial',
            toolGroupId: 'dental',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'voi',
                id: 'dental-voi',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'priorImageSelector',
            },
          ],
          x: 1,
          y: 0,
          width: 1,
          height: 1,
        },
        {
          viewportOptions: {
            viewportId: 'dental-bitewing1',
            viewportType: 'stack',
            orientation: 'axial',
            toolGroupId: 'dental',
            initialImageOptions: {
              preset: 'middle',
            },
          },
          displaySets: [
            {
              id: 'bitewing1Selector',
            },
          ],
          x: 0,
          y: 1,
          width: 1,
          height: 1,
        },
        {
          viewportOptions: {
            viewportId: 'dental-bitewing2',
            viewportType: 'stack',
            orientation: 'axial',
            toolGroupId: 'dental',
            initialImageOptions: {
              preset: 'middle',
            },
          },
          displaySets: [
            {
              id: 'bitewing2Selector',
            },
          ],
          x: 1,
          y: 1,
          width: 1,
          height: 1,
        },
      ],
    },
  ],
  numberOfPriorsReferenced: 1,
};

/**
 * Get Hanging Protocol Module
 */
function getHangingProtocolModule() {
  return [
    {
      name: dental2x2Protocol.id,
      protocol: dental2x2Protocol,
    },
  ];
}

export default getHangingProtocolModule;
