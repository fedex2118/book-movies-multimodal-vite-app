import React from 'react';

import useMouseActive from '../hooks/useMouseActive';

export default function MovieSelector({
  movies,
  selectedIndex,
  gestureMode,
  voiceMode,
  onSelect,
  onHover
}) {
    // mouse moving check constant
    const isMouseActive = useMouseActive(100);

    return (
        <div className="flex flex-col divide-y divide-gray-200">
        {movies.map((movie, index) => (
            <div
            key={index}
            onClick={() => onSelect(index)}
            onMouseEnter={() => {
                if (isMouseActive && !gestureMode && !voiceMode) onSelect(index);
            }}
            onWheel={() => onSelect(index)}
            className={`movie-card w-full transition-colors cursor-pointer ${
                gestureMode && index === selectedIndex ? 'bg-blue-50' : ''
            }`}
            >
            <div className="w-full flex justify-center py-6">
                <div className="flex items-center w-full max-w-4xl">
                {/* POSTER */}
                <div className="flex-shrink-0 w-1/3 md:w-1/2 h-[28rem] lg:h-[32rem] overflow-hidden rounded-l-lg flex items-center justify-center">
                    <img
                    src={movie.image}
                    alt={movie.title}
                    className="max-h-full max-w-full object-contain"
                    />
                </div>
                {/* TESTO */}
                <div className="flex-1 pl-6 flex flex-col justify-between">
                    <h2 className="text-2xl md:text-3xl font-semibold">
                    {movie.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mt-2 max-h-20 overflow-hidden">
                    {movie.description}
                    </p>
                    <p className="text-base md:text-lg text-gray-500 mt-1">
                    Regia: {movie.director}
                    </p>
                    <div className="mt-4">
                    {movie.showtimes.map((group, gi) => (
                        <div key={gi} className="mb-6">
                        <h3 className="font-bold text-base md:text-lg text-gray-700 mb-2">
                            {group.day}:
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {group.times.map((t, ti) => (
                            <button
                                key={ti}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm md:text-base rounded-full transition"
                                onClick={() => alert(`Hai prenotato per ${group.day} alle ${t}`)}
                            >
                                {t}
                            </button>
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
            </div>
        ))}
        </div>
    );
}