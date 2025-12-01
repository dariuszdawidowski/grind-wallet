/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { browser } from '/src/utils/browser.js';
import { Sheet } from '/src/extension/popup/widgets/sheet.js';
import { InputText, InputAddress } from '/src/extension/popup/widgets/input.js';
import { Button, ButtLink } from '/src/extension/popup/widgets/button.js';
import { AddPlus } from '/src/extension/popup/widgets/add.js';
import { ListView } from '/src/extension/popup/widgets/list';

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

    /**
     * Get best address
     * @param accept Array list of accepted addresses
     */

    getAddress(accept) {
        for (const key of accept) {
            if (key in this.address) {
                return this.address[key];
            }
        }
        return null;
    }

    /**
     * Get contact by address
     */

    hasAddress(address) {
        return Object.values(this.address).includes(address);
    }

}

export class AddressBook extends ListView {

    constructor(args) {
        super(args);

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
        const data = await browser.storage.local.get(['address:groups', 'address:contacts']);
        this.deserializeGroups(('address:groups' in data) ? data['address:groups'] : {});
        this.deserializeContacts(('address:contacts' in data) ? data['address:contacts'] : {});
    }

    /**
     * Save address book to storage
     */

    async save() {
        await browser.storage.local.set({
            'address:groups': this.serializeGroups(),
            'address:contacts': this.serializeContacts()
        });
    }

    /**
     * Add a new group
     */

    addGroup({ id = null, name }) {
        if (!id) id = crypto.randomUUID();
        // Compute order based on current number of groups
        const order = Object.keys(this.groups).length + 1;
        this.groups[id] = { name, order };
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
        // Recompute group orders to remove gaps after deletion
        const groupsArr = Object.entries(this.groups);
        groupsArr.sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
        groupsArr.forEach(([gid], index) => {
            this.groups[gid].order = index + 1;
        });
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
        this.groups = {};

        // Add stored groups
        Object.entries(data).forEach(([id, group]) => {
            this.groups[id] = { name: group.name, order: group.order };
        });

        // Add default groups if missing
        if (!('my' in this.groups)) this.groups['my'] = { name: 'My wallets', order: 1 };
        if (!('contacts' in this.groups)) this.groups['contacts'] = { name: 'Contacts', order: 2 };
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
        return JSON.parse(JSON.stringify(this.groups));
    }

    /**
     * Get all contact names
     */

    getAllNames() {
        const names = [];
        for (const group in this.contacts) {
            for (const contactId in this.contacts[group]) {
                const contact = this.contacts[group][contactId];
                names.push(contact.name);
            }
        }
        return names;
    }

    /**
     * Get contact by name (any case)
     */

    getByName(name) {
        for (const group in this.contacts) {
            for (const contactId in this.contacts[group]) {
                const contact = this.contacts[group][contactId];
                if (contact.name.toLowerCase() == name.trim().toLowerCase()) {
                    return contact;
                }
            }
        }
        return null;
    }

    /**
     * Get contact by address
     */

    getByAddress(address) {
        for (const group in this.contacts) {
            for (const contactId in this.contacts[group]) {
                const contact = this.contacts[group][contactId];
                if (contact.hasAddress(address)) {
                    contact.group = group;
                    return contact;
                }
            }
        }
        return null;
    }

    /**
     * Render address book
     */

    render() {

        // Render groups with contacts
        Object.entries(this.groups).sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0)).forEach(([groupId]) => {
            if (groupId == 'my') {
                this.renderGroup({
                    groupId: 'my',
                    data: this.contacts['my'],
                    emptyMsg: 'Your wallets will appear here automatically.<br>You can also manually add your wallets from other applications.',
                    newMsg: 'New entry for my wallets',
                    editGroup: false
                });
            }
            else if (groupId == 'contacts') {
                this.renderGroup({
                    groupId,
                    data: this.contacts[groupId],
                    emptyMsg: 'You have no contacts saved yet.<br>Tap the + button to add a new contact.',
                    newMsg: 'New contact',
                    editGroup: false
                });
            }
            else {
                this.renderGroup({
                    groupId,
                    data: this.contacts[groupId],
                    emptyMsg: 'You have no contacts saved yet.<br>Tap the + button to add a new contact.',
                    newMsg: 'New contact'
                });
            }
        });

        // Add new group
        this.addNewGroupButton = new AddPlus({
            text: 'Add new group',
            classList: ['dark'],
            style: 'margin-top: 20px;',
            click: () => {
                this.sheet.clear();
                this.sheet.append({
                    title: 'New group',
                    component: new SheetGroup({ app: this.app, addressbook: this })
                });
            }
        });
        this.addNewGroupButton.hide();
        this.append(this.addNewGroupButton);

        // Expand/collapse
        this.manualExpand = new ButtLink({
            text: 'Collapse and edit groups',
            style: 'color: #333; padding: 20px 0;',
            classList: ['bottom'],
            click: () => {
                const direction = this.toggleCollapse();
                if (direction == 'collapsed') {
                    this.onCollapseGroups();
                }
                else if (direction == 'expanded') {
                    this.onExpandGroups();
                }
            }
        });
        this.append(this.manualExpand);

    }

    /**
     * Render group
     */

    renderGroup({ groupId, data, emptyMsg, newMsg, editGroup = true }) {
        this.renderList({
            id: groupId,
            name: this.groups[groupId].name,
            data,
            emptyMsg,
            onSelectEntry: (contactId) => {
                const contact = this.contacts[groupId][contactId];
                this.callback?.(contact);
            },
            onAddEntry: () => {
                this.sheet.clear();
                this.sheet.append({
                    title: newMsg,
                    component: new SheetContact({ app: this.app, addressbook: this, groupId })
                });
            },
            onEditEntry: (contactId) => {
                const contact = this.contacts[groupId][contactId];
                this.sheet.clear();
                this.sheet.append({
                    title: `Edit ${contact.name}`,
                    component: new SheetContact({ app: this.app, addressbook: this, groupId, contactId, contact })
                });
            },
            onEditGroup: editGroup ? (groupId) => {
                const group = this.groups[groupId];
                this.sheet.clear();
                this.sheet.append({
                    title: `Edit group`,
                    component: new SheetGroup({ app: this.app, addressbook: this, groupId, group })
                });
            } : null,
            onCollapse: this.onCollapseGroups.bind(this),
            onExpand: this.onExpandGroups.bind(this),
            onReorder: (order) => {
                order.forEach((groupId, index) => {
                    this.setGroup({ id: groupId, order: index + 1 });
                });
                this.save();
            }
        });
    }

    /**
     * Collapse callback
     */

    onCollapseGroups() {
        this.manualExpand.set('Expand groups');
        this.addNewGroupButton.show();
        this.element.querySelectorAll('.add-group').forEach(el => el.classList.add('hidden'));
        this.element.querySelectorAll('.edit-group').forEach(el => el.classList.remove('hidden'));
    }

    /**
     * Expand callback
     */

    onExpandGroups() {
        this.manualExpand.set('Collapse and edit groups');
        this.addNewGroupButton.hide();
        this.element.querySelectorAll('.add-group').forEach(el => el.classList.remove('hidden'));
        this.element.querySelectorAll('.edit-group').forEach(el => el.classList.add('hidden'));
    }

}

/**
 * Add/Edit group sheet
 */

export class SheetGroup extends Component {

    constructor({ app, addressbook, groupId = null, group = null}) {
        super({ app });

        // Build
        this.element.classList.add('form');

        // Name
        const name = new InputText({
            placeholder: 'Group name'
        });
        if (group) name.set(group.name);
        this.append(name);

        // Save button
        const buttonSave = new Button({
            text: group ? 'Update group' : 'Save group',
            classList: ['bottom'],
            click: () => {
                if (!name.valid()) {
                    alert('Invalid name');
                }
                else {
                    if (group) {
                        addressbook.setGroup({
                            id: groupId,
                            name: name.get()
                        });
                    }
                    else {
                        addressbook.addGroup({
                            name: name.get()
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
        if (group) {
            this.append(new ButtLink({
                text: `Remove group`,
                click: () => {
                    if (confirm('Delete this group?')) {
                        addressbook.delGroup(groupId);
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

/**
 * Add/Edit contact sheet
 */

export class SheetContact extends Component {

    constructor({ app, addressbook, groupId, contactId, contact = null }) {
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
            placeholder: 'Account ID',
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
                else if (principalId.get().length && !principalId.valid()) {
                    alert('Invalid Principal ID');
                }
                else if (accountId.get().length && !accountId.valid()) {
                    alert('Invalid Account ID');
                }
                else {
                    const address = {};
                    if (principalId.get().length) address['icp:pid'] = principalId.get();
                    if (accountId.get().length) address['icp:acc0'] = accountId.get();
                    if (contact) {
                        addressbook.setContact({
                            id: contactId,
                            name: name.get(),
                            address,
                            group: groupId
                        });
                    }
                    else {
                        addressbook.addContact({
                            name: name.get(),
                            address,
                            group: groupId
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
