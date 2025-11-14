/**
 * Cache images in the IndexedDB
 */

export class ImageCache {

    constructor() {
        this.DB_NAME = 'Cache';
        this.STORE_NAME = 'Images';
    }

    /**
     * Open database
     */

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Save image
     */

    async save(id, data) {
        if (data.startsWith('data:image/') && data.includes('base64,')) {
            return await this.saveBase64(id, data);
        }
        else if (data.includes('<svg')) {
            return await this.saveSVG(id, data);
        }
        else {
            throw new Error('Invalid image data format.');
        }
    }

    async saveBase64(id, base64String) {
        const db = await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            // Mimetype
            const mimeType = base64String.match(/^data:(.*?);base64,/)[1];
            if (!mimeType) {
                reject('Invalid Base64 string format.');
                return;
            }

            // Base64 -> Blob
            const binary = atob(base64String.split(',')[1]);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                array[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([array], { type: mimeType });

            // Save to IndexedDB
            const request = store.put({ id, blob, mimeType });

            request.onsuccess = () => resolve(`Image with ID "${id}" saved.`);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async saveSVG(id, svgString) {
        const db = await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            // String -> Blob
            const blob = new Blob([svgString], { type: 'image/svg+xml' });

            // Save to IndexedDB
            const request = store.put({ id, blob, mimeType: 'image/svg+xml' });

            request.onsuccess = () => resolve(`Image with ID "${id}" saved.`);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Load image
     */

    async load(id) {
        const db = await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.get(id);
            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {

                    // SVG
                    if (result.mimeType.startsWith('image/svg')) {
                        result.blob.arrayBuffer().then(buffer => {
                            const text = new TextDecoder().decode(buffer);
                            resolve(text);
                        });                    
                    }

                    // Raster Base64
                    else if (result.mimeType.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject('Failed to read blob as Base64.');
                        reader.readAsDataURL(result.blob);
                    }

                    // Unknown
                    else {
                        reject(`Invalid image MIME type: "${result.mimeType}".`);
                    }

                }
                else {
                    resolve(null);
                }
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

}
