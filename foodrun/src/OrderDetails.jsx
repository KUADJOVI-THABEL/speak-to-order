import React, { useState } from 'react';

function OrderDetails() {
    function split_product_name(name) {
        return name.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    function ellipsisProductName(name, maxLength = 18) {
        if (!name) return '';
        if (name.length <= maxLength) return name;
        return name.slice(0, maxLength - 3) + '...';
    }

    const [orders, setOrders] = useState([
        {
            product: {
                description: "Extra pepperoni, extra fromage mozzarella",
                id: 12,
                image_url: "https://glovo.dhmedia.io/image/menus-glovo/products/4f3904dad3c1f6fae77069413045fcba41c33ac0510855abb1e0546e015b1304?t=W3siYXV0byI6eyJxIjoibG93In19LHsicmVzaXplIjp7IndpZHRoIjoyNjAsImhlaWdodCI6MjYwfX1d",
                name: "PizzaPepperoni",
                price: "72,00 MAD"
            },
            quantity: 1,
            company_name: "Slice & Stack Eatery"
        },
        {
            product: {
                description: "Thon tam, fromage rouge, luncheon, oignon, pomme de terre, olive verte, sauce piquante, ketchup, mayonnaise",
                id: 174,
                image_url: "https://glovo.dhmedia.io/image/menus-glovo/products/b2c0c26bb08acbd9dfbf32ce3026d425b4ffed45df56859222c1ced2220a6f8f?t=W3siYXV0byI6eyJxIjoibG93In19LHsicmVzaXplIjp7IndpZHRoIjoyNjAsImhlaWdodCI6MjYwfX1d",
                name: "SandwichThonFromageRouge-Lanchon",
                price: "20,00 MAD"
            },
            quantity: 1,
            company_name: "Slice & Stack Eatery"
        }
    ]);

    const handleQuantityChange = (idx, delta) => {
        setOrders(prev =>
            prev.map((order, i) =>
                i === idx
                    ? { ...order, quantity: Math.max(1, order.quantity + delta) }
                    : order
            )
        );
    };

    return (
        <div>
            <div className='flex justify-start text-left font-semibold mb-4 mt-4'>
                <p className='text-bold text-2xl'>
                    Order details
                </p>
            </div>
            <div id='orders' className='mt-2 '>
                {orders.map((order, idx) => (
                    <div
                        key={idx}
                        className="flex items-center mb-6 border border-gray-200 rounded-lg p-2 justify-between bg-white "
                    >
                        <div className="flex-shrink-0 mr-3 w-15 h-15">
                            <img
                                src={order.product.image_url}
                                alt={order.product.name}
                                className="w-12 h-12 object-cover rounded-md"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="font-semibold mb-0.5">{ellipsisProductName(split_product_name(order.product.name))}</p>
                            <p className="text-gray-500 text-sm mb-0.5">{order.company_name}</p>
                            <p className="text-bright-red  font-medium">{order.product.price}</p>
                        </div>
                        <div className="flex items-center ml-3 justify-end">
                            <button
                                className="w-7 h-7 rounded-lg border  bg-soft-cool-red text-lg cursor-pointer mr-1.5 flex items-center justify-center text-bright-red"
                                onClick={() => handleQuantityChange(idx, -1)}
                                disabled={order.quantity <= 1}
                            >
                                -
                            </button>
                            <span className="min-w-[24px] text-center font-medium">{order.quantity}</span>
                            <button
                                className="w-7 h-7 rounded-lg border bg-bright-red text-lg cursor-pointer ml-1.5 flex items-center justify-center  text-white"
                                onClick={() => handleQuantityChange(idx, 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderDetails;