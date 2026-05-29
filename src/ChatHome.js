import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
    const [connection, setConnection] = useState(null);
    const [usermessages, setUserMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [chatRoom, setChatRoom] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connection) {
            connection.on("ReceiveMessage", (user, message) => {
                setUserMessages(prevMessages => [...prevMessages, { user, message }]);
            });

            connection.onclose(() => {
                console.log("Connection closed");
            });
        }
    }, [connection]);

    const joinChatRoom = async (userName, chatRoom) => {
        setLoading(true);
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5055/chat")//replce your backend Url
            .configureLogging(LogLevel.Information)
            .build();

        await connection.start();
        await connection.invoke("JoinChatRoom", userName, chatRoom);
        setConnection(connection);
        setLoading(false);
    };

    const sendMessage = async (message) => {
        if (connection) {
            await connection.invoke("SendMessage", chatRoom, userName, message);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <main className="container flex-grow mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white">Connecting to chat room...</p>
                    </div>
                ) : (
                    connection ? (
                        <>
                            <ChatRoom usermessages={usermessages} />
                            <ChatBox sendMessage={sendMessage} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-screen bg-gray-900">
                            <div className="w-full max-w-lg p-8 mx-4 bg-white rounded-lg shadow-lg md:mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Enter chat room name"
                                    value={chatRoom}
                                    onChange={(e) => setChatRoom(e.target.value)}
                                />
                                <button onClick={() => joinChatRoom(userName, chatRoom)}>Join Chat Room</button>
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ChatHome;