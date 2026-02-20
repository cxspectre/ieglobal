'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const MAIN_SITE_LOGO = 'https://ie-global.net/logo.png';

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  href?: string;
  /** Use white/inverted style (e.g. on dark sidebar) */
  invert?: boolean;
};

function LogoSvg({
  className,
  invert,
  compact,
}: {
  className?: string;
  invert?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-bold tracking-tight text-navy-900',
        invert && 'text-white',
        compact ? 'text-sm' : 'text-lg',
        className
      )}
      aria-hidden
    >
      {compact ? 'IE' : 'IE Global'}
    </span>
  );
}

export function Logo({ width = 150, height = 50, className, href = '/', invert }: LogoProps) {
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [imgError, setImgError] = useState(false);
  const compact = width <= 50;

  const handleImgError = () => {
    if (logoSrc === '/logo.png') {
      setLogoSrc(MAIN_SITE_LOGO);
    } else {
      setImgError(true);
    }
  };

  const content = imgError ? (
    <LogoSvg className={className} invert={invert} compact={compact} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt="IE Global"
      width={width}
      height={height}
      className={cn('h-auto w-auto', invert && 'brightness-0 invert', className)}
      onError={handleImgError}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }
  return <span className="inline-flex items-center">{content}</span>;
}
