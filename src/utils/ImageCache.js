/*** Cache iamges in the IndexedDB ***/

/*

// EXAMPLE

(async () => {
    const imageId = "exampleImage";
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...";

    try {
        // Save
        const saveResult = await saveImage(imageId, base64Image);
        console.log(saveResult);

        // Load
        const loadedImage = await loadImage(imageId);
        console.log("Loaded image Base64:", loadedImage);

        // Display
        const imgElement = document.createElement("img");
        imgElement.src = loadedImage;
        document.body.appendChild(imgElement);
    } catch (error) {
        console.error("Error:", error);
    }
})();

*/

const DB_NAME = 'Cache';
const STORE_NAME = 'Images';


/**
 * Open database
 */

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}


/**
 * Save image
 */

export async function saveImage(id, base64String) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

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

        // Zapis do IndexedDB
        const request = store.put({ id, blob, mimeType });

        request.onsuccess = () => resolve(`Image with ID "${id}" saved.`);
        request.onerror = (event) => reject(event.target.error);
    });
}


/**
 * Load image
 */

export async function loadImage(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.get(id);
        request.onsuccess = (event) => {
            const result = event.target.result;
            if (result) {

                // Blob -> Base64
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject('Failed to read blob as Base64.');
                reader.readAsDataURL(result.blob);

            } else {
                reject(`No image found with ID "${id}".`);
            }
        };

        request.onerror = (event) => reject(event.target.error);
    });
}
