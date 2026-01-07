import React from "react";

const KickedOut = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center px-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white mb-2 inline-block">
                ✦ Intervue Poll
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-2">
                You’ve been Kicked out !
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-md">
                Looks like the teacher had removed you from the poll system. Please try again sometime.
            </p>
        </div>
    );
};

export default KickedOut;
