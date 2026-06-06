import perf from '@react-native-firebase/perf';

export function startTrace(name: string) {
  // Start async but return a synchronous-looking handle so callers don't need
  // to await just to create a trace. Each method awaits the trace internally.
  const tracePromise = perf().startTrace(name).then((t) => {
    t.start();
    return t;
  });

  return {
    stop: async () => {
      const t = await tracePromise;
      await t.stop();
    },
    putMetric: async (key: string, value: number) => {
      const t = await tracePromise;
      t.putMetric(key, value);
    },
    putAttribute: async (key: string, value: string) => {
      const t = await tracePromise;
      t.putAttribute(key, value);
    },
  };
}

export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const trace = await perf().startTrace(name);
  trace.start();
  try {
    const result = await fn();
    await trace.stop();
    return result;
  } catch (error) {
    await trace.stop();
    throw error;
  }
}

export function createHttpMetric(url: string, method: string) {
  const metricPromise = perf().newHttpMetric(url, method as any);

  return {
    start: async () => {
      const metric = await metricPromise;
      await metric.start();
    },
    stop: async () => {
      const metric = await metricPromise;
      await metric.stop();
    },
    setHttpResponseCode: async (code: number) => {
      const metric = await metricPromise;
      metric.setHttpResponseCode(code);
    },
    setResponseContentType: async (type: string) => {
      const metric = await metricPromise;
      metric.setResponseContentType(type);
    },
    setResponsePayloadSize: async (bytes: number) => {
      const metric = await metricPromise;
      metric.setResponsePayloadSize(bytes);
    },
  };
}
