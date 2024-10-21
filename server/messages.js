/**
 * This Object To Store Messages To Return Back To The Client Instead Of Each Time 
 * Writing A Different Message
 */
const messages = {
    NOT_FOUND: 'The Requested Resource Is Not Found',
    TOKEN_FAILED: 'Failed To Create A Token',
    UNAUTHORIZED: 'Unauthorized Please Send Valid Credentials',
    ERR_SERVERR: 'Error Occured At The Server Please Try Again',
    USERNAME_NOT_UNIQUE: 'User Name Sent Is Not Unique',
    USERNAME_UNIQUE: 'User Name Sent Is Unique',
    FOREIGN_KEY_FAIL: 'foreign key constraint fails',
    SENTENCES_COMPLETION: 'sc',
    FLASH_CARDS: 'fc'
}

module.exports = messages;