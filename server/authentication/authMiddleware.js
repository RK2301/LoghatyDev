const config = require("../config");
const messages = require("../messages");
const JWT = require('jsonwebtoken');

/**
 * An function to verify the token send by the client, is created by the server , and can be used to get details 
 * about the client, 
 * if the token is valid next middleware will handle the request, else an 401 status code return to the client
 */
const verifyAuth = (req , res ,next) => {

    const token = req.headers['authorization'];
    if(!token){
        console.log(`user unauthroized\n`);

        res.status(401).send(messages.UNAUTHORIZED);
    }else{
        try{
            const decode = JWT.verify(token, config.AUTH_SECRET);
            req.user = decode;
            //send the request to be handled by the next middleware
            next();
        }catch(err) {
            console.log('not authorizied');
            res.status(401).send(JSON.stringify( {error:req.t('notAuthorizied')} ));
        }
    }
}

module.exports = verifyAuth;