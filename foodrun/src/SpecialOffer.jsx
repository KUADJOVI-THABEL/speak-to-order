import React from "react";

const SpecialOffer = () => {
return (
    <div className="relative flex rounded-lg mx-2 pl-2 bg-medium-red mb-4 h-40 md:h-auto overflow-hidden justify-between md:flex-col md:pb-6">
        {/* Gradient Overlay */}
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-r from-transparent to-white opacity-20 pointer-events-none z-10" />

      {/* Left Column (Text) */}
      <div className="flex flex-col justify-center gap-2 pr-2 z-20 md:hidden">
            <div>
                <h2 className="text-sm md:text-base font-bold text-white leading-snug">
                    Special Offer for August
                </h2>
                <p className="mt-1 text-xs md:text-sm text-white leading-snug">
                    We are here with the best desserts in town.
                </p>
            </div>
            <button className="w-fit px-2 py-1 rounded border border-red-500 bg-white text-red-600 text-xs font-semibold hover:bg-red-50 transition">
                Buy now
            </button>
        </div>

        {/* Right Column (Image) */}
      <div className="flex self-end justify-self-end z-20 md:order-1 md:self-start md:justify-self-start md:w-full">
            <img
                src="/src/assets/images/special_offer.png"
                alt="Special Offer"
                className="w-full h-full object-contain"
            />
        </div>

        {/* Left Column (Text) - hide on small screens, show on md and up */}
        <div className="hidden md:flex flex-col justify-center gap-2 pr-2 z-20 md:order-2 ">
            <div>
                <h2 className="text-sm md:text-lg font-bold text-white leading-snug md:mt-2">
                    Special Offer for August
                </h2>
                <p className="mt-1 text-base md:text-sm text-white leading-snug">
                    We are here with the best desserts in town.
                </p>
            </div>
            <button className="px-2 py-2 rounded border border-red-500 bg-white text-red-600 text-lg font-semibold hover:bg-red-50 transition">
                Buy now
            </button>
        </div>
    </div>
);
};

export default SpecialOffer;
