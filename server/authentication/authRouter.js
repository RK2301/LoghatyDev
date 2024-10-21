const router = require('express').Router();
const messages = require('../messages');
const authController = require('./authController');
const verifyAuth = require('./authMiddleware');

/**
 * Must return object with 2 fields
 * data-> the user data username,password, user_id, email, phone, role: teacher,manager, student
 * token-> the token creted by Json Web Token
 * if not success 401 or 500 for server internal error
 */
router.post('/login' , (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const remmember = req.body.remmember;
    const usernameCookie = req.cookies.rememmber;

    authController.logUser(username, password, usernameCookie ? true : false , (error, userData, token) => {
        if(error){
            if(error === messages.TOKEN_FAILED){
                res.status(500).send(messages.ERR_SERVERR);
            }else if(error === messages.UNAUTHORIZED){
                res.status(401).send(messages.UNAUTHORIZED);
            }else{
                res.status(500).send();
            }
        }else{
            //if user choose to rememmber then set a cookie for a week//
            if(remmember && !usernameCookie)
              res.cookie('rememmber', username, { secure: true ,sameSite: 'none' ,maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: false });

            res.status(201).send(JSON.stringify( {
                token:token,
                data: userData
            } ));
        }
    });
});

/**handle user request to reset the password, first check if the username or id is correct and exists
 * if not exists return error, else send for the user a verficition code of 4 digits
 */
router.post('/verificationCode' , (req,res) => {
    const {unique} = req.body;
    if( !unique )
      res.status(400).send( JSON.stringify({error: req.t('userNotFound')}) );
    else
      authController.verificationCode(req, res, unique);
      
});

router.post('/verifyVerificationCode', (req, res) => {
    const {unique, verificationCode} = req.body;

    if( !unique || !verificationCode)
      res.status(400).send( JSON.stringify({error: req.t('verificationCodeIncorrect')}) );

      authController.verifyVerificationCode(req, res, verificationCode, unique);
});

router.post('/resetPassword', verifyAuth, (req, res) => {
    const {password} = req.body;

    if(!password)
      res.status(400).send( JSON.stringify({error: req.t('required')}) );
    else
      authController.resetPassword(req, res, password);

})

module.exports = router;