const DB_NAME = 'PresentFlowDB';
const DB_VERSION = 1;
const STORE_MARKDOWN = 'markdown';
const STORE_ASSETS = 'assets';
const MARKDOWN_KEY = 'content';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not available'));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MARKDOWN)) {
        db.createObjectStore(STORE_MARKDOWN);
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS, { keyPath: 'path' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

export const getMarkdown = (): Promise<string> => {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MARKDOWN, 'readonly');
        const store = tx.objectStore(STORE_MARKDOWN);
        const req = store.get(MARKDOWN_KEY);
        req.onsuccess = () => resolve((req.result as string) ?? '');
        req.onerror = () => reject(req.error);
      })
  );
};

export const setMarkdown = (value: string): Promise<void> => {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MARKDOWN, 'readwrite');
        const store = tx.objectStore(STORE_MARKDOWN);
        store.put(value, MARKDOWN_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
};

export const getAssetsRegistry = (): Promise<Record<string, string>> => {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSETS, 'readonly');
        const store = tx.objectStore(STORE_ASSETS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as Array<{ path: string; dataUrl: string }>) ?? [];
          const registry: Record<string, string> = {};
          for (const { path, dataUrl } of list) {
            registry[path] = dataUrl;
          }
          resolve(registry);
        };
        req.onerror = () => reject(req.error);
      })
  );
};

export const setAssetsRegistry = (registry: Record<string, string>): Promise<void> => {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSETS, 'readwrite');
        const store = tx.objectStore(STORE_ASSETS);
        store.clear();
        for (const [path, dataUrl] of Object.entries(registry)) {
          store.put({ path, dataUrl });
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
};

export const clearAll = (): Promise<void> => {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_MARKDOWN, STORE_ASSETS], 'readwrite');
        tx.objectStore(STORE_MARKDOWN).clear();
        tx.objectStore(STORE_ASSETS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
};
