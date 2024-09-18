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

        // Hide
        if (hidden) this.hide();
    }

    /**
     * Show card
     */

    show() {
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
        console.log('#create-account')
        grind.card.show();
    });

    // Import account
    document.querySelector('#import-account').addEventListener('click', () => {
        console.log('#import-account')
        grind.card.show();
    });

}

/**
 * Global manager
 */

const grind = {

    card: new GrindCard({selector: '.card', hidden: true}),

};

/**
 * Start
 */

initEvents();
