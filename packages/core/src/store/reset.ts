export const storeResetFns = new Set<() => void>();

export const resetAllStores = () => {
  for (const resetFn of storeResetFns) {
    resetFn();
  }
};
