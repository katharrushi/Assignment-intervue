import Poll from "./models/Poll.js";
import Student from "./models/Student.js";
import Response from "./models/Response.js";
import Message from "./models/Message.js";

const connectedStudents = {}; // socket.id => name mapping

// Get updated list of students after kicking
async function getUpdatedList() {
    const students = await Student.find({ isKicked: false });
    return students.map(s => s.name);
}

export default function socketHandler(socket, io) {
    console.log("New client connected:", socket.id);

    // Student registration
    socket.on("register-student", async ({ name }) => {
        try {
            socket.data.name = name;

            // Check if student with this name already exists and is not kicked
            const existingStudent = await Student.findOne({ name, isKicked: false });
            
            if (existingStudent) {
                // Update the existing student's socket ID
                await Student.updateOne(
                    { name, isKicked: false },
                    { $set: { socketId: socket.id } }
                );
            } else {
                // Create new student or reactivate kicked student
                await Student.updateOne(
                    { name },
                    { $set: { name, socketId: socket.id, isKicked: false } },
                    { upsert: true }
                );
            }

            // Store student name in connected students mapping
            connectedStudents[socket.id] = name;

            const students = await Student.find({ isKicked: false });
            const participantNames = students.map(s => s.name);

            socket.emit("registration:success");
            io.emit("participants:update", participantNames);
            
            // Check for active poll and send to newly registered student
            const activePoll = await Poll.findOne().sort({ createdAt: -1 });
            if (activePoll) {
                const existingResponse = await Response.findOne({
                    studentId: existingStudent?._id,
                    pollId: activePoll._id
                });
                
                if (!existingResponse) {
                    socket.emit("poll-started", activePoll);
                } else {
                    socket.emit("no-active-poll");
                }
            } else {
                socket.emit("no-active-poll");
            }
        } catch (error) {
            console.error("Error registering student:", error);
            socket.emit("registration:error", { message: "Failed to register" });
        }
    });

    // Request Participants list
    socket.on("request-participants", async () => {
        const students = await Student.find({ isKicked: false });
        const participantNames = students.map(s => s.name);
        socket.emit("participants:update", participantNames);
    });

    // Request current active poll
    socket.on("request-current-poll", async () => {
        console.log("Student requesting current poll");
        try {
            const activePoll = await Poll.findOne().sort({ createdAt: -1 });
            if (activePoll) {
                // Check if this student has already answered this poll
                const student = await Student.findOne({ socketId: socket.id });
                if (student) {
                    const existingResponse = await Response.findOne({
                        studentId: student._id,
                        pollId: activePoll._id
                    });
                    
                    if (existingResponse) {
                        console.log("Student already answered this poll");
                        socket.emit("no-active-poll");
                        return;
                    }
                }
                
                console.log("Sending active poll to student:", activePoll._id, activePoll.text);
                socket.emit("poll-started", activePoll);
            } else {
                console.log("No active poll found");
                socket.emit("no-active-poll");
            }
        } catch (error) {
            console.error("Error fetching active poll:", error);
        }
    });


    // Real-time chat
    socket.on("chat:message", async ({ sender, text }) => {
        if (sender != 'Teacher') {
            const student = await Student.findOne({ name: sender });

            if (!student || student.isKicked) return;
        }

        const newMsg = await Message.create({
            sender,
            text,
            socketId: socket.id,
        });

        io.emit("chat:message", {
            sender: newMsg.sender,
            text: newMsg.text,
            createdAt: newMsg.createdAt,
        });
    });

    // To get all the messages
    socket.on("get-all-messages", async () => {
        const allMessages = await Message.find({}).sort({ createdAt: 1 });
        socket.emit("chat:messages", allMessages);
    });


    // Teacher creates poll
    socket.on("create-poll", async ({ text, options, timeLimit }) => {
        console.log("Creating poll:", { text, options, timeLimit });
        try {
            const poll = await Poll.create({ text, options, timeLimit });
            console.log("Poll created successfully:", poll._id, poll.text);
            
            // Broadcast to ALL connected clients
            io.emit("poll-started", poll);
            console.log("Poll broadcasted to all clients");
        } catch (error) {
            console.error("Error creating poll:", error);
        }
    });

    async function checkCanAskNew() {
    const activePoll = await Poll.findOne().sort({ createdAt: -1 });
    if (!activePoll) return true;

    const responses = await Response.find({ pollId: activePoll._id });
    const totalStudents = await Student.countDocuments({ isKicked: false });

    return responses.length >= totalStudents;
}


    // Student submits answer
    socket.on("submit-answer", async ({ questionId, answer }) => {
        const student = await Student.findOne({ socketId: socket.id });
        if (!student) return;

        const poll = await Poll.findById(questionId);
        if (!poll) return;

        const option = poll.options.id(answer);
        const isCorrect = option?.isCorrect || false;

        await Response.create({
            studentId: student._id,
            pollId: questionId,
            selectedOption: answer,
            isCorrect,
        });

        const responses = await Response.find({ pollId: questionId });

        const result = { answers: {} };
        for (const opt of poll.options) {
            result.answers[opt._id] = 0;
        }

        for (const res of responses) {
            const id = res.selectedOption?.toString();
            if (id && result.answers[id] !== undefined) {
                result.answers[id] += 1;
            }
        }

        const canAskNew = await checkCanAskNew();

        io.emit("poll-results", result);
    });

    // History of the poll
    socket.on("get-poll-history", async () => {
        const polls = await Poll.find({}).sort({ createdAt: -1 }).limit(10);
        const allResults = [];

        for (const poll of polls) {
            const responses = await Response.find({ pollId: poll._id });
            const result = {};

            for (const opt of poll.options) {
                result[opt._id] = 0;
            }

            for (const res of responses) {
                const id = res.selectedOption?.toString();
                if (id && result[id] !== undefined) {
                    result[id] += 1;
                }
            }

            allResults.push({
                poll,
                results: result
            });
        }

        socket.emit("poll-history", allResults);
    });

    // Teacher ends current poll
    socket.on("poll-ended", () => {
        console.log("Teacher ended the current poll");
        io.emit("poll-ended");
    });

    // Kick
    socket.on('kick-student', async ({ name }) => {
        try {
            const student = await Student.findOneAndUpdate(
                { name, isKicked: false },
                { $set: { isKicked: true } }
            );

            if (!student) {
                console.log(`Student ${name} not found or already kicked`);
                return;
            }

            // Find and disconnect the target socket
            const targetSocket = [...io.sockets.sockets.values()].find(
                (s) => s.data?.name === name
            );

            if (targetSocket) {
                targetSocket.emit('kicked');
                targetSocket.disconnect(true);
                // Remove from connected students
                delete connectedStudents[targetSocket.id];
            }

            // Update participants list for all clients
            const updatedList = await getUpdatedList();
            io.emit('participants:update', updatedList);
            
            console.log(`Student ${name} has been kicked successfully`);
        } catch (error) {
            console.error("Error kicking student:", error);
        }
    });

    // Disconnect cleanup
    socket.on("disconnect", async () => {
        try {
            const studentName = socket.data?.name || connectedStudents[socket.id];
            
            if (studentName) {
                // Only remove from database if student wasn't kicked
                const student = await Student.findOne({ name: studentName });
                if (student && !student.isKicked) {
                    await Student.deleteOne({ name: studentName });
                }
                
                // Remove from connected students mapping
                delete connectedStudents[socket.id];
                
                // Update participants list
                const students = await Student.find({ isKicked: false });
                const participantNames = students.map(s => s.name);
                io.emit("participants:update", participantNames);
            }
        } catch (error) {
            console.error("Error during disconnect cleanup:", error);
        }
    });
}
