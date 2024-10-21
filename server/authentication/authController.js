const messages = require('../messages');
const services = require('./authServices');

/**
 * log the user to the system, first call the logIn function in authServices 
 * to check username & password are correct
 * if yes then create token and  send back userData & token for the user
 * else send an error message with 401 status code or 500 
 * @param {*} username 
 * @param {*} password 
 * @param {*} cb callBack function from the router to response to the login request
 */
const logUser = (username, password, onlyUsername, cb) => {
    services.logIn(username, password, onlyUsername)
    .then(user => {
        const token = services.createJWT(user);
        if(token !== messages.TOKEN_FAILED){
            cb (undefined, user, token);
        }else{
            cb (messages.TOKEN_FAILED);
        }
    })
    .catch(err => {
        if( err === messages.UNAUTHORIZED){
            cb(messages.UNAUTHORIZED);
        }
        else {
         cb(err);
        }
    })
}

const verificationCode = (req, res, unique) => {
    services.verificationCode(unique, req)
    .then(email => res.status(201).send( JSON.stringify({email: email}) ))
    .catch(e => {
        if( e === req.t('error') )
          res.status(500).send( JSON.stringify({error: e}) )
        else
          res.status(400).send( JSON.stringify({error: e}) )
    })
}

const verifyVerificationCode = (req, res, verificationCode, unique) => {
    services.verifyVerificationCode(verificationCode, unique, req)
    .then(token => res.status(201).send( JSON.stringify({token: token}) ))
    .catch(e => {
        if( e === req.t('error') )
          res.status(500).send( JSON.stringify({error: e}) );
        else
        res.status(400).send( JSON.stringify({error: e}) );
    })
};

const resetPassword = (req, res, password) => {
    services.resetPassword(password, req)
    .then(success => res.status(201).send())
    .catch(e => res.status(500).send(JSON.stringify({error: e})))
}

const registerUser = (user_id, user_firstname, user_lastname, username, email, password, phone, birth_date, cb) => {
    services.registerUser(user_id, user_firstname, user_lastname, username, email, password, phone, birth_date)
    .then(user => {
        
    })
}



module.exports = {
    logUser,
    verificationCode,
    verifyVerificationCode,
    resetPassword
}