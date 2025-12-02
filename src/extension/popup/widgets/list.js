/**
 * Generic list widget
 */

import { Component } from '/src/utils/component.js';
import { Avatar } from '/src/extension/popup/widgets/avatar.js';
import { AddPlus } from '/src/extension/popup/widgets/add.js';

/**
 * Single entry on a list base
 */

export class ListEntry {

    constructor({ id = null, avatar = null, name, value = null, editable = false, switcher = null, input = null, icon = null }) {
        // Entry ID
        this.id = id;
        // Entry avatar
        this.avatar = avatar;
        // Entry name
        this.name = name;
        // Entry value
        this.value = value;
        // Is editable
        this.editable = editable;
        // Switcher widget null | 'on' | 'off'
        this.switcher = switcher;
        // Input widget null | {value, unit}
        this.input = input;
        // Right icon
        this.icon = icon;
    }

}

/**
 * List view base
 */

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
     * Render group header & container
     * @param {string} id Group ID
     * @param {string} name Group name
     * @param {object} entries Entries list {id: {name, value, editable, order, icon, ...}}
     * @param {string} emptyMsg Message to show when no entries
     * @param {boolean} foldable Is it harmonica?
     * @param {function} onAddEntry Callback when add entry clicked
     * @param {function} onClickEntry Callback when entry clicked returns { id: element id, clicked: 'middle|icon', input: value, switcher: 'on|off" }
     * @param {function} onEditGroup Callback when edit group clicked
     * @param {function} onCollapse Callback when group collapsed
     * @param {function} onExpand Callback when group expanded
     * @param {function} onReorder Callback when group reordered
     */

    renderList({ id = null, name, entries, emptyMsg, foldable = false, onAddEntry = null, onClickEntry = null, onEditGroup = null, onCollapse = null, onExpand = null, onReorder = null }) {

        // Header container
        const header = document.createElement('div');
        header.classList.add('header');
        header.draggable = true;
        header.dataset.id = id ? id : `list-${crypto.randomUUID()}`;
        this.element.append(header);

        // Setup drag and drop
        if (onReorder) this.setupDragAndDrop(header, onReorder);

        // Header row
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('header-row');
        header.append(titleContainer);
        if (foldable) titleContainer.addEventListener('click', () => {
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

        // Add new entry
        if (onAddEntry) {
            const plusButton = new AddPlus({
                classList: ['add-group'],
                click: (event) => {
                    event.stopPropagation();
                    if (onAddEntry) onAddEntry();
                }
            });
            titleContainer.append(plusButton.element);
        }

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

        // Entry clicked
        if (onClickEntry) container.addEventListener('click', (event) => {
            const entry = event.target.closest('.entry');
            if (entry) {
                const info = { id: entry.dataset.value, clicked: 'middle' };
                if (event.target.closest('.icon')) info.clicked = 'icon';
                const inputWidget = event.target.closest('input');
                if (inputWidget) {
                    if (inputWidget.type === 'checkbox') {
                        info.switcher = inputWidget.checked ? 'on' : 'off';
                    }
                    else if (inputWidget.type === 'number') {
                        info.input = inputWidget.value;
                    }
                }
                onClickEntry(info);
            }
        });

        // Separator
        const separator = document.createElement('div');
        separator.classList.add('separator');
        container.append(separator);

        // Render entries
        if (Object.values(entries).length) {
            Object.entries(entries).sort((a, b) => {
                // Sort by order if this field exists
                if (a[1].order !== undefined && b[1].order !== undefined) {
                    return a[1].order - b[1].order;
                }
                // Otherwise sort alphabetically by name field
                return a[1].name.localeCompare(b[1].name);
            }).forEach(([id, entry]) => {
                this.renderEntry({
                    container,
                    id,
                    avatar: entry?.avatar || null,
                    name: entry.name,
                    value: entry?.value || null,
                    icon: entry?.icon || (entry?.editable ? 'assets/material-design-icons/pencil-box.svg' : null),
                    switcher: entry?.switcher || null,
                    input: entry?.input || null
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
     * @param {HTMLElement} container Container to render entry in
     * @param {string} id Entry ID
     * @param {string} avatar Avatar URL | true for render letter in a circle
     * @param {string} name Entry name
     * @param {string} value Entry value
     * @param {string} icon Entry right icon
     * @param {'on'|'off'} stwitcher Switcher widget
     */

    renderEntry({ container, avatar = null, id, name, value = null, icon = null, switcher = null, input = null }) {

        // Entry bar
        const entry = document.createElement('div');
        entry.dataset.value = id;
        entry.classList.add('entry');
        container.appendChild(entry);

        // Avatar
        if (avatar) entry.append(new Avatar({
            app: this.app,
            id,
            name
        }).element);

        // Middle section
        const middle = document.createElement('div');
        middle.classList.add('middle');
        entry.append(middle);

        // Title
        const title = document.createElement('div');
        title.classList.add('name');
        title.innerText = name;
        middle.append(title);

        // Subtitle
        if (value) {
            const subtitle = document.createElement('div');
            subtitle.classList.add('value');
            subtitle.innerText = value;
            middle.append(subtitle);
        }

        // Switcher widget
        if (switcher) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('toggle');
            if (switcher === 'on') checkbox.setAttribute('checked', 'checked');
            entry.append(checkbox);
        }

        // Input widget
        if (input) {
            const inputContainer = document.createElement('div');
            inputContainer.classList.add('input-container');
            const inputField = document.createElement('input');
            inputField.type = 'number';
            inputField.value = input.value;
            inputContainer.append(inputField);
            if (input.unit) {
                const inputUnit = document.createElement('span');
                inputUnit.classList.add('input-unit');
                inputUnit.innerText = input.unit;
                inputContainer.append(inputUnit);
            }
            entry.append(inputContainer);
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
     * Check whether list is already rendered
     */

    isRendered() {
        return Array.from(this.element.children).some(child => child.classList.contains('header'));
    }

}