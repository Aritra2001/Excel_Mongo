const multer = require('multer');

// Define storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public'); // Set destination directory
    },
    filename: function (req, file, cb) {
        // Sanitize the file name to remove special characters
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '') + Date.now();
        cb(null, sanitizedFileName); // Use the sanitized file name
    }
});

// Initialize multer middleware with the storage options
const upload = multer({ storage: storage }).single('image');

module.exports = upload;
