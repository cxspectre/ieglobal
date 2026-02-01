'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function FilesPage() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadFiles();
  }, [params.id]);

  const loadFiles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Load files
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading files:', error);
    } else {
      setFiles(data || []);
    }
    
    setLoading(false);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${params.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('client-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL (signed URL for security)
      const { data: { publicUrl } } = supabase.storage
        .from('client-files')
        .getPublicUrl(filePath);

      // Save file record to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          client_id: params.id as string,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          storage_path: filePath,
          category: 'document',
          uploaded_by: session.user.id,
        } as any);

      if (dbError) throw dbError;

      // Reload files
      await loadFiles();
      
      alert(`File "${file.name}" uploaded successfully!`);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      alert('Failed to upload: ' + err.message);
    }
    setUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const downloadFile = async (file: FileItem) => {
    try {
      // Get signed URL for secure download
      const { data, error } = await supabase.storage
        .from('client-files')
        .createSignedUrl(file.storage_path, 60); // Valid for 60 seconds

      if (error) throw error;

      if (data?.signedUrl) {
        // Open signed URL in new tab to trigger download
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

  const deleteFile = async (file: FileItem) => {
    if (!confirm(`Delete "${file.file_name}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('client-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // Reload
      await loadFiles();
    } catch (err: any) {
      console.error('Error deleting file:', err);
      alert('Failed to delete: ' + err.message);
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
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/dashboard/clients/${params.id}`}
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-4 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Client
            </Link>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Files & Documents</h1>
            <p className="text-slate-700">Upload and manage files for this client</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white p-8 mb-6 border-l-4 border-signal-red">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Upload File</h2>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="flex items-center gap-4"
            >
              <label className="flex-1 cursor-pointer">
                <div className={`flex items-center justify-center gap-3 px-6 py-4 bg-off-white border-2 border-dashed transition-all duration-200 ${
                  isDragging 
                    ? 'border-signal-red bg-signal-red/5' 
                    : 'border-gray-300 hover:border-signal-red hover:bg-gray-50'
                }`}>
                  <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">
                    {uploading ? 'Uploading...' : isDragging ? 'Drop file here' : 'Click to select or drag and drop'}
                  </span>
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Supported: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP (Max 50MB)
            </p>
          </div>

          {/* Files List */}
          {files.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700">No files uploaded yet.</p>
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
                          <span className="text-sm text-slate-700">{formatFileSize(file.file_size ?? 0)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => downloadFile(file)}
                              className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => deleteFile(file)}
                              className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
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

