/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';

export class AddressBook extends Component {

    constructor(args) {
        super(args);

        // CSS class
        this.element.classList.add('address-book');

        // Contact list
        this.contacts = [];

        // Callback on address select
        this.callback = null;
    }

    async load() {
        const data = await chrome.storage.local.get('addressbook');
        this.contacts = data.addressbook || [];
    }

    async save() {
        await chrome.storage.local.set({ addressbook: this.contacts });
    }

    async addContact({ name, address }) {
        this.contacts.push({ name, address });
        await this.save();
    }

    async delContact(address) {
        this.contacts = this.contacts.filter(contact => contact.address !== address);
        await this.save();
    }

    render() {
        // Clear existing content
        this.element.innerHTML = '';

        // Entries container
        const entriesContainer = document.createElement('div');
        this.element.appendChild(entriesContainer);
        entriesContainer.addEventListener('click', (event) => {
            const entry = event.target.closest('.entry');
            if (entry) {
                const address = entry.dataset.address;
                this.callback?.(address);
            }
        });

        // Render contacts
        this.contacts.forEach(contact => {
            const entry = document.createElement('div');
            entry.dataset.address = contact.address;
            entry.classList.add('entry');
            entry.innerText = `${contact.name} - ${contact.address}`;
            entriesContainer.appendChild(entry);
        });
    }

}
