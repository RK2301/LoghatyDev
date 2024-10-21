const router = require('express').Router();
const studentsCont = require('../controllers/studentsController.js');
const usersCont = require('../controllers/userController.js');

router.get('/', (req, res) => {
    studentsCont.getStudents(req, res);
});

router.get('/print', (req, res) => {
   studentsCont.printStudents(req, res);
});

router.post('/' ,(req,res) => {
    studentsCont.addStudent(req ,res, req.body);
});

router.put('/', (req, res) => {
    const student = req.body;
    console.log(student);
    studentsCont.updateStudent(student, req,res);
});

router.delete('/:id', (req, res) => {
    const id = req.params.id
    studentsCont.deleteStudent(req, res, id);
})



module.exports = router;