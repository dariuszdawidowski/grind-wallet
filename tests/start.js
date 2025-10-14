/**
 * Custom in-app test runner for end-to-end tests.
 */

const testBanner = document.createElement('div');
testBanner.textContent = 'TEST MODE';
Object.assign(testBanner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#ff4136',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '4px 0',
    zIndex: '9999'
});
document.body.insertBefore(testBanner, document.body.firstChild);

let secrets = {};
try {
    secrets = await import('../secrets.local.json', { assert: { type: 'json' } });
} catch (_) {
    console.error('Could not find secrets.local.json');
}

console.info(`🚀 E2E (in-app) tests started`);

async function resetSession() {
    try {
        const items = await chrome.storage.session.get(['active', 'password']);
        if (items.hasOwnProperty('active') && items.hasOwnProperty('password')) {
            await chrome.storage.session.remove(['active', 'password']);
            console.info('♻️ Session reset');
            await wait(1000);
            window.location.reload();
        }
    } catch (err) {
        console.error('Error accessing session storage:', err);
    }
}

const tests = [];

export function test(name, fn) {
    tests.push({ name, fn });
}

export function expect(condition, message) {
    if (!condition) throw new Error(message);
}

export function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const specs = [
    () => import(/* webpackMode: "eager" */ './launch.js'),
    () => import(/* webpackMode: "eager" */ './login.js')
];

async function loadTestSpecs() {
    for (const loadSpec of specs) {
        await loadSpec();
    }
}

async function executeTests() {
    let failed = 0;
    for (const { name, fn } of tests) {
        try {
            await fn();
            console.info(`✅ ${name}`);
        } catch (err) {
            failed++;
            console.error(`❌ ${name}`, err);
        }
    }
    console.info(`🏁 E2E (in-app) finished. Errors: ${failed}`);
}

async function main() {
    await resetSession();
    await loadTestSpecs();
    await executeTests();
}

main().catch((err) => {
    console.error('😟 Test suite load error', err);
});