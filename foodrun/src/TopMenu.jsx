import React from "react";
import { MdLocationOn } from "react-icons/md";

const TopMenu = () => {
    return (
        <div className="relative ">
            {/* Background rectangle */}
            <div
                className="absolute flex justify-end items-end"
                style={{
                    top: -75,
                    right: 0,
                    borderRadius: 8,
                    width: 90,
                    zIndex: 99
                }}
            >
                {/* You can later apply a pattern background image here */}
                <img src="src/assets/images/pattern.png" alt="" />
            </div>

            {/* Foreground content */}
            <div className="relative flex items-center justify-between py-2 bg-white mb-2 z-10">
                {/* Hamburger */}
                <button className="p-2 rounded-md hover:bg-gray-100">
                    <svg
                        className="w-6 h-6 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Localisation Icon */}
                <div className="flex-1 flex justify-center items-center">
                    <span className="w-7 h-7 text-red-600 flex items-center justify-center">
                        <MdLocationOn className="w-7 h-7 text-medium-red" />
                    </span>
                    <span className="text-sm ml-1">Freedom way, Lekki phase</span>
                </div>

                {/* Profile image */}
                <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                />
            </div>
        </div>
    );
};

export default TopMenu;
