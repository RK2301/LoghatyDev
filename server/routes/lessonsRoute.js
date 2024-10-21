const router = require('express').Router();
const lessonsCont = require('../controllers/lessonsController.js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/unSubmittedHomeworks', (req, res) => {
    lessonsCont.getUnsubmittedHomeworks(req, res);
})

router.get('/:courseID', (req, res) => {
    const courseID = parseInt(req.params.courseID)
    lessonsCont.getLessons(req, res, courseID);
});

router.get('/:LessonID', (req, res) => {
    const LessonID = req.params.LessonID;
    lessonsCont.getLesson(req, res, LessonID);
});


router.delete('/:course_id/:lesson_id', (req, res) => {
    try {
        const lessonID = parseInt(req.params.lesson_id);
        const courseID = parseInt(req.params.course_id);

        if (isNaN(lessonID) || isNaN(courseID)) 
           throw new Error()

        lessonsCont.deleteLesson(req, res, lessonID, courseID);
    }catch(e){
        console.log(e);
        res.status(400).json( {error: req.t('badRequest')} )
    }
});

router.get('/:course_id/hw/:hw_id', (req, res) => {

    try {
        const course_id = parseInt(req.params.course_id);
        const hw_id = parseInt(req.params.hw_id);
        if (!course_id || !hw_id)
            throw new Error(req.t('badRequest'));

        lessonsCont.getHomeworkSubmits(req, res, course_id, hw_id);
    } catch (err) {
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
});


router.post('/:course_id/hw/:hw_id', upload.array('files'), (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const hw_id = parseInt(req.params.hw_id);
        const student_id = req.user.uId;
        const files = req.files;

        if (!course_id || !hw_id || !student_id || !files || files.length === 0)
            throw new Error(req.t('badRequest'));

        lessonsCont.submit_homework(req, res, course_id, hw_id, files, student_id);

    } catch (e) {
        console.log(e);
        res.status(400).send(JSON.stringify({ error: e.message }));
    }

});

router.put('/:course_id/hw/:hw_id', upload.array('files'), (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const hw_id = parseInt(req.params.hw_id);
        const student_id = req.user.uId;
        const files = req.files;

        if (!course_id || !hw_id || !student_id || !files || files.length === 0)
            throw new Error(req.t('badRequest'));

        lessonsCont.update_submit_homework(req, res, course_id, hw_id, files, student_id);

    } catch (e) {
        console.log(e);
        res.status(400).send(JSON.stringify({ error: e.message }));
    }

});

router.get('/:course_id/hw/:hw_id/file/:file_id', (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const hw_id = parseInt(req.params.hw_id);
        const file_id = parseInt(req.params.file_id);

        if (!course_id || !hw_id || !file_id)
            throw new Error(req.t('badRequest'));

        lessonsCont.getHomeFileURL(req, res, course_id, hw_id, file_id);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
})

router.post('/lesson', (req, res) => {
    try {
        const lesson = req.body;
        //can't send empty object
        if (Object.keys(lesson).length === 0)
            throw new Error();

        lessonsCont.addLesson(req, res, lesson);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: req.t('badRequest') }));
    }
});

router.put('/lesson', (req, res) => {
    try {
        const lesson = req.body;
        //can't send empty object
        if (Object.keys(lesson).length === 0)
            throw new Error();

        lessonsCont.updateLesson(req, res, lesson);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: req.t('badRequest') }));
    }
});

router.post('/unit/:courseId', upload.array('files'), (req, res) => {
    try {
        const course_id = parseInt(req.params.courseId);
        const files = req.files || [];
        const unit = req.body;

        if (!course_id || Object.keys(unit).length === 0)
            throw new Error(req.t('badRequest'));

        //call controller to upload the files and save the data to the db
        lessonsCont.addUnit(req, res, unit, files, course_id);

    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

router.put('/unit/:courseId', upload.array('files'), (req, res) => {
    try {
        const course_id = parseInt(req.params.courseId);
        const files = req.files || [];
        const unit = req.body;

        if (!course_id || Object.keys(unit).length === 0)
            throw new Error(req.t('badRequest'));

        //call controller to upload the files and save the data to the db
        lessonsCont.updateUnit(req, res, unit, files, course_id);

    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

/**delete the unit data */
router.delete('/unit/:course_id/:unit_id', (req, res) => {
    try {
        const unit_id = parseInt(req.params.unit_id);
        const course_id = parseInt(req.params.course_id);

        if (isNaN(unit_id) || isNaN(course_id))
            throw new Error(req.t('badRequest'));

        lessonsCont.deleteUnit(req, res, course_id, unit_id)

    } catch (e) {
        console.log(e);
        res.status(400).json({ error: e.message });
    }
})

/**give feedback on student submittion */
router.put('/feedback/:hw_id/:student_id', (req, res) => {
    try {
        let { grade, submit_note } = req.body;
        grade = parseInt(grade);

        const hw_id = parseInt(req.params.hw_id);
        const student_id = req.params.student_id;

        if (!grade || !hw_id || !student_id)
            throw new Error(req.t('badRequest'));

        lessonsCont.giveFeedbackForHomework(req, res, hw_id, student_id, grade, submit_note);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e }));
    }
})

router.get('/file/:course_id/:lesson_id/:unit_id/:file_id', (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const lesson_id = parseInt(req.params.lesson_id);
        const unit_id = parseInt(req.params.unit_id);
        const file_id = parseInt(req.params.file_id);

        if (!course_id || !lesson_id || !unit_id || !file_id)
            throw new Error(req.t('badRequest'));

        lessonsCont.getFileURL(req, res, course_id, lesson_id, unit_id, file_id);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

router.delete('/file/:course_id/:lesson_id/:unit_id/:file_id', (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const lesson_id = parseInt(req.params.lesson_id);
        const unit_id = parseInt(req.params.unit_id);
        const file_id = parseInt(req.params.file_id);

        if (!course_id || !lesson_id || !unit_id || !file_id)
            throw new Error(req.t('badRequest'));

        lessonsCont.deleteFile(req, res, course_id, lesson_id, unit_id, file_id);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

router.delete('/:course_id/hw/:hw_id/file/:file_id', (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const hw_id = parseInt(req.params.hw_id);
        const file_id = parseInt(req.params.file_id);
        const student_id = req.user.uId;

        if (!course_id || !hw_id || !file_id || !student_id)
            throw new Error(req.t('badRequest'));

        lessonsCont.deleteHomeworkFile(req, res, course_id, hw_id, file_id, student_id);
    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

/**delete student submittion, files, and data, the delete will fail if a request with not contain all the parameters required
 * of the teacher already gives feedback for the submittion, student only can delete the submittion
 */
router.delete('/:course_id/hw/:hw_id/studentSubmit', (req, res) => {
    try {
        const course_id = parseInt(req.params.course_id);
        const hw_id = parseInt(req.params.hw_id);
        const student_id = req.user.uId;

        if (!course_id || !hw_id || !student_id)
            throw new Error();

        lessonsCont.deleteSubmittion(req, res, course_id, hw_id, student_id);

    } catch (e) {
        res.status(400).send(JSON.stringify({ error: req.t('badRequest') }));
    }
})


module.exports = router;