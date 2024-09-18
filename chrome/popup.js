/**
 * Grind Card
 * args:
 *   selector: query
 *   hidded: hide at start
 */

class GrindCard {

    constructor(args) {

        const {selector = '', hidden = true} = args;

        // Main container
        this.element = document.querySelector(selector);

        // X close button
        this.x = this.element.querySelector('.x');
        this.x.addEventListener('click', () => this.hide());

        // Title
        this.title = this.element.querySelector('h1.title');

        // Content
        this.content = this.element.querySelector('.content');

        // Hide
        if (hidden) this.hide();
    }

    /**
     * Show card
     */

    show(args) {

        const { title = null, content = null } = args;

        if (title) this.title.innerText = title;
        if (content) {
            if (typeof(content) == 'string')
                this.content.innerHTML = content;
            else if (typeof(content) == 'object')
                this.content.append(content);
        }

        this.element.classList.add('visible');
    }

    /**
     * Hide card
     */

    hide() {
        this.element.classList.remove('visible');
    }
}

/**
 * Bind events
 */

function initEvents() {

    // Create account
    document.querySelector('#create-account').addEventListener('click', () => {
        grindWallet.card.show({
            title: 'Create account',
            content: 'Content for the creating account...'
        });
    });

    // Import account
    document.querySelector('#import-account').addEventListener('click', () => {
        grindWallet.card.show({
            title: 'Import account',
            content: 'Content for the importing account...'
        });
    });

}

/**
 * Global manager
 */

const grindWallet = {

    card: new GrindCard({selector: '.card', hidden: true}),

};

/**
 * Global interface
 */

window.grind = {
};

/**
 * Start
 */

initEvents();
