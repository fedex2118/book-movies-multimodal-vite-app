// src/components/VoiceControl.js
import React from 'react';
import PropTypes from 'prop-types';

import { MODE } from '../constants/modes';

/**
 * VoiceControl
 * Displays microphone status, transcript, and voice command logs.
 */
export default function VoiceControl({
  browserSupportsSpeechRecognition,
  listening,
  transcript,
  voiceLog,
  mode
}) {
  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="voice-control-container">
      {/* Microphone status */}
      <div className="text-center relative mt-1 mb-3 text-gray-600 text-lg">
        🎙️ Microphone {listening ? 'On' : 'Off'} — press space bar to talk
      </div>

      {mode === MODE.MOVIE && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to find/book a movie: "find movie abc", "book movie xyz at time 15 on 16th September", "book xyz", ...
        </div>
      )}
      {mode === MODE.TIME && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to choose/select/pick/book the day and time: "choose Monday 15th June at 18", "book 18 on 19th October", ...
          Or say "go back" to go back to movie selection
        </div>
      )}
      {mode === MODE.SEAT && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to select/deselect seats: "select A1 E5", "deselect A1 and G4", ...
          Say "go back" to go back to time selection or say "go back to movie selection" to go back to movie selection<br/>
          When ready to confirm choosen seats say "confirm"
        </div>
      )}
      {mode === MODE.BOOKING_SUMMARY && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 TODO
        </div>
      )}

      {/* Transcripted audio */}
      {transcript && (
        <div className="text-center mt-2 text-gray-500 text-sm">
          <em>{transcript}</em>
        </div>
      )}

      {/* Voice logs */}
      {voiceLog.length > 0 && (
        <div className="mt-4 text-left text-xs text-gray-600">
          <h4 className="font-semibold">Voice command log:</h4>
          <ul className="list-disc list-inside">
            {voiceLog.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

VoiceControl.propTypes = {
  browserSupportsSpeechRecognition: PropTypes.bool.isRequired,
  listening: PropTypes.bool.isRequired,
  transcript: PropTypes.string,
  voiceLog: PropTypes.arrayOf(PropTypes.string)
};

VoiceControl.defaultProps = {
  transcript: '',
  voiceLog: []
};