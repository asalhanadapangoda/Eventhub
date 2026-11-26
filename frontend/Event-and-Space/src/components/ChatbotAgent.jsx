import React, { useState, useEffect, useRef } from 'react';

export default function ChatbotAgent({ currentUser, setActiveTab, events = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate a user handle for display (e.g. User_8s27gk or Logged-in Name)
  const [userHandle] = useState(() => {
    if (currentUser && currentUser.name) return currentUser.name;
    const randomHash = Math.random().toString(36).substring(2, 8);
    return `User_${randomHash}`;
  });

  // Initial welcome message
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('trace_welcome_agent_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved chat history:', e);
      }
    }
    return [
      {
        id: 1,
        sender: 'bot',
        senderName: 'Welcome Agent',
        text: `Hi, Welcome from TRACE Sri Lanka!`,
        quickPrompts: ['What is next event?', '📅 Upcoming Events', '🏢 Explore Venues'],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const chatEndRef = useRef(null);

  // Save messages to LocalStorage
  useEffect(() => {
    localStorage.setItem('trace_welcome_agent_messages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleClearHistory = () => {
    const defaultMsg = [
      {
        id: Date.now(),
        sender: 'bot',
        senderName: 'Welcome Agent',
        text: `Hi, Welcome from TRACE Sri Lanka!`,
        quickPrompts: ['What is next event?', '📅 Upcoming Events', '🏢 Explore Venues'],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(defaultMsg);
  };

  // Client-side query engine using REAL database events ONLY
  const getClientFallbackReply = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Greetings (English, Sinhala & Singlish)
    if (
      q === 'hi trace' ||
      q === 'hello trace' ||
      q === 'hey trace' ||
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q === 'trace' ||
      q.includes('kohomada') ||
      q.includes('ayubowan')
    ) {
      return {
        reply: `Hi! Welcome to TRACE Sri Lanka.\n\nI am your Welcome Agent! How can I assist you today with information about events, spaces, or the TRACE innovation ecosystem?`,
        quickPrompts: ['What is next event?', '📅 Upcoming Events', '🏢 Explore Venues'],
      };
    }

    // 2. How are you
    if (q.includes('how are you') || q.includes('how r u') || q.includes('fine')) {
      return {
        reply: `I'm doing great, thank you for asking! 😊 I am ready to assist you with TRACE events, spaces, and registrations. How can I help you today?`,
        quickPrompts: ['What is next event?', '📅 Upcoming Events', '🏢 Explore Venues'],
      };
    }

    // 3. Location / Address / Contact
    if (q.includes('location') || q.includes('address') || q.includes('where') || q.includes('kohedha') || q.includes('koheda')) {
      return {
        reply: `📍 **TRACE Expert City Location:**\n\n🏢 **Address:** Bay 1, TRACE Expert City, Maradana Road, Colombo 01000, Sri Lanka.\n🌐 **Website:** https://tracesrilanka.lk\n📧 **Email:** info@trace.lk`,
        quickPrompts: ['What is next event?', '🏢 Explore Venues'],
      };
    }

    // Filter non-draft and upcoming events from real DB state
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = (events || [])
      .filter((e) => e.status !== 'draft' && new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 4. Next event query (REAL DB DATA ONLY)
    if (
      q.includes('next event') ||
      q.includes('what is next') ||
      q.includes('whats next') ||
      q.includes('first event') ||
      q.includes('next') ||
      q.includes('ilanga') ||
      q.includes('mokadda')
    ) {
      if (!upcomingEvents || upcomingEvents.length === 0) {
        return {
          reply: `📅 Currently, there are no upcoming events in the database.`,
          quickPrompts: ['🏢 Explore Venues'],
        };
      }

      const nextEvt = upcomingEvents[0];
      const evtDateStr = nextEvt.date ? new Date(nextEvt.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Date TBD';
      const speakerInfo = nextEvt.speaker && nextEvt.speaker.name ? `\n🎤 **Speaker:** ${nextEvt.speaker.name} (${nextEvt.speaker.role || 'Guest'})` : '';
      const cleanDescription = (nextEvt.description || "").replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';

      return {
        reply: `🚀 **Next Event in Database:**\n\n📌 **${nextEvt.title}**\n📅 **Date:** ${evtDateStr}\n⏰ **Time:** ${nextEvt.time || 'TBA'}\n📍 **Location:** ${nextEvt.location}\n🏷️ **Category:** ${nextEvt.category || 'General'}${speakerInfo}\n👥 **Seats:** ${nextEvt.registeredCount || 0}/${nextEvt.capacity || 100} Registered\n\n📝 *Description:* ${cleanDescription}\n\n💡 *Tip: Click **Upcoming Events** to view all events!*`,
        quickPrompts: ['📅 Upcoming Events', '🏢 Explore Venues'],
      };
    }

    // 5. Past events search
    if (q.includes('past') || q.includes('previous') || q.includes('happened') || q.includes('completed')) {
      const pastEvents = (events || [])
        .filter((e) => e.status !== 'draft' && new Date(e.date) < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (!pastEvents || pastEvents.length === 0) {
        return {
          reply: `📅 Currently, there are no past events in the database.`,
          quickPrompts: ['📅 Upcoming Events', '🏢 Explore Venues'],
        };
      }

      const eventListStr = pastEvents
        .slice(0, 5)
        .map((e, i) => `**${i + 1}. ${e.title}**\n📅 ${new Date(e.date).toLocaleDateString()}`)
        .join('\n\n');

      return {
        reply: `🕰️ **Past Events in Database (${pastEvents.length}):**\n\n${eventListStr}\n\n💡 *Ask me about "upcoming events" to see what's next!*`,
        quickPrompts: ['📅 Upcoming Events', '🏢 Explore Venues'],
      };
    }

    // 6. Upcoming events (REAL DB DATA ONLY)
    if (q.includes('upcoming') || q.includes('event') || q.includes('schedule') || q.includes('monawada')) {
      if (!upcomingEvents || upcomingEvents.length === 0) {
        return {
          reply: `📅 Currently, there are no upcoming events in the database.`,
          quickPrompts: ['🏢 Explore Venues'],
        };
      }

      const eventListStr = upcomingEvents
        .slice(0, 5)
        .map(
          (e, i) =>
            `**${i + 1}. ${e.title}**\n📍 *${e.location}* | 📅 ${new Date(e.date).toLocaleDateString()} | ⏰ ${e.time}\n👥 ${e.registeredCount || 0}/${e.capacity || 100} Registered`
        )
        .join('\n\n');

      return {
        reply: `🎉 **Upcoming Events in Database (${upcomingEvents.length}):**\n\n${eventListStr}\n\n💡 *Ask me "what is next event" for details!*`,
        quickPrompts: ['What is next event?', '🏢 Explore Venues'],
      };
    }

    // 6. Venues & spaces
    if (q.includes('venue') || q.includes('space') || q.includes('hall') || q.includes('room')) {
      return {
        reply: `🏢 **TRACE Event Spaces & Facilities:**\n\nTRACE features auditorium halls, high-tech meeting rooms, and collaborative hubs across TRACE Expert City Colombo and branches.\n\n💡 *Click **Explore Venues** below to browse spaces!*`,
        quickPrompts: ['🏢 Explore Venues', 'What is next event?'],
      };
    }

    // 7. Search events by keyword in real DB events array
    const searchMatches = (events || []).filter(
      (e) =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
    );

    if (searchMatches.length > 0) {
      const matchStr = searchMatches
        .slice(0, 3)
        .map((e) => `📌 **${e.title}**\n📍 ${e.location} | 📅 ${new Date(e.date).toLocaleDateString()} @ ${e.time}`)
        .join('\n\n');

      return {
        reply: `🔍 **Search results for "${userQuery}":**\n\n${matchStr}`,
        quickPrompts: ['What is next event?', '📅 Upcoming Events'],
      };
    }

    // Default response if no DB event match found
    return {
      reply: `Hi! I couldn't find exact matches for "${userQuery}". Try asking about *"next event"*, *"upcoming events"*, or *"venues"*!`,
      quickPrompts: ['What is next event?', '📅 Upcoming Events', '🏢 Explore Venues'],
    };
  };

  const sendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      senderName: userHandle,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const apiUrl = '/api/chat/message';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-6),
          userName: userHandle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          const botMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            senderName: 'Welcome Agent',
            text: data.reply,
            quickPrompts: data.quickPrompts || [],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, botMsg]);
          return;
        }
      }

      // Fallback using real DB events
      const fallback = getClientFallbackReply(text);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Welcome Agent',
        text: fallback.reply,
        quickPrompts: fallback.quickPrompts,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Network issue reaching chat server, using DB fallback:', err.message);
      const fallback = getClientFallbackReply(text);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Welcome Agent',
        text: fallback.reply,
        quickPrompts: fallback.quickPrompts,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatText = (content) => {
    if (!content) return '';
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx}>{part.slice(1, -1)}</em>;
        }
        return part;
      });

      return (
        <React.Fragment key={idx}>
          {renderedParts}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="chatbot-agent-container">
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          className="chatbot-fab-btn"
          onClick={toggleOpen}
          aria-label="Open Welcome Agent"
          title="Open Welcome Agent"
        >
          <div className="chatbot-fab-icon">💬</div>
          <span className="chatbot-fab-pulse"></span>
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="welcome-agent-window">
          {/* Header */}
          <div className="welcome-agent-header">
            <h3 className="welcome-agent-title">Welcome Agent</h3>
            <div className="welcome-agent-header-actions">
              <button
                className="welcome-agent-action-btn"
                onClick={handleClearHistory}
                title="Clear chat history"
              >
                🗑️
              </button>
              <button
                className="welcome-agent-action-btn close-btn"
                onClick={toggleOpen}
                title="Close chat"
              >
                ✖
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="welcome-agent-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`welcome-agent-msg-group ${msg.sender === 'user' ? 'user-group' : 'bot-group'}`}
              >
                {/* Sender Name */}
                <div className="welcome-agent-sender-name">
                  {msg.sender === 'user' ? userHandle : (msg.senderName || 'Welcome Agent')}
                </div>

                {/* Bubble */}
                <div className={`welcome-agent-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <div className="welcome-agent-text">{formatText(msg.text)}</div>

                  {/* Quick Prompts */}
                  {msg.quickPrompts && msg.quickPrompts.length > 0 && (
                    <div className="welcome-agent-chips">
                      {msg.quickPrompts.map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          className="welcome-agent-chip"
                          onClick={() => {
                            if ((promptText.includes('Upcoming Events') || promptText.includes('next event')) && setActiveTab) {
                              setActiveTab('upcoming');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else if (promptText.includes('Venues') && setActiveTab) {
                              setActiveTab('venues-page');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            sendMessage(promptText);
                          }}
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="welcome-agent-msg-group bot-group">
                <div className="welcome-agent-sender-name">Welcome Agent</div>
                <div className="welcome-agent-bubble bot-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="welcome-agent-footer">
            <input
              type="text"
              className="welcome-agent-input"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="welcome-agent-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
