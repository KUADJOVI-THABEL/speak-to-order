import React from "react";
import { ellipsisProductName } from './utils/functions';


const FoodCard = ({
  image = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80",
  name = "Classic Burger",
  description = "Juicy beef patty, cheddar cheese, lettuce, tomato, and our special sauce.",
  randomNote = "4.5",
  price = "$8.99",
}) =>{
    // Generate a random note between 1 and 5 (one decimal place)
    randomNote = (Math.random() * 4 + 3).toFixed(1);

    return (
        <div className="bg-white rounded-xl shadow-md p-2  flex flex-col gap-2">
            {/* Top row: Star and note */}
            <div className="flex items-center gap-1.5">
                <svg width="18" height="18" fill="#FFD700" viewBox="0 0 24 24">
                    <path d="M12 17.3l6.18 3.73-1.64-7.03L21.5 9.24l-7.19-.61L12 2 9.69 8.63 2.5 9.24l5.96 4.76-1.64 7.03z" />
                </svg>
                <span className="text-base font-medium text-gray-800">{randomNote}</span>
            </div>

            {/* Food image */}
            <img
                src={image}
                alt={name}
                className=" h-32 object-cover rounded-xl"
            />

            {/* Food name */}
            <div className="text-base font-bold text-gray-900">{ellipsisProductName(name)}</div>

            {/* Description */}
            <div className="text-base text-gray-600 ">{ellipsisProductName(description)}</div>

            {/* Bottom row: Price and add button */}
            <div className="flex items-center justify-between mt-2">
                <span className="text-red-600 font-bold text-base">{price}</span>
                <button
                    className="bg-red-600 text-white rounded-full w-[15px] h-[15px] flex items-center justify-center text-base shadow-md hover:bg-red-700 transition"
                    aria-label="Add"
                >
                    +
                </button>
            </div>
        </div>
    )} ;

export default FoodCard;
