# Grind Wallet

Internet Computer cryptocurrency wallet as a browser plugin.
Copyright (C) 2024-2025 Dariusz Dawidowski


## Compatibility

Currently, it only works in Chrome and in browsers that support compatible extensions (like Opera).


## Installation

Manually copy all graphics to the assets/ directory as they are not part of the open source wallet source code.

```bash
# Install dependencies
npm install
```


## Development build

```bash
npm run build:dev
```


## Development launch

To install open in Chrome extensions page [chrome://extensions/] -> Load unpacked -> Point to builded dist/chrome directory.
You can launch from extension bar or better in the fulscreen mode [chrome-extension://fbalmoobdnjmfbhbgaiimcbolcpnmcjf/popup.html].


## E2E test build
Configure file in the root dir secrets.local.json:
{
    "password": "..."
}

```bash
npm run build:test
```


## Production build

```bash
# Create .zip ready for Chrome Store -> dist/grind-wallet.zip
npm run deploy
```


## Software License

Except as noted below this software is distributed under the terms of the GNU General Public License version 3 (GPL-3.0), which allows free copying, modification, and distribution of the source code, provided the requirements of the license are met.

Restrictions regarding the logo and name:

The name and logo of this software are protected by copyright and/or trademark rights owned by the project owner. Their use for commercial, promotional, or any other purposes is strictly prohibited, except in cases where they are used explicitly to state support for or compatibility with the technology provided by this software.

Prohibited actions:

- Using the logo and/or name of the project in a way that may mislead users about the origin or authenticity of the software.

- Creating or distributing versions of the software under a modified name or using the project’s logo to deceive or harm users.

Violation of these terms will be treated as a breach of the law and may result in appropriate legal action.


## License for the source code GNU GPL-3

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.


## License for the QR code library

The file in libs/qrcode.min.js has a separate license. Please see <https://davidshimjs.github.io/qrcodejs/>.

MIT License


## Additional licenes

Additional licenses are generated in the popup.X.js.LICENSE.txt file during NodeJS compilation.
