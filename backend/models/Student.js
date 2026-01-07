import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    socketId: {
        type: String,
        required: true
    },
    isKicked: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index to ensure unique active students
studentSchema.index({ name: 1, isKicked: 1 }, { unique: true, partialFilterExpression: { isKicked: false } });

export default mongoose.model("Student", studentSchema);
