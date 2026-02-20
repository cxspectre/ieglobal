'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  birth_date: string | null;
  phone: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  bio: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [identities, setIdentities] = useState<{ id: string; provider: string }[]>([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setEditForm({
          full_name: data.full_name || '',
          birth_date: data.birth_date || '',
          phone: data.phone || '',
          address_street: data.address_street || '',
          address_city: data.address_city || '',
          address_postal_code: data.address_postal_code || '',
          address_country: data.address_country || '',
          bio: data.bio || '',
        });
        const { data: idData } = await supabase.auth.getUserIdentities();
        const list = ((idData as unknown) as { identities?: { id: string; provider: string }[] } | null)?.identities ?? [];
        setIdentities(list.map((i) => ({ id: i.id, provider: i.provider })));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setLoading(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    loadProfile();
  };

  const saveProfile = async () => {
    setSaveLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          birth_date: editForm.birth_date || null,
          phone: editForm.phone || null,
          address_street: editForm.address_street || null,
          address_city: editForm.address_city || null,
          address_postal_code: editForm.address_postal_code || null,
          address_country: editForm.address_country || null,
          bio: editForm.bio || null,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      await loadProfile();
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile: ' + err.message);
    }
    setSaveLoading(false);
  };

  const handleLinkMicrosoft = async () => {
    setLinkLoading(true);
    setPasswordMessage('');
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(pathname || '/en/portal/profile')}`
        : undefined;
      const { error: linkError } = await supabase.auth.linkIdentity({
        provider: 'azure',
        options: { redirectTo },
      });
      if (linkError) throw linkError;
    } catch (err: any) {
      const msg = err.message || '';
      const isManualLinkingDisabled = /manual linking is disabled/i.test(msg);
      setPasswordMessage(
        isManualLinkingDisabled
          ? 'Linking is disabled in your Supabase project. Enable it in Dashboard → Authentication → Settings → "Enable manual linking".'
          : msg || 'Could not connect Microsoft account'
      );
      setLinkLoading(false);
    }
  };

  const handleUnlinkMicrosoft = async () => {
    const identity = identities.find((i) => i.provider === 'azure');
    if (!identity) return;
    setUnlinkLoading(identity.id);
    try {
      const { error } = await (supabase.auth as any).unlinkIdentity(identity);
      if (error) throw error;
      setIdentities((prev) => prev.filter((i) => i.id !== identity.id));
    } catch (err: any) {
      setPasswordMessage(err.message || 'Could not disconnect Microsoft account');
    }
    setUnlinkLoading(null);
  };

  const requestPasswordReset = async () => {
    setPasswordLoading(true);
    setPasswordMessage('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user.email) {
        alert('Unable to send password reset. Please contact support.');
        setPasswordLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setPasswordMessage('Password reset email sent! Check your inbox and follow the instructions.');
    } catch (err: any) {
      console.error('Error requesting password reset:', err);
      setPasswordMessage('Failed to send password reset email: ' + err.message);
    }
    setPasswordLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Profile not found</h1>
          <button onClick={() => router.back()} className="text-signal-red font-medium hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-12 lg:pt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">My profile</h1>
        <p className="text-slate-600 text-sm">Manage your personal information and account settings</p>
      </div>

      <div className="rounded-2xl bg-white p-6 lg:p-8 shadow-sm border border-slate-200/80 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-navy-900">Personal information</h2>
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy-900 text-sm font-semibold rounded-xl transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy-900 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saveLoading}
                className="px-4 py-2.5 bg-signal-red text-white text-sm font-semibold rounded-xl hover:bg-signal-red/90 transition-colors disabled:opacity-50"
              >
                {saveLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">Address</label>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.address_street}
                  onChange={(e) => setEditForm({ ...editForm, address_street: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editForm.address_postal_code}
                    onChange={(e) => setEditForm({ ...editForm, address_postal_code: e.target.value })}
                    placeholder="Postal code"
                    className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                  />
                  <input
                    type="text"
                    value={editForm.address_city}
                    onChange={(e) => setEditForm({ ...editForm, address_city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                  />
                </div>
                <input
                  type="text"
                  value={editForm.address_country}
                  onChange={(e) => setEditForm({ ...editForm, address_country: e.target.value })}
                  placeholder="Country"
                  className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">Bio</label>
              <textarea
                rows={4}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none rounded-xl resize-none transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Full Name</p>
                <p className="font-semibold text-navy-900">{profile.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="font-semibold text-navy-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Birth Date</p>
                <p className="font-semibold text-navy-900">
                  {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Phone</p>
                <p className="font-semibold text-navy-900">{profile.phone || '—'}</p>
              </div>
            </div>
            {(profile.address_street || profile.address_city) && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Address</p>
                <p className="font-semibold text-navy-900">
                  {profile.address_street && <>{profile.address_street}<br /></>}
                  {profile.address_postal_code} {profile.address_city}
                  {profile.address_country && <><br />{profile.address_country}</>}
                </p>
              </div>
            )}
            {profile.bio && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Bio</p>
                <p className="text-slate-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 lg:p-8 shadow-sm border border-slate-200/80 mb-6">
        <h2 className="text-xl font-bold text-navy-900 mb-6">Account settings</h2>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Role</p>
            <p className="font-semibold text-navy-900 capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Member Since</p>
            <p className="font-semibold text-navy-900">
              {new Date(profile.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 lg:p-8 shadow-sm border border-slate-200/80 mb-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Connected accounts</h2>
        <p className="text-sm text-slate-600 mb-6">
          Link your Microsoft account to sign in without a password.
        </p>
        <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
          <span className="flex items-center gap-2 text-navy-900 font-medium">
            <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
              <path d="M1 1h10v10H1zM12 1h10v10H12zM1 12h10v10H1zM12 12h10v10H12z" fillOpacity=".9" />
            </svg>
            Microsoft
          </span>
          {identities.some((i) => i.provider === 'azure') ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-600 font-medium">Connected</span>
              <button
                type="button"
                onClick={handleUnlinkMicrosoft}
                disabled={unlinkLoading !== null}
                className="text-sm font-medium text-slate-500 hover:text-signal-red disabled:opacity-50"
              >
                {unlinkLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLinkMicrosoft}
              disabled={linkLoading}
              className="px-4 py-2 text-sm font-semibold text-signal-red hover:bg-signal-red/10 rounded-xl disabled:opacity-50"
            >
              {linkLoading ? 'Redirecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 lg:p-8 shadow-sm border border-slate-200/80">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Password</h2>
        <p className="text-sm text-slate-600 mb-6">
          Click the button below to receive a password reset link via email.
        </p>
        <button
          onClick={requestPasswordReset}
          disabled={passwordLoading}
          className="px-6 py-3 rounded-xl bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {passwordLoading ? 'Sending...' : 'Send password reset email'}
        </button>
        {passwordMessage && (
          <div className={`mt-4 p-4 rounded-xl ${
            passwordMessage.includes('Failed') || passwordMessage.includes('Could not')
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <p className="text-sm">{passwordMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

