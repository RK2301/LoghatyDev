const conn = require('../db');
const queries = require('../queries');
const messages = require('../messages');
const fs = require('fs');
const path = require('path');
const userServices = require('./userServices');
const { getUserFilePath } = require('./generalServices');
const { ref, getDownloadURL, deleteObject } = require('firebase/storage');
const { storage } = require('../firebaseConfig');
const { log } = require('console');

const getFiles = (userID) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getUserFiles(userID);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

const getAllFiles = (folderPath) => {
    currentFolderPath = __dirname;
    const fullPath = path.resolve(currentFolderPath, folderPath);
    const files = fs.readdirSync(fullPath);
    let allFiles = [];

    files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isFile()) {
            allFiles.push(filePath);
        } else if (fileStat.isDirectory()) {
            const nestedFiles = getAllFiles(filePath);
            allFiles = allFiles.concat(nestedFiles);
        }
    });

    return allFiles;
}


/**for a given file id and user_id return a url for the file in the storage , so the client can make api request to that 
 * url and get the file
 */
const getFileURL = (user_id, file_id, req) => (
    new Promise(async (resolve, reject) => {
        try {
            const fileNameSQL = queries.getFileName(file_id);
            const fileDataPromise = conn.promise().query(fileNameSQL);

            const userDataSQL = queries.getUser(user_id);
            const userDataPromise = conn.promise().query(userDataSQL);

            const [fileData] = await fileDataPromise;
            if (fileData.length === 0) {
                reject(req.t('notFound'));
                return;
            }
            const file_name = fileData[0].name;

            const [userData] = await userDataPromise;
            const username = userData[0].username;

            //get the url from the storage;
            const fileRef = ref(storage, getUserFilePath(username, file_name));
            const fileURL = await getDownloadURL(fileRef);

            resolve(fileURL);
        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
);

/**delete a specific file from the db and the storage */
const deleteFile = (user_id, file_id, file_name, req) => (
    new Promise((resolve, reject) => {
        conn.beginTransaction(async (err) => {
            if (err) {
                reject(req.t('error'));
                return;
            }

            try {
                const deleteFileSql = queries.deleteFile(file_id);
                const deletePromise = conn.promise().query(deleteFileSql);

                const getUserSQL = queries.getUser(user_id);
                const userPromise = conn.promise().query(getUserSQL);

                const [deleteData] = await deletePromise;
                const [userData] = await userPromise;

                if (deleteData.affectedRows === 0) {
                    conn.rollback(() => reject(req.t('notFound')));
                    return;
                }

                const username = userData[0]?.username;
                const filePath = getUserFilePath(username, file_name);

                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef);
                resolve();

            } catch (e) {
                console.log(e);
                conn.rollback( () => reject(req.t('error')) )
            }
        })
    })
)

/**
 * Takes file and file id, add id to the end of file name before the '.filetype'
 * like 'app.js' & fileId = 1 => return 'app-1.js'
 * @param {*} fileID 
 * @param {*} file_name 
 * @returns 
 */
const addIdToName = (fileID, file_name) => {
    const arrFile = file_name.split('.');
    arrFile[arrFile.length - 2] += `-${fileID}`;
    return arrFile.join('.');
}



module.exports = {
    getFiles,
    getAllFiles,
    deleteFile,
    addIdToName,
    getFileURL
}