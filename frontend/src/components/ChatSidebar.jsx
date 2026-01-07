import React, { useEffect, useRef, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import socket from '../socket';

const ChatSidebar = () => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [participants, setParticipants] = useState([]);
    const [role, setRole] = useState(localStorage.getItem("userRole") || "student");
    const name = localStorage.getItem("studentName") || "Teacher";
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.emit("get-all-messages");
        socket.emit("request-participants");

        socket.on("chat:messages", (msgs) => {
            setMessages(msgs);
            scrollToBottom();
        });

        socket.on("chat:message", (msg) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        });

        socket.on("participants:update", (data) => {
            setParticipants(data);
        });

        return () => {
            socket.off("chat:messages");
            socket.off("chat:message");
            socket.off("participants:update");
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (input.trim()) {
            const msg = {
                sender: role === "teacher" ? "Teacher" : name,
                text: input.trim(),
            };
            socket.emit("chat:message", msg);
            setInput('');
        }
    };

    const handleKick = (targetName) => {
        if (role !== 'teacher') return;
        socket.emit('kick-student', { name: targetName });
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
                    onClick={() => setOpen(!open)}
                >
                    <FiMessageSquare size={24} />
                </button>
            </div>

            {/* Sidebar Panel */}
            {open && (
                <div
                    className="
                        fixed bottom-20 border right-6 md:right-6 
                        w-fit md:w-96 
                        p-3
                        max-h-[80vh] md:max-h-[600px] 
                        bg-white rounded-t-2xl md:rounded-xl 
                        shadow-2xl border-gray-200 
                        z-40 flex flex-col animate-slide-in
                        md:bottom-20
                        sm:right-0 sm:bottom-0
                    "
                >
                    {/* Tabs */}
                    <div className="flex border-b border-gray-300">
                        {['chat', 'participants'].map((tabName) => (
                            <button
                                key={tabName}
                                className={`flex-1 px-4 py-2 text-sm font-medium transition ${tab === tabName
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                onClick={() => setTab(tabName)}
                            >
                                {tabName === 'chat' ? 'Chat' : 'Participants'}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden h-[70vh] md:h-80">
                        {tab === 'chat' ? (
                            <div className="flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            No messages yet.
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isOwn = msg.sender === name || (role === "teacher" && msg.sender === "Teacher");
                                            return (
                                                <div
                                                    key={index}
                                                    className={`max-w-[75%] px-3 py-2 rounded-xl shadow text-sm ${isOwn
                                                        ? 'bg-purple-600 text-white self-end rounded-br-none'
                                                        : 'bg-gray-100 text-gray-800 self-start rounded-bl-none'
                                                        }`}
                                                >
                                                    <div className="font-semibold text-xs mb-1">
                                                        {msg.sender}
                                                    </div>
                                                    {msg.text}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef}></div>
                                </div>
                                {/* Input Area */}
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        <IoSend size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-y-auto h-[70vh] md:h-80 text-sm">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-300 font-semibold">
                                            <th className="py-2 text-left">Name</th>
                                            {role === 'teacher' && (
                                                <th className="py-2 text-right">Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((participantName, idx) => (
                                            <tr key={idx} className="border-b border-gray-100">
                                                <td className="py-2">{participantName}</td>
                                                {role === 'teacher' && (
                                                    <td className="py-2 text-right">
                                                        <button
                                                            onClick={() => handleKick(participantName)}
                                                            className="text-red-500 hover:underline"
                                                        >
                                                            Kick
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Slide-in animation */}
            <style jsx>{`
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                @keyframes slide-in {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default ChatSidebar;
