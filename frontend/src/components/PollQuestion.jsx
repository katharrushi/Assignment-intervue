import React from "react";

const PollQuestion = ({
    question,
    selectedOption,
    setSelectedOption,
    handleSubmit,
    timer,
    submitted,
    result,
}) => {
    const timeLimit = question?.timeLimit || 60;
    const timePercentage = (timer / timeLimit) * 100;


    return (
        <div className="m-auto max-w-6xl w-full bg-white px-4">
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-black">Question</h2>
                    <span className="text-sm font-semibold text-red-500">
                        ⏱ {timer < 10 ? `0${timer}` : timer}
                    </span>
                </div>

                {/* Question Box */}
                <div className="rounded-t-md bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 font-medium">
                    {question.text}
                </div>

                {/* Options */}
                <div className="border border-purple-300 border-t-0 rounded-b-md p-4 space-y-3">
                    {question.options.map((opt, index) => {
                        const isSelected = selectedOption === opt._id;
                        const votes = result?.answers?.[opt._id] || 0;

                        const totalVotes = Object.values(result?.answers || {}).reduce(
                            (acc, count) => acc + count,
                            0
                        );

                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                        return (
                            <label
                                key={opt._id}
                                className={`flex items-center justify-between px-4 py-2 rounded-md transition-all text-left relative
                ${submitted
                                        ? "bg-gray-100"
                                        : isSelected
                                            ? "border-2 border-purple-500 bg-purple-50"
                                            : "hover:bg-gray-50 border"
                                    }`}
                            >
                                <div className="flex items-center space-x-3 z-10">
                                    <span
                                        className={`w-6 h-6 flex items-center justify-center text-sm rounded-full border font-bold
                        ${submitted ? "bg-primary text-white" : "border-gray-400 text-gray-700"}`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-black">{opt.text}</span>
                                </div>

                                {submitted && (
                                    <div
                                        className="absolute top-0 left-0 h-full rounded-md bg-primary opacity-20 z-0"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                )}

                                {submitted && (
                                    <span className="z-10 font-semibold text-sm text-black">{percentage}%</span>
                                )}

                                <input
                                    type="radio"
                                    name="poll"
                                    value={opt._id}
                                    checked={isSelected}
                                    onChange={() => setSelectedOption(opt._id)}
                                    className="hidden"
                                />
                            </label>
                        );
                    })}

                </div>

                {/* Submit Button */}
                {!submitted && (
                    <div className="flex justify-center mt-5">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className="bg-primary text-white font-medium px-6 py-2 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                )}

                {/* After Submit Message */}
                {submitted && (
                    <p className="text-center mt-6 font-medium text-primary text-lg">
                        Wait for the teacher to ask a new question...
                    </p>
                )}
            </div>
        </div>
    );
};

export default PollQuestion;
