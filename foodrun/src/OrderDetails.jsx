import React from 'react';
import { ellipsisProductName } from "./utils/functions";

function OrderDetails({ orders, setOrders }) {

    function split_product_name(name) {
        return name.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    const handleQuantityChange = (idx, delta) => {
        setOrders(prev =>
            prev.map((order, i) =>
                i === idx
                    ? { ...order, quantity: Math.max(1, order.quantity + delta) }
                    : order
            )
        );
    };

    const handleDelete = (idx) => {
        setOrders(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div>
            <div className='flex justify-start text-left font-semibold mb-4 mt-4'>
                <p className='text-bold text-2xl'>
                    Order details
                </p>
            </div>
            <div id='orders' className='mt-2'>
                {orders.map((order, idx) => {
                    const priceNumber = parseFloat(
                        String(order.product.price).replace(/[^\d.,]/g, '').replace(',', '.')
                    ) || 0;

                    return (
                        <div
                            key={idx}
                            className="flex items-center mb-6 border border-gray-200 rounded-lg p-2 justify-between bg-white"
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={order.product.image_url}
                                    alt={order.product.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                                <div className="flex flex-col justify-center">
                                    <p className="font-semibold mb-0.5">{ellipsisProductName(split_product_name(order.product.name))}</p>
                                    <p className="text-gray-500 text-sm mb-0.5">{order.company_name}</p>
                                    <p className="text-bright-red font-medium">
                                        {(priceNumber * order.quantity).toLocaleString(undefined, { style: 'currency', currency: 'MAD' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    className="w-7 h-7 rounded-lg border bg-soft-cool-red text-lg cursor-pointer flex items-center justify-center text-bright-red"
                                    onClick={() => handleQuantityChange(idx, -1)}
                                    disabled={order.quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="min-w-[24px] text-center font-medium">{order.quantity}</span>
                                <button
                                    className="w-7 h-7 rounded-lg border bg-bright-red text-lg cursor-pointer flex items-center justify-center text-white"
                                    onClick={() => handleQuantityChange(idx, 1)}
                                >
                                    +
                                </button>

                                {/* Delete Button */}
                                <button
                                    className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center bg-white text-gray-400 hover:text-red-600 border border-gray-200"
                                    onClick={() => handleDelete(idx)}
                                    title="Remove item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OrderDetails;
