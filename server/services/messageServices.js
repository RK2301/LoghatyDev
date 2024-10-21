const conn = require('../db');
const queries = require('../queries');

/**for each user, get the messages from the user, message who sent it or must be receive the message 
 * @param limited boolean, if true then the query will return limited number of messages which 10
 */
const getMessages = (limited, req) => (
    new Promise((resolve, reject) => {
        const getMessagesSQL = queries.getMessages(limited);
        conn.query(getMessagesSQL, [req.user.uId, req.user.uId], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve(data)
            }
        })
    })
);

/**get all users id's for who musr receive the message by it's id */
const getMessageUsers = (message_id, req) => (
    new Promise((resolve, reject) => {
        const getMessageUsersSQL = queries.getMessageUsers();
        conn.query(getMessageUsersSQL, [message_id], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve(data.map(user => user.user_id))
            }
        })
    })
)

/**add new message for the db, the user must be manager to be able to add new message,
 * when add success return the new message object with the generated id
 */
const addMessage = (message_title, message_content, sent_time, message_users, req) => (
    new Promise((resolve, reject) => {
        conn.beginTransaction(async err => {
            if (err) {
                reject(req.t('error'));
                return;
            }
            try {
                //now add the message and the recevires as teansaction
                const addMessage = queries.addMessage();
                const [addMessagePromise] = await conn.promise().query(addMessage, [message_title, message_content, sent_time, req.user.uId]);
                const message_id = addMessagePromise.insertId;

                const addUserPromises = [];
                message_users.forEach(userId => {
                    const sentToUserSQL = queries.sentMessageToUser();
                    addUserPromises.push(conn.promise().query(sentToUserSQL, [message_id, userId]))
                });

                Promise.all(addUserPromises);
                conn.commit(() => resolve({
                    message_title,
                    message_content,
                    sent_time,
                    message_id,
                    manager_id: req.user.uId
                }))
            } catch (e) {
                console.log(e);
                conn.rollback((err) => {
                    reject(req.t('error'))
                })
            }
        })
    })
);

/**update message content and title, first check if the user who want to update the message is the same user who publish the message */
const updateMessage = (message_id, message_title, message_content, req) => (
    new Promise((resolve, reject) => {
        const getMessageSQL = queries.getMessageById();
        conn.query(getMessageSQL, [message_id], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                if (data[0].manager_id !== req.user.uId) {
                    reject(req.t('notAuthorizied'));
                    return;
                }
                //now update the message
                const updateMessageSQL = queries.updateMessage();
                conn.query(updateMessageSQL, [message_title, message_content, message_id], (err1, data1) => {
                    if (err1) {
                        console.log(err1);
                        reject(req.t('error'));
                        return;
                    }
                    resolve();
                })
            }
        })
    })
);

/**delete a specific message from the db 
 * must add a check where the manager who sent the message can only delete the message*/
const deleteMessage = (message_id, req) => (
    new Promise((resolve, reject) => {
        const deleteMessageSQL = queries.deleteMessage();
        conn.query(deleteMessageSQL, [message_id], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve();
            }
        });
    })
);

module.exports = {
    getMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    getMessageUsers
}