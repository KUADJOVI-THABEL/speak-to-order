import React from "react";

const SpecialOffer = () => {
  return (
    <div className="relative flex rounded-lg mx-2 pl-2 bg-medium-red mb-4 h-40 md:h-52 overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-r from-transparent to-white opacity-20 pointer-events-none z-10" />

      {/* Left Column (Text) */}
      <div className="w-1/3 flex flex-col justify-center gap-2 pr-2 z-20">
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
      <div className="w-2/3 flex items-center justify-center z-20">
        <img
          src="/src/assets/images/special_offer.png"
          alt="Special Offer"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default SpecialOffer;
