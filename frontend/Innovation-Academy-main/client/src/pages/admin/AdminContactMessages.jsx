import React, { useState, useEffect, useRef } from 'react';
import { contactService } from '../../services/api';
import { toast } from '../../context/ToastContext';
import {
  Mail,
  CheckCircle2,
  Clock,
  MessageSquare,
  Save,
  X,
  Reply,
  Trash2,
  Shield,
  User,
  Send,
  CornerDownRight,
} from 'lucide-react';

// Consolidate messages by participant email so all messages from the same person appear in one single chat thread
const groupMessagesBySender = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  const map = new Map();

  for (const m of rawList) {
    const emailKey = (m.email || '').toLowerCase().trim();
    const key = emailKey || (m.userId ? String(m.userId) : String(m._id || m.id));

    if (!map.has(key)) {
      let conv = Array.isArray(m.conversation) && m.conversation.length > 0
        ? [...m.conversation]
        : [];

      if (conv.length === 0) {
        if (m.message) {
          conv.push({
            sender: 'participant',
            senderName: m.name,
            message: m.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
            createdAt: m.createdAt,
          });
        }
        if (m.replyNotes) {
          conv.push({
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: m.replyNotes,
            createdAt: m.repliedAt || m.createdAt,
          });
        }
      }

      map.set(key, {
        ...m,
        conversation: conv,
      });
    } else {
      const existing = map.get(key);

      let otherConv = Array.isArray(m.conversation) && m.conversation.length > 0
        ? [...m.conversation]
        : [];

      if (otherConv.length === 0) {
        if (m.message) {
          otherConv.push({
            sender: 'participant',
            senderName: m.name,
            message: m.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
            createdAt: m.createdAt,
          });
        }
        if (m.replyNotes) {
          otherConv.push({
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: m.replyNotes,
            createdAt: m.repliedAt || m.createdAt,
          });
        }
      }

      // Merge and sort chronologically
      existing.conversation = [...existing.conversation, ...otherConv].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      // Status: If any document is Unread, whole thread is Unread
      if (m.status === 'Unread' || existing.status === 'Unread') {
        existing.status = 'Unread';
      }

      // Keep latest updatedAt / createdAt
      if (new Date(m.createdAt) > new Date(existing.createdAt)) {
        existing.createdAt = m.createdAt;
      }

      // Update program of interest if missing
      if (m.programOfInterest && !existing.programOfInterest) {
        existing.programOfInterest = m.programOfInterest;
      }

      // Latest message text
      const last = existing.conversation[existing.conversation.length - 1];
      if (last) {
        existing.message = last.message;
      }
    }
  }

  return Array.from(map.values());
};

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusVal, setStatusVal] = useState('Replied');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectedMsg && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMsg, selectedMsg?.conversation]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await contactService.getAllMessages();
      if (res.success) {
        setMessages(groupMessagesBySender(res.data));
      }
    } catch (err) {
      console.warn('Failed to load contact messages:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await contactService.deleteMessage(id);
      if (res.success) {
        toast.success('Conversation thread deleted successfully');
        setMessages((prev) => prev.filter((m) => m._id !== id && m.id !== id));
        setDeleteConfirmId(null);
      } else {
        toast.error(res.message || 'Failed to delete message');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleOpenTriage = (msg) => {
    setSelectedMsg(msg);
    setReplyText('');
    setStatusVal('Replied');
  };

  const handleSaveTriage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && statusVal === selectedMsg.status) {
      toast.error('Please enter a response or change status.');
      return;
    }

    setSubmittingReply(true);
    try {
      const msgId = selectedMsg._id || selectedMsg.id;
      const res = await contactService.updateMessageStatus(msgId, {
        status: replyText.trim() ? 'Replied' : statusVal,
        replyNotes: replyText.trim(),
      });

      if (res.success) {
        toast.success('Reply dispatched to participant & notification sent!');

        // Update selected message conversation locally
        if (replyText.trim()) {
          const newEntry = {
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: replyText.trim(),
            createdAt: new Date(),
          };

          setSelectedMsg((prev) => {
            if (!prev) return prev;
            const updatedConv = Array.isArray(prev.conversation) ? [...prev.conversation, newEntry] : [newEntry];
            return {
              ...prev,
              status: 'Replied',
              replyNotes: replyText.trim(),
              conversation: updatedConv,
            };
          });
        }

        setReplyText('');
        fetchMessages();
      } else {
        toast.error(res.message || 'Failed to update message');
      }
    } catch (err) {
      toast.error('Failed to update message');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0B192C]">Contact Inquiries &amp; Participant Chats</h2>
        <p className="text-xs sm:text-sm text-[#44474c] mt-1">
          All participant inquiry threads, questions, and secretariat responses unified by participant.
        </p>
      </div>

      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((m) => {
            const convCount = Array.isArray(m.conversation) ? m.conversation.length : 1;
            return (
              <div
                key={m._id || m.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                  m.status === 'Unread'
                    ? 'bg-white border-[#006398]/40 shadow-sm ring-1 ring-[#006398]/15'
                    : 'bg-white border-[#e2e8f0]'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'Unread'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : m.status === 'Replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {m.status}
                    </span>

                    {convCount > 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#006398] flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {convCount} messages in thread
                      </span>
                    )}

                    <span className="text-xs font-semibold text-[#75777d]">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-[#0B192C]">{m.name}</h3>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs text-[#006398] hover:underline font-medium"
                    >
                      ({m.email})
                    </a>
                  </div>

                  {m.programOfInterest && (
                    <div className="text-xs font-semibold text-[#006398] bg-[#eaedff] px-2.5 py-1 rounded-md w-fit">
                      Interest: {m.programOfInterest}
                    </div>
                  )}

                  <div className="text-xs sm:text-sm text-[#44474c] leading-relaxed pt-1">
                    <span className="font-semibold text-slate-700">Latest Message: </span>
                    "{m.message}"
                  </div>

                  {m.replyNotes && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <strong>Staff Reply:</strong> "{m.replyNotes}"
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                  <button
                    onClick={() => handleOpenTriage(m)}
                    className="px-4 py-2 rounded-xl bg-[#006398] hover:bg-[#00476e] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat ({convCount})</span>
                  </button>

                  {deleteConfirmId === (m._id || m.id) ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteMessage(m._id || m.id)}
                        className="px-2.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(m._id || m.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Thread"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#e2e8f0] text-xs text-[#75777d]">
            No contact messages in inbox.
          </div>
        )}
      </div>

      {/* Triage / Interactive Chat Thread Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#faf8ff] border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006398] to-[#0284c7] text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0B192C]">
                    Chat with {selectedMsg.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedMsg.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Conversation Thread */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {Array.isArray(selectedMsg.conversation) && selectedMsg.conversation.length > 0 ? (
                selectedMsg.conversation.map((chat, idx) => {
                  const isAdmin = chat.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 ${
                        isAdmin ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                          isAdmin
                            ? 'bg-[#006398] text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-[#006398] text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-black/5 text-[10px] font-bold">
                          <span className={isAdmin ? 'text-blue-100' : 'text-[#006398]'}>
                            {isAdmin ? 'TRACE Secretariat (You)' : (chat.senderName || selectedMsg.name)}
                          </span>
                          <span className={isAdmin ? 'text-blue-200' : 'text-slate-400'}>
                            {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-line">{chat.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <div className="font-bold mb-1">Inquiry:</div>
                  <p>{selectedMsg.message}</p>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Secretariat Reply Form at Bottom */}
            <form onSubmit={handleSaveTriage} className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <CornerDownRight className="w-4 h-4 text-[#006398]" />
                  <span>Reply as TRACE Secretariat:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 outline-none"
                  >
                    <option value="Replied">Replied</option>
                    <option value="Unread">Unread</option>
                    <option value="Read">Read</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows="3"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type reply to ${selectedMsg.name}... Participant will receive it in their notifications box.`}
                  className="w-full p-3.5 pr-28 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006398] resize-none bg-slate-50/50"
                ></textarea>
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="absolute right-3 bottom-3.5 px-4 py-2 rounded-xl bg-[#006398] hover:bg-[#00476e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReply ? (
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
