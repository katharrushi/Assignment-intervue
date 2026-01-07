import React from "react";
import ChatSidebar from "./ChatSidebar";

const PollHistory = ({ history }) => {
    return (
        <>
            <ChatSidebar />
            <div className="max-w-6xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6 text-center">
                    View <span className="text-primary">Poll History</span>
                </h2>
                {history.map(({ _id, question, options, createdAt }, index) => {
                    const totalVotes = options.reduce((acc, opt) => acc + opt.count, 0);

                    return (
                        <div
                            key={_id}
                            className="mb-8 border border-gray-300 rounded-lg shadow-md p-4"
                        >
                            <h3 className="font-semibold mb-2">Question {index + 1}</h3>
                            <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-4 py-2 rounded-t-md text-sm">
                                {question}
                            </div>
                            <div className="border border-purple-300 border-t-0 rounded-b-md p-4 space-y-3">
                                {options.map((opt, idx) => (
                                    <div key={opt._id} className="w-full">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-2">
                                                <span className="bg-primary text-white w-6 h-6 rounded-full text-center text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                {opt.text}
                                            </span>
                                            <span className="font-medium">{opt.percentage}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-gray-100 rounded">
                                            <div
                                                className="h-4 bg-purple-500 rounded"
                                                style={{ width: `${opt.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-right text-sm font-medium text-gray-500">
                                    Total Votes: {totalVotes}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default PollHistory;
