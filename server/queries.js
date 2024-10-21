/**This Module To Write All Queries In On Place To Easy Access Queries When Needed */

const { formatDateAndTime } = require("./services/generalServices");


/**sign in user and get it's data back,
 * @param onlyUsername boolean indicate if to log user based in username + password,
 *  or only username (for cookie log)
 */
const logIn = (username, password, onlyUsername) => {
  let toReturn = `SELECT u.id, u.firstname, u.lastname, u.username, u.email, u.phone
           , u.birth_date, s.enrollment_date, t.hire_date, t.isManager, t.notify
            FROM users as u 
            left outer join Students s on u.id = s.id 
            left outer join Teacher t on u.id = t.id
            where username='${username}' `;

  if (!onlyUsername)
    toReturn += ` and password= '${password}'`;

  return toReturn;
}


const updateUser = () => {
  return `
    UPDATE users
    SET firstname=?, lastname=?, email=?, phone=?
    , birth_date=?
    WHERE id=?
    `;
}

/*user_id, user_firstname, user_lastname, username, email, password, phone, birth_date*/
const registerUser = (user) => {
  return `INSERT INTO users (id, firstname, lastname, username, email, phone, birth_date) 
    values (?, ?, ?, ?, ?, ?, ? )`;
}

const changeUserPassword = (userId, newPassword) => {
  return `UPDATE Users SET password = '${newPassword}' WHERE id = '${userId}'`;
};

const getUsers = () => {
  return `SELECT * 
            FROM users as u 
            left outer join Students s on u.user_id=s.user_id 
            left outer join Teacher t on u.user_id=t.user_id`;
}

/**get all users from the db except from the user who sent the request */
const getAllUsers = () => `
   SELECT u.id, concat(u.firstname, ' ', u.lastname) as fullname, s.class_id, t.hire_date
   FROM users as u 
   left outer join Students s on u.id=s.id 
   left outer join Teacher t on u.id=t.id
   where u.id<>?;
`

const getUser = (id) => {
  return `
    SELECT u.id, u.firstname, u.lastname, u.username, u.email, u.phone
    , u.birth_date, s.enrollment_date, t.hire_date
    FROM users as u 
    left outer join Students s on u.id = s.id 
    left outer join Teacher t on u.id = t.id
    WHERE u.id = '${id}';
     `
}

/**based on user email or username get user email */
const getUserEmail = () => `
  select email, verification_code, sent_time
  from Users
  where id=? or username=?
`

/**set new verification code for the user */
const addUserVerificationCode = () => `
 update Users set verification_code=?, sent_time=? where id=? or username=?
`
const setPassword = () =>
  `update Users set password=? where id=? or username=?`

const deleteUser = (id) => {
  return `DELETE FROM users
            WHERE id = '${id}' `
}

const getUserIdByName = (firstname, lastname) => {
  return `SELECT id
            From users
            WHERE firstname = '${firstname}' AND lastname = '${lastname}'`
}


/***********teachers related queries***********/

/**get all teachers, if id pass then return only the teacher with the id */
const getTeachers = (id) => {
  let sql = `
    SELECT u.*, t.* 
    FROM Teacher as t
    inner join users u on u.id=t.id
     `;

  if (id)
    sql += ` where t.id='${id}'`;

  return sql;
}

const getCourseTeachers = () => {
  return `
  select u.id, u.firstname, u.lastname
  from Teacher as t
  inner join users u on u.id=t.id
  `
}

const getTeacher = (user_id) => {
  return `SELECT * 
    FROM Users as u Innner outer join Teacher as t on u.user_id= t.user_id\
    WHERE u.user_id = '${user_id}' `;

}

const addTeacher = () => {
  return `INSERT INTO Teacher (id, hire_date, notify, isManager) values (?, ?, 0, ?) `;

}

const deleteTeacher = () => {
  return `DELETE FROM Teacher
            WHERE id = ? `
}

/**
 * Update Teacher by setting hire_date to the new hire_date
 * @param {*} teacher 
 * @returns 
 */
const updateTeacher = (teacher) => {
  return `
    UPDATE teacher
    SET hire_date='${teacher.hire_date}', isManager=${teacher.isManager}
    WHERE id='${teacher.id}'
    `;
}

const checkUsername = (username) => {
  return `
    select u.username
    from users as u
    where u.username='${username}';
    `;
}


//////////////////////////////////////////Student Related Queries//////////////////////////////////////////

//Get Studnets
const getStudents = () => {
  return `SELECT * 
            FROM Users as u Inner join Students as s on u.id = s.id`;
}
//Get student by its id
const getStudent = (user_id) => {
  return `  SELECT u.id, u.firstname, u.lastname, u.email 
            FROM Users as u 
            inner join Students s on u.id=s.id
            WHERE u.id='${user_id}' `;
}
//Add student
const addStudent = (user_id, enrollment_date,) => {
  return `INSERT INTO Students (id, enrollment_date, class_id, parent_name, parent_phone) values (?, ?, ?, ?, ?) `;
}
//Delete student
const deleteStudent = () => {
  return `DELETE FROM Students WHERE id = ? `
}

const updateStudent = () => {
  return `
    UPDATE Students
    SET class_id = ?,parent_name = ?
    , parent_phone=?
    WHERE id=?
    `;
}

const update_Student = (student) => {
  const parent_phone = student.parent_phone ? `'${student.parent_phone}'` : null;
  return `
    UPDATE Students
    SET class_id = ${student.class_id},parent_name = '${student.parent_name}'
    , parent_phone=${parent_phone}
    WHERE id='${student.id}'
    `;
}

const phoneUniqueStudent = (phone) => {
  return `
  select *
  from students as s
  inner join users u on u.id=s.id
  where u.phone='${phone}'
  `
}

//////////////////////////////////////////Course Related Queries//////////////////////////////////////////

/**Get all courses, if recieved teacher id then return all courses for the teacher,  * please don't pass 2 params, will result on error
 * @param teacher_id pass to recieve teacher courses
 * @param student_id pass to recieve students courses
*/
const getAllCourses = (teacher_id, student_id) => {
  let courses_query = `SELECT c.course_id, c.course_name, c.start_date, c.end_date, c.lesson_num, c.is_active,
   c.subject_id, cs.en, cs.ar, cs.he, c.receive_notification_teacher, c.meet_duration, c.course_type,
    u.id, u.firstname, u.lastname, l.language_id , l.language_name
            FROM Courses as c Inner Join teacher as t on c.teacher_id = t.id
            left  join lang_course lc on c.course_id=lc.course_id
            left  join language as l on lc.language_id=l.language_id
            Inner Join Course_Subject as cs on c.subject_id = cs.id
            Inner Join Users as u on u.id = t.id`;
  if (student_id) {
    courses_query += ` inner join Students_Courses sc on sc.course_id=c.course_id 
    where sc.student_id='${student_id}'`
  }
  else if (teacher_id)
    courses_query += ` where u.id='${teacher_id}' `;

  return courses_query;
};

/**Get all course meetings for a specifi course, day_id, day, meet_time */
const getCourseMeetings = (course_id) => (
  ` select cm.course_id, cm.day_id, dow.day, cm.start_time
    from course_meetings as cm 
    inner join day_of_week dow on dow.id=cm.day_id
    where course_id = ${course_id} `
)


//Get course by its id
const getCourse = () => {
  return `
  SELECT c.course_id, c.course_name, c.start_date, c.end_date, c.subject_id, c.teacher_id, c.meet_duration,
  c.course_type
  FROM Courses as c
  WHERE c.course_id = ?`;
}
//Get course by its teacher
const getCoursesForTeacher = (teacher_id) => {
  return `SELECT * FROM Courses WHERE teacher_id = '${teacher_id}'`;
}
//Add new Course
const addCourse = () => {
  return `INSERT INTO Courses (course_name, start_date, end_date, lesson_num, subject_id, teacher_id, meet_duration, course_type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
}

/**query to insert new language course
 * must past both: course_id, language_id
 */
const addLanguageCourse = () => (`
 insert into lang_course values (? ,?)
`)

/**
 * query to add new course meeting must pass in query exe 3 params, course_id, 
 * day_id {1 -> 7}, start time 'HH:mm'
 * @returns String
 */
const addCourseMeeting = () => (
  `insert into course_meetings values(?, ?, ?)  `
);

/**query to update course data, except receive_notification field */
const updateCourse = () => (
  `update courses set course_name=?, start_date=?, end_date=?, lesson_num=?, subject_id=?, 
  teacher_id=?, meet_duration=?, course_type=?
  where course_id=?`
)

//Delete Course
const deleteCourse = (course_id) => {
  return `DELETE FROM Courses WHERE course_id = ?`;
}

/**
 * delete all course meetings based on course id
 * @param {*} course_id 
 * @returns 
 */
const deleteCourseMeetings = (course_id) => (
  `delete from course_meetings where course_id=${course_id}`
);

/**get all stdents with course_id which indicate if the student enrolled for the course or yet.
 * the query union on the students witch enrolled for the course with the other that not yet.
 */
const getCourseStudents = () => (
  `
  select u.id, u.firstname, u.lastname, u.phone, s.class_id, sc.course_id
  from students_courses as sc
  inner join Students s on sc.student_id=s.id
  inner join users u on u.id=s.id
  where  sc.course_id=?
  union
  select u.id, u.firstname, u.lastname, u.phone, s.class_id, null as 'course_id'
  from students as s
  inner join users u on u.id=s.id
  where  not exists (
    select *
    from students_courses
    where course_id=? and student_id=s.id
  )
  `
);

/**
 * @returns sql query, to check if student register to a specific course
 */
const registeredStudent = () => (
  `
  select sc.student_id
  from Students_Courses as sc
  where sc.student_id=? and sc.course_id=?
  `
);

/**
 * 
 * @returns sql query that checked if the user has already rsubmit the homework,
 * must pass, student_id and hw_id
 */
const studentSubmitHomework = () => (
  `
  select *
  from submitHomeWork as shw
  where student_id=? and hw_id=?
  `
);

/**for student get all homeworks not yet submitted, for all courses the students is part of,
 * must pass => student_id
 */
const getNotSubmittedHomeworks = () => `
 select sc.student_id, sc.course_id, hwu.hw_title, hwu.unit_id,
 hwu.upload_time, hwu.submit_time
 from Students_Courses as sc
 inner join lessons l on sc.course_id=l.course_id and l.lesson_title='Homework'
 inner join studyunits su on l.lesson_id=su.lesson_id
 inner join homeworkunit hwu on hwu.unit_id=su.unit_id
 left join submithomework shw on hwu.unit_id=shw.hw_id and shw.student_id=sc.student_id
 where sc.student_id=? and shw.student_id is null
 order by hwu.upload_time desc
`

/**
 * 
 * @returns sql query to submit student homework,
 * must pass student_id, hw_id, upload_time
 */
const submitHomework = () => (
  `insert into submitHomeWork (student_id, hw_id, upload_time) values (?, ?, ?)`
);

/**
 * 
 * @returns sql query to add new file to the homework, must pass file_name, student_id, hw_id
 */
const addHomeworkFile = () => (
  `insert into homeWorkFile(file_name, student_id, hw_id) values (?, ?, ?)`
)

/**register new student to the course,
 * must pass 3 values, 
 * 1- student_id
 * 2- course_id
 * 3- recive notification
 */
const registerStudentToCourse = () => (
  `insert into Students_Courses values (?, ?, ?)`
)

//get course details by it id
//lesson_number column will contain values starting
//from 1 for each course's lessons
const getCourseDetails = (courseId) => {
  return `
    SELECT (@row_number:=@row_number + 1) AS lesson_number, Courses.*, Lessons.*
    FROM Courses
    JOIN Lessons ON Courses.course_id = Lessons.course_id
    CROSS JOIN (SELECT @row_number:=0) AS rn
    WHERE Courses.course_id = '${courseId}';
  `;
};


//Course Details 2
const courseDetails = (course_id) => {
  return `
    SELECT l.lesson_id, l.course_id, l.lesson_title, l.lesson_date, l.lesson_time
  , l.is_visible, l.visible_time, su.unit_id, su.note_id, n.note_text,
   f.file_id, f.file_name, f.file_path, hwu.is_visible as 'hw_visible', hwu.visible_time as 'hw_visible_time', hwu.files_num,
   hwu.hw_title, hwu.submit_time, hwu.upload_time
   FROM Lessons as l
   LEFT JOIN StudyUnits su ON l.lesson_id = su.lesson_id
   LEFT JOIN homeWorkUnit hwu on su.unit_id = hwu.unit_id
   LEFT JOIN StudyUnitNotes n ON su.note_id = n.note_id
   LEFT JOIN StudyUnitFiles sf ON su.unit_id = sf.unit_id
   LEFT JOIN StudyUnitFile f ON sf.file_id = f.file_id
   WHERE l.course_id = ${course_id} ;;
    `;
};


//////////////////////////////////////////day_of_week Related Queries//////////////////////////////////////////
//Get Course Subject By English Name
const getDayByName = (day) => {
  return `SELECT id FROM day_of_week WHERE day = '${day}'`;
}



//////////////////////////////////////////Course_Subject Related Queries//////////////////////////////////////////

//Get Course Subject By English Name
const getCourseSubjectByName = (subject) => {
  return `SELECT id FROM Course_Subject WHERE name_english = '${subject}'`;
}




//////////////////////////////////////////classes Related Queries//////////////////////////////////////////
//Get a class by its is
const getClass = (class_id) => {
  return `SELECT * FROM Classes WHERE class_id = ?`;
}
//Add a class by its id
const addClass = (class_date, class_time, duration, price, room_num, course_id) => {
  return `INSERT INTO Classes (class_date, class_time, duration, price, room_num, course_id) 
            VALUES (?, ?, ?, ?, ?, ?)`;
}
//Delete a class by its id
const deleteClass = (class_id) => {
  return `DELETE FROM Classes WHERE class_id = ?`;
}
/*const getClassesForTeacher = (teacher_id) => {
    return `SELECT *
            FROM Classes
            JOIN Courses ON Classes.course_id = Courses.course_id
            JOIN Teachers ON Courses.teacher_id = Teachers.user_id
            WHERE Teachers.user_id = '${teacher_id}'`;
  }*/

//////////////////////////////////////////Homework Related Queries//////////////////////////////////////////

//Get a homework by its id
const getHomework = (homework_id) => {
  return `SELECT * FROM Homework WHERE homework_id = '${homework_id}'`;
}
//Get all homework for a given course
const getHomeworkForCourse = (course_id) => {
  return `SELECT * FROM Homework WHERE course_id = '${course_id}'`;
}
//Add a new homework
const addHomework = (title, due_date, course_id) => {
  return `INSERT INTO Homework (title, due_date, course_id) VALUES (?, ?, ?)`;
}
//Delete a homework by its id
const deleteHomework = (homework_id) => {
  return `DELETE FROM Homework WHERE homework_id = '${homework_id}'`;
}


//////////////////////////////////////////Question Related Queries////////////////////////////////////////// 

/*Get a question by its id
const getQuestion = (question_id) => {
    return `SELECT * FROM Questions WHERE question_id = '${question_id}'`;
}
//Get all questions for a given course
const getQuestionsForCourse = (course_id) => {
    return `SELECT q.* FROM Questions q JOIN Courses c ON q.course_id = c.course_id WHERE c.course_id = '${course_id}'`;
}
//Add a new question
const addQuestion = (question_text, points, course_id) => {
    return `INSERT INTO Questions (question_text, points, course_id) VALUES (?, ?, ?)`;
}
//Delete a question by its id
const deleteQuestion = (question_id) => {
    return `DELETE FROM Questions WHERE question_id = '${question_id}'`;
}
//Add an answer to a question
const addAnswerToQuestion = (question_id, answer_text, is_right) => {
    return `INSERT INTO Answers (question_id, answer_text, is_right) VALUES (?, ?, ?)`;
}
//Remove an answer from a question:
const removeAnswerFromQuestion = (answer_id) => {
    return `DELETE FROM Answers WHERE answer_id = '${answer_id}'`;
}

///////////////////////////////////////////Answers Related Queries//////////////////////////////////////////  

//Get an answer by its id
const getAnswer = (answer_id) => {
    return `SELECT * FROM Answers WHERE answer_id = '${answer_id}'`;
}
//Get all answers for a given question
const getAnswersForQuestion = (question_id) => {
    return `SELECT * FROM Answers WHERE question_id = '${question_id}'`;
}
//Update an answer
const updateAnswer = (answer_id, answer_text, is_right) => {
    return `UPDATE Answers SET answer_text = ?, is_right = ? WHERE answer_id = '${answer_id}'`;
}
//Delete an answer by its id
const deleteAnswer = (answer_id) => {
    return `DELETE FROM Answers WHERE answer_id = '${answer_id}'`;
}*/

/**************************************Files Queries ************************************/

/**add new file, must pass file_name, uplaod_dat, manager_id, user_id */
const addFile = () => (
  `insert into files (name, upload_date, manager_id, user_id ) values (?, ?, ?, ?)`
);

const deleteFile = (fileid) => {
  return `DELETE FROM files WHERE id=${fileid}`;
}

const getFileName = (fileID) => {
  return `
    select f.name
    from files as f
    where id='${fileID}'
    `;
}

const getUserFiles = (userID) => {
  return `
    select *
    from files as f
    where user_id='${userID}'
    `
}

/****************************************Queries For Notes*********************** */

const getNotes = (userID) => {
  return `
    select *
    from notes as n
    where recipient_id='${userID}'
    order by n.created_at desc
        `;
}

//////////////////////////////////////////Notes Related Queries//////////////////////////////////////////

//Add a note
const addNote = (note_title, note_text, created_by, recipient_id) => {
  return `INSERT INTO Notes (note_title, note_text, created_at, created_by, recipient_id) 
            VALUES ('${note_title}', '${note_text}', curdate(), '${created_by}', '${recipient_id}')`;
}

//Get all notes
const getAllNotes = () => {
  return "SELECT * FROM Notes";
}

//Get a note by its id
const getNote = (note_id) => {
  return `SELECT * FROM Notes WHERE note_id = ${note_id}`;
}

//Update note
const updateNote = (note_id, note_title, note_text) => {
  return `UPDATE Notes SET note_title = '${note_title}', note_text = '${note_text}' WHERE note_id = ${note_id}`;
}

//Delete a note 
const deleteNote = (note_id) => {
  return `DELETE FROM Notes WHERE note_id = ${note_id}`;
}

//////////////////////////////////////////Lessons Related Queries//////////////////////////////////////////
//get all lessons
const getAllLessons = () => {
  return `SELECT * FROM Lessons`;
};
//get a lesson by its id
const getLesson = (lessonId) => {
  return `SELECT * FROM Lessons WHERE lesson_id = '${lessonId}'`;
};
//Get lessons for a specific course
const getLessonsByCourse = (courseId) => {
  return `SELECT * FROM Lessons WHERE course_id = '${courseId}'`;
};


/**add new lesson to the course as homework section, 
 * must in query exe pass: course_id, lesson_title, is_visible
 */
const addHomeworkLesson = () => (
  `insert into lessons (course_id, lesson_title, is_visible) values (? , ?, ?)`
);

/**add new lesson to the course as homework section, 
 * must in query exe pass: course_id, lesson_title, is_visible, visible time if needed
 */
const addLesson = () => (
  `insert into lessons (course_id, lesson_title, is_visible, visible_time) values (? , ?, ?, ?)`
);

/**update lesson, must pass lesson_title, is_visible, visible_time, lesson_id  */
const updateLesson = (lessonId, lessonTitle, lessonDate, lessonTime) => {
  return `UPDATE lessons 
            SET lesson_title =?, is_visible = ?, visible_time = ?
            WHERE lesson_id =? `;
};

//delete a lesson
const deleteLesson = () => {
  return `DELETE FROM Lessons WHERE lesson_id=?`;
}

/**get units id for a specific lesson */
const getLessonUnits = () => `
  select su.unit_id
  from StudyUnits as su
  where su.lesson_id=?  
`

/*******************************************Units Queries************************ */

const addStudyUnit = () => (
  `insert into studyunits (lesson_id, note_id) values(?,?)`
);

/**
 * sql query to uplaod a new unit file
 * must pass 3 values in order: upload_date, user_upload (id of user uploaded the file), file_name
 */
const addStudyUnitFile = () => (
  `insert into StudyUnitFile (upload_date, user_upload, file_name) values (?, ?, ?)`
);

/**
 * for each unit insert the files are part of the unit
 * must pass 2 params 1. file_id || 2. unit_id
 */
const addStudyUnitFiles = () => (
  `insert into StudyUnitFiles values (?, ?)`
)

/**
 * get all unit data based on unit id, if the unit is also homework unit then also return the homework unit data
 * @param {*} unit_id 
 */
const getStudyUnit = (unit_id) => (
  `
  select su.unit_id, su.lesson_id, su.note_id,
  hwu.hw_title, hwu.submit_time, hwu.upload_time, sun.note_text
  from StudyUnits as su
  left join StudyUnitNotes sun on su.note_id=sun.note_id
  left join homeWorkUnit hwu on su.unit_id=hwu.unit_id
  where su.unit_id=${unit_id}
  `
);

/**get files id and name for study unit files */
const getStudyUnitFiles = () => `
 select sufs.file_id, suf.file_name
 from StudyUnitFiles as sufs
 inner join StudyUnitFile suf on sufs.file_id=suf.file_id
 where sufs.unit_id=?
`

/**get unit file name, by query file id */
const getUnitFileName = (file_id) => (
  `select suf.file_name
  from StudyUnitFile as suf
  where suf.file_id=${file_id}`
);


/**get homework file name by file_id */
const getHomeworkFileName = () => (
  `select hwf.file_name, hwf.student_id
   from homeWorkFile as hwf
   where hwf.file_id=?`
);

/**for a given homework id, get all files submitted by all the students */
const getHomeworkFiles = () =>
  `
  select hwf.file_id, hwf.file_name, u.id, u.username
  from homeWorkFile as hwf
  inner join Users u on hwf.student_id=u.id
  where hwf.hw_id=?
`

/**query to give feedback on specific homework, should pass grade, submit_note, student_id, hw_id */
const giveFeedbackForHomework = () => (
  `update submitHomeWork set grade=?, submit_note=? where student_id=? and hw_id=?`
)


/**query to get all files id the student submit for a specific homework */
const getStudentSubmittedFiles = () => (
  `
  select hwf.file_id, hwf.file_name
  from homeWorkFile as hwf
  where student_id=? and hw_id=?
  `
);

const deleteStudyUnit = () => `delete from StudyUnits where unit_id=?`

/**
 * delete for which unit the file is associated
 * @param {*} file_id 
 */
const deleteStudyUnitFiles = (file_id) => (
  `delete from StudyUnitFiles where file_id=${file_id}`
);

/**
 * sql to delete a file data from the studyUnitFile
 * @param {*} file_id 
 */
const deleteStudyUnitFile = (file_id) => (
  `delete from StudyUnitFile where file_id=${file_id}`
);

/**
 * 
 * @param {*} file_id 
 * @returns query to delete a file from the submittion made by the student
 */
const deleteHomeworkFile = (file_id) => (
  `delete from homeWorkFile where file_id=${file_id}`
);

/**query to delete all files the student submit for the homework, must pass hw_id, student_id */
const deleteHomeworkSubmittedFiles = () => `delete from homeWorkFile where hw_id=? and student_id=?`

/**query to delete homwork submit data for a specific student. must pass hw_id, student_id */
const deleteHomeworkSubmit = () => `delete from submitHomeWork where hw_id=? and student_id=?`

/*************************************Units notes quries******************** */

const addStudyUnitNote = () => (
  `insert into StudyUnitNotes (note_text) values (?)`
);

/**
 * update exists note, by set new note_text,
 * must pass -> new note_text, note_id
 *  */
const updateStudyUnitNote = () => (
  `update StudyUnitNotes set note_text=? where note_id=?`
);

/**sql query to delete a study unit note */
const deleteStudyUnitNote = () => `delete from StudyUnitNotes where note_id=?`

const addHomeworkUnit = () => (
  `insert into homeWorkUnit(unit_id, hw_title, submit_time, upload_time, is_visible ) values (?, ?, ?, ?, true)`
);

/**
 * update homework unit, must pass -> hw_title, submit_time, unit_id
 */
const updateHomeworkUnit = () => (
  `update homeWorkUnit set hw_title=?, submit_time=? where unit_id=?`
);


//////////////////////////////////////////StudyUnits Related Queries//////////////////////////////////////////
//get all study units
const getAllStudyUnits = () => {
  return `SELECT * FROM StudyUnit`;
};

//get Study Units By Course
const getStudyUnitsByCourse = (course_id) => {
  return `SELECT * FROM StudyUnit WHERE course_id = '${coursei_d}'`;
};
// //delete study unit
// const deleteStudyUnit = (unitId) => {
//   return `
//       DELETE FROM StudyUnits
//       WHERE unit_id = ${unitId}
//     `;
// }
//updating study unit
const updateStudyUnit = (unitId, isVisible, lessonId) => {
  return `
      UPDATE StudyUnits
      SET is_visible = ${isVisible ? 1 : 0}, lesson_id = ${lessonId}
      WHERE unit_id = ${unitId}
    `;
}

const getNotesForStudyUnit = (unitId) => {
  return `
      SELECT n.*
      FROM Notes n
      JOIN StudyUnitNotes sun ON n.note_id = sun.note_id
      WHERE sun.unit_id = ${unitId}
    `;
}

const addStudyFile = (file_id, upload_date, user_upload, file_name, file_path) => {
  return `
      INSERT INTO StudyUnitFile (file_id, upload_date, user_upload ,file_name,file_path)
      VALUES (${file_id}, ${upload_date},${user_upload},${file_name},${file_path})
    `;
}
const addStudyFiles = (file_id, unit_id) => {
  return `
      INSERT INTO StudyUnitFiles (file_id, unit_id)
      VALUES (${file_id}, ${unit_id})
    `;
}



////////////////////////////////Enrollment student to course Related Queries/////////////////////////////////

//get number of students in each course
const getEnrollmentCounts = () => {
  return `
    SELECT c.course_id, c.course_name, COUNT(*) AS enrollment_count
    FROM courses AS c
    INNER JOIN students AS s ON c.course_id = s.course_id
    GROUP BY c.course_id, c.course_name
    `;
}
///////////////////////////////WORDS Related Queries//////////////////////////////////////////
const getAllWords = () => {
  return `SELECT * FROM Words`;
};
const getWord = (word_id) => {
  return `SELECT * FROM Words WHERE word_id = ${word_id}`;
};

const insertWord = (word_text, level_id, language_id, meaning_id) => {
  return `
      INSERT INTO Words (word_text, level_id, language_id, meaning_id)
      VALUES ('${word_text}', ${level_id}, ${language_id}, ${meaning_id})
    `;
};
const updateWord = (word_id, word_text, level_id, language_id, meaning_id) => {
  return `
      UPDATE Words
      SET word_text = '${word_text}',
          level_id = ${level_id},
          language_id = ${language_id},
          meaning_id = ${meaning_id}
      WHERE word_id = ${word_id}
    `;
};
const deleteWord = (word_id) => {
  return `
      DELETE FROM Words
      WHERE word_id = ${word_id}
    `;
};


///////////////////////////////MEANINGS Related Queries//////////////////////////////////////////
const getAllMeanings = () => {
  return `SELECT * FROM Meanings`;
};
const getMeaning = (meaning_id) => {
  return `SELECT * FROM Meanings WHERE meaning_id = ${meaning_id}`;
};
const insertMeaning = (meaning_text) => {
  return `
      INSERT INTO Meanings (meaning_text)
      VALUES ('${meaning_text}')
    `;
};
const updateMeaning = (meaning_id, meaning_text) => {
  return `
      UPDATE Meanings
      SET meaning_text = '${meaning_text}'
      WHERE meaning_id = ${meaning_id}
    `;
};
const deleteMeaning = (meaning_id) => {
  return `
      DELETE FROM Meanings
      WHERE meaning_id = ${meaning_id}
    `;
};


///////////////////////////////PICTURES Related Queries//////////////////////////////////////////
const insertPicture = (picture_data, word_id) => {
  return `
      INSERT INTO Pictures (picture_data, word_id)
      VALUES (${picture_data}, ${word_id})
    `;
};
const getPicture = (picture_id) => {
  return `SELECT * FROM Pictures WHERE picture_id = ${picture_id}`;
};
const updatePictureData = (picture_id, picture_data) => {
  return `
      UPDATE Pictures
      SET picture_data = ${picture_data}
      WHERE picture_id = ${picture_id}
    `;
};
const deletePicture = (picture_id) => {
  return `
      DELETE FROM Pictures
      WHERE picture_id = ${picture_id}
    `;
};


///////////////////////////////SENTENCES Related Queries//////////////////////////////////////////
const getAllSentences = () => {
  return `SELECT * FROM Sentences`;
};
const getSentence = (sentence_id) => {
  return `SELECT * FROM Sentences WHERE sentence_id = ${sentence_id}`;
};
const insertSentence = (sentence_text, level_id, language_id) => {
  return `
      INSERT INTO Sentences (sentence_text, level_id, language_id)
      VALUES ('${sentence_text}', ${level_id}, ${language_id})
    `;
};
const updateSentence = (sentence_id, sentence_text, level_id, language_id) => {
  return `
      UPDATE Sentences
      SET sentence_text = '${sentence_text}',
          level_id = ${level_id},
          language_id = ${language_id}
      WHERE sentence_id = ${sentence_id}
    `;
};
const deleteSentence = (sentence_id) => {
  return `
      DELETE FROM Sentences
      WHERE sentence_id = ${sentence_id}
    `;
};

///////////////////////////////SentenceWord Related Queries//////////////////////////////////////////

const insertSentenceWord = (sentence_id, word_id) => {
  return `
      INSERT INTO SentenceWords (sentence_id, word_id)
      VALUES (${sentence_id}, ${word_id})
    `;
};
const deleteSentenceWord = (sentence_id, word_id) => {
  return `
      DELETE FROM SentenceWords
      WHERE sentence_id = ${sentence_id} AND word_id = ${word_id}
    `;
};

const getSentenceWord = (sentence_id) => {
  return `
      Select word_id
      From SentenceWords
      Where sentence_id = ?
  `;
}

///////////////////////////////SentenceStudent Related Queries//////////////////////////////////////////

const getPrevStudentAnswer = (sentence_id, student_id) => {
  return `
      Select know
      From StudentSentences
      Where sentence_id = ? AND id = ?
  `
}

const updateStudentAnswer = (knows, sentence_id) => {
  return `
      Update StudentSentences
      Set know = ?
      Where sentence_id = ?
  `
}


///////////////////////////////WordSynonyms Related Queries//////////////////////////////////////////
const addWordSynonym = (word_id, synonym_id) => {
  return `
      INSERT INTO WordSynonyms (word_id, synonym_id)
      VALUES (${word_id}, ${synonym_id})
    `;
};

const getAllWordSynonyms = () => {
  return `SELECT * FROM WordSynonyms`;
};
const getWordSynonymsByWord = (word_id) => {
  return `SELECT * FROM WordSynonyms WHERE word_id = '${word_id}'`;
};
const deleteWordSynonym = (word_id, synonym_id) => {
  return `
      DELETE FROM WordSynonyms
      WHERE word_id = ${word_id} AND synonym_id = ${synonym_id}
    `;
};
///////////////////////////////Grades Related Queries//////////////////////////////////////////
//שכבה שאילתלות לטבלה GRADE
const insertGrade = (grade_id, grade_name) => {
  return `
    INSERT INTO Grades (grade_id, grade_name)
    VALUES (${grade_id}, '${grade_name}')
  `;
};
const deleteGrade = (grade_id) => {
  return `
    DELETE FROM Grades
    WHERE grade_id = ${grade_id}
  `;
};

///////////////////////////////Students grades Related Queries//////////////////////////////////////////
// Assign a grade to a student for a specific homework
const assignGradeToStudent = (studentId, homeworkId, grade) => {
  return `INSERT INTO Homework (student_id, homework_id, grade) VALUES ('${studentId}', '${homeworkId}', '${grade}')`;
};

// Update a student's grade for a specific homework
const updateStudentGrade = (studentId, homeworkId, newGrade) => {
  return `UPDATE Homework SET grade = '${newGrade}' WHERE student_id = '${studentId}' AND homework_id = '${homeworkId}'`;
};

///////////////////////////////////More queries////////////////////////////////////
//Send a note to a user
const sendNote = (senderId, recipientId, note_title) => {
  return `INSERT INTO Notes (sender_id, recipient_id, note_title) VALUES ('${senderId}', '${recipientId}', '${note_title}')`;
};

//Retrieve note for a user
const getUserNote = (userId) => {
  return `SELECT * FROM Notes WHERE recipient_id = '${userId}'`;
};
//username availabilty
const checkUsernameAvailability = (username) => {
  return `SELECT * FROM Users WHERE username = '${username}'`;
};
//email availbilty
const checkEmailAvailability = (email) => {
  return `SELECT * FROM Users WHERE email = '${email}'`;
};
//Get homework Upcoming Deadlines
const getUpcomingDeadlines = () => {
  return `SELECT * FROM homework WHERE due_date > NOW() ORDER BY due_date ASC`;
}
//Get teachers list with the number of courses they are teaching
const getTeacherCourseCounts = () => {
  return `
    SELECT t.teacher_id, t.teacher_name, COUNT(*) AS course_count
    FROM teachers AS t
    INNER JOIN courses AS c ON t.teacher_id = c.teacher_id
    GROUP BY t.teacher_id, t.teacher_name
    `;
}
//proccess payment
const processPayment = (paymentDetails) => {
  //
};
// all questions and their answers for a specific homework
const getQuestionsAndAnswersForHomework = (homeworkId) => {
  return `SELECT q.*, a.*
            FROM Questions AS q
            INNER JOIN Homeworks_Questions AS hq ON q.question_id = hq.question_id
            LEFT JOIN Answers AS a ON q.question_id = a.question_id
            WHERE hq.homework_id = '${homeworkId}'`;
};

/************************************homework quireies******************* */
/**
 * Query to return the submitted solutions from the students for a given homework, for a specific course
 * @param {*} hw_id 
 * @param {*} course_id 
 * @param student_id return submit files and feedback only for the students with the given id
 * @returns 
 */
const getSubmitedHomework = (hw_id, course_id, student_id) => {
  let toReturn =
    `
   select shw.student_id, shw.hw_id, shw.upload_time, shw.grade, shw.submit_note, u.firstname, u.lastname,
   u.username ,hwf.file_id, hwf.file_name
   from submithomework as shw
   inner join users u on u.id=shw.student_id
   inner join homeworkfile hwf on hwf.hw_id=shw.hw_id and hwf.student_id=shw.student_id
   where shw.hw_id=${hw_id}`;

  if (student_id)
    toReturn += ` and shw.student_id='${student_id}'`

  return toReturn;
}

const getSentenceCompletion = (student_id, lang, amount) => {
  return `
select * 
from (
 select s.sentence_id, s.sentence_text, w.word_id, w.word_text
from studentLevel as sl
inner join Language l on l.language_id=sl.language_id
inner join sentences as s on s.level_num=sl.level_num and s.language_id=sl.language_id
inner join SentenceWords sw on sw.sentence_id=s.sentence_id
inner join words as w on w.word_id=sw.word_id
where sl.student_id='${student_id}' and language_name='${lang}'
 and sw.sentence_id not in (
 select ss.sentence_id
 from StudentSentences ss
 where ss.sentence_id=s.sentence_id and ss.know=true and id=sl.student_id
 )    and  sw.word_id in (
						select min(sw2.word_id)
						from SentenceWords as sw2
						where sw2.sentence_id=sw.sentence_id)
  UNION
select s.sentence_id, s.sentence_text, w.word_id, w.word_text
from studentLevel as sl
inner join Language l on l.language_id=sl.language_id
inner join sentences as s on s.level_num=sl.level_num and s.language_id=sl.language_id
inner join words as w on w.level_num=sl.level_num and w.language_id=sl.language_id
where sl.student_id='${student_id}' and language_name='${lang}'
 and s.sentence_id not in (
 select ss.sentence_id
 from StudentSentences ss
 where ss.sentence_id=s.sentence_id and ss.know=true and id=sl.student_id
 )    and  w.word_id not in (
						select sw2.word_id
						from SentenceWords as sw2
						where sw2.sentence_id=s.sentence_id)
       and w.word_id in (
        select wrongWords.word_id
        from (select w2.word_id
        from words as w2
        left join SentenceWords sw3 on  w2.word_id=sw3.word_id 
        where  sw3.sentence_id is null or sw3.sentence_id <> s.sentence_id
        limit 3) as wrongWords
       )) as questions
       order by questions.sentence_id
       limit ${4 * amount};   
  `;
}


const getFlashCards = (student_id, lang, amount) => {
  return `SELECT DISTINCT w1.word_id, w1.word_text, w2.word_id as synonym_id , w2.word_text as synonym_text
  FROM studentLevel AS sl
  INNER JOIN Language l ON l.language_id = sl.language_id
  INNER JOIN Words AS w1 ON w1.level_num = sl.level_num AND w1.language_id = sl.language_id
  LEFT JOIN StudentWords AS sw ON w1.word_id = sw.word_id
  LEFT JOIN WordSynonyms AS ws ON ws.word_id = w1.word_id OR ws.synonym_id = w1.word_id
  LEFT JOIN Words AS w2 ON w2.word_id = ws.synonym_id OR w2.word_id = ws.word_id
  WHERE sl.student_id = '${student_id}' AND l.language_name = '${lang}' AND (sw.know = FALSE or sw.know is null ) and w1.word_id != w2.word_id
  LIMIT ${amount};
  `
}

const getFlashCardsTemp = (student_id, lang, amount) => {
  return `
          SELECT w1.word_id, w1.word_text, s.synonym_id, s.synonym_text
          FROM studentLevel AS sl
          INNER JOIN Language AS l ON l.language_id = sl.language_id
          INNER JOIN Words AS w1 ON w1.level_num = sl.level_num AND w1.language_id = sl.language_id
          INNER JOIN StudentWords AS sw ON w1.word_id = sw.word_id
          LEFT JOIN WordSynonyms AS ws ON ws.word_id = w1.word_id OR ws.synonym_id = w1.word_id
          LEFT JOIN Words AS w2 ON w2.word_id = ws.synonym_id OR w2.word_id = ws.word_id
          LEFT JOIN Synonyms AS s ON s.synonym_id = w2.word_id
          WHERE sl.student_id = '${student_id}' AND l.language_name = '${lang}' AND sw.knows = FALSE
          LIMIT ${amount};
  `
}

/********************Quries For Shift********************** */

const getTeacherCurrentShift = (teacher_id) => {
  return `
  select s.teacher_id, s.start_shift, ST_X(s.start_location) as start_latitude, ST_Y(s.start_location) as start_longitude, s.shift_note,
  t.notify
  from shift as s
  inner join Teacher t on s.teacher_id=t.id
  where s.teacher_id='${teacher_id}' and end_shift is null
  `;
}

/**return all the shifts
 * @param end_shift to which time get the shifts, if not passed return util today
 * @param teacher_id for teacher get only teacher shifts
 */
const getShifts = (start_shift, end_shift, teacher_id) => {
  let sql = `select s.teacher_id, s.start_shift, s.end_shift, ST_X(s.start_location) as start_latitude, ST_Y(s.start_location) as start_longitude,
  ST_X(s.end_location) as end_latitude, ST_Y(s.end_location) as end_longitude ,s.shift_note,
  u.firstname, u.lastname
   from shift as s
   inner join users u on u.id=s.teacher_id
   where start_shift >= '${start_shift}'`

  if (end_shift)
    sql += ` and (end_shift<= '${end_shift}' or end_shift is null)`;
  if (teacher_id)
    sql += ` and teacher_id='${teacher_id}'`;

  return sql;
};

/**based on teacher/ teachers id's get shifts orderd by start_time desc, for a specific time range */
const getShiftsBasedOnId = () => `
 select u.id, u.firstname, u.lastname, s.start_shift, s.end_shift, s.shift_note
 from shift as s
 inner join users u on s.teacher_id=u.id
 where s.teacher_id in(?) and (s.start_shift>=? and  s.start_shift <=?)
 order by s.teacher_id asc, s.start_shift desc;
`
/**get teacher notify value */
const getTeacherNotify = () => `select t.notify from Teacher as t where t.id=?`

/**return query to get current shifts
 * for manager get the current teachers in the shifts
 * for teacher get the last 10 shifts data
 */
const getCurrentShifts = (teacher_id) => {
  let toReturn = `
  select s.teacher_id, s.start_shift, s.end_shift,
  u.firstname, u.lastname
  from shift as s
  inner join users u on u.id=s.teacher_id
`
  if (teacher_id)
    toReturn += `
   where s.teacher_id='${teacher_id}'
  `
  else
    toReturn += `
    where s.end_shift is null
   `

  toReturn += `
   order by s.start_shift desc
   limit 10
   `

  return toReturn;
}

/**sql query to get teachers hours over the current year
 * @param teacher_id pass to get shifts for the current teacher for specific year
 */
const getTeacherYearHours = (teacher_id) => {
  let toReturnSQL = `
  select s.teacher_id, s.start_shift, s.end_shift, concat(u.firstname, ' ', u.lastname) as fullname
  from teacher as t
  inner join users u on u.id=t.id
  left  join shift s on t.id=s.teacher_id
  where YEAR(s.start_shift)=?
  `;

  if (teacher_id)
    toReturnSQL += ` and t.id=?`

  return toReturnSQL;
}

/**for current year and month get all teachers shifts */
const getTeachersShiftsCurrentMonth = () => `
select s.teacher_id, s.start_shift, s.end_shift, concat(u.firstname, ' ', u.lastname) as fullname
from teacher as t
inner join users u on u.id=t.id
left  join shift s on t.id=s.teacher_id
where YEAR(s.start_shift)=? and MONTH(s.start_shift)=?
`

const start_shift = (teacher_id, start_shift, start_latitude, start_longitude) => {
  return `
  insert into  shift (teacher_id, start_shift, start_location) values 
  ('${teacher_id}', '${start_shift}', ST_GeomFromText('POINT(${start_latitude} ${start_longitude})'));
  `;
}

const end_shift = (teacher_id, start_shift, end_shift, end_latitude, end_longitude) => {
  return `
  update shift set end_shift='${end_shift}', end_location=ST_GeomFromText('POINT(${end_latitude} ${end_longitude})')
  where teacher_id='${teacher_id}' and end_shift is null;
  `;
}

/**query to add note to the current shift, must pass in order: shift_note, teacher_id,  start_shift*/
const addShiftNote = () => (
  `update shift set shift_note=? where teacher_id=? and start_shift=?`
);

/**update a exists shift time, end and start, must pass
 * start_shift, end_shift, teacher_id, start_shift
 */
const updateShift = () => (
  `update shift set start_shift=?, end_shift=? where teacher_id=? and start_shift=?`
)

/**delete teacher based on teacher_id and  start_shift*/
const deleteShift = () => `delete from shift where teacher_id=? and start_shift=?`



/*************************************Quiries for subjects************************** */

const getAllSubjects = () => {
  return `
  select *
  from course_subject;
  `
}

const addSubject = () => {
  return `
  insert into course_subject (en, ar, he) values (?, ?, ?);
  `
}

const updateSubject = () => {
  return `
  update  course_subject set en=?, ar=?, he=? 
  where id=?
  `
}


/********************************Queries for messages********************** */

/**return the messages for user, messages sent or must recieve
 * @param limited boolean, if true then return limited number of results, first 10 messages
 */
const getMessages = (limited) => {
  let toReturn = `
  select *
  from (
  select m.*, u.firstname, u.lastname
  from message as m
  inner join users u on m.manager_id=u.id
  where m.manager_id=?
  Union
  select m.*, u.firstname, u.lastname
  from message as m
  inner join message_user mu on m.message_id=mu.message_id
  inner join users u on m.manager_id=u.id
  where  mu.user_id=?
  ) as lastMessages
  order by lastMessages.sent_time desc
  `

  if (limited)
    toReturn += ' limit 10';

  return toReturn;
}


/**get all id's of users should receive the message, based on message_id */
const getMessageUsers = () => `
  select mu.user_id
  from message_user as mu
  where mu.message_id=?
`

/**get a message based on message id */
const getMessageById = () => `
  select *
  from message
  where message_id=?
`

/**add new message to the db */
const addMessage = () => `
  insert into message(message_title, message_content, sent_time, manager_id) values (?, ?, ?, ?)
`

/**add a user to recieve the message */
const sentMessageToUser = () => `
  insert into message_user(message_id, user_id) values (?, ?)
`

const updateMessage = () => `
 update message set message_title=?, message_content=? where message_id=?
`

const deleteMessage = () => `
  delete from message where message_id=? 
`





module.exports = {
  logIn,
  getUsers, getUser, deleteUser, updateUser, registerUser, getUserIdByName, getAllUsers, getUserEmail, addUserVerificationCode,
  getTeachers, getCourseTeachers, getTeacher, addTeacher, deleteTeacher, setPassword,
  getStudents, getStudent, addStudent, deleteStudent, updateStudent, phoneUniqueStudent,
  getCourse, getAllCourses, getAllCourses, getCoursesForTeacher, addCourse, deleteCourse, getCoursesForTeacher, addLanguageCourse,
  addCourseMeeting, addHomeworkLesson, addLesson, updateCourse, deleteCourseMeetings,
  getClass, addClass, deleteClass,
  getHomework, getHomeworkForCourse, addHomework, deleteHomework, getCourseStudents, registeredStudent, studentSubmitHomework, registerStudentToCourse,
  checkUsername, getUnitFileName, getHomeworkFileName, getHomeworkFiles, giveFeedbackForHomework, deleteStudyUnitFile, deleteStudyUnitFiles, deleteHomeworkFile,
  updateTeacher, submitHomework, addHomeworkFile, getStudentSubmittedFiles, getNotSubmittedHomeworks,
  addFile, getFileName, getUserFiles, deleteFile,
  getNotes, deleteHomeworkSubmittedFiles, deleteHomeworkSubmit,
  addNote, getAllNotes, getNote, updateNote, deleteNote,
  deleteLesson, getLesson, getAllLessons,
  getCourseDetails, getCourseMeetings, getLessonUnits,
  addStudyUnit, getStudyUnit, getAllStudyUnits, deleteStudyUnit, updateStudyUnit, addStudyUnitNote, getStudyUnitFiles,
  getCourseSubjectByName, addHomeworkUnit, updateHomeworkUnit, addStudyUnitFile, addStudyUnitFiles, updateStudyUnitNote,
  getDayByName,
  getAllLessons, getLesson, deleteLesson, updateLesson,
  getNotesForStudyUnit, deleteStudyUnitNote,
  courseDetails,
  addStudyFiles, addStudyFile,
  getWord, getAllWords, deleteWord, insertWord, updateWord,
  getSentence, getAllSentences, insertSentence, deleteSentence, updateSentence,
  getPicture, deletePicture, insertPicture, updatePictureData,
  addWordSynonym, getWordSynonymsByWord, deleteWordSynonym, addWordSynonym,
  deleteSentenceWord, insertSentenceWord, deleteGrade, insertGrade,
  getSubmitedHomework, getSentenceCompletion,
  getSentenceWord, getPrevStudentAnswer, updateStudentAnswer,
  getFlashCards,
  getTeacherCurrentShift, start_shift, end_shift, addShiftNote, getShifts, getShiftsBasedOnId, getTeacherNotify,
  updateShift, getCurrentShifts, getTeachersShiftsCurrentMonth, deleteShift,
  getAllSubjects, addSubject, updateSubject, getTeacherYearHours,
  addMessage, updateMessage, sentMessageToUser, deleteMessage, getMessageById, getMessages, getMessageUsers
}
