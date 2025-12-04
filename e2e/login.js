/**
 * Login test - filling password from secrets json.
 */

import { test, expect, wait } from './start.js';
import secrets from '../secrets.local.json';

test('2. Login', async () => {
    const loginInput = document.querySelector('#app input[name="password"]');
    expect(loginInput, 'Missing password field');
    loginInput.value = secrets.password;
    const loginButton = document.querySelector('#app button[type="submit"]');
    expect(loginButton, 'Missing login button');
    loginButton.click();
});