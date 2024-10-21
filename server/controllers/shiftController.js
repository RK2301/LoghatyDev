const { pageMargin, docHeader, docFooter, styles, defaultStyle } = require('../pdfMakeConfig');
const shiftServices = require('../services/shiftServices');
const pdfMake = require('pdfmake');
const fonts = require('../pdfMakeFonts');
const { getTeachers } = require('../services/teacherServices');
const { sendNotification } = require('web-push');
const printer = new pdfMake(fonts);

const getShifts = (req, res, start_date, end_date) => {
    shiftServices.getShifts(start_date, end_date, req)
        .then(shifts => res.status(200).send(JSON.stringify(shifts)))
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
}

const getCurrentShifts = (req, res) => {
    shiftServices.getCurrentShifts(req)
        .then(shifts => res.status(200).send(JSON.stringify(shifts)))
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
}

const getTeachersYearHours = (req, res) => {
    shiftServices.getTeachersYearHours(req)
        .then(teachersHours => res.status(201).send(JSON.stringify(teachersHours)))
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
}

/**get top 5 teacehrs with highest shifts hours for the current month */
const getTop5Teachers = (req, res) => {
    shiftServices.getTop5TeacherForMonth(req)
        .then(top5teachers => res.status(201).send(JSON.stringify(top5teachers)))
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
}

const getTeacherCurrentShift = (req, res, teacher_id) => {
    shiftServices.getTeacherCurrentShift(teacher_id, req)
        .then(shift => { console.log(shift);; res.status(200).send(JSON.stringify(shift)) })
        .catch(err => { console.log(err);; res.status(500).send(JSON.stringify({ error: err })) });
}

const startShift = (res, teacher_id, start_latitude, start_longitude) => {
    shiftServices.startShift(teacher_id, start_latitude, start_longitude)
        .then(async (start_shift) => {
            const [teacher] = await getTeachers(teacher_id);

            if (teacher[0])
                sendNotification(teacher[0], 'Shift Started');

            res.status(201).send(JSON.stringify({
                teacher_id: teacher_id,
                start_shift: start_shift,
                start_latitude: start_latitude,
                start_longitude: start_longitude
            }))
        })
        .catch(err => {
            if (err === req.t('alreadyInShift'))
                res.status(400).send(JSON.stringify({ error: err }));
            else
                res.status(500).send(JSON.stringify({ error: err }));
        })
}

const updateShift = (req, res, new_start_shift, old_start_shift, end_shift, teacher_id) => {
    shiftServices.updateShift(new_start_shift, old_start_shift, end_shift, teacher_id, req)
        .then(success => res.status(204).send())
        .catch(e => {
            if (e === req.t('uniqueStartShiftTime'))
                res.status(400).send(JSON.stringify({ error: e }));
            else
                res.status(500).send(JSON.stringify({ error: e }));
        });
}

const endShift = (res, teacher_id, start_shift, end_latitude, end_longitude, req) => {
    shiftServices.endShift(teacher_id, start_shift, end_latitude, end_longitude, req)
        .then(end_shift => res.status(200).send(JSON.stringify({
            teacher_id: teacher_id,
            start_shift: start_shift,
            end_shift: end_shift,
            end_latitude: end_latitude,
            end_longitude: end_longitude
        })))
        .catch(err => {
            if (err === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: err }));
            else
                res.status(500).send(JSON.stringify({ error: err }));
        })
}

const shiftNote = (req, res, teacher_id, start_shift, shift_note) => {
    shiftServices.shiftNote(teacher_id, start_shift, shift_note, req)
        .then(success => res.status(201).send())
        .catch(e => {
            console.log(e);
            res.status(500).send(JSON.stringify({ error: e }));
        })
}

const deleteShift = (req, res, teacher_id, start_shift) => {
    shiftServices.deleteShift(teacher_id, start_shift, req)
        .then(success => res.status(204).send())
        .catch(e => {
            console.log(e);
            res.status(500).json({ error: e })
        })
}

/**print shifts based on user sent the request if manager print the teachers id based, if teaceher print only teacher shifts */
const printShifts = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const teacherIds = req.query.teacherIds.split(',');

        if (!startDate || !endDate || (new Date(endDate) <= new Date(startDate))) {
            res.status(400).send(JSON.stringify({ error: req.t('uncorrectDatesRange') }));
            return;
        }

        const docDefinition = {
            pageMargins: pageMargin,
            header: docHeader(),
            footer: docFooter(req),
            content: [],
            styles: styles,
            defaultStyle: defaultStyle(req)
        }

        //now call the services to create document content
        await shiftServices.printShifts(startDate, endDate, teacherIds, docDefinition, req);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=shifts.pdf');

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify({ error: req.t('error') }))
    }
}

module.exports = {
    getTeacherCurrentShift,
    startShift,
    endShift,
    shiftNote,
    getShifts,
    updateShift,
    getCurrentShifts,
    getTeachersYearHours,
    getTop5Teachers,
    printShifts,
    deleteShift
}