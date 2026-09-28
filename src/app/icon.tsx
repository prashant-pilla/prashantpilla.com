import { ImageResponse } from 'next/og';

/** "P" monogram favicon, generated at build time. Mirrors the Graphite palette. */
export const dynamic = 'force-static';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0e0e0e',
        color: '#d9a066',
        borderRadius: 14,
        fontFamily: 'serif',
        fontSize: 46,
        lineHeight: 1,
        paddingBottom: 4,
      }}
    >
      P
    </div>,
    size,
  );
}
