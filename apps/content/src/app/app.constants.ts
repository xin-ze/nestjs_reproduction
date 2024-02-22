// For redis service that use low level commands
export const REDIS_DB_INDEX_LOW_LEVEL_SERVICE = 0;
// For scheduler
export const REDIS_DB_INDEX_SCHEDULER = 1;
// For cache
export const REDIS_DB_INDEX_CACHE = 2;
// For nestjs message queue
export const REDIS_DB_INDEX_NESTJS_BULL = 3;

/**
 * Graphql list query result limit
 */
export const MAX_RESULTS_SIZE = 10000;

export const ONE_WEEK = 60 * 60 * 24 * 7;

export const ONE_DAY = 60 * 60 * 24;

export const ONE_HOUR = 60 * 60;

export const ONE_MINUTE = 60;

export const FIFTEEN_MINUTE = 15 * 60;
