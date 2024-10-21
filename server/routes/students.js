const router = require('express').Router();
const studentsCont = require('../controllers/students.js');

router.get('/', (req, res) => {
    studentsCont.getStudents(req, res);
});

router.post('/' ,(req,res) => {
    studentsCont.addStudent(req, res);
});

router.put('/:id', (req, res) => {
    const student = req.body;
    studentsCont.updateStudent(req, res, student);
});

router.delete('/:id', (req, res) => {
    const id = req.params.id
    studentsCont.deleteStudent(req, res, id);
})



module.exports = router;