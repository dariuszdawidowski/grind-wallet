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
    padding: '8px 0',
    zIndex: '9999'
});
document.body.insertBefore(testBanner, document.body.firstChild);

let secrets = {};
try {
    secrets = await import('../secrets.local.json', { assert: { type: 'json' } });
} catch (_) {
    console.warn('Could not find secrets.local.json');
    return;
}

console.info(`🚀 E2E (in-app) tests started`);

const tests = [];

export function test(name, fn) {
    tests.push({ name, fn });
}

export function expect(condition, message) {
    if (!condition) throw new Error(message);
}

async function loadTestSuites() {
    await Promise.all([
        import('./launch.js')
        // import('./nav.js'),
    ]);
}

function executeTests() {
    let failed = 0;
    tests.forEach(({ name, fn }) => {
        try {
            fn();
            console.info(`✅ ${name}`);
        } catch (err) {
            failed++;
            console.error(`❌ ${name}`, err);
        }
    });
    console.info(`🏁 E2E (in-app) finished. Errors: ${failed}`);
}

loadTestSuites()
    .then(executeTests)
    .catch((err) => {
        console.error('😟 Test suite load error', err);
    });