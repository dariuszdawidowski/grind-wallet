/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { Avatar } from '/src/chrome-extension/popup/widgets/avatar.js';
import { AddPlus } from '/src/chrome-extension/popup/widgets/add.js';
import { Sheet } from '/src/chrome-extension/popup/widgets/sheet.js';
import { InputText, InputAddress } from '/src/chrome-extension/popup/widgets/input.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { shortAddress } from '/src/utils/general.js';

export class DrawerList extends Component {

    constructor({ app }) {
        super({ app });
    }

    /**
     * Render single contact entry
     */

    renderEntry({ container, id, name, value, icon }) {

        // Entry bar
        const entry = document.createElement('div');
        entry.dataset.value = id;
        entry.classList.add('entry');
        container.appendChild(entry);

        // Avatar
        const avatar = new Avatar({
            app: this.app,
            id,
            name
        });
        entry.append(avatar.element);

        // Middle section
        const middle = document.createElement('div');
        entry.append(middle);

        // Title
        const title = document.createElement('div');
        title.classList.add('name');
        title.innerText = name;
        middle.append(title);

        // Subtitle
        const subtitle = document.createElement('div');
        subtitle.classList.add('address');
        subtitle.innerText = shortAddress(value);
        middle.append(subtitle);

        // Right icon
        const right = document.createElement('div');
        right.classList.add('icon');
        entry.append(right);
        right.innerHTML = `<img src="${icon}"></img>`;

    }

}