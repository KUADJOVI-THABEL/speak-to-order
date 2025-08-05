import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'

import { FaMicrophone, FaHome, FaUser, FaShoppingCart, FaCommentDots, FaStop } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js'
import OrderDetails from './OrderDetails'

import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import { SPEAK_STATE_DONESPEAKING, SPEAK_STATE_INITIAL, SPEAK_STATE_SPEAKING, SpeakingStateConts } from './utils/SpeakingState';
import OrderOverall from './OrderOverall'
import MenuList from './MenuList';
import TopMenu from './TopMenu';
import Searching from './Searching';
import PopularMenu from './PopularMenu';
import SpecialOffer from './SpecialOffer';
import SelectGroup from './SelectGroup'
import FoodList from './FoodList'
import NoOrderMessage from "./NoOrderMessage"
import Thanks from './Thanks';
import { SERVER_URL } from "./utils/constants";

import { useNavigate } from "react-router-dom";


// Global variables
let record;
let wavesurfer;


const svgPlayBtn = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM10.6935 15.8458L15.4137 13.059C16.1954 12.5974 16.1954 11.4026 15.4137 10.941L10.6935 8.15419C9.93371 7.70561 9 8.28947 9 9.21316V14.7868C9 15.7105 9.93371 16.2944 10.6935 15.8458Z" fill="#FF4B4B"></path> </g></svg>`
const svgPauseBtn = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM9 9.5C9 8.67157 9.67157 8 10.5 8C11.3284 8 12 8.67157 12 9.5V14.5C12 15.3284 11.3284 16 10.5 16C9.67157 16 9 15.3284 9 14.5V9.5ZM13 9.5C13 8.67157 13.6716 8 14.5 8C15.3284 8 16 8.67157 16 9.5V14.5C16 15.3284 15.3284 16 14.5 16C13.6716 16 13 15.3284 13 14.5V9.5Z" fill="#FF4B4B"></path></g></svg>`;

function MobileNavBarFixedInButtom() {
  const nav = useNavigate();
  // Determine active tab based on location
  const location = window.location.pathname;
  // Default active is "Speak to order" ("/")
  const isHome = location === "/home";
  const isSpeak = !isHome; // "/" or anything else defaults to speak

  return (
    <div className="block md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
      <div
        className={`flex items-center py-2 px-2 rounded-lg cursor-pointer ${isSpeak ? "bg-light-pink" : "border border-light-red "
          }`}
        onClick={() => nav && nav("/")}
      >
        <FaMicrophone className={`text-xl ${isSpeak ? "text-medium-red" : "text-soft-red"}`} />
        <p className="m-0 text-xs">Speak to order</p>
      </div>
      <div
        className={`flex flex-col items-center cursor-pointer ${isHome ? "bg-light-pink rounded-lg py-1 px-1" : ""
          }`}
        onClick={() => nav && nav("/home")}
      >
        <FaHome className={`text-xl ${isHome ? "text-medium-red" : "text-soft-red"}`} />
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


function AudioFrame({ setOrders, isWaitingForAudioResponse, setIsWaitingForAudioResponse }) {
  const [speakState, setSpeakState] = useState(0);
  const wavesurferRef = useRef(null);
  const recordRef = useRef(null);

  // Use refs to ensure we always have the latest state setters
  const speakStateRef = useRef(speakState);
  const setSpeakStateRef = useRef(setSpeakState);

  // Update refs when state changes
  useEffect(() => {
    speakStateRef.current = speakState;
    setSpeakStateRef.current = setSpeakState;
  }, [speakState]);

  const createWaveSurfer = useCallback(() => {
    let scrollingWaveform = true;
    let continuousWaveform = false;

    // Destroy the previous wavesurfer instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const mic_container = document.querySelector('#mic');
    if (!mic_container) return undefined;

    // Create a new Wavesurfer instance
    wavesurferRef.current = WaveSurfer.create({
      container: '#mic',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      height: 76,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
    });

    // Initialize the Record plugin
    recordRef.current = wavesurferRef.current.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform,
        continuousWaveform,
        continuousWaveformDuration: 30,
      }),
    );

    // Render recorded audio
    recordRef.current.on('record-end', (blob) => {
      // Hide the #mic and remove all its children
      const micElement = document.querySelector('#mic');
      if (micElement) {
        micElement.style.display = 'none';
        while (micElement.firstChild) {
          micElement.removeChild(micElement.firstChild);
        }
      }

      const recordingsElement = document.querySelector('#recordings');
      if (recordingsElement) {
        recordingsElement.style.display = 'block';
      }

      const container = recordingsElement;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const recordedUrl = URL.createObjectURL(blob);

      // Create wavesurfer from the recorded audio
      const wavesurfer = WaveSurfer.create({
        container,
        barGap: 2,
        height: 76,
        barWidth: 2,
        cursorWidth: 0,
        waveColor: 'rgb(200, 100, 0)',
        progressColor: 'rgb(100, 50, 0)',
        url: recordedUrl,
      });

      // Create a frame div to hold controls
      const frame = container.appendChild(document.createElement('div'));
      frame.className = 'flex items-center space-x-2 mt-2 justify-center';

      // Play/Pause button with icon (ghost style)
      const playBtn = document.createElement('button');
      playBtn.className = 'p-2 flex items-center border rounded bg-white shadow text-gray-700 border-gray-300 hover:border-light-red';
      playBtn.innerHTML = svgPlayBtn;
      playBtn.onclick = () => wavesurfer.playPause();

      wavesurfer.on('pause', () => {
        playBtn.innerHTML = svgPlayBtn;
      });

      wavesurfer.on('play', () => {
        playBtn.innerHTML = svgPauseBtn;
      });

      // Delete button with icon
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'p-2 flex items-center text-bright-red bg-white shadow rounded';
      deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;

      // FIX: Use the ref to get the current setSpeakState function
      deleteBtn.onclick = (e) => {
        console.log("you are trying to delete");
        if (container) {
          container.style.display = 'none';
        }
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        e.stopPropagation();
        // Use the current setSpeakState function from the ref
        setSpeakStateRef.current(0);
      };

      // Append buttons
      frame.appendChild(deleteBtn);
      frame.appendChild(playBtn);

      // Submit button
      const submitBtn = document.createElement('button');
      submitBtn.className = 'py-2 px-4 w-full md:w-fit rounded flex items-center justify-center bg-bright-red text-white';
      submitBtn.innerText = 'Submit';

      submitBtn.onclick = () => {
        // Clear existing buttons and show loading spinner
        frame.innerHTML = `
          <div class="flex justify-center items-center w-full py-4">
            <svg class="animate-spin h-6 w-6 text-bright-red" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        `;

        // Send audio to server
        const formData = new FormData();
        formData.append('audio_file', blob, 'recording.webm');
        setIsWaitingForAudioResponse(true);

        fetch(`${SERVER_URL}/upload_audio`, {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => {
            console.log('Server response:', data);
            setIsWaitingForAudioResponse(false);
            setOrders(data.products);

            if (recordingsElement && recordingsElement.firstChild) {
              recordingsElement.removeChild(recordingsElement.firstChild);
            }

            // Replace spinner with "Click to continue order" button
            frame.innerHTML = '';
            const continueBtn = document.createElement('button');
            continueBtn.className = 'py-2 px-4 w-full md:w-fit rounded border border-medium-red bg-soft-red text-white font-semibold';
            continueBtn.innerText = 'Click to continue order';
            continueBtn.onclick = () => {
              console.log('Continuing order...');
              setSpeakStateRef.current(0);
              if (container) {
                container.style.display = 'none';
              }
              while (container.firstChild) {
                container.removeChild(container.firstChild);
              }
            };
            frame.appendChild(continueBtn);
          })
          .catch(error => {
            setIsWaitingForAudioResponse(false);
            console.error('Error uploading audio:', error);
            frame.innerHTML = `<p class="text-red-600">Upload failed. Try again.</p>`;
          });
      };

      frame.appendChild(submitBtn);
    });

    return recordRef.current;
  }, [setOrders, setIsWaitingForAudioResponse]);

  useEffect(() => {
    console.log('Effect runs after render');
    console.log("element", document.querySelector('#mic'));
    createWaveSurfer();
  }, [createWaveSurfer]);

  function handleAudioFrameIsClicked() {
    console.log("record", recordRef.current);
    console.log("state", speakState);

    if (SpeakingStateConts[speakState] === SPEAK_STATE_INITIAL) {
      const micElement = document.querySelector('#mic');
      if (micElement) {
        micElement.style.display = 'block';
      }
      const recordingsElement = document.querySelector('#recordings');
      if (recordingsElement) {
        recordingsElement.style.display = 'none';
      }

      recordRef.current.startRecording().then(() => {
        // Recording started
      });
    }

    if (SpeakingStateConts[speakState] === SPEAK_STATE_SPEAKING) {
      recordRef.current.stopRecording();
    }

    if (SpeakingStateConts[speakState] === SPEAK_STATE_DONESPEAKING) {
      if (isWaitingForAudioResponse) return;
      setIsWaitingForAudioResponse(false);
    }

    setSpeakState((speakState + 1) % 3);
  }

  return (
    <div className="flex flex-col items-center mt-24" onClick={handleAudioFrameIsClicked}>
      <div className="relative w-48 h-48">
        {/* Slow pulsing concentric circles */}
        {SpeakingStateConts[speakState] === SPEAK_STATE_INITIAL && (
          <>
            <div className="absolute inset-0 rounded-full bg-medium-red opacity-30 animate-slow-ping" />
            <div className="absolute inset-2 rounded-full bg-medium-red opacity-20 animate-slow-ping delay-300" />
            <div className="absolute inset-4 rounded-full bg-medium-red opacity-10 animate-slow-ping delay-400" />
          </>
        )}

        {/* Microphone button */}
        <div className="absolute inset-8 rounded-full bg-medium-red border-4 border-red-400 flex flex-col items-center justify-center shadow-md cursor-pointer">
          <FaMicrophone className="text-2xl text-white" />
          <p className="text-center text-white text-sm mt-1">
            {SpeakingStateConts[speakState] === SPEAK_STATE_INITIAL
              ? "Click to Speak"
              : SpeakingStateConts[speakState] === SPEAK_STATE_SPEAKING
                ? "You're speaking"
                : "You can submit your order"
            }
          </p>
        </div>
      </div>

      <div id="mic" className='w-full md:mx-4'>

      </div>
      <div id="recordings" className='w-full md:w-fit'></div>

      {/* <p>
       
        What we hear: {speakState}
      </p> */}

      {SpeakingStateConts[speakState] === SPEAK_STATE_SPEAKING && (
        <button className="bg-bright-red hover:bg-red-900 text-white font-bold py-2 px-4 w-full md:w-fit mx-2">
          Stop
        </button>
      )}
    </div>
  );
}

function SpeakBtn({isSpeak}){
const nav = useNavigate();
  return (
     <div className='hidden md:col-span-1 md:block'>
                  <div
                    className={`flex items-center py-2 px-2 rounded-lg cursor-pointer mx-2 gap-2 ${isSpeak ? "bg-light-pink" : "border border-light-red "
                      }`}
                    onClick={() => nav && nav("/")}
                  >
                    <FaMicrophone className={`text-xl ${isSpeak ? "text-medium-red" : "text-soft-red"}`} />
                    <p className="m-0 text-xs">Speak to order</p>
                  </div>
                </div>
  )
}

function App() {
  const [selected, setSelected] = useState(0);
  const [orders, setOrders] = useState([]);
  const [isWaitingForAudioResponse, setIsWaitingForAudioResponse] = useState(true);
  const location = window.location.pathname;
  const isSpeak = location === "/";

  

  return (
    <BrowserRouter>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <TopMenu />
              <div className='grid md:grid-cols-3 lg:grid-cols-[300px_1fr_4fr] lg:gap-x-12 lg:gap-y-4 md:mx-8'>
                {/* col 1 */}
                <div className='hidden md:col-span-1 md:block'>
                  <div
                    className={`flex items-center py-2 px-2 rounded-lg cursor-pointer mx-2 gap-2 ${isSpeak ? "bg-light-pink" : "border border-light-red "
                      }`}
                    onClick={() => nav && nav("/")}
                  >
                    <FaMicrophone className={`text-xl ${isSpeak ? "text-medium-red" : "text-soft-red"}`} />
                    <p className="m-0 text-xs">Speak to order</p>
                  </div>
                </div>

                {/* col 2 to 3 */}

                <div className='md:col-span-2 '>
                  <Searching />
                </div>

                <div className='md:col-span-1'>
                  <SpecialOffer />
                  <div className='hidden md:block'>
                    <SelectGroup />
                  </div>

                </div>
                <div className='md:col-span-2'>
                  {/* Menu - responsive positioning */}
                  <div className='md:col-span-2'>
                    <MenuList selected={selected} setSelected={setSelected} />
                  </div>

                  {/* Main content grid */}
                  <div className='md:grid md:grid-cols-5 md:col-span-2'>
                    {/* Audio Section */}
                    <div className='md:col-span-3 mx-2 mt-4 mb-4 md:mb-0 border border-red-500 pb-4 rounded-xl flex flex-col justify-center items-center md:block'>
                      <AudioFrame
                        setOrders={setOrders}
                        isWaitingForAudioResponse={isWaitingForAudioResponse}
                        setIsWaitingForAudioResponse={setIsWaitingForAudioResponse}
                      />
                    </div>

                    {/* Orders Section */}
                    <div className='md:col-span-2 mb-8 md:mb-0'>
                      {orders && orders.length !== 0 ? (
                        <div className="bg-small-gray mx-0">
                          <div className="mx-2">
                            <OrderDetails setOrders={setOrders} orders={orders} />
                            <OrderOverall orders={orders} />
                          </div>
                        </div>
                      ) : (
                        <NoOrderMessage />
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </>
          }
        />
        <Route
          path="/home"
          element={
            <>
              <TopMenu />
              <div className='grid md:grid-cols-3 lg:grid-cols-[300px_1fr_4fr] lg:gap-x-20  lg:gap-y-4 md:mx-8'>
                {/* col 1 */}
                <SpeakBtn isSpeak={isSpeak}/>
                {/* col 2 to 3 */}

                <div className='md:col-span-2 '>
                  <Searching />
                </div>

                <div className='md:col-span-1'>
                  <SpecialOffer />
                  <div className='hidden md:block'>
                    <SelectGroup />
                  </div>

                </div>

                <div className='hidden md:col-span-2 md:block'>
                  <MenuList selected={selected} setSelected={setSelected} />
                  <div>
                    <FoodList selected={selected} />
                  </div>
                  <div>
                    <PopularMenu />
                  </div>
                </div>

                {/* No AudioFrame, OrderDetails, or OrderOverall */}
                <div className='md:hidden'>
                  <MenuList selected={selected} setSelected={setSelected} />
                </div>
                <FoodList selected={selected} hidden='md:hidden' />
                <div className='md:hidden'>
                  <PopularMenu />
                </div>

              </div>


            </>
          }
        />
        <Route
          path="/thanks"
          element={
            <>
              <Thanks />

            </>
          }
        />
      </Routes>
      <MobileNavBarFixedInButtom />
    </BrowserRouter>
  )
}

export default App
