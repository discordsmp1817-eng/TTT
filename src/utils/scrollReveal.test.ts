import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLogoFlightTransform,
  computeScrollProgress,
  getDirectionOffset,
  getGridItemDirection,
  getResponsiveColumnCount,
} from './scrollReveal';

test('getDirectionOffset maps left, right, up, and down to clean pixel offsets', () => {
  assert.deepEqual(getDirectionOffset('left', 60), { x: -60, y: 0 });
  assert.deepEqual(getDirectionOffset('right', 60), { x: 60, y: 0 });
  assert.deepEqual(getDirectionOffset('up', 60), { x: 0, y: -51 });
  assert.deepEqual(getDirectionOffset('down', 60), { x: 0, y: 51 });
});

test('getDirectionOffset clamps negative distances safely to zero', () => {
  assert.deepEqual(getDirectionOffset('left', -20), { x: -0, y: 0 });
  assert.deepEqual(getDirectionOffset('down', 0), { x: 0, y: 0 });
});

test('getGridItemDirection quad pattern cycles through all four directions', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((i) => getGridItemDirection(i, 'quad')),
    ['left', 'down', 'right', 'up', 'left']
  );
});

test('getGridItemDirection columns pattern maps 3-column and 4-column rows cleanly', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5].map((i) => getGridItemDirection(i, 'columns', 3)),
    ['left', 'down', 'right', 'left', 'up', 'right']
  );

  assert.deepEqual(
    [0, 1, 2, 3].map((i) => getGridItemDirection(i, 'columns', 4)),
    ['left', 'down', 'up', 'right']
  );
});

test('getGridItemDirection split and alternating-ud alternate as expected', () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((i) => getGridItemDirection(i, 'split', 2)),
    ['left', 'right', 'left', 'right']
  );
  assert.deepEqual(
    [0, 1, 2, 3].map((i) => getGridItemDirection(i, 'alternating-ud')),
    ['down', 'up', 'down', 'up']
  );
});

test('getResponsiveColumnCount scales down gracefully for mobile and tablet widths', () => {
  assert.equal(getResponsiveColumnCount(390, 4), 1);
  assert.equal(getResponsiveColumnCount(768, 4), 2);
  assert.equal(getResponsiveColumnCount(1280, 4), 4);
  assert.equal(getResponsiveColumnCount(1280, 3), 3);
});

test('computeLogoFlightTransform computes exact center-to-navbar delta and scale', () => {
  const source = { left: 672, top: 402, width: 96, height: 96 };
  const target = { left: 96, top: 16, width: 36, height: 36 };
  assert.deepEqual(computeLogoFlightTransform(source, target), {
    x: -606,
    y: -416,
    scale: 0.375,
  });
});

test('computeScrollProgress maps scroll offset to clamped 0..1 progress', () => {
  assert.equal(computeScrollProgress(0, 3000, 900), 0);
  assert.equal(computeScrollProgress(1050, 3000, 900), 0.5);
  assert.equal(computeScrollProgress(2100, 3000, 900), 1);
  assert.equal(computeScrollProgress(-40, 3000, 900), 0);
  assert.equal(computeScrollProgress(2500, 3000, 900), 1);
  assert.equal(computeScrollProgress(100, 800, 900), 0);
});
