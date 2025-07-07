import React from 'react';

export default function SeatSelector({
  layout = [], 
  occupied = [], 
  selected = [], 
  focused = { row: null, col: null },
  onSelect,
  onBack,
  onConfirm,
  gestureMode,
  voiceMode,
  cameraActive
}) {
    const occupiedSet = new Set(occupied);
    const selectedSet = new Set(selected);

    const rows = layout.length;
    const cols = layout[0]?.length || 0;

    // fixed columns for back and confirm button
    const backColIndex    = 3;
    const confirmColIndex = 4;

    const base = "w-16 h-12 flex items-center justify-center text-sm font-medium rounded-sm transition";

  return (
    // wrapper per centrare la grid
    <div className="flex flex-col items-center">
        {cameraActive && (
          <p className="text-center text-gray-700 text-base md:text-base mb-3">
            Move through seats using index finger 👆👇👈👉, use 👌 gesture to select a seat<br/>
            Use 🖐️ gesture to deselect previously selected seat. Once done, use 👌 gesture on <em>Confirm</em> button to confirm your choice or use it on <em>Go back</em> button to go back to time selection.
          </p>
        )}

        {/* Riga sempre visibile */}
        <div className="mt-2 w-80 mb-3 text-center text-500">

          ----- The screen is here -----
        </div>
        <div className="flex justify-center">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, 4rem)` }}
        >

          {/** —— Righe dei posti —— **/}
          {layout.flatMap((rowArr, r) =>
            rowArr.map((seat, c) => {
              const key = `seat-${r}-${c}`;
              if (seat == null) return <div key={key} />;

              const isOcc = occupiedSet.has(seat);
              const isSel = selectedSet.has(seat);
              const isFoc = focused.row === r && focused.col === c;

              let variant;
              if (isOcc) {
                variant = 'bg-gray-500 cursor-not-allowed text-gray-200';
              } else if (isSel && isFoc && gestureMode) {
                variant = 'bg-blue-700 text-white ring-4 ring-yellow-400';
              } else if (isSel) {
                variant = 'bg-blue-500 text-white';
              } else if (isFoc && gestureMode) {
                variant = 'bg-white text-gray-800 ring-4 ring-yellow-400';
              } else {
                variant = 'bg-gray-200 hover:bg-gray-300 text-gray-800';
              }

              return (
                <button
                  key={key}
                  disabled={isOcc}
                  onClick={() => {
                    if(!gestureMode && !voiceMode) {
                     onSelect({ row: r, col: c, seat }) 
                    }
                  }
                  }
                  className={`${base} ${variant}`}
                >
                  {seat}
                </button>
              );
            })
          )}

                    {/* celle vuote fino alla colonna di “Indietro” */}
          {Array.from({ length: backColIndex }).map((_, idx) => (
            <div key={`pad-before-${idx}`} />
          ))}

          {/* Bottone Indietro */}
          <button
            key="back-btn"
            onClick={onBack}
            className={`
              ${base}
              ${focused.row === rows && focused.col === backColIndex
                ? 'bg-red-600 text-white ring-4 ring-yellow-400'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}
            `}
          >
            Go Back
          </button>

          {/* Bottone Conferma */}
          <button
            key="confirm-btn"
            onClick={selected.length ? onConfirm : undefined}
            disabled={selected.length === 0}
            className={`
              ${base}
              ${focused.row === rows && focused.col === confirmColIndex
                ? selected.length
                  ? 'bg-green-600 text-white ring-4 ring-yellow-400'
                  : 'bg-gray-200 text-gray-400'
                : selected.length
                  ? 'bg-gray-200 hover:bg-green-600 hover:text-white text-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Confirm
          </button>

          {/* celle vuote per il resto */}
          {Array.from({ length: cols - confirmColIndex - 1 }).map((_, idx) => (
            <div key={`pad-after-${idx}`} />
          ))}

        </div>
      </div>
    </div>
  );
}