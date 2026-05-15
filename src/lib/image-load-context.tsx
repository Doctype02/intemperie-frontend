"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

interface ImageLoadContextType {
  registerImage: () => () => void;
  allLoaded: boolean;
}

const ImageLoadContext = createContext<ImageLoadContextType>({
  registerImage: () => () => {},
  allLoaded: true,
});

const MAX_WAIT = 8000;

export function ImageLoadProvider({ children }: { children: React.ReactNode }) {
  const totalRef = useRef(0);
  const loadedRef = useRef(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAllLoaded = useCallback(() => {
    if (loadedRef.current >= totalRef.current && totalRef.current > 0) {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      transitionTimer.current = setTimeout(() => setAllLoaded(true), 150);
    }
  }, []);

  const registerImage = useCallback(() => {
    totalRef.current++;
    let done = false;
    return () => {
      if (done) return;
      done = true;
      loadedRef.current++;
      checkAllLoaded();
    };
  }, [checkAllLoaded]);

  useEffect(() => {
    // Safety: if no images register within 800ms, page has no images → show content
    const noImagesTimer = setTimeout(() => {
      if (totalRef.current === 0) {
        setAllLoaded(true);
      }
    }, 800);

    // Absolute fallback: never leave the overlay up longer than MAX_WAIT
    fallbackTimer.current = setTimeout(() => {
      setAllLoaded(true);
    }, MAX_WAIT);

    return () => {
      clearTimeout(noImagesTimer);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [checkAllLoaded]);

  return (
    <ImageLoadContext.Provider value={{ registerImage, allLoaded }}>
      {children}
    </ImageLoadContext.Provider>
  );
}

export function useImageLoad() {
  return useContext(ImageLoadContext);
}

export function useImageOnLoad() {
  const { registerImage } = useImageLoad();
  const unregisterRef = useRef<(() => void) | null>(null);

  const onLoad = useCallback(() => {
    if (!unregisterRef.current) {
      unregisterRef.current = registerImage();
    }
    unregisterRef.current();
  }, [registerImage]);

  return onLoad;
}
