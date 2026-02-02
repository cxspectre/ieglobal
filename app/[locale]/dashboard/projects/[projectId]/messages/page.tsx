'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  status: string;
  clients: {
    company_name: string;
    contact_person: string;
  };
};

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadData();
    
    // Set up realtime subscription
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

    // Load project with client info
    const { data: projectData } = await supabase
      .from('projects')
      .select('*, clients(company_name, contact_person)')
      .eq('id', params.projectId)
      .single();

    if (projectData) setProject(projectData as any);

    // Load messages
    const { data: messagesData } = await supabase
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

    if (messagesData) {
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
      
      await loadData();
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send: ' + err.message);
    }
    setSending(false);
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
    <div className="-mt-8 -mx-8 -mb-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Compact Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-navy-900 to-navy-800 text-white shadow-lg px-8 py-4 flex-shrink-0"
      >
        <div className="flex items-center justify-between">
          {/* Left: Back + Project Info */}
          <div className="flex items-center gap-4">
            {project && (
              <Link
                href={`/dashboard/clients/${project.client_id}`}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Back to Client"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {project?.name || 'Messages'}
            </h1>
              <p className="text-sm text-white/70">
                {project?.clients?.company_name || 'Project Conversation'}
              </p>
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-green-200">Live</span>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-off-white to-gray-50 overflow-hidden">
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
            {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg text-slate-700 mb-2">No messages yet</p>
                <p className="text-sm text-slate-600">Type below to start the conversation!</p>
              </div>
              </div>
            ) : (
              <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isCurrentUser = message.sender_id === currentUserId;
                  const isEmployee = message.profiles?.role === 'employee' || message.profiles?.role === 'admin';
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isCurrentUser ? 'ml-auto' : ''}`}>
                        {/* Message Header */}
                        <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {!isCurrentUser && (
                            <div className="w-8 h-8 bg-gradient-to-br from-navy-900 to-navy-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {message.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-navy-900">
                            {isCurrentUser ? 'You' : message.profiles?.full_name || 'User'}
                          </span>
                          {message.is_internal && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded border border-orange-200">
                              INTERNAL
                            </span>
                          )}
                          {isEmployee && !isCurrentUser && (
                            <span className="px-2 py-0.5 bg-navy-900 text-white text-xs font-bold rounded">
                              TEAM
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {new Date(message.created_at).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? 'bg-signal-red text-white rounded-br-sm'
                              : message.is_internal
                              ? 'bg-orange-50 border-2 border-orange-200 text-navy-900 rounded-bl-sm'
                              : 'bg-white border-2 border-gray-200 text-navy-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.message_text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
              </div>
            )}
          </div>

        {/* Message Input - Always Visible at Bottom */}
        <div className="flex-shrink-0 px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4"
          >
            <form onSubmit={handleSendMessage}>
              {/* Compact Input Row */}
              <div className="flex items-end gap-3">
                {/* Internal Toggle (Compact) */}
                <label className="flex items-center gap-2 px-3 py-2 bg-off-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0">
                  <div className="relative">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-orange-500 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                  </div>
                  <span className={`text-xs font-semibold ${isInternal ? 'text-orange-600' : 'text-slate-600'}`}>
                    {isInternal ? '🔒 Internal' : 'Internal'}
                  </span>
                </label>

                {/* Message Input */}
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
                    placeholder={isInternal ? "Internal note (team only)..." : "Type your message..."}
                    rows={2}
                    disabled={sending}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none transition-all duration-200 resize-none ${
                      isInternal
                        ? 'border-orange-300 focus:border-orange-500 bg-orange-50/50'
                        : 'border-gray-300 focus:border-signal-red'
                    }`}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                    ⏎
                  </div>
                </div>

                {/* Send Button - Compact Icon Only */}
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`p-3 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0 ${
                    isInternal
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-signal-red text-white hover:bg-signal-red/90'
                  }`}
                  title={sending ? 'Sending...' : isInternal ? 'Send Internal Note' : 'Send Message'}
                >
                  {sending ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
