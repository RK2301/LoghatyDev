const firebaseConfig = require("../firebaseConfig.js");
const { getDownloadURL, deleteObject, listAll, ref, child, uploadBytes } = require("firebase/storage");

const storage = firebaseConfig.storage;

/**
 * upload new file to the storage
 * @param {*} path path in the storage, must also contain file name
 * @param {*} file the file need to be uploaded
 */
const uploadFile = (path, file) => (
    new Promise((resolve, reject) => {

        const fileRef = ref(storage, path);
        uploadBytes(fileRef, file)
            .then((snapshot) => resolve())
            .catch(error => reject(error));
    })
);

/**
 * make api call to the storage to delete a specific file
 * @param {*} path 
 */
const deleteFile = (path) => (
    new Promise((resolve, reject) => {

       const fileRef = ref(storage, path);
       deleteObject(fileRef)
       .then(deleted => resolve())
       .catch(e => reject(e))
    })
)

/**
 * this module, supply method to work with firebase storage, uplaod, download, delete files
 */
module.exports = {
    uploadFile,
    deleteFile
}
