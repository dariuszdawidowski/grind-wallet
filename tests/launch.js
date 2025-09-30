/**
 * Base test - checking that app bootstrapped correctly.
 */

import { test, expect } from './start.js';

test('App bootstrap', () => {
    expect(document.querySelector('#app'), 'Missing #app');
});

test('Welcome page', () => {
    const welcomeHeading = document.querySelector('#app > .page > h1');
    expect(welcomeHeading, 'Missing #app > .page > h1');
    expect(welcomeHeading.textContent, 'Welcome to Grind Wallet');
});