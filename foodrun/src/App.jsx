import React, { useEffect, useRef, useState } from 'react';

import './App.css'
import { FaMicrophone, FaHome, FaUser, FaShoppingCart, FaCommentDots, FaStop } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import { SPEAK_STATE_DONESPEAKING, SPEAK_STATE_INITIAL, SPEAK_STATE_SPEAKING, SpeakingStateConts } from './utils/SpeakingState';


// Global variables
let record;
let wavesurfer;



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


const createWaveSurfer = () => {

  let scrollingWaveform = true
  let continuousWaveform = false
  console.log("recors", document.querySelector('#root'))
  // Destroy the previous wavesurfer instance
  if (wavesurfer) {
    wavesurfer.destroy()
  }

  // Create a new Wavesurfer instance
  wavesurfer = WaveSurfer.create({
    container: '#mic',
    cursorWidth: 0,
    barWidth: 2,
    barGap: 2,
    height: 76,
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
  })

  // Initialize the Record plugin
  record = wavesurfer.registerPlugin(
    RecordPlugin.create({
      renderRecordedAudio: false,
      scrollingWaveform,
      continuousWaveform,
      continuousWaveformDuration: 30, // optional
    }),
  )

  // Render recorded audio
  record.on('record-end', (blob) => {
    // Hide the #mic then
    const micElement = document.querySelector('#mic');
    if (micElement) {
      micElement.style.display = 'none';
    }
    const recordingsElement = document.querySelector('#recordings');
    if (recordingsElement) {
      recordingsElement.style.display = 'block';
    }
    const container = recordingsElement;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    const recordedUrl = URL.createObjectURL(blob)

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
    })

    // Play/Pause button with icon
    const playBtn = container.appendChild(document.createElement('button'))
    playBtn.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center'
    button.onclick = () => wavesurfer.playPause()
    wavesurfer.on('pause', () => (button.textContent = 'Play'))
    wavesurfer.on('play', () => (button.textContent = 'Pause'))

    // Download link
    const link = container.appendChild(document.createElement('a'))
    Object.assign(link, {
      href: recordedUrl,
      download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
      textContent: 'Download recording',
    })
  })
  // pauseButton.style.display = 'none'
  // recButton.textContent = 'Record'

  record.on('record-progress', (time) => {

  })

  return record

}


function AudioFrame() {
  // needs to initiate state of speakings
  const [speakState, setSpeakState] = useState(0);

  useEffect(() => {
    console.log('Effect runs after render');
    console.log("element", document.querySelector('#mic'));
    record = createWaveSurfer();
  }, []);

  function handleAudioFrameIsClicked() {
    // TODO: When deleting making the state to zero
    // After sending make the state to zero as well
    // But when already in state done , do not do any thing when click
    // You can tell the user to send his order
    console.log("record", record)
    console.log("state", speakState)
    // here when click ?
    //  TODO:when AI is responding you can not cicke too 
    if (SpeakingStateConts[speakState] === SPEAK_STATE_INITIAL) {
      const micElement = document.querySelector('#mic');
      if (micElement) {
        micElement.style.display = 'block';
      }
      const recordingsElement = document.querySelector('#recordings');
      if (recordingsElement) {
        recordingsElement.style.display = 'none';
      }
      // Starts the recording process 
      record.startRecording().then(() => {
        // recButton.textContent = 'Stop '+deviceId;
        // recButton.disabled = false
        // pauseButton.style.display = 'inline'
      })
    }

    if (SpeakingStateConts[speakState] === SPEAK_STATE_SPEAKING) {

      // then should en records
      record.stopRecording()
    }
    if (SpeakingStateConts[speakState] === SPEAK_STATE_DONESPEAKING) {

      return;
      // alors 
    }
    setSpeakState((speakState + 1) % 3)

  }
  // AKA :  record initili
  return (

    <div className="flex flex-col items-center justify-center" onClick={handleAudioFrameIsClicked}>
      <div className="relative w-48 h-48">
        {/* Slow pulsing concentric circles */}
        {
          SpeakingStateConts[speakState] === SPEAK_STATE_INITIAL &&

          (
            <>

              <div className="absolute inset-0 rounded-full bg-medium-red opacity-30 animate-slow-ping" />
              <div className="absolute inset-2 rounded-full bg-medium-red opacity-20 animate-slow-ping delay-300" />
              <div className="absolute inset-4 rounded-full bg-medium-red opacity-10 animate-slow-ping delay-400" />

            </>
          )
        }
        {/* Microphone button */}
        <div className="absolute inset-8 rounded-full bg-medium-red border-4 border-red-400  flex flex-col items-center justify-center shadow-md cursor-pointer">
          <FaMicrophone className="text-2xl text-white" />
          <p className="text-center text-white text-sm mt-1">
            {
              SpeakingStateConts[speakState] === SPEAK_STATE_INITIAL ? "Click to Speak" : SpeakingStateConts[speakState] === SPEAK_STATE_SPEAKING ? "You're speaking" : "You can submit your order"
            }
          </p>
        </div>

      </div>


      <div id="mic" className='w-full'>

      </div>




      <div id="recordings" className='w-full'>

      </div>


      {
        SpeakingStateConts[speakState] === SPEAK_STATE_SPEAKING &&
        <button className="bg-bright-red  hover:bg-red-900 text-white font-bold py-2 px-4 w-full  mx-2">
          Stop
        </button>
      }
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
