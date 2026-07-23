import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const show = useCallback((msg) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  return { message, show };
}
