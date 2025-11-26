/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { Sheet } from '/src/chrome-extension/popup/widgets/sheet.js';
import { InputText, InputAddress } from '/src/chrome-extension/popup/widgets/input.js';
import { Button, ButtLink } from '/src/chrome-extension/popup/widgets/button.js';
import { ListView } from '/src/chrome-extension/popup/widgets/list';

class Contact {

    constructor({ id = null, name, address, dynamic = false }) {
        // Contact ID
        this.id = id;
        // Contact name
        this.name = name;
        // Contact address list { 'icp:pid': ..., 'icp:acc0': ..., 'btc:bech32': ... }
        this.address = address;
        // Is dynamic (from wallets)
        this.dynamic = dynamic;
    }

    /**
     * Custom JSON serialization
     */

    toJSON() {
        return {
            name: this.name,
            address: this.address
        };
    }

}

export class AddressBook extends ListView {

    constructor({ app }) {
        super({ app });

        // Contact groups
        this.groups = null;

        // Contact list {'group': { id: Contact, ... }, ...}
        this.contacts = null;

        // Callback on address select
        this.callback = null;

        // Bottom sheet
        this.sheet = new Sheet({ app, id: '#contact-sheet', hidden: false });
        this.element.append(this.sheet.element);
    }

    /**
     * Load address book from storage
     */

    async load() {
        const data = await chrome.storage.local.get(['address:groups', 'address:contacts']);
        this.deserializeGroups(('address:groups' in data) ? data['address:groups'] : {});
        this.deserializeContacts(('address:contacts' in data) ? data['address:contacts'] : {});
    }

    /**
     * Save address book to storage
     */

    async save() {
        await chrome.storage.local.set({
            'address:groups': this.serializeGroups(),
            'address:contacts': this.serializeContacts()
        });
    }

    /**
     * Add a new group
     */

    addGroup({ id = null, name }) {
        if (!id) id = crypto.randomUUID();
        this.groups[id] = { name };
        this.contacts[id] = {};
    }

    /**
     * Edit a group
     */

    setGroup({ id, name = null, order = null }) {
        if (id in this.groups) {
            if (name) this.groups[id].name = name;
            if (order) this.groups[id].order = order;
        }
    }

    /**
     * Delete a group
     */

    delGroup(id) {
        if (id in this.groups) {
            delete this.groups[id];
            delete this.contacts[id];
        }
    }

    /**
     * Add a new contact
     */

    addContact({ id = null, name, address, group }) {
        if (!id) id = crypto.randomUUID();
        this.contacts[group][id] = new Contact({ id, name, address });
    }

    /**
     * Edit a contact
     */

    setContact({ id, name = null, address = null, group }) {
        if ((group in this.contacts) && (id in this.contacts[group])) {
            if (name) this.contacts[group][id].name = name;
            if (address) this.contacts[group][id].address = address;
        }
    }

    /**
     * Delete a contact
     */

    delContact(id) {
        for (const group in this.contacts) {
            if (this.contacts[group][id]) {
                delete this.contacts[group][id];
                break;
            }
        }
    }

    /**
     * Deserialize groups from storage
     */

    deserializeGroups(data) {
        // Default groups structure
        this.groups = { 'my': { name: 'My wallets', order: 1 }, 'contacts': { name: 'Contacts', order: 2 } };

        // Add stored groups
        Object.entries(data).forEach(([id, group]) => {
            this.groups[id] = { name: group.name, order: group.order || 99 };
        });
    }

    /**
     * Deserialize contacts from storage
     */

    deserializeContacts(data) {
        // Default contacts structure
        this.contacts = { 'my': {}, 'contacts': {} };

        // Add dynamic wallets to 'My wallets' group
        this.app.wallets.get().forEach(wallet => {
            this.contacts['my'][`mywallet-${wallet.principal}`] = new Contact({
                id: `mywallet-${wallet.principal}`,
                name: wallet.name,
                address: { 'icp:pid': wallet.principal, 'icp:acc0': wallet.account },
                dynamic: true
            });
        });

        // Add stored contacts
        Object.entries(data).forEach(([group, contacts]) => {
            if (!(group in this.contacts)) this.contacts[group] = {};
            Object.entries(contacts).forEach(([id, contact]) => {
                this.contacts[group][id] = new Contact({
                    id,
                    name: contact.name,
                    address: contact.address,
                    dynamic: contact.dynamic || false
                });
            });
        });
    }

    /**
     * Delete dynamic wallets from contacts before saving
     */

    serializeContacts() {
        // Clone contacts
        const updatedContacts = JSON.parse(JSON.stringify(this.contacts));

        // Remove dynamic wallets from 'My wallets' group
        Object.keys(updatedContacts['my']).forEach(id => {
            if (id.startsWith('mywallet-')) {
                delete updatedContacts['my'][id];
            }
        });

        return updatedContacts;
    }

    /**
     * Delete base groups before saving
     */

    serializeGroups() {
        const updatedGroups = JSON.parse(JSON.stringify(this.groups));
        delete updatedGroups['my'];
        delete updatedGroups['contacts'];
        return updatedGroups;
    }

    /**
     * Render address book
     */

    render() {

        // My wallets
        this.renderGroup({
            groupId: 'my',
            data: this.contacts['my'],
            emptyMsg: 'Your wallets will appear here automatically.<br>You can also manually add your wallets from other applications.',
            newMsg: 'New entry for my wallets'
        });

        // Contacts
        this.renderGroup({
            groupId: 'contacts',
            data: this.contacts['contacts'],
            emptyMsg: 'You have no contacts saved yet.<br>Tap the + button to add a new contact.',
            newMsg: 'New contact'
        });

    }

    /**
     * Render group
     */

    renderGroup({ groupId, data, emptyMsg, newMsg }) {
        this.renderList({
            name: this.groups[groupId].name,
            data,
            emptyMsg,
            onSelect: (contactId) => {
                const contact = this.contacts[groupId][contactId];
                this.callback?.(contact.address);
            },
            onAdd: () => {
                this.sheet.clear();
                this.sheet.append({
                    title: newMsg,
                    component: new SheetContact({ app: this.app, addressbook: this, group: groupId })
                });
            },
            onEdit: (contactId) => {
                const contact = this.contacts[groupId][contactId];
                this.sheet.clear();
                this.sheet.append({
                    title: `Edit ${contact.name}`,
                    component: new SheetContact({ app: this.app, addressbook: this, group: groupId, contactId: contactId, contact })
                });
            }
        });
    }

}

/**
 * Add/Edit contact sheet
 */

export class SheetContact extends Component {

    constructor({ app, addressbook, group, contactId, contact = null }) {
        super({ app });

        // Build
        this.element.classList.add('form');

        // Name
        const name = new InputText({
            placeholder: 'Contact name'
        });
        if (contact) name.set(contact.name);
        this.append(name);

        // Principal ID
        const principalId = new InputAddress({
            placeholder: 'Principal ID',
        });
        if (contact && contact.address['icp:pid']) principalId.set(contact.address['icp:pid']);
        this.append(principalId);

        // Account ID
        const accountId = new InputAddress({
            placeholder: 'Account ID (optional)',
        });
        if (contact && contact.address['icp:acc0']) accountId.set(contact.address['icp:acc0']);
        this.append(accountId);

        // Save button
        const buttonSave = new Button({
            text: contact ? 'Update contact' : 'Save contact',
            classList: ['bottom'],
            click: () => {
                if (!name.valid()) {
                    alert('Invalid name');
                }
                else if (!principalId.valid()) {
                    alert('Invalid Principal ID');
                }
                else if (accountId.get().length && !accountId.valid()) {
                    alert('Invalid Account ID');
                }
                else {
                    const address = { 'icp:pid': principalId.get() };
                    if (accountId.get().length) address['icp:acc0'] = accountId.get();
                    if (contact) {
                        addressbook.setContact({
                            id: contactId,
                            name: name.get(),
                            address,
                            group
                        });
                    }
                    else {
                        addressbook.addContact({
                            name: name.get(),
                            address,
                            group
                        });
                    }
                    addressbook.save().then(() => {
                        addressbook.element.innerHTML = '';
                        addressbook.element.append(addressbook.sheet.element);
                        addressbook.render();
                        addressbook.sheet.hide();
                    });
                }
            }
        });
        this.append(buttonSave);

        // Delete button
        if (contact) {
            this.append(new ButtLink({
                text: `Remove contact`,
                click: () => {
                    if (confirm('Delete this contact?')) {
                        addressbook.delContact(contactId);
                        addressbook.save().then(() => {
                            addressbook.element.innerHTML = '';
                            addressbook.element.append(addressbook.sheet.element);
                            addressbook.render();
                            addressbook.sheet.hide();
                        });
                    }
                }
            }));            
        }

    }

}
