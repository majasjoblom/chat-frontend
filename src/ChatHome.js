import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
    const [connection, setConnection] = useState(null);
    const [userMessages, setUserMessages] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [userName, setUserName] = useState('');
    const [chatRoom, setChatRoom] = useState('');
    const [role, setRole] = useState('Student');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connection) {
            connection.on("ReceiveMessage", (user, message) => {
                setUserMessages(prev => [...prev, { user, message }].slice(-50));
            });

            connection.on("ReceiveAnnouncement", (user, message) => {
                setAnnouncements(prev => [...prev, { user, message }].slice(-20));
            });

            connection.onclose(() => {
                console.log("Connection closed");
            });
        }
    }, [connection]);

    const joinChatRoom = async () => {
        if (!userName.trim() || !chatRoom.trim()) {
            alert("Enter both name and chat room");
            return;
        }

        setLoading(true);

        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5055/chat")
            .configureLogging(LogLevel.Information)
            .build();

        await newConnection.start();
        await newConnection.invoke("JoinChatRoom", userName, chatRoom, role);

        setConnection(newConnection);
        setLoading(false);
    };

    const sendMessage = async (message) => {
        if (connection && message.trim()) {
            await connection.invoke("SendMessage", chatRoom, userName, message);
        }
    };

    const sendAnnouncement = async (message) => {
        if (connection && role === "Teacher" && message.trim()) {
            await connection.invoke("SendAnnouncement", userName, message);
        }
    };

    return (
        <div>
            {loading ? (
                <p>Connecting to chat room...</p>
            ) : connection ? (
                <>
                    <h2>Chat room: {chatRoom}</h2>
                    <p>Logged in as: {userName} ({role})</p>

                    <h3>Announcements</h3>
                    <ChatRoom usermessages={announcements} />

                    {role === "Teacher" && (
                        <>
                            <h4>Send announcement</h4>
                            <ChatBox sendMessage={sendAnnouncement} />
                        </>
                    )}

                    <h3>General chat</h3>
                    <ChatRoom usermessages={userMessages} />
                    <ChatBox sendMessage={sendMessage} />
                </>
            ) : (
                <div>
                    <h2>Join chat</h2>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Enter chat room"
                        value={chatRoom}
                        onChange={(e) => setChatRoom(e.target.value)}
                    />

                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                    </select>

                    <button onClick={joinChatRoom}>Join Chat Room</button>
                </div>
            )}
        </div>
    );
};

export default ChatHome;