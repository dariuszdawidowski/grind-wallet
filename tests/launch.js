/**
 * Base test - checking that app bootstrapped correctly.
 */

import { test, expect } from './start.js';

test('App bootstrap', () => {
    expect(document.querySelector('#app'), 'Missing #app');
});