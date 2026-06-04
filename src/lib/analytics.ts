// Firebase Analytics — commented out for demo (requires google-services.json / GoogleService-Info.plist)
// import analytics from '@react-native-firebase/analytics';

/* eslint-disable @typescript-eslint/no-unused-vars */

export async function logScreenView(_screenName: string, _screenClass?: string): Promise<void> {
  // await analytics().logScreenView({ screen_name: screenName, screen_class: screenClass ?? screenName });
}

export async function logEvent(_name: string, _params?: Record<string, any>): Promise<void> {
  // await analytics().logEvent(name, params);
}

export async function setUser(_userId: string): Promise<void> {
  // await analytics().setUserId(userId);
}

export async function setUserProperty(_name: string, _value: string): Promise<void> {
  // await analytics().setUserProperty(name, value);
}

export async function logUserLogin(_method: string): Promise<void> {
  // await analytics().logLogin({ method });
}

export async function logUserSignUp(_method: string): Promise<void> {
  // await analytics().logSignUp({ method });
}

export async function logSearchEvent(_searchTerm: string): Promise<void> {
  // await analytics().logSearch({ search_term: searchTerm });
}

export async function logShareEvent(_contentType: string, _itemId: string): Promise<void> {
  // await analytics().logShare({ content_type: contentType, item_id: itemId, method: 'app' });
}

export async function logPurchaseEvent(_value: number, _currency: string): Promise<void> {
  // await analytics().logPurchase({ value, currency });
}
