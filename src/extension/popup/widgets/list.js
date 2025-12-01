/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';
import { Avatar } from '/src/extension/popup/widgets/avatar.js';
import { AddPlus } from '/src/extension/popup/widgets/add.js';
import { shortAddress } from '/src/utils/general.js';

export class ListView extends Component {

    constructor(args) {
        super(args);

        // CSS class
        this.element.classList.add('list-view');

        // Drag and drop state
        this.dragState = {
            draggedElement: null,
            placeholder: null
        };
    }

    /**
     * Render group header & container
     * @param {string} id Group ID
     * @param {string} name Group name
     * @param {object} data Entries data
     * @param {string} emptyMsg Message to show when no entries
     * @param {function} onAddEntry Callback when add entry clicked
     * @param {function} onSelectEntry Callback when entry selected
     * @param {function} onEditEntry Callback when edit entry clicked
     * @param {function} onEditGroup Callback when edit group clicked
     * @param {function} onCollapse Callback when group collapsed
     * @param {function} onExpand Callback when group expanded
     * @param {function} onReorder Callback when group reordered
     */

    renderList({ id, name, data, emptyMsg, onAddEntry = null, onSelectEntry = null, onEditEntry = null, onEditGroup = null, onCollapse = null, onExpand = null, onReorder = null }) {

        // Header container
        const header = document.createElement('div');
        header.classList.add('header');
        header.draggable = true;
        header.dataset.id = id;
        this.element.append(header);

        // Setup drag and drop
        this.setupDragAndDrop(header, onReorder);

        // Header row
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('header-row');
        header.append(titleContainer);
        titleContainer.addEventListener('click', () => {
            const direction = this.toggleCollapse();
            if (direction == 'collapsed') {
                if (onCollapse) onCollapse();
            }
            else if (direction == 'expanded') {
                if (onExpand) onExpand();
            }
        });

        // Title
        const title = document.createElement('h1');
        title.innerText = name;
        titleContainer.append(title);

        // Add new
        const plusButton = new AddPlus({
            classList: ['add-group'],
            click: (event) => {
                event.stopPropagation();
                if (onAddEntry) onAddEntry();
            }
        });
        titleContainer.append(plusButton.element);

        // Edit icon
        if (onEditGroup) {
            const editIcon = document.createElement('div');
            editIcon.classList.add('icon', 'edit-group', 'hidden');
            editIcon.innerHTML = `<img src="assets/material-design-icons/pencil-box.svg"></img>`;
            titleContainer.append(editIcon);
            editIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                onEditGroup(id);
            });
        }

        // Contacts container
        const container = document.createElement('div');
        container.classList.add('container');
        this.element.appendChild(container);
        container.addEventListener('click', (event) => {

            // Edit entry clicked
            const icon = event.target.closest('.icon');
            if (icon) {
                const entry = icon.closest('.entry');
                if (entry) {
                    const id = entry.dataset.value;
                    if (onEditEntry) onEditEntry(id);
                    return;
                }
            }

            // Select entry clicked
            const entry = event.target.closest('.entry');
            if (entry) {
                const id = entry.dataset.value;
                if (onSelectEntry) onSelectEntry(id);
            }

        });

        // Separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        container.append(separator);

        // Render entries
        if (Object.values(data).length) {
            Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name)).forEach(([id, contact]) => {
                this.renderEntry({
                    container,
                    id,
                    name: contact.name,
                    value: (('address' in contact) && ('icp:pid' in contact.address)) ? contact.address['icp:pid'] : (('address' in contact) && ('icp:acc0' in contact.address)) ? contact.address['icp:acc0'] : null,
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
     * Setup drag and drop for header reordering
     * @param {HTMLElement} header Header element
     * @param {function} onReorder Callback when reordered
     */

    setupDragAndDrop(header, onReorder) {

        // Drag start
        header.addEventListener('dragstart', (event) => {
            // Only allow dragging when collapsed
            const container = header.nextElementSibling;
            if (!container.classList.contains('collapsed')) {
                event.preventDefault();
                return;
            }
            this.dragState.draggedElement = header;
            header.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', header.innerHTML);
        });

        // Drag over
        header.addEventListener('dragover', (event) => {
            if (!this.dragState.draggedElement) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';

            const afterElement = this.getDragAfterElement(event.clientY);
            const draggedContainer = this.dragState.draggedElement.nextElementSibling;
            
            if (afterElement == null) {
                // Find first button to insert before it
                const firstButton = this.element.querySelector('button');
                if (firstButton) {
                    this.element.insertBefore(this.dragState.draggedElement, firstButton);
                    if (draggedContainer) {
                        this.element.insertBefore(draggedContainer, firstButton);
                    }
                }
            }
            else {
                this.element.insertBefore(this.dragState.draggedElement, afterElement);
                if (draggedContainer) {
                    this.element.insertBefore(draggedContainer, afterElement);
                }
            }
        });

        // Drag end
        header.addEventListener('dragend', (event) => {
            header.classList.remove('dragging');
            
            // Get new order
            const order = [];
            this.element.querySelectorAll('.header').forEach(h => {
                order.push(h.dataset.id);
            });
            this.dragState.draggedElement = null;

            // Callback with new order
            if (onReorder) onReorder(order);
        });
    }

    /**
     * Get element after which dragged element should be inserted
     * @param {number} y Y coordinate
     * @returns {HTMLElement} Element after which to insert
     */

    getDragAfterElement(y) {
        const draggableElements = [...this.element.querySelectorAll('.header:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            }
            else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Render single contact entry
     * @param {HTMLElement} container Container to render entry in
     * @param {string} id Entry ID
     * @param {string} name Entry name
     * @param {string} value Entry value (address)
     * @param {string} icon Entry right icon
     */

    renderEntry({ container, id, name, value = null, icon = null }) {

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
        if (value) {
            const subtitle = document.createElement('div');
            subtitle.classList.add('address');
            subtitle.innerText = shortAddress(value);
            middle.append(subtitle);
        }

        // Right icon
        if (icon) {
            const right = document.createElement('div');
            right.classList.add('icon');
            right.innerHTML = `<img src="${icon}"></img>`;
            entry.append(right);
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

    /**
     * Check whether list is already rendered
     */

    isRendered() {
        return Array.from(this.element.children).some(child => child.classList.contains('header'));
    }

}