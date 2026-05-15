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

export function ImageLoadProvider({ children }: { children: React.ReactNode }) {
  const totalRef = useRef(0);
  const loadedRef = useRef(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const checkAllLoaded = useCallback(() => {
    if (loadedRef.current >= totalRef.current && totalRef.current > 0) {
      timerRef.current = setTimeout(() => setAllLoaded(true), 100);
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
    if (totalRef.current === 0) {
      timerRef.current = setTimeout(() => setAllLoaded(true), 50);
    }
    return () => clearTimeout(timerRef.current);
  }, []);

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
