/**
 * Tooth Numbering System Utilities
 * Converts between FDI (International) and Universal (US) notation
 */

import { ToothNumber } from '../types';

/**
 * Convert Universal (1-32) to FDI notation (11-48)
 * Universal: 1-16 (upper), 17-32 (lower)
 * FDI: Quadrants 1-4, Teeth 1-8 per quadrant
 */
export function universalToFDI(universal: number): string {
  if (universal < 1 || universal > 32) {
    throw new Error('Universal tooth number must be between 1 and 32');
  }

  // Upper right: 1-8 → 11-18
  if (universal >= 1 && universal <= 8) {
    return `1${9 - universal}`;
  }
  // Upper left: 9-16 → 21-28
  if (universal >= 9 && universal <= 16) {
    return `2${universal - 8}`;
  }
  // Lower left: 17-24 → 31-38
  if (universal >= 17 && universal <= 24) {
    return `3${universal - 16}`;
  }
  // Lower right: 25-32 → 41-48
  return `4${33 - universal}`;
}

/**
 * Convert FDI notation to Universal (1-32)
 */
export function fdiToUniversal(fdi: string): number {
  const quadrant = parseInt(fdi[0]);
  const position = parseInt(fdi[1]);

  if (quadrant < 1 || quadrant > 4 || position < 1 || position > 8) {
    throw new Error('Invalid FDI notation. Must be 11-48');
  }

  switch (quadrant) {
    case 1: // Upper right: 11-18 → 8-1
      return 9 - position;
    case 2: // Upper left: 21-28 → 9-16
      return position + 8;
    case 3: // Lower left: 31-38 → 17-24
      return position + 16;
    case 4: // Lower right: 41-48 → 32-25
      return 33 - position;
    default:
      throw new Error('Invalid quadrant');
  }
}

/**
 * Get complete tooth number object with all notations
 */
export function getToothNumber(
  value: number | string,
  system: 'universal' | 'fdi' = 'universal'
): ToothNumber {
  let universal: number;
  let fdi: string;

  if (system === 'universal') {
    universal = typeof value === 'string' ? parseInt(value) : value;
    fdi = universalToFDI(universal);
  } else {
    fdi = typeof value === 'number' ? value.toString() : value;
    universal = fdiToUniversal(fdi);
  }

  const quadrant = parseInt(fdi[0]);
  const position = parseInt(fdi[1]);

  return {
    fdi,
    universal,
    quadrant,
    position,
  };
}

/**
 * Get all adult teeth (32 permanent teeth)
 */
export function getAllTeeth(): ToothNumber[] {
  const teeth: ToothNumber[] = [];
  for (let i = 1; i <= 32; i++) {
    teeth.push(getToothNumber(i, 'universal'));
  }
  return teeth;
}

/**
 * Get teeth by quadrant
 */
export function getTeethByQuadrant(quadrant: number): ToothNumber[] {
  const allTeeth = getAllTeeth();
  return allTeeth.filter(tooth => tooth.quadrant === quadrant);
}

/**
 * Format tooth number for display
 */
export function formatToothNumber(
  tooth: ToothNumber,
  system: 'universal' | 'fdi' = 'universal',
  includeLabel: boolean = true
): string {
  if (system === 'universal') {
    return includeLabel ? `#${tooth.universal}` : tooth.universal.toString();
  } else {
    return includeLabel ? `FDI ${tooth.fdi}` : tooth.fdi;
  }
}

/**
 * Get quadrant name
 */
export function getQuadrantName(quadrant: number): string {
  const names = {
    1: 'Upper Right',
    2: 'Upper Left',
    3: 'Lower Left',
    4: 'Lower Right',
  };
  return names[quadrant] || 'Unknown';
}

/**
 * Check if tooth is in upper or lower arch
 */
export function isUpperTooth(tooth: ToothNumber): boolean {
  return tooth.quadrant === 1 || tooth.quadrant === 2;
}

/**
 * Check if tooth is on right or left side
 */
export function isRightSideTooth(tooth: ToothNumber): boolean {
  return tooth.quadrant === 1 || tooth.quadrant === 4;
}
