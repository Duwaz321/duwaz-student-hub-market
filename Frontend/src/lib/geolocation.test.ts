import test from 'node:test';
import assert from 'node:assert/strict';

import { getGeolocationErrorResult } from './geolocation.ts';

test('timeout errors are treated as a soft fallback instead of a hard failure', () => {
  const result = getGeolocationErrorResult({ code: 3, message: 'Timeout expired' });

  assert.equal(result.shouldShowToast, false);
  assert.equal(result.shouldRetry, true);
  assert.equal(
    result.userMessage,
    'Location is taking longer than expected. Please try again or enter your address manually.'
  );
});

test('permission denied errors remain explicit', () => {
  const result = getGeolocationErrorResult({ code: 1, message: 'Permission denied' });

  assert.equal(result.shouldShowToast, true);
  assert.equal(result.shouldRetry, false);
  assert.match(result.userMessage, /permission/i);
});
