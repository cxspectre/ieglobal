import { ReactNode } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PortalLayout userType="employee">
      {children}
    </PortalLayout>
  );
}

