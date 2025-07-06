import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { MODE } from "../constants/modes";

// TODO update regex "find moviename"
const MOVIE_CMD_REGEX = /^(?:search|find|look for|locate|get)\s+(?:a\s+|the\s+)?movie(?:\s+(?:called|named)(?:\s+as)?)?\s+(.+)$/i;

// (potresti definire qui altre regex per time/seat, se vuoi)
export default function useVoiceNavigation({
    modeRef,
    movies,
    setMovieIndex, // needed for command "search movie"
    speak
    }) {
    const [voiceMode, setVoiceMode] = useState(false);

    // voice log
    const [voiceLog, setVoiceLog] = useState([]);
    const logResult = (message) => setVoiceLog(prev => [...prev, `🗣️ ${message}`]);

    // voice commands
    const commands = [
    {
        // search movie
        command: MOVIE_CMD_REGEX,
        callback: movieName => {
        if (modeRef.current !== MODE.MOVIE) return;
        const idx = movies.findIndex(m =>
            m.title.toLowerCase().includes(movieName.toLowerCase())
        );
        if (idx !== -1) {
            setMovieIndex(idx);
            setVoiceMode(true)
            speak(`Found movie: ${movies[idx].title}`);
            logResult(`Looked for "${movieName}" → ✅ Found`);
        } else {
            speak('Movie not found');
            logResult(`Looked for "${movieName}" → ❌ Not Found`);
        }
        }
    },
    // … TODO add timeCommands, seatCommands, gesture fallback, ecc.
    ];

    // we initialize now speech recognition
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition({ commands });

    // speech recognition now starts if we are in movie mode
    // TODO remove this part when introducing voice to time and seat navigation
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) return;
        if (modeRef.current === MODE.MOVIE) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        } else {
            SpeechRecognition.stopListening();
            resetTranscript();
        }
    }, [modeRef.current, browserSupportsSpeechRecognition]);

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
    voiceLog
    };
  
}