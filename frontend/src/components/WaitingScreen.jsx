import React from "react";
import socket from "../socket";

const WaitingScreen = () => {
    const handleRefresh = () => {
        console.log("Manually requesting current poll");
        socket.emit("request-current-poll");
    };

    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm px-4 py-1 rounded-full mb-4">
                    ✨ Intervue Poll
                </div>
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-2xl font-semibold text-black text-center mb-4">
                    Wait for the teacher to ask questions..
                </p>
                <button 
                    onClick={handleRefresh}
                    className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-600 transition-all"
                >
                    Check for Questions
                </button>
            </div>
        </div>
    );
};

export default WaitingScreen;
