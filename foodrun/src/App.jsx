import React, { useEffect, useRef, useState } from 'react';

import './App.css'

import { FaMicrophone, FaHome, FaUser, FaShoppingCart, FaCommentDots, FaStop } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js'
import OrderDetails from './OrderDetails'

import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import { SPEAK_STATE_DONESPEAKING, SPEAK_STATE_INITIAL, SPEAK_STATE_SPEAKING, SpeakingStateConts } from './utils/SpeakingState';
import OrderOverall from './OrderOverall'
import MenuList from './MenuList';
import TopMenu from './TopMenu';

const SERVER_URL = "http://localhost:5000"
// Global variables
let record;
let wavesurfer;


const svgPlayBtn = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM10.6935 15.8458L15.4137 13.059C16.1954 12.5974 16.1954 11.4026 15.4137 10.941L10.6935 8.15419C9.93371 7.70561 9 8.28947 9 9.21316V14.7868C9 15.7105 9.93371 16.2944 10.6935 15.8458Z" fill="#FF4B4B"></path> </g></svg>`
const svgPauseBtn = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM9 9.5C9 8.67157 9.67157 8 10.5 8C11.3284 8 12 8.67157 12 9.5V14.5C12 15.3284 11.3284 16 10.5 16C9.67157 16 9 15.3284 9 14.5V9.5ZM13 9.5C13 8.67157 13.6716 8 14.5 8C15.3284 8 16 8.67157 16 9.5V14.5C16 15.3284 15.3284 16 14.5 16C13.6716 16 13 15.3284 13 14.5V9.5Z" fill="#FF4B4B"></path></g></svg>`;

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


const createWaveSurfer = ({ setSpeakState }) => {

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

    // Create a frame div to hold controls
    const frame = container.appendChild(document.createElement('div'))
    frame.className = 'flex items-center space-x-2 mt-2 justify-center'

    // Play/Pause button with icon (ghost style)
    const playBtn = document.createElement('button')
    playBtn.className = 'p-2 flex items-center border rounded bg-white shadow text-gray-700 border-gray-300 hover:border-light-red'

    // Insert icon (initially play icon)
    playBtn.innerHTML = `
  ${svgPlayBtn}
`

    playBtn.onclick = () => wavesurfer.playPause()

    wavesurfer.on('pause', () => {
      playBtn.innerHTML = `
      ${svgPlayBtn}
  `
    })

    wavesurfer.on('play', () => {
      playBtn.innerHTML = `
     ${svgPauseBtn}
  `
    })

    // Delete button with icon
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'p-2 flex items-center text-bright-red bg-white shadow rounded'
    deleteBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
       viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M6 18L18 6M6 6l12 12" />
  </svg>
`
    deleteBtn.onclick = () => {
      // Your delete logic here
      // container.style.display = 'none'
      setSpeakState(-1) // set to zero
    }

    // Append buttons
    frame.appendChild(deleteBtn)
    frame.appendChild(playBtn)

    // Submit button remains unchanged
    const submitBtn = document.createElement('button')
    submitBtn.className = 'py-2 px-4 w-full rounded  flex items-center justify-center bg-bright-red text-white'
    submitBtn.innerText = `Submit`
    submitBtn.onclick = () => {
      // send the audio to the server at /upload_audio
      const formData = new FormData();
      formData.append('audio_file', blob, 'recording.webm');

      fetch(`${SERVER_URL}/upload_audio`, {
        method: 'POST',
        body: formData,


      })
        .then(response => response.json())
        .then(data => {
          console.log('Server response:', data);
          // Optionally handle server response here
        })
        .catch(error => {
          console.error('Error uploading audio:', error);
        });
      // Search , 
    }
    frame.appendChild(submitBtn)


    // // Download link
    // const link = container.appendChild(document.createElement('a'))
    // Object.assign(link, {
    //   href: recordedUrl,
    //   download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
    //   textContent: 'Download recording',
    // })
  })
  // pauseButton.style.display = 'none'
  // recButton.textContent = 'Record'



  return record

}


function AudioFrame() {
  // needs to initiate state of speakings
  const [speakState, setSpeakState] = useState(0);

  useEffect(() => {
    console.log('Effect runs after render');
    console.log("element", document.querySelector('#mic'));
    record = createWaveSurfer({ setSpeakState });
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
      <TopMenu/>
        <MenuList/>
      <div className="min-h-screen flex flex-col justify-center items-center">
      
        <AudioFrame />
      </div>
      <div className='bg-small-gray mx-0'>
        <div className='mx-2'>
           <OrderDetails />
        <OrderOverall/>
        </div>
        
      </div>

      <MobileNavBarFixedInButtom />
    </>
  )
}

export default App
