import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
});

const pollSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [optionSchema],
    timeLimit: { type: Number, default: 60 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Poll", pollSchema);
