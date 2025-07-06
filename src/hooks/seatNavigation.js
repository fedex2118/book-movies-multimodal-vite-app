import { useState, useRef, useCallback, useEffect } from 'react';

export default function seatNavigation(
  layout,
  occupiedSeats,
  selectedSeats,
  setSelectedSeats,
  lastActionRef,
  actionDelay = 200
) {

  // 1) Ref per layout e occupiedSeats
  const layoutRef   = useRef(layout);
  const occupiedRef = useRef(occupiedSeats);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // aggiorno i ref ogni volta che i prop cambiano
  useEffect(() => { layoutRef.current = layout; },       [layout]);
  useEffect(() => { occupiedRef.current = occupiedSeats; }, [occupiedSeats]);

  // 2) Funzioni per dimensioni / indici fissi
  const rows            = () => layoutRef.current.length;
  const cols            = () => layoutRef.current[0]?.length || 0;
  const buttonRow       = () => rows();    // riga dei bottoni
  const backColIndex    = 3;               // colonna “Indietro”
  const confirmColIndex = 4;               // colonna “Conferma”

  // 3) Helper che legge sempre da ref
  const isFree = (r, c) => {
    const l = layoutRef.current;
    if (r < 0 || r >= l.length) return false;
    const s = l[r][c];
    return s != null && !occupiedRef.current.includes(s);
  };

  // 4) Stato + ref per il focus
  const [seatPos, _setSeatPos] = useState({ row: null, col: null });
  const seatPosRef             = useRef(seatPos);
  useEffect(() => { seatPosRef.current = seatPos; }, [seatPos]);
  const setSeatPos = pos => _setSeatPos(pos);

  // ————————————— moveSeatDown —————————————
  const moveSeatDown = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setSeatPos(pos => {
      const R = rows(), C = cols(), BR = buttonRow();

      // 1) Se non ho focus → primo seat libero
      if (pos.row === null) {
        for (let r = 0; r < R; r++) {
          for (let c = 0; c < C; c++) {
            if (isFree(r, c)) return { row: r, col: c };
          }
        }
        return { row: BR, col: backColIndex };
      }

      // 2) Stessa colonna sotto
      for (let r = pos.row + 1; r < R; r++) {
        if (isFree(r, pos.col)) return { row: r, col: pos.col };
      }
      // 3) Fallback: righe successive, primo seat
      for (let r = pos.row + 1; r < R; r++) {
        for (let c = 0; c < C; c++) {
          if (isFree(r, c)) return { row: r, col: c };
        }
      }

      // 4) Nessun posto libero → Conferma o Indietro
      const canConfirm = selectedSeats.length > 0;
      if (pos.col === confirmColIndex && canConfirm) {
        return { row: BR, col: confirmColIndex };
      }
      return { row: BR, col: backColIndex };
    });

    lastActionRef.current = now;
  }, [
    selectedSeats,
    lastActionRef,
    actionDelay
  ]);

  // ————————————— moveSeatUp —————————————
  const moveSeatUp = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setSeatPos(pos => {
      const R = rows(), C = cols(), BR = buttonRow();

      // 1) Se non ho focus → primo seat libero
      if (pos.row === null) {
        for (let r = 0; r < R; r++) {
          for (let c = 0; c < C; c++) {
            if (isFree(r, c)) return { row: r, col: c };
          }
        }
        return { row: BR, col: backColIndex };
      }

      // 2) Stessa colonna sopra
      for (let r = pos.row - 1; r >= 0; r--) {
        if (isFree(r, pos.col)) return { row: r, col: pos.col };
      }
      // 3) Fallback: righe precedenti, primo seat
      for (let r = pos.row - 1; r >= 0; r--) {
        for (let c = 0; c < C; c++) {
          if (isFree(r, c)) return { row: r, col: c };
        }
      }
      // 4) Rimango dove sono (non salto ai bottoni)
      return pos;
    });

    lastActionRef.current = now;
  }, [
    lastActionRef,
    actionDelay
  ]);

  // ————————————— moveSeatLeft —————————————
  const moveSeatLeft = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setSeatPos(pos => {
      const BR = buttonRow();

      // Se sono sui bottoni
      if (pos.row === BR) {
        // Conferma → Indietro
        if (pos.col === confirmColIndex) {
          return { row: BR, col: backColIndex };
        }
        return pos;
      }
      // Scandisco a sinistra nella riga dei seat
      for (let c = pos.col - 1; c >= 0; c--) {
        if (isFree(pos.row, c)) {
          return { row: pos.row, col: c };
        }
      }
      return pos;
    });

    lastActionRef.current = now;
  }, [
    lastActionRef,
    actionDelay
  ]);

  // ————————————— moveSeatRight —————————————
  const moveSeatRight = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    setSeatPos(pos => {
      const BR = buttonRow(), C = cols();

      // Se sono sui bottoni
      if (pos.row === BR) {
        // Indietro → Conferma
        if (pos.col === backColIndex) {
          return { row: BR, col: confirmColIndex };
        }
        return pos;
      }
      // Scandisco a destra nella riga dei seat
      for (let c = pos.col + 1; c < C; c++) {
        if (isFree(pos.row, c)) {
          return { row: pos.row, col: c };
        }
      }
      return pos;
    });

    lastActionRef.current = now;
  }, [
    lastActionRef,
    actionDelay
  ]);

  // ————————————— selectSeat —————————————
  const selectSeat = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    const { row, col } = seatPosRef.current;
    const l = layoutRef.current;
    if (row == null || col == null) return;
    const seat = l[row]?.[col];
    if (!seat) return;
    if (occupiedRef.current.includes(seat)) return;
    if (selectedSeats.includes(seat)) return;

    setSelectedSeats(prev => [...prev, seat]);
    lastActionRef.current = now;
  }, [
    selectedSeats,
    setSelectedSeats,
    lastActionRef,
    actionDelay
  ]);

  // ————————————— deselectSeat —————————————
  const deselectSeat = useCallback(() => {
    const now = Date.now();
    if (now - lastActionRef.current < actionDelay) return;

    const { row, col } = seatPosRef.current;
    const l = layoutRef.current;
    if (row == null || col == null) return;
    const seat = l[row]?.[col];
    if (!seat) return;

    setSelectedSeats(prev => prev.filter(s => s !== seat));
    lastActionRef.current = now;
  }, [
    setSelectedSeats,
    lastActionRef,
    actionDelay
  ]);

  const currentButtonRow = () => layoutRef.current.length;

  return {
    seatPos,
    seatPosRef,
    moveSeatUp,
    moveSeatDown,
    moveSeatLeft,
    moveSeatRight,
    setSeatPos,
    selectSeat,
    deselectSeat
  };
}