import { useState, useRef, useCallback, useEffect } from 'react';

export default function timeNavigation(
  getMaxRow,   // () => number
  getMaxCol,   // (row: number) => number
  lastActionRef,
  actionDelay = 200
) {
  const [timePos, setTimePos] = useState({ row: null, col: null });
  const timePosRef = useRef(timePos);

  // Sincronizza il ref
  useEffect(() => {
    timePosRef.current = timePos;
  }, [timePos]);

  const minRows = 0;
  const minCols = 0;

  const isFirstRow = (currentRow, currentCol) => {
    if (currentRow === 0) return currentCol;
    return Math.min(getMaxCol(currentRow - 1), currentCol);
  };
  const isLastRow = (maxRow, currentRow, currentCol) => {
    if (currentRow === maxRow) return currentCol;
    return Math.min(getMaxCol(currentRow + 1), currentCol);
  };

  const moveTimeUp = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setTimePos(pos => {
      if (pos.row === null) {
        return { row: 0, col: 0 };
      }
      const newRow = Math.max(minRows, pos.row - 1);
      const newCol = isFirstRow(pos.row, pos.col);
      return { row: newRow, col: newCol };
    });

    lastActionRef.current = now;
  }, [actionDelay, lastActionRef, getMaxRow, getMaxCol]);

  const moveTimeDown = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setTimePos(pos => {
      if (pos.row === null) {
        return { row: 0, col: 0 };
      }
      const maxRow = getMaxRow();
      if (pos.row === maxRow) return pos;
      const newRow = Math.min(maxRow, pos.row + 1);
      const newCol = isLastRow(maxRow, pos.row, pos.col);
      return { row: newRow, col: newCol };
    });

    lastActionRef.current = now;
  }, [actionDelay, lastActionRef, getMaxRow, getMaxCol]);

  const moveTimeLeft = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setTimePos(pos => {
      if (pos.row === null) {
        return { row: 0, col: 0 };
      }
      // sulla riga “Back” col è 0, e non scendo
      return { row: pos.row, col: Math.max(minCols, pos.col - 1) };
    });

    lastActionRef.current = now;
  }, [actionDelay, lastActionRef]);

  const moveTimeRight = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setTimePos(pos => {
      if (pos.row === null) {
        return { row: 0, col: 0 };
      }
      const maxRow = getMaxRow();
      if (pos.row === maxRow) return pos;
      const maxCol = getMaxCol(pos.row);
      return { row: pos.row, col: Math.min(maxCol, pos.col + 1) };
    });

    lastActionRef.current = now;
  }, [actionDelay, lastActionRef, getMaxRow, getMaxCol]);

  return {
    timePos,
    timePosRef,
    moveTimeUp,
    moveTimeDown,
    moveTimeLeft,
    moveTimeRight,
    setTimePos,
  };
}