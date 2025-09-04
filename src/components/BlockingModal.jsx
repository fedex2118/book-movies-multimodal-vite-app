import React, { useEffect, useRef } from "react";

export default function BlockingModal({
  open,
  title = "Booking confirmed successfully! The demo is over!",
  subtitle="The demo is over!",
  primaryLabel = "OK",
  onClose,
}) {
  if (!open) return null;

  const btnRef = useRef(null);

  useEffect(() => {
    // focus primario + blocco scroll
    btnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // blocca ESC
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={onKeyDown}
    >
      {/* overlay che intercetta i click */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-gray-600">{subtitle}</p>

        <div className="mt-6 flex justify-end">
          <button
            ref={btnRef}
            type="button"
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            onClick={onClose}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}