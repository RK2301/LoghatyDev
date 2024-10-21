import { formatDateTime } from '../components/services';
import * as Action_Types from './ActionTypes';

export const SubmitionHw = (state = {
    isLoading: false,
    error: undefined,
    submitions: {
        submitions: [],
        submitFiles: []
    }
}, action) => {
    switch (action.type) {
        case Action_Types.LOADING_SUBMITIONS:
            return { ...state, isLoading: true, error: undefined, submitions: {} };

        case Action_Types.ERROR_SUBMITIONS:
            return { ...state, isLoading: false, error: action.payload, submitions: {} };

        case Action_Types.ADD_SUBMITIONS:
            return { ...state, isLoading: false, error: undefined, submitions: getSubmitions(action.payload) };

        case Action_Types.ADD_SUBMIT:
            const submit_data = action.payload.submitData;
            const submit_files = action.payload.submit_files;

            const add_submit_arr = state.submitions.submitions.slice();
            const add_files_arr = state.submitions.submitFiles.slice();

            add_submit_arr.push(submit_data);
            add_files_arr.push(submit_files);

            return { ...state, submitions: { submitions: [submit_data], submitFiles: submit_files } };

        case Action_Types.UPDATE_SUBMIT:
            const copy_files = state.submitions.submitFiles.slice();
            return { ...state, submitions: { ...state.submitions, submitFiles: copy_files.concat(action.payload) } };

        case Action_Types.DELETE_HOMEWORK_FILE:
            const delete_files_arr = state.submitions.submitFiles.slice();
            const deleteIndex = delete_files_arr.findIndex(file => file.file_id === action.payload);
            if (deleteIndex !== -1)
                delete_files_arr.splice(deleteIndex, 1);

            return { ...state, submitions: { ...state.submitions, submitFiles: delete_files_arr } };

        case Action_Types.GIVE_FEEDBACK:
            const feedbackData = action.payload;
            const submittionsArr = state.submitions.submitions.slice();

            let submitIndex = submittionsArr.findIndex(s => s.student_id === feedbackData.student_id);
            if (submitIndex !== -1) {
                const submit = { ...submittionsArr[submitIndex] };
                submit.grade = feedbackData.grade;
                submit.submit_note = feedbackData.submit_note;

                submittionsArr.splice(submitIndex, 1, submit);
            }

            return { ...state, submitions: { ...state.submitions, submitions: submittionsArr } };

        case Action_Types.DELETE_SUBMITTION:
            return {...state, submitions: {submitions: [], submitFiles: []}}

        default:
            return state;
    }
}

const getSubmitions = (result) => {
    const toReturn = {
        submitions: [],
        submitFiles: []
    }

    result.forEach(row => {
        if (!toReturn.submitions.filter(submtion => submtion.student_id === row.student_id)[0])
            toReturn.submitions.push({
                student_id: row.student_id,
                upload_time: formatDateTime(row.upload_time),
                grade: row.grade,
                submit_note: row.submit_note,
                full_name: row.firstname + ' ' + row.lastname,
            });

        if (!toReturn.submitFiles.filter(file => file.file_id === row.file_id && file.student_id === row.student_id)[0])
            toReturn.submitFiles.push({
                file_id: row.file_id,
                file_name: row.file_name,
                student_id: row.student_id
            })
    })

    return toReturn;
}