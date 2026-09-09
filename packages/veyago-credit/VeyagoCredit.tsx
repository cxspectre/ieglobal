import type { CSSProperties, ReactElement } from 'react';

/**
 * "Made by Veyago Inc." credit.
 *
 * Dependency-free: plain React, inline styles, no router, no i18n, no image
 * loader. Drop this file into any React, Next.js, Remix or Vite project.
 * Colour is inherited from the surrounding text, so it fits any footer.
 */

export const VEYAGO_URL = 'https://www.veyago.cloud';
export const VEYAGO_NAME = 'Veyago Inc.';
export const VEYAGO_ICON_URL = 'https://www.veyago.cloud/assets/veyago-icon.png';

const DEFAULT_LABEL = 'Made by';
const DEFAULT_ICON_SIZE_PX = 22;
const ICON_RADIUS_RATIO = 0.27;

export type VeyagoCreditProps = {
  /** Text before the icon. Translate it here, e.g. "Erstellt von". */
  label?: string;
  /** Text after the icon. */
  name?: string;
  /** Link target. */
  href?: string;
  /** Icon URL; defaults to the icon hosted on veyago.cloud. Point it at a local copy if you prefer. */
  iconSrc?: string;
  /** Icon size in CSS pixels. */
  size?: number;
  /** Open the link in a new tab. */
  newTab?: boolean;
  className?: string;
  style?: CSSProperties;
};

const linkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5em',
  color: 'inherit',
  textDecoration: 'none',
  font: 'inherit',
};

const nameStyle: CSSProperties = { fontWeight: 600 };

function iconStyle(size: number): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: Math.round(size * ICON_RADIUS_RATIO),
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.15)',
    flexShrink: 0,
  };
}

export function VeyagoCredit({
  label = DEFAULT_LABEL,
  name = VEYAGO_NAME,
  href = VEYAGO_URL,
  iconSrc = VEYAGO_ICON_URL,
  size = DEFAULT_ICON_SIZE_PX,
  newTab = true,
  className,
  style,
}: VeyagoCreditProps): ReactElement {
  const targetProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a
      href={href}
      {...targetProps}
      className={className}
      style={{ ...linkStyle, ...style }}
      aria-label={`${label} ${name}`}
    >
      <span>{label}</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- intentionally framework-agnostic */}
      <img src={iconSrc} alt="" width={size} height={size} loading="lazy" style={iconStyle(size)} />
      <span style={nameStyle}>{name}</span>
    </a>
  );
}

export default VeyagoCredit;
