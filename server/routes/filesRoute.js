const router = require('express').Router();
const messages = require('../messages');
const filesController = require('../controllers/filesController.js');
const upload = require('../middlewares/multer.js');
const path = require('path');


// router.use((req, res, next) => {
//     console.log('filesRouter middleware');
//     next();
//   });

router.get('/:id', (req, res) => {
  const id = req.params.id;
  // const path = "../server/uploads/" + id ;
  filesController.getFiles(req, res, id);
  //res.status(200);
});

router.get('/:userID/:fileID', (req, res) => {
  try {
    const userID = req.params.userID;
    const fileID = parseInt(req.params.fileID);

    if (!userID || !fileID)
      throw new Error();

    filesController.getFile(req, res, userID, fileID);
  } catch (e) {
    console.log(e);
    res.status(400).send(JSON.stringify({ error: req.t('badRequest') }));
  }
});

router.delete('/:userID/:fileID/:fileName', (req, res) => {

  try {
    const userID = req.params.userID;
    const fileID = parseInt(req.params.fileID);
    const fileName = req.params.fileName;

    if(!userID || !fileID)
      throw new Error();

    filesController.deleteFile(req, res, userID, fileID, fileName);
  } catch (e) {
    console.log(e);
    res.status(400).send( JSON.stringify( {error: req.t('badRequest')} ))
  }
});

module.exports = router;
