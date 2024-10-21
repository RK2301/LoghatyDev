import * as Action_Types from './ActionTypes';

export const Courses = (state = {
    isLoading: false,
    error: undefined,
    courses: []
}, action) => {
    switch (action.type) {
        case Action_Types.LOADING_COURSES:
            return { ...state, isLoading: true, error: undefined, courses: [] };

        case Action_Types.ERROR_COURSES:
            return { ...state, isLoading: false, error: action.payload, courses: [] };

        case Action_Types.ADD_COURSES:
            return { ...state, isLoading: false, error: undefined, courses: action.payload };

        case Action_Types.ADD_COURSE:
            const addARR = state.courses.slice();
            addARR.unshift(action.payload);
            return { ...state, isLoading: false, error: undefined, courses: addARR };

        case Action_Types.DELETE_COURSE:
            const delARR = state.courses.slice();
            const delIndex = delARR.findIndex( course => course.course_id === action.payload );
            if(delIndex !== -1){
                delARR.splice(delIndex, 1);
            }
            return { ...state, isLoading: false, error: undefined, courses:delARR };

        case Action_Types.UPDATE_COURSE:
            const updARR = state.courses.slice();
            const updIndex = updARR.findIndex( course => course.course_id === action.payload.course_id );
            updARR.splice(updIndex, 1, action.payload);
            return { ...state, isLoading: false, error: undefined, courses: updARR };
          
        default: 
            return state;    
    }

}