/**
 * Gamelet base widget
 */

import { Component } from '/src/utils/component.js';

export class Gamelet extends Component {

    /**
     * Constructor
     * @param {object} args.app - application instance
     */

    constructor(args) {
        super(args);

        // Style
        this.element.classList.add('tile', 'square', 'gamelet');
    }

    /**
     * Enable sprite animation
     */

    anim(element, animation, speed = 0.5, timeout = 500) {
        if (element.style.animation == '') {
            element.style.animation = `${animation} ${speed}s`;
            setTimeout(() => {
                element.style.animation = '';
            }, timeout);
        }
    }

    /**
     * Create particle fountain effect
     * @param {HTMLElement} sourceElement - element from which particles emerge
     * @param {number} options.count - number of particles (default: 20)
     * @param {string} options.color - particle color (default: '#ffd700')
     * @param {string} options.class - particle CSS class instead of color (default: null)
     * @param {number} options.size - particle size in px (default: 8)
     * @param {number} options.duration - animation duration in ms (default: 1000)
     * @param {number} options.spread - horizontal spread angle in degrees (default: 60)
     */

    particles(sourceElement, options = {}) {
        const config = {
            count: options.count || 20,
            class: options.class || null,
            color: options.color || '#ffd700',
            size: options.size || 8,
            duration: options.duration || 1000,
            spread: options.spread || 60,
            offsetX: options.offsetX || 0,
            offsetY: options.offsetY || 0
        };

        // Get source position
        const rect = sourceElement.getBoundingClientRect();
        const sourceX =  rect.left + (rect.width / 2) + config.offsetX;
        const sourceY = rect.top + (rect.height / 2) + config.offsetY;

        // Create particles
        for (let i = 0; i < config.count; i++) {
            const particle = document.createElement('div');
            if (config.class) {
                particle.classList.add('particle', config.class);
            }
            else {
                particle.style.position = 'fixed';
                particle.style.width = `${config.size}px`;
                particle.style.height = `${config.size}px`;
                particle.style.backgroundColor = config.color;
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '10000';
            }

            // Initial position
            particle.style.left = `${sourceX}px`;
            particle.style.top = `${sourceY}px`;

            // Random angle within spread
            const angle = -90 + (Math.random() - 0.5) * config.spread;
            const velocity = 100 + Math.random() * 150;
            const radians = angle * Math.PI / 180;
            
            // Calculate trajectory
            const deltaX = Math.cos(radians) * velocity;
            const deltaY = Math.sin(radians) * velocity;

            document.body.appendChild(particle);

            // Animate particle
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / config.duration;

                if (progress < 1) {
                    // Physics calculation
                    const gravity = 200;
                    const x = sourceX + deltaX * progress;
                    const y = sourceY + deltaY * progress + 0.5 * gravity * progress * progress;
                    const opacity = 1 - progress;

                    particle.style.left = `${x}px`;
                    particle.style.top = `${y}px`;
                    particle.style.opacity = opacity;

                    requestAnimationFrame(animate);
                }
                else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

}