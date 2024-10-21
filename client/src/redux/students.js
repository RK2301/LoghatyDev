import * as Action_Types from './ActionTypes';

export const Students = (state = {
    isLoading: false,
    error: undefined,
    students: []
}, action) => {
    switch (action.type) {
        case Action_Types.LOADING_STUDENTS:
            return { ...state, isLoading: true, error: undefined, students: [] };

        case Action_Types.ERROR_STUDENTS:
            return { ...state, isLoading: false, error: action.payload, students: [] };

        case Action_Types.ADD_STUDENTS:
            return { ...state, isLoading: false, error: undefined, students: action.payload };

        case Action_Types.ADD_STUDENT:
            const toAddArr = state.students.slice();
            toAddArr.unshift(action.payload);
            return { ...state, isLoading: false, error: undefined, students: toAddArr };

        case Action_Types.DELETE_STUDENT:
            const deleteArr = state.students.slice();
            const deleteIndex = deleteArr.findIndex(std => std.id === action.payload.id);
            if(deleteIndex !== -1)
               deleteArr.splice(deleteIndex, 1);
            return { ...state, isLoading: false, error: undefined, students: deleteArr };

        case Action_Types.UPDATE_STUDENT:
            const updateArr = state.students.slice();
            const updateIndex = updateArr.findIndex(std => std.id === action.payload.id);
            if(updateIndex !== -1)
            updateArr.splice(updateIndex, 1, action.payload);
            return { ...state, isLoading: false, error: undefined, students: updateArr };

        default:
            return state;
    }
}