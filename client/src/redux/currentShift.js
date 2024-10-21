import * as Action_Types from './ActionTypes';

export const CurrentShift = (state = {
    isLoading: false,
    error: false,
    shift: {}
}, action) => {
    switch (action.type) {
        case Action_Types.LOADING_CURRENT_SHIFT:
            return { ...state, isLoading: true, error: undefined, shift: {} };

        case Action_Types.ERROR_CURRENT_SHIFT:
            return { ...state, isLoading: false, error: action.payload, shift: {} };

        case Action_Types.ADD_CURRENT_SHIFT:
            return { ...state, isLoading: false, error: undefined, shift: action.payload || {} };

        case Action_Types.RESET_CURRENT_SHIFT:
            return { ...state, isLoading: false, error: undefined, shift: {} };

        case Action_Types.LOADING_ADD_END_SHIFT:
            return { ...state, isLoading: true, error: undefined, shift: state.shift };

        case Action_Types.ADD_NEW_SHIFT:
            return { ...state, isLoading: false, error: undefined, shift: 
                { 
                     start_shift: action.payload.start_shift,
                     start_latitude: action.payload.start_latitude, 
                     start_longitude: action.payload.start_longitude,
                     notify: action.payload.notify
              } };

        case Action_Types.END_SHIFT:
            console.log(action.payload);
            return { ...state, isLoading: false, error: undefined, shift: {
                 ...state.shift,
                  end_shift: action.payload.end_shift,
                  end_longitude: action.payload.end_longitude,
                  end_latitude: action.payload.end_latitude
                } };

        case Action_Types.SHIFT_NOTE: 
          return {...state, shift: {...state.shift, shift_note: action.payload}};        


        case Action_Types.ERROR_ADD_END_SHIFT:
            return { ...state, isLoading: false, error: action.payload, shift: state.shift };

        default:
            return state;

    }
}
