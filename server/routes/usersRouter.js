const router = require('express').Router();
const messages = require('../messages');
const userController = require('../controllers/userController.js');
const multer = require('multer');

const upload = multer( {storage: multer.memoryStorage()} );

/**
 * check if username the user try to add is unique
 */
router.post('/unique', (req, res) => {

    const username = req.body.username;
    userController.checkUniqueUsername(req, res, username, (error, result) => {
        if(error){
            res.status(500).send(messages.ERR_SERVERR);
        }else{
            res.status(201).send( JSON.stringify( {
                exists: result === messages.USERNAME_NOT_UNIQUE ? true : false
            } ) );
        }
    });

});

router.post('/upload/:id', upload.array("files", 2) ,(req, res) => {
   
    try{
        const user_id = req.params.id;
        const file = req.files[0];
        const manager_id = req.user.uId;

        if( !user_id || !file || !manager_id )
          throw new Error(req.t('badRequest'));

          userController.addFile(req, res, user_id, file, manager_id);
    }catch(e){
        console.log(e);
        res.status(400).send( JSON.stringify({error: e.message}) );
    }
});


router.get('/notes/:userID', (req, res) => {

    const userID = req.params.userID
    userController.getNotes(req, res, userID);
    
});

router.get('/', (req, res) => {
    if( req.user.role !== 'm' )
      res.status(401).send( JSON.stringify({error: req.t('notAuthorizied')}) );
    else
     userController.getAllUsers(req, res);
})

router.post('/notes', (req, res) => {
    const note = req.body;
    console.log(req.body);
    userController.addNote(res, note);
});

router.put('/notes', (req, res) => {
    const newNote = req.body;
    console.log(req.body);
    userController.updateNote(res, newNote);
});

router.delete('/notes/:note_id', (req, res) => {
    const note_id = req.params.note_id;
    userController.deleteNote(res, note_id);
})

module.exports = router;
