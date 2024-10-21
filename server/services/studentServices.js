const conn = require('../db');
const queries = require('../queries');
const messages = require('../messages');
const userServices = require('./userServices');
const { toFlipText, toFlipArray } = require('./generalServices');

/**
 * getAll teachers from the db
 * @returns array of all teachers, if error occured while process the qurey then
 * messages.ERR_SERVERR will return
 */
const getStudents = () => {
    return new Promise((resolve, reject) => {
        const sql = queries.getStudents();
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

const addStudent = (student, req) => {

    return new Promise((resolve, reject) => {

        conn.beginTransaction(async (err) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                try {


                    // const user = [student.id, student.firstname, student.lastname, student.username, student.email, student.phone
                    //     , student.birth_date];
                    // const addUserSql = queries.registerUser( student );
                    // const [res] = await conn.promise().query(addUserSql);
                    // console.log(res);
                    // if (res) {
                    //     conn.commit((err) => {
                    //         err ? conn.rollback(() => reject(messages.ERR_SERVERR)) : resolve(res)
                    //     })
                    // }
                    // conn.rollback(() => reject(messages.ERR_SERVERR));
                    await userServices.addUser({
                        id: student.id,
                        firstname: student.firstname,
                        lastname: student.lastname,
                        username: student.username,
                        email: student.email,
                        phone: student.phone,
                        birth_date: student.birth_date
                    }, req);
                    if (student.phone) {
                        //make sure the student phone is unique from other students\
                        const phoneUniqueSql = queries.phoneUniqueStudent(student.phone);
                        const [res] = await conn.promise().query(phoneUniqueSql);
                        if (res.length > 0) {
                            throw new Error('unique phone problem');
                        }
                    }
                    await add_student_service(student, req);
                    conn.commit((err) => {
                        if (err)
                            reject(messages.ERR_SERVERR);
                        else
                            resolve(student);
                    })

                } catch (e) {
                    console.log(e);
                    conn.rollback(() => reject(e.message))
                }
            }
        })

    })
}

const add_student_service = (student, req) => {
    return new Promise((resolve, reject) => {

        const addStudent = queries.addStudent();
        conn.query(addStudent, [student.id, student.enrollment_date, student.class_id, student.parent_name, student.parent_phone], (err, data) => {
            if (err) {
                console.log(err);
                const error = userServices.getErrorMessage(err, req)
                reject(new Error(error));
            } else {
                if (data.affectedRows === 1) {
                    resolve(student);
                } else {
                    reject(new Error(req.t('error')));
                }
            }
        });

    });
}

const updateStudent = (student, req) => {
    return new Promise((resolve, reject) => {


        conn.beginTransaction(async (err) => {
            if (err) {
                conn.rollback(() => reject('error'))
            } else {
                try {

                    await userServices.updateUser(student, req);
                    await update_student_service(student);

                    conn.commit((err) => {
                        if (err)
                            conn.rollback(() => reject('error'))
                        else
                            resolve(student);
                    })

                } catch (e) {
                    console.log(e);
                    conn.rollback(() => reject(e.message))
                }
            }
        })
    })
};

const update_student_service = (student) => {

    return new Promise((resolve, reject) => {

        const updateStudentSql = queries.updateStudent();
        conn.query(updateStudentSql, [student.class_id, student.parent_name, student.parent_phone, student.id], (err, data) => {
            if (err) {
                console.log(err);
                const error = userServices.getErrorMessage(err)
                reject(new Error(error));
            } else {
                if (data.affectedRows === 1) {
                    resolve(student);
                } else {
                    reject(new Error(messages.ERR_SERVERR));
                }
            }
        });

    });

}

const deleteStudent = (StudentId) => {
    return new Promise((resolve, reject) => {

        const deleteStudent = queries.deleteStudent(StudentId);
        conn.query(deleteStudent, StudentId, (err, data) => {
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

/** get document and attatch to it's conetnt a table for each class contain students data*/
const printStudents = (docDefinition, req) => (
    new Promise(async (resolve, reject) => {
        try {
            //first fetch all students data
            const getStudentsSQL = queries.getStudents();
            const [studentsData] = await conn.promise().query(getStudentsSQL);

            //now group students based on the class they belong
            const students = {};
            studentsData.forEach(student => {
                if (students[student.class_id])
                    students[student.class_id].push(student);
                else
                    students[student.class_id] = [student];
            });

            //now loop over classes and for each class create a table with students data
            Object.keys(students).forEach(class_id => {
                createTableForClass(class_id, students[class_id], docDefinition.content, req);
            });

            resolve();
        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
);

/**for each class get class_id, students belong to the class, and document content,
 * create a table that contain students data
 */
const createTableForClass = (class_id, students, content, req) => {

    //before the table show text message that indicate the students for which class are belong
    content.push({
        columns: [
            {
                width: '*',
                text: ``,
            },
            {
                width: 'auto',
                text: class_id > 12 ? req.t('gradute') : toFlipText(req.t('studentsClass', { class_id: class_id })),
                margin: 20
            },
            {
                width: '*',
                text: ``
            }
        ]
    });

    //now create the table
    content.push({
        columns: [
            { width: '*', text: '' },
            {
                width: 'auto',
                table: {
                    body: [
                        toFlipArray([req.t('id'), req.t('fullname'), req.t('phone'), req.t('parentName')], req.language),
                        ...students.map((student) => toFlipArray([
                            student.id,
                            toFlipText(student.firstname + ' ' + student.lastname),
                            student.phone,
                            toFlipText(student.parent_name),
                        ], req.language)),
                    ],
                    alignment: "center"
                }
            },
            { width: '*', text: '', pageBreak: 'after' },
        ]
    });
}


module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    printStudents
}