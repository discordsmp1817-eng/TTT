import { ProductSku } from '../data/termicoreData';

export type PitchBand = 'All' | 'fine' | 'standard' | 'power';
export type ProcessFilter = 'All' | 'tht' | 'thr' | 'plug';

export interface CategoryFilterCriteria {
  typeFilter: string;
  currentRatingFilter: string;
  voltageFilter: string;
  pitchFilter?: PitchBand;
  processFilter?: ProcessFilter;
  isPcbCategory?: boolean;
}

export interface CategoryFilterOptions {
  connectionTypes: string[];
  currentRatings: string[];
  voltages: string[];
}

export function getPitchBand(pitch?: string): PitchBand {
  if (!pitch) return 'standard';
  const num = parseFloat(pitch);
  if (Number.isNaN(num)) return 'standard';
  if (num < 4.5) return 'fine';
  if (num < 7.0) return 'standard';
  return 'power';
}

export function matchesProcess(mounting: string, process: ProcessFilter): boolean {
  const m = mounting.toLowerCase();
  if (process === 'thr') return m.includes('thr') || m.includes('reflow');
  if (process === 'tht') return m.includes('wave') || m.includes('tht') || m.includes('solder');
  if (process === 'plug') return m.includes('plug') || m.includes('panel');
  return true;
}

function parseCurrentRatingSortKey(currentRating: string): [number, number] {
  const match = currentRating.match(/\d+(?:\.\d+)?/);
  if (!match) return [1, Number.MAX_SAFE_INTEGER];
  const value = Number(match[0]);
  return Number.isNaN(value) ? [1, Number.MAX_SAFE_INTEGER] : [0, value];
}

function parseVoltageSortKey(voltage: string): number {
  const num = parseFloat(voltage.replace(/[^\d.]/g, ''));
  return Number.isNaN(num) ? Number.MAX_SAFE_INTEGER : num;
}

export function getCategoryFilterOptions(skus: ProductSku[]): CategoryFilterOptions {
  const connectionTypes = Array.from(new Set(skus.map((s) => s.connectionType)));

  const currentRatings = Array.from(new Set(skus.map((s) => s.currentRating))).sort((a, b) => {
    const [groupA, valA] = parseCurrentRatingSortKey(a);
    const [groupB, valB] = parseCurrentRatingSortKey(b);
    if (groupA !== groupB) return groupA - groupB;
    if (valA !== valB) return valA - valB;
    return a.localeCompare(b);
  });

  const voltages = Array.from(new Set(skus.map((s) => s.voltageRating))).sort((a, b) => {
    const diff = parseVoltageSortKey(a) - parseVoltageSortKey(b);
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  return {
    connectionTypes,
    currentRatings,
    voltages,
  };
}

export function filterCategorySkus(
  skus: ProductSku[],
  criteria: CategoryFilterCriteria
): ProductSku[] {
  const {
    typeFilter,
    currentRatingFilter,
    voltageFilter,
    pitchFilter = 'All',
    processFilter = 'All',
    isPcbCategory = false,
  } = criteria;

  return skus.filter((sku) => {
    if (typeFilter !== 'All' && sku.connectionType !== typeFilter) return false;
    if (currentRatingFilter !== 'All' && sku.currentRating !== currentRatingFilter) return false;
    if (voltageFilter !== 'All' && sku.voltageRating !== voltageFilter) return false;
    if (isPcbCategory && pitchFilter !== 'All' && getPitchBand(sku.widthOrPitch) !== pitchFilter) {
      return false;
    }
    if (isPcbCategory && processFilter !== 'All' && !matchesProcess(sku.mounting, processFilter)) {
      return false;
    }
    return true;
  });
}
