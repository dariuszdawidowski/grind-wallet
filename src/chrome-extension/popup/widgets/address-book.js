/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { Avatar } from '/src/chrome-extension/popup/widgets/avatar.js';
import { AddPlus } from '/src/chrome-extension/popup/widgets/add.js';
import { Sheet } from '/src/chrome-extension/popup/widgets/sheet.js';
import { InputText, InputAddress } from '/src/chrome-extension/popup/widgets/input.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { DrawerList } from '/src/chrome-extension/popup/widgets/drawer-list';
import { shortAddress } from '/src/utils/general.js';

export class AddressBook extends DrawerList {

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
                    address: wallet.principal,
                    dynamic: true
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
            Object.entries(this.contacts['My wallets']).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([id, contact]) => {
                this.renderEntry({
                    container: walletsGroupElement,
                    id,
                    name: contact.name,
                    value: contact.address,
                    icon: contact?.dynamic ? null : 'assets/material-design-icons/pencil-box.svg'
                });
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
            Object.entries(this.contacts['Contacts']).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([id, contact]) => {
                this.renderEntry({
                    container: contactsGroupElement,
                    id,
                    name: contact.name,
                    value: contact.address,
                    icon: 'assets/material-design-icons/pencil-box.svg'
                });
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

            // Edit icon click
            const icon = event.target.closest('.icon');
            if (icon) {
                const entry = icon.closest('.entry');
                if (entry) {
                    const id = entry.dataset.value;
                    const contact = this.contacts[name][id];
                    this.sheet.clear();
                    this.sheet.append({
                        title: `Edit ${contact.name}`,
                        component: new SheetContact({ app: this.app, addressbook: this, group: name })
                    });
                    return;
                }
            }

            // Entry click
            const entry = event.target.closest('.entry');
            if (entry) {
                const id = entry.dataset.value;
                const contact = this.contacts[name][id];
                this.callback?.(contact.address);
            }

        });

        return entriesContainer;
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
