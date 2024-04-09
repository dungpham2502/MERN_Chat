import React, { useState, useEffect } from 'react';
import { useUser } from '../context/userContext';

const CreateChatRoom = ({ socket }) => {
  const [newChatName, setNewChatName] = useState('');
  const [newChatParticipants, setNewChatParticipants] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for the succesful creation of a chat room
    const handleChatRoomCreated = (newChatRoom) => {
      console.log('Chat room created:', newChatRoom);
      setNewChatName('');
      setNewChatParticipants('');
      setError(''); 
    };

    // Listen for errors in creating a cha
    const handleErrorCreatingChatRoom = (error) => {
      setError(error.error);
    };

    // Register event listeners
    socket.on('chatRoomCreated', handleChatRoomCreated);
    socket.on('errorCreatingChatRoom', handleErrorCreatingChatRoom);

    // Cleanup event listeners on component unmount
    return () => {
      socket.off('chatRoomCreated', handleChatRoomCreated);
      socket.off('errorCreatingChatRoom', handleErrorCreatingChatRoom);
    };
  }, [socket]);

  const createChatRoom = async (e) => {
    e.preventDefault();

    if (!newChatName.trim()) {
      setError('Chat name is required.');
      return;
    }

    const emails = newChatParticipants.split(',')
      .map(email => email.trim())
      .filter(email => email);

    if (emails.length === 0) {
      setError('At least one participant email is required');
      return;
    }

    socket.emit('createChatRoom', {
      name: newChatName,
      participantEmails: emails,
    });
  };

  return (
    <div className="p-4">
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={createChatRoom}>
        <input
          type="text"
          className="text-black w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New Chat Name"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
        />
        <input
          type="text"
          className="text-black w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Participants (comma-separated emails)"
          value={newChatParticipants}
          onChange={(e) => setNewChatParticipants(e.target.value)}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Chat
        </button>
      </form>
    </div>
  );
};

export default CreateChatRoom;
