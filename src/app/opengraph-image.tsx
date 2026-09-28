import { ImageResponse } from 'next/og';
import { profile } from '@content/profile';

/**
 * Default social card, rendered once at build time (static export).
 *
 * Satori cannot read CSS custom properties, so the Graphite palette from
 * src/styles/tokens.css is mirrored here as literal values. Keep the two
 * in sync if the default theme changes.
 */
const BG = '#0e0e0e';
const FG = '#f2ede4';
const MUTED = '#a39e94';
const ACCENT = '#d9a066';
const HERO_C = 'rgb(92 78 66)';

export const dynamic = 'force-static';
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: BG,
        backgroundImage: `radial-gradient(60% 70% at 78% 20%, rgba(217,160,102,0.35), transparent 70%), radial-gradient(50% 60% at 15% 90%, ${HERO_C}, transparent 70%)`,
        color: FG,
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 22,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: MUTED,
        }}
      >
        <span>prashantpilla.com</span>
        <span>
          {profile.location.city}, {profile.location.region}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 148, lineHeight: 0.95, letterSpacing: -6 }}>{profile.name}</div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 36, color: MUTED }}>
          <span>{profile.role}</span>
          <span style={{ margin: '0 16px' }}>—</span>
          <span style={{ color: ACCENT }}>{profile.tagline}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 4, background: ACCENT }} />
        <div style={{ fontSize: 24, color: MUTED, letterSpacing: 1 }}>{profile.bio}</div>
      </div>
    </div>,
    size,
  );
}
