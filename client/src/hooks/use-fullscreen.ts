import { useCallback, useEffect, useState } from "react";

/** Tracks document fullscreen state, including exits via Esc/F11. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    request.catch(() => {
      // Browsers may reject (e.g. no user gesture); state stays in sync via the event.
    });
  }, []);

  return { isFullscreen, toggleFullscreen };
}
