/**
 * Error handling system for the application
 */

export class ErrorSystem {

    constructor() {
        window.addEventListener('error', (ev) => {
            console.log('🪲', ev);
        });

        window.addEventListener('unhandledrejection', (ev) => {
            console.log('🐞', ev?.reason?.message);
        });
    }
}