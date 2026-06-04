/**
 * Unified KV store.
 * - Production / Vercel: uses @vercel/kv (backed by Upstash Redis)
 * - Local development:  uses a simple in-memory Map (data resets on server restart)
 *
 * Set KV_REST_API_URL and KV_REST_API_TOKEN in your environment (or run
 * `vercel env pull` after creating a KV store in the Vercel dashboard).
 */

const GLOBAL_STORE_KEY = '__quizPlatformStore';

let store = null;

function getStore() {
  if (store) return store;
  if (globalThis[GLOBAL_STORE_KEY]) {
    store = globalThis[GLOBAL_STORE_KEY];
    return store;
  }

  const hasKV =
    process.env.KV_REST_API_URL ||
    process.env.KV_URL;

  if (hasKV) {
    // Real Redis via Vercel KV
    const { kv } = require('@vercel/kv');
    store = kv;
    globalThis[GLOBAL_STORE_KEY] = store;
    return store;
  }

  // ── In-memory fallback ─────────────────────────────────────────────────────
  console.warn(
    '[store] No KV_REST_API_URL found — using in-memory store. ' +
    'Data will be lost on server restart. Set up Vercel KV for production.'
  );

  const mem = new Map();   // key → value
  const lists = new Map(); // key → array (for lpush / lrange)
  const timers = new Map(); // key → timeout handle

  function scheduleExpiry(key, seconds) {
    if (timers.has(key)) clearTimeout(timers.get(key));
    const handle = setTimeout(() => {
      mem.delete(key);
      timers.delete(key);
    }, seconds * 1000);
    timers.set(key, handle);
  }

  store = {
    async get(key) {
      return mem.has(key) ? mem.get(key) : null;
    },
    async set(key, value, opts = {}) {
      mem.set(key, value);
      if (opts.ex) scheduleExpiry(key, opts.ex);
      return 'OK';
    },
    async del(key) {
      mem.delete(key);
      lists.delete(key);
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
        timers.delete(key);
      }
      return 1;
    },
    async keys(pattern = '*') {
      const regex = new RegExp(
        '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'
      );
      return [...mem.keys()].filter((k) => regex.test(k));
    },
    async incr(key) {
      const v = (mem.get(key) || 0) + 1;
      mem.set(key, v);
      return v;
    },
    async lpush(key, value) {
      const arr = lists.get(key) || [];
      arr.unshift(value);
      lists.set(key, arr);
      return arr.length;
    },
    async lrange(key, start, stop) {
      const arr = lists.get(key) || [];
      if (stop === -1) return arr.slice(start);
      return arr.slice(start, stop + 1);
    },
  };

  globalThis[GLOBAL_STORE_KEY] = store;
  return store;
}

module.exports = getStore();
