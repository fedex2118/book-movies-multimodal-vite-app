import React from 'react';
import useMouseActive from '../hooks/useMouseActive';

// local helper, retro-compatible (handles both object or string)
function readTimeEntry(entry) {
  if (entry && typeof entry === 'object') {
    return {
      timeStr: entry.time,
      screeningId: entry.screeningId ?? null,
      roomId: entry.roomId ?? null,
      movieId: entry.movieId ?? null,
    };
  }
  return { timeStr: String(entry || ''), screeningId: null, roomId: null, movieId: null };
}

export default function MovieSelector({
  movies,
  selectedIndex,     // può essere un id o un index (fallback sotto)
  gestureMode,
  voiceMode,
  onSelectMovie,
  onSelectTime
}) {
  const isMouseActive = useMouseActive(100);

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {(movies || []).map((movie, index) => {
        const movieId = movie.id ?? index; // fallback if id is missing
        const isSelected = gestureMode && (selectedIndex === movieId || selectedIndex === index);

        return (
          <div
            key={movieId}
            onClick={() => {
              onSelectMovie(movieId);
              //console.log("movieIdClick", movieId);
            }}
            onMouseEnter={() => {
              if (isMouseActive && !gestureMode && !voiceMode) {
                //console.log("movieIdEnter", movieId);
                onSelectMovie(movieId);
              }
                
            }}
            onWheel={() => {
              //onSelectMovie(movieId);
              //console.log("movieIdWheel", movieId);
            }}
            className={`movie-card w-full transition-colors cursor-pointer ${
              isSelected ? 'bg-blue-50' : ''
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

                {/* TEXT */}
                <div className="flex-1 pl-6 flex flex-col justify-between">
                  <h2 className="text-2xl md:text-3xl font-semibold">
                    {movie.title}
                  </h2>
                  <p className="text-lg md:text-sm text-gray-600 mt-2">
                    {movie.description}
                  </p>
                  <p className="text-base md:text-lg text-gray-500 mt-1">
                    Direction: {movie.director}
                  </p>
                  <p className="text-base md:text-lg text-gray-500 mt-1">
                    Cast: {movie.cast}
                  </p>

                  <div className="mt-4">
                    {(movie.showtimes || []).map((group, gi) => (
                      <div key={`${movieId}-day-${gi}`} className="mb-6">
                        <h3 className="font-bold text-base md:text-lg text-gray-700 mb-2">
                          {group.day}:
                        </h3>

                        <div className="flex flex-wrap gap-3">
                          {(group.times || []).map((t, ti) => {
                            const { timeStr, screeningId, roomId, movieId: timeMovieId } = readTimeEntry(t);
                            const effectiveMovieId = timeMovieId;
                            const btnKey = `${effectiveMovieId}-${gi}-${ti}-${timeStr}`;

                            return (
                              <button
                                key={btnKey}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm md:text-base rounded-full transition"
                                onClick={(e) => {
                                  console.log("timeMovieId", timeMovieId);
                                  onSelectMovie(timeMovieId);
                                  // avoid click to select card
                                  e.stopPropagation();
                                  onSelectTime({
                                    movieId: effectiveMovieId,
                                    day: group.day,
                                    time: timeStr,
                                    screeningId,
                                    roomId
                                  });
                                }}
                                aria-label={`Select ${movie.title} on ${group.day} at ${timeStr}`}
                              >
                                {timeStr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}