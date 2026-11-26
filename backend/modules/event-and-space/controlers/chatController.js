const Event = require("../model/Event");
const Venue = require("../model/Venue");
const Registration = require("../model/Registration");
const { getEventsCache } = require("./eventController");
const { getVenuesCache } = require("./venueController");

/**
 * Helper to call Google Gemini API if GEMINI_API_KEY is defined in environment.
 */
async function getGeminiResponse(userPrompt, conversationHistory, systemContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPromptText = `You are 'Welcome Agent', the intelligent AI assistant for TRACE Sri Lanka & EventHub ecosystem. 
Current Server Date and Time: ${new Date().toString()}
System Knowledge Context (ONLY USE THIS REAL DATABASE DATA):
${systemContext}

Instructions:
- When asked about events, ONLY mention the exact real events present in the System Knowledge Context. Do NOT invent or make up imaginary events.
- If asked about the "next" event, ONLY show the single most immediate upcoming event. Do NOT list all upcoming events.
- If asked about "upcoming events" in general, list the upcoming events from the context.
- If there are no events listed in the database context, clearly state: "Currently, there are no events stored in the database."
- When greeted with "hi trace" or "hi", respond politely:
  "Hi, thank you for reaching out. You are currently being assisted by our AI assistant.

- Format responses beautifully. Keep sentences simple, nice, and very easy to understand.
- Use a clean, modern style with emojis, bullet points, and bold text for readability. Avoid long, overwhelming paragraphs.`;

    const contents = [];

    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((msg) => {
        if (msg.sender === "user" || msg.role === "user") {
          contents.push({ role: "user", parts: [{ text: msg.text || msg.content || "" }] });
        } else if (msg.sender === "bot" || msg.role === "model" || msg.role === "assistant") {
          contents.push({ role: "model", parts: [{ text: msg.text || msg.content || "" }] });
        }
      });
    }

    contents.push({ role: "user", parts: [{ text: userPrompt }] });

    const modelsToTry = ["gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              systemInstruction: {
                role: "system",
                parts: [{ text: systemPromptText }]
              },
              contents 
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (botReply) return botReply;
        } else {
          console.warn(`Gemini API ${modelName} returned status:`, response.status);
        }
      } catch (err) {
        console.warn(`Error with Gemini ${modelName}:`, err.message);
      }
    }
    return null;
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return null;
  }
}

/**
 * Smart Database Query Engine for Welcome Agent - STRICTLY READS REAL MONGO DB DATA
 */
async function generateSmartFallbackResponse(userPrompt, upcomingEvents, allEvents, venues) {
  const query = userPrompt.toLowerCase().trim();

  // 1. Greeting handling (matching user reference screenshot)
  if (
    query === "hi trace" ||
    query === "hello trace" ||
    query === "hey trace" ||
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query === "trace"
  ) {
    return {
      reply: `Hi, thank you for reaching out. You are currently being assisted by our AI assistant.\n\nHello! How can I help you today with information about TRACE and its innovation ecosystem?`,
      quickPrompts: ["What is next event?", "📅 Upcoming Events", "🏢 Explore Venues"],
    };
  }

  // 2. How are you query
  if (query.includes("how are you") || query.includes("how r u")) {
    return {
      reply: `I'm doing well, thank you for asking! 😊 I am ready to assist you with TRACE events, venue bookings, and member registrations. How can I help you today?`,
      quickPrompts: ["What is next event?", "📅 Upcoming Events", "🏢 Explore Venues"],
    };
  }

  // 3. Next event query (STRICTLY FETCHES FROM MONGO DB)
  if (query.includes("next event") || query.includes("what is next") || query.includes("whats next") || query.includes("first event") || query.includes("next upcoming") || query.includes("ilanga") || query.includes("mokadda")) {
    if (!upcomingEvents || upcomingEvents.length === 0) {
      return {
        reply: "📅 Currently, there are no upcoming events stored in the database. Please check back later!",
        quickPrompts: ["Explore Venues"],
      };
    }

    const nextEvt = upcomingEvents[0];
    const evtDateStr = nextEvt.date ? new Date(nextEvt.date).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "Date TBD";
    const speakerInfo = nextEvt.speaker && nextEvt.speaker.name ? `\n🎤 **Speaker:** ${nextEvt.speaker.name} (${nextEvt.speaker.role || 'Guest'})` : "";
    const cleanDescription = (nextEvt.description || "").replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';

    return {
      reply: `🚀 **Next Event in Database:**\n\n📌 **${nextEvt.title}**\n📅 **Date:** ${evtDateStr}\n⏰ **Time:** ${nextEvt.time || 'TBA'}\n📍 **Location:** ${nextEvt.location}\n🏷️ **Category:** ${nextEvt.category || 'General'}${speakerInfo}\n👥 **Registered:** ${nextEvt.registeredCount || 0}/${nextEvt.capacity || 100} Seats\n\n📝 *Description:* ${cleanDescription}\n\n💡 *Tip: Click **Upcoming Events** in navigation to view details!*`,
      quickPrompts: ["📅 All Upcoming Events", "🏢 Explore Venues"],
    };
  }

  // 4. Past events search
  if (query.includes("past") || query.includes("previous") || query.includes("happened") || query.includes("completed")) {
    const pEvents = allEvents.filter(e => new Date(e.date) < new Date().setHours(0,0,0,0));
    if (!pEvents || pEvents.length === 0) {
      return {
        reply: "📅 Currently, there are no past events stored in the database.",
        quickPrompts: ["Upcoming Events", "Explore Venues"],
      };
    }
    const eventListStr = pEvents
      .slice(0, 5)
      .map((e, i) => `**${i + 1}. ${e.title}**\n📅 ${new Date(e.date).toLocaleDateString()}`)
      .join("\n\n");
    return {
      reply: `🕰️ **Past Events in Database (${pEvents.length}):**\n\n${eventListStr}\n\n💡 *Ask me about upcoming events to see what's next!*`,
      quickPrompts: ["Upcoming Events", "Explore Venues"],
    };
  }

  // 5. Upcoming events search (STRICTLY LISTS REAL MONGO DB EVENTS)
  if (query.includes("upcoming") || query.includes("event") || query.includes("schedule") || query.includes("monawada")) {
    if (!upcomingEvents || upcomingEvents.length === 0) {
      return {
        reply: "📅 Currently, there are no upcoming events stored in the database.",
        quickPrompts: ["Explore Venues"],
      };
    }

    const eventListStr = upcomingEvents
      .map(
        (e, i) =>
          `**${i + 1}. ${e.title}**\n📍 *${e.location}* | 📅 ${new Date(e.date).toLocaleDateString()} | ⏰ ${e.time}\n👥 ${e.registeredCount || 0}/${e.capacity || 100} Registered`
      )
      .join("\n\n");

    return {
      reply: `🎉 **Upcoming Events Stored in Database (${upcomingEvents.length}):**\n\n${eventListStr}\n\n💡 *Ask me "what is next event" for details on the immediate next event!*`,
      quickPrompts: ["What is next event?", "🏢 Explore Venues"],
    };
  }

  // 5. Venues & space booking search
  if (query.includes("venue") || query.includes("space") || query.includes("hall") || query.includes("booking") || query.includes("rent")) {
    if (!venues || venues.length === 0) {
      return {
        reply: "🏢 No venue spaces found in database.",
        quickPrompts: ["What is next event?"],
      };
    }
    const venueListStr = venues
      .map(
        (v, i) =>
          `**${i + 1}. ${v.name}**\n📍 *${v.branch || v.city || 'TRACE Expert City'}*\n👥 Capacity: ${v.capacity} guests | 💰 ${v.rentalPrice}`
      )
      .join("\n\n");

    return {
      reply: `🏢 **Available Venues in Database:**\n\n${venueListStr}\n\n💡 *To book a space, navigate to **Spaces** in the menu!*`,
      quickPrompts: ["What is next event?", "Upcoming Events"],
    };
  }

  // 6. Direct Database Regex Search on Event Collection
  try {
    const searchMatches = await Event.find({
      $and: [
        { status: { $ne: "draft" } },
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).limit(5).lean();

    if (searchMatches && searchMatches.length > 0) {
      const matchStr = searchMatches
        .map((e) => `📌 **${e.title}**\n📍 ${e.location} | 📅 ${new Date(e.date).toLocaleDateString()} @ ${e.time}`)
        .join("\n\n");
      return {
        reply: `🔍 **Database search results for "${userPrompt}":**\n\n${matchStr}`,
        quickPrompts: ["What is next event?", "📅 Upcoming Events"],
      };
    }
  } catch (err) {
    console.error("DB Search error:", err);
  }

  // If query is an unknown question and no DB matches found
  return {
    reply: `Hi, thank you for reaching out. You are currently being assisted by our AI assistant.\n\nNo matching events or details were found in the database for "${userPrompt}". Try asking about *"next event"* or *"upcoming events"*!`,
    quickPrompts: ["What is next event?", "📅 Upcoming Events", "🏢 Explore Venues"],
  };
}

/**
 * Controller endpoint: POST /api/chat/message
 */
const handleChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message text is required." });
    }

    // Query real-time cached & database data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allDbEvents = getEventsCache();
    if (!allDbEvents || allDbEvents.length === 0) {
      try {
        const fetchPromise = Event.find({ status: { $ne: "draft" } }).select("-gallery").sort({ date: 1 }).lean();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000));
        allDbEvents = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (e) {
        allDbEvents = getEventsCache() || [];
      }
    }
    
    // Extract upcoming and past events dynamically
    const upcomingEvents = (allDbEvents || []).filter(e => e.status !== "draft" && new Date(e.date) >= today);
    const pastEvents = (allDbEvents || []).filter(e => e.status !== "draft" && new Date(e.date) < today);

    let venues = getVenuesCache();
    if (!venues || venues.length === 0) {
      try {
        const fetchPromise = Venue.find({ status: "Available" }).limit(10).lean();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000));
        venues = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (e) {
        venues = getVenuesCache() || [];
      }
    }

    const systemContext = `
REAL MONGO DATABASE KNOWLEDGE:
- Upcoming Events: ${
      upcomingEvents.length > 0
        ? upcomingEvents.map((e) => `[ID: ${e._id}] Title: ${e.title}, Date: ${new Date(e.date).toDateString()}, Time: ${e.time}, Location: ${e.location}, Desc: ${(e.description || "").replace(/<[^>]*>?/gm, '').substring(0, 150)}...`).join("; ")
        : "NONE"
    }
- Past Events: ${
      pastEvents.length > 0
        ? pastEvents.map((e) => `[ID: ${e._id}] Title: ${e.title}, Date: ${new Date(e.date).toDateString()}`).join("; ")
        : "NONE"
    }
- Available Venues: ${
      venues.length > 0
        ? venues.map((v) => `[ID: ${v._id}] Name: ${v.name}, Branch: ${v.branch || 'TRACE Expert City'}, Address: ${v.address}, Capacity: ${v.capacity} persons, Rental Price: ${v.rentalPrice || (v.pricePerHour ? 'Rs. ' + Number(v.pricePerHour).toLocaleString() + ' / hr' : '')}, Type: ${v.type || 'Space'}, Amenities: ${(v.amenities || []).join(', ')}`).join("; ")
        : "NONE"
    }
`;

    let botReply = await getGeminiResponse(message, conversationHistory, systemContext);
    let quickPrompts = ["What is next event?", "Upcoming Events", "Explore Venues"];

    if (!botReply) {
      const fallbackResult = await generateSmartFallbackResponse(message, upcomingEvents, allDbEvents, venues);
      botReply = fallbackResult.reply;
      if (fallbackResult.quickPrompts) {
        quickPrompts = fallbackResult.quickPrompts;
      }
    }

    return res.status(200).json({
      success: true,
      reply: botReply,
      quickPrompts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error processing chat message.",
      reply: "Hi, thank you for reaching out. Unable to access the database right now. Please try again shortly!",
      quickPrompts: ["What is next event?", "Upcoming Events"],
    });
  }
};

module.exports = {
  handleChatMessage,
};
