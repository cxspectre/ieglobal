import { ReactNode } from 'react';
import PortalLayoutWrapper from '@/components/portal/PortalLayout';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayoutWrapper userType="client">
      {children}
    </PortalLayoutWrapper>
  );
}

