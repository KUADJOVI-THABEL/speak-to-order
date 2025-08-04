import React, { useState } from "react";
import { FaCheck } from "react-icons/fa"; // npm install react-icons

const popularFilters = [
    "All categories",
    "Pizza",
    "Burger",
    "Sandwich",
];

const moreFilters = [
    "America",
    "Latina",
    // Add more as needed
    "Senegalese",
    "Morrocco",
    "Asia"
];



function Checkbox({ label, checked, onChange }) {
    return (
        <label className="flex items-center cursor-pointer mb-2">
            <span
                className={`w-5 h-5 flex items-center justify-center border-2 rounded transition-colors duration-150
                    ${checked ? "bg-red-500 text-white border-red-500" : "bg-white border-red-300"}`}
            >
                {checked && <FaCheck className="text-xs" />}
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="hidden"
            />
            <span className="ml-2">{label}</span>
        </label>
    );
}


function SelectGroup() {
    const [selectedPopular, setSelectedPopular] = useState("All categories");
    const [selectedMore, setSelectedMore] = useState(moreFilters[0]);

    return (
        <div className="space-y-6 mx-2">
            {/* Popular Filters */}
            <div>
                <h3 className="font-semibold mb-3">Popular Filters</h3>
                <div className="space-y-2">
                    {popularFilters.map((item) => (
                        <Checkbox
                            key={item}
                            label={item}
                            checked={selectedPopular === item}
                            onChange={() => setSelectedPopular(item)}
                        />
                    ))}
                </div>
            </div>

            {/* More Filters */}

              <div>
                <h3 className="font-semibold mb-3">More Filters</h3>
                <div className="space-y-2">
                    {moreFilters.map((item) => (
                        <Checkbox
                            key={item}
                            label={item}
                            checked={selectedPopular === item}
                            onChange={() => setSelectedPopular(item)}
                        />
                    ))}
                </div>
            </div>

           
        </div>
    );
}

export default SelectGroup;