const coursesServices = require('../services/coursesServices');
const messages = require('../messages');

const getCourses = (req, res, student_id) => {
    coursesServices.getCourses(req, student_id)
        .then(courses => {
            res.status(200).send(JSON.stringify(courses));
        })
        .catch(err => {
            res.status(500).send(JSON.stringify( {error: err} ))
        })
}

const getCourse = (req, res, courseID) => {
    coursesServices.getCourses(courseID)
        .then(courses => {
            res.status(200).send(JSON.stringify(courses));
        })
        .catch(err => res.status(500).send(err))
}

/**get req, res , course data, make call to services if add success then return success message,
 * or error
 */
const addCourse = (req, res, course) => {
    coursesServices.addCourse(course, true, req)
        .then(success => res.status(201).send())
        .catch(err => {
            if (err === req.t('error'))
                res.status(500).send(JSON.stringify({ error: err }));
            else
                res.status(400).send(JSON.stringify({ error: err }));
        })
}

const updateCourse = (req, res, course) => {
    coursesServices.addCourse(course, false, req)
        .then(success => res.status(200).send())
        .catch(err => {
            if (err === req.t('error'))
                res.status(500).send(JSON.stringify({ error: err }));
            else
                res.status(400).send(JSON.stringify({ error: err }));
        })
}

const deleteCourse = (req, res, id) => {
    coursesServices.deleteCourse(id)
        .then(response => res.status(204).send())
        .catch(err => {
            if (err === messages.NOT_FOUND)
                res.status(404).send();
            else
                res.status(500).send();
        })
}

const getCourseStudents = (req, res, course_id) => {
    coursesServices.getCourseStudents(course_id, req)
    .then(courseStudents => res.status(200).send( JSON.stringify(courseStudents) ))
    .catch(error => res.status(500).send(error));
}

/**register new students to the course,
 * if found collisions then return 400 status,
 * error occured on server 500,
 * if sucess return 201, with empty body
 */
const registerStudentsToCourse = (req, res, registerStudents) => {
    coursesServices.registerStudentsToCourse(registerStudents, req)
    .then( success => res.status(201).send() )
    .catch(error => {
        if( error === req.t('error') )
          res.status(500).send( JSON.stringify( {error: error} ) );
        else
         res.status(400).send( JSON.stringify ({error: error}) );
    })
}

// const addCourse = (req, res) => {

//     const day_id = coursesServices.getDayID(req.body.meet_Day)
//     const subject_id = coursesServices.getSubjectID(req.body.subject)
//     const teacher_id = coursesServices.getTeacherID(req.body.teacher_name)


//     const course_values = [
//         req.body.course_id,
//         req.body.course_name,
//         req.body.start_date,
//         req.body.END_DATE,
//         req.body.is_active,
//         req.body.meet_Time,
//         req.body.birth_date,
//         day_id,
//         subject_id,
//         teacher_id
//       ];


//     userServices.addUser(user_values)
//     .then(user => {
//         return user;
//     })
//     .then(user => {
//         return teacherServices.addTaecher(teacher_values, user);
//     })
//     .then(teacher => {
//         res.status(201).send(JSON.stringify( req.body ));
//     })
//     .catch(err => {
//         if(err.message && err.message.split(' ')[0] === 'Duplicate'){
//             const errmsg = err.message.split(' ');
//             const filedErr = errmsg[errmsg.length-1].split('.')
//             console.log(filedErr);
//             return res.status(400).send( JSON.stringify({
//                error: 'Duplicate '+ filedErr[filedErr.length-1].replace("'","")
//             }));
//         }
//         res.status(500).send();
//     })
// }

module.exports = {
    getCourses,
    getCourse,
    deleteCourse,
    addCourse,
    updateCourse,
    getCourseStudents,
    registerStudentsToCourse
}