import React, { useEffect, useState } from "react";
import axios from "axios";
import PollHistory from "../components/PollHistory"; // Your styled component

const PollHistoryPage = () => {
    const [pollHistory, setPollHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get("https://live-polling-system-5f56.onrender.com/api/polls/history");
                setPollHistory(res.data); // Make sure this matches your backend response
            } catch (err) {
                console.error("Failed to fetch poll history", err);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-white p-6">
            <PollHistory history={pollHistory} />
        </div>
    );
};

export default PollHistoryPage;
