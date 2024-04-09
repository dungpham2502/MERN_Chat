const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

const Message = mongoose.model('Message', messageSchema);
module.exports = Message