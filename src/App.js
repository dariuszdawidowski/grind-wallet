import './popup.css';
import GrindCard from './Card.js';

/**
 * Bind events
 */

function initEvents() {

    // Create account
    document.querySelector('#create-account').addEventListener('click', () => {
        grindWallet.card.show({
            title: 'Create an account',
            content: 'Content for the creating account...'
        });
    });

    // Import account
    document.querySelector('#import-account').addEventListener('click', () => {
        grindWallet.card.show({
            title: 'Import an account',
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

window.addEventListener('load', () => {
    initEvents();
});
