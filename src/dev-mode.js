const devBanner = document.createElement('div');
devBanner.textContent = `DEV MODE`;
Object.assign(devBanner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#ff9e36ff',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '4px 0',
    zIndex: '9999'
});
document.body.insertBefore(devBanner, document.body.firstChild);

console.info(`🛠️ DEV MODE`);
