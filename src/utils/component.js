/**
 * Component v 0.9.0
 * Minimalistic DOM component for JavaScript
 */

export class Component {

    /**
     * Constructor
     * args.app: reference to the main app object (optional)
     * args.id: id for the DOM element (optional)
     * args.type: DOM element e.g. 'div' (default), 'button', 'input' (optional)
     * args.style: apply custom style (optional)
     * args.html: html string to render (optional)
     * args.selector: dont create new element but assign to selector (optional)
     */

    constructor(args = {}) {

        // App reference
        this.app = ('app' in args) ? args.app : null;

        // Main DOM element
        this.element = null;

        // Render html string into DOM
        if (args.html !== undefined) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(args.html, 'text/html');
            this.element = doc.body.firstChild;

        }

        // Assign to selector
        else if (args.selector !== undefined) {
            this.element = document.querySelector(args.selector);
        }

        // Create DOM element
        else {
            this.element = document.createElement((args.type !== undefined) ? args.type : 'div');
        }

        // Optional classList
        if ('classList' in args) {
            this.element.classList.add(...args.classList);
        }

        // ID
        if (args.id !== undefined) {
            this.element.id = args.id;
        }

        // Optional custom style
        if (args.style !== undefined) {
            // Apply style specified as a string like 'color: red; background: blue;' or as an object
            if (typeof args.style === 'string') {
                args.style.split(';').forEach(rule => {
                    const [prop, ...valParts] = rule.split(':');
                    if (!prop) return;
                    const value = valParts.join(':').trim();
                    if (!value) return;
                    const property = prop.trim();
                    this.element.style.setProperty(property, value);
                });
            }
            else if (typeof args.style === 'object') {
                Object.entries(args.style).forEach(([key, value]) => {
                    // convert camelCase keys to kebab-case for setProperty
                    const propName = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
                    this.element.style.setProperty(propName, value);
                });
            }
        }

    }

    /**
     * Append child component
     */

    append(component) {
        this.element.append(component.element);
    }

    /**
     * Replace child component
     */

    replace(component) {
        this.element.innerHTML = '';
        this.element.append(component.element);
    }

}
