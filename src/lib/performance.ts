// Firebase Performance — commented out for demo (requires google-services.json / GoogleService-Info.plist)
// import perf from '@react-native-firebase/perf';

/* eslint-disable @typescript-eslint/no-unused-vars */

export function startTrace(_name: string) {
  return {
    start: () => {},
    stop: () => {},
    putMetric: (_key: string, _value: number) => {},
    putAttribute: (_key: string, _value: string) => {},
  };
}

export async function measureAsync<T>(_name: string, fn: () => Promise<T>): Promise<T> {
  return fn();
}

export function createHttpMetric(_url: string, _method: string) {
  return {
    start: async () => {},
    stop: async () => {},
    setHttpResponseCode: (_code: number) => {},
    setResponseContentType: (_type: string) => {},
    setResponsePayloadSize: (_bytes: number) => {},
  };
}
