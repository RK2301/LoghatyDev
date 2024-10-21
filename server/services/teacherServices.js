const conn = require('../db');
const queries = require('../queries');
const messages = require('../messages');
const { addUser } = require('./userServices');

/**
 * getAll teachers from the db
 * @id if passed then return only the teachers with the corspended id
 * @returns array of all teachers, if error occured while process the qurey then
 * messages.ERR_SERVERR will return
 */
const getTeachers = (id) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getTeachers(id);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

const getCourseTeachers = (req) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getCourseTeachers();
        conn.query(sql, (err, data) => {
            if (err) {
                reject(req.t('error'));
            } else {
                resolve(data);
            }
        })
    })
}

const addNewTeacher = (userValues, teacherValues, req) => (
    new Promise((resolve, reject) => {
        conn.beginTransaction(async (err) => {
            if (err) {
                reject(req.t('error'));
                return;
            }

            try{  //start add teacher by adding new user then add the teacher to teachers table
                await addUser(userValues, req);
                await addTaecher(teacherValues, req);

                conn.commit( () => resolve() );
            }catch(err){
                console.log(err);

                conn.rollback( () => {
                    // if(err.message && err.message.split(' ')[0] === 'Duplicate'){
                    //     const errmsg = err.message.split(' ');
                    //     const filedErr = errmsg[errmsg.length-1].split('.')
                    //     console.log(filedErr);
                    //      reject( 'Duplicate '+ filedErr[filedErr.length-1].replace("'","") );
                    //      return;
                    // }
                    reject( err.message);
                })
            }
        })
    })
)

const addTaecher = (teacher, req) => {
    return new Promise((resolve, reject) => {

        const addTeacher = queries.addTeacher();
        conn.query(addTeacher, teacher, (err, data) => {
            if (err) {
                console.log(err);
                reject(new Error(req.t('error')));
            } else {
                resolve(true);
            }
        });

    });
}

const deleteTeacher = (teacherId) => {
    return new Promise((resolve, reject) => {

        const deleteTeacher = queries.deleteTeacher(teacherId);
        conn.query(deleteTeacher, req.params.id, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                if (data.affectedRows === 1) {
                    resolve(true);
                } else {
                    reject(messages.ERR_SERVERR);
                }
            }
        });

    });
}

const updateTeacher = (teacher) => {
    return new Promise((resolve, reject) => {
        const sql = queries.updateTeacher(teacher);
        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err);

                reject(err);
            } else {
                if (data.affectedRows === 1) {
                    resolve(teacher);
                } else {
                    reject(messages.ERR_SERVERR);
                }
            }
        })
    })
}

module.exports = {
    getTeachers,
    addTaecher,
    deleteTeacher,
    updateTeacher,
    getCourseTeachers,
    addNewTeacher
}