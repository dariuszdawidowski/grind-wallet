# Grind Wallet - AI Coding Agent Instructions

## Project Overview

Chrome extension cryptocurrency wallet for Internet Computer (ICP) blockchain. Built with vanilla JavaScript, webpack, and DFINITY SDK.

## Architecture

### Core Components
- **`src/chrome-extension/popup/`** - Main UI part of the extension
  - `popup.js` - Main entry point for UI, initializes `GrindWalletPlugin` class
  - `popup.css` - Monolithic css file, pure css3, uses the latest methods, ignores old browsers
  - `popup.html` - Main UI html
  - `dev-mode.js` - Works only in the development mode with DEV_MODE=1 flag
- **`src/chrome-extension/popup/pages/accounts`** - Views components
- **`src/chrome-extension/popup/pages/onboarding`** - Views components related to onboarding procedure (setup password, accept terms etc.)
- **`src/chrome-extension/popup/widgets/`** - Reusable UI components
- **`src/chrome-extension/popup/tasks/`** - Handling and displaying long-running tasks
- **`src/blockchain/`** - Blockchain abstraction layer:
  - `wallets.js` - Wallet manager (CRUD operations)
  - `wallet.js` - Abstract wallet with tokens/NFTs collections
  - `InternetComputer/wallet-icp.js` - ICP wallet implementation
  - `tokens.js` - Tokens manager (CRUD operations)
  - `token.js` - Abstract token class
  - `InternetComputer/token-icp.js` - Native ICP token
  - `InternetComputer/token-icrc.js` - ICRC standard tokens (ICP)
  - `nfts.js` - NFTs manager (CRUD operations)
  - `nft.js` - Abstract NFT class
  - `InternetComputer/nft-ext.js` - NFT EXT implementation (ICP)
  - `InternetComputer/nft-icrc7.js` - NFT ICRC-7 implementation (ICP)
  - `InternetComputer/candid/*` - ICP canisters candid interfaces
- **`src/utils/`** - Universal utils
  - `biometric.js` - Biometric auth
  - `component.js` - Base component for all UI widgets and views (pages)
  - `currency.js` - Formating and converting currencies
  - `data-cache.js` - Cache fetched data with overdue timestap
  - `dictionary.js` - Name lookup tables
  - `errors.js` - Rerouting errors to IndexedDB logs
  - `general.js` - General purpose utils (convert, validation etc.)
  - `image-cache.js` - Cache fetched images into IndexedDB
  - `keys.js` - Cryptography: key generation (BIP39/BIP32), encryption (AES-GCM), identity management
  - `logbase.js` - Logging system class to inherit
  - `logger.js` - Logging events into IndexedDB
  - `object-cache.js` - Caching JavaScript objects to avoid creating duplicates in other code spaces
  - `password.js` - Handling password cryptography

### Data Flow
1. User password → decrypt private keys (AES-GCM in `keys.js`)
2. Private key → Secp256k1 Identity → Principal ID → Account ID
3. HttpAgent (`https://icp-api.io`) → Ledger/Index canisters → token balances/transactions
4. All persistent data stored in `chrome.storage.local` (encrypted private keys)
5. Session data in `chrome.storage.session` (expires after inactivity)

### Key Patterns
- **Component-based UI**: All UI elements extend `Component` class from `src/utils/component.js`
- **Sheet system**: Modal overlays managed by `Sheet` class (main bottom sheet at `#sheet`)
- **Page switching**: `app.page('name')` destroys current page, creates new
- **Storage structure** in `chrome.storage.local`:
  ```javascript
  {
    salt: string,           // Password salt
    password: string,       // Password hash
    wallets: {
      [publicKey]: {
        blockchain: 'Internet Computer',
        name: string,
        public: string,
        secret: {ciphertext, iv, salt},  // Encrypted private key
        tokens: {[canisterId]: {...}},   // ICRC tokens
        nfts: {[id]: {...}}
      }
    }
  }
  ```

## Development Workflows

### Build Commands
```bash
npm run build:dev      # Development build with source maps
npm run build:prod     # Production build (minified)
npm run build:test     # E2E test build (requires secrets.local.json)
npm run deploy         # Build + create .zip for Chrome Store
npm run test           # Jest unit tests
```

### Testing Extension
1. Build: `npm run build:dev`
2. Chrome → `chrome://extensions/` → "Load unpacked" → `dist/chrome/`
3. Fullscreen mode: `chrome-extension://[id]/popup.html`

### Security & Dependencies
- **Native Web Crypto API** used in `keys.js` (AES-GCM encryption, PBKDF2 key derivation)
- **Node.js polyfills required**: `crypto-browserify`, `stream-browserify`, `buffer` (for BIP39/BIP32 libraries)
- **Webpack fallbacks**: See `webpack.config.js` resolve.fallback (vm set to false)
- **CSP**: `manifest.json` has restrictive Content Security Policy (`object-src 'none'`)

## Code Style

- **Language**: Modern JavaScript (ES2022), English only (code & comments)
- **Indentation**: 4 spaces
- **Braces**: Line break before `else`
  ```javascript
  if (condition) {
      // code
  }
  else {
      // code
  }
  ```
- **Comments**:
  - Block comments for functions/classes (with empty line after)
  - Single-line comments for inline (no empty line after)
- **Strings**: Single quotes `'text'`, template literals for variables `` `${var}` ``
- **HTML**: HTML5, no self-closing tags (no `<br />`)
- **File naming**: Use kebab-case (e.g., `send-token.js`)

## Critical Implementation Details

### Token Management
- ICP token (native) always present at `ryjl3-tyaaa-aaaaa-aaaba-cai`
- ICRC tokens added dynamically by user
- Each token needs `build({ agent })` called to initialize actors
- Index canisters (optional) provide transaction history

### Identity & Keys
- **BIP44 derivation path**: `m/44'/223'/0'/0/0` (ICP standard)
- **Private keys encrypted** with user password (never stored plain)
- **Identity recreation** on each session from encrypted key
- **Agent timeout**: 10 seconds for IC network connection

### Canister Communication
- **Candid interfaces**: Pre-generated in `src/blockchain/InternetComputer/candid/`
- **Actor creation**: Use `@dfinity/agent` Actor or specialized canisters (LedgerCanister)
- **Caching**: `src/actor-cache.js` for actor instances

### UI Patterns
- **Sheet navigation**: `app.sheet.append({ title, component })` for modals
- **Drawer menu**: `app.drawer` for side panels (e.g., address book)
- **Task manager**: `src/chrome-extension/popup/widgets/tasks.js` for background operations
- **Page lifecycle**: Each page destroyed/recreated on navigation (no SPA routing)

## Common Operations

### Adding a new token
1. User inputs canister ID
2. Call `token.metadata()` to fetch name/symbol/decimals
3. Validate ICRC standards support
4. Store in `wallet.tokens`
5. Save to `chrome.storage.local`

### Sending tokens
1. Decrypt wallet private key
2. Create agent with identity
3. Call `token.transfer({ principal, amount })`
4. Log transaction in `app.log` (history system)

### Transaction history
- **ICP**: Via ICP Index canister (`qhbym-qaaaa-aaaaa-aaafq-cai`)
- **ICRC**: Via ICRC Index if available (ICRC-106 standard)
- Cached in RAM with 1-minute TTL (`src/actor-cache.js`)

## AI Chat Guidelines
- Communicate in Polish on chat
- Write code and comments in English
- Follow all style guidelines above
- Prefer concise one-line algorithms
- Security first: validate all inputs, encrypt sensitive data
