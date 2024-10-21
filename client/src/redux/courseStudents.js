import * as ActionTypes from './ActionTypes';

export const CourseStudents = (state = {
    isLoading: false,
    error: undefined,
    students: {}
}, action) => {
    switch( action.type ){
        case ActionTypes.LOADING_COURSE_STUDENTS:
            return {...state, isLoading: true, error: undefined, students: {}};

        case ActionTypes.ERROR_COURSE_STUDENTS:
            return {...state, isLoading: false, error: action.payload, students: {}};   

        case ActionTypes.ADD_COURSE_STUDENTS:
            return {...state, isLoading: false, error: undefined, students: action.payload}; 

        case ActionTypes.REGISTER_STUDNET:
            const addStudentArr = state.students.enrolled.slice();
            const removeStudentsFromNotEnrolled = state.students.notEnrolled.slice();

            action.payload.forEach(student_id => {
                const removeIndex = removeStudentsFromNotEnrolled.findIndex(student => student.id === student_id);
                addStudentArr.push( removeStudentsFromNotEnrolled[removeIndex] );
                removeStudentsFromNotEnrolled.splice(removeIndex, 1);
            })
            // addStudentArr.push( action.payload );
            return {...state, isLoading: false, error: undefined, students: {...state.students, enrolled:addStudentArr, notEnrolled: removeStudentsFromNotEnrolled}};    

        case ActionTypes.REMOVE_STUDENT_FROM_COURSE:
            const removeStudentArr = state.students.enrolled.slice();
            const toRemoveIndex = removeStudentArr.findIndex( student => student.id === action.payload );
            const moveStudentArr = state.students.notEnrolled.slice();
            if(toRemoveIndex !== -1){
                moveStudentArr.push( removeStudentArr[toRemoveIndex] );
                removeStudentArr.splice(toRemoveIndex, 1);
            }
            return { ...state, isLoading: false, error: undefined, students: {enrolled: removeStudentArr, notEnrolled: moveStudentArr} }

        default:
            return state;
    }
}