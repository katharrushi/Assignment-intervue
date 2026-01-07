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

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: [
      "https://assignment-frontend-v2.vercel.app/", // Replace with your actual Vercel URL
      "https://assignment-intervue.onrender.com/",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   SOCKET.IO SETUP
   (Render-safe)
========================= */
const io = new Server(server, {
  cors: {
    origin: [
      "https://assignment-frontend-v2.vercel.app/", // Replace with your actual Vercel URL
      "https://assignment-intervue.onrender.com/",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"], // polling FIRST for Render
  pingTimeout: 60000,
  pingInterval: 25000,
});

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* =========================
   SOCKET EVENTS
========================= */
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socketHandler(socket, io);

  socket.on("disconnect", (reason) => {
    console.log("🔴 Client disconnected:", socket.id, "| Reason:", reason);
  });
});

/* =========================
   ROUTES
========================= */

// Health check
app.get("/", (req, res) => {
  res.send("🎉 Polling server is running!");
});

// Poll history API
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

      const totalVotes = optionCounts.reduce(
        (sum, opt) => sum + opt.count,
        0
      );

      return {
        _id: poll._id,
        question: poll.text,
        options: optionCounts.map((opt) => ({
          ...opt,
          percentage: totalVotes
            ? Math.round((opt.count / totalVotes) * 100)
            : 0,
        })),
        createdAt: poll.createdAt,
      };
    });

    res.json(history);
  } catch (error) {
    console.error("❌ Error fetching poll history:", error);
    res.status(500).json({ error: "Failed to fetch poll history" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
