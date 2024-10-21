import * as Action_Types from './ActionTypes';

export const Operation = (state = {
    isLoading: false,
    error: undefined,
    oprSuccessed: false,
    successMsg: ''
}, action) => {
    switch (action.type) {
        case Action_Types.IS_LOADING:
            return { ...state, isLoading: true, error: undefined, oprSuccessed: false, successMsg: '' };

        case Action_Types.ERROR_OCCURED:
            return { ...state, isLoading: false, error: action.payload, oprSuccessed: false, successMsg: '' };

        case Action_Types.OPR_SUCCESS:
            return { ...state, isLoading: false, error: undefined, oprSuccessed: true, successMsg: action.payload };

        case Action_Types.RESET_STATE: 
        return { ...state, isLoading:false, error: undefined, oprSuccessed: false, successMsg: '' }    

        default:
            return state;
    }
}