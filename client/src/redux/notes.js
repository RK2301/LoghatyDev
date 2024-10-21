import * as Action_Types from './ActionTypes';

export const Notes = (state = {
    LoadingNotes: false,
    error: undefined,
    notes: [],
    id: ''
}, action) => {
    switch(action.type){
        case Action_Types.LOADING_NOTES:
            return { ...state, LoadingNotes: true, error: undefined, notes: [], id: action.payload };
         
        case Action_Types.ERROR_NOTES: 
             return { ...state, LoadingNotes: false, error: action.payload, notes: []};
        
        case Action_Types.ADD_NOTES: 
             return { ...state, LoadingNotes: false, error: undefined, notes: action.payload };
        
        case Action_Types.DELETE_NOTE: 
          const delArr = state.notes.slice();
          const delIndex = delArr.findIndex( note => note.id === action.payload.id );
          if( delIndex !== -1)
            delArr.splice(delIndex, 1);
         return { ...state, LoadingNotes: false, error: undefined, notes: delArr };

         case Action_Types.ADD_NOTE: 
         const addArr = state.notes.slice();
         addArr.unshift( action.payload );
         return { ...state, LoadingNotes: false, error: undefined, notes: addArr };

         case Action_Types.UPDATE_NOTE:
            const updArr = state.notes.slice();
            const updIndex = updArr.findIndex( note => note.note_id === action.payload.note_id );
            if( updIndex !== -1){
                updArr.splice(updIndex, 1, action.payload);
            }
            return { ...state, LoadingNotes: false, error: undefined, notes: updArr };

        default:
            return state;     

    }
}