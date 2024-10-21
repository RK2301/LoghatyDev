import * as ActionTypes from './ActionTypes';

export const Top5Teachers = (state = {
    isLoading: false,
    error: undefined,
    teacehrs: []
}, action) => {
    switch(action.type){
        case ActionTypes.LOADING_TOP5_TEACHERS:
             return {isLoading: true, error: undefined, teacehrs: []}

        case ActionTypes.ERROR_TOP5_TEACEHRS:
             return {isLoading: false, error: action.payload, teacehrs: []};
             
        case ActionTypes.ADD_TOP5_TEACEHRS:
            return {isLoading: false, error: undefined, teacehrs: action.payload};
            
            default:
                 return state;
    }
}