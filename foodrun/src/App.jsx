import { useState } from 'react'
import './App.css'
import { FaMicrophone, FaHome, FaUser, FaShoppingCart, FaCommentDots } from 'react-icons/fa';


function MobileNavBarFixedInButtom() {
  return (
    <div className="block md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
      <div className="flex  items-center bg-light-pink py-2 px-2 rounded-lg">
        <FaMicrophone className="text-xl text-medium-red" />
        <p className="m-0 text-xs">Speak to order</p>
      </div>
      <div className="flex flex-col items-center">
        <FaHome className="text-xl text-soft-red" />
        <p className="m-0 text-xs">Home</p>
      </div>
      <div className="flex flex-col items-center">
        <FaUser className="text-xl text-soft-red" />
        <p className="m-0 text-xs">Profile</p>
      </div>
      <div className="relative flex flex-col items-center">
        <FaShoppingCart className="text-xl text-soft-red" />
        <span className="absolute -top-1 right-2 bg-red-500 text-white rounded-full text-[10px] px-1">2</span>
        <p className="m-0 text-xs">Cart</p>
      </div>
      <div className="relative flex flex-col items-center">
        <FaCommentDots className="text-xl text-soft-red" />
        <span className="absolute -top-1 right-2 bg-red-500 text-white rounded-full text-[8px] w-3 h-3 flex items-center justify-center">!</span>
        <p className="m-0 text-xs">Messages</p>
      </div>
    </div>
  );
}

function AudioFrame() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">
        {/* Slow pulsing concentric circles */}
        <div className="absolute inset-0 rounded-full bg-medium-red opacity-30 animate-slow-ping" />
        <div className="absolute inset-2 rounded-full bg-medium-red opacity-20 animate-slow-ping delay-300" />
        <div className="absolute inset-4 rounded-full bg-medium-red opacity-10 animate-slow-ping delay-400" />

        {/* Microphone button */}
       <div className="absolute inset-8 rounded-full bg-medium-red border-4 border-red-400  flex flex-col items-center justify-center shadow-md cursor-pointer">
  <FaMicrophone className="text-2xl text-white" />
  <p className="text-center text-white text-sm mt-1">Click to Speak</p>
</div>

      </div>

      {/* Label */}
    </div>
  );
}
function App() {
 

  return (
    <>
      {/* hello word */}
      <div className="min-h-screen flex flex-col justify-center items-center">
        <AudioFrame />
      </div>
      <MobileNavBarFixedInButtom />
    </>
  )
}

export default App
