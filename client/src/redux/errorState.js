import * as ActionTypes from './ActionTypes';

export const ErrorState = (state = {
    error: false,
    errorMessage: undefined,
    tryAgain: false,
    tryAgainFunction: undefined
}, action) => {
    switch(action.type){
        case ActionTypes.ERROR_STATE: 
         return { ...state, error: true, errorMessage: action.payload.errorMessage, tryAgain: action.payload.tryAgain,
        tryAgainFunction: action.payload.tryAgainFunction }
        
        case ActionTypes.RESET_ERROR_STATE:
            return { ...state, error: false, errorMessage: undefined, tryAgain: false, tryAgainFunction: undefined }

            default:
                return state;
    }
}