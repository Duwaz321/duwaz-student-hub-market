export type GeolocationFailureCode = 1 | 2 | 3 | undefined;

export interface GeolocationFailure {
  code?: GeolocationFailureCode;
  message?: string;
}

export interface GeolocationErrorResult {
  shouldShowToast: boolean;
  shouldRetry: boolean;
  userMessage: string;
  isTimeout: boolean;
}

export function getGeolocationErrorResult(error: GeolocationFailure): GeolocationErrorResult {
  const code = error?.code;
  const message = error?.message?.toLowerCase() ?? '';

  if (code === 3 || message.includes('timeout')) {
    return {
      shouldShowToast: false,
      shouldRetry: true,
      isTimeout: true,
      userMessage: 'Location is taking longer than expected. Please try again or enter your address manually.',
    };
  }

  if (code === 1 || message.includes('permission')) {
    return {
      shouldShowToast: true,
      shouldRetry: false,
      isTimeout: false,
      userMessage: 'Location access was denied. Please allow location access or enter your address manually.',
    };
  }

  if (code === 2 || message.includes('unavailable')) {
    return {
      shouldShowToast: true,
      shouldRetry: true,
      isTimeout: false,
      userMessage: 'Location is unavailable right now. Please try again or enter your address manually.',
    };
  }

  return {
    shouldShowToast: true,
    shouldRetry: true,
    isTimeout: false,
    userMessage: 'Unable to determine your location right now. Please try again or enter your address manually.',
  };
}
