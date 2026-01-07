import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import ChatSidebar from "./ChatSidebar";

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
    ]);
    const [pollTime, setPollTime] = useState(60);
    const [currentPoll, setCurrentPoll] = useState(null);
    const [results, setResults] = useState(null);
    const [timer, setTimer] = useState(0);
    const [participants, setParticipants] = useState([]);

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index].text = value;
        setOptions(updated);
    };

    const handleCorrectToggle = (index, value) => {
        const updated = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index ? value : opt.isCorrect,
        }));
        setOptions(updated);
    };

    const handleKick = (targetName) => {
        if (window.confirm(`Are you sure you want to kick ${targetName}?`)) {
            socket.emit('kick-student', { name: targetName });
        }
    };

    const addOptionField = () => {
        if (options.length < 5) setOptions([...options, { text: "", isCorrect: false }]);
    };

    const resetPollState = () => {
        setResults(null);
        setCurrentPoll(null);
        setTimer(0);
        // Notify all students that the poll has ended
        socket.emit("poll-ended");
    };

    const createPoll = () => {
        const cleanOptions = options.filter((opt) => opt.text.trim() !== "");
        if (!questionText || cleanOptions.length < 2 || pollTime <= 0) return;

        socket.emit("create-poll", {
            text: questionText,
            options: cleanOptions,
            timeLimit: pollTime,
        });

        setQuestionText("");
        setOptions([
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
        ]);
        setPollTime(60);
    };

    useEffect(() => {
        let interval;

        // Request participants list on component mount
        socket.emit("request-participants");

        socket.on("participants:update", (data) => {
            setParticipants(data);
        });

        socket.on("poll-started", (poll) => {
            console.log("Poll started:", poll);
            setCurrentPoll(poll);
            setTimer(poll.timeLimit || 60);
            setResults(null); // Reset results for new poll
            
            // Start timer countdown
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on("poll-results", (data) => {
            console.log("Poll results:", data);
            setResults(data);
            clearInterval(interval); 
        });

        return () => {
            socket.off("participants:update");
            socket.off("poll-started");
            socket.off("poll-results");
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <ChatSidebar/>
            <div className="min-h-screen bg-white p-6 text-dark">
                <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow border border-gray-200">
                    <div className="mb-6">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white mb-4">
                            ✨ Intervue Poll
                        </span>
                        <h2 className="text-3xl font-bold mt-3">
                            Let's <span className="text-primary">Get Started</span>
                        </h2>
                        <p className="text-gray-500 mt-2">
                            You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                        </p>
                    </div>

                    {/* Participants Section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Connected Students ({participants.length})</h3>
                        {participants.length === 0 ? (
                            <p className="text-gray-500 text-sm">No students connected yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {participants.map((participantName, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                                        <span className="text-sm font-medium">{participantName}</span>
                                        <button
                                            onClick={() => handleKick(participantName)}
                                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                            title={`Kick ${participantName}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-4 flex justify-between items-center max-w-lg">
                        <label className="block font-medium text-gray-800 text-sm">Enter your question</label>
                        <select
                            value={pollTime}
                            onChange={(e) => setPollTime(Number(e.target.value))}
                            className="border border-gray-300 rounded px-3 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {[15, 30, 45, 60, 90, 120].map((sec) => (
                                <option key={sec} value={sec}>
                                    {sec} seconds
                                </option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value.slice(0, 100))}
                        placeholder="Type your question here..."
                        className="w-full max-w-lg border border-gray-300 rounded-md p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                    />
                    <div className="text-left text-xs text-gray-400 mt-1">
                        {questionText.length}/100
                    </div>

                    <div className="mt-6">
                        <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-gray-700">
                            <div>Edit Options</div>
                            <div>Is it Correct?</div>
                        </div>

                        {options.map((opt, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2 items-center mt-2">
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 flex items-center justify-center bg-primary text-white font-bold rounded-full text-xs">
                                        {index + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="flex-1 bg-gray-50  border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder={`Option ${index + 1}`}
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <label className="flex items-center space-x-2 text-sm font-medium">
                                        <input
                                            type="radio"
                                            name={`correct-${index}`}
                                            className="accent-primary"
                                            checked={opt.isCorrect === true}
                                            onChange={() => handleCorrectToggle(index, true)}
                                        />
                                        <span>Yes</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-sm font-medium">
                                        <input
                                            type="radio"
                                            name={`correct-${index}`}
                                            className="accent-primary"
                                            checked={opt.isCorrect === false}
                                            onChange={() => handleCorrectToggle(index, false)}
                                        />
                                        <span>No</span>
                                    </label>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addOptionField}
                            className="mt-4 text-sm border border-primary px-3 py-1 rounded-full text-primary hover:bg-rimary"
                        >
                            + Add More option
                        </button>
                    </div>

                    <hr className="border-t border-muted my-2 text-gray-100" />

                    <div className="flex justify-end">
                        <button
                            onClick={createPoll}
                            className="w-full max-w-xs bg-primary text-white font-semibold py-2 rounded-full hover:bg-purple-700 transition-all"
                        >
                            Ask Question
                        </button>
                    </div>

                    {results && currentPoll && (
                        <div className="mt-12 flex flex-col items-center">
                            <div className="w-full max-w-xl text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-bold text-black">Question</h2>
                                    <span className="text-sm font-semibold text-red-500">
                                        ⏱ {timer < 10 ? `0${timer}` : timer}
                                    </span>
                                </div>

                                <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-t-md px-4 py-3 text-sm font-medium">
                                    {currentPoll.text}
                                </div>

                                <div className="border border-gray-200 rounded-b-md px-4 py-4 bg-white space-y-3">
                                    {currentPoll.options.map((opt, index) => {
                                        const voteCount = results.answers?.[opt._id] || 0;
                                        const totalVotes = Object.values(results.answers || {}).reduce((a, b) => a + b, 0);
                                        const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                                        return (
                                            <div key={index}>
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
                            </div>

                            {/* Buttons */}
                            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                                <button
                                    className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/80"
                                    onClick={resetPollState}
                                >
                                    + Ask a new question
                                </button>

                                <button
                                    onClick={() => navigate("/poll-history")}
                                    className="bg-purple-300 text-white px-5 py-2 rounded-full font-medium hover:bg-purple-400 transition-all"
                                >
                                    👁 View Poll history
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherDashboard;