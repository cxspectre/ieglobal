'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Message = {
  id: string;
  message_text: string;
  is_internal: boolean;
  created_at: string;
  sender_id: string;
  profiles: {
    full_name: string;
    role: string;
  };
};

type Project = {
  id: string;
  name: string;
};

export default function ClientMessagesPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMessages(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    setCurrentUserId(session.user.id);

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

    // Load projects
    const { data: projectsData } = await (supabase as any)
      .from('projects')
      .select('id, name')
      .eq('client_id', profile.client_id)
      .order('created_at', { ascending: false });

    if (projectsData && projectsData.length > 0) {
      setProjects(projectsData);
      setSelectedProjectId(projectsData[0].id);
    }
    
    setLoading(false);
  };

  const loadMessages = async (projectId: string) => {
    const { data: messagesData } = await (supabase as any)
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          full_name,
          role
        )
      `)
      .eq('project_id', projectId)
      .eq('is_internal', false) // Only show non-internal messages
      .order('created_at', { ascending: true });

    if (messagesData) {
      setMessages(messagesData);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          project_id: selectedProjectId,
          sender_id: session.user.id,
          message_text: newMessage.trim(),
          is_internal: false, // Clients can never send internal messages
        } as any);

      if (error) throw error;

      setNewMessage('');
      await loadMessages(selectedProjectId);
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send: ' + err.message);
    }
    setSending(false);
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
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
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
              <Link href="/portal/files" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Files
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
      <div className="flex-1 flex flex-col p-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Messages</h1>
            <p className="text-slate-700">Communicate with your IE Global team</p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700">No projects yet.</p>
            </div>
          ) : (
            <>
              {/* Project Selector */}
              {projects.length > 1 && (
                <div className="mb-6">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 bg-white p-6 mb-6 overflow-y-auto max-h-[500px]">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-700">
                    No messages yet. Send your first message!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.sender_id === currentUserId;
                      const isFromTeam = message.profiles?.role === 'admin' || message.profiles?.role === 'employee';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isCurrentUser ? 'ml-auto' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-700">
                                {isFromTeam ? 'IE Global Team' : message.profiles?.full_name || 'You'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div
                              className={`p-4 rounded-lg ${
                                isCurrentUser
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-navy-900'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.message_text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white p-6 border-l-4 border-signal-red">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message to IE Global team..."
                      rows={3}
                      disabled={sending}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

