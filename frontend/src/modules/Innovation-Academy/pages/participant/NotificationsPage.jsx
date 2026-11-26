import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService, contactService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Shield,
  Info,
  AlertTriangle,
  ArrowRight,
  Send,
  X,
  User,
  CornerDownRight,
  MessageSquare,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected thread / modal box state
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchData = async () => {
    try {
      const [notifRes, msgRes] = await Promise.allSettled([
        userService.getNotifications(),
        contactService.getMyMessages(),
      ]);

      let notifData = [];
      let msgData = [];

      if (notifRes.status === 'fulfilled' && notifRes.value?.success) {
        notifData = notifRes.value.data || [];
        setNotifications(notifData);
      }
      if (msgRes.status === 'fulfilled' && msgRes.value?.success) {
        msgData = msgRes.value.data || [];
        setMessages(msgData);
      }

      // Check if URL has ?messageId=... and open that thread automatically
      const msgIdParam = searchParams.get('messageId');
      if (msgIdParam && msgData.length > 0) {
        const target = msgData.find((m) => (m._id || m.id) === msgIdParam);
        if (target) setSelectedThread(target);
      }
    } catch (err) {
      console.warn('Error fetching notifications & messages:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scroll to bottom of message thread when conversation updates
  useEffect(() => {
    if (selectedThread && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedThread, selectedThread?.conversation]);

  const handleMarkNotificationRead = async (id) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const unreadList = notifications.filter((n) => !n.read);
    for (const n of unreadList) {
      try {
        await userService.markNotificationRead(n._id || n.id);
      } catch (err) {}
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  // Open the conversation modal when "View" is clicked on a notification
  const handleOpenNotificationThread = async (notif) => {
    // 1. Auto-mark read if unread
    if (!notif.read) {
      handleMarkNotificationRead(notif._id || notif.id);
    }

    // 2. Find matching contact message in messages
    let targetMsg = null;
    if (messages.length > 0) {
      targetMsg = messages.find((m) => {
        const idMatch = notif.link && notif.link.includes(m._id || m.id);
        const subjectMatch =
          m.subject && notif.title && notif.title.toLowerCase().includes(m.subject.toLowerCase());
        const replyMatch =
          m.replyNotes && notif.message && notif.message.includes(m.replyNotes.slice(0, 15));
        return idMatch || subjectMatch || replyMatch;
      });

      // Fallback: If only 1 message exists, use it
      if (!targetMsg && messages.length === 1) {
        targetMsg = messages[0];
      }
    }

    // 3. If still no direct match, construct a conversation thread from notification
    if (!targetMsg) {
      targetMsg = {
        _id: notif._id || notif.id,
        id: notif._id || notif.id,
        subject: notif.title,
        programOfInterest: 'TRACE Innovation Secretariat',
        message: 'Inquiry via Contact Desk',
        replyNotes: notif.message.replace(/^TRACE Secretariat:\s*"?/, '').replace(/"?$/, ''),
        repliedAt: notif.createdAt,
        status: 'Replied',
        conversation: [
          {
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: notif.message,
            createdAt: notif.createdAt,
          },
        ],
      };
    }

    setSelectedThread(targetMsg);
    setReplyInput('');
  };

  // Submit participant's follow-up reply in the modal box
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedThread) return;

    const threadId = selectedThread._id || selectedThread.id;
    const newReplyText = replyInput.trim();
    setSendingReply(true);

    try {
      const res = await contactService.replyMessage(threadId, newReplyText, {
        subject: selectedThread.subject || 'Inquiry Follow-up',
        programOfInterest: selectedThread.programOfInterest || '',
        name: user?.name || selectedThread.name || 'Participant',
        email: user?.email || selectedThread.email || 'participant@trace.lk',
        userId: user?._id || user?.id || selectedThread.userId || null,
      });

      // Create new message object for instant UI update
      const newEntry = {
        sender: 'participant',
        senderName: user?.name || 'You',
        message: newReplyText,
        createdAt: new Date(),
      };

      // Update selected thread state immediately
      setSelectedThread((prev) => {
        if (!prev) return prev;
        const currentConv = Array.isArray(prev.conversation) && prev.conversation.length > 0
          ? [...prev.conversation]
          : [
              {
                sender: 'participant',
                senderName: prev.name || user?.name || 'You',
                message: prev.message,
                createdAt: prev.createdAt || new Date(),
              },
              ...(prev.replyNotes
                ? [
                    {
                      sender: 'admin',
                      senderName: 'TRACE Secretariat',
                      message: prev.replyNotes,
                      createdAt: prev.repliedAt || new Date(),
                    },
                  ]
                : []),
            ];

        return {
          ...prev,
          conversation: [...currentConv, newEntry],
        };
      });

      // Update messages list in background
      setMessages((prevList) =>
        prevList.map((m) =>
          (m._id === threadId || m.id === threadId)
            ? {
                ...m,
                conversation: Array.isArray(m.conversation)
                  ? [...m.conversation, newEntry]
                  : [
                      {
                        sender: 'participant',
                        senderName: m.name || user?.name || 'You',
                        message: m.message,
                        createdAt: m.createdAt || new Date(),
                      },
                      ...(m.replyNotes
                        ? [
                            {
                              sender: 'admin',
                              senderName: 'TRACE Secretariat',
                              message: m.replyNotes,
                              createdAt: m.repliedAt || new Date(),
                            },
                          ]
                        : []),
                      newEntry,
                    ],
              }
            : m
        )
      );

      toast.success('Your reply has been sent to TRACE Secretariat!');
      setReplyInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 mt-4">Loading notifications &amp; secretariat messages...</p>
      </div>
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-[#006398]" />;
    }
  };

  // Helper to compile thread history
  const getThreadConversation = (thread) => {
    if (!thread) return [];
    if (Array.isArray(thread.conversation) && thread.conversation.length > 0) {
      return thread.conversation;
    }
    const history = [];
    if (thread.message) {
      history.push({
        sender: 'participant',
        senderName: thread.name || user?.name || 'You',
        message: thread.message,
        createdAt: thread.createdAt || new Date(),
      });
    }
    if (thread.replyNotes) {
      history.push({
        sender: 'admin',
        senderName: 'TRACE Secretariat',
        message: thread.replyNotes,
        createdAt: thread.repliedAt || new Date(),
      });
    }
    return history;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full bg-[#e0f2fe] text-[#006398] text-[11px] font-extrabold uppercase tracking-wider">
            COMMUNICATION DESK
          </span>
          {unreadNotifsCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              {unreadNotifsCount} New {unreadNotifsCount === 1 ? 'Notification' : 'Notifications'}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
          Notifications &amp; Replies
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          View official replies from TRACE Secretariat to your contact inquiries and track live cohort announcements.
        </p>
      </div>

      {/* Notifications List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <p className="text-xs text-slate-500 font-medium">
            Showing active system alerts, workshop reminders, and secretariat replies.
          </p>
          {unreadNotifsCount > 0 && (
            <button
              onClick={handleMarkAllNotificationsRead}
              className="text-xs font-bold text-[#006398] hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id || n.id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.read
                    ? 'bg-white border-slate-200/80 shadow-xs'
                    : 'bg-[#faf8ff] border-[#006398]/30 shadow-xs ring-1 ring-[#006398]/10'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0B192C]">{n.title}</h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#006398]"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenNotificationThread(n)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#006398] hover:bg-[#00476e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkNotificationRead(n._id || n.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-[#006398] px-2 py-1 cursor-pointer transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B192C]">No Notifications Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              You're all caught up! When secretariat replies or workshop dates are scheduled, they will appear here.
            </p>
          </div>
        )}
      </div>

      {/* INTERACTIVE CONVERSATION & REPLY MODAL BOX */}
      {selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#faf8ff] border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006398] to-[#0284c7] text-white flex items-center justify-center shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0B192C] leading-snug line-clamp-1">
                    {selectedThread.subject || 'TRACE Secretariat Conversation'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedThread.programOfInterest && (
                      <span className="text-[10px] font-bold text-[#006398] bg-[#e0f2fe] px-2 py-0.5 rounded">
                        {selectedThread.programOfInterest}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      ID: {String(selectedThread._id || selectedThread.id).slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedThread(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Conversation Thread */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {getThreadConversation(selectedThread).map((chat, idx) => {
                const isAdmin = chat.sender === 'admin';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      isAdmin ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                        isAdmin
                          ? 'bg-[#006398] text-white ring-2 ring-[#e0f2fe]'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-white border-2 border-emerald-200/90 text-slate-800 rounded-tl-none'
                          : 'bg-[#006398] text-white rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-black/5">
                        <span className={`font-bold text-[11px] ${isAdmin ? 'text-[#006398]' : 'text-blue-100'}`}>
                          {isAdmin ? 'TRACE Secretariat' : (chat.senderName || 'You')}
                        </span>
                        <span className={`text-[10px] ${isAdmin ? 'text-slate-400' : 'text-blue-200'}`}>
                          {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{chat.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Interactive Reply Input Box at Bottom */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendReply} className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <CornerDownRight className="w-4 h-4 text-[#006398]" />
                  <span>Send a reply to TRACE Secretariat:</span>
                </div>
                <div className="relative">
                  <textarea
                    rows="3"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Type your response or follow-up question here..."
                    className="w-full p-3.5 pr-28 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006398] focus:border-transparent resize-none bg-slate-50/50"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyInput.trim()}
                    className="absolute right-3 bottom-3.5 px-4 py-2 rounded-xl bg-[#006398] hover:bg-[#00476e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReply ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Your reply will be delivered directly to the TRACE innovation coordination desk and added to this thread.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
