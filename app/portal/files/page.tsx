'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.client_id) {
      setLoading(false);
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
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="font-bold text-xl text-navy-900">
              Portal
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/portal" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Overview
              </Link>
              <Link href="/portal/milestones" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Milestones
              </Link>
              <Link href="/portal/invoices" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Invoices
              </Link>
              <Link href="/portal/files" className="text-sm font-medium text-navy-900 border-b-2 border-signal-red pb-0.5">
                Files
              </Link>
              <Link href="/portal/messages" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Messages
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-700 hover:text-signal-red transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-navy-900 mb-8">Files & Documents</h1>

          {files.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700">No files available yet. Your IE Global team will share files here as they become available.</p>
            </div>
          ) : (
            <div className="bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-off-white border-b border-gray-200">
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
                  <tbody className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-off-white transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold text-navy-900">{file.file_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">{formatFileSize(file.file_size)}</span>
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
      </main>
    </div>
  );
}

