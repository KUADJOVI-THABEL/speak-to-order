import React from 'react';

function OrderOverall() {
    const OverallData = {
        "sub-Total": 100,
        "Delivery Change": 10,
        "Discound": 10,
    };
    const total = OverallData["sub-Total"] + OverallData["Delivery Change"] - OverallData["Discound"];

    return (
        <div id="overall" className="w-full px-4 py-4 rounded-xl text-white bg-gray-800 mb-12">
            {Object.entries(OverallData).map(([key, value]) => (
                <div key={key} className="flex justify-between mb-1 text-sm">
                    <span>{key}</span>
                    <span>{value} MAD</span>
                </div>
            ))}
            <div className="flex justify-between mt-2 font-bold text-lg  pt-2">
                <span>Total</span>
                <span>{total} MAD</span>
            </div>
            <button className='w-full bg-white text-medium-red mt-3 py-2'>
            Place my order
            </button>
        </div>
    );
}

export default OrderOverall;