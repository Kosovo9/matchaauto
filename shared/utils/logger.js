export const logger = {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
    debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args),
};
//# sourceMappingURL=logger.js.map