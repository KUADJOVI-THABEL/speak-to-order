import React from 'react';
import { useNavigate } from "react-router-dom";

function parsePrice(priceStr) {
    // Remove non-numeric characters except comma and dot, then convert to float
    const normalized = priceStr.replace(/[^\d,\.]/g, '').replace(',', '.');
    return parseFloat(normalized);
}

function OrderOverall({ orders = [], delivery = 10 }) {
    const nav = useNavigate();
    // Calculate subtotal from orders
    const subTotal = orders.reduce((sum, order) => {
        const price = parsePrice(order.product.price);
        return sum + price * order.quantity;
    }, 0);

    // Example discount logic (10 MAD if subtotal > 50, else 0)
    const discount = subTotal > 50 ? 10 : 0;

    const total = subTotal + delivery - discount;

    const OverallData = {
        "sub-Total": subTotal.toFixed(2),
        "Delivery Charge": delivery.toFixed(2),
        "Discount": discount.toFixed(2),
    };


    return (
        <div id="overall" className="w-full px-4 py-4 rounded-xl text-white bg-gray-800 mb-12">
            {Object.entries(OverallData).map(([key, value]) => (
                <div key={key} className="flex justify-between mb-1 text-sm">
                    <span>{key}</span>
                    <span>{value} MAD</span>
                </div>
            ))}
            <div className="flex justify-between mt-2 font-bold text-lg pt-2">
                <span>Total</span>
                <span>{total.toFixed(2)} MAD</span>
            </div>
            <button
                className='w-full bg-white text-medium-red mt-3 py-2'
                onClick={() => nav('/thanks')}
            >
                Place my order
            </button>
        </div>
    );
}

export default OrderOverall;