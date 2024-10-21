import * as Action_Types from './ActionTypes';
import * as Messages from './messages';

export const Language = (state = {
    isLoading: false,
    error: undefined,
    exercises: [],
    type: ''
}, action) => {
    switch (action.type) {
        case Action_Types.LOADING_EXERCISES:
            return { ...state, isLoading: true, error: undefined, exercises: [] };

        case Action_Types.ERROR_EXERCISES:
            return { ...state, isLoading: false, error: action.payload, exercises: [] };

        case Action_Types.ADD_EXERCISES:
            return { ...state, isLoading: false, error: undefined, exercises: formatQuestions(action.payload.questions, action.payload.type), type: action.payload.type };

        case Action_Types.RESET_EXERCISE:
            return { ...state, isLoading: false, error: undefined, exercises: [], type: '' }   

        default:
            return state;
    }

}

const formatQuestions = (exe, type) => {

    const toReturn = [];

    switch( type ){
        case Messages.SENTENCES_COMPLETION:
            console.log(`entered the sc case`);
            exe.forEach(q => {
                const find = toReturn.find( sentence => sentence.sentence_id === q.sentence_id );
                find ? find.words.push( { word_id: q.word_id, word_text: q.word_text } ) :
                toReturn.push( {
                    sentence_id: q.sentence_id,
                    sentence_text: q.sentence_text,
                    words: [ { word_id: q.word_id, word_text: q.word_text } ]
                } )
            });
            return toReturn;

         case Messages.FLASH_CARDS:
            exe.forEach( q => {
               const find = toReturn.find( question => question.word_id === q.word_id );
               find ? find.answers.push( {
                synonym_id: q.synonym_id,
                synonym_text: q.synonym_text
               } ) : 
               toReturn.push( {
                word_id: q.word_id,
                word_text: q.word_text,
                answers: [ { synonym_id: q.synonym_id, synonym_text: q.synonym_text } ]
               } );
            } );
            console.log(toReturn);
            return toReturn;
               

        default:
                
    }
    // console.log(toReturn);
}