const DB_NAME = 'englist';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('phraseCards')) {
        db.createObjectStore('phraseCards', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('practiceSessions')) {
        db.createObjectStore('practiceSessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('reviewQueue')) {
        db.createObjectStore('reviewQueue', { keyPath: 'phraseId' });
      }
      if (!db.objectStoreNames.contains('userSettings')) {
        db.createObjectStore('userSettings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => { dbInstance = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

function txStore(db: IDBDatabase, name: string, mode: IDBTransactionMode = 'readonly') {
  return db.transaction(name, mode).objectStore(name);
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, storeName).get(id);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function put<T>(storeName: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, storeName, 'readwrite').put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, storeName, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, storeName, 'readwrite').clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
