const multer = require('multer');
const fs = require('fs');

// Storage Engin That Tells/Configures Multer for where (destination) and how (filename) to save/upload our files
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `../server/uploads/${req.params.id}`;
    //create new folder if not exists
    fs.mkdirSync(path, { recursive: true });
    cb(null, path); //important this is a direct path fron our current file to storage location
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});


const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === "application/msword" ||
        file.mimetype ===            
        "application/vnd.openxmlformatsofficedocument.wordprocessingml.document"
    )   {
        cb(null, true);
        } else {
            cb(new Error("File format should be Docx"), false);
        }
};

const upload = multer({ storage: fileStorageEngine, fileFilter: this.none });

module.exports = upload;