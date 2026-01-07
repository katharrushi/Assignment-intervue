import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatSidebar from "./ChatSidebar";
import socket from "../socket";

const LiveResults = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { poll, timeLimit } = state || {};

    const [timer, setTimer] = useState(timeLimit || 60);
    const [results, setResults] = useState(null);
    const [canAskNew, setCanAskNew] = useState(false);

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Listen for live poll results
        socket.on("poll-results", (data) => {
            setResults(data);
        });

        // Listen for poll status (can teacher ask new question)
        socket.on("poll-status", ({ canAskNew }) => {
            setCanAskNew(canAskNew);
        });

        return () => {
            socket.off("poll-results");
            socket.off("poll-status");
            clearInterval(interval);
        };
    }, []);

    if (!poll) {
        return (
            <div className="text-center text-red-500 mt-10">
                Poll data not found. Redirecting...
            </div>
        );
    }

    const totalVotes = results
        ? Object.values(results.answers || {}).reduce((a, b) => a + b, 0)
        : 0;

    return (
        <>
            <ChatSidebar />
            <div className="min-h-screen flex items-center p-6 bg-white text-dark">
                <div className="max-w-6xl w-full mx-auto">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold">Live Poll Results</h2>
                        <span className="text-sm text-red-500 font-semibold">
                            ⏱ {timer < 10 ? `0${timer}` : timer}s
                        </span>
                    </div>

                    <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-3 rounded-t-md text-sm font-medium">
                        {poll.text}
                    </div>

                    <div className="border border-gray-200 rounded-b-md px-4 py-4 bg-white space-y-3">
                        {poll.options.map((opt, index) => {
                            const voteCount = results?.answers?.[opt._id] || 0;
                            const percent =
                                totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                            return (
                                <div key={opt._id}>
                                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                        <span className="w-6 h-6 flex items-center justify-center bg-primary text-white font-bold rounded-full text-xs">
                                            {index + 1}
                                        </span>
                                        <span>{opt.text}</span>
                                    </div>
                                    <div className="relative w-full bg-gray-100 rounded-lg h-6 overflow-hidden">
                                        <div
                                            className="bg-primary h-6 rounded-lg transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-semibold text-gray-800">
                                            {percent}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-center gap-4">
                        {canAskNew && (
                            <button
                                onClick={() => navigate("/teacher")}
                                className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary/80"
                            >
                                + Ask a new question
                            </button>
                        )}
                        <button
                            onClick={() => navigate("/poll-history")}
                            className="bg-purple-400 text-white px-5 py-2 rounded-full font-medium hover:bg-purple-500"
                        >
                            👁 View Poll History
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveResults;
