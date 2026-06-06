declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    name: string;
    order_id: string;
    theme?: { color?: string };
    prefill?: { email?: string; contact?: string; name?: string };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}

declare module 'expo-image-picker' {
  export enum MediaTypeOptions {
    Images = 'Images',
    Videos = 'Videos',
    All = 'All',
  }

  export interface ImagePickerOptions {
    mediaTypes?: MediaTypeOptions;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets?: Array<{
      uri: string;
      width: number;
      height: number;
      type?: string;
      fileName?: string;
    }>;
  }

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function requestCameraPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
}

declare module 'expo-device' {
  export const isDevice: boolean;
  export const brand: string | null;
  export const modelName: string | null;
  export const osName: string | null;
  export const osVersion: string | null;
}

declare module 'react-native-mmkv' {
  export interface MMKV {
    getString(key: string): string | undefined;
    getNumber(key: string): number | undefined;
    getBoolean(key: string): boolean | undefined;
    set(key: string, value: string | number | boolean): void;
    delete(key: string): void;
    contains(key: string): boolean;
    clearAll(): void;
    getAllKeys(): string[];
  }

  export function createMMKV(config?: {
    id?: string;
    path?: string;
    encryptionKey?: string;
  }): MMKV;
}

declare module 'expo-notifications' {
  export enum AndroidImportance {
    MIN = 1,
    LOW = 2,
    DEFAULT = 3,
    HIGH = 4,
    MAX = 5,
  }

  export interface NotificationHandler {
    handleNotification: (notification: any) => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }

  export interface NotificationChannelInput {
    name: string;
    importance: AndroidImportance;
    vibrationPattern?: number[];
    lightColor?: string;
  }

  export interface ExpoPushToken {
    data: string;
    type: string;
  }

  export interface NotificationContent {
    title?: string | null;
    body?: string | null;
    data?: Record<string, unknown>;
  }

  export interface NotificationRequest {
    identifier: string;
    content: NotificationContent;
  }

  export interface Notification {
    request: NotificationRequest;
  }

  export interface NotificationResponse {
    notification: Notification;
    actionIdentifier: string;
  }

  export interface DevicePushToken {
    data: string;
    type: string;
  }

  export function setNotificationHandler(handler: NotificationHandler): void;
  export function setNotificationChannelAsync(id: string, channel: NotificationChannelInput): Promise<any>;
  export function getPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function requestPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function getExpoPushTokenAsync(config?: { projectId?: string }): Promise<ExpoPushToken>;
  export function getDevicePushTokenAsync(): Promise<DevicePushToken>;
  export function getLastNotificationResponseAsync(): Promise<NotificationResponse | null>;
  export function getLastNotificationResponse(): NotificationResponse | null;
  export interface Subscription {
    remove: () => void;
  }

  export function addNotificationReceivedListener(listener: (event: any) => void): Subscription;
  export function addNotificationResponseReceivedListener(listener: (response: NotificationResponse) => void): Subscription;
  export function addPushTokenListener(listener: (event: any) => void): Subscription;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'expo-auth-session' {
  export interface AuthSessionResult {
    type: 'success' | 'error' | 'dismiss' | 'cancel' | 'locked';
    params: Record<string, string>;
    url?: string;
    error?: any;
  }
  export interface AuthRequest {
    promptAsync(options?: any): Promise<AuthSessionResult>;
  }
}

declare module 'expo-auth-session/providers/google' {
  export function useIdTokenAuthRequest(config: {
    clientId?: string;
    androidClientId?: string;
    iosClientId?: string;
    webClientId?: string;
  }): [any, import('expo-auth-session').AuthSessionResult | null, (options?: any) => Promise<import('expo-auth-session').AuthSessionResult>];
}

declare module 'expo-web-browser' {
  export function maybeCompleteAuthSession(): { type: string };
  export function openBrowserAsync(url: string): Promise<any>;
}

declare module '@react-native-firebase/analytics' {
  interface Analytics {
    logScreenView(params: { screen_name: string; screen_class?: string }): Promise<void>;
    logEvent(name: string, params?: Record<string, any>): Promise<void>;
    setUserId(id: string | null): Promise<void>;
    setUserProperty(name: string, value: string | null): Promise<void>;
    logLogin(params: { method: string }): Promise<void>;
    logSignUp(params: { method: string }): Promise<void>;
    logSearch(params: { search_term: string }): Promise<void>;
    logShare(params: { content_type: string; item_id: string; method: string }): Promise<void>;
    logPurchase(params: { value: number; currency: string }): Promise<void>;
  }
  export default function analytics(): Analytics;
}

declare module '@react-native-firebase/crashlytics' {
  interface Crashlytics {
    log(message: string): void;
    recordError(error: Error): void;
    setUserId(id: string): Promise<void>;
    setAttribute(key: string, value: string): Promise<void>;
    setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void>;
  }
  export default function crashlytics(): Crashlytics;
}

declare module '@react-native-firebase/perf' {
  interface Trace {
    start(): Promise<void>;
    stop(): Promise<void>;
    putMetric(name: string, value: number): void;
    putAttribute(name: string, value: string): void;
  }
  interface HttpMetric {
    start(): Promise<void>;
    stop(): Promise<void>;
    setHttpResponseCode(code: number): void;
    setRequestPayloadSize(bytes: number): void;
    setResponsePayloadSize(bytes: number): void;
  }
  interface Performance {
    newTrace(name: string): Trace;
    newHttpMetric(url: string, method: string): HttpMetric;
  }
  export default function perf(): Performance;
}

declare module 'lottie-react-native' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface LottieViewProps {
    source: any;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;
    style?: ViewStyle;
    resizeMode?: 'contain' | 'cover' | 'center';
    onAnimationFinish?: () => void;
  }

  export default class LottieView extends Component<LottieViewProps> {
    play(): void;
    reset(): void;
    pause(): void;
    resume(): void;
  }
}
