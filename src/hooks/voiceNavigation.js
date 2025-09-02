import { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { MODE } from "../constants/modes";

// regex patterns for voice mode
const MOVIE_CMD_REGEX = /^(?:search|find|look for|locate|get)\s+(?:me\s+)?(?:(?:a|the)\s+)?(?:movie\s+)?(?:(?:called|named)(?:\s+as)?\s+)?(.+)$/i;

// groups: 1=movie, 2=time, 3=day (optional)
export const MOVIE_AT_TIME_OPTIONAL_DAY =
/^(?:choose|select|pick|set|book|reserve)\s+(?:a|the\s+)?(?:movie\s+)?(.+?)\s+(?:after|at\s+(?:time\s+)?)((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))(?:\s+on\s+(.+))?$/i

// groups: 1=movie, 2=day, 3=time
const MOVIE_ON_DAY_AT_TIME =
/^(?:choose|select|pick|set|book|reserve)\s+(?:a|the\s+)?(?:movie\s+)?(.+?)\s+on\s+(.+?)\s+(?:after|at\s+)?((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))$/i;

// groups: 1=time, 2=day (optional), 3=movie
const TIME_FIRST_CMD =
/^(?:choose|select|pick|set|book|reserve)\s+(?:a|the\s+)?(?:time\s+)?((?:[01]?\d|2[0-3])[:.][0-5]\d|(?:[01]?\d|2[0-3])(?:\s*h)?|(?:0?\d|1[0-2])(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?))(?:\s+on\s+(.+?))?\s+(?:for\s+)?(?:the\s+)?(?:movie\s+)?(.+)$/i

// time selection regex
const BOOK_NO_TIME_CMD =
/^(?:book|reserve|schedule|set|choose|select)\s+(?:a|the\s+)?(?:movie\s+)?(.+?)(?:\s+on\s+(.+))?$/i;

export default function useVoiceNavigation({
    modeRef,
    movies,
    setMovieIndex, // needed for command "search movie"
    setDay,
    setHour,
    resetSeatMode,
    setMode,
    setTimePos
    }) {
    const [voiceMode, setVoiceMode] = useState(false);

    // voice log
    const [voiceLog, setVoiceLog] = useState([]);
    const logResult = (message) => setVoiceLog(prev => [...prev.slice(-1), `🗣️ ${message}`]);

    const handlingRef = useRef(false);

    const norm = (s = "") =>
        s
        .toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")    // accents removal
        .replace(/[’'".,;:!?()\-–—_]/g, " ")                // cleaned punctuation
        .replace(/\s+/g, " ")                               // multiple spaces -> one space
        .trim();

    // voice commands
    const commands = [
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

        setMode(MODE.TIME);
        setTimePos({ row: null, col: null });

        speak(`Choose a time for ${movies[idx].title}`);
        logResult(`Book "${movieSpoken}" ${daySpoken ? `on "${daySpoken}" ` : ''}→ ▶ time selection`);
        resetTranscript();
        })
    }
    ];

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

        // 24h minutes included: 21:00 / 7.05
        let m = s.match(/^([01]?\d|2[0-3])[:.](\d{2})$/);
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
            if ((shows[r].times || []).includes(time)) rows.push(r);
        }
        return rows;
    }

    // handles transition from movie mode to seat or time mode via voice
    // there are multiple cases handled
    function handleTimeToSeat({ idx, time, daySpoken }) {
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

        // movie selection
        setMovieIndex(idx);

        const shows = movies[idx].showtimes || [];
        const dayNorm = daySpoken ? norm(daySpoken) : null;

        // if day has been told try to match day + time
        if (dayNorm) {
            let row = -1;
            for (let r = 0; r < shows.length; r++) {
            const dayStr = norm(shows[r].day || "");
            if (dayStr.includes(dayNorm) && (shows[r].times || []).includes(time)) {
                row = r; break;
            }
            }
            if (row === -1) {
                speak(`Time ${time} not available on ${daySpoken} for ${movies[idx].title}`);
                logResult(`Time "${time}" on "${daySpoken}" for "${movies[idx].title}" → ❌ not available`);
                resetTranscript();
                return;
            }
            // day specified valid -> go to seat selection
            setDay(shows[row].day);
            setHour(time);
            resetSeatMode();
            speak(`Selected ${time} on ${shows[row].day} for ${movies[idx].title}`);
            logResult(`Time "${time}" on "${shows[row].day}" for "${movies[idx].title}" → ✅ seat mode`);
            resetTranscript();
            return;
        }

        // Day not told, check how many rows have that time
        const rowsWithTime = findRowsForTime(shows, time);

        if (rowsWithTime.length === 0) {
            speak(`Time ${time} not available for ${movies[idx].title}`);
            logResult(`Time "${time}" for "${movies[idx].title}" → ❌ not available`);
            resetTranscript();
            return;
        }

        if (rowsWithTime.length > 1) {
            // if the same time is found on more than one day go to time selection
            setMode(MODE.TIME);
            setTimePos({ row: null, col: null });

            const daysList = rowsWithTime.map(r => shows[r].day).join(', ');
            speak(`Multiple days have ${time} for ${movies[idx].title}. Please choose a day.`);
            logResult(`Time "${time}" for "${movies[idx].title}" found on multiple days: ${daysList} → ▶ time selection`);
            resetTranscript();
            return;
        }

        // if the time is only present on one single row we can choose that one safely and go to seat mode
        const onlyRow = rowsWithTime[0];
        setDay(shows[onlyRow].day);
        setHour(time);
        resetSeatMode();
        speak(`Selected ${time} on ${shows[onlyRow].day} for ${movies[idx].title}`);
        logResult(`Time "${time}" on "${shows[onlyRow].day}" for "${movies[idx].title}" → ✅ seat mode`);
        resetTranscript();
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