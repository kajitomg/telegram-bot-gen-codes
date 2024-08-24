export function sleep(ms, options?: { signal?:AbortSignal }) {
  return new Promise((resolve, reject) => {
    options?.signal?.throwIfAborted();
      
    const timeout = setTimeout((args) => {
      resolve(args);
      options?.signal?.removeEventListener('abort', abort);}, ms
    );
      
    const abort = () => {
      clearTimeout(timeout);
      reject(options?.signal?.reason);
    }
      
    options?.signal?.addEventListener('abort', abort);
  });
}