export type ScrollRevealDirection = 'left' | 'right' | 'up' | 'down';

export type GridDirectionPattern =
  | 'quad'
  | 'split'
  | 'columns'
  | 'alternating-lr'
  | 'alternating-ud';

export interface RevealOffset {
  x: number;
  y: number;
}

const QUAD_SEQUENCE: ScrollRevealDirection[] = ['left', 'down', 'right', 'up'];
const FOUR_COL_SEQUENCE: ScrollRevealDirection[] = ['left', 'down', 'up', 'right'];

export function getDirectionOffset(
  direction: ScrollRevealDirection,
  distance = 56
): RevealOffset {
  const safeDistance = Math.max(0, distance);
  const verticalDistance = Math.round(safeDistance * 0.85);

  switch (direction) {
    case 'left':
      return { x: -safeDistance, y: 0 };
    case 'right':
      return { x: safeDistance, y: 0 };
    case 'up':
      return { x: 0, y: -verticalDistance };
    case 'down':
    default:
      return { x: 0, y: verticalDistance };
  }
}

export function getGridItemDirection(
  index: number,
  pattern: GridDirectionPattern = 'quad',
  columns = 3
): ScrollRevealDirection {
  const safeIndex = Math.max(0, Math.floor(index));

  switch (pattern) {
    case 'split':
    case 'alternating-lr':
      return safeIndex % 2 === 0 ? 'left' : 'right';

    case 'alternating-ud':
      return safeIndex % 2 === 0 ? 'down' : 'up';

    case 'columns': {
      const safeCols = Math.max(2, Math.min(4, Math.floor(columns)));
      const col = safeIndex % safeCols;
      const row = Math.floor(safeIndex / safeCols);

      if (safeCols === 2) {
        return col === 0 ? 'left' : 'right';
      }
      if (safeCols === 4) {
        return row % 2 === 0
          ? FOUR_COL_SEQUENCE[col]
          : FOUR_COL_SEQUENCE[(col + 2) % 4];
      }
      // 3-column layout: left edge slides from left, right edge from right, center alternates down/up
      if (col === 0) return 'left';
      if (col === 2) return 'right';
      return row % 2 === 0 ? 'down' : 'up';
    }

    case 'quad':
    default:
      return QUAD_SEQUENCE[safeIndex % QUAD_SEQUENCE.length];
  }
}

export function getResponsiveColumnCount(
  width: number,
  maxColumns: 2 | 3 | 4
): number {
  if (width < 640) return 1;
  if (width < 1024) return Math.min(2, maxColumns);
  return maxColumns;
}

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LogoFlightTransform {
  x: number;
  y: number;
  scale: number;
}

export function computeLogoFlightTransform(
  source: RectLike,
  target: RectLike
): LogoFlightTransform {
  const safeSourceWidth = Math.max(1, source.width);
  const safeSourceHeight = Math.max(1, source.height);

  const sourceCenterX = source.left + safeSourceWidth / 2;
  const sourceCenterY = source.top + safeSourceHeight / 2;
  const targetCenterX = target.left + target.width / 2;
  const targetCenterY = target.top + target.height / 2;

  const scale = target.width > 0 ? target.width / safeSourceWidth : 1;

  return {
    x: Math.round((targetCenterX - sourceCenterX) * 100) / 100,
    y: Math.round((targetCenterY - sourceCenterY) * 100) / 100,
    scale: Math.round(scale * 10000) / 10000,
  };
}

export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  const maxScroll = scrollHeight - viewportHeight;
  if (!Number.isFinite(scrollY) || !Number.isFinite(maxScroll) || maxScroll <= 0) {
    return 0;
  }
  const ratio = scrollY / maxScroll;
  if (ratio <= 0) return 0;
  if (ratio >= 1) return 1;
  return Math.round(ratio * 10000) / 10000;
}
