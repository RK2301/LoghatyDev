import * as Action_Types from './ActionTypes';

export const QuestionAnswer = (state = {
    isLoading: false,
    error: undefined,
    correctAns: undefined
}, action) => {
    switch (action.type) {
        case Action_Types.LOADING_ANSWER:
            return { ...state, isLoading: true, error: undefined, correctAns: undefined };

        case Action_Types.ERROR_ANSWER:
            return { ...state, isLoading: false, error: action.payload, correctAns: undefined };

        case Action_Types.ADD_ANSWER:
            return { ...state, isLoading: false, error: undefined, correctAns: action.payload };

        case Action_Types.RESET_ANSWER:
            return { ...state, isLoading: false, error: undefined, correctAns: undefined };

        default:
            return state;    
    }
}