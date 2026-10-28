import { ImageResponse } from 'next/og';

/**
 * The brand mark as a PNG. `fullBleed` fills the square (iOS rounds the corners itself,
 * maskable icons crop to a circle); otherwise the rounded tile sits on a transparent ground.
 */
export function renderIcon(size: number, fullBleed = false) {
  const unit = size / 24;
  const square = (x: number, y: number, side: number, radius: number) => (
    <div
      style={{
        position: 'absolute',
        left: x * unit,
        top: y * unit,
        width: side * unit,
        height: side * unit,
        borderRadius: radius * unit,
        backgroundColor: '#ffffff',
      }}
    />
  );

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: fullBleed ? 0 : 2 * unit,
          top: fullBleed ? 0 : 2 * unit,
          width: fullBleed ? size : 20 * unit,
          height: fullBleed ? size : 20 * unit,
          borderRadius: fullBleed ? 0 : 6 * unit,
          backgroundColor: '#171717',
        }}
      />
      {square(6.5, 6.5, 4.5, 1.2)}
      {square(13, 6.5, 4.5, 1.2)}
      {square(6.5, 13, 4.5, 1.2)}
      {square(13.5, 13.5, 3.5, 1)}
    </div>,
    { width: size, height: size },
  );
}
