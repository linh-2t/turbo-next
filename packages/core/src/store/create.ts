import { create as _create } from 'zustand';

import type { StateCreator } from 'zustand';

import { storeResetFns } from './reset';

export const create = (
  <T>() =>
  (stateCreator: StateCreator<T>) => {
    const store = _create(stateCreator);
    const initialState = store.getState();

    storeResetFns.add(() => {
      store.setState(initialState, true);
    });
    return store;
  }
)() as typeof _create;
