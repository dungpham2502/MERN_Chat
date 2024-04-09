require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

const userRoutes = require('./routes/userRoutes');
const messageChatRoutes = require('./routes/messageChatRoutes');
const { createMessage, createChat } = require('./controllers/messageChatController');
const { error } = require('console');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // For development, allow all origins
        methods: ["GET", "POST"],
    },
});


app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api', messageChatRoutes);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/chatapp');
}


io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            try {
                const user = await User.findById(decoded.id);
                if (!user) {
                    return next(new Error('Authentication error'));
                }
                socket.user = user;
                next();
            } catch (err) {
                next(new Error('Authentication Error'));
            }
        })
    } else {
        next(new Error('Authentication Error'));
    }
}).on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    //Listen to joinChatRoom event
    socket.on('joinChatRoom', (roomId) => {
        console.log(`User ${socket.id} joined room: ${roomId}`);
        socket.join(roomId); //Add client to the room
    });

    //Listen to newChatMessage event
    socket.on('newChatMessage', async(data) => {
        const { content, senderId, chatId } = data;
        const newMessage = await createMessage(data);
        const senderName = newMessage.senderId.name
        io.to(chatId).emit('chatMessage', { content, senderId, chatId, senderName });

    });

    //Listen to createChatRoom event
    socket.on('createChatRoom', async(roomDetails) => {
        roomDetails.requesterId = socket.user._id;
        try {
            const newRoom = await createChat(roomDetails);
            io.emit('newChatRoom', newRoom);
        } catch (err) {
            socket.emit('errorCreatingChatRoom', { error: err.message });
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));