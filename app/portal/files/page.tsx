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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (fileType.includes('image')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-3">Files</h1>
          <p className="text-xl text-slate-700">Access all your project documents and files</p>
        </div>

          {files.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">No files yet</h2>
            <p className="text-slate-600">Your IE Global team will upload project files here</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.map((file) => (
              <div key={file.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-900 truncate mb-1">{file.file_name}</h3>
                    <p className="text-xs text-slate-600">{formatFileSize(file.file_size)}</p>
                  </div>
                          </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  {file.category && (
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-slate-700 font-medium">
                      {file.category}
                          </span>
                  )}
                  <span>{new Date(file.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>

                          <button
                            onClick={() => downloadFile(file)}
                  className="w-full px-4 py-2 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
              </div>
            ))}
            </div>
          )}
    </div>
  );
}
