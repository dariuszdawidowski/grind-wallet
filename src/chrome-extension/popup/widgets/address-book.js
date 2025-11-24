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

export class AddressBook extends Component {

    constructor({ app }) {
        super({ app });

        // CSS class
        this.element.classList.add('address-book');

        // Contact list {'group name': { id: { name, address } }, ...}, ...}
        this.contacts = { 'My wallets': {}, 'Contacts': {} };

        // Callback on address select
        this.callback = null;

        // Bottom sheet
        this.sheet = new Sheet({ app, id: '#contact-sheet', hidden: false });
        this.element.append(this.sheet.element);

    }

    async load() {
        const data = await chrome.storage.local.get('addressbook');
        if (data && data.addressbook) this.contacts = data.addressbook;
        this.contacts = this.addDynamicWallets(this.contacts);
    }

    async save() {
        await chrome.storage.local.set({ addressbook: this.delDynamicWallets(this.contacts) });
    }

    addGroup({ name }) {
        if (!id) id = crypto.randomUUID();
        this.contacts[id] = {};
    }

    addContact({ id = null, name, address, group }) {
        if (!id) id = crypto.randomUUID();
        this.contacts[group][id] = { name, address };
    }

    delContact(id) {
        for (const group in this.contacts) {
            if (this.contacts[group][id]) {
                delete this.contacts[group][id];
                break;
            }
        }
    }

    /**
     * Add dynamic wallets from app to contacts
     */

    addDynamicWallets(contacts) {
        // Clone contacts
        const updatedContacts = JSON.parse(JSON.stringify(contacts));

        // Add wallets to 'My wallets' group
        this.app.wallets.get().forEach(wallet => {
            // Check if wallet already exists
            let exists = false;
            Object.values(updatedContacts['My wallets']).forEach(contact => {
                if (contact.address === wallet.address) exists = true;
            });
            // Add wallet if not exists
            if (!exists) {
                updatedContacts['My wallets'][`mywallet-${wallet.principal}`] = {
                    name: wallet.name,
                    address: wallet.principal
                };
            }
        });

        return updatedContacts;
    }

    /**
     * Delete dynamic wallets from contacts before saving
     */

    delDynamicWallets(contacts) {
        // Clone contacts
        const updatedContacts = JSON.parse(JSON.stringify(contacts));

        // Remove dynamic wallets from 'My wallets' group
        Object.keys(updatedContacts['My wallets']).forEach(id => {
            if (id.startsWith('mywallet-')) {
                delete updatedContacts['My wallets'][id];
            }
        });

        return updatedContacts;
    }

    /**
     * Render address book
     */

    render() {
        // My wallets header
        const walletsGroupElement = this.renderGroup({ name: 'My wallets' });

        // Render wallets
        if (Object.values(this.contacts['My wallets']).length) {
            Object.values(this.contacts['My wallets']).sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                this.renderContact(walletsGroupElement, contact);
            });
        }
        else {
            const noWallets = document.createElement('div');
            noWallets.classList.add('infotext');
            noWallets.innerHTML = 'Your wallets will appear here automatically.<br>You can also manually add your wallets from other applications.';
            walletsGroupElement.append(noWallets);
        }

        // Contacts header
        const contactsGroupElement = this.renderGroup({ name: 'Contacts' });

        // Render contacts
        if (Object.values(this.contacts['Contacts']).length) {
            Object.values(this.contacts['Contacts']).sort((a, b) => a.name.localeCompare(b.name)).forEach(contact => {
                this.renderContact(contactsGroupElement, contact);
            });
        }
        else {
            const noContacts = document.createElement('div');
            noContacts.classList.add('infotext');
            noContacts.innerHTML = 'You have no contacts saved yet.<br>Tap the + button to add a new contact.';
            contactsGroupElement.append(noContacts);
        }
    }

    /**
     * Render group header & container
     * @param {string} name Group name
     */

    renderGroup({ name }) {
        // Header container
        const header = document.createElement('div');
        header.classList.add('header');
        this.element.append(header);

        // Header row
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('header-row');
        header.append(titleContainer);

        // Title
        const title = document.createElement('h1');
        title.innerText = name;
        titleContainer.append(title);

        // Add contact button
        const plusButton = new AddPlus({
            click: () => {
                this.sheet.clear();
                this.sheet.append({
                    title: `New entry for ${name}`,
                    component: new SheetContact({ app: this.app, addressbook: this, group: name })
                });
            }
        });
        plusButton.element.style.margin = '16px 16px 0 auto';
        titleContainer.append(plusButton.element);

        // Separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        header.append(separator);

        // Contacts container
        const entriesContainer = document.createElement('div');
        this.element.appendChild(entriesContainer);
        entriesContainer.addEventListener('click', (event) => {
            const entry = event.target.closest('.entry');
            if (entry) {
                const address = entry.dataset.address;
                this.callback?.(address);
            }
        });

        return entriesContainer;
    }

    /**
     * Render single contact entry
     */

    renderContact(container, contact) {
        // Entry bar
        const entry = document.createElement('div');
        entry.dataset.address = contact.address;
        entry.classList.add('entry');
        container.appendChild(entry);

        // Avatar
        const avatar = new Avatar({
            app: this.app,
            id: contact.id,
            name: contact.name
        });
        entry.append(avatar.element);

        // Middle section
        const middle = document.createElement('div');
        entry.append(middle);

        // Name
        const name = document.createElement('div');
        name.classList.add('name');
        name.innerText = contact.name;
        middle.append(name);

        // Address
        const address = document.createElement('div');
        address.classList.add('address');
        address.innerText = shortAddress(contact.address);
        middle.append(address);

        // Right icon
        const right = document.createElement('div');
        right.classList.add('icon');
        entry.append(right);
        right.innerHTML = '<img src="assets/material-design-icons/pencil-box.svg"></img>';

    }

}

/**
 * Add/Edit contact sheet
 */

export class SheetContact extends Component {

    constructor({ app, addressbook, group }) {
        super({ app });

        // Build
        this.element.classList.add('form');

        // Name
        const name = new InputText({
            placeholder: 'Contact name'
        });
        this.append(name);

        // Address
        const address = new InputAddress({
            placeholder: 'Principal ID or Account ID',
        });
        this.append(address);

        // Save button
        const buttonSave = new Button({
            text: 'Save contact',
            classList: ['bottom'],
            click: () => {
                if (!name.valid()) {
                    alert('Invalid name');
                }
                else if (!address.valid()) {
                    alert('Invalid address');
                }
                else {
                    addressbook.addContact({
                        name: name.get(),
                        address: address.get(),
                        group: group
                    });
                    addressbook.save().then(() => {
                        addressbook.element.innerHTML = '';
                        addressbook.render();
                        this.app.sheet.hide();
                    });
                }
            }
        });
        this.append(buttonSave);

    }

}
