const router = require('express').Router();
const subjectsController = require('../controllers/subjectsController');

router.get('/', (req, res) => {
    subjectsController.getAllSubjects(req, res)
});

router.post('/', (req, res) => {
    try{
        const subject = req.body;
        subjectsController.addSubject(subject, req, res);
    }catch(e){
        res.status(500).send( JSON.stringify({error: req.t('error')}) )
    }
});

router.put('/:id', (req, res) => {
    const subject = req.body;
    subjectsController.updateSubject(subject, req, res);
})

module.exports = router;