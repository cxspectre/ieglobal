'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';

const portalNavItems = [
  { href: '/portal', label: 'Overview', icon: HomeIcon, exactMatch: true },
  { href: '/portal/milestones', label: 'Milestones', icon: FlagIcon, exactMatch: false },
  { href: '/portal/invoices', label: 'Invoices', icon: DocumentIcon, exactMatch: false },
  { href: '/portal/files', label: 'Files', icon: FolderIcon, exactMatch: false },
  { href: '/portal/messages', label: 'Messages', icon: ChatIcon, exactMatch: false },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function FlagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  );
}
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

type PortalSidebarProps = {
  userName?: string;
  onLogout: () => void;
};

export default function PortalSidebar({ userName, onLogout }: PortalSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const path = pathname || '';
  const isActive = (item: { href: string; exactMatch?: boolean }) => {
    if (item.exactMatch) return path === item.href || path === item.href + '/';
    return path === item.href || path.startsWith(item.href + '/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <Link href="/portal" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <Logo width={36} height={36} href="" invert className="h-9 w-auto shrink-0" />
          <div>
            <span className="block font-semibold text-white text-sm">IE Global</span>
            <span className="block text-xs text-white/60 uppercase tracking-wider">Portal</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {portalNavItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active ? 'bg-signal-red text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        {userName && (
          <Link
            href="/portal/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <UserIcon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{userName}</span>
          </Link>
        )}
        <button
          onClick={() => { setMobileOpen(false); onLogout(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogoutIcon className="w-5 h-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-900 text-white shadow-lg"
        aria-label="Open menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-navy-900">
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 transform transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close menu">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
