const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Firebase configuration (same as in your app.config.ts)
const firebaseConfig = {
    apiKey: 'AIzaSyAVNjToQcxMtJwbiL0jGXmFcZGTxMH_kXY',
    authDomain: 'padel-3b62e.firebaseapp.com',
    projectId: 'padel-3b62e',
    storageBucket: 'padel-3b62e.firebasestorage.app',
    messagingSenderId: '436875903621',
    appId: '1:436875903621:web:d917cd0f68e4b217d21fec',
    measurementId: 'G-0DT2RM3WY7'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Upload a single image to Firebase Storage
 * @param {string} localPath - Local path to the image file
 * @param {string} storagePath - Path in Firebase Storage
 * @returns {Promise<string>} Download URL
 */
async function uploadImage(localPath, storagePath) {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        const storageRef = ref(storage, storagePath);

        console.log(`Uploading ${localPath} to ${storagePath}...`);
        await uploadBytes(storageRef, fileBuffer);

        const downloadURL = await getDownloadURL(storageRef);
        console.log(`✅ Uploaded: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error(`❌ Error uploading ${localPath}:`, error);
        throw error;
    }
}

/**
 * Upload responsive images for a given image name
 * @param {string} imageName - Base name of the image (e.g., 'hero')
 * @param {string} localImagesDir - Local directory containing the images
 */
async function uploadResponsiveImages(imageName, localImagesDir) {
    const images = [
        // WebP images
        { local: path.join(localImagesDir, 'small', `${imageName}.webp`), storage: `images/small/${imageName}.webp` },
        { local: path.join(localImagesDir, 'medium', `${imageName}.webp`), storage: `images/medium/${imageName}.webp` },
        { local: path.join(localImagesDir, 'large', `${imageName}.webp`), storage: `images/large/${imageName}.webp` },
        // JPG fallbacks
        { local: path.join(localImagesDir, 'small', `${imageName}.jpg`), storage: `images/small/${imageName}.jpg` },
        { local: path.join(localImagesDir, 'medium', `${imageName}.jpg`), storage: `images/medium/${imageName}.jpg` },
        { local: path.join(localImagesDir, 'large', `${imageName}.jpg`), storage: `images/large/${imageName}.jpg` }
    ];

    console.log(`\n🚀 Uploading responsive images for: ${imageName}`);
    console.log('='.repeat(50));

    const results = [];

    for (const image of images) {
        if (fs.existsSync(image.local)) {
            try {
                const url = await uploadImage(image.local, image.storage);
                results.push({ success: true, url, path: image.storage });
            } catch (error) {
                results.push({ success: false, error: error.message, path: image.storage });
            }
        } else {
            console.log(`⚠️  File not found: ${image.local}`);
            results.push({ success: false, error: 'File not found', path: image.storage });
        }
    }

    console.log('\n📊 Upload Summary:');
    console.log('='.repeat(50));
    results.forEach((result) => {
        if (result.success) {
            console.log(`✅ ${result.path}`);
        } else {
            console.log(`❌ ${result.path}: ${result.error}`);
        }
    });

    return results;
}

// Main execution
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node upload-images.js <imageName> <localImagesDir>');
        console.log('Example: node upload-images.js hero ./src/assets/images');
        console.log('\nExpected local directory structure:');
        console.log('localImagesDir/');
        console.log('├── small/');
        console.log('│   ├── hero.webp');
        console.log('│   └── hero.jpg');
        console.log('├── medium/');
        console.log('│   ├── hero.webp');
        console.log('│   └── hero.jpg');
        console.log('└── large/');
        console.log('    ├── hero.webp');
        console.log('    └── hero.jpg');
        process.exit(1);
    }

    const imageName = args[0];
    const localImagesDir = args[1];

    if (!fs.existsSync(localImagesDir)) {
        console.error(`❌ Directory not found: ${localImagesDir}`);
        process.exit(1);
    }

    try {
        await uploadResponsiveImages(imageName, localImagesDir);
        console.log('\n🎉 Upload completed!');
    } catch (error) {
        console.error('\n💥 Upload failed:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { uploadResponsiveImages, uploadImage };
