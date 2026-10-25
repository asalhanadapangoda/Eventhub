const express = require("express");
const router = express.Router();
const { handleChatMessage } = require("../controlers/chatController");

// POST /api/chat/message - Send prompt to AI chatbot
router.post("/message", handleChatMessage);

module.exports = router;
