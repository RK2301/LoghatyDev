const conn = require('../db');
const queries = require('../queries');
const messages = require('../messages');
const { getTimeFromDate, formatTheDate } = require('./generalServices');
const momentTimeZone = require('moment-timezone');
const CONFIG = require('../config');

/**
 * get courses based on user access if teacher return the courses the teacher pass
 * for students the courses he\she register
 * for students, return the lesson that are visible to the students
 * @param student_id if received return all courses for stduent with  the specific id,
 * mainly for manager who want to get student courses
 */
const getCourses = (req, student_id) => {
    return new Promise((resolve, reject) => {
        const user = req.user;
        let sql = queries.getAllCourses();
        if (student_id)
            sql = queries.getAllCourses(null, student_id);
        else if (user.role === 't')
            sql = queries.getAllCourses(user.uId);
        else if (user.role === 's')
            sql = queries.getAllCourses(null, user.uId);

        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err.message);
                reject(req.t('error'));
            } else {
                if (data.length === 0) {
                    resolve(data);
                    return;
                }
                data.forEach(async (course, i) => {
                    try {
                        const courseMeetingsSQL = queries.getCourseMeetings(course.course_id);
                        const [courseMeetings] = await conn.promise().query(courseMeetingsSQL);
                        course.course_meetings = courseMeetings;
                        //if the last one return the data to the controller
                        if (i === data.length - 1)
                            resolve(data);
                    } catch (e) {
                        reject(req.t('error'));
                    }
                })
            }
        })
    })
}

const getCourse = (courseID) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getCourse(courseID);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

/**check for logic to add new course to add new course must be: 
 * 1- the teacher pass the course not pass a course between the new course and have collsion 
 * in meetings time, like start or end, during a meeting from already added course
 * 2- if no collsion found then add the course, course meetings, create new course unit for 
 * homeworks
 * if an error occured return error message for the controller
 * @param addMode boolean indicate if to trigger update or add operation on database
 */
const addCourse = (course, addMode, req) => {

    return new Promise(async (resolve, reject) => {

        let toAdd = true;
        try {
            /**Get courses for the teacher: how pass the current course */
            const getTeacherCourses = queries.getAllCourses(course.teacher_id);
            let [teacherCourses] = await conn.promise().query(getTeacherCourses);

            if (teacherCourses.length === 0) {
                addMode ? await addCourseToDb(course) : await updateCourse(course);
                resolve(course);
                return;
            }

            if (!addMode) {
                //filter the course that beign updated
                teacherCourses = teacherCourses.filter(c => c.course_id !== course.course_id);
            }

            //for every course check if there an collsion in times for meetings
            teacherCourses.forEach(async (teacherCourse, teacherIndex) => {
                const start_date = new Date(teacherCourse.start_date);
                const end_date = new Date(teacherCourse.end_date);
                const new_start_date = new Date(course.start_date);
                const new_end_date = new Date(course.end_date);

                if ((start_date <= new_start_date && new_start_date < end_date) ||
                    (start_date < new_end_date && new_end_date <= end_date) ||
                    (new_start_date < start_date && new_end_date >= end_date)) {
                    //collsions in dates, check if there collsions in meetings time
                    //make another call to get course meetings
                    const courseMeetingsSQL = queries.getCourseMeetings(teacherCourse.course_id);
                    const [courseMeetings] = await conn.promise().query(courseMeetingsSQL);

                    //check collsions in meetings
                    courseMeetings.forEach(async (meeting, meetingIndex) => {

                        const newMeeting = course.course_meetings.find(meet => meet.day_id === meeting.day_id);
                        if (newMeeting) {
                            //found meeting at the same day check if the times collsion's 
                            const start_time = new Date(`2023-09-09 ${meeting.start_time}`);
                            // console.log(`constructor for end is ${start_time.getTime()} +  ${teacherCourse.meet_duration *60 *1000}`);
                            const end_time = new Date(start_time.getTime() + (teacherCourse.meet_duration * 60 * 60 * 1000));

                            const new_start_time = new Date(`2023-09-09 ${newMeeting.time}`);
                            const new_end_time = new Date(new_start_time.getTime() + course.meet_duration * 60 * 60 * 1000);

                            if ((new_start_time >= start_time && new_start_time < end_time) ||
                                (new_end_time > start_time && new_end_time <= end_time) ||
                                (new_start_time <= start_time && new_end_time >= end_time)) {
                                //return error message to indicate where collision found
                                toAdd = false;
                                reject(req.t('collisionMeeting', {
                                    course_name: teacherCourse.course_name,
                                    day: req.t(meeting.day),
                                    start_time: getTimeFromDate(start_time),
                                    end_time: getTimeFromDate(end_time)
                                }));
                            }
                        }

                        if (meetingIndex === courseMeetings.length - 1 && teacherIndex === teacherCourses.length - 1
                            && toAdd) {
                            //reach last course and no collisions found 
                            addMode ? await addCourseToDb(course) : await updateCourse(course);
                            resolve(course);
                            return;
                        }

                    });
                } else if (teacherIndex === teacherCourses.length - 1) {
                    //check if it last course in array if yes, then add the course, if 
                    //we reach this block this mean no collisions found for the new course
                    addMode ? await addCourseToDb(course) : await updateCourse(course);
                    resolve();
                }
            });


        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }

    });

}

/**
 * register new students to the course, for each student loop over and check for collisions, if found then don't register 
 * all students and return proper response
 * @param {*} req 
 */
const registerStudentsToCourse = (registerStudets, req) => (
    new Promise(async (resolve, reject) => {
        try {
            const getCourseSQL = queries.getCourse();
            const [result] = await conn.promise().query(getCourseSQL, [registerStudets.course_id]);
            const course = result[0];
            //course meetings
            const courseMeetingsSQL = queries.getCourseMeetings(course.course_id);
            const [courseMeetings] = await conn.promise().query(courseMeetingsSQL);
            course.course_meetings = courseMeetings;

            const new_start_date = new Date(formatTheDate(course.start_date));
            const new_end_date = new Date(formatTheDate(course.end_date));

            /**save all promises for students and await for them */
            const studentsArrayPromises = [];
            const errors = {};
            //now loop over the students, get the courses they are register for, and check for collisions if found
            //if no collision found then register all students.
            registerStudets.students.forEach(student_id => {
                studentsArrayPromises.push(checkStudentCollision(student_id, errors, new_start_date, new_end_date, course))
            });
            await Promise.all(studentsArrayPromises);
            if (Object.keys(errors).length > 0) {
                //collision found return error message, as array
                const errorArr = [];
                Object.keys(errors).forEach(key => errorArr.push(errors[key]));
                reject(errorArr);
            }
            //register all the students, start transaction for add
            conn.beginTransaction(async (err) => {
                if (err) {
                    reject(req.t('error'))
                }

                const registerStudentPromises = [];
                const registerStudentSql = queries.registerStudentToCourse();
                //save in the promises array all the promises to await for all later
                registerStudets.students.forEach(student_id => {
                    registerStudentPromises.push(new Promise(async (resolve, reject) => {
                        try {
                            await conn.promise().query(registerStudentSql, [student_id, course.course_id, false]);
                            resolve()
                        } catch (e) {
                            console.log(e);
                            reject(e)
                        }
                    })
                    )
                });

                try {
                    await Promise.all(registerStudentPromises);
                    conn.commit((err) => resolve());
                } catch (e) {
                    console.log(e);
                    conn.rollback((e) => reject(req.t('error')));
                }
            })

        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
);

/**fro each student check if can be added to the courses without collision with other courses */
const checkStudentCollision = (student_id, errors, new_start_date, new_end_date, course) => (
    new Promise(async (resolve, reject) => {
        try {
            /**Get courses for the student: how pass the current course */
            const geStudentCourses = queries.getAllCourses(null, student_id);
            let [studentCourses] = await conn.promise().query(geStudentCourses);
            const [student] = await conn.promise().query(queries.getStudent(student_id));

            /**save all student courses promises, to await for all of them */
            const studentCoursesPromises = [];
            /**for each course check for collision, first in dates */
            studentCourses.forEach((studentCourse => studentCoursesPromises.push(checkStudentCourseCollision(studentCourse, errors, student, new_start_date, new_end_date, course))));
            await Promise.all(studentCoursesPromises);
            resolve();
        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
)

/**For each course the student take check if there are collision in the course, 
 * if found then save the error in the errors object
 */
const checkStudentCourseCollision = (studentCourse, errors, student,
    new_start_date, new_end_date, course) => {
    return new Promise(async (resolve, reject) => {

        try {
            const start_date = new Date(formatTheDate(studentCourse.start_date));
            const end_date = new Date(formatTheDate(studentCourse.end_date));

            if ((start_date <= new_start_date && new_start_date < end_date) ||
                (start_date < new_end_date && new_end_date <= end_date) ||
                (new_start_date <= start_date && end_date <= new_end_date)) {
                //collision in dates found, check if collision in meetings exists

                const courseMeetingsSQL = queries.getCourseMeetings(studentCourse.course_id);
                const [courseMeetings] = await conn.promise().query(courseMeetingsSQL);

                courseMeetings.forEach((meeting, meetingIndex) => {

                    const newMeeting = course.course_meetings.find(meet => meet.day_id === meeting.day_id);
                    if (newMeeting) {
                        //found meeting at the same day check if the times collsion's 
                        const start_time = new Date(`2023-09-09 ${meeting.start_time}`);
                        const end_time = new Date(start_time.getTime() + (studentCourse.meet_duration * 60 * 60 * 1000));

                        const new_start_time = new Date(`2023-09-09 ${newMeeting.time}`);
                        const new_end_time = new Date(new_start_time.getTime() + course.meet_duration * 60 * 60 * 1000);

                        if ((new_start_time >= start_time && new_start_time < end_time) ||
                            (new_end_time > start_time && new_end_time <= end_time) ||
                            (new_start_time <= start_time && new_end_time >= end_time)) {

                            errors[student.id] = (req.t('studentCollision', {
                                firstname: student.firstname,
                                lastname: student.lastname,
                                course_name: studentCourse.course_name,
                            }));
                        }
                    }
                });
                resolve();
            } else {
                resolve();
            }
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
}

const getDayID = (day) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getDayByName(day);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

const getSubjectID = (subject) => {
    return new Promise((resolve, reject) => {
        const sql = queries.getSubjectID(subject);
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}

const getTeacherID = (name) => {
    arr_name = name.split(" ");
    firstname = arr_name[0];
    lastname = arr_name[1];
    return new Promise((resolve, reject) => {
        const sql = queries.getUserIdByName(firstname, lastname)
        conn.query(sql, (err, data) => {
            if (err) {
                reject(messages.ERR_SERVERR);
            } else {
                resolve(data);
            }
        })
    })
}



const deleteCourse = (CourseId) => {
    return new Promise((resolve, reject) => {

        const deleteCourse = queries.deleteCourse(CourseId);
        conn.query(deleteCourse, req.params.id, (err, data) => {
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


const addCourseToDb = (course) => {

    return new Promise(async (resolve, reject) => {

        conn.beginTransaction( async() => {

            try {
                //no collisions found, add the course with meetings, and create a homework unit
                const addCourseSQL = queries.addCourse();
                const [newCourseData] = await conn.promise().query(addCourseSQL, [course.course_name, course.start_date, course.end_date, course.lesson_num,
                course.subject_id, course.teacher_id, course.meet_duration, course.course_type]);

                const course_id = newCourseData.insertId;
                if (course.language_id) {
                    //insert a language course
                    const addLanguageCourse = queries.addLanguageCourse();
                    await conn.promise().query(addLanguageCourse, [course_id, course.language_id]);
                }

                //loop over all meetings and insert the meeting to the course_meetings
                const meetingsPromises = [];
                course.course_meetings.forEach(async meeting => {
                    const courseMeetingSql = queries.addCourseMeeting();
                    meetingsPromises.push(conn.promise().query(courseMeetingSql, [course_id, meeting.day_id, meeting.time]));
                });

                //first insert a lesson, to be home work's section
                const addHomeworkPromise = conn.promise().query(queries.addHomeworkLesson(), [course_id, 'homework', true]);

                await Promise.all(meetingsPromises);
                await addHomeworkPromise;

                //commit the cahnges
                conn.commit((err) => {
                    resolve();
                });
            } catch (e) {
                console.log(e);
               conn.rollback(() => reject());
            }
        });
    });

}

/**
 * update course data, and the meetings
 * @param {*} course object represent course details 
 * @returns 
 */
const updateCourse = (course) => (
    new Promise((resolve, reject) => {

        conn.beginTransaction( async(err) => {
            if(err){
                console.log(err);
                reject();
            }else{

                try {
                    const updateSQL = queries.updateCourse();
                    await conn.promise().query(updateSQL, [course.course_name, course.start_date, course.end_date, course.lesson_num, course.subject_id,
                    course.teacher_id, course.meet_duration, course.course_type, course.course_id]);
        
                    //after update the course, update it's meetings, the quick way to do this by delete all the meetings for the course then add
                    //the new ones
                    await conn.promise().query(queries.deleteCourseMeetings(course.course_id));
        
                    //now loop over course meetings and add them
                    const meetingsPromises = [];
                    course.course_meetings?.forEach(async (meeting, i) => {
                        const courseMeetingSql = queries.addCourseMeeting();
                         meetingsPromises.push( conn.promise().query(courseMeetingSql, [course.course_id, meeting.day_id, meeting.time]) );
                    });

                    //wait to add the new Meetings
                    await Promise.all(meetingsPromises);
                     //commit the cahnges
                     conn.commit((err) => {
                        resolve();
                    });
        
                } catch (e) {
                    console.log(e);
                    conn.rollback(() => reject('Error While Update The Course'));
                }

            }
        })
    })
);

/**
 * fetch all students who register to the course, and students not yet registered
 * , the result returns as object with 2 propreties, each 1 with enrolled, or notEnrolled students
 * @param {*} courseID 
 * @param {*} req 
 */
const getCourseStudents = (courseID, req) => (
    new Promise((resolve, reject) => {
        const getCourseStudentsSQL = queries.getCourseStudents();
        conn.query(getCourseStudentsSQL, [courseID, courseID], (error, data) => {
            if (error) {
                console.log(error);
                reject(req.t('error'));
            } else {
                //crete new object with 2 properties, enrolled and notEnrolled and divide the students to the right property
                const courseStudents = { enrolled: [], notEnrolled: [] };
                data.forEach(student => {
                    if (student.course_id)
                        courseStudents.enrolled.push(student);
                    else
                        courseStudents.notEnrolled.push(student);
                });
                resolve(courseStudents);
            }
        })
    })
);


module.exports = {
    getCourses,
    getCourse,
    addCourse,
    deleteCourse,
    getDayID, getSubjectID, getTeacherID,
    getCourseStudents,
    registerStudentsToCourse
}