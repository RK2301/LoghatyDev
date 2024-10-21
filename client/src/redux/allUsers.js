/**reducer hold all users, for message sent modal */
import { act } from 'react-dom/test-utils';
import * as ActionTypes from './ActionTypes';

export const AllUsers = (state = {
    isLoading: false,
    error: undefined,
    users: []
}, action) => {
    switch(action.type){
        case ActionTypes.LOAD_ALL_USERS: 
          return { isLoading: true, error: undefined, users: []};

        case ActionTypes.ERROR_ALL_USERS:
            return {isLoading: false, error: action.payload, users: []};
            
        case ActionTypes.ADD_ALL_USERS:
            action.payload?.students.sort((s1, s2) => s1.class_id - s2.class_id)
            return {isLoading: false, error: undefined, users: action.payload};
            
            default:
                return state;
    }
}