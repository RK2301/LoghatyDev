const router = require('express').Router();
const shiftController = require('../controllers/shiftController');
const { convertToLocalTime } = require('../services/generalServices');

router.get('/:start_date/:end_date', (req, res) => {
    try {
        let start_date = req.params.start_date;
        let end_date = req.params.end_date;

        if (!start_date)
            throw new Error(req.t('badRequest'));

        if (new Date(start_date) > new Date(end_date))
            throw new Error(req.t('uncorrectDatesRange'));

        if (end_date)
            end_date += ' 23:59';

        shiftController.getShifts(req, res, start_date + ' 00:00', end_date);
    } catch (e) {
        console.log(e.message);
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

/**get the current shifts state,
 * for manager get the current teachers in the shift ~ maximum 10
 * for teacher get last 10 shifts 
 */
router.get('/lastShifts', (req, res) => {
    shiftController.getCurrentShifts(req, res);
});

router.get('/printShifts', (req, res) => {
    shiftController.printShifts(req, res);
});

/**for teachers return for each month in the current year how many hours has worked */
router.get('/teachersYearHours', (req, res) => {
    shiftController.getTeachersYearHours(req, res)
});

/**get the top 5 teachers based on hours worked this month and hours each one worked */
router.get('/top5teachers', (req, res) => {
    shiftController.getTop5Teachers(req, res);
})

router.get('/current', (req, res) => {
    try {
        const user_id = req.user.uId;

        if (user_id)
            shiftController.getTeacherCurrentShift(req, res, user_id);
        else
            throw new Error(req.t('badRequest'));

    } catch (err) {
        res.status(400).send(JSON.stringify({ error: err.message }));
    }
});

router.post('/start', (req, res) => {
    try {
        const { latitude, longitude } = req.body.location;
        // const latitude = req.body.location.latitude;
        // const longitude = req.body.location.longitude;
        const teacher_id = req.body.teacher_id;
        shiftController.startShift(res, teacher_id, latitude, longitude);
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

router.post('/shift_note', (req, res) => {
    try {
        const id = req.user.uId;
        const { start_shift, shift_note } = req.body;

        if (!id || !start_shift || !shift_note)
            throw new Error(req.t('badRequest'));

        shiftController.shiftNote(req, res, id, start_shift, shift_note);

    } catch (e) {
        res.status(400).send(JSON.stringify({ error: e.message }))
    }
});

/**update shift start and end time for specific teacher */
router.put('/', (req, res) => {
    try {
        const { old_start_shift, new_start_shift, end_shift, teacher_id } = req.body;

        if (!old_start_shift || !new_start_shift || !teacher_id)
            throw new Error(req.t('badRequest'));

        if (end_shift && new Date(end_shift) <= new Date(new_start_shift))
            throw new Error(req.t('dateRangeError'));

        shiftController.updateShift(req, res, convertToLocalTime(new_start_shift), convertToLocalTime(old_start_shift), convertToLocalTime(end_shift), teacher_id);

    } catch (e) {
        console.log(e);
        res.status(400).send(JSON.stringify({ error: e.message }));
    }
});

router.put('/end', (req, res) => {
    try {
        const { latitude, longitude } = req.body.location;
        const teacher_id = req.body.teacher_id;
        const start_shift = req.body.start_shift;
        shiftController.endShift(res, teacher_id, start_shift, latitude, longitude, req);
    } catch (e) {
        res.status(400).send();
    }
});

router.delete('/:teacher_id/:start_shift', (req, res) => {
    try {
        const teacher_id = req.params.teacher_id
        const start_shift = convertToLocalTime(req.params.start_shift)
        console.log(start_shift);


        if (!teacher_id || !start_shift)
            throw new Error()

        shiftController.deleteShift(req, res, teacher_id, start_shift)
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: req.t('badRequest') })
    }
})

module.exports = router;