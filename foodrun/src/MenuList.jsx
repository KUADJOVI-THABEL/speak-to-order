import React, { useState } from "react";

const menuItems = [
    { name: "Burger", image: "src/assets/images/burger.png" },
    { name: "Pizza", image: "src/assets/images/pizza.png" },
    { name: "Sandwish", image: "src/assets/images/sandwish.png" }
];

export default function MenuList() {
  const [selected, setSelected] = useState(0);

  return (

    <div className="flex gap-4 ml-2">
       
      {menuItems.map((item, idx) => (
        <button
          key={item.name}
          onClick={() => setSelected(idx)}
          className={`flex items-center justify-center gap-2 px-2 py-1 border rounded-md font-bold transition-colors duration-200 ${
            selected === idx
              ? "bg-medium-red text-white border-bright-red"
              : "bg-transparent text-black border-gray-300"
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-6 h-6"
          
          />
          {item.name}
        </button>
      ))}
    </div>
  );
}
