/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { Avatar } from '/src/chrome-extension/popup/widgets/avatar.js';
import { shortAddress } from '/src/utils/general.js';

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
        const id = crypto.randomUUID();
        this.contacts.push({ id, name, address });
        await this.save();
    }

    async delContact(id) {
        this.contacts = this.contacts.filter(contact => contact.id !== id);
        await this.save();
    }

    render() {
        // Clear existing content
        this.element.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.classList.add('header');
        this.element.append(header);

        const title = document.createElement('h1');
        title.innerText = 'Contacts';
        header.append(title);

        // Separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        header.append(separator);

        // All contacts container
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
            this.renderContact(entriesContainer, contact);
        });
    }

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

        // Right side
        const right = document.createElement('div');
        entry.append(right);

        // Name
        const name = document.createElement('div');
        name.classList.add('name');
        name.innerText = contact.name;
        right.append(name);

        // Address
        const address = document.createElement('div');
        address.innerText = shortAddress(contact.address);
        right.append(address);
    }

}
