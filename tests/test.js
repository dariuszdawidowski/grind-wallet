console.info(`🚀 E2E (in-app) tests started`);

const tests = [];

export function test(name, fn) {
    tests.push({ name, fn });
}

export function expect(condition, message) {
    if (!condition) throw new Error(message);
}

test('App bootstrap', () => {
    expect(document.querySelector('#app'), 'Missing #app');
});

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