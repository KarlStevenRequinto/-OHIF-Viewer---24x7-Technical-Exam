/**
 * Measurement Tools Panel
 * Provides quick access buttons to activate measurement tools
 */

import React from 'react';
import classNames from 'classnames';

interface MeasurementTool {
  id: string;
  name: string;
  icon: string;
  label: string;
  tooltip: string;
}

const MEASUREMENT_TOOLS: MeasurementTool[] = [
  {
    id: 'Length',
    name: 'Length',
    icon: '📏',
    label: 'Length',
    tooltip: 'Measure linear distance',
  },
  {
    id: 'Angle',
    name: 'Angle',
    icon: '📐',
    label: 'Angle',
    tooltip: 'Measure angles',
  },
  {
    id: 'Bidirectional',
    name: 'Bidirectional',
    icon: '↔️',
    label: 'Bidirectional',
    tooltip: 'Measure width and height',
  },
  {
    id: 'EllipticalROI',
    name: 'EllipticalROI',
    icon: '⭕',
    label: 'Ellipse',
    tooltip: 'Measure elliptical region',
  },
  {
    id: 'RectangleROI',
    name: 'RectangleROI',
    icon: '▭',
    label: 'Rectangle',
    tooltip: 'Measure rectangular region',
  },
  {
    id: 'Probe',
    name: 'Probe',
    icon: '🎯',
    label: 'Probe',
    tooltip: 'Point measurement',
  },
];

const VIEWING_TOOLS = [
  {
    id: 'Zoom',
    name: 'Zoom',
    icon: '🔍',
    label: 'Zoom',
    tooltip: 'Zoom in/out',
  },
  {
    id: 'Pan',
    name: 'Pan',
    icon: '✋',
    label: 'Pan',
    tooltip: 'Pan image',
  },
  {
    id: 'WindowLevel',
    name: 'WindowLevel',
    icon: '🎚️',
    label: 'W/L',
    tooltip: 'Adjust window/level',
  },
];

interface Props {
  commandsManager: any;
}

const MeasurementToolsPanel: React.FC<Props> = ({ commandsManager }) => {
  const [activeTool, setActiveTool] = React.useState<string | null>(null);

  const handleToolClick = (tool: MeasurementTool) => {
    try {
      commandsManager.runCommand('setToolActive', {
        toolName: tool.name,
      });
      setActiveTool(tool.id);
      console.log(`✅ Activated tool: ${tool.name}`);
    } catch (error) {
      console.error(`❌ Failed to activate tool: ${tool.name}`, error);
    }
  };

  const handleViewingToolClick = (tool: any) => {
    try {
      commandsManager.runCommand('setToolActive', {
        toolName: tool.name,
      });
      setActiveTool(tool.id);
      console.log(`✅ Activated viewing tool: ${tool.name}`);
    } catch (error) {
      console.error(`❌ Failed to activate viewing tool: ${tool.name}`, error);
    }
  };

  const handleResetView = () => {
    try {
      commandsManager.runCommand('resetViewport');
      console.log('✅ Reset viewport');
    } catch (error) {
      console.error('❌ Failed to reset viewport', error);
    }
  };

  return (
    <div className="p-3 space-y-4" style={{ backgroundColor: 'var(--dental-background)' }}>
      {/* Measurement Tools Section */}
      <div>
        <h3
          className="text-xs font-semibold mb-2 uppercase tracking-wide"
          style={{ color: 'var(--dental-text)' }}
        >
          📏 Measurement Tools
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {MEASUREMENT_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              title={tool.tooltip}
              className={classNames(
                'flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200',
                'border-2 hover:scale-105 active:scale-95',
                activeTool === tool.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-300 hover:border-blue-400'
              )}
              style={{
                backgroundColor:
                  activeTool === tool.id ? 'var(--dental-primary)' : 'var(--dental-surface)',
                color: activeTool === tool.id ? 'white' : 'var(--dental-text)',
              }}
            >
              <span className="text-2xl mb-1">{tool.icon}</span>
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewing Tools Section */}
      <div>
        <h3
          className="text-xs font-semibold mb-2 uppercase tracking-wide"
          style={{ color: 'var(--dental-text)' }}
        >
          👁️ Viewing Tools
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {VIEWING_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleViewingToolClick(tool)}
              title={tool.tooltip}
              className={classNames(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200',
                'border-2 hover:scale-105 active:scale-95',
                activeTool === tool.id
                  ? 'border-green-500 shadow-lg'
                  : 'border-gray-300 hover:border-green-400'
              )}
              style={{
                backgroundColor:
                  activeTool === tool.id ? '#10b981' : 'var(--dental-surface)',
                color: activeTool === tool.id ? 'white' : 'var(--dental-text)',
              }}
            >
              <span className="text-xl mb-1">{tool.icon}</span>
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3
          className="text-xs font-semibold mb-2 uppercase tracking-wide"
          style={{ color: 'var(--dental-text)' }}
        >
          ⚡ Quick Actions
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleResetView}
            className="w-full py-2 px-3 rounded-lg border-2 border-gray-300 hover:border-orange-400 transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--dental-surface)',
              color: 'var(--dental-text)',
            }}
          >
            <span className="text-lg">🔄</span>
            <span className="text-sm font-medium">Reset View</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="p-3 rounded-lg border"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'var(--dental-primary)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--dental-text)' }}>
          💡 <strong>Tip:</strong> Click a measurement tool, then click and drag on the image to
          create measurements.
        </p>
      </div>
    </div>
  );
};

export default MeasurementToolsPanel;
