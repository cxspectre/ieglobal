'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
};

type OnboardingData = {
  documents_requested: string[];
};

const documentTemplates: Record<string, { label: string; hasTemplate: boolean; templateUrl?: string }> = {
  'discovery': { 
    label: 'Discovery Questionnaire', 
    hasTemplate: true,
    templateUrl: '/api/templates/discovery-questionnaire'
  },
  'access': { 
    label: 'Access Credentials', 
    hasTemplate: true,
    templateUrl: '/api/templates/access-credentials'
  },
  'brand': { label: 'Brand Files', hasTemplate: false },
  'technical': { label: 'Technical Documentation', hasTemplate: false },
  'nda': { 
    label: 'Non-Disclosure Agreement', 
    hasTemplate: true,
    templateUrl: '/api/templates/nda'
  },
  'other': { label: 'Other Documents', hasTemplate: false },
};

export default function ClientUploadPage() {
  const params = useParams();
  const supabase = createBrowserClient();
  
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadClientData();
  }, [params.clientId]);

  const loadClientData = async () => {
    try {
      // Load client info
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, company_name, contact_person')
        .eq('id', params.clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Load onboarding data to see what documents are requested
      const { data: onboardingInfo } = await (supabase as any)
        .from('client_onboarding_data')
        .select('documents_requested')
        .eq('client_id', params.clientId)
        .single();

      if (onboardingInfo) {
        setOnboardingData(onboardingInfo);
      }

      // Load already uploaded files
      const { data: existingFiles } = await supabase
        .from('files')
        .select('file_name, category')
        .eq('client_id', params.clientId);

      if (existingFiles) {
        const filesByCategory: Record<string, string[]> = {};
        existingFiles.forEach((file: any) => {
          if (!filesByCategory[file.category]) {
            filesByCategory[file.category] = [];
          }
          filesByCategory[file.category].push(file.file_name);
        });
        setUploadedFiles(filesByCategory);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading client data:', err);
      setError('Failed to load client information');
      setLoading(false);
    }
  };

  const handleFileUpload = async (docType: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingFiles({ ...uploadingFiles, [docType]: true });
    setError('');
    setSuccessMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${docType}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `${params.clientId}/${docType}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('client-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('client-documents')
          .getPublicUrl(filePath);

        // Save file record to database
        const { error: dbError } = await (supabase as any)
          .from('files')
          .insert({
            client_id: params.clientId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: urlData.publicUrl,
            storage_path: filePath,
            category: docType,
          });

        if (dbError) throw dbError;
      }

      setSuccessMessage(`✅ Successfully uploaded ${files.length} file(s) for ${documentTemplates[docType]?.label || docType}`);
      
      // Reload uploaded files
      await loadClientData();
      
      // Clear the input
      const input = document.getElementById(`file-${docType}`) as HTMLInputElement;
      if (input) input.value = '';
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Failed to upload files: ${err.message}`);
    } finally {
      setUploadingFiles({ ...uploadingFiles, [docType]: false });
    }
  };

  const downloadTemplate = async (templateUrl: string) => {
    window.open(templateUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Client Not Found</h1>
          <p className="text-slate-700">The upload link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const requestedDocs = onboardingData?.documents_requested || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white py-8 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Image 
              src="/logo.png" 
              alt="IE Global" 
              width={48} 
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-3xl font-bold">Document Upload Portal</h1>
              <p className="text-white/80">Welcome, {client.contact_person}!</p>
            </div>
          </div>
          <p className="text-white/90">
            Upload the requested documents for <strong>{client.company_name}</strong>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-900">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-900">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-signal-red mb-8">
          <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
            <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Upload
          </h2>
          <ol className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-signal-red">1.</span>
              <span>For documents with templates, download our template first (makes it easier!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-signal-red">2.</span>
              <span>Fill out the template or prepare your files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-signal-red">3.</span>
              <span>Click "Choose Files" and select your documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-signal-red">4.</span>
              <span>Files are uploaded instantly and securely</span>
            </li>
          </ol>
        </div>

        {/* Document Upload Cards */}
        <div className="space-y-6">
          {requestedDocs.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-lg text-center">
              <p className="text-slate-700 text-lg">No specific documents have been requested yet.</p>
              <p className="text-slate-600 mt-2">We'll reach out if we need anything!</p>
            </div>
          ) : (
            requestedDocs.map((docType) => {
              const docInfo = documentTemplates[docType] || { label: docType, hasTemplate: false };
              const isUploading = uploadingFiles[docType];
              const uploadedFilesList = uploadedFiles[docType] || [];

              return (
                <div key={docType} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                        <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {docInfo.label}
                      </h3>
                      
                      {uploadedFilesList.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-green-600 mb-1">✓ Uploaded:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {uploadedFilesList.map((fileName, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {fileName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {docInfo.hasTemplate && (
                      <button
                        onClick={() => downloadTemplate(docInfo.templateUrl!)}
                        className="px-4 py-2 bg-off-white border-2 border-navy-900 text-navy-900 text-sm font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Template
                      </button>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="mt-4">
                    <label 
                      htmlFor={`file-${docType}`}
                      className="block"
                    >
                      <div className="border-2 border-dashed border-gray-300 hover:border-signal-red rounded-lg p-6 text-center cursor-pointer transition-colors duration-200">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-semibold text-navy-900 mb-1">
                          {isUploading ? 'Uploading...' : 'Click to choose files or drag and drop'}
                        </p>
                        <p className="text-xs text-slate-600">
                          PDF, Word, Excel, Images (Max 10MB per file)
                        </p>
                      </div>
                      <input
                        id={`file-${docType}`}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                        onChange={(e) => handleFileUpload(docType, e.target.files)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    
                    {isUploading && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-4 h-4 border-2 border-signal-red border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading files...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-lg text-center">
          <p className="text-slate-700 mb-2">
            <strong>Need help?</strong> Contact us at{' '}
            <a href="mailto:hello@ie-global.net" className="text-signal-red font-semibold hover:underline">
              hello@ie-global.net
            </a>
          </p>
          <p className="text-sm text-slate-600">
            All uploads are secure and encrypted. Your documents are only accessible to the IE Global team.
          </p>
        </div>
      </div>
    </div>
  );
}

