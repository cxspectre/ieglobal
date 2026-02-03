import { ReactNode } from 'react';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

