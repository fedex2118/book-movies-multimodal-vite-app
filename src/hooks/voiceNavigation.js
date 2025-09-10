import { useEffect, useState, useRef, useMemo } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { MODE } from "../constants/modes";

// regex patterns for voice mode
const MOVIE_CMD_REGEX = /^(?:search|find|look for|locate|get)\s+(?:me\s+)?(?:(?:a|the)\s+)?(?:movie\s+)?(?:(?:called|named)(?:\s+as)?\s+)?(.+)$/i;

// REGEX MODE MOVIE
// groups: 1=movie, 2=time, 3=day (optional)
export const MOVIE_AT_TIME_OPTIONAL_DAY =
/^(?:choose|select|pick|set|book|reserve)\s+(?:a|the\s+)?(?:movie\s+)?(.+?)\s+(?:after|at\s+(?:the\s+)?(?:time\s+)?)((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))(?:\s+on\s+(.+))?$/i;

// groups: 1=movie, 2=day, 3=time
const MOVIE_ON_DAY_AT_TIME =
/^(?:choose|select|pick|set|book|reserve)\s+(?:a|the\s+)?(?:movie\s+)?(.+?)\s+on\s+(.+?)\s+(?:after|at\s+(?:the\s+)?(?:time\s+)?)((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))$/i;

// groups: 1=time, 2=day (optional), 3=movie
const TIME_FIRST_CMD =
/^(?:choose|select|pick|set|book|reserve)\s+(?:a|the\s+)?(?:time\s+)?((?=\d)(?:[01]?\d|2[0-3])[:.][0-5]\d|(?=\d)(?:[01]?\d|2[0-3])(?:\s*h)?|(?=\d)(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))(?:\s+on\s+(.+?))?\s+(?:for\s+)?(?:the\s+)?(?:movie\s+)?(.+)$/i;


// "book current [at TIME] [on DAY?]"  → groups: 1=time, 2=day (optional)
const BOOK_CURRENT_AT_TIME_OPTIONAL_DAY =
/^(?:choose|select|pick|set|book|reserve|confirm|go)\s+(?:the\s+)?current(?:\s+(?:selection|index|movie))?\s+(?:after|at\s+(?:the\s+)?(?:time\s+)?)((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])[0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::(?:[0-5]\d))?\s*(?:a\.?m\.?|p\.?m\.?))(?:\s+on\s+(.+))?$/i;

// "book current [on DAY] at TIME"     → groups: 1=day, 2=time
const BOOK_CURRENT_ON_DAY_AT_TIME =
/^(?:choose|select|pick|set|book|reserve|confirm|go)\s+(?:the\s+)?current(?:\s+(?:selection|index|movie))?\s+on\s+(.+?)\s+(?:after|at\s+(?:the\s+)?(?:time\s+)?)((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])[0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))$/i;

// "book current", "book current selection/index/movie", for multiple modes interaction
const BOOK_CURRENT_OPTIONAL_TIME =
/^(?:choose|select|pick|set|book|reserve|confirm|go)\s+(?:the\s+)?current(?:\s+(?:selection|index|movie))?(?:\s+(?:after|at\s+(?:time\s+)?)((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])[0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::(?:[0-5]\d))?\s*(?:a\.?m\.?|p\.?m\.?)?))?\s*$/i;

// time selection regex
const BOOK_NO_TIME_CMD =
/^(?:book|reserve|schedule|set|choose|select)\s+(?:a|the\s+)?(?:movie\s+)?(.+?)(?:\s+on\s+(.+))?$/i;

// REGEX MODE TIME
// groups: 1=time, 2=day (optional)
const TIME_ONLY_CMD =
/^(?:show|choose|select|pick|set|book|reserve)\s+(?:(?:a|the|at)\s+)?(?:time\s+)?((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])[0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::(?:[0-5]\d))?\s*(?:a\.?m\.?|p\.?m\.?)?)(?:\s+on\s+(.+))?$/i;


// (es. "choose 21th June at 9pm")
// groups: 1=day, 2=time
const DAY_AT_TIME_NO_MOVIE =
/^(?:show|choose|select|pick|set|book|reserve)\s+(.+?)\s*(?:\s+(?:a|the|at|after))?\s*((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))$/i;

// REGEX SEAT MODE
// SELECT seats (movie/seat(s) optional; list “A1,A2  A3”/“A1 and A2”)
const SELECT_SEATS_CMD =
/^(?:choose|pick|select|set)\s+(?:a|the\s+)?(?:movie\s+)?(?:seat|seats)?\s*([A-Za-z]{1,2}\s*\d{1,2}(?:\s*(?:,|\band\b)?\s*[A-Za-z]{1,2}\s*\d{1,2})*)$/i;

// DESELECT seats (synonim + optional)
const DESELECT_SEATS_CMD =
/^(?:deselect|disconnect|remove|cancel|unselect|unpick)\s+(?:a|the\s+)?(?:movie\s+)?(?:seat|seats)?\s*([A-Za-z]{1,2}\s*\d{1,2}(?:\s*(?:,|\band\b)?\s*[A-Za-z]{1,2}\s*\d{1,2})*)$/i;

// REGEX CONFIRM
// CONFIRM command
const CONFIRM_CMD = /^(?:confirm|ok|okay|proceed|continue)(?:\s+(?:selection|seats?|booking|reservation))?$/i;

// REGEX GO BACK
// BACK command
const GO_BACK_CMD = /^(?:back|go back|previous|cancel|exit)$/i;

const GO_BACK_MOVIE_CMD = /^(?:go\s*back|back|return)\s*(?:to|towards)?\s*(?:the\s*)?(?:movie(?:\s*(?:list|selection|mode))?|movies?)$/i;
const GO_BACK_TIME_CMD  = /^(?:go\s*back|back|return)\s*(?:to|towards)?\s*(?:the\s*)?(?:time(?:\s*(?:selection|mode|list))?|times?)$/i;
const GO_BACK_SEAT_CMD  = /^(?:go\s*back|back|return)\s*(?:to|towards)?\s*(?:the\s*)?(?:seat(?:\s*(?:selection|mode|list))?|seats?)$/i;

// --- Helpers SEAT MODE ---
const parseSeatList = (s) =>
  (s?.match(/[A-Za-z]{1,2}\s*\d{1,2}/g) || [])
    .map(x => x.replace(/\s+/g, '').toUpperCase());

const buildValidSeatSet = (layout) => new Set((layout || []).flat().filter(Boolean));

export default function useVoiceNavigation({
    modeRef,
    movies,
    setMovieIndex, // needed for command "search movie"
    setDay,
    setHour,
    resetSeatMode,
    setMode,
    resetMovieMode,
    currentMovieIndex,
    currentLayout,
    initialOccupied,
    selectedSeatsRef,
    onSeatSelect,
    goToBookingSummary,
    totalPriceRef,
    resetTimeMode,
    setSeatPos,
    handleBookingSummaryConfirm,
    resolveLayout,
    readTimeEntry,
    gestureMode
    }) {
    const [voiceMode, setVoiceMode] = useState(false);
    // indexCurrentMovie
    const movieIdxRef = useRef(
        Number.isInteger(currentMovieIndex) ? currentMovieIndex : -1
    );
    useEffect(() => {
    movieIdxRef.current =
        Number.isInteger(currentMovieIndex) ? currentMovieIndex : -1;
    }, [currentMovieIndex]);

    // voice log
    const [voiceLog, setVoiceLog] = useState([]);
    const logResult = (message) => setVoiceLog([`🗣️ ${message}`]);

    const handlingRef = useRef(false);

    const norm = (s = "") =>
        s
        .toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")    // accents removal
        .replace(/[’'".,;:!?()\-–—_]/g, " ")                // cleaned punctuation
        .replace(/\s+/g, " ")                               // multiple spaces -> one space
        .trim();

    // for SEAT MODE
    const validSeatSet = useMemo(
        () => buildValidSeatSet(currentLayout),
        [currentLayout]
    );
    const occupiedSet = useMemo(
        () => new Set((initialOccupied || []).map(s => s.toUpperCase())),
        [initialOccupied]
    );
    // current selected seats as Set
    const getSelectedSet = () => new Set((selectedSeatsRef?.current || []).map(s => s.toUpperCase()));

    // voice commands
    // COMMANDS FOR MODE.MOVIE
    const movieModeCommands = [
    {
        command: BOOK_CURRENT_ON_DAY_AT_TIME, // groups: 1=day, 2=time
        matchInterim: false,
        callback: (daySpoken, timeSpoken) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;

        const idx = movieIdxRef.current;
        if (idx === -1) {
            speak('No current movie selected.');
            logResult('Book current on DAY at TIME → ❌ no current selection');
            resetTranscript();
            return;
        }

        const time24 = normalizeTimeTo24h(timeSpoken);
        if (!time24) {
            speak('Time not recognized, could you repeat please?');
            logResult(`Book current on "${daySpoken}": time "${timeSpoken}" not recognized → ❌`);
            resetTranscript();
            return;
        }

        const dayClean = daySpoken ? sanitizeDayHeard(daySpoken) : null;
        handleTimeToSeat({ idx, time: time24, daySpoken: dayClean });
        })
    },
    {
        command: BOOK_CURRENT_AT_TIME_OPTIONAL_DAY, // groups: 1=time, 2=day?
        matchInterim: false,
        callback: (timeSpoken, maybeDay) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;

        const idx = movieIdxRef.current;
        if (idx === -1) {
            speak('No current movie selected.');
            logResult('Book current at TIME → ❌ no current selection');
            resetTranscript();
            return;
        }

        const time24 = normalizeTimeTo24h(timeSpoken);
        if (!time24) {
            speak('Time not recognized, could you repeat please?');
            logResult(`Book current at: time "${timeSpoken}" not recognized → ❌`);
            resetTranscript();
            return;
        }

        const dayClean = maybeDay ? sanitizeDayHeard(maybeDay) : null;
        handleTimeToSeat({ idx, time: time24, daySpoken: dayClean });
        })
    },
    {
    // "book current [at 9pm]" / "book current selection at 21:00" / "book current movie"
    command: BOOK_CURRENT_OPTIONAL_TIME,
    matchInterim: false,
    callback: (timeSpoken) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;

        if (!gestureMode) {
            speak('Enable the camera to select movies with your hand');
            logResult('Book current → ❌ gesture mode disabled');
            resetTranscript();
            return;
        }

        const idx = movieIdxRef.current;
        if (idx === -1) {
            speak('No current movie selected.');
            logResult('Book current → ❌ no current selection');
            resetTranscript();
            return;
        }

        // se NON c'è orario → vai alla selezione dell’orario per il film corrente
        if (!timeSpoken) {
            setMovieIndex(idx);
            resetTimeMode();
            speak(`Choose a time for ${movies[idx].title}`);
            logResult(`Book current "${movies[idx].title}" → ▶ time selection`);
            resetTranscript();
            return;
        }

        // se c'è orario → prova ad andare direttamente a SEAT (riusa handleTimeToSeat)
        const time24 = normalizeTimeTo24h(timeSpoken);
        if (!time24) {
            speak(`Time not recognized, could you repeat please?`);
            logResult(`Book current: time "${timeSpoken}" not recognized → ❌`);
            resetTranscript();
            return;
        }

        handleTimeToSeat({ idx, time: time24, daySpoken: null });
        })
    },
    {
        // TIME first: "select 9 pm on monday for movie ..."
        command: TIME_FIRST_CMD,
        matchInterim: false,
        callback: (timeSpoken, daySpoken, movieSpoken) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;
        const time24 = normalizeTimeTo24h(timeSpoken);
        const idx    = findMovieIndexByQuery(movies, movieSpoken);
        handleTimeToSeat({ idx, time: time24, daySpoken });
        })
    },
    {
        // MOVIE on DAY at TIME: "book Lilo & Stitch on 15th June at 21"
        command: MOVIE_ON_DAY_AT_TIME,
        matchInterim: false,
        callback: (movieSpoken, daySpoken, timeSpoken) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;
        const time24 = normalizeTimeTo24h(timeSpoken);
        const idx    = findMovieIndexByQuery(movies, movieSpoken);
        handleTimeToSeat({ idx, time: time24, daySpoken });
        })
    },
    {
        // MOVIE at TIME [on DAY?]: "select Lilo & Stitch at time 9pm on 15th June"
        command: MOVIE_AT_TIME_OPTIONAL_DAY,
        matchInterim: false,
        callback: (movieSpoken, timeSpoken, daySpoken) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;
        const time24 = normalizeTimeTo24h(timeSpoken);
        const idx    = findMovieIndexByQuery(movies, movieSpoken);
        handleTimeToSeat({ idx, time: time24, daySpoken });
        })
    },
    {
        // SEARCH movie: "search movie ..."
        command: MOVIE_CMD_REGEX,
        matchInterim: false,
        callback: (query) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;

        const idx = findMovieIndexByQuery(movies, query);
        if (idx !== -1) {
            setMovieIndex(idx);
            setVoiceMode(true);
            speak(`Found movie: ${movies[idx].title}`);
            logResult(`Looked for "${query}" → ✅ Found`);
        } else {
            speak('Movie not found, could you repeat please?');
            logResult(`Looked for "${query}" → ❌ Not Found`);
        }
        resetTranscript();
        })
    },
    {
        // BOOK without time indication: "book Albatross" / "book movie Albatross" / "... on 15th June" -> time selection mode
        command: BOOK_NO_TIME_CMD,
        matchInterim: false,
        callback: (movieSpoken, daySpoken) => runOnce(() => {
        if (modeRef.current !== MODE.MOVIE) return;

        const idx = findMovieIndexByQuery(movies, movieSpoken);
        if (idx === -1) {
            speak('Movie not found, could you repeat please?');
            logResult(`Book "${movieSpoken}" ${daySpoken ? `on "${daySpoken}" ` : ''}→ ❌ movie not found`);
            resetTranscript();
            return;
        }

        setMovieIndex(idx);

        resetTimeMode();

        speak(`Choose a time for ${movies[idx].title}`);
        logResult(`Book "${movieSpoken}" ${daySpoken ? `on "${daySpoken}" ` : ''}→ ▶ time selection`);
        resetTranscript();
        })
    },
    
    ];

    // COMMANDS FOR MODE.TIME
    const timeModeCommands = [
    {
        // BACK in time selection
        command: GO_BACK_CMD,
        matchInterim: false,
        callback: () => runOnce(() => {
            if (modeRef.current !== MODE.TIME) return;
                resetMovieMode();
                speak('Going back to movie selection.');
                logResult('↩ back → ▶ movie selection');
                resetTranscript();
        })
    },
    {
        // TIME-ONLY (optional day) in MODE.TIME
        command: TIME_ONLY_CMD,
        matchInterim: false,
        callback: (timeSpoken, daySpoken) => runOnce(() => {
            if (modeRef.current !== MODE.TIME) return;
            const idx = movieIdxRef.current
            if (idx === -1) { 
                speak('No movie selected yet.'); 
                logResult('Time-only → ❌ no movie selected'); 
                resetTranscript(); 
            return; 
            }
        const time24 = normalizeTimeTo24h(timeSpoken);
        const dayClean = daySpoken ? sanitizeDayHeard(daySpoken) : null;
        handleTimeToSeat({ idx, time: time24, daySpoken: dayClean });
        })
    },
    {
        // DAY then TIME (no movie)
        command: DAY_AT_TIME_NO_MOVIE,
        matchInterim: false,
        callback: (daySpoken, timeSpoken) => runOnce(() => {
            if (modeRef.current !== MODE.TIME) return;
            const idx = movieIdxRef.current
            if (idx === -1) { 
                speak('No movie selected yet.'); 
                logResult('Day+time → ❌ no movie selected'); 
                resetTranscript(); 
            return; 
            }
            const time24 = normalizeTimeTo24h(timeSpoken);
            const dayClean = daySpoken ? sanitizeDayHeard(daySpoken) : null;
            handleTimeToSeat({ idx, time: time24, daySpoken: dayClean });
        })
    }
    ]

    // COMMANDS FOR MODE.SEAT
    const seatModeCommands = [
    // GO BACK DEFAULT (to TIME)
    {
        command: GO_BACK_CMD,
        matchInterim: false,
        callback: () => runOnce(() => {
            if (modeRef.current !== MODE.SEAT) return;
            speak('Going back to time selection.');
            logResult('↩ back → ▶ time selection');
            resetTimeMode();
            resetTranscript();
    })
    },
    // ---- GO BACK → MOVIE ----
    {
        command: GO_BACK_MOVIE_CMD,
        matchInterim: false,
        callback: () => runOnce(() => {
            if (modeRef.current !== MODE.SEAT) return;
            speak('Going back to movie selection.');
            logResult('↩ back → ▶ movie selection');
            resetMovieMode();
            resetTranscript();
        })
    },

    // ---- GO BACK → TIME ----
    {
        command: GO_BACK_TIME_CMD,
        matchInterim: false,
        callback: () => runOnce(() => {
            if (modeRef.current !== MODE.SEAT) return;
            speak('Going back to time selection.');
            logResult('↩ back → ▶ time selection');
            resetTimeMode();
            resetTranscript();
        })
    },

    // ---- SELECT SEATS ----
    {
        command: SELECT_SEATS_CMD,
        matchInterim: false,
        callback: (seatsGroup) => runOnce(() => {
            if (modeRef.current !== MODE.SEAT) return;

            const wanted = parseSeatList(seatsGroup);
            const selectedSet = getSelectedSet();

            const toAdd = [];
            const skipped = [];

            for (const code of wanted) {
                if (!validSeatSet.has(code)) { skipped.push(`${code} (not exists)`); continue; }
                if (occupiedSet.has(code))   { skipped.push(`${code} (occupied)`);   continue; }
                if (selectedSet.has(code))   { skipped.push(`${code} (already selected)`); continue; }
                toAdd.push(code);
            }

            if (toAdd.length) {
                onSeatSelect?.({ type: 'select', seats: toAdd });
                const extra = skipped.length ? ` | Skipped: ${skipped.join(', ')}` : '';
                speak(`Selected ${toAdd.join(', ')}`);
                logResult(`🎟️ Selected: ${toAdd.join(', ')}${extra}`);
            } else {
                speak('No seats could be selected, please repeat.');
                logResult('❌ No seats could be selected. Please repeat the command.');
            }
            resetTranscript();
        })
    },

    // ---- DESELECT SEATS ----
    {
        command: DESELECT_SEATS_CMD,
        matchInterim: false,
        callback: (seatsGroup) => runOnce(() => {
            if (modeRef.current !== MODE.SEAT) return;

            const wanted = parseSeatList(seatsGroup);
            const selectedSet = getSelectedSet();

            // console.log("selectedSet:", selectedSet);
            // console.log("validSeatSet:", validSeatSet);
            // console.log("wanted", wanted);
            // console.log("currentLayout", currentLayout);

            const toRemove = [];
            const notFound = [];

            for (const code of wanted) {
                if (!validSeatSet.has(code)) { notFound.push(`${code} (not exists)`); continue; }
                if (selectedSet.has(code)) toRemove.push(code);
                else notFound.push(`${code} (not selected)`);
            }

            if (toRemove.length) {
                onSeatSelect?.({ type: 'deselect', seats: toRemove });
                const extra = notFound.length ? ` | Skipped: ${notFound.join(', ')}` : '';
                speak(`Removed ${toRemove.join(', ')}`);
                logResult(`🗑️ Deselected: ${toRemove.join(', ')}${extra}`);
            } else {
                speak('No matching seats to deselect, please repeat.');
                logResult('⚠️ No matching seats to deselect. Please repeat the command.');
            }
            resetTranscript();
        })
    },

    // ---- CONFIRM ----
    {
        command: CONFIRM_CMD,
        matchInterim: false,
        callback: () => runOnce(() => {
            if (modeRef.current !== MODE.SEAT) return;
            speak('Seats confirmed. Showing booking summary.');
            logResult('✅ Seats confirmed → ▶ booking summary');

            const total = Number(totalPriceRef?.current) || 0;

            if (typeof goToBookingSummary === 'function') {
                goToBookingSummary(total);
            } else {
                setMode(MODE.BOOKING_SUMMARY);
            }
            resetTranscript();
        })
    },
    ];

    // COMMANDS FOR MODE.BOOKING_SUMMARY
    const bookingSummaryCommands = [
        // ---- GO BACK (DEFAULT SEAT MODE) ----
        {
        command: GO_BACK_CMD,
        matchInterim: false,
        callback: () => runOnce(() => {
            if (modeRef.current !== MODE.BOOKING_SUMMARY) return;
            speak('Going back to seat selection.');
            logResult('↩ back → ▶ seat selection');
            setMode(MODE.SEAT);
            setSeatPos({row: null, col: null});
            resetTranscript();
        })
        },
        // ---- GO BACK → SEAT ----
        {
            command: GO_BACK_SEAT_CMD,
            matchInterim: false,
            callback: () => runOnce(() => {
                if (modeRef.current !== MODE.BOOKING_SUMMARY) return;
                speak('Going back to seat selection.');
                logResult('↩ back → ▶ seat selection');
                setMode(MODE.SEAT);
                setSeatPos({row: null, col: null});
                resetTranscript();
            })
        },
        // ---- GO BACK → TIME ----
        {
            command: GO_BACK_TIME_CMD,
            matchInterim: false,
            callback: () => runOnce(() => {
                if (modeRef.current !== MODE.BOOKING_SUMMARY) return;
                speak('Going back to time selection.');
                logResult('↩ back → ▶ time selection');
                resetTimeMode();
                resetTranscript();
            })
        },
        // ---- GO BACK → MOVIE ----
        {
            command: GO_BACK_MOVIE_CMD,
            matchInterim: false,
            callback: () => runOnce(() => {
                if (modeRef.current !== MODE.BOOKING_SUMMARY) return;
                speak('Going back to movie selection.');
                logResult('↩ back → ▶ movie selection');
                resetMovieMode();
                resetTranscript();
            })
        },

        // ---- CONFIRM ----
        {
            command: CONFIRM_CMD,
            matchInterim: false,
            callback: () => runOnce(() => {
                if (modeRef.current !== MODE.BOOKING_SUMMARY) return;
                speak('Booking confirmed. Demo end modal displayed.');
                logResult('✅ Booking confirmed → ▶ demo ends');

                handleBookingSummaryConfirm();
                resetTranscript();
            })
        },
    ]

    var currentCommands = []
    if(modeRef.current === MODE.MOVIE) {
        currentCommands = movieModeCommands;
    } else if(modeRef.current === MODE.TIME) {
        currentCommands = timeModeCommands;
    } else if(modeRef.current === MODE.SEAT) {
        currentCommands = seatModeCommands;
    } else if(modeRef.current === MODE.BOOKING_SUMMARY) {
        currentCommands = bookingSummaryCommands;
    }

    const commands = currentCommands;

    // speak synthesis
    const speak = (text) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
    };
    // we initialize now speech recognition
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition({ commands });

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) return;

        const onKeyDown = e => {
        if (e.code === 'Space') {
            e.preventDefault();
            SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
        }
        };
        const onKeyUp = e => {
        if (e.code === 'Space') {
            SpeechRecognition.stopListening();
            resetTranscript();
        }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        };
    }, [browserSupportsSpeechRecognition, resetTranscript]);

    // reset voice mode
    const resetVoiceMode = () => setVoiceMode(false);

    return {
        transcript,
        listening,
        voiceMode,
        resetTranscript,
        resetVoiceMode,
        browserSupportsSpeechRecognition,
        voiceLog,
        speak
    };

    // normalizes a spoken query with norm() and tries to find a movie index from it
    function findMovieIndexByQuery(movies, query) {
        const normalizedQuery = norm(query);
        return movies.findIndex(m => {
            const titleMap = [m.title, ...(m.altTitles || [])].map(norm);
            return titleMap.some(h => h.includes(normalizedQuery));
        });
    }

    // handles time recognition in english, for example 21:00 .. 21 .. 9pm are accepted
    function normalizeTimeTo24h(input) {
        const s = String(input || '').trim().toLowerCase();
        let m = s.match(/^([01]?\d|2[0-3])([0-5]\d)$/);
        if (m) return `${m[1].padStart(2,'0')}:${m[2]}`;       

        // 24h minutes included: 21:00 / 7.05
        m = s.match(/^([01]?\d|2[0-3])[:.](\d{2})$/);
        if (m) return `${m[1].padStart(2,'0')}:${m[2]}`;

        // 24h minutes excluded: 21 / 7 / 21h
        m = s.match(/^([01]?\d|2[0-3])(?:\s*h)?$/);
        if (m) return `${m[1].padStart(2,'0')}:00`;

        // 12h with/without minutes: 9 pm / 9:15pm / 12 am
        m = s.match(/^([0]?\d|1[0-2])(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)$/);
        if (m) {
            let h = parseInt(m[1], 10);
            const min = m[2] || '00';
            const ampm = m[3][0]; // 'a' o 'p'
            if (ampm === 'a') { if (h === 12) h = 0; }
            else { if (h !== 12) h += 12; }
            return `${String(h).padStart(2,'0')}:${min}`;
        }
        return null; // not recognized otherwise
    }

    function findRowsForTime(shows, time) {
    const rows = [];
    for (let r = 0; r < shows.length; r++) {
        const hasTime = (shows[r].times || []).some(t => {
        const { timeStr } = readTimeEntry(t);   // <<— usa helper passato via props
        return timeStr === time;
        });
        if (hasTime) rows.push(r);
    }
    return rows;
    }

    // handles transition from movie mode to seat or time mode via voice
    // there are multiple cases handled
    async function handleTimeToSeat({ idx, time, daySpoken }) {
        if (idx === -1) {
            speak('Movie not found, could you repeat please?');
            logResult(`Time cmd: movie not found → ❌`);
            resetTranscript();
            return;
        }
        if (!time) {
            speak('Time not recognized, could you repeat please?');
            logResult(`Time cmd: time not recognized → ❌`);
            resetTranscript();
            return;
        }

        // select movie
        setMovieIndex(idx);

        const shows = movies[idx].showtimes || [];

        // -------------------------
        // Case A: user says also Day
        // -------------------------
        if (daySpoken) {
            const dayHeard = sanitizeDayHeard(daySpoken);

            // find row that matches day and contains time
            let row = -1;
            for (let r = 0; r < shows.length; r++) {
                const dayStr = shows[r].day || "";
                if (dayMatchesNormalizedDay(dayStr, dayHeard)) {
                    // inside row find the entry at that time
                    const col = (shows[r].times || []).findIndex(
                    t => readTimeEntry(t).timeStr === time
                    );
                    if (col !== -1) { row = r; break; }
                }
            }

            if (row === -1) {
                speak(`Time ${time} not available on ${dayHeard} for ${movies[idx].title}`);
                logResult(`Time "${time}" on "${dayHeard}" for "${movies[idx].title}" → ❌ not available`);
                resetTranscript();
                return;
            }

            const chosenDay = shows[row].day;
            // fetch exact entry to extract screeningId and roomId
            const col = (shows[row].times || []).findIndex(
            t => readTimeEntry(t).timeStr === time
            );
            const { timeStr, screeningId, roomId } = readTimeEntry(shows[row].times[col]);

            // update UI
            setDay(chosenDay);
            setHour(timeStr);

            // load layout: if we alreadt have screeningId/roomId, we can avoid resolveLayout call
            try {
                if (typeof resolveLayout === 'function') {
                    await resolveLayout(movies[idx].title, chosenDay, timeStr, screeningId, roomId);
                }
            } catch (e) {
                console.warn('Voice resolveLayout failed, using local layout:', e);
            }

            resetSeatMode();
            speak(`Selected ${timeStr} on ${chosenDay} for ${movies[idx].title}`);
            logResult(`Time "${timeStr}" on "${chosenDay}" for "${movies[idx].title}" → ✅ seat mode`);
            resetTranscript();
            return;
        }

        // -------------------------
        // Case B: no day has been told
        // -------------------------
        const rowsWithTime = findRowsForTime(shows, time); // row array with that chosen time

        if (rowsWithTime.length === 0) {
            speak(`Time ${time} not available for ${movies[idx].title}`);
            logResult(`Time "${time}" for "${movies[idx].title}" → ❌ not available`);
            resetTranscript();
            return;
        }

        if (rowsWithTime.length > 1) {
            // mode days have the same time ask for the day (MODE.TIME)
            resetTimeMode();
            const daysList = rowsWithTime.map(r => shows[r].day).join(', ');
            speak(`Multiple days have ${time} for ${movies[idx].title}. Please choose a day.`);
            logResult(`Time "${time}" for "${movies[idx].title}" on multiple days: ${daysList} → ▶ time selection`);
            resetTranscript();
            return;
        }

        // only one day → fetch that row
        const onlyRow = rowsWithTime[0];
        const chosenDay = shows[onlyRow].day;

        // find the entry of the time in that row and read id/room
        const col = (shows[onlyRow].times || []).findIndex(
            t => readTimeEntry(t).timeStr === time
        );
        const { timeStr, screeningId, roomId } = readTimeEntry(shows[onlyRow].times[col]);

        // update UI
        setDay(chosenDay);
        setHour(timeStr);

        // load grid layout (faster if we have already the screeningId)
        try {
            if (typeof resolveLayout === 'function') {
            await resolveLayout(movies[idx].title, chosenDay, timeStr, screeningId, roomId);
            }
        } catch (e) {
            console.warn('Voice resolveLayout failed, using local layout:', e);
        }

        resetSeatMode();
        speak(`Selected ${timeStr} on ${chosenDay} for ${movies[idx].title}`);
        logResult(`Time "${timeStr}" on "${chosenDay}" for "${movies[idx].title}" → ✅ seat mode`);
        resetTranscript();
    }

    // removes spurious items/words that the STT sometimes inserts before the date
    function sanitizeDayHeard(s = "") {
        return String(s)
            .replace(/^\s*(?:us\s+)?(?:a|the)\s+/i, "") // "us a 16th June" -> "16th June" | "the 15 June" -> "15 June"
            .trim();
    }

    // normalizes text of day (15th -> 15, "of" is removed, month abbreviation, removes spaces and punctuations)
    function normalizeDayText(s = "") {
        let t = norm(s)
            .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1") // 15th -> 15
            .replace(/\bof\b/g, "")                        // "15 of june" -> "15 june"
            .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunedi|lunedì|martedi|martedì|mercoledi|mercoledì|giovedi|giovedì|venerdi|venerdì|sabato|domenica)\b/gi, "")
            .replace(/[,]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const monthMap = {
            jan: "january", feb: "february", mar: "march", apr: "april",
            may: "may", jun: "june", jul: "july", aug: "august",
            sep: "september", sept: "september",
            oct: "october", nov: "november", dec: "december"
        };
        t = t.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi, m => monthMap[m.toLowerCase()]);
        return t;
    }

    // flexible comparison: A contains B or B contains A after normalization
    function dayMatchesNormalizedDay(a, b) {
        const A = normalizeDayText(a);
        const B = normalizeDayText(b);
        return A.includes(B) || B.includes(A);
    }

    // this function is used to avoid the possibility (bug) of multiple commands at once
    // this is necessary since multiple commands can have the same verb and similar words
    function runOnce(fn) {
        if (handlingRef.current) return;
        handlingRef.current = true;
        try { fn(); } finally {
            // small cooldown to avoid to come from the same sentence
            setTimeout(() => { handlingRef.current = false; }, 250);
        }
    }
}