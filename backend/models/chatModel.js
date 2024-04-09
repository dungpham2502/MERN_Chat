const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    name: {
        type: String,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: []
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;