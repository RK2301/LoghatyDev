const conn = require('../db');
const queries = require('../queries');
const messages = require('../messages');
const fs = require('fs');
const { log } = require('console');
const { getDuplicatedMessage, getNotNullErrorMessage, constraintError, formatDateAndTime, getUserFilePath } = require('./generalServices');
const momentTimeZone = require('moment-timezone');
const CONFIG = require('../config');
const { storage } = require('../firebaseConfig');
const { uploadFile } = require('./firebaseStorageServices');

/**
 * Check if a given username unique, the function will query the DB
 * and return an appropirate result
 * @param {*} username 
 * @returns messages.ERR_SERVERR: if error occcured during query the db, 
 * messages.USERNAME_NOT_UNIQUE: if the username alredy exists, 
 * messages.USERNAME_UNIQUE: if username not exists in db yet
 */
const checkUniqueUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = queries.checkUsername(username);
        conn.query(sql, (error, data) => {
            if (error) {
                console.log(error);
                reject(messages.ERR_SERVERR)
            } else {
                if (data.length > 0) {
                    resolve(messages.USERNAME_NOT_UNIQUE);
                } else {
                    resolve(messages.USERNAME_UNIQUE);
                }
            }
        })
    })
}

const getUser = (userID) => {
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

/**get all users from the db except the user sent the request
 * , the users return as object with 2 props: students array contain all students, and teachers: another array contain all teachers
 */
const getAllUsers = (req) => (
    new Promise((resolve, reject) => {
        const getAllUsersSQL = queries.getAllUsers();
        conn.query(getAllUsersSQL, [req.user.uId], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'))
            } else {
                const users = { teachers: [], students: [] };
                data.forEach(user => {
                    if (user.class_id)
                        users.students.push(user);
                    else
                        users.teachers.push(user);
                })
                resolve(users)
            }
        })
    })
)

const addUser = (user, req) => {
    return new Promise((resolve, reject) => {

        const registerUser = queries.registerUser();
        conn.query(registerUser, [user.id, user.firstname, user.lastname, user.username, user.email, user.phone, user.birth_date], (err, data) => {
            if (err) {
                console.log(err);
                const error = getErrorMessage(err, req);
                reject(new Error(error));
            } else {
                resolve(true);
            }

        });
    })
}

/**
 * Add new file info to the DB, the name of the file and manager_id are required
 * @param {*} file the file to be uploaded to the storage and save to db 
 * @param {*} manager_id who added the file for the specific user
 * @param user_id for the user to add the file
 */
const addFile = (file, user_id, manager_id) => (
    new Promise((resolve, reject) => {

        conn.beginTransaction(async (e) => {
            if (e) {
                conn.rollback(() => reject(req.t('error')));
                return;
            }

            try {
                const sql = queries.addFile();
                let now = momentTimeZone();
                now = now.clone(CONFIG.APP_TIMEZONE);
                now = formatDateAndTime(now);

                const addFilePromise = conn.promise().query(sql, [file.originalname, now, manager_id, user_id]);

                //upload to the storage, first get the username form user_id to create a path in the storage
                const getUserSQL = queries.getUser(user_id);
                const [userData] = await conn.promise().query(getUserSQL);

                if (userData.length == 0)
                    throw new Error(req.t('notFound'));

                const username = userData[0].username;
                const path = getUserFilePath(username, file.originalname);
                const uploadFilePromise = uploadFile(path, file.buffer);

                const [fileData] = await addFilePromise;
                const fileObject = {
                    name: file.originalname,
                    upload_date: now,
                    id: fileData.insertId
                }

                await uploadFilePromise;
                resolve(fileObject);
            } catch (e) {
                console.log(e);

                let msg = e.message;
                if (msg !== req.t('notFound')) {
                    msg = req.t('error');
                }
                conn.rollback(() => reject(msg));
            }
        })
    })
)

/**
 * Insert the id created by the mysql server to the file name
 * @param {*} path for the created file
 * @param {*} id generated by mySQL server
 * @returns id of the file if changed, else messages.ERR_SERVERR
 */
const changeFileName = (path, id) => {
    return new Promise((resolve, reject) => {
        // let newPath = path.split('.');
        // newPath[newPath.length-2]+=`-${id}`;
        // newPath = newPath.join('/');
        // console.log(`The new Path`);
        // console.log(newPath);
        const newPath = getNewPath(path, id);

        fs.rename(path, newPath, (err) => {
            console.log(err);
            if (err) {
                reject(messages.ERR_SERVERR)
            } else {
                resolve(id);
            }
        });
    })
}

/**
 * update the user data by query the db
 * @param {*} user 
 * @returns messages.ERR_SERVERR if error found, else the user object
 */
const updateUser = (user, req) => {
    return new Promise((resolve, reject) => {
        const updateSql = queries.updateUser();

        conn.query(updateSql, [user.firstname, user.lastname, user.email, user.phone, user.birth_date, user.id], (err, data) => {
            if (err) {
                log(err)
                const error = getErrorMessage(err, req);
                reject(new Error(error));
            } else {
                if (data.affectedRows === 1) {
                    resolve(user);
                } else {
                    reject(messages.ERR_SERVERR);
                }
            }
        })
    })
}

/**
 * Delete an specific user by query the db
 * @param {*} id 
 * @returns if exists resolve with true, if not exists return 
 * messages.NOT_FOUND, if an error occured at the db an 
 * messages.ERR_SERVERR returned
 */
const deleteuser = (id) => {
    return new Promise((resolve, reject) => {
        const sql = queries.deleteUser(id);
        conn.query(sql, (error, data) => {
            if (error) {
                console.log(error);
                reject(messages.ERR_SERVERR);
            } else {
                console.log(data);
                if (data.affectedRows === 1) {
                    resolve(true);
                } else {
                    reject(messages.NOT_FOUND);
                }
            }
        })
    })
}



/**
 * query the db to get all the notes for specific user
 * @param {*} userID 
 * @returns all the notes for user, if an error occured messages.ERR_SERVERR returned
 */
const getNotes = (userID) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getNotes(userID);
        conn.query(sql, (error, data) => {
            if (error) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data)
            }
        })
    })
}

/**
 * query the db to add a new note
 * @param {*} note 
 * @returns if query successed then the insertedId to the note, else messages.ERR_SERVERR or messages.FOREIGN_KEY_FAIL
 * if the user or manager not found
 */
const addNote = (note) => {
    return new Promise((resolve, reject) => {
        const sql = queries.addNote(note.note_title, note.note_text, note.created_by, note.recipient_id);
        conn.query(sql, (err, data) => {
            if (err) {
                log(err)
                if (err.message.toLocaleLowerCase().includes(messages.FOREIGN_KEY_FAIL)) {
                    reject(messages.FOREIGN_KEY_FAIL)
                } else {
                    reject(messages.ERR_SERVERR);
                }
            } else {
                if (data.insertId) {
                    resolve(data.insertId);
                } else {
                    reject(messages.ERR_SERVERR)
                }
            }
        })
    })
}

/**
 * query the db to update a note
 * @param {*} newNote 
 * @returns the newNote is success, else if an error occured at the db then messages.ERR_SERVERR,
 * if no rows changes then : messages.NOT_FOUND
 */
const updateNote = (newNote) => {
    return new Promise((resolve, reject) => {
        const sql = queries.updateNote(newNote.note_id, newNote.note_title, newNote.note_text);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR)
            } else {
                log(data)
                if (data.affectedRows === 1) {
                    resolve(newNote);
                } else {
                    reject(messages.NOT_FOUND)
                }
            }
        })
    })
}

/**
 * query the db to delete a note by id
 * @param {*} note_id 
 * @returns note_id if success, if an error occured at the db then messages.ERR_SERVERR, 
 * if the query result -> not rows deleted then messages.NOT_FOUND
 */
const deleteNote = (note_id) => {
    return new Promise((resolve, reject) => {
        const sql = queries.deleteNote(note_id);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                if (data.affectedRows === 1) {
                    resolve(note_id);
                } else {
                    reject(messages.NOT_FOUND);
                }
            }
        })
    })
}


/***************************Function to work with path for files************************************** */

/**
 * Get the new for the added file
 * an id will be append to the file name
 * @param {*} path 
 * @param {*} id 
 * @returns new path with append id to the file path
 */
const getNewPath = (path, id) => {
    const newPath = path.split('\\');
    toChangeName = newPath[newPath.length - 1].split('.');

    toChangeName[toChangeName.length - 2] += `-${id}`;
    newPath[newPath.length - 1] = toChangeName.join('.');

    return newPath.join('\\');
}

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

/**
 *
 * @param {*} error mysql erorr object
 * @returns error message for the error based on error number to send back to the client
 */
const getErrorMessage = (error, req) => {
    switch (error.errno) {
        case 1062:
            let columnName = getDuplicatedMessage(error.message);
            columnName = columnName === 'PRIMARY' ? 'id' : columnName;
            return req.t('duplicateError', { field: req.t(columnName) });
        case 1048:
            //can't insert null value
            const toReturn = getNotNullErrorMessage(error.message);
            return req.t('notNullMessageError', { field: req.t(toReturn) });
        case 3819:
            //faield constrain 
            const constraint = constraintError(error.message);
            return req.t(constraint);

        default:
            return req.t('error');
    }
}


module.exports = {
    checkUniqueUsername,
    getUser,
    addUser,
    updateUser,
    deleteuser,
    addFile,
    changeFileName,
    addIdToName,
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    getErrorMessage,
    getAllUsers
}