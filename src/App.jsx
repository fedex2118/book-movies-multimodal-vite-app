// Multimodal movie booking prototype with gesture (MediaPipe Hands) + card expansion

import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import '@tensorflow/tfjs-backend-wasm';

import downloadCSV from "./hooks/downloadCSV";

import { getMovies } from "./hooks/api"

import MovieSelector from './components/MovieSelector';
import TimeSelector from './components/TimeSelector';
import SeatSelector from './components/SeatSelector';
import BookingSummary from "./components/BookingSummary";
import BlockingModal from "./components/BlockingModal";

import isHandStable from '../src/hooks/isHandStable';
import computePalmNormal from "./hooks/computePalmNormal";
import normalizeLandmarks from "./hooks/normalizeLandmarks";

import movieNavigation from "./hooks/movieNavigation";
import timeNavigation from "./hooks/timeNavigation";
import seatNavigation from "./hooks/seatNavigation";
import bookingSummaryNavigation from "./hooks/bookingSummaryNavigation";

import voiceNavigation from './hooks/voiceNavigation';
import VoiceControl from './components/VoiceControl';

import VideoControl from "./components/VideoControl";

import { MODE } from "./constants/modes";

import { api } from "./hooks/api"

const currency = "€";

const INITIAL_MOVIES = [
  {
    title: "Loading title",
    altTitles: [],
    description: "Loading description",
    director: "Loading director",
    cast: "Loading cast",
    duration: 0,
    showtimes: [

    ],    
    image: `Loading image`
  }
]

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
  [],
];

export default function App() {

  // movies loaded
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  //console.log(movies)

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const apiMovies = await getMovies();   // [{title, altTitles, description, director, cast, duration, showtimes, image}]
        if (!alive) return;

        // validation
        if (Array.isArray(apiMovies) && apiMovies.every(m => m?.title && m?.showtimes)) {
          setMovies(addMovieIdToTimes(apiMovies));
        }
      } catch (err) {
          console.warn("Failed to fetch /movies, using local fallback:", err);
          // INITIAL MOVIES fallback
      }
    })();
    return () => { alive = false; };
  }, []);

  // camera handle
  const [cameraActive, setCameraActive] = useState(false);
  const cameraRef = useRef(null);
  
  // handsRef
  const handsRef = useRef(null);

  // press V key to enable/disable camera
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() === 'v') {
        setCameraActive(active => !active);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // day / hour
  const [day, setDay] = useState(null);
  const [hour, setHour] = useState(null);

  const dayRef = useRef(null)
  const hourRef = useRef(null)

  // already occupied seats TODO
  const initialOccupied = ['F3', 'F4', 'H4', 'H5', 'I4'];
  // selected seats from user
  const [selectedSeats, setSelectedSeats] = useState([]);
  const selectedSeatsRef = useRef(selectedSeats);

  useEffect(() => { selectedSeatsRef.current = selectedSeats; }, [selectedSeats]);

  // selected cinema hall
  const [selectedCinemaHall, setSelectedCinemaHall] = useState(null);
  const selectedCinemaHallRef = useRef(selectedCinemaHall);

  useEffect(() => { selectedCinemaHallRef.current = selectedCinemaHall; }, [selectedCinemaHall]);

  // total price
  const [totalPrice, setTotalPrice] = useState(null);
  const totalPriceRef = useRef(0);

  useEffect(() => { totalPriceRef.current = totalPrice; }, [totalPrice]);

  const handleTotalPriceChange = useCallback((p) => {
    totalPriceRef.current = p;
    setTotalPrice(p);
  }, []);

  const toBookingSummary = useCallback((p) => {
    totalPriceRef.current = p;
    setTotalPrice(p);
    setMode(MODE.BOOKING_SUMMARY);
    setBookingSummarySelectedIndex(-1);
  }, []);

  const handleConfirmFromSeats = useCallback((p) => {
    toBookingSummary(p);
  }, [toBookingSummary]);


  // safety: upper case seats already occupied
  const occupiedUpper = useMemo(
    () => new Set((initialOccupied || []).map(s => String(s).toUpperCase())),
    [initialOccupied]
  );

  // handler for seats selection for both voice and mouse
  const handleSeatSelection = (payload = {}) => {
    // ---- VOICE case: { type, seats: ['A1','B3', ...] } ----
    if (typeof payload === 'object' && 'type' in payload && Array.isArray(payload.seats)) {
      const { type, seats } = payload;
      if (!seats.length) return;

      const seatsUp = seats.map(s => String(s).toUpperCase());

      setSelectedSeats(prev => {
        const sel = new Set(prev.map(x => String(x).toUpperCase()));

        if (type === 'select') {
          for (const code of seatsUp) {
            if (!occupiedUpper.has(code)) sel.add(code);           // ignore initially occuped
          }
        } else if (type === 'deselect') {
          for (const code of seatsUp) sel.delete(code);
        } else if (type === 'toggle') { // unused
          for (const code of seatsUp) {
            if (sel.has(code)) sel.delete(code);
            else if (!occupiedUpper.has(code)) sel.add(code);
          }
        }
        return Array.from(sel);
      });
      return;
    }

    // ---- MOUSE case: { row, col, seat } ----
    const code = String(payload.seat || '').toUpperCase();
    if (!code || occupiedUpper.has(code)) return;                  // return if initially occuped

    setSelectedSeats(prev => {
      const sel = new Set(prev.map(x => String(x).toUpperCase()));
      if (sel.has(code)) sel.delete(code); else sel.add(code);     // toggled with mouse
      return Array.from(sel);
    });
  };

  // handle end demo modal
  const [demoEndModal, setDemoEndModal] = useState(false);

  const handleBookingSummaryConfirm = useCallback(() => {
    setDemoEndModal(true);       // popup
  }, []);

  // endDemo modal closure
  const handleEndModalClose = useCallback(() => {
    setDemoEndModal(false);
    resetMovieMode();
  }, []);

  const lastConfirmedGesture = useRef(null);
  
  const [mode, setMode] = useState(MODE.MOVIE);
  const modeRef = useRef(mode);
  
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [model, setModel] = useState(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const lastActionRef = useRef(0); // timestamp last gesture used
  const ACTION_DELAY   = 350; // ms to delay a gesture action

  const {
    selectedIndex,
    moveMovieUp,
    moveMovieDown,
    setSelectedIndex: setMovieIndex
  } = movieNavigation(movies.length, lastActionRef, 0, ACTION_DELAY);

  const selectedIndexRef = useRef(0);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // grid layouts
  const [fetchedLayout, setFetchedLayout] = useState(null);
  const currentLayout = fetchedLayout || layout0;

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
    ...(movies[selectedIndex].showtimes || []).map(show => (show.times || []).length)
  ) - 1;

  const getMaxRow = () => (movies[selectedIndex].showtimes || []).length;

  const getMaxCol = (row) => {
    const sts = movies[selectedIndex].showtimes || [];
    return row === sts.length ? 0 : (sts[row].times || []).length - 1;
  };

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

  const { 
    bookingSummarySelectedIndex,
    bookingSummarySelectedIndexRef,
    moveBookingSummaryLeft,
    moveBookingSummaryRight,
    moveBookingSummaryUp,
    moveBookingSummaryDown,
    setBookingSummarySelectedIndex }
     = bookingSummaryNavigation({
    length: 2, // only two buttons "confirm" and "go back"
    lastActionRef
  });

  const HANDNESS_SCORE_THRESH = 0.8

  const GESTURE_WINDOW = 5;
  const gestureBuf = useRef([]);   // ci metti dentro solo LABEL_UP o LABEL_DOWN (o null)

  const [gestureMode, setGestureMode] = useState(false);

  const {
    transcript,
    listening,
    voiceMode,
    resetTranscript,
    resetVoiceMode,
    browserSupportsSpeechRecognition,
    voiceLog,
    speak
  } = voiceNavigation({
    modeRef,
    movies,
    setMovieIndex,
    setDay,
    setHour,
    resetSeatMode,
    setMode,
    resetMovieMode,
    currentMovieIndex: selectedIndex,
    currentLayout,
    initialOccupied,
    selectedSeatsRef,
    onSeatSelect: handleSeatSelection,
    goToBookingSummary: handleConfirmFromSeats,
    totalPriceRef,
    resetTimeMode,
    setSeatPos,
    handleBookingSummaryConfirm,
    resolveLayout,
    readTimeEntry,
    gestureMode,
    timePosRef,
    seatPosRef,
    buttonRowRef,
    backColIndex,
    confirmColIndex,
    selectSeat,
    deselectSeat,
    bookingSummarySelectedIndexRef
  });

  // a handlerRef is used to contain a reference to components functions always updated
  // this way App.jsx is always synched with the updated values
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
    deselectSeat: () => {},
    resetVoiceMode: () => {},
    speak: () => {},
    moveBookingSummaryLeft: () => {},
    moveBookingSummaryRight: () => {},
    moveBookingSummaryUp: () => {},
    moveBookingSummaryDown: () => {}
  });

  // update handlerRef
  // Every time that a handler changes, we update handlersRef.current
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
      deselectSeat,
      resetVoiceMode,
      speak,
      moveBookingSummaryLeft,
      moveBookingSummaryRight,
      moveBookingSummaryUp,
      moveBookingSummaryDown
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
    deselectSeat,
    resetVoiceMode,
    speak,
    moveBookingSummaryLeft,
    moveBookingSummaryRight,
    moveBookingSummaryUp,
    moveBookingSummaryDown
  ]);

  // handle wheel
  const handleWheel = (e) => {
    //e.preventDefault();
    
    if(gestureMode || voiceMode) return;

    // Y of the cursor in the viewport
    const mouseY = e.clientY;
    // take all cards rendered
    const cards = containerRef.current.querySelectorAll('.movie-card');
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      // if curor is inside boundary of this card...
      if (mouseY >= rect.top && mouseY <= rect.bottom) {
        setMovieIndex(i)
        break;
      }
    }
  };

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

  // model classify function
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
  

  // MEDIA PIPE HANDS
  useEffect(() => {
    
    if (!cameraActive) {
      setGestureMode(false);
      return;
    }
    if (!window.Hands && !window.Camera) {
      setGestureMode(false);
      return;
    }
    if (!model) {
      setGestureMode(false);
      return;
    }

    let active = true;

    const hands = new window.Hands({
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

      if (!active) return;

      const canvas = canvasRef.current;
      // we must avoid now to have a null reference if user presses V to disable the camera
      if (!canvas) return;
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

      // we want a score at least >= 0.8 on the handness recognition
      if(score < HANDNESS_SCORE_THRESH) {
        setGestureMode(false);
        return;
      }

      setGestureMode(true);

      //console.log(currentLabel.current)

      // draw landmarks of hand
      window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 2,
      });
      window.drawLandmarks(ctx, lm, { color: "#FF0000", lineWidth: 1 });
      ctx.restore();

      const now = Date.now()

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
      
      //console.log("Predicted Class:", gestureClass);

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
              lastConfirmedGesture.current = null;
              handlersRef.current.moveTimeRight()
              gestureBufferReset(); 
              return;
        }
        // UP
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_UP)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveTimeUp()
              gestureBufferReset(); 
              return;
        }
        // DOWN
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_DOWN)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveTimeDown()
              gestureBufferReset(); 
              return;
        }

        // LEFT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_LEFT)) {
              lastConfirmedGesture.current = null;
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
                const movie = movies[idx];
                const row = timePosRef.current.row;
                const col = timePosRef.current.col;

                const chosenDay = movie.showtimes[row].day;
                const { timeStr, screeningId, roomId } = readTimeEntry(movie.showtimes[row].times[col]);

                // Aggiorna UI
                setDay(chosenDay);
                setHour(timeStr);
                if (roomId != null) setSelectedCinemaHall(roomId);

                try {
                  // Se lo screeningId non è già disponibile, risolvi via endpoint
                  let sid = screeningId;
                  if (!sid) {
                    const { screeningId: resolvedId, roomId: resolvedRoom } =
                      await api.resolveScreening({ title: movie.title, day: chosenDay, time: timeStr });
                    sid = resolvedId;
                    if (resolvedRoom != null) setSelectedCinemaHall(resolvedRoom);
                  }

                  // Carica layout
                  const grid = await api.getLayout(sid);
                  setFetchedLayout(grid);
                } catch (e) {
                  console.warn("Resolve/layout failed, using local layout fallback:", e);
                  setFetchedLayout(null);
                }

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
              lastConfirmedGesture.current = null;
              handlersRef.current.moveSeatRight();
              gestureBufferReset(); 
              return;
        }
        // UP
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_UP)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveSeatUp();
              gestureBufferReset(); 
              return;
        }
        // DOWN
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_DOWN)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveSeatDown();
              gestureBufferReset(); 
              return;
        }

        // LEFT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_LEFT)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveSeatLeft();
              gestureBufferReset(); 
              return;
        }

        // OK
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OK)) {

              const { row, col } = seatPosRef.current;
              lastConfirmedGesture.current = LABEL_OK;

              // confirm seats
              if (row === buttonRowRef.current && col === confirmColIndex) {
                //console.log("Seats confirmed", selectedSeatsRef.current);
                // go to BOOKING SUMMARY MODE
                toBookingSummary(totalPriceRef.current);
              }
              // go back to TIME MODE
              else if (row === buttonRowRef.current && col === backColIndex) {
                resetTimeMode();
              }
              // otherwise select a seat
              else {
                handlersRef.current.selectSeat();
              }

              gestureBufferReset(); 
              return;
        }
        
        // OPEN HAND
        if(gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OPEN_HAND)) {
              // deselect a selected seat
              lastConfirmedGesture.current = null;
              handlersRef.current.deselectSeat();
              gestureBufferReset(); 
              return;
            }
      
      // BOOKING SUMMARY MODE
      } else if(modeRef.current === MODE.BOOKING_SUMMARY) {
        // RIGHT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_RIGHT)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveBookingSummaryRight();
              gestureBufferReset(); 
              return;
        }

        // LEFT
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_LEFT)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveBookingSummaryLeft()
              gestureBufferReset(); 
              return;
        }
        // UP
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_UP)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveBookingSummaryUp();
              gestureBufferReset();
              return;
        }
        // DOWN
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_DOWN)) {
              lastConfirmedGesture.current = null;
              handlersRef.current.moveBookingSummaryDown();
              gestureBufferReset(); 
              return;
        }
        // OK
        if (gestureBuf.current.length === GESTURE_WINDOW
            && gestureBuf.current.every(v => v === LABEL_OK) 
            && bookingSummarySelectedIndexRef.current !== null) {

              const idx = bookingSummarySelectedIndexRef.current;

              // check if the current row is equal to max row
              if(idx === 0) {
                // we are at "go back" button
                setMode(MODE.SEAT);
                setSeatPos({row: null, col: null});

              } else if(idx === 1) {
                // booking confirmed
                setDemoEndModal(true);
              }

              lastConfirmedGesture.current = null;

              lastActionRef.current = now;

              gestureBufferReset(); 

              return;
        }
      }



      // otherwise don't do anything
      return;

      });

  handsRef.current = hands;
    
  if (videoRef.current) {
    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (!active) return;
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();
    cameraRef.current = camera;
  }

  return () => {
      active = false; // we block onFrame / onResults
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [model, cameraActive]);

  const onSelectTime = async ({ row, col }) => {
    if (gestureMode || voiceMode) return;

    setTimePos({ row, col });

    const idx = selectedIndexRef.current;
    const show = movies[idx].showtimes[row];

    // if (row === showtimes.length) {
    //   resetMovieMode();
    //   return;
    // }
    const { timeStr, screeningId, roomId } = readTimeEntry(show.times[col]);

    setDay(show.day);
    setHour(timeStr);
    if (roomId != null) setSelectedCinemaHall(roomId);

    try {
      let sid = screeningId;
      if (!sid) {
        const { screeningId: resolvedId, roomId: resolvedRoom } =
          await api.resolveScreening({ title: movies[idx].title, day: show.day, time: timeStr });
        sid = resolvedId;
        if (resolvedRoom != null) setSelectedCinemaHall(resolvedRoom);
      }
      const grid = await api.getLayout(sid);
      setFetchedLayout(grid);
    } catch (e) {
      console.warn("Resolve/layout failed, using local layout:", e);
      setFetchedLayout(null);
    }

    resetSeatMode();
  };

  // SCROLL TO MOVIE FUNCTION
  useEffect(() => {
    // we scroll to a movie card only if we are in one of modes: gestureMode or voiceMode
    if (!gestureMode && !voiceMode) return;

    const cards = containerRef.current?.querySelectorAll('.movie-card');
    if (!cards || cards.length === 0) return;

    // go to the card that is the current selectedIndex
    const el = cards[selectedIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // we reset voice mode immediately after
    if (voiceMode) handlersRef.current.resetVoiceMode();
  }, [selectedIndex, gestureMode, voiceMode]);

  // function to extract the 65 length vector needed for the classifier
  function makeInputArr(lm, handedness, score) {

    // we compute the palm normal (that we also used to build the dataset beforehand)
    const palmNormal = computePalmNormal(lm); // [nx, ny, nz]
    
    // landmark normalized
    const normFlat = normalizeLandmarks(lm);  // array length = 63

    // handedness: “Left”→0, “Right”→1 if I get left I invert to right since hands are mirrored
    const handCode = handedness.label === 'Left' ? 1 : 0;
    
    return new Float32Array([ score, ...palmNormal, ...normFlat, handCode ]);
  }

  function gestureBufferReset() {
    gestureBuf.current = [];
  }

  // looks for screening id if not found, this is used for obtaining grid layout from backend
  async function resolveLayout(title, day, time, screeningId = null, roomId = null) {
    try {
      let sid = screeningId;
      if (!sid) {
        const res = await api.resolveScreening({ title, day, time });
        sid = res.screeningId;
        if (res.roomId != null) setSelectedCinemaHall(res.roomId);
      } else if (roomId != null) {
        setSelectedCinemaHall(roomId);
      }

      const grid = await api.getLayout(sid);
      setFetchedLayout(grid);
      return true;
    } catch (e) {
        console.warn("resolveLayout failed:", e);
        setFetchedLayout(null);
      return false;
    }
  }

  function resetTimeMode() {
    setMode(MODE.TIME);
    setTimePos({row: null, col: null});
    setTotalPrice(null);
    setFetchedLayout(null);
  }

  function resetMovieMode() {
    setMode(MODE.MOVIE);
    setTimePos({row: null, col: null});
    setTotalPrice(null);
    setFetchedLayout(null);
    // reset index only if not in gesture mode
    setMovieIndex(0);
    selectedIndexRef.current = 0;
  }

  function resetSeatMode() {
    setMode(MODE.SEAT);
    setSelectedSeats([]);
    setSeatPos({ row: null, col: null });
    setTotalPrice(null);
  }

  // to find screeningId from movie data
  function readTimeEntry(entry) {
    if (!entry) return { timeStr: null, screeningId: null, roomId: null };
    if (typeof entry === 'string') {
      return { timeStr: entry, screeningId: null, roomId: null };
    }
    if (typeof entry === 'object') {
      return {
        timeStr: entry.time ?? null,
        screeningId: entry.screeningId ?? null,
        roomId: entry.roomId ?? null,
      };
    }
    return { timeStr: null, screeningId: null, roomId: null };
  }

  // variable to avoid stale response when user click fast on time (hour) of a movie card
  const lastLayoutReq = useRef(0);

  async function onSelectMovieTime({ movieId, day, time, screeningId, roomId }) {
    setDay(day);
    setHour(time);

    try {
      let sid = screeningId ?? null;
      let hall = roomId ?? null;

      // server side resolution when some ids are missing
      if (!sid || !hall) {
        const resolved = await api.resolveScreening({ movieId, day, time });
        if (!sid)  sid  = resolved.screeningId;
        if (!hall) hall = resolved.roomId;
      }

      if (hall != null) setSelectedCinemaHall(hall);

      const reqId = ++lastLayoutReq.current;
      const grid = await api.getLayout(sid);

      // the last request "wins"
      if (reqId !== lastLayoutReq.current) return;

      setFetchedLayout(grid);
    } catch (e) {
      console.warn("Resolve/layout failed, using local layout:", e);
      setFetchedLayout(null);
    }

    resetSeatMode();
  }

  // this function adds movieId to each time, this way we completely avoid to have errors on MODE.MOVIE when selecting a time with mouse 
  // (the bug is caused from onWheel and onClick that makes transition when passing from mouse to gesture mode better)
  function addMovieIdToTimes(movies) {
    return (movies || []).map((m, idx) => {
      const id = m.id ?? idx; // fallback se manca id
      const showtimes = (m.showtimes || []).map(g => ({
        ...g,
        times: (g.times || []).map(t => {
          if (t && typeof t === 'object') {
            return { ...t, movieId: t.movieId ?? id };
          }
          return { time: String(t || ''), movieId: id };
        })
      }));
      return { ...m, id, showtimes };
    });
  }

  // lock on wheel and on click for a small amount of time
  const selectionLockRef = useRef(false);

  function lockSelection(ms = 350) {
    selectionLockRef.current = true;
    setTimeout(() => { selectionLockRef.current = false; }, ms);
  }


  function getTitle() {
    switch(mode) {
      case MODE.MOVIE:
        return "Book a movie";
      case MODE.TIME:
        return `Choose a time for: ${movies[selectedIndex].title}`;
      case MODE.SEAT:
        return `Choose seats for the movie: ${movies[selectedIndex].title} in Cinema Hall ${selectedCinemaHall}, on the day: "${day}" 
        at time: ${hour}`;
      case MODE.BOOKING_SUMMARY:
        return `Booking Summary`
      default:
        return "";
    }
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-[1.00rem] md:text-[1.15rem] font-bold mb-4 text-center">
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
        mode={mode}
      />

      {mode === MODE.MOVIE && cameraActive && (
          <div className="sticky bottom-0 bg-white bg-opacity-75 backdrop-blur-sm p-2 w-full text-center text-base text-gray-700 z-10">
            Use index finger 👆👇 gestures to move through movies<br/>
            Use 👌 gesture to choose a movie<br/>
          </div>
      )}

      <div ref={containerRef} onWheel={handleWheel} className="flex-1 overflow-y-auto">
        
        {mode === MODE.MOVIE && (
          <MovieSelector
              movies={movies}
              gestureMode={gestureMode}
              voiceMode={voiceMode}
              selectedIndex={selectedIndex}
              onSelectMovie={(movieId) => {
                if (selectionLockRef.current) return; // avoid on wheel/hover on transition
                if(!gestureMode && !voiceMode) {
                  setMovieIndex(movieId);
                }
              }}
              onSelectTime={({ movieId, day, time, screeningId, roomId }) => {
                lockSelection(); // block hover/wheel for ~350ms
                if (!gestureMode && !voiceMode) {
                  onSelectMovieTime({ movieId, day, time, screeningId, roomId });
                }
              }}
          />
        )} {mode === MODE.TIME && (
           <TimeSelector
              showtimes={movies[selectedIndex].showtimes}
              timePos={timePos}
              onSelectTime={onSelectTime}
              selectedImage={movies[selectedIndex].image}
              selectedTitle={movies[selectedIndex].title}
              maxCols={maxCols}
              onBack={() => resetMovieMode()}
              cameraActive={cameraActive}
              gestureMode = {gestureMode}
              voiceMode = {voiceMode}
          />
        )} {mode === MODE.SEAT && (
          <SeatSelector
              layout={currentLayout}
              occupied={initialOccupied}
              selected={selectedSeats}
              focused={seatPos}
              onSelect={handleSeatSelection}
              onBack={() => resetTimeMode()}
              onConfirm={handleConfirmFromSeats}
              gestureMode = {gestureMode}
              voiceMode = {voiceMode}
              cameraActive = {cameraActive}
              selectedDay = {day}
              currency={currency}
              onTotalPriceChange={handleTotalPriceChange}
              totalPriceRef={totalPriceRef}
          />
        )} {mode === MODE.BOOKING_SUMMARY && (
          <BookingSummary
              movieTitle={movies[selectedIndex].title}
              selectedImage={movies[selectedIndex].image}
              selectedDay={day}
              selectedTime={hour}
              selectedSeats={selectedSeats}
              cinemaHall={selectedCinemaHall}
              totalPrice={totalPriceRef.current}
              currency={currency}
              onBack={() => {setMode(MODE.SEAT); setSeatPos({row: null, col: null})}}
              onConfirm={handleBookingSummaryConfirm}
              cameraActive={cameraActive}
              gestureMode={gestureMode}
              voiceMode={voiceMode}
              bookingSummarySelectedIndex={bookingSummarySelectedIndex}
              duration={movies[selectedIndex].duration}
              director={movies[selectedIndex].director}
              cast={movies[selectedIndex].cast}
            />
        )}
      </div>

      <BlockingModal
        open={demoEndModal}
        title="Booking confirmed successfully!"
        subtitle="Demo is over"
        primaryLabel="OK"
        onClose={handleEndModalClose}
      />

      {/* show camera overlay only when camera is active */}
      <VideoControl
        cameraActive={cameraActive}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
    </div>
  );
}