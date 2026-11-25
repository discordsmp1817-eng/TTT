import {
  IMAGES,
  PRODUCT_CATEGORIES,
  ProductCategory,
  ProductSku,
} from '../data/termicoreData';

export const DIN_RAIL_CATEGORY_IDS = [
  'spring-cage',
  'screw-connection',
  'screw-support',
  'bolt-connection',
  'nut-connection',
] as const;

export const DIN_RAIL_GROUP_ID = 'din-rail-terminal-block';

export type NeedFilter =
  | 'all'
  | 'control'
  | 'vibration'
  | 'pcb'
  | 'high-power'
  | 'distribution'
  | 'test-disconnect';

export interface CatalogGroupEntry {
  kind: 'group';
  id: typeof DIN_RAIL_GROUP_ID;
  title: string;
  shortTitle: string;
  seriesCode: string;
  classification: string;
  tagline: string;
  image: string;
  imageAlt: string;
  wireRangeSummary: string;
  currentMaxSummary: string;
  voltageMaxSummary: string;
  railCompatibility: string;
  totalModels: number;
  childCategories: ProductCategory[];
}

export interface CatalogCategoryEntry {
  kind: 'category';
  id: string;
  title: string;
  shortTitle: string;
  seriesCode: string;
  classification: string;
  tagline: string;
  image: string;
  imageAlt: string;
  wireRangeSummary: string;
  currentMaxSummary: string;
  voltageMaxSummary: string;
  railCompatibility: string;
  totalModels: number;
  category: ProductCategory;
}

export type CatalogTopEntry = CatalogGroupEntry | CatalogCategoryEntry;

export function isDinRailCategoryId(id: string): boolean {
  return (DIN_RAIL_CATEGORY_IDS as readonly string[]).includes(id);
}

export function buildCatalogTopEntries(
  categories: ProductCategory[] = PRODUCT_CATEGORIES
): CatalogTopEntry[] {
  const dinChildren = categories.filter((c) => isDinRailCategoryId(c.id));
  const otherCategories = categories.filter((c) => !isDinRailCategoryId(c.id));

  const entries: CatalogTopEntry[] = [];

  if (dinChildren.length > 0) {
    const totalModels = dinChildren.reduce((sum, c) => sum + c.skus.length, 0);
    entries.push({
      kind: 'group',
      id: DIN_RAIL_GROUP_ID,
      title: 'DIN Rail Terminal Block',
      shortTitle: 'DIN Rail',
      seriesCode: 'TSC · TSC-R · TSS · TBC · TNC',
      classification: `DIN Rail · ${dinChildren.length} Series`,
      tagline:
        'TS 35 & G 32 control, metering, heavy lug & 1-nut distribution blocks up to 300 A',
      image: IMAGES.heroDinRail,
      imageAlt: 'Termiflux DIN Rail Terminal Block portfolio mounted on TS 35 rail',
      wireRangeSummary: '0.2 – 120 mm²',
      currentMaxSummary: '300 A',
      voltageMaxSummary: '1000 V',
      railCompatibility: 'TS 35 / G 32 DIN Rail',
      totalModels,
      childCategories: dinChildren,
    });
  }

  for (const cat of otherCategories) {
    entries.push({
      kind: 'category',
      id: cat.id,
      title: cat.title,
      shortTitle: cat.shortTitle,
      seriesCode: cat.seriesCode,
      classification: cat.classification,
      tagline: cat.tagline,
      image: cat.image,
      imageAlt: cat.imageAlt,
      wireRangeSummary: cat.wireRangeSummary,
      currentMaxSummary: cat.currentMaxSummary,
      voltageMaxSummary: cat.voltageMaxSummary,
      railCompatibility: cat.railCompatibility,
      totalModels: cat.skus.length,
      category: cat,
    });
  }

  return entries;
}

export function matchesCategoryNeed(cat: ProductCategory, need: NeedFilter): boolean {
  switch (need) {
    case 'control':
      return (
        cat.id === 'spring-cage' ||
        cat.id === 'screw-connection' ||
        cat.id === 'screw-support' ||
        cat.id === 'barrier-terminal-blocks'
      );
    case 'vibration':
      return (
        cat.id === 'spring-cage' ||
        cat.id === 'screw-support' ||
        cat.id === 'pcb-connectors'
      );
    case 'pcb':
      return (
        cat.id === 'pcb-terminal-blocks' ||
        cat.id === 'pcb-connectors' ||
        cat.id === 'barrier-terminal-blocks'
      );
    case 'test-disconnect':
      return cat.skus.some(
        (s) =>
          s.connectionType.toLowerCase().includes('disconnect') ||
          s.connectionType.toLowerCase().includes('fuse') ||
          s.name.toLowerCase().includes('test')
      );
    case 'high-power':
      return cat.id === 'bolt-connection' || cat.id === 'nut-connection';
    case 'distribution':
      return cat.id === 'nut-connection';
    case 'all':
    default:
      return true;
  }
}

export function matchesCatalogEntryNeed(
  entry: CatalogTopEntry,
  need: NeedFilter
): boolean {
  if (entry.kind === 'group') {
    return entry.childCategories.some((child) => matchesCategoryNeed(child, need));
  }
  return matchesCategoryNeed(entry.category, need);
}

function categoryMatchesQuery(cat: ProductCategory, query: string): boolean {
  const catHit =
    cat.title.toLowerCase().includes(query) ||
    cat.seriesCode.toLowerCase().includes(query) ||
    cat.classification.toLowerCase().includes(query) ||
    cat.tagline.toLowerCase().includes(query) ||
    cat.wireRangeSummary.toLowerCase().includes(query) ||
    cat.currentMaxSummary.toLowerCase().includes(query);

  if (catHit) return true;

  return cat.skus.some(
    (sku) =>
      sku.model.toLowerCase().includes(query) ||
      sku.name.toLowerCase().includes(query) ||
      sku.connectionType.toLowerCase().includes(query) ||
      sku.wireRangeIec.toLowerCase().includes(query) ||
      sku.currentRating.toLowerCase().includes(query)
  );
}

export function filterCatalogTopEntries(
  entries: CatalogTopEntry[],
  options: {
    activeFilter: string;
    needFilter: NeedFilter;
    searchQuery: string;
  }
): CatalogTopEntry[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    if (options.activeFilter !== 'all' && entry.id !== options.activeFilter) {
      return false;
    }
    if (!matchesCatalogEntryNeed(entry, options.needFilter)) {
      return false;
    }
    if (!normalizedQuery) return true;

    if (entry.kind === 'group') {
      const groupHit =
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.seriesCode.toLowerCase().includes(normalizedQuery) ||
        entry.classification.toLowerCase().includes(normalizedQuery) ||
        entry.tagline.toLowerCase().includes(normalizedQuery) ||
        entry.wireRangeSummary.toLowerCase().includes(normalizedQuery) ||
        entry.currentMaxSummary.toLowerCase().includes(normalizedQuery);
      return (
        groupHit ||
        entry.childCategories.some((child) => categoryMatchesQuery(child, normalizedQuery))
      );
    }

    return categoryMatchesQuery(entry.category, normalizedQuery);
  });
}

export function getMatchingSkusForEntries(
  entries: CatalogTopEntry[],
  options: {
    activeFilter: string;
    needFilter: NeedFilter;
    searchQuery: string;
  }
): (ProductSku & { categoryTitle: string; image: string })[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();
  if (!normalizedQuery && options.needFilter !== 'test-disconnect') return [];

  const pool = entries
    .filter((entry) =>
      options.activeFilter === 'all' ? true : entry.id === options.activeFilter
    )
    .filter((entry) => matchesCatalogEntryNeed(entry, options.needFilter))
    .flatMap((entry) =>
      entry.kind === 'group' ? entry.childCategories : [entry.category]
    );

  return pool.flatMap((cat) =>
    cat.skus
      .filter((sku) => {
        const matchesSearch =
          !normalizedQuery ||
          sku.model.toLowerCase().includes(normalizedQuery) ||
          sku.name.toLowerCase().includes(normalizedQuery) ||
          sku.connectionType.toLowerCase().includes(normalizedQuery) ||
          sku.wireRangeIec.toLowerCase().includes(normalizedQuery) ||
          sku.currentRating.toLowerCase().includes(normalizedQuery) ||
          sku.voltageRating.toLowerCase().includes(normalizedQuery) ||
          cat.title.toLowerCase().includes(normalizedQuery) ||
          cat.seriesCode.toLowerCase().includes(normalizedQuery);

        const matchesDisconnectNeed =
          options.needFilter !== 'test-disconnect' ||
          sku.connectionType.toLowerCase().includes('disconnect') ||
          sku.connectionType.toLowerCase().includes('fuse') ||
          sku.name.toLowerCase().includes('test');

        return matchesSearch && matchesDisconnectNeed;
      })
      .map((sku) => ({
        ...sku,
        categoryTitle: cat.title,
        image: sku.image || cat.image,
      }))
  );
}
