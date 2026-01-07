import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
    selectedOption: { type: mongoose.Schema.Types.ObjectId, required: true }, // ✅ Add this
    isCorrect: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
});


export default mongoose.model("Response", responseSchema);
