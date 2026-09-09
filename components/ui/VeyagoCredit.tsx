'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const VEYAGO_URL = 'https://www.veyago.cloud';
const VEYAGO_LEGAL_NAME = 'Veyago Inc.';
const ICON_SIZE_PX = 22;

/** "Made by Veyago Inc." credit with the Veyago icon, linking to the Veyago studio site. */
export default function VeyagoCredit({ className = '' }: { className?: string }) {
  const t = useTranslations('footer');

  return (
    <a
      href={VEYAGO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 hover:text-white transition-colors duration-200 ${className}`}
      aria-label={`${t('madeBy')} ${VEYAGO_LEGAL_NAME}`}
    >
      <span>{t('madeBy')}</span>
      <Image
        src="/veyago-icon.png"
        alt=""
        width={ICON_SIZE_PX}
        height={ICON_SIZE_PX}
        className="rounded-md ring-1 ring-white/15 shrink-0"
      />
      <span className="font-semibold text-gray-300">{VEYAGO_LEGAL_NAME}</span>
    </a>
  );
}
