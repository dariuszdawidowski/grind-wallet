# Jest Mocks

This directory contains reusable mock modules for Jest tests.

## Available Mocks

### `browser.js`
Mock for browser extension API (`chrome.storage`, `chrome.runtime`).

**Usage:**
```javascript
jest.mock('/src/utils/browser.js', () => require('../../__mocks__/browser.js'));
```

**Used in:**
- `src/blockchain/__tests__/wallets.test.js`

**Provides:**
- `browser.storage.local.get/set/remove`
- `browser.storage.session.get/set/remove`
- `browser.runtime.sendMessage`
- `browser.runtime.onMessage.addListener`

---

### `crypto.js`
Mock for Web Crypto API (`crypto.subtle`).

**Usage:**
```javascript
const { mockCrypto } = require('../../__mocks__/crypto.js');
```

**Used in:**
- `src/utils/__tests__/keys.test.js`

**Provides:**
- `crypto.subtle.importKey`
- `crypto.subtle.deriveKey`
- `crypto.subtle.encrypt`
- `crypto.subtle.decrypt`
- `crypto.subtle.digest`
- `crypto.getRandomValues`

---

### `globals.js`
Mock for browser globals (`btoa`, `atob`).

**Usage:**
```javascript
require('../../__mocks__/globals.js');
```

**Used in:**
- `src/utils/__tests__/keys.test.js`

**Provides:**
- `window.btoa` - Base64 encoding
- `window.atob` - Base64 decoding

---

### `webextension-polyfill.js`
Mock for webextension-polyfill library.

**Usage:**
Automatically used by Jest when `webextension-polyfill` is imported.

**Provides:**
- `runtime.sendMessage`
- `runtime.onMessage.addListener`
- `storage.local.get/set/remove`

---

## Guidelines

### When to create a new mock:
- ✅ Mock is used in **multiple test files**
- ✅ Mock represents **external API** (browser, Web Crypto, DOM)
- ✅ Mock is **stable and reusable**

### When NOT to create a new mock:
- ❌ Mock is **specific to one test file**
- ❌ Mock represents **internal module** that changes frequently
- ❌ Different tests need **different mock implementations**

## Examples

### Using browser mock:
```javascript
jest.mock('/src/utils/browser.js', () => require('../../__mocks__/browser.js'));
import { Wallets } from '../wallets.js';

// browser.storage.local.get/set are now mocked
```

### Using crypto mock:
```javascript
const { mockCrypto } = require('../../__mocks__/crypto.js');

test('encrypts data', async () => {
    mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16));
    // ... test code
});
```

### Using globals mock:
```javascript
require('../../__mocks__/globals.js');

test('encodes base64', () => {
    expect(window.btoa).toBeDefined();
    // ... test code
});
```
