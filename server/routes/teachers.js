const router = require('express').Router();
const teacherCont = require('../controllers/teachers.js');
const upload = require('../middlewares/multer.js')

router.get('/', (req, res) => {
    teacherCont.getTeachers(req, res);
});

router.get('/courseTeachers', (req, res) => {
    teacherCont.getCourseTeachers(req, res )
});

router.get('/print', (req, res) => {
    teacherCont.printTeachers(req, res);
})

router.post('/' ,(req,res) => {
    teacherCont.addTaecher(req, res);
});

router.put('/:id', (req, res) => {
    const teacher = req.body;
    teacherCont.updateTeacher(req, res, teacher);
});

router.delete('/:id', (req, res) => {
    const id = req.params.id
    teacherCont.deleteTeacher(req, res, id);
})

router.post('/upload',upload.array("files", 12) ,(req,res) => {
    console.log(req.files);
    
    //handle files with the same name 
    res.send("Multiple Files Upload Success");
});

module.exports = router;