// Create zip from dist/chrome/*

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distFolder = path.resolve(__dirname, './dist/chrome');
const outputFilePath = path.resolve(__dirname, './dist/grind-wallet.zip');

function createZip() {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.info(`Created file: ${outputFilePath} (${archive.pointer()} bytes)`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(distFolder, false);
    archive.finalize();
}

createZip();
