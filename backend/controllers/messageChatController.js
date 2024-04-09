const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
//post a new message
const createMessage = async(data) => {
    const { senderId, content, chatId } = data;
    let newMessage = await Message.create({ senderId, content, chatId });
    newMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'name')
        .exec();

    await Chat.findByIdAndUpdate(chatId, { $push: { messages: newMessage._id } });

    return newMessage;
};

//get messages for a chat
const getMessages = async(req, res) => {
    const { chatId } = req.params;
    try {
        const chat = await Chat.findById(chatId)
            .populate({
                path: 'messages', // Populate messages
                populate: {
                    path: 'senderId', // In each message, populate senderId
                    model: 'User',
                    select: '_id name' // Fetch both the '_id' and 'name' fields from User
                }
            });

        res.status(200).json({ messages: chat.messages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err.message });
    }
};

//create a new chat
const createChat = async({ name, participantEmails, requesterId }) => {
    console.log(name, participantEmails, requesterId);

    if (!name) {
        throw new Error('Chat name is required');
    }

    if (!participantEmails || !Array.isArray(participantEmails) || participantEmails.length === 0) {
        throw new Error('participantEmails is required and must be a non-empty array');
    }

    const users = await User.find({ email: { $in: participantEmails } });

    if (users.length !== participantEmails.length) {
        throw new Error('Some participants not found');
    }

    const requester = await User.findById(requesterId);

    if (!requester || users.find(user => user._id.toString() === requester._id.toString())) {
        throw new Error('Invalid user making the request or user already a participant');
    }

    const participantIds = users.map(user => user._id);
    participantIds.push(requester._id);

    const newChat = await Chat.create({ name, participants: participantIds });

    return newChat;
};



//Get al chats for a user
const getChats = async(req, res) => {
    const { userId } = req.params;

    try {
        const chats = await Chat.find({ participants: userId }).populate('participants', 'name');
        res.status(200).json({ chats: chats });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

//Add participants to a chat
const addParticipants = async(req, res) => {
    const { participants } = req.body;
    const { chatId } = req.params;

    if (!participants || participants.length === 0) {
        return res.status(400).json({ error: 'There must be at least one participant to add' });
    }
    try {
        const updatedChat = await Chat.findByIdAndUpdate(chatId, { $addToSet: { participants: { $each: participants } } }, { new: true }).populate('participants', 'name');
        res.status(200).json({ updatedChat: updatedChat });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

const getSender = async(req, res) => {
    const { id } = req.params;
    try {
        const sender = User.findById(id);
        res.status(200).json({ sender: sender });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createMessage,
    getMessages,
    createChat,
    getChats,
    addParticipants,
    getSender
}