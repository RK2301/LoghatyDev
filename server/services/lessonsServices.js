const conn = require('../db');
const queries = require('../queries');
const messages = require('../messages');
const momentTimeZone = require('moment-timezone');
const CONFIG = require('../config');
const storageServices = require('./firebaseStorageServices');
const { getUnitFileURL, formatTheDate, formatDateAndTime, getHomeworkFileURL, getHomeworFolderURL } = require('./generalServices');
const { ref, getDownloadURL, deleteObject, listAll } = require('firebase/storage');
const { storage } = require('../firebaseConfig');
const { file } = require('pdfkit');

/**
 * getAll teachers from the db
 * @returns array of all teachers, if error occured while process the qurey then
 * messages.ERR_SERVERR will return
 */
const getLessons = (courseID, req) => {
    return new Promise((resolve, reject) => {
        const sql = queries.courseDetails(courseID);
        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                reject(messages.ERR_SERVERR);
            } else {
                /**check if the request is from student, then don't send a un visible lessons */
                const user = req.user;
                if (user.role === 's') {
                    data = data.filter(lesson => {
                        if (lesson.is_visible)
                            return true;
                        //check if can be visible, mean the visible dateTime has passed
                        let visible_time = momentTimeZone.tz(lesson.visible_time, 'Asia/Jerusalem');
                        visible_time = visible_time.clone().tz(CONFIG.SERVER_LOCATION);
                        const now = momentTimeZone();

                        if (now >= visible_time)
                            return true;
                        return false;
                    });
                }
                resolve(data);
            }
        })
    })
}

const getLesson = (lessonID) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getLesson(lessonID);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

// const deleteLesson = (LessonId) => {
//     return new Promise((resolve, reject) => {

//         const deleteLesson = queries.deleteLesson(LessonId);
//         conn.query(deleteLesson, LessonId, (err, data) => {
//             if (err) {
//                 console.log(err)
//                 reject(messages.ERR_SERVERR);
//             } else {
//                 if (data.affectedRows === 1) {
//                     resolve(true);
//                 } else {
//                     reject(messages.ERR_SERVERR);
//                 }
//             }
//         });

//     });
// }

const getHomeworkSubmits = (course_id, hw_id, req) => {
    return new Promise((resolve, reject) => {

        let sql = queries.getSubmitedHomework(hw_id, course_id);

        //if student what submittions then return only the submmit he make
        if (req.user.role === 's')
            sql = queries.getSubmitedHomework(hw_id, course_id, req.user.uId);

        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve(data);
            }
        })
    })
}

/**
 * add new submit for student, check first if student is register for the course,
 * then if user has not submitted yet,
 * if 2 conditions meet, then add the submit and files save to the storage
 * @param {*} submit 
 * @param {*} course_id 
 * @param {*} hw_id 
 * @param {*} student_id 
 * for internal error return t('error'), for user bad request return proper message
 */
const submit_homework = (files, course_id, hw_id, student_id, req, addSubmit = true) => (
    new Promise(async (resolve, reject) => {
        try {
            const toReturn = {
                submit_files: []
            }
            //first check if user register to the course
            const studentRegisterSQL = queries.registeredStudent();
            const [studentRegister] = await conn.promise().query(studentRegisterSQL, [student_id, course_id]);

            //student not registered to the course can't submit homework
            if (studentRegister.length === 0)
                reject(req.t('notRegister'));

            const studentSubmitHomework = queries.studentSubmitHomework();
            const [studentAlreadySubmit] = await conn.promise().query(studentSubmitHomework, [student_id, hw_id]);

            if (addSubmit) {
                //now check if student not submitted earlier    
                if (studentAlreadySubmit.length === 1)
                    return reject(req.t('alreadySubmit'));
            } else {
                //user try to update submit not exists
                if (studentAlreadySubmit.length === 0)
                    return reject(req.t('notFound'));
                else if (studentAlreadySubmit[0].grade) {
                    //student has a feedback from the teacher so can't update the submit
                    return reject(req.t('errorUpdateSubmit'))
                }

            }

            //now add student submit data, and files to db and storage
            conn.beginTransaction(async (err) => {
                try {

                    if (addSubmit) {
                        const now = momentTimeZone();
                        let upload_time = now.clone().tz(CONFIG.APP_TIMEZONE);
                        upload_time = formatDateAndTime(upload_time);

                        const submitHomeworkSQL = queries.submitHomework();
                        await conn.promise().query(submitHomeworkSQL, [student_id, hw_id, upload_time]);

                        //submit data to be retireved to the user
                        toReturn.submitData = {
                            student_id: student_id,
                            upload_time: upload_time,
                        }
                    }

                    //now add files to the storage then to the db
                    const filePromises = [];
                    files.forEach(file => {
                        let file_path = getHomeworkFileURL(course_id, hw_id, req.user.username, file.originalname);
                        filePromises.push(storageServices.uploadFile(file_path, file.buffer));
                    })


                    //now push the file data to the database
                    const dbFilePromises = [];
                    files.forEach(file => {
                        const addFileSQL = queries.addHomeworkFile();
                        dbFilePromises.push(conn.promise().query(addFileSQL, [file.originalname, student_id, hw_id]));
                    });

                    const newFileIds = await Promise.all(dbFilePromises);
                    newFileIds.forEach(([file_id], i) => {

                        toReturn.submit_files.push({
                            file_id: file_id.insertId,
                            file_name: files[i].originalname,
                            student_id: student_id
                        });
                    });

                    //wait for upload to the storage to be done
                    await Promise.all(filePromises);
                    conn.commit(() => {
                        addSubmit ? resolve(toReturn) : resolve(toReturn.submit_files)
                    });

                } catch (e) {
                    console.log(e);
                    reject(req.t('error'));
                }

            })


        } catch (e) {
            console.log(e);
            reject(req.t('error'))
        }
    })
)

/**
 * add new lesson to specific course
 * @param {*} lesson 
 * @param {*} req 
 */
const addLesson = (lesson, req) => (
    new Promise((resolve, reject) => {
        const addSQL = queries.addLesson();
        conn.query(addSQL, [lesson.course_id, lesson.lesson_title, lesson.is_visible, lesson.visible_time], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve({ ...lesson, lesson_id: data.insertId });
            }
        })
    })
)

/**
 * update exists lesson 
 * @param {*} lesson 
 * @param {*} req 
 */
const updateLesson = (lesson, req) => (
    new Promise((resolve, reject) => {
        const updateSQL = queries.updateLesson();
        conn.query(updateSQL, [lesson.lesson_title, lesson.is_visible, lesson.visible_time, lesson.lesson_id], (error, data) => {
            if (error) {
                console.log(error);
                reject(req.t('error'))
            } else {
                resolve({ ...lesson });
            }
        })
    })
);

/**delete lesson data from the db ,first delete all lesson units then delete the lesson */
const deleteLesson = (lesson_id, course_id, req) => 
   new Promise( async(resolve, reject) => {
       try{
         // first get all lesson units
          const getUnitsSQL = queries.getLessonUnits();
          const [units] = await conn.promise().query(getUnitsSQL, [lesson_id]);

          //for each unit delete unit data
          const unitsPromises = [];
          units.forEach(unit => unitsPromises.push( deleteUnit(unit.unit_id, course_id, req) ));

          await Promise.all( unitsPromises );
          
          const deleteLessonSQL = queries.deleteLesson();
          await conn.promise().query( deleteLessonSQL, [lesson_id] );

          resolve();
       }catch(e){
        console.log(e);
        reject( req.t('error') );
       }
   })

/**
 * add new unit to the db, first upload files if exists, to the firebase storage,
 * then add unit, and files data to the db
 * @param {*} unit 
 * @param {*} files array contain the files uploaded form the user - if exists
 * @param {*} req 
 */
const addUnit = (unit, files, course_id, req) => (
    new Promise((resolve, reject) => {
        conn.beginTransaction(async (error) => {
            try {
                if (error)
                    throw new Error();

                unit.lesson_id = parseInt(unit.lesson_id);

                //if there a note in unit object then add note to the unit into the db
                let note_id = null;
                if (unit.note_text) {
                    const addNoteSql = queries.addStudyUnitNote();
                    const [addNote] = await conn.promise().query(addNoteSql, [unit.note_text]);
                    note_id = addNote.insertId;
                }

                const addUnitSql = queries.addStudyUnit();
                const [addStudyUnit] = await conn.promise().query(addUnitSql, [unit.lesson_id, note_id]);
                const unit_id = addStudyUnit.insertId;

                if (unit.hw_title) {
                    //the user want to add a homework, then add homework to the db
                    const addHomeworkSQL = queries.addHomeworkUnit();

                    const now = momentTimeZone();
                    let upload_time = now.clone().tz(CONFIG.APP_TIMEZONE);
                    upload_time = formatDateAndTime(upload_time);
                    await conn.promise().query(addHomeworkSQL, [unit_id, unit.hw_title, unit.submit_time, upload_time]);
                    unit.upload_time = upload_time;
                }

                if (files && files.length > 0) {
                    //first upload files to the storage
                    const filePromises = [];
                    for (let file of files) {
                        let file_path = getUnitFileURL(course_id, unit.lesson_id, unit_id, file.originalname);
                        filePromises.push(storageServices.uploadFile(file_path, file.buffer));
                    }

                    //now after upload all the files to the db add files data to the db, in another loop
                    const addStudyFilesPromises = [];
                    //array contain all files data to sent back to the client
                    const newFiles = [];
                    for (let file of files) {
                        const addFileSQL = queries.addStudyUnitFile();
                        const [newFile] = await conn.promise().query(addFileSQL, [formatTheDate(new Date()), req.user?.uId, file.originalname]);

                        const addFileUnitSQL = queries.addStudyUnitFiles();
                        addStudyFilesPromises.push(conn.promise().query(addFileUnitSQL, [newFile.insertId, unit_id]));

                        //now create file object, contain all file data to be sent back to the client
                        newFiles.push({
                            file_id: newFile.insertId,
                            upload_date: formatTheDate(new Date()),
                            user_upload: req.user.uId,
                            file_name: file.originalname,
                            unit_id: unit_id
                        });
                    }
                    await Promise.all(addStudyFilesPromises);
                    await Promise.all(filePromises);

                    unit.files = newFiles;
                } else {
                    unit.files = [];
                }

                //commit and return the new created unit data
                unit.unit_id = unit_id;
                unit.note_id = note_id;

                conn.commit(() => resolve(unit));
            } catch (e) {
                console.log(e);
                conn.rollback(() => reject(req.t('error')))
            }
        });
    })
);

const updateUnit = (unit, files, course_id, req) => (
    new Promise((resolve, reject) => {

        conn.beginTransaction(async (err) => {
            if (err) {
                reject(req.t('error'));
            }

            try {
                //first get current unit data from the db
                const getUnitSQL = queries.getStudyUnit(unit.unit_id);
                let [oldUnitData] = await conn.promise().query(getUnitSQL);
                oldUnitData = oldUnitData[0];

                if (oldUnitData.note_id === null && unit.note_text) {
                    //add new note to the unit
                    const addNoteSql = queries.addStudyUnitNote();
                    const [addStudyNote] = await conn.promise().query(addNoteSql, [unit.note_text]);
                    unit.note_id = addStudyNote.insertId;
                } else if (oldUnitData.note_id !== null && oldUnitData.note_text?.toLowerCase() !== unit.note_text?.toLowerCase()) {
                    //update the exists note
                    const updateStudyUnitNote = queries.updateStudyUnitNote();
                    await conn.promise().query(updateStudyUnitNote, [unit.note_text, unit.note_id]);
                }

                if (unit.hw_title) {
                    //now check if the user want to update an exists homework unit
                    const updateHomeworkSQL = queries.updateHomeworkUnit();
                    await conn.promise().query(updateHomeworkSQL, [unit.hw_title, unit.submit_time, unit.unit_id]);
                }

                //now check if the user want to upload another files, in addition to the exists files
                if (files && files.length > 0) {

                    const filePromises = [];
                    for (let file of files) {
                        let file_path = getUnitFileURL(course_id, unit.lesson_id, unit.unit_id, file.originalname);
                        filePromises.push(storageServices.uploadFile(file_path, file.buffer));
                    }
                    await Promise.all(filePromises);

                    //now after upload all the files to the storage, add files data to the db, in another loop
                    const addStudyFilesPromises = [];
                    //array contain all files data to sent back to the client
                    const newFiles = [];
                    for (let file of files) {
                        const addFileSQL = queries.addStudyUnitFile();
                        const [newFile] = await conn.promise().query(addFileSQL, [formatTheDate(new Date()), req.user?.uId, file.originalname]);

                        const addFileUnitSQL = queries.addStudyUnitFiles();
                        addStudyFilesPromises.push(await conn.promise().query(addFileUnitSQL, [newFile.insertId, unit.unit_id]));

                        //now create file object, contain all file data to be sent back to the client
                        newFiles.push({
                            file_id: newFile.insertId,
                            upload_date: formatTheDate(new Date()),
                            user_upload: req.user.uId,
                            file_name: file.originalname,
                            unit_id: parseInt(unit.unit_id)
                        });
                    }
                    Promise.all(addStudyFilesPromises);
                    unit.files = newFiles;
                } else {
                    unit.files = [];
                }

                //commit the changes and return the updated unit object
                conn.commit(() => resolve(unit));

            } catch (e) {
                console.log(e);
                conn.rollback(() => reject(req.t('error')));
            }
        });
    })
);

/**delete a unit data, like note, files, and if the unit is homework then delete all submittion */
const deleteUnit = (unit_id, course_id, req) => (
    new Promise(async (resolve, reject) => {
        try {
            //first get unit data
            const getUnitSQL = queries.getStudyUnit(unit_id);
            const [data] = await conn.promise().query(getUnitSQL);

            if (data.length === 0)
                throw new Error(req.t('notFound'));

            const unitData = data[0];

            //if there a note then delete it, not matter if the note deleted from the db
            if (unitData.note_id) {
                const deleteNoteSQL = queries.deleteStudyUnitNote();
                conn.query(deleteNoteSQL, [unitData.note_id], (err, data) => { });
            }

            //now get the unit files data and delete from the firebase storage
            const getFilesSQL = queries.getStudyUnitFiles();
            const [filesData] = await conn.promise().query(getFilesSQL, [unitData.unit_id]);

            //loop over the files and delete from the firebase and db
            filesData.forEach(file => {
                const file_path = getUnitFileURL(course_id, unitData.lesson_id, unitData.unit_id, file.file_name);
                storageServices.deleteFile(file_path).catch(e => {});
            });

            //now check if the unit is also homework unit, if yes also delete the submittions from the students
            //delete the files the students submitted
            if( unitData.submit_time ){
            const homeworkFilesSQL = queries.getHomeworkFiles();
            const [files] = await conn.promise().query(homeworkFilesSQL, [unitData.unit_id]);

            files.forEach(file => {
                const file_path = getHomeworkFileURL(course_id, unitData.unit_id, file.username, file.file_name);
                storageServices.deleteFile( file_path ).catch(e => {});
             })
            }

            conn.beginTransaction( async(err) => {
                try {
                    const filesPromises = [];
                    filesData.forEach(file => {
                        const deleteFileSQL = queries.deleteStudyUnitFile(file.file_id);
                        filesPromises.push( conn.promise().query(deleteFileSQL) );
                    });

                
                    const deleteUnitSQL = queries.deleteStudyUnit();
                    await conn.promise().query(deleteUnitSQL, [unit_id]);
                    await Promise.all(filesPromises);

                    conn.commit(() => resolve());
                } catch (e) {
                    console.log(e);
                    conn.rollback( () => reject(req.t('error')) );
                }
            })

        } catch (e) {
            console.log(e);
            let msg = e.message;
            if( msg !== req.t('notFound') )
               msg = req.t('error');
            reject( msg );
        }
    })
)

/**
 * for a given student submittion on specific homework, give a feedback, the feedback should be given by the teacher
 * on manager
 * @param {*} hw_id 
 * @param {*} student_id 
 * @param {*} grade 
 * @param {*} submit_note 
 * @param {*} req 
 */
const giveFeedbackForHomework = (hw_id, student_id, grade, submit_note, req) => (
    new Promise(async (resolve, reject) => {
        try {
            const giveFeedback = queries.giveFeedbackForHomework();
            await conn.promise().query(giveFeedback, [grade, submit_note, student_id, hw_id]);
            resolve();
        } catch (e) {
            console.log(e);
            reject(req.t('error'))
        }
    })
);

/**for a student, get all the homeworks the student not submitted, from all the courses the students takes */
const getUnsubmittedHomeworks = (req) => (
    new Promise((resolve, reject) => {
        const notSubmmitedHomework = queries.getNotSubmittedHomeworks();
        conn.query(notSubmmitedHomework, [req.user.uId], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve(data)
            }
        })
    })
)

/**
 * get file url to send back to client to download the requested file, first query db to get file_name
 * then get file url and download
 * @param {*} course_id 
 * @param {*} lesson_id 
 * @param {*} unit_id 
 * @param {*} file_id 
 * @param {*} req 
 * @returns file url to access file and download
 */
const getFileURL = (course_id, lesson_id, unit_id, file_id, req) => (
    new Promise(async (resolve, reject) => {
        try {
            const getFileNameSQL = queries.getUnitFileName(file_id);
            const [res] = await conn.promise().query(getFileNameSQL);

            const file_name = res[0]?.file_name;
            if (!file_name) {
                //return error message
                return reject(req.t('notFound'));
            }
            const fileRef = ref(storage, getUnitFileURL(course_id, lesson_id, unit_id, file_name));

            const fileURL = await getDownloadURL(fileRef);
            resolve(fileURL);
        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
);

/**
 * 
 * @param {*} course_id 
 * @param {*} hw_id 
 * @param {*} file_id 
 * @param {*} req 
 * @returns a url for a file submitted by the student for a specific homework
 */
const getHomeFileURL = (course_id, hw_id, file_id, req) => (
    new Promise(async (resolve, reject) => {
        try {
            const getFileNameSQL = queries.getHomeworkFileName();
            const [res] = await conn.promise().query(getFileNameSQL, [file_id]);

            const file_name = res[0]?.file_name;
            if (!file_name) {
                //return error message
                return reject(req.t('notFound'));
            }

            if (req.user.role !== 's') {
                //get user name to make ref to the file
                const getStudentUsername = queries.getUser(res[0].student_id);
                const [studentUsername] = await conn.promise().query(getStudentUsername);
                const fileRef = ref(storage, getHomeworkFileURL(course_id, hw_id, studentUsername[0].username, file_name));
                const fileURL = await getDownloadURL(fileRef);
                resolve(fileURL);
            } else {
                const fileRef = ref(storage, getHomeworkFileURL(course_id, hw_id, req.user.username, file_name));
                const fileURL = await getDownloadURL(fileRef);
                resolve(fileURL);
            }

        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
)

/**
 * delete the file from the db, and firebase storage, if an error occured during the delete
 * , then will rollback all the changes made
 * @param {*} course_id 
 * @param {*} lesson_id 
 * @param {*} unit_id 
 * @param {*} file_id 
 * @param {*} req 
 */
const deleteFile = (course_id, lesson_id, unit_id, file_id, req) => (
    new Promise((resolve, reject) => {

        conn.beginTransaction(async (err) => {
            if (err)
                reject(req.t('error'));

            try {
                //get file name to later delete from the storage
                const getFileNameSQL = queries.getUnitFileName(file_id);
                const [res] = await conn.promise().query(getFileNameSQL);
                const file_name = res[0]?.file_name;

                if (!file_name) {
                    //file not exists, return error
                    reject(req.t('notFound'));
                }

                //first delete the file from the db
                const deleteStudyUnitFiles = queries.deleteStudyUnitFiles(file_id);
                await conn.promise().query(deleteStudyUnitFiles);

                const deleteStudyUnitFile = queries.deleteStudyUnitFile(file_id);
                await conn.promise().query(deleteStudyUnitFile);

                //now delete the file from the db
                const fileRef = ref(storage, getUnitFileURL(course_id, lesson_id, unit_id, file_name));
                await deleteObject(fileRef);

                //commit changes 
                conn.commit(() => resolve());

            } catch (e) {
                console.log(e);
                conn.rollback(() => reject(req.t('error')));
            }
        })
    })
);

/**
 * delete submittion homework file
 * the delete can be fail if :
 * 1 the file note exists
 * 2 error while delete from the db or storage
 * 3 the teacher has give already feedback on the submittion
 * 4 the user try to delete the last file, since the submittion should contain at least one file
 * @param {*} course_id 
 * @param {*} hw_id 
 * @param {*} file_id 
 * @param {*} student_id 
 * @param {*} req 
 */
const deleteHomeworkFile = (course_id, hw_id, file_id, student_id, req) => (
    new Promise(async (resolve, reject) => {

        try {
            //first get file, and check the teacher not yet gived feedback
            //if the teacher give feedback to the homework, then cann't delete the files submitted
            const getHomeworkFileName = queries.getHomeworkFileName();
            const getFileNamePromise = conn.promise().query(getHomeworkFileName, [file_id]);

            const getStudentSubmittedFilesSQL = queries.getStudentSubmittedFiles();
            const submittedFilesPromise = conn.promise().query(getStudentSubmittedFilesSQL, [student_id, hw_id]);

            const studentSubmitHomework = queries.studentSubmitHomework();
            const [studentSubmittion] = await conn.promise().query(studentSubmitHomework, [student_id, hw_id]);

            if (studentSubmittion.length === 0)
                return reject(req.t('notFound'));
            else if (studentSubmitHomework[0].grade)
                return reject(req.t('errorDeleteSubmit'));

            const [fileName] = await getFileNamePromise;
            if (!fileName.length || !fileName[0].file_name)
                return reject(req.t('notFound'));

            //submittion should contain at least one file
            const [submittedFiles] = await submittedFilesPromise;
            if (submittedFiles.length <= 1)
                return reject(req.t('submitAtLeastFile'));

            //now delete from the db and storage
            conn.beginTransaction(async (err) => {
                if (err)
                    return reject(req.t('error'));
                try {
                    const fileURL = getHomeworkFileURL(course_id, hw_id, req.user.username, fileName[0].file_name);
                    storageServices.deleteFile(fileURL);

                    const deleteHomeworkFile = queries.deleteHomeworkFile(file_id);
                    await conn.promise().query(deleteHomeworkFile);

                    conn.commit(() => resolve());
                } catch (e) {
                    console.log(e);
                    conn.rollback(() => reject(req.t('error')));
                }
            })

        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
);

/**delete the submittion of student for a specific homework, first delete all files data, then delete the submittion data, 
 * finally dalete the files from the storage
 */
const deleteSubmittion = (course_id, hw_id, student_id, req) => (
    new Promise((resolve, reject) => {

        conn.beginTransaction(async (err) => {
            if (err)
                return reject(req.t('error'));

            try {
                //delete from the db
                // const deleteSubmittedFiles = queries.deleteHomeworkSubmittedFiles();
                // await conn.promise().query(deleteSubmittedFiles, [hw_id, student_id]);
                const studentSubmitHomework = queries.studentSubmitHomework();
                const [studentAlreadySubmit] = await conn.promise().query(studentSubmitHomework, [student_id, hw_id]);


                if (studentAlreadySubmit[0]?.grade) {
                    conn.rollback(() => reject(req.t('errorDeleteSubmit')))
                    return
                }

                //now wait to the files to be deleted from the db to delete the submit data
                const deleteHomeworkSubmit = queries.deleteHomeworkSubmit();
                await conn.promise().query(deleteHomeworkSubmit, [hw_id, student_id]);

                // delete the files the user submit, from the storage.
                const deleteFilePromise = [];

                const folderRef = ref(storage, getHomeworFolderURL(course_id, hw_id, req.user.username));
                const folderFiles = await listAll(folderRef)
                folderFiles.items.forEach((item) => {
                    const fileRef = ref(storage, item.fullPath);
                    deleteFilePromise.push(deleteObject(fileRef));
                });
                await Promise.all(deleteFilePromise);

                conn.commit(() => resolve());
            } catch (e) {
                console.log(e.message);
                conn.rollback(() => reject(req.t('error')));
            }
        })
    })
)



module.exports = {
    getLessons,
    getLesson,
    deleteLesson,
    getHomeworkSubmits,
    addLesson,
    updateLesson,
    addUnit,
    updateUnit,
    getFileURL,
    deleteFile,
    submit_homework,
    getHomeFileURL,
    deleteHomeworkFile,
    giveFeedbackForHomework,
    deleteSubmittion,
    getUnsubmittedHomeworks,
    deleteUnit
}