'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

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

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full pt-12 lg:pt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Messages</h1>
        <p className="text-slate-600 text-sm">Communicate with your IE Global team</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
          <p className="text-slate-600">No projects yet.</p>
        </div>
      ) : (
        <>
          {projects.length > 1 && (
            <div className="mb-6 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
              <label className="block text-sm font-semibold text-navy-900 mb-2">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none transition-colors"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 mb-6 border border-slate-200/80 shadow-sm overflow-y-auto max-h-[500px] min-h-[300px]">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No messages yet. Send your first message below.
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
                      <div className={`max-w-[75%] ${isCurrentUser ? 'ml-auto' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {isFromTeam ? 'IE Global Team' : message.profiles?.full_name || 'You'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-4 rounded-xl ${
                            isCurrentUser
                              ? 'bg-signal-red text-white'
                              : 'bg-slate-100 text-navy-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{message.message_text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to IE Global team..."
                rows={3}
                disabled={sending}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none resize-none transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-3 rounded-xl bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

