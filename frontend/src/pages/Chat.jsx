import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CreateChatRoom from '../components/CreateChatRoom';
import { useUser } from '../context/userContext';
import socketIOClient from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const ENDPOINT = 'http://localhost:3000';

function ChatPage() {
  //Keep track of state
  const [chatRooms, setChatRooms] = useState([]);
  const [currentChat, setCurrentChat] = useState({ id: '', name: '' });
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    if (!user.token) return;

    // Initializa socket connection
    socket.current = socketIOClient(ENDPOINT, {
      auth: { token: user.token },
      transports: ['websocket'],
    });

    //Listen for chatMessage event
    socket.current.on('chatMessage', (newMessage) => {
      if (newMessage.chatId === currentChat.id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    //Listen for new chat room event
    socket.current.on('newChatRoom', (newChatRoom) => {
      setChatRooms((prevChatRooms) => [...prevChatRooms, newChatRoom]);
    })

    return () => socket.current.disconnect();
  }, [currentChat.id]);

  useEffect(() => {
    if (user?.id) fetchChats();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to fetch chats
  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/users/${user.id}/chats`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setChatRooms(data.chats);
      setError('');
    } catch (err) {
      setError('Failed to load chats. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle chat selection
  const handleChatSelection = async (chatRoom) => {
    setCurrentChat({ id: chatRoom._id, name: chatRoom.name });
    fetchMessages(chatRoom._id);
  };


  // Function to fetch messages
  const fetchMessages = async (chatId) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${ENDPOINT}/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data.messages);
      socket.current.emit('joinChatRoom', chatId); // Join chat room
    } catch (err) {
      setError('Failed to load messages. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle sending message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        content: message,
        senderId: user.id,
        chatId: currentChat.id
      };
      socket.current.emit('newChatMessage', messageData);
      setMessage('');
    }
  };

  if (isLoading) return <div>Loading chats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-800 text-white">
        <div className="p-4 font-bold">Rooms</div>
        <CreateChatRoom socket={socket.current}/>
        {chatRooms.length === 0 ? (
          <div className="p-4">No chat rooms available.</div>
        ) : (
          <ul>
            {chatRooms.map((chatRoom) => (
              <li key={chatRoom._id} onClick={() => handleChatSelection(chatRoom)}
                  className={`p-4 cursor-pointer ${currentChat.id === chatRoom._id ? 'bg-gray-700' : ''}`}>
                {chatRoom.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-500 text-white p-4">{currentChat.name}</header>
        {currentChat.id && (
          <div className="flex-grow overflow-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div>{msg.senderName || msg.senderId.name}</div>
                <div className="bg-gray-100 text-gray-800 rounded p-2">{msg.content}</div>
                <div ref={messagesEndRef} /> {/* This empty div will be used to scroll to */}
              </div>
            ))}
          </div>
        )}
        {currentChat.id && (
          <form className="flex p-4" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Send</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChatPage
