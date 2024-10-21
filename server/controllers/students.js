const studentServices = require('../services/studentServices');
const userServices = require('../services/userServices');
const messages = require('../messages');
const conn = require('../db');

/**
 * get all the teachers from db, then send 200 and the data if the services return the data
 * else 500 status code return to the client
 * @param {*} req 
 * @param {*} res 
 */
const getStudents = (req, res) => {
    studentServices.getTeachers()
    .then(students => {
        res.status(200).send(JSON.stringify(students));
    })
    .catch(err => res.status(500).send(err))
}

const deleteStudent = (req, res, id) => {
    userServices.deleteuser(id)
    .then(response => res.status(204).send())
    .catch(err => {
        if(err === messages.NOT_FOUND)
         res.status(404).send();
        else
         res.status(500).send(); 
    })
}


const addStudent = ( res, student ) => {
    studentServices.addStudent( student )
    .then( student => res.status(201).send(student) )
    .catch( err => res.status(500).send(err) )
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
        res.status(201).send(JSON.stringify( req.body ));
    })
    .catch(err => {
        if(err.message && err.message.split(' ')[0] === 'Duplicate'){
            const errmsg = err.message.split(' ');
            const filedErr = errmsg[errmsg.length-1].split('.')
            console.log(filedErr);
            return res.status(400).send( JSON.stringify({
               error: 'Duplicate '+ filedErr[filedErr.length-1].replace("'","")
            }));
        }
        res.status(500).send();
    })
}

const updateStudent = (req, res, student) => {

    userServices.updateUser(student)
    .then(user => studentServices.updateStudent( student ))
    .then(updStudent => res.status(200).send( JSON.stringify( updStudent ) ))
    .catch(err => {
        console.log(err);
         if( err.message && err.message.split(' ')[0] === 'Duplicate' ) {
            const errMsg = getErrorMsg(err.message);
           return res.status(400).send( JSON.stringify( {
                error: errMsg
            } ) );
        }
        res.status(500).send( JSON.stringify( {
                error: messages.ERR_SERVERR
              } ) );
    })
}

module.exports = {
    getStudents,
    deleteStudent,
    addStudent,
    updateStudent
}