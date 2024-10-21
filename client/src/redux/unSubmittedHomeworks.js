import * as ActionTypes from './ActionTypes';

export const UnSubmittedHomeworks = (state = {
    isLoading: false,
    error: undefined,
    homeworks: []
}, action) => {
    switch (action.type) {
        case ActionTypes.LOADING_UNSUBMITTED_HOMEWORKS:
            return { isLoading: true, error: undefined, homeworks: [] }

        case ActionTypes.ERROR_UNSUBMITTED_HOMEWORKS:
            return { isLoading: false, error: action.payload, homeworks: [] }

        case ActionTypes.ADD_UNSUBMITTED_HOMEWORKS:
            return { isLoading: false, error: undefined, homeworks: action.payload }

            default:
                return state;
    }
}