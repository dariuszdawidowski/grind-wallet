/**
 * Boost v 0.5.1
 * Ultra-minimalistic component rendering and event handling framework for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 */

export class App {

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

        // Event manager
        this.event = {

            // {'id pattern': {type, element, callback}, ...}
            listeners: {},

            find: (pattern) => {
                const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                return Object.keys(this.event.listeners).filter(key => regexPattern.test(key));
            },

            on: (args) => {
                this.event.find(args.id).forEach(match => {
                    console.log('ON:', match)
                    this.event.listeners[match].element.addEventListener(this.event.listeners[match].type, this.event.listeners[match].callback);
                });
            },
        
            off: (args) => {
                this.event.find(args.id).forEach(match => {
                    console.log('OFF:', match)
                    this.event.listeners[match].element.removeEventListener(this.event.listeners[match].type, this.event.listeners[match].callback);
                });
            },
        
            call: (args) => {
                this.event.find(args.id).forEach(match => {
                    console.log('CALL:', match)
                    this.event.listeners[match].element.dispatchEvent(new Event(this.event.listeners[match].type));
                });
            },

            clear: () => {
                this.event.listeners = {};
            }
        };

        // Launch
        document.addEventListener(
            'DOMContentLoaded',
            () => {
                this.init();
                window.dispatchEvent(new Event('urlchange'));
            },
            {once: true}
        );

        // URL router
        window.addEventListener('urlchange', () => {
            const url = new URL(window.location.href)
            const params = {};
            for (const [key, value] of url.searchParams.entries()) params[key] = value;
            this.router(url.pathname, params);
        });
    }

    init() {
        /*** OVERLOAD ***/
    }

    append(component) {
        this.element.append(component.element);
    }

    router(path, params) {
        /*** OVERLOAD ***/
    }

}

export class Component {

    /**
     * Constructor
     *   args.app: app reference
     *   args.selector: selector of existed element instead of create div [optional]
     *   args.create: name of element to create [default: div]
     */

    constructor(args) {

        const { selector = null, create = 'div' } = args;

        // Main app reference
        this.app = args.app;

        // Event support
        this.event = {

            on: (args) => {
                console.log('on:', args)
                if (args.id in this.app.event.listeners) console.error(`Conflicting events ${args.id}`)
                this.app.event.listeners[args.id] = {
                    type: ('type' in args ? args.type : null),
                    callback: args.callback.bind(this),
                    element: this.element
                };
                this.element.addEventListener('type' in args ? args.type : args.id, this.app.event.listeners[args.id].callback);
            },
        
            off: (args) => {
                console.log('off:', args)
                this.element.removeEventListener(this.app.event.listeners[args.id].type, this.app.event.listeners[args.id].callback);
                delete this.app.event.listeners[args.id];
            },
        
            call: (args) => {
                console.log('call:', args)
                this.element.dispatchEvent(new Event(args.id));
            }
        
        };

        // Main element
        this.element = selector ? document.querySelector(selector) : document.createElement(create);

        // Changes observer
        const observer = new MutationObserver(async () => {
            observer.disconnect();
            await this.update();
        });
        observer.observe(this.element, {childList: true, subtree: true});

        // Reload event
        window.addEventListener('reload', this.update.bind(this));

    }

    append(component) {
        this.element.append(component.element);
    }

    async update() {
        /*** OVERLOAD ***/
    }

    url(path) {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new Event('urlchange'));
    }

}
