/**
 * Error handling system for the application
 */

export class ErrorSystem {

    constructor() {
        // Global error handler
        window.addEventListener('error', (ev) => {
            console.log('🪲', ev?.error?.stack);
        });

        // Global promise rejection handler
        window.addEventListener('unhandledrejection', (ev) => {
            console.log('🐞', ev?.reason?.stack);
        });

        // Console error override
        const origConsoleError = console.error;
        console.error = function(...args){
            origConsoleError.apply(console, args);
        }
        
    }
}