const userServices = require('../services/userServices.js');
const messages = require('../messages.js');
const CONFIG = require('../config.js');

const checkUniqueUsername = (req, res, username, cb) => {

    userServices.checkUniqueUsername(username)
    .then(response => {
        cb(undefined, response);
    })
    .catch(err => {
        cb(err);
    })
}

const getAllUsers = (req, res) => {
    userServices.getAllUsers(req)
    .then(allUsers => res.status(201).send( JSON.stringify(allUsers) ))
    .catch(e => res.status(500).send( JSON.stringify( {error: e} ) ))
}

/**
 * Add new file data to the db, and rename the file with an id generated from the mysql server
 * @param {*} req 
 * @param {*} res 
 * @returns new created file info, else error message with status code 500
 */ 
const addFile = (req, res, user_id, file, manager_id) => {
    userServices.addFile(file, user_id, manager_id)
    .then(newFile => res.status(201).send( JSON.stringify(newFile)) )
    .catch(err => {
        if(err === req.t('notFound'))
         res.status(400).send( JSON.stringify( {error: err} ) )
        else
         res.status(500).send( JSON.stringify({error: err}) )
    })

}


const getNotes = (req, res, userID) => {

    userServices.getNotes(userID)
    .then(notes => res.status(200).send( JSON.stringify(notes) ))
    .catch( error => res.status(500).send() );

}

const addNote = ( res, note) => {
    userServices.addNote(note)
    .then(insertedId => {
        res.status(201).send( JSON.stringify ({
            ...note,
            note_id: insertedId,
            created_at: new Date()
        } ))
    })
    .catch( error => {
        if(error === messages.FOREIGN_KEY_FAIL)
           res.status(404).send();
        else   
           res.status(500).send();
    } )
}

const updateNote = (res, newNote) => {
    userServices.updateNote(newNote)
    .then(changed => res.status(200).send() )
    .catch(err => {
         if(err === messages.NOT_FOUND)
          res.status(404).send()
         else
          res.status(500).send(); 
    })
}

const deleteNote = (res, note_id) => {
    userServices.deleteNote(note_id)
    .then(deletedId => res.status(204).send())
    .catch(err => {
        if(err === messages.NOT_FOUND){
            res.status(404).send()
        }
        res.status(500).send();
    })
}

module.exports = {
    checkUniqueUsername,
    addFile,
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    getAllUsers
}