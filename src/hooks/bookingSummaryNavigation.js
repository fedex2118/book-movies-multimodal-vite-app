import { useState, useRef, useEffect, useCallback } from "react";

export default function bookingSummaryNavigation({
  length,
  lastActionRef,
  initialIndex = 0,
  actionDelay = 200
}) {
    const [bookingSummarySelectedIndex, setBookingSummarySelectedIndex] = useState(() =>
        Math.min(Math.max(0, initialIndex), length - 1)
    );
    const bookingSummarySelectedIndexRef = useRef(bookingSummarySelectedIndex);

    useEffect(() => {
        bookingSummarySelectedIndexRef.current = bookingSummarySelectedIndex;
    }, [bookingSummarySelectedIndex]);

    const moveBookingSummaryLeft = useCallback(() => {
        const now = Date.now();
        if (now - lastActionRef.current < actionDelay) return;
        setBookingSummarySelectedIndex(i => Math.max(0, i - 1));
        lastActionRef.current = now;
    }, [actionDelay, lastActionRef]);

    const moveBookingSummaryRight = useCallback(() => {
        const now = Date.now();
        if (now - lastActionRef.current < actionDelay) return;
        setBookingSummarySelectedIndex(i => Math.min(length - 1, i + 1));
        lastActionRef.current = now;
    }, [actionDelay, lastActionRef, length]);

    const moveBookingSummaryUp = useCallback(() => {
        const now = Date.now();
        if (now - lastActionRef.current < actionDelay) return;
        setBookingSummarySelectedIndex(i => 0);
        lastActionRef.current = now;
    }, [actionDelay, lastActionRef]);

    const moveBookingSummaryDown = useCallback(() => {
        const now = Date.now();
        if (now - lastActionRef.current < actionDelay) return;
        setBookingSummarySelectedIndex(i => 0);
        lastActionRef.current = now;
    }, [actionDelay, lastActionRef, length]);

    return {
        bookingSummarySelectedIndex,
        bookingSummarySelectedIndexRef,
        moveBookingSummaryLeft,
        moveBookingSummaryRight,
        moveBookingSummaryUp,
        moveBookingSummaryDown,
        setBookingSummarySelectedIndex,
    };
}