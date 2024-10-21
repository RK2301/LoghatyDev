import * as ActionTypes from './ActionTypes';

export const AddCourse = (state = {
    isError: false,
    errorMsg: undefined,
    course_meetings: [],
    teachers: []
}, action) => {
    switch (action.type) {
        case ActionTypes.ADD_COURSE_METTINGS:
            return { ...state, isError: state.isError, errorMsg: state.errorMsg, course_meetings: action.payload, teachers: state.teachers };

        case ActionTypes.ADD_TEACHERS_COURSE:
            return { ...state, isError: state.isError, errorMsg: state.errorMsg, course_meetings: state.course_meetings, teachers: action.payload };

        case ActionTypes.ERROR_ADD_COURSE:
            return { ...state, isError: true, errorMsg: action.payload, course_meetings: state.course_meetings, teachers: state.teachers };

            default:
                return state;
   
    }
}