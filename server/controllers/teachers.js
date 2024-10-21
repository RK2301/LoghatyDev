const teacherServices = require('../services/teacherServices');
const userServices = require('../services/userServices');
const messages = require('../messages');
const path = require('path'); // Import the 'path' module
const fonts = require('../pdfMakeFonts');

const pdfMake = require('pdfmake');
const { toFlipArray, toFlipText } = require('../services/generalServices');
const { docFooter, docHeader, pageMargin, styles, defaultStyle, defaultStyles } = require('../pdfMakeConfig');
const printer = new pdfMake(fonts);

// const pdfFonts = require('pdfmake/build/vfs_fonts');

/**
 * get all the teachers from db, then send 200 and the data if the services return the data
 * else 500 status code return to the client
 * @param {*} req 
 * @param {*} res 
 */
const getTeachers = (req, res) => {
    teacherServices.getTeachers()
        .then(teachers => {
            res.status(200).send(JSON.stringify(teachers));
        })
        .catch(err => res.status(500).send(err))
}

const getCourseTeachers = (req, res) => {
    teacherServices.getCourseTeachers(req)
        .then(teachers => {
            res.status(200).send(JSON.stringify(teachers));
        })
        .catch(err => res.status(500).send(JSON.stringify({ error: err })))
}

/**make a pdf file contain loghaty logo at the top and table of teachers data, and send the file to the client */
const printTeachers = async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=teachers.pdf');

        // doc.image(path.join(__dirname, '..', 'public', 'LoghatyLogo.jpg'), { width: 50, align: 'center', height: 50 });

        //get teachers data and create a table
        const teachers = await teacherServices.getTeachers();

        const docDefinition = {
            pageMargins: pageMargin,
            header: docHeader(),
            footer: docFooter(req),
            content: [
                {
                    text: req.t('teachers'),
                    alignment: 'center',
                    margin: [0, 0, 0, 20],
                    fontSize: 20
                },
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 'auto',
                            //         layout: 'lightHorizontalLines',
                            table: {
                                body: [
                                    toFlipArray([req.t('id'), req.t('fullname'), req.t('phone'), req.t('email')], req.language),
                                    ...teachers.map((teacher) => toFlipArray([
                                        teacher.id,
                                        toFlipText(teacher.firstname + ' ' + teacher.lastname),
                                        teacher.phone,
                                        teacher.email,
                                    ], req.language)),
                                ],
                                alignment: "center"
                            }
                        },
                        { width: '*', text: '' },
                    ]
                },
            ],
            styles: styles,
            defaultStyle: defaultStyle(req)
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify({ error: req.t('error') }));
    }
}

const addTaecher = (req, res) => {

    const user_values = [
        req.body.id,
        req.body.firstname,
        req.body.lastname,
        req.body.username,
        req.body.email,
        req.body.phone,
        req.body.birth_date,
    ];

    const teacher_values = [
        req.body.id,
        req.body.hire_date,
        req.body.isManager
    ];

    teacherServices.addNewTeacher(user_values, teacher_values, req)
        .then(success => res.status(201).send(JSON.stringify(req.body)))
        .catch(e => {
            if (e === req.t('error'))
                res.status(500).send(JSON.stringify({ error: e }))
            else
                res.status(400).send(JSON.stringify({ error: e }))
        })
}


const updateTeacher = (req, res, teacher) => {

    userServices.updateUser(teacher)
        .then(user => teacherServices.updateTeacher(teacher, req))
        .then(updTeacher => res.status(200).send(JSON.stringify(updTeacher)))
        .catch(err => {
            console.log(err);
            if (err.message && err.message.split(' ')[0] === 'Duplicate') {
                const errMsg = getErrorMsg(err.message);
                return res.status(400).send(JSON.stringify({
                    error: errMsg
                }));
            }
            res.status(500).send(JSON.stringify({
                error: req.t('error')
            }));
        })
}

const getErrorMsg = (msg) => {
    let toReturn = 'Duplicate ';

    let errmsg = msg.split(' ');
    errmsg = errmsg[errmsg.length - 1].split('.');
    errmsg = errmsg[errmsg.length - 1].replace("'", "")
    toReturn += errmsg;

    return toReturn;
}

const deleteTeacher = (req, res, id) => {
    userServices.deleteuser(id)
        .then(response => res.status(204).send())
        .catch(err => {
            if (err === messages.NOT_FOUND)
                res.status(404).send();
            else
                res.status(500).send();
        })
}

module.exports = {
    getTeachers,
    addTaecher,
    updateTeacher,
    deleteTeacher,
    getCourseTeachers,
    printTeachers
}
