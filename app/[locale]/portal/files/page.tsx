'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type FileItem = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string | null;
  created_at: string;
  storage_path: string;
};

export default function ClientFilesPage() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [profile, setProfile] = useState<{ client_id?: string } | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Get profile
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single();

    setProfile(profile);
    if (!profile?.client_id) {
      setLoading(false);
      setFiles([]);
      return;
    }

    // Load files
    const { data: filesData } = await supabase
      .from('files')
      .select('*')
      .eq('client_id', profile.client_id)
      .order('created_at', { ascending: false });

    if (filesData) setFiles(filesData);
    
    setLoading(false);
  };

  const downloadFile = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-files')
        .createSignedUrl(file.storage_path, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = file.file_name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download: ' + err.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    const b = bytes ?? 0;
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-12 lg:pt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Files</h1>
        <p className="text-slate-600 text-sm">Shared documents from your IE Global team</p>
      </div>

      {!profile?.client_id ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
          <p className="text-slate-600">Your account is not yet linked to a client. Contact <a href="mailto:hello@ie-global.net" className="text-signal-red font-medium hover:underline">hello@ie-global.net</a> for access.</p>
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
          <p className="text-slate-600">No files yet. Your IE Global team will share files here as they become available.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold text-navy-900">{file.file_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">{formatFileSize(file.file_size ?? 0)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => downloadFile(file)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
    </div>
  );
}

