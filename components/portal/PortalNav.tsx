'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

type PortalNavProps = {
  userType: 'employee' | 'client';
  userName?: string;
  onLogout: () => void;
};

export default function PortalNav({ userType, userName, onLogout }: PortalNavProps) {
  const pathname = usePathname();

  const employeeLinks = [
    { href: '/dashboard', label: 'Overview', exactMatch: true },
    { href: '/dashboard/clients', label: 'Clients', exactMatch: false },
    { href: '/dashboard/settings', label: 'Settings', exactMatch: true },
  ];

  const clientLinks = [
    { href: '/portal', label: 'Overview', exactMatch: true },
    { href: '/portal/milestones', label: 'Milestones', exactMatch: true },
    { href: '/portal/invoices', label: 'Invoices', exactMatch: true },
    { href: '/portal/files', label: 'Files', exactMatch: true },
    { href: '/portal/messages', label: 'Messages', exactMatch: true },
  ];

  const links = userType === 'employee' ? employeeLinks : clientLinks;
  const baseHref = userType === 'employee' ? '/dashboard' : '/portal';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href={baseHref} className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="IE Global"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {userType === 'employee' ? 'Dashboard' : 'Portal'}
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((link) => {
                const isActive = link.exactMatch 
                  ? pathname === link.href 
                  : pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-navy-900 bg-off-white'
                        : 'text-slate-700 hover:text-navy-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side - User Info & Logout */}
          <div className="flex items-center gap-4">
            {userName && (
              <span className="hidden md:block text-sm text-slate-700">
                {userName}
              </span>
            )}
            <button
              onClick={onLogout}
              className="text-sm font-medium text-slate-700 hover:text-signal-red transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden pb-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            {links.map((link) => {
              const isActive = link.exactMatch 
                ? pathname === link.href 
                : pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'text-navy-900 bg-off-white border-b-2 border-signal-red'
                      : 'text-slate-700 hover:text-navy-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}

