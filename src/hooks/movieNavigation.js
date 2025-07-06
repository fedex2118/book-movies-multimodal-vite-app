
import { useState, useCallback } from 'react';

export default function useMovieNavigation(
  length,
  lastActionRef,
  initialIndex = 0,
  actionDelay = 200
) {
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), length - 1)
  );

  const moveMovieUp = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;
    setSelectedIndex(i => Math.max(0, i - 1));
    lastActionRef.current = now;
  }, [actionDelay, lastActionRef]);

  const moveMovieDown = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;
    setSelectedIndex(i => Math.min(length - 1, i + 1));
    lastActionRef.current = now;
  }, [actionDelay, lastActionRef, length]);

  return {
    selectedIndex,
    moveMovieUp,
    moveMovieDown,
    setSelectedIndex,
  };
}