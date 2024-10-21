const MessageServices = require('../services/messageServices');

const getMessages = (req, res, limited) => {
    MessageServices.getMessages(limited, req)
        .then(messages => res.status(200).send(JSON.stringify(messages)))
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
};

const getMessageUsers = (req, res, message_id) => {
    MessageServices.getMessageUsers(message_id, req)
        .then(usersID => res.status(201).send(JSON.stringify(usersID)))
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
}

const addMessage = (req, res, message_title, message_content, sent_time, message_users) => {
    MessageServices.addMessage(message_title, message_content, sent_time, message_users, req)
        .then(newMessage => res.status(201).send(JSON.stringify(newMessage)))
        .catch(e => res.status(400).send(JSON.stringify({ error: e })))
}

const updateMessage = (req, res, message_title, message_content, message_id) => {
    MessageServices.updateMessage(message_id, message_title, message_content, req)
        .then(success => res.status(204).send())
        .catch(e => {
            if (e === req.t('notAuthorizied'))
                res.status(401).send(JSON.stringify({ error: e }))
            else
                res.status(500).send(JSON.stringify({ error: e }))
        })

}

const deleteMessage = (req, res, message_id) => {
    MessageServices.deleteMessage(message_id, req)
        .then(success => res.status(204).send())
        .catch(e => res.status(500).send(JSON.stringify({ error: e })))
}

module.exports = {
    getMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    getMessageUsers
}