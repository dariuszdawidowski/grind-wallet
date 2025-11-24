/**
 * Contact avatar image
 */

import { Component } from '/src/utils/component.js';

export class Avatar extends Component {

    /**
     * Constructor
     * @param {object} app App reference
     * @param {string} id Id of a contact
     */

    constructor({ app, id, name }) {
        super({ app });

        // Class
        this.element.classList.add('avatar-image');

        // Load cached image
        (async () => {
            try {
                const image = await this.app.cache.image.load(`avatar:${id}`);
                if (image) {
                    this.element.style.backgroundColor = 'transparent';
                    // SVG
                    if (image.startsWith('<svg')) {
                        this.element.innerHTML = image;
                    }
                    // Raster
                    else {
                        this.element.style.backgroundImage = `url('${image}')`;
                    }
                }
                // Fallback placeholder
                else {
                    if (name.length) this.element.innerText = name[0].toUpperCase();
                    else this.element.innerText = '?';
                }
            }

            // Fallback placeholder
            catch(error) {
                if (name.length) this.element.innerText = name[0].toUpperCase();
                else this.element.innerText = '?';
            }
        })();

    }

}
