import React from "react";
import { MdOutlineShoppingBag } from "react-icons/md"; // Optional icon

function NoOrderMessage() {
  return (
    <div className="flex flex-col text-start px-4 text-gray-600">
      <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
      <MdOutlineShoppingBag className="text-6xl text-red-300 mb-4" />
      <p className="max-w-sm">
        You haven’t placed any orders yet. Start speaking to see your orders!
      </p>
    </div>
  );
}

export default NoOrderMessage;
