const multer = require('multer');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public'); // Set the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  }
});

// Create multer instance
const upload = multer({ storage: storage });

module.exports = upload;

