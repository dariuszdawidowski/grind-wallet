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

        // My wallets
        this.renderList({
            name: 'My wallets',
            data: this.contacts['My wallets'],
            emptyMsg: 'Your wallets will appear here automatically.<br>You can also manually add your wallets from other applications.',
            onSelect: (id) => {
                const contact = this.contacts['My wallets'][id];
                this.callback?.(contact.address);
            },
            onAdd: () => {
                this.addContact('New entry for my wallets', 'My wallets');
            },
            onEdit: (id) => {
                this.editContact(id, 'My wallets');
            }
        });

        // Contacts
        this.renderList({
            name: 'Contacts',
            data: this.contacts['Contacts'],
            emptyMsg: 'You have no contacts saved yet.<br>Tap the + button to add a new contact.',
            onSelect: (id) => {
                const contact = this.contacts['Contacts'][id];
                this.callback?.(contact.address);
            },
            onAdd: () => {
                this.addContact('New contact', 'Contacts');
            },
            onEdit: (id) => {
                this.editContact(id, 'Contacts');
            }

        });

    }

    addContact(title, group) {
        this.sheet.clear();
        this.sheet.append({
            title,
            component: new SheetContact({ app: this.app, addressbook: this, group })
        });
    }

    editContact(id, group) {
        const contact = this.contacts[group][id];
        this.sheet.clear();
        this.sheet.append({
            title: `Edit ${contact.name}`,
            component: new SheetContact({ app: this.app, addressbook: this, group })
        });

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
