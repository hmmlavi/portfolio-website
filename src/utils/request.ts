export type RequestErrorCode = "rate-limit" | "timeout" | "network" | "http" | "invalid";

/** A small typed error surface; `message` stays compatible with existing UI. */
export class RequestError extends Error {
  constructor(
    public readonly code: RequestErrorCode,
    options: {
      status?: number;
      transient?: boolean;
      retryAfterMs?: number;
      cause?: unknown;
    } = {},
  ) {
    super(code);
    Object.defineProperty(this, "cause", { configurable: true, value: options.cause });
    this.name = "RequestError";
    this.status = options.status;
    this.transient = options.transient ?? false;
    this.retryAfterMs = options.retryAfterMs;
  }

  readonly status?: number;
  readonly transient: boolean;
  readonly retryAfterMs?: number;
}

export type RequestOptions = {
  /** Retry one transient failure once. Permanent failures are never retried. */
  automaticRetry?: boolean;
  /** Base delay before that one retry; server hints are capped at two seconds. */
  retryDelayMs?: number;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_DELAY_MS = 750;
const MAX_RETRY_DELAY_MS = 2000;

const retryAfterMs = (response: Response): number | undefined => {
  const value = response.headers?.get("retry-after");
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined;
};

const responseError = (response: Response): RequestError => {
  const rateLimited = response.status === 429 ||
    (response.status === 403 && response.headers?.get("x-ratelimit-remaining") === "0");
  const transient = rateLimited || response.status === 408 || response.status === 425 || response.status >= 500;
  return new RequestError(rateLimited ? "rate-limit" : "http", {
    status: response.status,
    transient,
    retryAfterMs: retryAfterMs(response),
  });
};

async function requestOnce(url: string, signal: AbortSignal, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) abort();
  else signal.addEventListener("abort", abort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw responseError(response);
    try {
      return await response.json();
    } catch (error) {
      throw new RequestError("invalid", { cause: error });
    }
  } catch (error) {
    if (timedOut) throw new RequestError("timeout", { transient: true, cause: error });
    // Caller cancellation is not a transient failure and must not be retried.
    if (signal.aborted) throw error;
    if (error instanceof RequestError) throw error;
    throw new RequestError("network", { transient: true, cause: error });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

const waitForRetry = (delay: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error("aborted")); return; }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, delay);
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new Error("aborted"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });

/**
 * Fetch JSON with a deadline and caller cancellation. Automatic retry is opt-in
 * and bounded to ONE attempt after a transient network, timeout, rate-limit or
 * server failure. Invalid JSON and permanent HTTP errors fail immediately.
 */
export async function requestJson(
  url: string,
  signal: AbortSignal,
  options: RequestOptions = {},
): Promise<unknown> {
  try {
    return await requestOnce(url, signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  } catch (error) {
    if (!options.automaticRetry || signal.aborted ||
        !(error instanceof RequestError) || !error.transient) throw error;
    const baseDelay = Math.max(0, options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS);
    const delay = Math.min(MAX_RETRY_DELAY_MS, Math.max(baseDelay, error.retryAfterMs ?? 0));
    await waitForRetry(delay, signal);
    return requestOnce(url, signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  }
}
