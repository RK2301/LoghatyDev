const conn = require('../db');
const JWT = require('jsonwebtoken');
const config = require('../config');
const messages = require('../messages');
const queries = require('../queries');
const transporter = require('../nodeMailerConfig');
const { formatDateAndTime } = require('../services/generalServices');

/**
 * This Function will check the credentials the client send for the server for login
 * @param {*} username
 * @param {*} password 
 * @returns user infon if successed else error message
 */
const logIn = (username, password, onlyUsername) => {
    return new Promise((resolve, reject) => {
        const sql = queries.logIn(username, password, onlyUsername);
        conn.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (result[0]) {
                    resolve(result[0]);
                } else {
                    reject(messages.UNAUTHORIZED);
                }
            }
        })
    });
}


const registerUser = (user_id, user_firstname, user_lastname, username, email, password, phone, birth_date) => {
    return new Promise((resolve, reject) => {
        const q = queries.registerUser(user_id, user_firstname, user_lastname, username, email, password, phone, birth_date);
        conn.query(q, (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result[0]) {
                    resolve(result[0])
                } else {
                    reject(messages)
                }

            }
        })
    })
}

/**
 * Create JWT for a user who want to login to the system , so in the next req the client will 
 * send the key which help to identify the client without the need to each time to send the credentials
 * @param {*} user object contain user information
 * @param forPass boolean indicate if to create temporary token to reset the password (for 5 min)
 * @returns JWT key which identify the user Or err message if the create toke failed
 */
const createJWT = (user, forPass) => {
    //data identify the user
    if (user.isManager !== null && user.isManager == true) {
        user.role = 'm'
    } else if (user.isManager !== null && user.isManager == false) {
        user.role = 't'
    } else {
        user.role = 's'
    }
    const payload = forPass ? {
        email: user.email,
        unique: user.unique
    } : {
        role: user.role,
        uId: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
    };

    try {
        const token = JWT.sign(payload, config.AUTH_SECRET, {
            expiresIn: forPass ? 300 : 7200
        });
        return token;

    } catch (err) {
        return messages.TOKEN_FAILED;
    }
}

/**for a user want verification code, check if the email exists, then make a random 4 digits number, save it to db
 * , and send the number to the db
 */
const verificationCode = (unique, req) => (
    new Promise(async (resolve, reject) => {
        //first check if email found for the unique username or id
        try {
            const getUserEmailSQL = queries.getUserEmail();
            const [userEmailArray] = await conn.promise().query(getUserEmailSQL, [unique, unique]);

            if (userEmailArray.length === 0 || !userEmailArray[0].email) {
                const err = new Error();
                err.runMessage = req.t('userNotFound');
            }

            const email = userEmailArray[0].email;

            //now create 4 digits random number and send it to the client
            const verificationCode = Math.floor(1000 + Math.random() * 8999);

            //save to the db
            const addVerificationCodeSQL = queries.addUserVerificationCode();
            await conn.promise().query(addVerificationCodeSQL, [verificationCode, formatDateAndTime(new Date()), unique, unique]);

            //now send mail and send back succes message
            const mailOptions = {
                from: 'loghaty2024@outlook.com',
                to: email,
                subject: req.t('verificationCode'),
                text:  req.t('verificationCodeEmail', {verificationCode: verificationCode}) ,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    reject(req.t('error'));
                } else {
                    resolve(email);
                }
            })

        } catch (e) {
            console.log(e);
            let msg = req.t('error');
            if (e.runMessage)
                msg = e.runMessage;

            reject(msg);
        }
    })
);

/**for a user check if the entered verification code is correct, if code is correct then return a token to access reset password */
const verifyVerificationCode = (userVerificationCode, unique, req) => (
    new Promise((resolve, reject) => {

        const getUserVerificationCode = queries.getUserEmail();
        conn.query(getUserVerificationCode, [unique, unique], (err, data) => {
            if (err) {
                console.log(e);
                reject(req.t('error'));
            } else {
                //check if verification code exists and sent before at most 15min
                if (data.length === 0 || !data[0].verification_code) {
                    reject(req.t('userNotFound'));
                    return;
                } else {
                    const verficitionCode = data[0].verification_code;
                    const sent_time = data[0].sent_time;

                    if (verficitionCode !== userVerificationCode) {
                        reject(req.t('errorVerificationCode'));
                        return;
                    }

                    const timeDiff = new Date() - new Date(formatDateAndTime(sent_time));
                    const min = timeDiff / (1000 * 60);

                    if (min > 15) {
                        reject(req.t('errorVerificationCode'));
                        return;
                    }

                    //create a jwt to send back to the user
                    const token = createJWT({
                        email: data[0].email,
                        unique: unique
                    }, true);

                    if (token === messages.TOKEN_FAILED)
                        reject(req.t('error'));
                    else
                        resolve(token);

                }
            }
        });
    })
);

/**reset user password for a new one */
const resetPassword = (password, req) => 
     new Promise((resolve, reject) => {
        const resetPasswordSQL = queries.setPassword();
        conn.query(resetPasswordSQL, [password, req.user.unique, req.user.unique], (err, data) => {
            if(err){
                console.log(err);
                reject(req.t('error'));
            }else{
                resolve();
            }
        })
     });

module.exports = {
    logIn,
    registerUser,
    createJWT,
    verificationCode,
    verifyVerificationCode,
    resetPassword
}