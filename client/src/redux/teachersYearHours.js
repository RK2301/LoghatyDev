import * as ActionTypes from './ActionTypes';

export const TeachersYearHours = (state = {
    isLoading: false,
    error: undefined,
    yearHours: [],
    teachers: []
}, action) => {
    switch (action.type) {
        case ActionTypes.LOADING_TEACHERS_YEAR_HOURS:
            return { isLoading: true, error: undefined, yearHours: [], teachers: [] }

        case ActionTypes.ERROR_TEACHERS_YEAR_HOURS:
            return { isLoading: false, error: action.payload, yearHours: [], teachers: [] };

        case ActionTypes.ADD_TEACHERS_YEAR_HOURS:
            const teachersArr = action.payload.map( teacherData => ({
                id: teacherData.id,
                fullname: teacherData.fullname
            }));
            return { isLoading: false, error: false, yearHours: action.payload, teachers: teachersArr}

        default:
            return state;
    }
}