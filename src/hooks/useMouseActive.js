import { useEffect, useRef, useState } from "react";

function useMouseActive(delay = 300) {
  const [active, setActive] = useState(false);
  const lastMove = useRef(Date.now());
  const timer = useRef(null); // <-- nessun tipo

  useEffect(() => {
    const handleMove = () => {
      lastMove.current = Date.now();
      if (!active) setActive(true);

      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => {
        if (Date.now() - lastMove.current >= delay) {
          setActive(false);
        }
      }, delay);
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, delay]);

  return active;
}

export default useMouseActive;