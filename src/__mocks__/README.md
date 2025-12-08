# Jest Mocks

This directory contains reusable mock modules for Jest tests.

## Available Mocks

### Browser Environment

#### `window.js`
Complete window object mock with event listeners, storage APIs, location, navigator, and Base64 functions.

**Usage:**
```javascript
require('../../__mocks__/window.js');
```

**Provides:**
- `window.addEventListener/removeEventListener/dispatchEvent`
- `window.localStorage` (getItem, setItem, removeItem, clear)
- `window.sessionStorage` (getItem, setItem, removeItem, clear)
- `window.location` (href, pathname, search, hash)
- `window.navigator` (userAgent, language)
- `window.btoa/atob` - Base64 encoding/decoding

#### `globals.js`
Minimal global functions mock (btoa, atob only). Use `window.js` for more complete mock.

**Usage:**
```javascript
require('../../__mocks__/globals.js');
```

**Used in:**
- `src/utils/__tests__/keys.test.js`

**Provides:**
- `window.btoa` - Base64 encoding
- `window.atob` - Base64 decoding

#### `console.js`
Console object mock for suppressing output and tracking calls.

**Usage:**
```javascript
require('../../__mocks__/console.js');
```

**Used in:**
- `src/utils/__tests__/errors.test.js`

**Provides:**
- All console methods: log, warn, error, info, debug, trace, table, group, time, count, etc.

---

### Browser Extensions

#### `browser.js`
Mock for browser extension API (browser.storage, browser.runtime) - universal WebExtension API.

**Usage:**
```javascript
jest.mock('/src/utils/browser.js', () => require('../../__mocks__/browser.js'));
```

**Used in:**
- `src/blockchain/__tests__/wallets.test.js`

**Provides:**
- `browser.storage.local/session.get/set/remove`
- `browser.runtime.sendMessage`
- `browser.runtime.onMessage.addListener`

**Note:** Use `browser` API instead of `chrome` API for cross-browser compatibility.

#### `webextension-polyfill.js`
Mock for webextension-polyfill library (automatically used by Jest).

---

### Storage & Database

#### `indexeddb.js`
IndexedDB API mock with database operations and transactions.

**Usage:**
```javascript
require('../../__mocks__/indexeddb.js');
```

**Used in:**
- `src/utils/__tests__/errors.test.js`

**Provides:**
- `indexedDB.open/deleteDatabase`
- Database transactions and object stores
- CRUD operations (add, put, get, delete, clear)
- Cursor operations

---

### Cryptography

#### `crypto.js`
Web Crypto API mock for encryption, hashing, and key derivation.

**Usage:**
```javascript
const { mockCrypto } = require('../../__mocks__/crypto.js');
```

**Used in:**
- `src/utils/__tests__/keys.test.js`

**Provides:**
- `crypto.subtle.importKey/deriveKey/encrypt/decrypt/digest`
- `crypto.getRandomValues`

---

### External Libraries

#### `@dfinity/utils.js`
DFINITY utilities mock for hex string conversion.

**Usage:**
Automatically used via jest.config.js moduleNameMapper.

**Used in:**
- `src/utils/__tests__/keys.test.js`

**Provides:**
- `hexStringToUint8Array`

#### `@icp-sdk/canisters/ledger/icp.js`
ICP Ledger canister mock for account identifier operations.

**Usage:**
Automatically used via jest.config.js moduleNameMapper.

**Used in:**
- `src/utils/__tests__/keys.test.js`

**Provides:**
- `AccountIdentifier.fromPrincipal`

---

## Usage Examples

### Multiple mocks in one test:
```javascript
// Import all required mocks
require('../../__mocks__/window.js');
require('../../__mocks__/console.js');
require('../../__mocks__/chrome.js');
require('../../__mocks__/indexeddb.js');

// Now all globals are mocked
test('example test', () => {
    expect(global.window).toBeDefined();
    expect(global.chrome).toBeDefined();
    expect(global.indexedDB).toBeDefined();
});
```

### Using crypto mock:
```javascript
const { mockCrypto } = require('../../__mocks__/crypto.js');

test('encrypts data', async () => {
    mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16));
    // ... test code
});
```

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

### Adding New Mocks:
1. Use descriptive file names (lowercase, kebab-case)
2. Add JSDoc comments explaining purpose
3. Export the mock object
4. Set global variables if needed
5. Use `jest.fn()` for all functions
6. Update this README with usage examples
