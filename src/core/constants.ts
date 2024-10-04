// eslint-disable-next-line unicorn/prefer-global-this
export const isServer = () => typeof window === "undefined" || typeof document === "undefined";

export const isBrowser = () => !isServer();
