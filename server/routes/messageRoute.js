const router = require('express').Router();
const MessageController = require('../controllers/messageController');

router.get('/:limited', (req, res) => {
    const limited = Boolean(req.params.limited);
    MessageController.getMessages(req, res, limited);
});

router.get('/users/:message_id', (req, res) => {
    const message_id = parseInt(req.params.message_id);
    if( !message_id || isNaN(message_id) )
      res.status(400).send( JSON.stringify({error: req.t('badRequest')})  )

     MessageController.getMessageUsers(req, res, message_id);
})

router.post('/', (req, res) => {
    try{
        const {message_title, message_content, message_users, sent_time} = req.body;

        if( !message_title || !message_content || !message_users || !Array.isArray(message_users) || !sent_time)
          throw new Error( req.t('badRequest') );

          MessageController.addMessage(req, res, message_title, message_content, sent_time, message_users);
    }catch(e){
        console.log(e);
        res.status(400).send(JSON.stringify( {error: e.message} ))
    }
});

router.put('/', (req, res) => {
    try{
        const {message_title, message_content, message_id} = req.body;

        if( !message_content || !message_title || !message_id)
          throw new Error( req.t('badRequest') );

          MessageController.updateMessage(req, res, message_title, message_content, message_id)
    }catch(e){
        console.log(e);
        res.status(400).send(JSON.stringify( {error: e.message} ))
    }
});

router.delete('/:message_id', (req, res) => {
    const message_id = parseInt(req.params.message_id);

    if(!message_id)
      res.status(400).send(JSON.stringify( {error: req.t('badRequest')} ));
    else 
     MessageController.deleteMessage(req, res, message_id)
})

module.exports = router;