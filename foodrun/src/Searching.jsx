import React from "react";
import { FiSearch } from "react-icons/fi";

const Searching = () => {
    return (
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 bg-white-pink mb-4 mx-2">
            <FiSearch className="text-black mr-2" size={20} />
           <input
    type="text"
    placeholder="Search"
    className="bg-transparent outline-none text-black text-base flex-1 placeholder-black"
/>

        </div>
    );
};

export default Searching;
