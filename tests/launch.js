/**
 * Base test - checking that app bootstrapped correctly.
 */

import { test, expect, wait } from './start.js';

test('1. Welcome page', async () => {
    await wait(1000);
    expect(document.querySelector('#app'), 'Missing #app');
    const welcomeHeading = document.querySelector('#app > .page > h1');
    expect(welcomeHeading, 'Missing #app > .page > h1');
    expect(welcomeHeading.textContent, 'Welcome to Grind Wallet');
});