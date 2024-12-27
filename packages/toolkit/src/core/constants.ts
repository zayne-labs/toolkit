// eslint-disable-next-line unicorn/prefer-global-this -- It doesn't need globalThis since it checks for window
export const isServer = () => typeof window === "undefined" || typeof document === "undefined";

export const isBrowser = () => !isServer();
