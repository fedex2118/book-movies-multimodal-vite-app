import React from "react";

export default function BookingSummary({
  movieTitle,
  selectedImage,
  selectedDay,
  selectedTime,
  selectedSeats = [],
  cinemaHall,
  totalPrice,
  currency = "€",
  onBack,
  onConfirm,
  cameraActive,
  gestureMode,
  voiceMode,
  bookingSummarySelectedIndex
}) {
  // Normalizes seats to a list of strings
  const formatSeat = (seat) => {
    if (seat == null) return "";
    if (typeof seat === "string") return seat;
    // tenta label, altrimenti row+number/col
    if (seat.label) return seat.label;
    const row = seat.row ?? "";
    const num = seat.number ?? seat.col ?? "";
    return `${row}${num}`;
  };

  const seatsList = selectedSeats.map(formatSeat).filter(Boolean);
  const seatsPretty =
    seatsList.length > 0 ? seatsList.join(", ") : "—";

  const base =
    "px-5 py-2 rounded-lg border transition outline-none focus:ring-2 focus:ring-red-400";

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Banner istruzioni per gesture/voce */}
      {cameraActive && (
        <p className="text-center text-gray-700 text-lg md:text-base mb-3">
          Use index finger 👉👈 gestures to move through "Go back" or "Confirm" buttons.
          <br />
          Use 👌 gesture on <em>"Confirm booking"</em> to confirm booking or <em>"Go back"</em> to go back to seat selection
        </p>
      )}

      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl">

          {/* Corpo: poster + dettagli */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Poster */}
            <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-lg bg-white">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={movieTitle ? `Poster of ${movieTitle}` : "Movie poster"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full aspect-[2/3] grid place-items-center text-gray-400">
                  Movie image currently unavailable
                </div>
              )}
            </div>

            {/* Dettagli */}
            <div className="w-full lg:flex-1">
              {/* Card dettagli */}
              <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 space-y-4">
                {/* Titolo film */}
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Movie</p>
                  <h2 className="text-xl md:text-2xl font-semibold">{movieTitle || "—"}</h2>
                </div>

                {/* Giorno / Ora in due colonne su desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Day</p>
                    <p className="text-lg font-medium">{String(selectedDay || "—")}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Time</p>
                    <p className="text-lg font-medium">{selectedTime || "—"}</p>
                  </div>
                </div>

                {/* Posti */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Seats</p>
                  <p className="text-lg font-medium break-words">{seatsPretty}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total seats: <span className="font-medium">{seatsList.length}</span>
                  </p>
                </div>

                {/* Sala + Prezzo (opzionali) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Cinema Hall</p>
                    <p className="text-lg font-medium">{cinemaHall || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                    <p className="text-lg font-semibold">
                      {typeof totalPrice === "number" ? `${totalPrice.toFixed(2)} ${currency}` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                        type="button"
                        aria-pressed={bookingSummarySelectedIndex === 0}
                        aria-label="Go back"
                        className={`${base} ${
                          bookingSummarySelectedIndex === 0
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-transparent text-gray-800 border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600"
                        }`}
                        onClick={!gestureMode && !voiceMode ? onBack : undefined}
                      >
                  Go Back
                </button>

                {/* Confirm (index 1) */}
                <button
                  type="button"
                  aria-pressed={bookingSummarySelectedIndex === 1}
                  aria-label="Confirm"
                  className={`${base} ${
                    bookingSummarySelectedIndex === 1
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-transparent text-gray-800 border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600"
                  }`}
                  onClick={!gestureMode && !voiceMode ? onConfirm : undefined}
                >
                  Confirm
                </button>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}