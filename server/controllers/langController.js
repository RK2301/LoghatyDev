const langServices = require('../services/langServices');

const getSentenceCompletion = (res, student_id, lang, amount) => {

    langServices.getSentencesCompletion(student_id, amount, lang)
    .then( sc => res.status(200).send( JSON.stringify( sc ) ) )
    .catch( error => res.status(500).send() );
}

const checkStudentAnswer = (req, res, sentence_id, word_id, student_id) => {
    console.log(`controller to check answer called \n`);
    langServices.checkStudentAnswer(sentence_id, word_id, student_id)
    .then(info => {
        res.status(200).send(JSON.stringify(info));
    })
    .catch(err => res.status(500).send(err))
}

const getFlashCards = (res, student_id, lang, amount) => {

    langServices.getFlashCards(student_id, amount, lang)
    .then( sc => res.status(200).send( JSON.stringify( sc ) ) )
    .catch( error => res.status(500).send() );
}

module.exports = {
    getSentenceCompletion,
    checkStudentAnswer,
    getFlashCards
}