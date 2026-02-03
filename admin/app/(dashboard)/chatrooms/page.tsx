'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Smile, Ban, UserX, Trash2, UserCircle, AlertCircle, Loader2 } from 'lucide-react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { adminApi } from '@/lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bunch.up.railway.app/api';

interface Conversation {
  _id: string;
  type: 'dm' | 'group' | 'global' | 'market';
  title?: string;
  slug?: string;
  market_id?: string;
  participant_count: number;
  last_message_at?: string;
}

interface Message {
  _id: string;
  text: string;
  sender_id: any;
  created_at: string;
  reactions?: Record<string, string[]>;
}

interface AdminAction {
  type: 'ban' | 'mute' | 'delete-messages';
  userId: string;
  username: string;
}

export default function ChatroomsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<AdminAction | null>(null);
  const [banReason, setBanReason] = useState('');
  const [muteDuration, setMuteDuration] = useState('3600'); // 1 hour default
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 50;

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv?._id) {
      console.log('Selected conversation:', selectedConv);
      setMessages([]);
      setHasMore(true);
      loadMessages(selectedConv._id, true);
    }
  }, [selectedConv]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loading || !selectedConv) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMessages(selectedConv._id, false);
        }
      },
      { threshold: 0.1, root: document.querySelector('.messages-container') }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, messages.length, selectedConv]);

  const loadConversations = async () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Use admin endpoint to get ALL conversations
      const res = await axios.get(`${API_URL}/admin/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 200 }
      });
      
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string, reset: boolean = false) => {
    if (typeof window === 'undefined') return; // Skip during SSR
    if (!convId) {
      console.error('Invalid conversation ID:', convId);
      return;
    }
    
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const oldestMessage = reset ? null : messages[0]; // Load from top
      const token = localStorage.getItem('admin_token');
      
      const params: any = { limit: PAGE_SIZE };
      if (oldestMessage?.created_at) {
        params.before = oldestMessage.created_at;
      }
      
      console.log('Loading messages for conversation:', convId);
      
      const res = await axios.get(
        `${API_URL}/conversations/${convId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      const newMessages = res.data.messages || [];
      
      if (reset) {
        setMessages(newMessages);
      } else {
        // Prepend older messages
        setMessages(prev => [...newMessages, ...prev]);
      }

      setHasMore(newMessages.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      
      // Scroll to bottom after messages are set
      if (reset) {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
          }
        }, 50);
      }
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
  };

  const handleSendMessage = async () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    const textToSend = showImageInput && imageUrl ? imageUrl : newMessage;
    if (!textToSend.trim() || !selectedConv) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_URL}/conversations/${selectedConv._id}/messages`,
        { text: textToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      setImageUrl('');
      setShowImageInput(false);
      loadMessages(selectedConv._id, true);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await adminApi.reactToMessage(messageId, emoji);
      setShowEmojiPicker(null);
      if (selectedConv) {
        loadMessages(selectedConv._id, true);
      }
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await adminApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      setActionInProgress(userId);
      await adminApi.banUser(userId, reason, true);
      alert('User banned successfully');
      setShowConfirmDialog(null);
      setBanReason('');
      if (selectedConv) {
        loadMessages(selectedConv._id, true);
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMuteUser = async (userId: string, duration: number) => {
    try {
      setActionInProgress(userId);
      await adminApi.muteUser(userId, duration);
      alert(`User muted for ${duration / 3600} hour(s)`);
      setShowConfirmDialog(null);
      setMuteDuration('3600');
    } catch (error) {
      console.error('Failed to mute user:', error);
      alert('Failed to mute user');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteAllUserMessages = async (userId: string) => {
    try {
      setActionInProgress(userId);
      await adminApi.deleteAllUserMessages(userId);
      alert('All user messages deleted');
      setShowConfirmDialog(null);
      if (selectedConv) {
        loadMessages(selectedConv._id, true);
      }
    } catch (error) {
      console.error('Failed to delete messages:', error);
      alert('Failed to delete user messages');
    } finally {
      setActionInProgress(null);
    }
  };

  const extractMediaUrl = (text: string) => {
    const urlMatch = text.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
    if (urlMatch) return urlMatch[0];
    const tenorMatch = text.match(/(https?:\/\/[^\s]*tenor\.com[^\s]*)/i);
    if (tenorMatch) return tenorMatch[0];
    const giphyMatch = text.match(/(https?:\/\/[^\s]*giphy\.com[^\s]*)/i);
    if (giphyMatch) return giphyMatch[0];
    return null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSenderId = (sender: any): string | null => {
    if (!sender) return null;
    if (typeof sender === 'string') return sender;
    return sender._id || sender.id || null;
  };

  const navigateToUser = (sender: any) => {
    const userId = getSenderId(sender);
    if (userId) {
      router.push(`/users?id=${userId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Chatrooms</h1>
        <p className="text-muted-foreground text-lg mt-1">View conversations and moderate in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedConv?._id === conv._id
                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]'
                        : 'bg-[var(--color-muted)]/30 border-[var(--color-border)] hover:bg-[var(--color-muted)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {conv.title || conv.slug || `${conv.type} chat`}
                      </span>
                      <span className="text-xs text-[var(--color-muted-foreground)] ml-2">
                        {conv.participant_count} members
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                      {conv.type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>
              {selectedConv ? (selectedConv.title || selectedConv.slug || 'Chat') : 'Messages'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[70vh]">
            {selectedConv ? (
              <>
                {/* Load more indicator at top */}
                {hasMore && !loading && (
                  <div ref={observerTarget} className="flex justify-center py-2">
                    {loadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Loading older messages...</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] mb-4 messages-container">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const mediaUrl = extractMediaUrl(msg.text);
                        const senderId = getSenderId(msg.sender_id);
                        const username = msg.sender_id?.display_name || msg.sender_id?.username || 'Unknown';
                        
                        return (
                          <div key={msg._id} className="group relative">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 p-3 rounded-lg bg-[var(--color-muted)]/30 border border-[var(--color-border)]">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <button
                                    onClick={() => navigateToUser(msg.sender_id)}
                                    className="font-medium text-xs hover:text-primary transition-colors inline-flex items-center gap-1"
                                  >
                                    <UserCircle className="h-3 w-3" />
                                    {username}
                                  </button>
                                  <span className="text-xs text-[var(--color-muted-foreground)]">
                                    {formatTime(msg.created_at)}
                                  </span>
                                </div>
                                {mediaUrl ? (
                                  <img src={mediaUrl} alt="Media" className="max-w-xs rounded mt-1" />
                                ) : (
                                  <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)}
                                  title="React"
                                >
                                  <Smile className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  title="Delete message"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>

                                {senderId && (
                                  <div className="relative">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setShowActionMenu(showActionMenu === msg._id ? null : msg._id)}
                                      title="User actions"
                                    >
                                      <AlertCircle className="h-4 w-4 text-orange-500" />
                                    </Button>

                                    {showActionMenu === msg._id && (
                                      <div className="absolute right-0 top-full mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
                                        <button
                                          onClick={() => {
                                            setShowConfirmDialog({ type: 'ban', userId: senderId, username });
                                            setShowActionMenu(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-muted)] rounded flex items-center gap-2 text-red-500"
                                        >
                                          <Ban className="h-4 w-4" />
                                          Ban User
                                        </button>
                                        <button
                                          onClick={() => {
                                            setShowConfirmDialog({ type: 'mute', userId: senderId, username });
                                            setShowActionMenu(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-muted)] rounded flex items-center gap-2 text-orange-500"
                                        >
                                          <UserX className="h-4 w-4" />
                                          Mute User
                                        </button>
                                        <button
                                          onClick={() => {
                                            setShowConfirmDialog({ type: 'delete-messages', userId: senderId, username });
                                            setShowActionMenu(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-muted)] rounded flex items-center gap-2 text-yellow-500"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete All Messages
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {showEmojiPicker === msg._id && (
                                <div className="absolute right-0 top-12 z-50">
                                  <EmojiPicker
                                    onSelect={(emoji) => handleReact(msg._id, emoji)}
                                    onClose={() => setShowEmojiPicker(null)}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2 ml-0 max-w-full">
                                {Object.entries(msg.reactions)
                                  .filter(([emoji, userIds]) => userIds.length > 0)
                                  .map(([emoji, userIds]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReact(msg._id, emoji)}
                                      className="inline-flex items-center gap-1.5 text-xs bg-[var(--color-secondary)] px-2.5 py-1.5 rounded-full hover:bg-[var(--color-accent)] transition-colors border border-[var(--color-border)] whitespace-nowrap"
                                    >
                                      <span className="text-base leading-none">{emoji}</span>
                                      <span className="font-semibold text-xs">{userIds.length}</span>
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  {showImageInput && (
                    <Input
                      placeholder="Paste image/GIF URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder={showImageInput ? "Or type a message..." : "Type a message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !showImageInput && handleSendMessage()}
                      disabled={showImageInput && imageUrl.length > 0}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowImageInput(!showImageInput)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--color-muted-foreground)]">
                Select a chatroom to view and send messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfirmDialog(null)}>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              {showConfirmDialog.type === 'ban' && 'Ban User'}
              {showConfirmDialog.type === 'mute' && 'Mute User'}
              {showConfirmDialog.type === 'delete-messages' && 'Delete All User Messages'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {showConfirmDialog.type === 'ban' && `Permanently ban ${showConfirmDialog.username}?`}
              {showConfirmDialog.type === 'mute' && `Mute ${showConfirmDialog.username} for how long?`}
              {showConfirmDialog.type === 'delete-messages' && `Delete all messages from ${showConfirmDialog.username}? This cannot be undone.`}
            </p>

            {showConfirmDialog.type === 'ban' && (
              <Input
                placeholder="Ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="mb-4"
              />
            )}

            {showConfirmDialog.type === 'mute' && (
              <select
                value={muteDuration}
                onChange={(e) => setMuteDuration(e.target.value)}
                className="w-full mb-4 p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)]"
              >
                <option value="3600">1 hour</option>
                <option value="21600">6 hours</option>
                <option value="86400">24 hours</option>
                <option value="604800">7 days</option>
                <option value="2592000">30 days</option>
              </select>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(null);
                  setBanReason('');
                  setMuteDuration('3600');
                }}
                disabled={actionInProgress === showConfirmDialog.userId}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showConfirmDialog.type === 'ban') {
                    handleBanUser(showConfirmDialog.userId, banReason || 'No reason provided');
                  } else if (showConfirmDialog.type === 'mute') {
                    handleMuteUser(showConfirmDialog.userId, parseInt(muteDuration));
                  } else if (showConfirmDialog.type === 'delete-messages') {
                    handleDeleteAllUserMessages(showConfirmDialog.userId);
                  }
                }}
                disabled={actionInProgress === showConfirmDialog.userId || (showConfirmDialog.type === 'ban' && !banReason.trim())}
              >
                {actionInProgress === showConfirmDialog.userId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
