import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAssetsRegistry, setAssetsRegistry } from '@/utils/indexedDb';

type ImageRegistryContextValue = {
  imageRegistry: Record<string, string>;
  setImageEntry: (path: string, dataUrl: string) => void;
  setImageRegistry: (next: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  getUrl: (path: string) => string | undefined;
};

const ImageRegistryContext = createContext<ImageRegistryContextValue | null>(null);

export const useImageRegistry = (): ImageRegistryContextValue => {
  const ctx = useContext(ImageRegistryContext);
  if (!ctx) {
    return {
      imageRegistry: {},
      setImageEntry: () => {},
      setImageRegistry: () => {},
      getUrl: () => undefined,
    };
  }
  return ctx;
};

type ImageRegistryProviderProps = {
  children: React.ReactNode;
};

export const ImageRegistryProvider: React.FC<ImageRegistryProviderProps> = ({ children }) => {
  const [imageRegistry, setImageRegistry] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getAssetsRegistry()
      .then((registry) => {
        setImageRegistry(registry);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setAssetsRegistry(imageRegistry).catch(() => {});
  }, [imageRegistry, isLoaded]);

  const setImageEntry = useCallback((path: string, dataUrl: string) => {
    setImageRegistry((prev) => ({ ...prev, [path]: dataUrl }));
  }, []);

  const getUrl = useCallback(
    (path: string): string | undefined => {
      const decoded = path.includes('%') ? decodeURIComponent(path) : path;
      return imageRegistry[path] ?? imageRegistry[decoded];
    },
    [imageRegistry]
  );

  const value: ImageRegistryContextValue = {
    imageRegistry,
    setImageEntry,
    setImageRegistry,
    getUrl,
  };

  return (
    <ImageRegistryContext.Provider value={value}>
      {children}
    </ImageRegistryContext.Provider>
  );
};
