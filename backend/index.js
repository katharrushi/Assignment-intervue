import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import socketHandler from "./socket.js";
import Poll from "./models/Poll.js";
import Response from "./models/Response.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend access
app.use(cors());
app.use(express.json());

// Create the Socket.IO server
const io = new Server(server, {
    cors: {
        origin: ["https://live-polling-system-5f56.onrender.com", "http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
    socketHandler(socket, io);
});

// Basic test route
app.get("/", (req, res) => {
    res.send("🎉 Polling server is running!");
});

// GET /api/polls/history
app.get("/api/polls/history", async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        const responses = await Response.find();

        const history = polls.map((poll) => {
            const pollResponses = responses.filter(
                (r) => r.pollId?.toString() === poll._id.toString()
            );

            const optionCounts = poll.options.map((option) => {
                const count = pollResponses.filter(
                    (r) =>
                        r.selectedOption &&
                        r.selectedOption.toString() === option._id.toString()
                ).length;

                return {
                    _id: option._id,
                    text: option.text,
                    isCorrect: option.isCorrect,
                    count,
                };
            });

            const totalVotes = optionCounts.reduce((acc, opt) => acc + opt.count, 0);

            return {
                _id: poll._id,
                question: poll.text,
                options: optionCounts.map((opt) => ({
                    ...opt,
                    percentage: totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0,
                })),
                createdAt: poll.createdAt,
            };
        });

        res.json(history);
    } catch (err) {
        console.error("Error in /api/polls/history:", err);
        res.status(500).json({ error: "Failed to fetch poll history" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
