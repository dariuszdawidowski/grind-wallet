/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { Avatar } from '/src/chrome-extension/popup/widgets/avatar.js';
import { AddPlus } from '/src/chrome-extension/popup/widgets/add.js';
import { shortAddress } from '/src/utils/general.js';

export class ListView extends Component {

    constructor({ app }) {
        super({ app });

        // CSS class
        this.element.classList.add('list-view');
    }

    /**
     * Render group header & container
     * @param {string} name Group name
     */

    renderList({ name, data, emptyMsg, onAdd = null, onSelect = null, onEdit = null, onCollapse = null, onExpand = null }) {

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
        title.addEventListener('click', () => {
            const direction = this.toggleCollapse();
            if (direction == 'collapsed') if (onCollapse) onCollapse();
            else if (direction == 'expanded') if (onExpand) onExpand();
        });
        titleContainer.append(title);

        // Add new
        const plusButton = new AddPlus({
            click: () => {
                if (onAdd) onAdd();
            }
        });
        titleContainer.append(plusButton.element);

        // Separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        header.append(separator);

        // Contacts container
        const container = document.createElement('div');
        container.classList.add('container');
        this.element.appendChild(container);
        container.addEventListener('click', (event) => {

            // Edit icon click
            const icon = event.target.closest('.icon');
            if (icon) {
                const entry = icon.closest('.entry');
                if (entry) {
                    const id = entry.dataset.value;
                    if (onEdit) onEdit(id);
                    return;
                }
            }

            // Entry click
            const entry = event.target.closest('.entry');
            if (entry) {
                const id = entry.dataset.value;
                if (onSelect) onSelect(id);
            }

        });

        // Render entries
        if (Object.values(data).length) {
            Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([id, contact]) => {
                this.renderEntry({
                    container,
                    id,
                    name: contact.name,
                    value: contact.address['icp:pid'],
                    icon: contact?.dynamic ? null : 'assets/material-design-icons/pencil-box.svg'
                });
            });
        }
        else {
            const noWallets = document.createElement('div');
            noWallets.classList.add('infotext');
            noWallets.innerHTML = emptyMsg;
            container.append(noWallets);
        }

        // Set initial height
        this.element.querySelectorAll('.container').forEach(container => {
            container.style.height = container.scrollHeight + 'px';
        });

    }

    /**
     * Render single contact entry
     */

    renderEntry({ container, id, name, value, icon = null }) {

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
        if (icon) {
            const right = document.createElement('div');
            right.classList.add('icon');
            entry.append(right);
            right.innerHTML = `<img src="${icon}"></img>`;
        }

    }

    /**
     * Toggle collapse
     */

    toggleCollapse() {
        let direction = null;
        this.element.querySelectorAll('.container').forEach(container => {
            if (container.classList.contains('collapsed')) {
                container.style.height = container.scrollHeight + 'px';
                container.classList.remove('collapsed');
                direction = 'expanded';
            }
            else {
                container.style.height = '0px';
                container.classList.add('collapsed');
                direction = 'collapsed';
            }
        });
        return direction;
    }

}