import * as ActionTypes from './ActionTypes';

export const ResetPassword = (state = {
    isLoading: false,
    error: undefined,
    requestCode: false,
    verifyCode: false,
    resetPassword: false,
    token: ''
}, action) => {
    switch (action.type) {
        case ActionTypes.LOADING_RESET_PASSWORD:
            return { ...state, isLoading: true, error: undefined };

        case ActionTypes.ERROR_RESET_PASSWORD:
            return { ...state, isLoading: false, error: action.payload };

        case ActionTypes.REQUEST_CODE_SUCCESS:
            return { ...state, isLoading: false, error: undefined, requestCode: true };

        case ActionTypes.VERIFY_CODE_SUCCESS:
            return { ...state, isLoading: false, error: undefined, verifyCode: true, token: action.payload };

        case ActionTypes.RESET_PASSWORD_SUCCESS:
            return { ...state, isLoading: false, resetPassword: true };

        case ActionTypes.RESET_PASSWORD_STATE:
            return {
                isLoading: false,
                error: undefined,
                requestCode: false,
                verifyCode: false,
                resetPassword: false,
                token: ''
            };

        default:
              return state;
    }
}