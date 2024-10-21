import * as ActionTypes from './ActionTypes';

export const connection = (state = {
    connected: true
}, action) => {
    switch(action.type){
        case ActionTypes.CONNECTION_STATUS:
            console.log(`called with value: ${action.payload}`);
            
            return { ...state, connected: action.payload}
        default:
            return state
    }
}

