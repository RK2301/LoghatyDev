const messages = require('../messages');
const filesServices = require('../services/filesServices.js');
const CONFIG = require('../config.js');
const path = require('path');


const getFiles = (req, res, id) => {

    filesServices.getFiles(id)
        .then(files => {
            res.status(200).send(JSON.stringify(files));
            //     let filePath2 = path.relative(__dirname,folderpath) ;
            //     const allFiles = filesServices.getAllFiles(filePath2);
            // //after gathering the files from the folder in an array send them one by one using a loop
            // //res.sendFile(allFiles);
            //     res.status(200);
        })
        .catch(err => res.status(500).send(err))
}

// const deleteFile = (req, res, fileID,userId) => {
//     const folderPath = `../server/uploads/${req.params.userID}/`;
//         filesServices.getFileName(fileID).then(file_name => {
//             real_file_name = filesServices.addIdToName(fileID, file_name);
//             console.log(real_file_name);

//         const filePath = CONFIG.PATH_TO_FILES + `${userId}/${real_file_name}`


//         fs.unlink(filePath, (err) => {
//             if (err) {
//             console.error('Error deleting file:', err);
//             res.status(500).send();
//             return;
//             }}); 

//         })

//     filesServices.deleteFile(fileID,userId)
//     .then(response => res.status(204).send())
//     .catch(err => {
//         if(err === messages.NOT_FOUND)
//          res.status(404).send();
//         else
//         console.log(err);
//          res.status(500).send(); 
//     })
// }

// const getFile = (req, res, userID, fileID) => {
//     // const path = CONFIG.PATH_TO_FILES + ''
//     filesServices.getFileName(fileID)
//     .then(file_name => {
//      real_file_name = filesServices.addIdToName(fileID, file_name);
//      res.download(CONFIG.PATH_TO_FILES + `${userID}/${real_file_name}`, (err) => {
//          if(err){
//              //console.log(err);
//              res.status(404).send( JSON.stringify( {error: err} ) );
//          }
//      })
//     })
//     .catch(err => {
//      //console.log(err);
//      if(err === messages.NOT_FOUND){
//          res.status(404).send();
//      }else{
//          res.status(500).send();
//      }
//     })
//  }

const deleteFile = (req, res, user_id, file_id, file_name) => {
    filesServices.deleteFile(user_id, file_id, file_name, req)
        .then(success => res.status(204).send())
        .catch(e => {
            if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }))
            else
                res.status(500).send(JSON.stringify({ error: e }))
        })
}

const getFile = (req, res, user_id, file_id) => {
    filesServices.getFileURL(user_id, file_id, req)
        .then(fileURL => res.status(200).send(fileURL))
        .catch(e => {
            if (e === req.t('notFound'))
                res.status(404).send(JSON.stringify({ error: e }))
            else
                res.status(500).send(JSON.stringify({ error: e }))
        })
}

module.exports = {
    getFiles,
    deleteFile,
    getFile
}