// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: String,
        text: String,
        socketId: String,
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
