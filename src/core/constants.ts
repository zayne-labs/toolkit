export const isServer = () => typeof window === "undefined" || typeof document === "undefined";

export const isBrowser = () => !isServer();

export const prefersDarkMode = isServer() && window.matchMedia("(prefers-color-scheme: dark)").matches;
