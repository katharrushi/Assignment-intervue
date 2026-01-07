import React, { useEffect, useState } from "react";
import socket from "../socket";
import PollQuestion from "./PollQuestion";
import ChatSidebar from "./ChatSidebar";
import WaitingScreen from "./WaitingScreen";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [question, setQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        socket.on('kicked', () => {
            localStorage.removeItem("studentName");
            localStorage.removeItem("userRole"); // optional: clear student identity
            navigate('/kicked');
        });

        return () => {
            socket.off('kicked');
        };
    }, []);

    useEffect(() => {
        const storedName = localStorage.getItem("studentName");
        const storedRole = localStorage.getItem("userRole");

        if (storedName && storedRole) {
            setName(storedName);
            socket.emit("register-student", { name: storedName });
            setIsRegistered(true);
        }
    }, []);


    const handleRegister = () => {
        if (name.trim() === "") return;

        socket.emit("register-student", { name });

        socket.once("registration:success", () => {
            localStorage.setItem("studentName", name);
            localStorage.setItem("userRole", "student");
            setIsRegistered(true);
            socket.emit("request-participants");
        });

        socket.once("registration:error", (error) => {
            alert(error.message || "Failed to register. Please try again.");
        });
    };

    useEffect(() => {
        socket.on("poll-started", (q) => {
            console.log("Received poll:", q);
            setQuestion(q);
            setSubmitted(false);
            setResult(null);
            setSelectedOption("");
            setTimer(q.timeLimit || 60);
        });

        socket.on("poll-results", (data) => {
            console.log("Student received results:", data);
            setResult(data);
        });

        socket.on("no-active-poll", () => {
            console.log("No active poll available");
            setQuestion(null);
        });

        socket.on("poll-ended", () => {
            console.log("Poll ended by teacher");
            setQuestion(null);
            setSubmitted(false);
            setResult(null);
            setSelectedOption("");
        });

        return () => {
            socket.off("poll-started");
            socket.off("poll-results");
            socket.off("no-active-poll");
            socket.off("poll-ended");
        };
    }, []);

    useEffect(() => {
        if (!question || submitted) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    socket.emit("timeout", { questionId: question._id });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [question, submitted]);

    const handleSubmit = () => {
        if (!selectedOption || !question) return;
        socket.emit("submit-answer", {
            questionId: question._id,
            answer: selectedOption,
        });
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-white px-6">
            {!isRegistered ? (
                <div className="min-h-screen flex items-center justify-center bg-white px-4">
                    <div className="w-full max-w-xl mx-auto text-center">
                        {/* Badge */}
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white mb-6 inline-block">
                            ✨ Intervue Poll
                        </span>

                        {/* Headings */}
                        <h1 className="text-3xl sm:text-4xl font-semibold mb-2">
                            Let’s <span className="font-bold text-black">Get Started</span>
                        </h1>
                        <p className="text-muted text-sm mb-8">
                            If you’re a student, you’ll be able to <strong>submit your answers</strong>,
                            participate in live polls, and see how your responses compare with your classmates.
                        </p>

                        {/* Name Input */}
                        <div className="flex items-center justify-center">
                            <div className="max-w-md w-full px-4">
                                <div className="text-left mb-4">
                                    <label className="text-sm font-medium text-dark block mb-1">
                                        Enter your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full p-3 rounded-full bg-muted/10 border border-muted text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Continue Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleRegister}
                                        className="w-40 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold transition-all hover:opacity-90"
                                    >
                                        Continue
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                <>
                    <ChatSidebar />
                    {!question ? (
                        <WaitingScreen />
                    ) : (
                        <div className="min-h-screen flex items-center justify-center bg-white px-4">
                            <div className="w-full max-w-6xl p-6 rounded-xl shadow-md space-y-6 bg-white">
                                <h2 className="text-center text-xl font-semibold">Welcome, {name}!</h2>

                                {/* Show Question */}
                                {!submitted && (
                                    <PollQuestion
                                        question={question}
                                        selectedOption={selectedOption}
                                        setSelectedOption={setSelectedOption}
                                        handleSubmit={handleSubmit}
                                        timer={timer}
                                    />
                                )}

                                {/* Waiting */}
                                {submitted && !result && (
                                    <div className="text-center mt-4 text-secondary text-lg font-medium">
                                        Waiting for results...
                                    </div>
                                )}

                                {/* Show Results */}
                                {result && (
                                    <PollQuestion
                                        question={question}
                                        selectedOption={selectedOption}
                                        setSelectedOption={setSelectedOption}
                                        handleSubmit={handleSubmit}
                                        timer={timer}
                                        submitted={submitted}
                                        result={result}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
