const studentServices = require('../services/studentServices');
const userServices = require('../services/userServices');
const messages = require('../messages');
const { pageMargin, docHeader, docFooter, styles, defaultStyle } = require('../pdfMakeConfig');
const pdfMake = require('pdfmake');
const fonts = require('../pdfMakeFonts');
const printer = new pdfMake(fonts);

/**
 * get all the teachers from db, then send 200 and the data if the services return the data
 * else 500 status code return to the client
 * @param {*} req 
 * @param {*} res 
 */
const getStudents = (req, res) => {
    studentServices.getStudents()
        .then(students => {
            res.status(200).send(JSON.stringify(students));
        })
        .catch(err => res.status(500).send(err))
}

const deleteStudent = (req, res, id) => {
    studentServices.deleteStudent(id)
        .then(response => res.status(204).send())
        .catch(err => {
            if (err === messages.NOT_FOUND)
                res.status(404).send();
            else
                console.log(err);
            res.status(500).send();
        })
}

const addStudent = (req, res, student) => {
    console.log(student);
    studentServices.addStudent(student, req)
        .then(student => res.status(201).send(JSON.stringify(student)))
        .catch(err => {
            console.log(err);
            res.status(400).send(JSON.stringify({
                error: err
            }))
        })
}

const add_student = (req, res) => {

    const user_values = [
        req.body.id,
        req.body.firstname,
        req.body.lastname,
        req.body.username,
        req.body.email,
        req.body.phone,
        req.body.birth_date,
    ];

    const student_values = [
        req.body.id,
        req.body.enrollment_date,
        req.body.payment_amount,
        req.body.payment_date,
        req.body.payment_method,

    ];

    userServices.addUser(user_values)
        .then(user => {
            return user;
        })
        .then(user => {
            return studentServices.addStudent(student_values, user);
        })
        .then(student => {
            res.status(201).send(JSON.stringify(req.body));
        })
        .catch(err => {
            if (err.message && err.message.split(' ')[0] === 'Duplicate') {
                const errmsg = err.message.split(' ');
                const filedErr = errmsg[errmsg.length - 1].split('.')
                console.log(filedErr);
                return res.status(400).send(JSON.stringify({
                    error: 'Duplicate ' + filedErr[filedErr.length - 1].replace("'", "")
                }));
            }
            console.log(err);
            res.status(500).send();
        })
}

const updateStudent = (student, req, res) => {

    studentServices.updateStudent(student, req)
        .then(student => res.status(200).send(JSON.stringify(student)))
        .catch(err => {
            console.log(err);
            if (err === 'error')
                res.status(500).send(JSON.stringify({ error: req.t('error') }));
            else
                res.status(400).send(JSON.stringify({ error: err }));
        })
}

const update_Student = (student, res) => {

    userServices.updateUser(student)
        .then(user => studentServices.updateStudent(student))
        .then(updStudent => res.status(200).send(JSON.stringify(updStudent)))
        .catch(err => {
            console.log(err);
            if (err.message && err.message.split(' ')[0] === 'Duplicate') {
                const errMsg = getErrorMsg(err.message);
                return res.status(400).send(JSON.stringify({
                    error: errMsg
                }));
            }
            res.status(500).send(JSON.stringify({
                error: messages.ERR_SERVERR
            }));
        })
}

const printStudents = async(req, res) => {
    try {

        const docDefinition = {
            pageMargins: pageMargin,
            header: docHeader(),
            footer: docFooter(req),
            content: [],
            styles: styles,
            defaultStyle: defaultStyle(req)
        }

        //now call the services to create document content
        await studentServices.printStudents(docDefinition, req);

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
    getStudents,
    deleteStudent,
    addStudent,
    updateStudent,
    printStudents
}