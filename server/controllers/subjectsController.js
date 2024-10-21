const subjectsServices = require('../services/subjectServices');

const getAllSubjects = (req, res) => {
    subjectsServices.getAllSubjects(req)
    .then( subjects => res.status(200).send( JSON.stringify( subjects ) ) )
    .catch( err => res.status(500).send(err) );
}

const addSubject= (subject, req, res) => {
    subjectsServices.addSubject(subject, req)
    .then(subject => res.status(201).send( JSON.stringify(subject) ))
    .catch( err => res.status(500).send( JSON.stringify({error: err}) ));
}

/**
 * update the subject data, return success
 * if fail return 500, or 400 if the requrest subject is not exists in the db
 * @param {*} subject 
 * @param {*} req 
 */
const updateSubject = (subject, req, res) => {
    subjectsServices.updateSubject(subject, req)
    .then(subject => res.status(200).send( JSON.stringify(subject)) )
    .catch( err => {
        if(err === req.t('notFound'))
           res.status(404).send( JSON.stringify({error: err}) );
        else
           res.status(500).send(err);   
    } )
}

module.exports ={
    getAllSubjects,
    addSubject,
    updateSubject   
}