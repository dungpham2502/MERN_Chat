const express = require('express');
const router = express.Router();

// Import your controller functions
const {
    createMessage,
    getMessages,
    createChat,
    getChats,
    addParticipants,
    getSender
} = require('../controllers/messageChatController');

const userAuth = require('../middleware/userAuth');

router.use(userAuth);

// Message routes
router.post('/messages', createMessage);
router.get('/chats/:chatId/messages', getMessages);

// Chat routes
router.post('/chats', createChat);
router.get('/users/:userId/chats', getChats);
router.put('/chats/:chatId/participants', addParticipants);

// Sender routes
router.get('/users/:id', getSender);

module.exports = router;