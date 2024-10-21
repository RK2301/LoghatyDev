import * as Action_Types from './ActionTypes';

export const UpdAdd = (state = {
    isLoading: false,
    error: undefined,
    oprSuccessed: false
}, action) => {
    switch(action.type){
        case Action_Types.ADD_UPD_TEACHER_ERR:
            return { ...state, isLoading: false, error: action.payload, oprSuccessed: false }
        
        case Action_Types.ADD_UPD_TEACHER_LOADING:
            return { ...state, isLoading: true, error: undefined, oprSuccessed: false }
        
        case Action_Types.ADD_UPD_TEACHER_SUCCESSED:
            return { ...state, isLoading: false, error: undefined, oprSuccessed: true }
        
        default :
         return state;    
    }
}