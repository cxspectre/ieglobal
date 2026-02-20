'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

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

type ProfileDocument = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  storage_path: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
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
        const { data } = await supabase.auth.getUserIdentities();
        const list = (data as { identities?: { id: string; provider: string }[] })?.identities ?? [];
        setIdentities(list.map((i) => ({ id: i.id, provider: i.provider })));
        // Load profile documents
        const { data: docs } = await (supabase as any)
          .from('profile_documents')
          .select('id, file_name, file_type, file_size, created_at, storage_path')
          .eq('profile_id', session.user.id)
          .order('created_at', { ascending: false });
        setDocuments(docs ?? []);
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

  const downloadDocument = async (doc: ProfileDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('profile-documents')
        .download(doc.storage_path);
      if (error) throw error;
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert('Failed to download: ' + err?.message);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    const b = bytes ?? 0;
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleLinkMicrosoft = async () => {
    setLinkLoading(true);
    setPasswordMessage('');
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(pathname || '/en/dashboard/profile')}`
        : undefined;
      const { error: linkError } = await supabase.auth.linkIdentity({
        provider: 'azure',
        options: { redirectTo },
      });
      if (linkError) throw linkError;
      // Redirect happens; if we're still here, something went wrong
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
    const id = identities.find((i) => i.provider === 'azure')?.id;
    if (!id) return;
    setUnlinkLoading(id);
    try {
      const { error } = await supabase.auth.unlinkIdentity({ identityId: id });
      if (error) throw error;
      setIdentities((prev) => prev.filter((i) => i.id !== id));
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

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partner': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-navy-900 mb-2">Profile not found</h1>
          <p className="text-slate-600 mb-4">We couldn&apos;t load your profile.</p>
          <button
            onClick={() => router.back()}
            className="text-signal-red font-medium hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Header */}
      <div className="bg-navy-900 px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-8 shadow-xl shadow-black/15">
        <div className="max-w-[900px] mx-auto">
          <p className="text-white/50 text-sm mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Profile</h1>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-160px)] p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto space-y-6">
          {/* Profile hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {profile.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">{profile.full_name || '—'}</h2>
                    <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded border ${getRoleStyle(profile.role)}`}>
                      {profile.role}
                    </span>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="px-4 py-2 text-sm font-medium text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
                    >
                      Edit profile
                    </button>
                  ) : (
                    <div className="flex gap-2 self-start sm:self-auto">
                      <button onClick={cancelEditing} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        disabled={saveLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-signal-red hover:bg-signal-red/90 rounded-xl disabled:opacity-50"
                      >
                        {saveLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
                <a href={`mailto:${profile.email}`} className="text-signal-red hover:underline text-sm mt-1 inline-block">
                  {profile.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Personal info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Personal information</h2>
            {isEditing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Birth date</label>
                    <input
                      type="date"
                      value={editForm.birth_date}
                      onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.address_street}
                      onChange={(e) => setEditForm({ ...editForm, address_street: e.target.value })}
                      placeholder="Street address"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.address_postal_code}
                        onChange={(e) => setEditForm({ ...editForm, address_postal_code: e.target.value })}
                        placeholder="Postal code"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      />
                      <input
                        type="text"
                        value={editForm.address_city}
                        onChange={(e) => setEditForm({ ...editForm, address_city: e.target.value })}
                        placeholder="City"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      value={editForm.address_country}
                      onChange={(e) => setEditForm({ ...editForm, address_country: e.target.value })}
                      placeholder="Country"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                  <textarea
                    rows={4}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Birth date</p>
                  <p className="font-medium text-navy-900">{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                  <p className="font-medium text-navy-900">{profile.phone || '—'}</p>
                </div>
                {(profile.address_street || profile.address_city) && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500 mb-0.5">Address</p>
                    <p className="font-medium text-navy-900">
                      {profile.address_street && <>{profile.address_street}<br /></>}
                      {[profile.address_postal_code, profile.address_city].filter(Boolean).join(' ')}
                      {profile.address_country && <><br />{profile.address_country}</>}
                    </p>
                  </div>
                )}
                {profile.bio && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500 mb-0.5">Bio</p>
                    <p className="text-navy-900 whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Account & documents side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
            >
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Member since</p>
                  <p className="font-medium text-navy-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Connected accounts</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-navy-900">
                        <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor">
                          <path d="M1 1h10v10H1zM12 1h10v10H12zM1 12h10v10H1zM12 12h10v10H12z" fillOpacity=".9" />
                        </svg>
                        Microsoft
                      </span>
                      {identities.some((i) => i.provider === 'azure') ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium">Connected</span>
                          <button
                            type="button"
                            onClick={handleUnlinkMicrosoft}
                            disabled={unlinkLoading !== null}
                            className="text-xs font-medium text-slate-500 hover:text-signal-red disabled:opacity-50"
                          >
                            {unlinkLoading ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLinkMicrosoft}
                          disabled={linkLoading}
                          className="px-3 py-1.5 text-sm font-medium text-signal-red hover:bg-signal-red/10 rounded-lg disabled:opacity-50"
                        >
                          {linkLoading ? 'Redirecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Link your Microsoft account to sign in without a password.</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Password</p>
                  <button
                    onClick={requestPasswordReset}
                    disabled={passwordLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-signal-red hover:bg-signal-red/90 rounded-xl disabled:opacity-50"
                  >
                    {passwordLoading ? 'Sending...' : 'Reset password'}
                  </button>
                  {passwordMessage && (
                    <p className={`mt-3 text-sm ${passwordMessage.includes('Failed') || passwordMessage.includes('Could not') ? 'text-red-600' : 'text-green-600'}`}>
                      {passwordMessage}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
            >
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">My documents</h2>
              <p className="text-xs text-slate-500 mb-4">Contracts, agreements, and files shared with you.</p>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No documents yet.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="font-medium text-navy-900 truncate text-sm">{doc.file_name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="px-3 py-1.5 text-sm font-medium text-signal-red hover:bg-signal-red/10 rounded-lg flex-shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

