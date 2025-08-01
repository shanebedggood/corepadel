const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
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

// Known image names based on the application
const knownImageNames = [
    'hero',
    'rackets', 
    'shoes',
    'accessories',
    'court',
    'za',  // South Africa
    'es',  // Spain
    'ar',  // Argentina
    'ae',  // United Arab Emirates
    'mx',  // Mexico
    'pt',  // Portugal
    'it',  // Italy
    'se'   // Sweden
];

const sizes = ['mobile', 'tablet', 'desktop'];
const formats = ['webp', 'jpg'];

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
 * Download a single image from Firebase Storage
 * @param {string} storagePath - Path in Firebase Storage
 * @param {string} localPath - Local path to save the file
 * @returns {Promise<boolean>} - Returns true if download was successful
 */
async function downloadImage(storagePath, localPath) {
    try {
        const storageRef = ref(storage, storagePath);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log(`Downloading ${storagePath} to ${localPath}...`);
        await downloadFile(downloadURL, localPath);
        console.log(`✅ Downloaded: ${localPath}`);
        return true;
    } catch (error) {
        console.log(`⚠️  Skipped ${storagePath}: ${error.message}`);
        return false;
    }
}

/**
 * Main function to download all known images
 */
async function downloadKnownImages() {
    console.log('🚀 Starting download of known images from Firebase Storage...');
    console.log(`📁 Download directory: ${downloadDir}`);
    
    // Ensure download directory exists
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    let totalAttempted = 0;
    let totalDownloaded = 0;
    
    try {
        console.log('\n📥 Starting downloads...\n');
        
        // Download images for each known image name
        for (const imageName of knownImageNames) {
            console.log(`\n🖼️  Processing ${imageName} images...`);
            
            for (const size of sizes) {
                for (const format of formats) {
                    const storagePath = `images/${size}/${imageName}-${size}.${format}`;
                    const localPath = path.join(downloadDir, storagePath);
                    
                    totalAttempted++;
                    const success = await downloadImage(storagePath, localPath);
                    if (success) {
                        totalDownloaded++;
                    }
                }
            }
        }
        
        console.log('\n✅ Download completed!');
        console.log(`📁 Images saved to: ${downloadDir}`);
        console.log(`📊 Total attempted: ${totalAttempted}`);
        console.log(`📊 Successfully downloaded: ${totalDownloaded}`);
        console.log(`📊 Failed: ${totalAttempted - totalDownloaded}`);
        
        // Show directory structure
        if (totalDownloaded > 0) {
            console.log('\n📂 Directory structure created:');
            const showDirectoryStructure = (dir, prefix = '') => {
                const items = fs.readdirSync(dir);
                items.forEach((item, index) => {
                    const itemPath = path.join(dir, item);
                    const isLast = index === items.length - 1;
                    const stats = fs.statSync(itemPath);
                    
                    if (stats.isDirectory()) {
                        console.log(`${prefix}${isLast ? '└── ' : '├── '}${item}/`);
                        showDirectoryStructure(itemPath, prefix + (isLast ? '    ' : '│   '));
                    } else {
                        console.log(`${prefix}${isLast ? '└── ' : '├── '}${item}`);
                    }
                });
            };
            showDirectoryStructure(downloadDir);
        }
        
    } catch (error) {
        console.error('❌ Error during download process:', error);
    }
}

// Run the script
if (require.main === module) {
    downloadKnownImages().catch(console.error);
}

module.exports = { downloadKnownImages, downloadImage }; 