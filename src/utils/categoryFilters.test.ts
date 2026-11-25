import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_CATEGORIES } from '../data/termicoreData';
import {
  filterCategorySkus,
  getCategoryFilterOptions,
} from './categoryFilters';

test('getCategoryFilterOptions extracts sorted current ratings and voltages for PCB terminal blocks', () => {
  const pcb = PRODUCT_CATEGORIES.find((c) => c.id === 'pcb-terminal-blocks');
  assert.ok(pcb, 'pcb-terminal-blocks category exists');

  const options = getCategoryFilterOptions(pcb.skus);
  assert.deepEqual(options.voltages, ['160 V', '320 V', '400 V', '630 V', '800 V', '1000 V']);
  assert.equal(options.currentRatings[0], '6 A');
  assert.equal(options.currentRatings[1], '13.5 A');
  assert.equal(options.currentRatings[options.currentRatings.length - 1], '232 A');
  assert.ok(options.connectionTypes.includes('Push-In Spring'));
  assert.ok(options.connectionTypes.includes('Transformer Terminal'));
});

test('getCategoryFilterOptions places non-numeric current ratings like PE Ground after numeric ampere ratings', () => {
  const springCage = PRODUCT_CATEGORIES.find((c) => c.id === 'spring-cage');
  assert.ok(springCage, 'spring-cage category exists');

  const options = getCategoryFilterOptions(springCage.skus);
  assert.equal(options.currentRatings[0], '6.3 A');
  assert.equal(options.currentRatings[options.currentRatings.length - 1], 'PE Ground');
});

test('filterCategorySkus combines category, current rating, and voltage filters', () => {
  const pcb = PRODUCT_CATEGORIES.find((c) => c.id === 'pcb-terminal-blocks');
  assert.ok(pcb);

  const byCategory = filterCategorySkus(pcb.skus, {
    typeFilter: 'Push-In Spring',
    currentRatingFilter: 'All',
    voltageFilter: 'All',
    isPcbCategory: true,
  });
  assert.ok(byCategory.length > 0);
  assert.ok(byCategory.every((s) => s.connectionType === 'Push-In Spring'));

  const byCurrentAndVoltage = filterCategorySkus(pcb.skus, {
    typeFilter: 'All',
    currentRatingFilter: '24 A',
    voltageFilter: '400 V',
    isPcbCategory: true,
  });
  assert.ok(byCurrentAndVoltage.length > 0);
  assert.ok(
    byCurrentAndVoltage.every(
      (s) => s.currentRating === '24 A' && s.voltageRating === '400 V'
    )
  );
});

test('filterCategorySkus preserves mega-menu processFilter for THR tape-on-reel models', () => {
  const pcb = PRODUCT_CATEGORIES.find((c) => c.id === 'pcb-terminal-blocks');
  assert.ok(pcb);

  const thrModels = filterCategorySkus(pcb.skus, {
    typeFilter: 'All',
    currentRatingFilter: 'All',
    voltageFilter: 'All',
    processFilter: 'thr',
    isPcbCategory: true,
  });
  assert.deepEqual(
    thrModels.map((m) => m.model),
    ['TPC 5.08-THR', 'TPC 3.5-TR']
  );
});
