// Multimodal movie booking prototype with gesture (MediaPipe Hands) + card expansion

import React, { useEffect, useRef, useCallback, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import '@tensorflow/tfjs-backend-wasm';

import downloadCSV from "./hooks/downloadCSV";

import MovieSelector from './components/MovieSelector';
import TimeSelector from './components/TimeSelector';
import SeatSelector from './components/SeatSelector';

import isHandStable from '../src/hooks/isHandStable';
import computePalmNormal from "./hooks/computePalmNormal";
import normalizeLandmarks from "./hooks/normalizeLandmarks";

import movieNavigation from "./hooks/movieNavigation";
import timeNavigation from "./hooks/timeNavigation";
import seatNavigation from "./hooks/seatNavigation";

import voiceNavigation from './hooks/voiceNavigation';
import VoiceControl from './components/VoiceControl';

import { MODE } from "./constants/modes";

const MOVIES_BASE_PATH = "/movie-images/"

const movies = [
  {
    title: "Lilo and stitch",
    description:
      "Dopo che la Terra è diventata inabitabile a causa della mancanza di ossigeno...",
    director: "Stefon Bristol",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] },
      { day: "Giovedi 16 Giugno", times: ["18:00", "19:00", "21:00"] },
      { day: "Venerdi 16 Giugno", times: ["17:00", "18:00"] },
      { day: "Sabato 16 Giugno", times: ["12:00", "21:00"] }
    ],
    image: `${MOVIES_BASE_PATH}lilo-and-stitch.jpeg`
  },
  {
    title: "ADO SPECIAL LIVE ‘SHINZOU’",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] },
      { day: "Martedi 16 Giugno", times: ["18:00", "19:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["17:00", "18:00"] }
    ],
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/21722/04a47f7c-5973-4d5d-b290-448bcd0d96ba.jpg"
  },
  {
    title: "ALBATROSS",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 26 Luglio", times: ["09:00", "11:00"] },
      { day: "Martedi 25 Luglio", times: ["13:00"] }
    ],
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/22020/b08fda41-dc8f-414b-b0a7-b2326e43ccd7.jpg"
  },
  {
    title: "DRAGON TRAINER",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] }
    ],
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/21622/09bd7169-cc3d-41b4-8218-e7aab32e502e.jpg"
  },
  {
    title: "ELIO",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00", "23:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] }
    ],
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/21789/b3ce7481-c6b6-4b26-8920-6e9b6e25bfb6.jpg"
  },
  {
    title: "F1",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] }
    ],
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/21796/01ed679b-03ac-44ff-9ba8-a6bf2888508a.jpg"
  },
  {
    title: "Happy Holidays",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] }
    ],    
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/22018/a1e32d92-a156-4dde-83d8-97e77c599c02.jpg"
  },
  {
    title: "Jurassic world: rebirth",
    description: "Uno dei live più importanti della nuova scena musicale giapponese...",
    director: "Toshihito Hirose",
    showtimes: [
      { day: "Lunedì 15 Giugno", times: ["18:00", "21:00"] },
      { day: "Martedi 16 Giugno", times: ["23:00"] },
      { day: "Martedi 16 Giugno", times: ["19:00"] }
    ],
    image: "https://cdn.18tickets.net/iris/uploads/film/playbill/21902/6fb1abee-cafd-446a-bbc5-a3c64253e29a.jpg"
  }
];

// Gesture label indices
const LABEL_FIST       = 0;
const LABEL_NEGATION   = 1;
const LABEL_OK         = 2;
const LABEL_OPEN_HAND  = 3;
const LABEL_OTHER      = 4;
const LABEL_LEFT       = 5;
const LABEL_RIGHT      = 6;
const LABEL_DOWN       = 7;
const LABEL_UP         = 8;

const layout0 = [
  [null,  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', null],
  ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
  ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
  ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
  ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
  ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'],
  ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'],
  ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'],
  ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8'],
  [null, null, null, null, 'L1', 'L2', 'L3', 'L4',],
  [null, null, null, null, 'M1', 'M2', 'M3', 'M4',],
  [null, null, null, null, 'DD1', 'DD2', 'DD3', 'DD4'],
];

const layout1 = [
  ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8'],
  ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8'],
  ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8'],
  ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'],
  [null, 'P2', 'P3', 'P4', 'P5', 'P6', null, null]
];

export default function App() {

  // already occupied seats
  const initialOccupied = ['F3', 'F4', 'H4', 'H5', 'I4'];
  // selected seats from user
  const [selectedSeats, setSelectedSeats] = useState([]);
  const selectedSeatsRef = useRef(selectedSeats);

  useEffect(() => { selectedSeatsRef.current = selectedSeats; }, [selectedSeats]);

  // handler for seats
  const handleSeatSelection = ({ row, col, seat }) => {
    // non consentire selezione se occupato all'origine
    if (initialOccupied.includes(seat)) return;
    // toggle sui posti selezionati
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const lastConfirmedGesture = useRef(null);
  
  const [mode, setMode] = useState(MODE.MOVIE);
  const modeRef = useRef(mode);
  
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [model, setModel] = useState(null);

  const lastActionRef = useRef(0);         // timestamp dell’ultima action
  const ACTION_DELAY   = 350; // ms fra uno swipe e l'altro

  const {
    selectedIndex,
    moveMovieUp,
    moveMovieDown,
    setSelectedIndex: setMovieIndex
  } = movieNavigation(movies.length, lastActionRef, 0, ACTION_DELAY);

  const selectedIndexRef = useRef(selectedIndex);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const currentLayout = selectedIndexRef.current === 0 || selectedIndexRef.current === null ? layout0 : layout1;

  const buttonRow = currentLayout.length;

  const buttonRowRef = useRef(buttonRow);
  useEffect(() => {
    buttonRowRef.current = buttonRow;
  }, [buttonRow]);

  const backColIndex    = 3;
  const confirmColIndex = 4;

  const {
    seatPos,
    seatPosRef,
    moveSeatUp,
    moveSeatDown,
    moveSeatLeft,
    moveSeatRight,
    setSeatPos,
    selectSeat,
    deselectSeat,
  } = seatNavigation(currentLayout, initialOccupied, selectedSeats, setSelectedSeats, lastActionRef, ACTION_DELAY);

  useEffect(() => {
     // ad ogni nuovo film ripulisco selezioni e focus
    setSeatPos({ row: null, col: null });
    setSelectedSeats([]);
  }, [selectedIndex]);

  const maxCols = Math.max(
    ...movies[selectedIndex].showtimes.map(show => show.times.length)
  ) - 1;

const getMaxRow = () => movies[selectedIndex].showtimes.length;
const getMaxCol = row =>
  row === movies[selectedIndex].showtimes.length
    ? 0
    : movies[selectedIndex].showtimes[row].times.length - 1;

  const {
    timePos,
    timePosRef,
    moveTimeUp,
    moveTimeDown,
    moveTimeLeft,
    moveTimeRight,
    setTimePos
  } = timeNavigation(getMaxRow, getMaxCol, lastActionRef, ACTION_DELAY);

  useEffect(() => {
    // ogni volta che cambio film, riporto la selezione oraria allo stato “iniziale”
    setTimePos({ row: null, col: null });
  }, [selectedIndex, setTimePos]);

  const HANDNESS_SCORE_THRESH = 0.8

  const GESTURE_WINDOW = 5;
  const gestureBuf = useRef([]);   // ci metti dentro solo LABEL_UP o LABEL_DOWN (o null)

  const [day, setDay] = useState(null);
  const [hour, setHour] = useState(null);

  const dayRef = useRef(null)
  const hourRef = useRef(null)

  // speak synthesis
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  const {
    transcript,
    listening,
    voiceMode,
    resetTranscript,
    resetVoiceMode,
    browserSupportsSpeechRecognition,
    voiceLog
  } = voiceNavigation({
    modeRef,
    movies,
    setMovieIndex,
    speak
  });
  
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {dayRef.current = day;}, [day])
  useEffect(() => {hourRef.current = hour;}, [hour])

  const [gestureMode, setGestureMode] = useState(false);

    // 1) Creo il ref che conterrà sempre gli handler aggiornati
  const handlersRef = useRef({
    moveMovieUp: () => {},
    moveMovieDown: () => {},
    moveTimeUp: () => {},
    moveTimeDown: () => {},
    moveTimeLeft: () => {},
    moveTimeRight: () => {},
    moveSeatUp: () => {},
    moveSeatDown: () => {},
    moveSeatLeft: () => {},
    moveSeatRight: () => {},
    selectSeat: () => {},
    deselectSeat: () => {}
  });

  // 2) Ogni volta che uno di questi handler cambia, aggiorno handlersRef.current
  useEffect(() => {
    handlersRef.current = {
      moveMovieUp,
      moveMovieDown,
      moveTimeUp,
      moveTimeDown,
      moveTimeLeft,
      moveTimeRight,
      moveSeatUp,
      moveSeatDown,
      moveSeatLeft,
      moveSeatRight,
      selectSeat,
      deselectSeat
    };
  }, [
    moveMovieUp,
    moveMovieDown,
    moveTimeUp,
    moveTimeDown,
    moveTimeLeft,
    moveTimeRight,
    moveSeatUp,
    moveSeatDown,
    moveSeatLeft,
    moveSeatRight,
    selectSeat,
    deselectSeat
  ]);

  const handleWheel = (e) => {
    //e.preventDefault();

    if(gestureMode) return;

    // Y del cursore nella viewport
    const mouseY = e.clientY;
    // prendi tutte le card renderizzate
    const cards = containerRef.current.querySelectorAll('.movie-card');
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      // se il puntatore è dentro il bounding di questa card...
      if (mouseY >= rect.top && mouseY <= rect.bottom) {
        setMovieIndex(i)
        break;
      }
    }
  };

  /*

  for dataset creation

  const landmarkNames = [
    "wrist",
    "thumb_cmc", "thumb_mcp", "thumb_ip", "thumb_tip",
    "index_mcp", "index_pip", "index_dip", "index_tip",
    "middle_mcp", "middle_pip", "middle_dip", "middle_tip",
    "ring_mcp", "ring_pip", "ring_dip", "ring_tip",
    "pinky_mcp", "pinky_pip", "pinky_dip", "pinky_tip"
  ];

  const header = [
    "label",
    "handedness",
    "handedness_score",
    "palm_nx",  // normale rotazione X
    "palm_ny",  // normale rotazione Y
    "palm_nz",  // normale rotazione Z
    ...landmarkNames.flatMap(name => [`${name}_x`, `${name}_y`, `${name}_z`])
  ];
  */

  // load model
  useEffect(() => {
    (async () => {
      await tf.setBackend('wasm');
      await tf.ready();
      tflite.setWasmPath(
        "/dist/");
      const m = await tflite.loadTFLiteModel('/models/gesture_classifier.tflite');
      setModel(m);
    })();
  }, []);

  async function classify(inputArr) {
    return tf.tidy(() => {
      const input = tf.tensor(inputArr, [1, 68]);
      const output = model.predict(input);
      const scores = output.dataSync();
      const maxScore = Math.max(...scores);
      const idx = scores.indexOf(maxScore);
      input.dispose();
      output.dispose();
      return { idx, score: maxScore };
    });
  }

  /*
  // use this to create the dataset with video camera
  const currentLabel = useRef(null);
  const collectedRows = useRef([]);
  const rowRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      switch (e.key.toLowerCase()) {
        case 'u':
          currentLabel.current = 'thumbs_up';
          break;
        case 'd':
          currentLabel.current = 'thumbs_down';
          break;
        case 'l':
          currentLabel.current = 'thumb_left';
          break;
        case 'r':
          currentLabel.current = 'thumb_right';
          break;
        case 'p':
          currentLabel.current = 'open_hand';
          break;
        case 'f':
          currentLabel.current = 'fist';
          break;
        case 'k':
          currentLabel.current = 'ok'
          break;
        case 'o':
          currentLabel.current = 'other';
          break;
        case 'v':
          currentLabel.current = 'negation';
          break;
        default:
          currentLabel.current = null;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  */
  

  // here we init mediapipe hands and gesture mode
  useEffect(() => {
    let camera;
    let hands;

    if (!window.Hands) return;
    hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(async (results) => {

      if (!model) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks.length === 0) {
        setGestureMode(false);
        return;
      }

      const lm = results.multiHandLandmarks[0];

      const score      = results.multiHandedness[0].score;

      // vogliamo uno score >= 0.8 nel rilevamento della mano
      if(score < HANDNESS_SCORE_THRESH) {
        setGestureMode(false);
        return;
      }

      setGestureMode(true);

      //console.log(currentLabel.current)

      // disegno landmarks
      window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 2,
      });
      window.drawLandmarks(ctx, lm, { color: "#FF0000", lineWidth: 1 });
      ctx.restore();

      const now = Date.now()

      /*
      //console.log(collectedRows.current.length);
      // use this only for dataset creation
      if(currentLabel.current && !(collectedRows.current.length > 2999)) { // we'll have 3000 rows for each hand
        // we flatten the 21 points [x,y,z,...]
        const flat = normalizeLandmarks(lm) // length 63

        // estrai handedness da MediaPipe
        let handedness = results.multiHandedness[0].label;   // "Left" or "Right"
        const score      = results.multiHandedness[0].score;   // 0–1

        if(score >= HANDNESS_SCORE_THRESH) {
          // we invert handedness result since it's mirrored from camera
          handedness = handedness === "Left" ? "Right" : "Left";

          const HAND_USED_IN_TRAINING = "Right" // we define which hand we are using for this class

          if(handedness === HAND_USED_IN_TRAINING) {

            // normale al palmo
            const palmNormal = computePalmNormal(lm); // [nx, ny, nz]

            if(!isHandStable(palmNormal)) {
              console.log("FRAME NOT STABLE -- NOT SAVED");
              return;
            }
            
            // landmark normalizzati
            const normFlat = normalizeLandmarks(lm);  // array length = 63

            // componi la riga, con label, handedness, score, poi i 63 valori
        
            // d) componi la riga: label, handedness, score, palmNormal, normFlat
            const row = [
              currentLabel.current,
              handedness,
              score,
              ...palmNormal,
              ...normFlat
            ];

            console.log(row);

            // 7) Salva la riga in memoria
            collectedRows.current.push(row);
            console.log(`Righe raccolte: ${collectedRows.current.length}`);
          } else {
            console.log("FAILED TO RECOGNIZE HAND", handedness, HAND_USED_IN_TRAINING)
          }

        } else {
          console.log("SCORE BELOW THRESH", score, HANDNESS_SCORE_THRESH);
        }

      } else {
        console.log("FINISHED, downloadCSV")
      }

      // usare il return qui per costruire il dataset
      return; */

      const palmNormal = computePalmNormal(lm); // [nx, ny, nz]

      // hand input must be stable to be effectively taken into consideration
      if (!isHandStable(palmNormal)) {
        return;
      }

      const hh = results.multiHandedness[0];
      const inputArr = makeInputArr(lm, hh, score);

      // gesture taken from the classifier at real time
      const { idx: gestureClass, score: modelConf } = await classify(inputArr);

      // we discard the current result if the confidence is low
      if (modelConf < 0.6) {
        return;
      }
      
      console.log("Predicted Class:", gestureClass);

      

      // For every frame we save the current class to a buffer or null. 
      // we need to do this so that only when the buffer has the same gesture K times we can actually do an action
      // this is useful to prevent weird actions
      const g = gestureClass
      gestureBuf.current.push(g);
      if (gestureBuf.current.length > GESTURE_WINDOW) {
        gestureBuf.current.shift();
      }

      // MOVIE SELECTION MODE
      if (modeRef.current === MODE.MOVIE) {
        // DOWN
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_DOWN)) {
              handlersRef.current.moveMovieDown();
              gestureBufferReset();   // buffer reset
              lastConfirmedGesture.current = null;
              return;
        }
        // UP
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_UP)) {
              handlersRef.current.moveMovieUp();
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }

        // LEFT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_LEFT)) {
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }

        // RIGHT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_RIGHT)) {
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }

        // OTHER
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OTHER)) {
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }        

        // OPEN HAND
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OPEN_HAND)) {
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }

        // FIST
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_FIST)) {
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }

        // NEGATION
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_NEGATION)) {
              gestureBufferReset();
              lastConfirmedGesture.current = null;
              return;
        }

        // OK
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OK)
          && lastConfirmedGesture.current !== LABEL_OK) {
              setMode(MODE.TIME);
              setTimePos({ row: null, col: null });
              lastActionRef.current = now;
              // scroll reset to see all times displayed correctly
              containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              gestureBufferReset(); 
              return;
        } 
      // TIME SELECTION MODE
      } else if(modeRef.current === MODE.TIME) {
        // RIGHT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_RIGHT)) {
          handlersRef.current.moveTimeRight()
          gestureBufferReset(); 
          return;
        }
        // UP
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_UP)) {
          handlersRef.current.moveTimeUp()
          gestureBufferReset(); 
          return;
        }
        // DOWN
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_DOWN)) {
          handlersRef.current.moveTimeDown()
          gestureBufferReset(); 
          return;
        }

        // LEFT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_LEFT)) {
          handlersRef.current.moveTimeLeft()
          gestureBufferReset(); 
          return;
        }
        // OK
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OK) 
            && timePosRef.current.row !== null) {

              const idx = selectedIndexRef.current;

              // check if the current row is equal to max row
              if(movies[idx].showtimes.length === timePosRef.current.row) {
                // we are at "go back" button

                lastConfirmedGesture.current = LABEL_OK;
                resetMovieMode();

              } else {
                setDay(movies[idx].showtimes[timePosRef.current.row].day);
                setHour(movies[idx].showtimes[timePosRef.current.row].times[timePosRef.current.col]);

                resetSeatMode();
              }

              
              lastActionRef.current = now;

              gestureBufferReset(); 

              return;
        }

      // SEAT SELECTION MODE
      } else if(modeRef.current === MODE.SEAT) {
        // RIGHT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_RIGHT)) {
              handlersRef.current.moveSeatRight();
              gestureBufferReset(); 
              return;
        }
        // UP
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_UP)) {
              handlersRef.current.moveSeatUp();
              gestureBufferReset(); 
              return;
        }
        // DOWN
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_DOWN)) {
              handlersRef.current.moveSeatDown();
              gestureBufferReset(); 
              return;
        }

        // LEFT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_LEFT)) {
              handlersRef.current.moveSeatLeft();
              gestureBufferReset(); 
              return;
        }

        // OK
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OK)) {

              const { row, col } = seatPosRef.current;

              console.log(row, col);

              // Conferma posti
              if (row === buttonRowRef.current && col === confirmColIndex) {
                console.log("Seats confirmed", selectedSeatsRef.current);
              }
              // Torna indietro a TIME MODE
              else if (row === buttonRowRef.current && col === backColIndex) {
                resetTimeMode();
              }
              // Altrimenti selezioniamo/deselezioniamo il posto corrente
              else {
                handlersRef.current.selectSeat();
              }

              gestureBufferReset(); 
              return;
        }
        
        // OPEN HAND
        if(gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OPEN_HAND)) {
              handlersRef.current.deselectSeat();
              gestureBufferReset(); 
              return;
            }

      }

      // altrimenti non fare nulla
      return;

      });
    
    camera = new window.Camera(videoRef.current, {
      onFrame: async () => { await hands.send({ image: videoRef.current }); },
      width: 640, height: 480
    });
    camera.start()

  return () => {
    camera.stop();
    hands.close();
  };
  }, [model]);

  useEffect(() => {
    // scroll solo in gestureMode o dopo un comando vocale
    if (!gestureMode && !voiceMode) return;

    const cards = containerRef.current?.querySelectorAll('.movie-card');
    if (!cards || cards.length === 0) return;

    // prendi la card corrispondente a selectedIndex
    const el = cards[selectedIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // se vuoi che voiceMode duri solo per questo scroll, lo resetti
    if (voiceMode) resetVoiceMode();
  }, [selectedIndex, gestureMode, voiceMode]);

  // function to extract the 65 length vector needed for the classifier
  function makeInputArr(lm, handedness, score) {

    // normale al palmo
    const palmNormal = computePalmNormal(lm); // [nx, ny, nz]
    
    // landmark normalizzati
    const normFlat = normalizeLandmarks(lm);  // array length = 63

    // 2) handedness: “Left”→0, “Right”→1 quindi se ho left inverto a right dato che ho il mirror
    const handCode = handedness.label === 'Left' ? 1 : 0;
    
    return new Float32Array([ score, ...palmNormal, ...normFlat, handCode ]);
  }

  function gestureBufferReset() {
    gestureBuf.current = [];
  }

  function resetTimeMode() {
    setMode(MODE.TIME);
    setTimePos({row: null, col: null});
  }

  function resetMovieMode() {
    setMode(MODE.MOVIE);
    setTimePos({row: null, col: null});
  }

  function resetSeatMode() {
    setMode(MODE.SEAT);
    setSelectedSeats([]);
    setSeatPos({ row: null, col: null });
  }

  function getTitle() {
    switch(mode) {
      case MODE.MOVIE:
        return "Book a movie";
      case MODE.TIME:
        return `Choose a time for: ${movies[selectedIndex].title}`;
      case MODE.SEAT:
        return `Choose seats for the movie: ${movies[selectedIndex].title}, on the day: "${day}" 
        at time: ${hour}`;
      default:
        return "";
    }
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-[1.00rem] md:text-[1.75rem] font-bold mb-4 text-center">
        {getTitle()}
      </h1>

      {/* for dataset creation
            <button
              onClick={downloadCSV}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Download CSV
            </button>
      */}
      <VoiceControl
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        listening={listening}
        transcript={transcript}
        voiceLog={voiceLog}
      />

      <div ref={containerRef} onWheel={handleWheel} className="flex-1 overflow-y-auto">
        {mode === MODE.MOVIE && (
          <MovieSelector
              movies={movies}
              gestureMode={gestureMode}
              voiceMode={voiceMode}
              selectedIndex={selectedIndex}
              onSelect={(idx) => {
                if(!gestureMode && !voiceMode) {
                  setMovieIndex(idx);
                }
              }}
          />
        )} {mode === MODE.TIME && (
           <TimeSelector
              showtimes={movies[selectedIndex].showtimes}
              timePos={timePos}
              onSelectTime={({ row, col }) => setTimePos({ row, col })}
              selectedImage={movies[selectedIndex].image}
              selectedTitle={movies[selectedIndex].title}
              maxCols={maxCols}
              onBack={() => resetMovieMode()}
          />
        )} {mode === MODE.SEAT && (
          <SeatSelector
              layout={currentLayout}
              occupied={initialOccupied}
              selected={selectedSeats}
              focused={seatPos}
              onSelect={handleSeatSelection}
              onBack={() => resetTimeMode()}
              onConfirm={() => null}
          />
        )}
      </div>

      {/* show camera overlay */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-4 right-4 w-80 h-60 border border-gray-300 rounded-lg"
      />
      

      {/* Video + Canvas nascosti per MediaPipe */}
      {/*<video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />*/}
    </div>
  );
}