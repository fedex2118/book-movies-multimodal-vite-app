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
      <div className="text-center relative mt-0 mb-2 text-gray-600 text-m">
        🎙️ Microphone {listening ? 'On' : 'Off'} — press space bar to talk
      </div>

      {mode === MODE.MOVIE && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to find/book a movie: "find movie abc", "book movie xyz at time 15 on 16th September", "book xyz", ...
          You can also use voice and gestures together: "book current selection/movie at 9pm"
        </div>
      )}
      {mode === MODE.TIME && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to choose/select/pick/book the day and time: "choose Monday 15th June at 18", "book 18 on 19th October", ...
          Or say "go back" to go back to movie selection<br/>
          You can also use voice and gestures together: "choose current time/selection", "pick current time/selection", ...
        </div>
      )}
      {mode === MODE.SEAT && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to select/deselect seats: "select A1 E5", "deselect A1 and G4", ...
          Say "go back" to go back to time selection or say "go back to movie selection" to go back to movie selection<br/>
          If you want to confirm seats chosen you can say "confirm"<br/>
          You can also use voice and gestures together: "select current seat", "deselect current", "pick current and confirm", ...
        </div>
      )}
      {mode === MODE.BOOKING_SUMMARY && (
        <div className="mt-2 mb-4 w-full text-center text-gray-600 text-sm">
          🎤 Use voice to confirm booking: "confirm", "confirm booking", ...
          Otherwise say "go back", "go back to seat selection" to go back to seat selection
          or say "go back to time selection" if you rather want to choose another time.<br/>
          Lastly you can say "go back to movie selection" if you want to choose another movie
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