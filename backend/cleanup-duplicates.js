import mongoose from 'mongoose';
import Student from './models/Student.js';

// Connect to MongoDB (adjust connection string as needed)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polling-system');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Clean up duplicate students
const cleanupDuplicates = async () => {
    try {
        console.log('Starting cleanup of duplicate students...');
        
        // Find all students grouped by name
        const duplicates = await Student.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                    docs: { $push: "$$ROOT" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${duplicates.length} sets of duplicate names`);

        for (const duplicate of duplicates) {
            const docs = duplicate.docs;
            console.log(`Processing duplicates for name: ${duplicate._id}`);
            
            // Keep the most recent non-kicked student, remove others
            const sortedDocs = docs.sort((a, b) => {
                // Prioritize non-kicked students
                if (a.isKicked !== b.isKicked) {
                    return a.isKicked ? 1 : -1;
                }
                // Then by most recent joinedAt
                return new Date(b.joinedAt) - new Date(a.joinedAt);
            });

            const keepDoc = sortedDocs[0];
            const removeIds = sortedDocs.slice(1).map(doc => doc._id);

            console.log(`Keeping student ${keepDoc._id}, removing ${removeIds.length} duplicates`);
            
            if (removeIds.length > 0) {
                await Student.deleteMany({ _id: { $in: removeIds } });
            }
        }

        console.log('Cleanup completed successfully');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};

// Run the cleanup
const runCleanup = async () => {
    await connectDB();
    await cleanupDuplicates();
    await mongoose.connection.close();
    console.log('Database connection closed');
};

runCleanup();