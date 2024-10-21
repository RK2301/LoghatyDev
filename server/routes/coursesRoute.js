const express = require('express');
const courseCont = require('../controllers/coursesController.js');
const multer = require('multer');

const router = express.Router();
const upload = require("../middlewares/multer.js");

router.get('/:student_id', (req, res) => {
    try{
        const student_id = req.params.student_id;
        if(!student_id)
          res.status(400).send( JSON.stringify({error: req.t('badRequest')}) );

          courseCont.getCourses(req, res, student_id);
    }catch(e){
        console.log(e);
    }
});

router.get('/', (req, res) => {
    courseCont.getCourses(req, res);
});



router.post('/', (req, res) => {
    try{
        const course = req.body;
        courseCont.addCourse(req, res, course);
    }catch(e){
        res.status(400).send( JSON.stringify( {error: req.t('badRequest')} ) )
    }
});

router.put('/', (req, res) => {
    try{
        const course = req.body;
        courseCont.updateCourse(req, res, course);
    }catch(e) {
        res.status(400).send( JSON.stringify( {error: req.t('badRequest')} ) )
    }
});

router.get('/:course_id/students', (req, res) => {
    try{
        const course_id = parseInt(req.params.course_id);
        courseCont.getCourseStudents(req, res, course_id);
    }catch(e){
        console.log(e);
        res.status(400).send(req.t('badRequest'))
    }
});

router.post('/registerStudents', (req, res) => {
    try{
        const registerStudents = req.body;
        if(Object.keys(registerStudents).length === 0)
          throw new Error()
        else
        courseCont.registerStudentsToCourse(req, res, registerStudents);
    
    }catch(e){
        res.status(400).send( JSON.stringify( {error: req.t('badRequest')} ) )
    }
});

module.exports = router;