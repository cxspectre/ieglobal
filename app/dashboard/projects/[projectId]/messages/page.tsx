'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  client_id: string;
};

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
    
    // Set up realtime subscription for new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `project_id=eq.${params.projectId}`
        }, 
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.projectId]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    setCurrentUserId(session.user.id);

    // Load project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .single();

    if (projectData) setProject(projectData);

    // Load messages with sender profiles
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          full_name,
          role
        )
      `)
      .eq('project_id', params.projectId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error loading messages:', messagesError);
    }

    if (messagesData) {
      console.log('Loaded messages:', messagesData);
      setMessages(messagesData as any);
    }
    
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          project_id: params.projectId as string,
          sender_id: session.user.id,
          message_text: newMessage.trim(),
          is_internal: isInternal,
        } as any);

      if (error) throw error;

      setNewMessage('');
      setIsInternal(false);
      
      // Force reload messages
      await loadData();
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
          <p className="text-slate-700">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl text-navy-900">
              IE Global
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Overview
              </Link>
              <Link href="/dashboard/clients" className="text-sm font-medium text-navy-900">
                Clients
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

      {/* Main Content - Flex Container */}
      <div className="flex-1 flex flex-col p-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            {project && (
              <Link
                href={`/dashboard/clients/${project.client_id}`}
                className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-4 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Client
              </Link>
            )}
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              {project?.name || 'Project'} - Messages
            </h1>
            <p className="text-slate-700">Communicate with your team and client</p>
          </div>

          {/* Messages Container - Scrollable */}
          <div className="flex-1 bg-white p-6 mb-6 overflow-y-auto max-h-[500px]">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-700">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isCurrentUser ? 'ml-auto' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {message.profiles?.full_name || 'User'}
                          </span>
                          {message.is_internal && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold">
                              INTERNAL
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            isCurrentUser
                              ? 'bg-signal-red text-white'
                              : message.is_internal
                              ? 'bg-yellow-50 border border-yellow-200 text-navy-900'
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
                  placeholder="Type your message..."
                  rows={3}
                  disabled={sending}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-signal-red border-gray-300 rounded focus:ring-signal-red"
                  />
                  <span className="text-sm text-slate-700">
                    Internal note (not visible to client)
                  </span>
                </label>
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
        </div>
      </div>
    </div>
  );
}

