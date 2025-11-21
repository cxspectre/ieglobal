'use client';

import { useEffect, useState, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      .eq('is_internal', false)
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
          is_internal: false,
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatFullTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading messages...</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-8 py-12">
        <div className="max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-12rem)]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-navy-900 mb-2">Messages</h1>
            <p className="text-xl text-slate-700">Chat with your IE Global team</p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">No projects yet</h2>
              <p className="text-slate-600">Your IE Global team will set up projects here</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              {/* Project Selector */}
              {projects.length > 1 && (
                <div className="px-6 py-4 border-b border-gray-200 bg-white/50">
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none transition-all duration-200"
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
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="w-20 h-20 rounded-full bg-signal-red/10 flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-1">No messages yet</h3>
                    <p className="text-sm text-slate-600 text-center max-w-sm">
                      Start the conversation! Send your first message to the IE Global team.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isCurrentUser = message.sender_id === currentUserId;
                      const isFromTeam = message.profiles?.role === 'admin' || message.profiles?.role === 'employee';
                      const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                      const showTime = index === messages.length - 1 || 
                        new Date(message.created_at).getTime() - new Date(messages[index + 1].created_at).getTime() > 300000; // 5 minutes

                      return (
                        <div key={message.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          {showAvatar && (
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                              isFromTeam 
                                ? 'bg-signal-red text-white' 
                                : 'bg-navy-900 text-white'
                            }`}>
                              {isFromTeam ? 'IE' : (message.profiles?.full_name?.charAt(0) || 'U')}
                            </div>
                          )}
                          {!showAvatar && <div className="w-10 flex-shrink-0" />}

                          {/* Message Bubble */}
                          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                            {(showAvatar || showTime) && (
                              <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs font-semibold text-navy-900">
                                  {isFromTeam ? 'IE Global Team' : message.profiles?.full_name || 'You'}
                                </span>
                                {showTime && (
                                  <span className="text-xs text-slate-500" title={formatFullTime(message.created_at)}>
                                    {formatTime(message.created_at)}
                                  </span>
                                )}
                              </div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                isCurrentUser
                                  ? 'bg-signal-red text-white rounded-br-sm'
                                  : 'bg-white text-navy-900 border border-gray-200 rounded-bl-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message_text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="px-6 py-4 border-t border-gray-200 bg-white/80">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type your message..."
                      rows={1}
                      disabled={sending}
                      className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none resize-none transition-all duration-200 placeholder:text-slate-400"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-slate-400">
                      {newMessage.length > 0 && `${newMessage.length} chars`}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

