import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIN_RAIL_CATEGORY_IDS,
  DIN_RAIL_GROUP_ID,
  buildCatalogTopEntries,
  filterCatalogTopEntries,
  getMatchingSkusForEntries,
} from './catalogGrouping';

test('buildCatalogTopEntries replaces the 5 individual DIN-rail cards with a single DIN Rail Terminal Block parent entry', () => {
  const entries = buildCatalogTopEntries();
  assert.equal(entries.length, 4);
  assert.deepEqual(
    entries.map((e) => e.title),
    [
      'DIN Rail Terminal Block',
      'PCB Terminal Blocks',
      'PCB Connectors',
      'Barrier Terminal Blocks',
    ]
  );

  for (const dinId of DIN_RAIL_CATEGORY_IDS) {
    assert.equal(
      entries.some((e) => e.id === dinId),
      false,
      `Individual DIN rail category ${dinId} must not appear at top level`
    );
  }

  const dinParent = entries[0];
  assert.equal(dinParent.kind, 'group');
  assert.equal(dinParent.id, DIN_RAIL_GROUP_ID);
  if (dinParent.kind === 'group') {
    assert.equal(dinParent.childCategories.length, 5);
    assert.deepEqual(
      dinParent.childCategories.map((c) => c.id),
      [...DIN_RAIL_CATEGORY_IDS]
    );
    assert.ok(dinParent.totalModels > 20);
  }
});

test('filterCatalogTopEntries matches DIN Rail parent when searching for a child series or SKU', () => {
  const entries = buildCatalogTopEntries();

  const springSearch = filterCatalogTopEntries(entries, {
    activeFilter: 'all',
    needFilter: 'all',
    searchQuery: 'Spring Cage',
  });
  assert.deepEqual(
    springSearch.map((e) => e.id),
    [DIN_RAIL_GROUP_ID]
  );

  const highPower = filterCatalogTopEntries(entries, {
    activeFilter: 'all',
    needFilter: 'high-power',
    searchQuery: '',
  });
  assert.deepEqual(
    highPower.map((e) => e.id),
    [DIN_RAIL_GROUP_ID]
  );
});

test('getMatchingSkusForEntries still finds individual DIN-rail SKUs inside the parent group', () => {
  const entries = buildCatalogTopEntries();
  const skus = getMatchingSkusForEntries(entries, {
    activeFilter: DIN_RAIL_GROUP_ID,
    needFilter: 'all',
    searchQuery: 'TSC 4',
  });
  assert.ok(skus.some((s) => s.model === 'TSC 4'));
});
