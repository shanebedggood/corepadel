const { initializeApp } = require('firebase/app');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Firebase configuration (production)
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

// Download directory - use the images folder at project root for git tracking
const downloadDir = path.join(__dirname, '..', '..', 'images');

/**
 * Download a file from URL to local path
 * @param {string} url - URL to download from
 * @param {string} filePath - Local file path to save to
 * @returns {Promise<void>}
 */
function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(filePath, () => {}); // Delete the file if there was an error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * List all files in a Firebase Storage directory recursively
 * @param {string} storagePath - Path in Firebase Storage
 * @returns {Promise<string[]>} Array of file paths
 */
async function listAllFiles(storagePath = '') {
    const files = [];
    
    try {
        const listRef = ref(storage, storagePath);
        const result = await listAll(listRef);
        
        // Add files from current directory
        for (const itemRef of result.items) {
            files.push(itemRef.fullPath);
        }
        
        // Recursively add files from subdirectories
        for (const prefixRef of result.prefixes) {
            const subFiles = await listAllFiles(prefixRef.fullPath);
            files.push(...subFiles);
        }
        
        return files;
    } catch (error) {
        console.error(`Error listing files in ${storagePath}:`, error);
        return [];
    }
}

/**
 * Download a single image from Firebase Storage
 * @param {string} storagePath - Path in Firebase Storage
 * @param {string} localPath - Local path to save the file
 * @returns {Promise<void>}
 */
async function downloadImage(storagePath, localPath) {
    try {
        const storageRef = ref(storage, storagePath);
        const downloadURL = await getDownloadURL(storageRef);
        
        await downloadFile(downloadURL, localPath);
        console.log(`✅ Downloaded: ${localPath}`);
    } catch (error) {
        console.error(`❌ Error downloading ${storagePath}:`, error.message);
    }
}

/**
 * Main function to download all images
 */
async function downloadAllImages() {
    console.log('🚀 Starting download of all images from Firebase Storage...');
    console.log(`📁 Download directory: ${downloadDir}`);
    
    // Ensure download directory exists
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    try {
        // List all files in Firebase Storage
        console.log('📋 Listing all files in Firebase Storage...');
        const allFiles = await listAllFiles();
        
        console.log(`📊 Found ${allFiles.length} files in Firebase Storage`);
        
        // Filter for image files
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
        const imageFiles = allFiles.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });
        
        console.log(`🖼️  Found ${imageFiles.length} image files`);
        
        if (imageFiles.length === 0) {
            console.log('❌ No image files found in Firebase Storage');
            return;
        }
        
        // Download each image
        console.log('\n📥 Starting downloads...\n');
        
        for (const storagePath of imageFiles) {
            const localPath = path.join(downloadDir, storagePath);
            await downloadImage(storagePath, localPath);
        }
        
        console.log('\n✅ Download completed!');
        console.log(`📁 Images saved to: ${downloadDir}`);
        
        // Show summary
        const downloadedFiles = fs.readdirSync(downloadDir, { recursive: true });
        console.log(`📊 Total files downloaded: ${downloadedFiles.length}`);
        
    } catch (error) {
        console.error('❌ Error during download process:', error);
    }
}

// Run the script
if (require.main === module) {
    downloadAllImages().catch(console.error);
}

module.exports = { downloadAllImages, downloadImage, listAllFiles }; 