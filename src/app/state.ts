type Listener<T> = (state: T) => void;

export interface Store<T> {
  get(): T;
  set(partial: Partial<T>): void;
  subscribe(fn: Listener<T>): () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = { ...initial };
  const listeners = new Set<Listener<T>>();

  return {
    get: () => state,
    set(partial) {
      state = { ...state, ...partial };
      for (const fn of listeners) fn(state);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
