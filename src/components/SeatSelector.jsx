import React, { useEffect, useMemo } from 'react';

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
  cameraActive,
  selectedDay,
  currency,
  pricePerSeatNormal = 10,
  pricePerSeatWednesday = 5,
  onTotalPriceChange,
  totalPriceRef
}) {
    const occupiedSet = new Set(occupied);
    const selectedSet = new Set(selected);

    const rows = layout.length;
    const cols = layout[0]?.length || 0;

    // fixed columns for back and confirm button
    const backColIndex    = 3;
    const confirmColIndex = 4;

    const base = "w-16 h-12 flex items-center justify-center text-sm font-medium rounded-sm transition";

    // special business case wednesday
    const dn = (selectedDay || "").toLowerCase();
    const isWednesday = dn.includes("wednesday");

    const unitPrice = isWednesday ? pricePerSeatWednesday : pricePerSeatNormal;
    
    // calculate total price every time seats change
    const totalPrice = useMemo(() => {
      return selected.length * unitPrice;
    }, [selectedSet]);

    // notify parent (ref + state) when total changes
    useEffect(() => {
      onTotalPriceChange?.(totalPrice);
      // ref update from child
      if (totalPriceRef) totalPriceRef.current = totalPrice;
    }, [totalPrice, onTotalPriceChange, totalPriceRef]);

    // handler for confirm button
    const handleConfirm = () => {
      if (selected.length === 0) return;
      if(gestureMode || voiceMode) return;
      onConfirm?.(totalPrice); // passa il totale “vero” al parent
    };

  return (
    // wrapper per centrare la grid
      <div className="relative mx-auto max-w-screen-xl px-4">
          {cameraActive && (
            <p className="text-center text-gray-700 text-base md:text-base mb-3">
              Move through seats using index finger 👆👇👈👉, use 👌 gesture to select a seat<br/>
              Use 🖐️ gesture to deselect previously selected seat. Once done, use 👌 gesture on <em>Confirm</em> button to confirm your choice or use it on <em>Go back</em> button to go back to time selection.
            </p>
          )}
          {/* Riga sempre visibile */}
          <div className="mt-2 mb-3 w-full text-center text-500">
            ----- The screen is here -----
          </div>

          <div className="flex justify-center">
            <div
              className="grid gap-2 w-fit"
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
              onClick={!gestureMode && !voiceMode ? onBack : undefined}
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
              onClick={handleConfirm}
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
        {/* DESTRA: colonna prezzi (10rem = 40 * 0.25rem = w-40) */}
        <div className="hidden md:flex flex-col gap-3 w-30 md:absolute md:left-full md:top-20 md:ml-6">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Price / seat</p>
            <p className="text-sm font-semibold">
              {unitPrice.toFixed(2)} {currency}
              {isWednesday && <span className="ml-1 text-green-700 font-normal">(Wednesday deal)</span>}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Selected</p>
            <p className="text-sm font-medium">{selected.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
            <p className="text-sm font-bold">{totalPrice.toFixed(2)} {currency}</p>
          </div>
        </div>
      </div>
  );
}