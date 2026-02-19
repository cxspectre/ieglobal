import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getShowcaseItems } from '@/lib/showcase';
import { verifyToken } from '@/lib/showcase-auth';
import ShowcaseView from './ShowcaseView';
import PasswordGate from './PasswordGate';

export const metadata: Metadata = {
  title: 'Showcase',
  description: 'Selected projects.',
  robots: 'noindex, nofollow',
};

export default async function ShowcasePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('showcase_access')?.value;
  const isUnlocked = verifyToken(token);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white antialiased">
        <PasswordGate />
      </div>
    );
  }

  const items = await getShowcaseItems();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white antialiased">
      <ShowcaseView items={items} />
    </div>
  );
}
