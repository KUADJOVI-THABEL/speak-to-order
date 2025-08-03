import React, { useState } from "react";
import { FaCheck, FaStar, FaEdit, FaHome, FaPaperPlane } from "react-icons/fa";
import { SERVER_URL } from "./utils/constants";

const circleStyles = [
    { top: "10", left: "16", size: "w-5 h-5", color: "bg-red-400" },
    { top: "28", left: "32", size: "w-3 h-3", color: "bg-yellow-400" },
    { top: "24", left: "10", size: "w-2.5 h-2.5", color: "bg-blue-400" },
    { top: "16", left: "28", size: "w-3.5 h-3.5", color: "bg-green-400" },
];

export default function Thanks() {
    const [rating, setRating] = useState(2);
    const [hovered, setHovered] = useState(null);
    const [comment, setComment] = useState("");
    const [blinkStar, setBlinkStar] = useState(null);
    const [error, setError] = useState("");

    const handleStarClick = (idx) => {
        setRating(idx + 1);
        setBlinkStar(idx);
        setTimeout(() => setBlinkStar(null), 300);
    };

    async function sendSubmitDetails() {
        try {
            // Get sender IP address
            const ipRes = await fetch("https://api.ipify.org?format=json");
            const ipData = await ipRes.json();
            const senderIp = ipData.ip;

            const response = await fetch(`${SERVER_URL}/submit_feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ip: senderIp,
                    rating,
                    comment,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to submit feedback");
            }
            // Optionally handle success (e.g., show a message or redirect)
        } catch (err) {
            setError("Failed to submit feedback. Please try again.");
        }
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError("Please leave feedback before submitting.");
            return;
        }
        setError("");
        
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6"
            
            id="thanks"
        >
            <div className="relative mb-8">
                {/* Main Check Icon Circle */}
                <div className="w-18 h-18 p-2 rounded-full bg-red-500 flex items-center justify-center shadow-lg relative z-20">
                    <FaCheck color="#fff" size={32} />
                </div>
                {/* Decorative Circles */}
                {circleStyles.map((c, i) => (
                    <div
                        key={i}
                        className={`absolute z-10 opacity-80 ${c.size} ${c.color}`}
                        style={{
                            top: `${c.top}px`,
                            left: `${c.left}px`,
                            borderRadius: "9999px",
                        }}
                    />
                ))}
            </div>
            <div className="text-center mb-4">
                <h2 className="font-bold text-2xl md:text-3xl m-0">Thank You!</h2>
                <div className="text-lg text-red-500 font-semibold">Order Completed</div>
            </div>
            <div className="text-gray-500 text-base mb-4">
                Please rate your last Driver
            </div>
            {/* Rating Stars */}
            <div className="flex gap-2 mb-6">
                {[...Array(5)].map((_, idx) => (
                    <FaStar
                        key={idx}
                        size={28}
                        color={idx < rating ? "#FBBF24" : "#D1D5DB"}
                        className={`
                            cursor-pointer transition-transform
                            ${blinkStar === idx ? "scale-125 brightness-125" : ""}
                            ${hovered === idx ? "scale-110" : ""}
                        `}
                        style={{
                            transform:
                                blinkStar === idx
                                    ? "scale(1.25)"
                                    : hovered === idx
                                    ? "scale(1.1)"
                                    : "scale(1)",
                            filter: blinkStar === idx ? "brightness(1.5)" : "none",
                        }}
                        onMouseEnter={() => setHovered(idx)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => handleStarClick(idx)}
                    />
                ))}
            </div>
            {/* Comment Input */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xs flex flex-col items-center"
                autoComplete="off"
            >
                <div
                    className={`flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full mb-3 border transition
                        ${error ? "border-red-500" : "border-transparent"}
                    `}
                >
                    <FaEdit  size={20} className="mr-2 text-soft-red" />
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value);
                            setError("");
                        }}
                        placeholder="Leave feedback"
                        className="border-none outline-none bg-transparent text-base flex-1 text-gray-900"
                    />
                </div>
                {error && (
                    <div className="text-red-500 text-sm mb-2">{error}</div>
                )}
                <div className="flex gap-3 w-full mt-2">
                    <button
                        type="submit"
                        className="flex-1 bg-red-500 text-white rounded-md py-2 font-semibold text-base flex items-center justify-center gap-2"
                         onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        <FaPaperPlane />
                        Submit
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-gray-100 text-red-500 rounded-md py-2 font-semibold text-base flex items-center justify-center gap-2"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        <FaHome />
                        Home
                    </button>
                </div>
            </form>
        </div>
    );
}
