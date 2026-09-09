'use client';

import { useTranslations } from 'next-intl';
import { VeyagoCredit as ReusableVeyagoCredit } from '@/packages/veyago-credit/VeyagoCredit';

/** Site wrapper around the reusable credit: adds the translated label and the footer hover colour. */
export default function VeyagoCredit({ className = '' }: { className?: string }) {
  const t = useTranslations('footer');

  return (
    <span className={`hover:text-white transition-colors duration-200 ${className}`}>
      <ReusableVeyagoCredit label={t('madeBy')} iconSrc="/veyago-icon.png" />
    </span>
  );
}
