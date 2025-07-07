import React from 'react';

export default function TimeSelector({
  showtimes,
  timePos,
  onSelectTime,
  selectedImage,
  maxCols,
  onBack,
  cameraActive,
  gestureMode,
  voiceMode
}) {
  const extraRowIndex = showtimes.length; // last index used for "go back" button

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {cameraActive && (
        <p className="text-center text-gray-700 text-lg md:text-base mb-3">
            Move through times using index finger 👆👇👈👉, use 👌 gesture to select a time<br/>
            When over <em>"go back to movies"</em>, use 👌 gesture to go back
      </p>
      )}
      <div className="w-full flex justify-center">
        <div className="flex w-full max-w-4xl gap-8 items-start">
          
          {/* Poster at left side */}
          <div className="flex-shrink-0 w-1/2 overflow-hidden rounded-lg shadow-lg">
            <img
              src={selectedImage}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>

          {/* Times at right side */}
          <div className="flex-1 flex flex-col items-start">
            
            {/* Day + time grid */}
            <div className="space-y-8 w-full">
              {showtimes.map((show, row) => (
                <div key={row}>
                  {/* Testo giorno */}
                  <p className="font-semibold text-lg mb-2">
                    {show.day}:
                  </p>

                  {/* Inline-grid alingend to left side */}
                  <div
                    className="inline-grid gap-4 justify-items-start"
                    style={{
                      gridTemplateColumns: `repeat(${maxCols + 1}, 6rem)`
                    }}
                  >
                    {show.times.map((t, col) => {
                      const isFocused =
                        timePos.row === row && timePos.col === col;
                      return (
                        <button
                          key={col}
                          onClick={() => onSelectTime({ row, col })}
                          className={`
                            px-8 py-4 rounded-full text-base font-medium transition border-2
                            ${isFocused
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-transparent text-gray-800 border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600'
                            }
                          `}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>


            {/* Riga aggiuntiva per il bottone Back */}
            <div
              className="inline-grid gap-4 justify-items-start mt-8"
              style={{ gridTemplateColumns: `auto repeat(${maxCols}, 6rem)` }}
            >
              {(() => {
                // focus sul pulsante Back
                const isFocusedBack = timePos.row === extraRowIndex && timePos.col === 0;
                return (
                  <button
                    onClick={() => {
                      if(!gestureMode && !voiceMode) {
                        onBack();
                      }
                    }}
                    className={`
                      px-8 py-4 rounded-full text-base font-medium transition border-2 whitespace-nowrap
                      ${isFocusedBack
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-gray-200 border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600'
                      }
                    `}
                  >
                    Go back to movies
                  </button>
                );
              })()}

              {/* celle vuote per mantenere allineamento */}
              {Array.from({ length: maxCols }).map((_, idx) => (
                <div key={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}