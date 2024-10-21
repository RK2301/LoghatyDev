const lessonsServices = require('../services/lessonsServices.js');
const userServices = require('../services/userServices');
const messages = require('../messages');

const getLessons = (req, res, courseID) => {
    lessonsServices.getLessons(courseID, req)
        .then(lessons => {
            res.status(200).send(JSON.stringify(lessons));
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err)
        })
}

const getLesson = (req, res, lessonID) => {
    lessonsServices.getLesson(lessonID)
        .then(lesson => {
            res.status(200).send(JSON.stringify(lesson));
        })
        .catch(err => res.status(500).send(err))
}

const deleteLesson = (req, res, lesson_id, course_id) => {
    lessonsServices.deleteLesson(lesson_id, course_id, req)
    .then(success => res.status(204).send())
    .catch(e => res.status(500).json( {error: e} ));
}

const getHomeworkSubmits = (req, res, course_id, hw_id) => {

    lessonsServices.getHomeworkSubmits(course_id, hw_id, req)
        .then(submits => res.status(200).send(JSON.stringify(submits)))
        .catch(err => {
            console.log(err);
            res.status(500).send(JSON.stringify({ error: err }))
        });

}

const submit_homework = (req, res, course_id, hw_id, files, student_id) => {
    lessonsServices.submit_homework(files, course_id, hw_id, student_id, req)
        .then(newSubmit => res.status(201).send(JSON.stringify(newSubmit)))
        .catch(err => {
            if (err !== req.t('error'))
                res.status(400).send(JSON.stringify({ error: err }))
            else
                res.status(500).send(JSON.stringify({ error: err }))
        })
}

const update_submit_homework = (req, res, course_id, hw_id, files, student_id) => {
    lessonsServices.submit_homework(files, course_id, hw_id, student_id, req, false)
        .then(updateSubmit => { res.status(200).send(JSON.stringify(updateSubmit)) })
        .catch(err => {
            if (err !== req.t('error'))
                res.status(400).send(JSON.stringify({ error: err }))
            else
                res.status(500).send(JSON.stringify({ error: err }))
        })
}

const addLesson = (req, res, lesson) => {

    lessonsServices.addLesson(lesson, req)
        .then(newLesson => res.status(201).send(JSON.stringify(newLesson)))
        .catch(error => res.status(500).send(JSON.stringify({ error: error })))
}

const updateLesson = (req, res, lesson) => {

    lessonsServices.updateLesson(lesson, req)
        .then(updateLesson => res.status(200).send(JSON.stringify(updateLesson)))
        .catch(error => res.status(500).send(JSON.stringify({ error: error })))
}

const addUnit = (req, res, unit, files, course_id) => {

    lessonsServices.addUnit(unit, files, course_id, req)
        .then(unit => res.status(201).send(JSON.stringify(unit)))
        .catch(error => res.status(500).send(JSON.stringify({ error: error })))
}

const updateUnit = (req, res, unit, files, course_id) => {

    lessonsServices.updateUnit(unit, files, course_id, req)
        .then(unit => res.status(200).send(JSON.stringify(unit)))
        .catch(error => res.status(500).send(JSON.stringify({ error: error })))
}

const deleteUnit = (req, res, course_id, unit_id) => {
    lessonsServices.deleteUnit(unit_id, course_id, req)
    .then(success => res.status(204).send())
    .catch(err => {
        let stauts = 500;
        if( err === req.t('notFound') )
          stauts = 404;

          res.status(stauts).json( {error: err} );
    })
}

const getFileURL = (req, res, course_id, lesson_id, unit_id, file_id) => {

    lessonsServices.getFileURL(course_id, lesson_id, unit_id, file_id, req)
        .then(fileURL => res.status(200).send(fileURL))
        .catch(e => {
            if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }));
            else
                res.status(500).send(JSON.stringify({ error: e }))
        })
}

const getHomeFileURL = (req, res, course_id, hw_id, file_id) => {
    lessonsServices.getHomeFileURL(course_id, hw_id, file_id, req)
        .then(fileURL => res.status(200).send(fileURL))
        .catch(e => {
            if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }));
            else
                res.status(500).send(JSON.stringify({ error: e }))
        })
}

const getUnsubmittedHomeworks = (req, res) => {
    lessonsServices.getUnsubmittedHomeworks(req)
    .then(homeworks => res.status(201).send( JSON.stringify(homeworks) ))
    .catch(e => res.status(500).send( JSON.stringify({error: e}) ));
}

const giveFeedbackForHomework = (req, res, hw_id, student_id, grade, submit_note) => {
    lessonsServices.giveFeedbackForHomework(hw_id, student_id, grade, submit_note, req)
        .then(response => res.status(204).send())
        .catch(e => res.status(500).send(JSON.stringify({ error: e })));
}

const deleteFile = (req, res, course_id, lesson_id, unit_id, file_id) => {

    lessonsServices.deleteFile(course_id, lesson_id, unit_id, file_id, req)
        .then(fileDelted => res.status(204).send())
        .catch(e => {
            if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }));
            else
                res.status(500).send(JSON.stringify({ error: e }))
        })
}

const deleteHomeworkFile = (req, res, course_id, hw_id, file_id, student_id) => {

    lessonsServices.deleteHomeworkFile(course_id, hw_id, file_id, student_id, req)
        .then(deleted => res.status(204).send())
        .catch(e => {
            if (e === req.t('error'))
                res.status(500).send(JSON.stringify({ error: e }));
            else if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }));
            else
                res.status(400).send(JSON.stringify({ error: e }));

        })
}

const deleteSubmittion = (req, res, course_id, hw_id, student_id) => {

    lessonsServices.deleteSubmittion(course_id, hw_id, student_id, req)
        .then(deleted => res.status(204).send())
        .catch(e => {
            if (e === req.t('error'))
                res.status(500).send(JSON.stringify({ error: e }));
            else if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }));
            else
                res.status(400).send(JSON.stringify({ error: e }));
        })
}


module.exports = {
    getLessons,
    getLesson,
    deleteLesson,
    getHomeworkSubmits,
    addLesson,
    updateLesson,
    addUnit,
    updateUnit,
    deleteUnit,
    getFileURL,
    deleteFile,
    submit_homework,
    update_submit_homework,
    getHomeFileURL,
    deleteHomeworkFile,
    giveFeedbackForHomework,
    deleteSubmittion,
    getUnsubmittedHomeworks
}