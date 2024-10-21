const conn = require('../db');
const messages = require('../messages');
const queries = require('../queries');

/**
 * get sentences completion question for a student and a specific language: en, ar, he
 * @param {*} student_id 
 * @param {*} amount 
 * @param {*} lang 
 * @returns 
 */
const getSentencesCompletion = (student_id, amount, lang) => {
    return new Promise( (resolve, reject) => {
        const sql = queries.getSentenceCompletion(student_id, lang, amount);
        conn.query( sql, (err, data) => {
            if(err){
                console.log(err);
                reject(messages.ERR_SERVERR);
            }else{
                resolve(data);
            }
        })
    } )
};

/**
 * get sentences completion question for a student and a specific language: en, ar, he
 * @param {*} student_id 
 * @param {*} amount 
 * @param {*} lang 
 * @returns 
 */
const getFlashCards = (student_id, amount, lang) => {
  return new Promise( (resolve, reject) => {
      const sql = queries.getFlashCards(student_id, lang, amount);
      conn.query( sql, (err, data) => {
          if(err){
              console.log(err);
              reject(messages.ERR_SERVERR);
          }else{
              resolve(data);
          }
      })
  } )
}


const checkStudentAnswer = (sentence_id, word_id, student_id) => {
    return new Promise((resolve, reject) => {
      let correctAnswerId;
      let knows;
      let isCorrect;
  
      conn.beginTransaction(err => {
        if (err) {
          return reject("Begin Transaction error");
        }
        
        // Get the correct answer id
        const getSentenceWord = queries.getSentenceWord();
        conn.query(getSentenceWord, [sentence_id], (err, data) => {
          if (err) {
            console.log(err);
            return conn.rollback(() => {
              reject("Getting getSentenceWord failed", err);
            });
          } else {
            correctAnswerId = data;
            console.log(correctAnswerId);
            const matchingWord = correctAnswerId.find(obj => obj.word_id === word_id);
            if (matchingWord) {
              console.log("Word ID is present in the data");
              isCorrect = true;
            } else {
              console.log("Word ID is not present in the data");
              isCorrect = false;
            }
  
            // Check the previous answer of the student
            const getPrevStudentAnswer = queries.getPrevStudentAnswer();
            conn.query(getPrevStudentAnswer, [sentence_id, student_id], (err, data) => {
              if (err) {
                console.log(err);
                return conn.rollback(() => {
                  reject("Getting getPrevStudentAnswer failed", err);
                });
              } else {
                knows = data;
                const know = knows.map(obj => obj.know);
                prevAnswer = know[0]
                const updateStudentAnswer = queries.updateStudentAnswer();
                
                // Check if there is a need to change the answer
                // Check if the chosen answer is correct
                if ((matchingWord && !prevAnswer) || ( !matchingWord && prevAnswer)) {
                    // console.log("in if")
                  conn.query(updateStudentAnswer, [!prevAnswer, sentence_id], (err, data) => {
                    if (err) {
                      console.log(err);
                      return conn.rollback(() => {
                        reject("Getting updateStudentAnswer failed", err);
                      });
                    }
                    conn.commit(err => {
                      if (err) {
                        return conn.rollback(() => {
                          reject("Commit failed");
                        });
                      }
                      resolve([sentence_id,correctAnswerId,isCorrect]);
                    });
                  });
                } else {
                  // If no need to change the answer, resolve the promise
                  resolve([sentence_id,correctAnswerId,isCorrect]);
                }
              }
            });
          }
        });
      });
    });
  };  

module.exports = {
    getSentencesCompletion,
    checkStudentAnswer,
    getFlashCards
}