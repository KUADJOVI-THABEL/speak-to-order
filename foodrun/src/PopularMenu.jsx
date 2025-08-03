import React from "react";

const foodItem = {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    name: "Delicious Pizza",
    description: "Cheesy, hot, and fresh from the oven.",
    price: "$12.99",
};

const FoodCardItem = ({ image, name, description, price }) => (
    <div className="flex items-center bg-white rounded-lg shadow p-1 mb-4">
        <img src={image} alt={name} className="w-20 h-20 rounded-lg object-cover mr-4" />
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <div className="font-semibold text-lg">{name}</div>
                <div className="text-gray-500 text-sm">{description}</div>
            </div>
        </div>
        <div className="text-red-500 font-bold text-lg ml-4">{price}</div>
    </div>
);

const PopularMenu = () => (
    <div className="mx-2 mt-2 mb-16">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold">Popular Menu</span>
            <button className="flex items-center text-blue-600 font-medium hover:underline">
                See all
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
        {/* Food Card Row */}
        <FoodCardItem {...foodItem} />
        
    </div>
);

export default PopularMenu;