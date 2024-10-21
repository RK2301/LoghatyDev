const messages = require('../messages');
const langController = require('../controllers/langController');

const router = require('express').Router();



router.get('/flash/:lang/:amount/:student_id', (req, res) => {
    try{
        const lang = req.params.lang
        const amount = parseInt(req.params.amount);
        const student_id = req.params.student_id;


        //send back words the student doesnt know 
        langController.getFlashCards(res, student_id, lang, amount);

    } catch {
        res.status(400).send();
    }

})

router.get('/:lang/:type/:amount/:student_id', (req, res) => {

    try{
        const lang = req.params.lang
        const type = req.params.type;
        const amount = parseInt(req.params.amount);
        const student_id = req.params.student_id;

        // console.log(`The type is ${type} and ${messages.SENTENCES_COMPLETION}`);

        switch( type ){
            case messages.SENTENCES_COMPLETION:
               return langController.getSentenceCompletion(res, student_id, lang, amount);

            case messages.FLASH_CARDS:
               return langController.getFlashCards(res, student_id, lang, amount);

            default:
                res.status(404).send();    
        }

    }catch(e) {
        res.status(400).send();
    }
});

router.post('/:sentence_id/:word_id/:student_id', (req, res) => {
    try{
        const sentence_id =  parseInt(req.params.sentence_id);
        const word_id = parseInt(req.params.word_id);
        const student_id = req.params.student_id

        langController.checkStudentAnswer(req, res, sentence_id, word_id, student_id);

        

    }catch(e) {
        res.status(400).send();
    }
})


module.exports = router;

// res.status(200).send( JSON.stringify( [
//     {
//         word_id:1,
//         word_text: 'Good',
//         answers: [
//             { 
//                 word_id: 2,
//                 word_text: 'Great'
//             },
//             {
//                 word_id: 3,
//                 word_text: 'Pleasant'
//             },
//             {
//                 word_id: 4,
//                 word_text: 'Marvelous'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     },
//     {
//         word_id:5,
//         word_text: 'Bad',
//         answers: [
//             { 
//                 word_id: 6,
//                 word_text: 'Burtal'
//             },
//             {
//                 word_id: 7,
//                 word_text: 'Annoying'
//             },
//             {
//                 word_id: 8,
//                 word_text: 'Evil'
//             }
//         ]
//     }
// ] ) );