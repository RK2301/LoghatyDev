import * as ActionTypes from './ActionTypes';

export const Subjects = (state = {
    isLoading: false,
    error: undefined,
    subjects: []
}, action) => {
    switch (action.type) {
        case ActionTypes.LOADING_SUBJECTS:
            return { ...state, isLoading: true, error: null, subjects: [] };

        case ActionTypes.ERROR_SUBJECTS:
            return { ...state, isLoading: false, error: action.payload, subjects: [] };

        case ActionTypes.ADD_SUBJECTS:
            return { ...state, isLoading: false, error: null, subjects: action.payload };

        case ActionTypes.DELETE_SUBJECT:
            const deleteArr = state.subjects.slice();
            const deleteIndex = deleteArr.findIndex( subject => subject.id === action.payload );
            if(deleteIndex !== -1)
             deleteArr.splice(deleteIndex, 1);

            return { ...state, isLoading: false, error: null, subjects: deleteArr };

        case ActionTypes.ADD_SUBJECT:
            const toAddArr = state.subjects.slice();  
            toAddArr.push( action.payload );
            return { ...state, isLoading: false, error: null, subjects: toAddArr };

        case ActionTypes.UPDATE_SUBJECT:
            const updateArr = state.subjects.slice();
            const updateIndex = updateArr.findIndex( subject => subject.id === action.payload.id );
            if( updateIndex !== -1 )
              updateArr.splice(updateIndex, 1, action.payload)
            return { ...state, isLoading: false, error: null, subjects: updateArr };

        default:
            return state;
    }
}