import { t } from 'i18next';
import * as Action_Types from './ActionTypes';
import { authURl, baseUrl, courseDetailURL, coursesURL, messageURL, studentsURL, subjectsURL, teacherURL, userURL } from './config';
import * as MESSAGES from './messages';
import axiosInstance from './axiosServices';
import fetch from 'cross-fetch';

const axios = axiosInstance;

/******************Action to change connection status************* */
export const connection_status = (status) => ({
    type: Action_Types.CONNECTION_STATUS,
    payload: status
})

/***************Actions for login**************** */
export const login = () => ({
    type: Action_Types.LOG_IN_LOADING
});

export const failLogIn = (err) => ({
    type: Action_Types.LOG_IN_FAILED,
    payload: err
});

export const sucessLogIn = (userInfo) => ({
    type: Action_Types.LOG_IN_SUCCESS,
    payload: userInfo
});

export const logout = () => ({
    type: Action_Types.LOG_OUT
});

/**
 * make api call to log the user to the app
 * @param {*} username 
 * @param {*} password 
 * @param {*} setSubmitting function to able login button to be clickable after getting response
 * @returns 
 */
export const logInUser = (username, password, remmember, setSubmitting) => (dispatch) => {

    dispatch(login());

    if (!(username || password)) {
        dispatch(failLogIn(t('logInIncorrect')));
    } else {
        axios.post(authURl + 'login', JSON.stringify({
            username: username,
            password: password,
            remmember: remmember
        }), {
            headers: {
                'Content-type': 'application/json',
            },
            withCredentials: true
        })
            .then(response => response.data)
            .then(userData => {
                dispatch(sucessLogIn(userData));
            })
            .catch(err => {
                let msg = err.message;

                if (err?.response) {
                    if (err.response.status >= 400 && err.response.status < 500)
                        msg = t('logInIncorrect');
                    else
                        msg = t('error')

                }
                dispatch(failLogIn(''));
                dispatch(error_state({ msg: msg }))
            })
            .finally(() => {
                if (setSubmitting)
                    setSubmitting(false);
            })
    }
}

/**for user with a cookie make api call to get token using username stored in the cookie */
export const logUserWithCookies = (username) => dispacth => {

    dispacth(loading());

    axios.post(authURl + 'login', JSON.stringify({
        username: username,
    }), {
        headers: {
            'Content-type': 'application/json',
        },
        withCredentials: true
    })
        .then(response => response.data)
        .then(userData => {
            dispacth(sucessLogIn(userData));
            dispacth(reset_state());
        })
        .catch(err => {
            let msg = err.message;

            if (err?.response) {
                if (err.response.status >= 400 && err.response.status < 500)
                    msg = t('logInIncorrect');
                else
                    msg = t('error')

            }
            dispacth(error(msg));
        })
}

/****************Actions for reset password************** */

const loading_reset_password = () => ({
    type: Action_Types.LOADING_RESET_PASSWORD
});

const error_reset_password = (error) => ({
    type: Action_Types.ERROR_RESET_PASSWORD,
    payload: error
});

const success_requrest_code = () => ({
    type: Action_Types.REQUEST_CODE_SUCCESS
});

const verify_code_success = (token) => ({
    type: Action_Types.VERIFY_CODE_SUCCESS,
    payload: token
});

const reset_password_success = () => ({
    type: Action_Types.RESET_PASSWORD_SUCCESS
});

export const reset_password_state = () => ({
    type: Action_Types.RESET_PASSWORD_STATE
});

/**make api call to request a verification code to reset password */
export const requestVerificationCode = (unique) => dispacth => {

    return new Promise((resolve, reject) => {

        dispacth(loading());

        axios.post(authURl + 'verificationCode', JSON.stringify({ unique }), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => { dispacth(success_requrest_code()); resolve(response.data.email) })
            .catch(err => {
                let msg = err.message;

                if (err.response?.data.error) {
                    msg = err.response.data.error;
                }
                dispacth(error_state({ msg: msg }));
                reject()
            })
            .finally(() => dispacth(reset_state()))

    })
}

/**make api call to verify the verification code the user entered, if success then the response will cotain short-term token
 * to reset the password
 */
export const verifyVerificationCode = (verificationCode, unique) => dispacth => {

    return new Promise((resolve, reject) => {

        dispacth(loading());

        axios.post(authURl + 'verifyVerificationCode', JSON.stringify({ verificationCode: verificationCode, unique: unique }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.data.token)
            .then(token => { dispacth(verify_code_success(token)); resolve(token) })
            .catch(err => {
                let msg = err.message;

                if (err.response?.data.error) {
                    msg = err.response.data.error;
                }
                dispacth(error_state({ msg }));
                reject();
            })
            .finally(() => dispacth(reset_state()))

    })
}

/**make a api call to reset password for a client */
export const resetPassword = (password, token) => dispatch => {

    return new Promise((resolve, reject) => {
        dispatch(loading());

        fetch(authURl + 'resetPassword', {
            method: 'post',
            body: JSON.stringify({ password: password }),
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        })
            .then(async (response) => {
                if (response.ok) {
                    dispatch(reset_password_success());
                    resolve();
                } else {
                    const error = await response.json();
                    throw new Error(error);
                }
            })
            .catch(e => {
                dispatch(error_state({ msg: t('error') }));
                reject()
            })
            .finally(() => dispatch(reset_state()));

        // axios.post(authURl + 'resetPassword', JSON.stringify({ password: password }), {
        //     headers: {
        //         'Authorization': token,
        //         'Content-Type': 'application/json'
        //     }
        // })
        //     .then(success => { dispatch(reset_password_success()); resolve() })
        //     .catch(err => {
        //         let msg = err.message;

        //         if (err.response?.data.error) {
        //             msg = err.response.data.error;
        //         }
        //         dispatch(error_state({ msg }));
        //         reject()
        //     })
        // .finally(() => dispatch(reset_state()))
    })

}

/***********************Actions For Basic Opeartion************** */
const loading = () => ({
    type: Action_Types.IS_LOADING
})

const error = (error) => ({
    type: Action_Types.ERROR_OCCURED,
    payload: error
})

const oprSuccessed = (msg) => ({
    type: Action_Types.OPR_SUCCESS,
    payload: msg
})

export const reset_state = () => ({
    type: Action_Types.RESET_STATE
})

/*****************Actions for teachers****************** */
const loadTeachers = () => ({
    type: Action_Types.LOADING_TEACHERS
});

const addTeachers = (teachers) => ({
    type: Action_Types.ADD_TEACHERS,
    payload: teachers
});

const errorLoadTeachers = (err) => ({
    type: Action_Types.ERR_LOAD_TEACHERS,
    payload: err
});

export const getTeachers = () => (dispatch) => {

    dispatch(loadTeachers());

    axios(baseUrl + 'teachers', {
        method: 'GET'
    })
        .then(res => res.data)
        .then(teachers => dispatch(addTeachers(teachers)))
        .catch(err => {
            let msg = err.message;

            if (msg.response?.data.error)
                msg = err.response.data.error;

            dispatch(errorLoadTeachers(err))
        });
}

/**make api call to print the teachers data in pdf file */
export const printTeachers = () => dispacth => {

    axios({
        method: 'GET',
        url: `${teacherURL}print`,
        responseType: 'blob',
    })
        .then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data], { type: res.data.type }));
            const link = document.createElement('a');
            link.href = url;

            link.setAttribute('download', 'teachers');
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch((err) => {
            console.log(err);
            dispacth(error_state({ msg: t('error') }));
        })
}

export const refreshTeachers = () => ({
    type: Action_Types.REFRESH_TEACHERS
})

export const checkUsername = (token, username) => (dispatch) => {
    return new Promise((resolve, reject) => {

        axios(userURL + 'unique', {
            method: 'POST',
            data: JSON.stringify({
                username: username
            }),
            headers: {
                'content-type': 'application/json',
            }
        })
            .then(response => {
                if (response.status === 201) {
                    return response.data;
                }
            })
            .then(user => {
                if (!user.exists) {
                    resolve(true)
                } else {
                    reject(t('username-exists'))
                }
            })
            .catch(err => {
                console.log(err);
                reject(t('error'));
            })
    })
}



/**************Actions For Update\ Add Teacher ***************/

const add_upd_teacher_loading = () => ({
    type: Action_Types.ADD_UPD_TEACHER_LOADING
});

const add_upd_teacher_error = (err) => ({
    type: Action_Types.ADD_UPD_TEACHER_ERR,
    payload: err
});

const add_upd_teacher_success = () => ({
    type: Action_Types.ADD_UPD_TEACHER_SUCCESSED
});

const add_new_teacher = (teacher) => ({
    type: Action_Types.ADD_NEW_TEACHER,
    payload: teacher
})

const upd_teacher = (teacher) => ({
    type: Action_Types.UPD_TEACHER,
    payload: teacher
})

/**
 * make an api call for the server to update or delete a teacher
 * @param {*} teacher details to be added or updated
 * @param {*} token valid token for server
 * @param {*} changeAddUpd to change the state of the component to render an appropirate massege
 * @param {*} setSubmitting to able submit button to be clicked after response form the api
 * @returns void
 */
export const add_upd_teacher = (teacher, token, changeAddUpd, setSubmitting
    , restForm, operation) => (dispatch) => {

        dispatch(loading());

        let url = operation === 'ADD' ? baseUrl + 'teachers' : baseUrl + `teachers/${teacher.id}`;
        let method = operation === 'ADD' ? 'POST' : 'PUT';

        axios(url, {
            method: method,
            data: JSON.stringify(teacher),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.data)
            .then(response => {
                const msg = operation === 'ADD' ? t('addTeacherSuccess') : t('updateTeacherSuccess')
                dispatch(oprSuccessed(msg))

                if (operation === 'ADD')
                    dispatch(add_new_teacher(response));
                else
                    dispatch(upd_teacher(response));
            })
            .catch(err => {
                let msg = err.response?.data?.error || err.message;
                if (err.response && err.response.data?.error && err.response.data.error.split(' ')[0] === 'Duplicate') {
                    msg = getErrorMsg(err.response.data.split(' ')[1]);
                }
                dispatch(error(msg));
            })
            .finally(() => setSubmitting(false))
    }

/**make api request to get teachers data as  id, firstname, lastname.
 * return a promise while resolve return the teachers as array
 */
export const getTeachersForShiftReport = () => dispatch => {
    dispatch(loadTeachers());

    axios.get(teacherURL + 'courseTeachers')
        .then(teachers => { dispatch(addTeachers(teachers.data)) })
        .catch(error => {
            console.log(error);
            let errorMessage = error.message
            if (error.response?.data) {
                //error from server
                errorMessage = error.response.data.error
            }
            dispatch(errorLoadTeachers(''))
            dispatch(error_state({
                errorMessage: errorMessage,
            }));
        })
}


/**
 * reset the operation state if an error found, 
 * called after the modal been closed to reset the messages
 * @returns 
 */
export const reset_after_error = () => (dispatch, getState) => {
    // console.log(getState());
    const currentState = getState();
    if (currentState.operation.error) {
        dispatch(reset_state());
    }
}


/*************************Action For Delete Teacher********************** */
const deleteTeacherAction = (id) => ({
    type: Action_Types.DELETE_TEACHER,
    payload: id
});

/**
 * make api call for the server to delete the given teacherID
 * if an error occured while delete the teacher then an appropirate message will dispatch to the store
 * @param {*} teacherID 
 * @param {*} token 
 */
export const deleteTeacher = (teacherID, token) => (dispatch) => {

    dispatch(loading());

    fetch(teacherURL + teacherID, {
        method: 'DELETE',
        headers: {
            'authorization': token
        },
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.ok) {
                return teacherID;
            } else {
                if (response.status === 404)
                    throw new Error(t('notFound'));
                else
                    throw new Error(t('error'))
            }
        })
        .then(deleted => {
            setTimeout(() => dispatch(oprSuccessed(t('teacherDeleteSuccess'))), 200);
            setTimeout(() => dispatch(deleteTeacherAction(teacherID)), 500);
        })
        .catch(err => {
            if (err.message === MESSAGES.fetch_failed) {
                dispatch(error(t('server_error')));
            }
            dispatch(error(err.message));
        })
}

export const _delete = (id, token, oprType, changeState) => (dispatch) => {

    let reqUrl = '';
    switch (oprType) {
        case Action_Types.DELETE_TEACHER:
            reqUrl = `${teacherURL}${id}`;
    }

    changeState(Action_Types.IS_LOADING);

    fetch(reqUrl, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json',
            'authorization': token
        },
        credentials: 'same-origin'
    })
        .then(response => {
            //the resource not found or error occured at the server
            if (response.status === 404) throw new Error(t('notFound'))
            if (response.status === 500) throw new Error(t('error'));

            changeState(Action_Types.OPR_SUCCESS);
            setTimeout(() => { dispatch(deleteTeacherAction(id)) }, 3000)

        })
        .catch(err => changeState(Action_Types.ERROR_OCCURED, err.message));
}

const getErrorMsg = (filedname) => {
    const err = new Error();
    if (filedname === 'PRIMARY') {
        err.message = t('uniqueId')
    } else if (filedname === 'email') {
        err.message = t('uniqueEmail')
    } else if (filedname === 'phone') {
        err.message = t('uniquePhone')
    } else if (filedname === 'username') {
        err.message = t('username-exists')
    }
    return err;
}

/******************************Action Creators For Files Report***************** */

const loadFilesReport = (id) => ({
    type: Action_Types.Loading_Files,
    payload: id
});

const loadFilesError = (error) => ({
    type: Action_Types.Error_Loading_Files,
    payload: error
});

const loadFileSuccess = (files) => ({
    type: Action_Types.Load_Files_Success,
    payload: files
});

const add_new_file = (file) => ({
    type: Action_Types.ADD_NEW_FILE,
    payload: file
});

const delete_file_action = (fileID) => ({
    type: Action_Types.DELETE_FILE,
    payload: fileID
})

/**
 * get files details for a specific user id
 * @param {*} id 
 * @returns 
 */
export const getFilesForReport = (id) => (dispatch) => {

    // console.log(`The Token Is ${token} \n the id: ${id}`);
    dispatch(loadFilesReport(id));

    axios(`${userURL}files/${id}`, {
        method: 'GET'
    })
        .then(response => response.data)
        .then(files => dispatch(loadFileSuccess(files)))
        .catch(error => {
            let msg = error.message;

            if (error.status === 404) {
                msg = t('notFound');
            } else if (error.status >= 400) {
                msg = t('error');
            }
            dispatch(loadFilesError(msg))
        });

}

/***************************************Action Creators For Uploading a file**************** ****/


export const uploadFile = (file, idUser, setSubmitting, restForm) => (dispatch) => {

    dispatch(loading());

    const fd = new FormData();
    fd.append('files', file);

    axios.post(`${userURL}upload/${idUser}`, fd)
        .then(response => response.data)
        .then(file => {
            //clear the form
            dispatch(oprSuccessed(t('addFileSuccess')));
            //add the files for user files//
            dispatch(add_new_file(file));
        })
        .catch(err => {
            let msg = err.message;
            if (err.response?.data.error)
                msg = err.response.data.error
            dispatch(error(msg));
        })
        .finally(() => {
            //enable submit button again
            setSubmitting(false);
        })
}

/********************************* Files Api From The Server ********************************* */

export const deleteFile = (fileID, fileName, userID) => (dispatch) => {

    dispatch(loading());

    axios(`${userURL}files/${userID}/${fileID}/${fileName}`, {
        method: 'DELETE'
    })
        .then(response => {
            //delete the file from the state 
            dispatch(delete_file_action(fileID));
            dispatch(oprSuccessed(t('fileDeleteSuccess')));
        })
        .catch(err => {
            let msg = err.message;
            if (err.response?.data.error)
                msg = err.response.data.error;
            dispatch(error(msg));
        })

}


/**
 * Get File from the server
 */
export const getFile = (fileID, fileName, userID) => async (dispatch) => {

    try {
        const res = await axios.get(`${userURL}files/${userID}/${fileID}`);
        const fileURL = res.data;

        window.open(fileURL, '_blank')

    } catch (e) {
        console.log(e);
        let msg = t('error');

        if (e.response?.data.error)
            msg = e.response.data.error;

        dispatch(error_state({
            msg: msg
        }));
    }

    // axios({
    //     method: 'GET',
    //     url: `${userURL}files/${userID}/${fileID}`,
    //     responseType: 'blob',
    // })
    //     .then(res => {
    //         const url = window.URL.createObjectURL(new Blob([res.data], { type: res.data.type }));
    //         const link = document.createElement('a');
    //         link.href = url;

    //         link.setAttribute('download', fileName);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //     })
    //     .catch((err) => console.log(err))


}



/***********************************Function To Notes*********************************** */

const load_notes = (userID) => ({
    type: Action_Types.LOADING_NOTES,
    payload: userID
});

const error_notes = (error) => ({
    type: Action_Types.ERROR_NOTES,
    payload: error
});

const add_notes = (notes) => ({
    type: Action_Types.ADD_NOTES,
    payload: notes
});

const delete_note = (noteID) => ({
    type: Action_Types.DELETE_NOTE,
    payload: noteID
});

const add_note = (note) => ({
    type: Action_Types.ADD_NOTE,
    payload: note
});

const update_note = (newNote) => ({
    type: Action_Types.UPDATE_NOTE,
    payload: newNote
})

/**
 * make an api call to get all notes for a specific user
 * @param {*} userID 
 * @param {*} token 
 * @returns 
 */
export const getNotes = (userID) => (dispatch) => {

    dispatch(load_notes(userID));

    axios(userURL + `notes/${userID}`, {
        method: 'GET'
    })
        .then(response => response.data)
        .then(notes => dispatch(add_notes(notes)))
        .catch(error => {
            let msg = error.message;
            if (error.response?.status === 404) {
                msg = t('notFound');
            } else if (error.response?.status === 500) {
                msg = t('error');
            }
            dispatch(error_notes(msg))
        });

}

/**
 * make an api call to delete a specific note
 * @param {*} noteID 
 * @param {*} token 
 * @returns 
 */
export const deleteNote = (noteID, token) => (dispatch) => {

    dispatch(loading());

    axios.delete(userURL + `notes/${noteID}`)
        .then(response => noteID)
        .then(deleted => {
            dispatch(oprSuccessed(t('deleteNoteSuccess')))
            dispatch(delete_note(noteID))
        })
        .catch(err => {
            let message = err.message;

            if (err.response) {
                message = err.response.status === 404 ? t('notFound') : t('error');
            }

            dispatch(error(message));
        })
}

/**
 * make api call to add a new note for a specific user
 * @param {*} target_user_id 
 * @param {*} manager_id 
 * @param {*} note_title 
 * @param {*} note_text 
 * @param {*} token 
 * @param {*} setSubmitting 
 * @returns 
 */
export const addNote = (target_user_id, manager_id, note_title, note_text, token, setSubmitting) => (dispatch) => {

    console.log(`targetid ${target_user_id} manager: ${manager_id} note_title: ${note_title} note_text: ${note_text} 
   token: ${token}`);
    dispatch(loading());

    axios.post(userURL + `notes`,
        JSON.stringify({
            note_text: note_text,
            note_title: note_title,
            recipient_id: target_user_id,
            created_by: manager_id
        }), {
        headers: {
            'Content-type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(note => {
            dispatch(oprSuccessed(t('addNoteSucess')));
            dispatch(add_note(note));
        })
        .catch(err => {
            let message = err.message;

            if (err.response) {
                message = t('error');
            }

            dispatch(error(message));
        })
        .finally(() => setSubmitting(false));
}

/**
 * make an api call to update a specific note
 * @param {*} note 
 * @param {*} token 
 * @returns 
 */
export const updateNote = (note, token, setSubmitting) => (dispatch) => {

    dispatch(loading());

    axios.put(userURL + 'notes', JSON.stringify(note),
        {
            headers: {
                'Authorization': token,
                'Content-type': 'application/json'
            }
        }
    )
        .then(response => response.data)
        .then(newNote => {
            dispatch(oprSuccessed(t('updateNoteSuccess')))
            dispatch(update_note(note))
        })
        .catch(err => {
            let message = err.message;

            if (err.response) {
                message = t('error');
            }

            dispatch(error(message));
        })
        .finally(() => setSubmitting(false))
}

/******************************************Courses Action******************************** */

const loading_courses = () => ({
    type: Action_Types.LOADING_COURSES
});

const error_courses = (error) => ({
    type: Action_Types.ERROR_COURSES,
    payload: error
});

const add_courses = (courses) => ({
    type: Action_Types.ADD_COURSES,
    payload: courses
});

const add_course = (course) => ({
    type: Action_Types.ADD_COURSE,
    payload: course
});

const delete_course = (courseID) => ({
    type: Action_Types.DELETE_COURSE,
    payload: courseID
})

const update_course = (updCourse) => ({
    type: Action_Types.UPDATE_COURSE,
    payload: updCourse
});


/**
 * make an api call to retrive all the courses
 * @param {*} student_id if received then return courses for the specific student 
 * @returns 
 */
export const getCourses = (student_id) => (dispatch) => {

    dispatch(loading_courses());

    const url = student_id ? coursesURL + `/${student_id}` : coursesURL;
    axios.get(url)
        .then(response => response.data)
        .then(courses => {
            console.log(courses);
            dispatch(add_courses(courses))
        })
        .catch(err => {
            let msg = err.message;

            if (err.response?.data.error)
                msg = err.response.data.error;

            dispatch(error_courses(msg));
        })
}
// {
//     headers: {
//         'Authorization': token
//     },
//     credentials: 'same-origin'
// }
/************************************Course Details************************************* */

const load_course_details = () => ({
    type: Action_Types.LOADING_DETAILS
});

const error_course_details = (err) => ({
    type: Action_Types.ERROR_DETAILS,
    payload: err
});

const add_course_details = (courseDetails) => ({
    type: Action_Types.ADD_DETAILS,
    payload: courseDetails
});

export const getCourseDetails = (courseID) => (dispatch) => {

    dispatch(load_course_details());

    axios(courseDetailURL + courseID, {
        method: 'GET',
    })
        .then(response => response.data)
        .then(courseDetails => dispatch(add_course_details(courseDetails)))
        .catch(err => {
            console.log(err);
            let msg = err.message;

            if (err.response) {
                if (err.response.status === 404)
                    msg = t('notFound');
                else
                    msg = t('error');
            }

            dispatch(error_course_details(msg));
        })
}

/****************************************Action For Submition HW***************** */

const load_hw_submtions = () => ({
    type: Action_Types.LOADING_SUBMITIONS
});

const error_hw_submitions = (err) => ({
    type: Action_Types.ERROR_SUBMITIONS,
    payload: err
});

const add_hw_submitions = (submitions) => ({
    type: Action_Types.ADD_SUBMITIONS,
    payload: submitions
});

const add_submit = (submit) => ({
    type: Action_Types.ADD_SUBMIT,
    payload: submit
});

const update_submit = (submit) => ({
    type: Action_Types.UPDATE_SUBMIT,
    payload: submit
});

const delete_homework_file = (file_id) => ({
    type: Action_Types.DELETE_HOMEWORK_FILE,
    payload: file_id
});

const give_feedback = (feedback) => ({
    type: Action_Types.GIVE_FEEDBACK,
    payload: feedback
});

const delete_submittion = () => ({
    type: Action_Types.DELETE_SUBMITTION
});

const load_unsubmitted_homeworks = () => ({
    type: Action_Types.LOADING_UNSUBMITTED_HOMEWORKS
});

const error_unsubmitted_homeworks = (err) => ({
    type: Action_Types.ERROR_UNSUBMITTED_HOMEWORKS,
    payload: err
});

const add_unsubmitted_homeworks = (homeworks) => ({
    type: Action_Types.ADD_UNSUBMITTED_HOMEWORKS,
    payload: homeworks
})

/**
 * make api call to retrieve all submitions for a specific course and hw_id
 * @param {*} course_id 
 * @param {*} hw_id 
 * @param {*} token 
 * @returns 
 */
export const getHwSubmitions = (course_id, hw_id) => (dispacth) => {

    dispacth(load_hw_submtions());

    axios.get(courseDetailURL + course_id + '/hw/' + hw_id)
        .then(response => response.data)
        .then(hwSubmitions => { console.log(hwSubmitions); dispacth(add_hw_submitions(hwSubmitions)) })
        .catch(err => {
            let msg = err.message;

            if (err.response?.data.error)
                msg = err.response.data.error;

            dispacth(error_hw_submitions(err.message))
        })
}

/**
 * make api call to add new homework submittion,
 * if the student isn't register to the course then the submit will be denied
 * @param {*} submit 
 * @param {*} course_id 
 * @param {*} hw_id 
 * @param {*} setSubmmiting 
 */
export const submit_homework = (submit, course_id, hw_id, setSubmmiting) => dispacth => {

    dispacth(loading());

    axios.post(courseDetailURL + course_id + '/hw/' + hw_id, submit)
        .then(response => response.data)
        .then(newSubmit => {
            dispacth(add_submit(newSubmit))
            dispacth(oprSuccessed(t('addSubmitSuccess')));
        })
        .catch(err => {
            let msg = err.message;

            if (err.response?.data.error)
                msg = err.response.data.error;

            dispacth(error(msg))
        })
        .finally(() => setSubmmiting(false))
}

/**make api call to get for the student unSubmitted homeworks */
export const getUnSubmittedHomeworks = () => dispacth => {

    dispacth(load_unsubmitted_homeworks());

    axios.get(courseDetailURL + `unSubmittedHomeworks`)
        .then(response => response.data)
        .then(homeworks => dispacth(add_unsubmitted_homeworks(homeworks)))
        .catch(err => {
            let msg = err.message;

            if (err.response?.data.error)
                msg = err.response.data.error;

            dispacth(error_unsubmitted_homeworks(msg))
        })
}

export const updateSubmitHomework = (submit, course_id, hw_id, setSubmitting) => dispacth => {

    dispacth(loading());

    axios.put(courseDetailURL + course_id + '/hw/' + hw_id, submit)
        .then(response => response.data)
        .then(updSubmit => {
            dispacth(update_submit(updSubmit));
            dispacth(oprSuccessed(t('updateSubmitSuccess')));
        })
        .catch(err => {
            let msg = err.message;

            if (err.response?.data.error)
                msg = err.response.data.error;

            dispacth(error(msg))
        })
        .finally(() => setSubmitting(false))

}

/**
 * make api call to give a feedback for a specific submittion by a student enrolled for the course
 * @param {*} student_id 
 * @param {*} hw_id 
 * @param {*} feedbackData 
 * @param {*} setSubmitting 
 */
export const giveFeedback = (student_id, hw_id, feedbackData, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.put(courseDetailURL + `feedback/${hw_id}/${student_id}`, JSON.stringify(feedbackData), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(success => {
            dispatch(give_feedback({ ...feedbackData, student_id: student_id }));
            dispatch(oprSuccessed(t('giveFeedbackSuccess')));
        })
        .catch(e => {
            console.log(e);
            let msg = e.message;

            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false));
}

/**get api call to get file url, then make request to firebase storage to download the file */
export const getHomeworkFile = (course_id, hw_id, file_id) => async (dispatch) => {

    try {
        const res = await axios.get(courseDetailURL + `${course_id}/hw/${hw_id}/file/${file_id}`);
        const fileURL = res.data;

        window.open(fileURL, '_blank')

    } catch (e) {
        console.log(e);
        let msg = t('error');

        if (e.response?.data.error)
            msg = e.response.data.error;

        dispatch(error_state({
            msg: msg,
            tryAgain: false,
            tryAgainFunction: null
        }));
    }
};

/**make api call to delete a specific file for homework submittion */
export const deleteHomeworkFile = (course_id, hw_id, file_id) => dispatch => {

    dispatch(loading());

    axios.delete(courseDetailURL + `${course_id}/hw/${hw_id}/file/${file_id}`)
        .then(response => {
            dispatch(delete_homework_file(file_id));
            dispatch(oprSuccessed(t('deleteFileSuccess')));
        })
        .catch(e => {
            let message = e.message;
            if (e.response?.data.error)
                message = e.response.data.error;

            dispatch(error(message));
        })

}

/**for a given submittion made by the student delete, the submittion data and files, if the teacher alredy gives a feedback 
 * then can't be delete the data.
 */
export const deleteHomeworkSubmittion = (course_id, hw_id) => dispatch => {

    dispatch(loading());

    axios.delete(courseDetailURL + `${course_id}/hw/${hw_id}/studentSubmit`)
        .then(success => {
            dispatch(delete_submittion());
            dispatch(oprSuccessed(t('deleteSubmittionSuccess')));
        })
        .catch(e => {
            let message = e.message;
            if (e.response?.data.error)
                message = e.response.data.error;

            dispatch(error(message));
        })
}

/**************************Action Types For Languages************************* */

const loading_exercises = () => ({
    type: Action_Types.LOADING_EXERCISES
});

const error_exercises = (err) => ({
    type: Action_Types.ERROR_EXERCISES,
    payload: err
});

const add_exercises = (exe, type) => ({
    type: Action_Types.ADD_EXERCISES,
    payload: {
        questions: exe,
        type: type
    }
});

export const resetExercises = () => ({
    type: Action_Types.RESET_EXERCISE
})

const load_answer = () => ({
    type: Action_Types.LOADING_ANSWER
});

const error_answer = (err) => ({
    type: Action_Types.ERROR_ANSWER,
    payload: err
});

const add_answer = (ans) => ({
    type: Action_Types.ADD_ANSWER,
    payload: ans
});

export const reset_answer = () => ({
    type: Action_Types.RESET_ANSWER
})

/**
 * Make an api call to get exercises for a student
 * @param {*} student_id 
 * @param {*} lang to get exercises in : 'en' , 'he', 'ar'
 * @param {*} type type of questions to get, 'fc', 'sc', 'ws', 'wp'
 * @param {*} amout of question to retrieve
 * @returns 
 */
export const getExercises = (student_id, lang, type, amout, token) => dispatch => {

    dispatch(loading_exercises());

    fetch(baseUrl + 'lang/' + lang + '/' + type + '/' + amout + '/' + student_id, {
        method: 'GET',
        headers: {
            'Authorization': token
        },
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.ok)
                return response.json();

            throw Error(t('error'));
        })
        .then(exercises => { console.log(exercises);; dispatch(add_exercises(exercises, type)) })
        .catch(err => {
            if (err.message === MESSAGES.fetch_failed)
                dispatch(error_exercises(t('server_error')));

            dispatch(error_exercises(err.message));
        })

}



/**
 * make a api call to check if the user answer correct for a given sc question
 * @param {*} student_id 
 * @param {*} sentence_id 
 * @param {*} word_id 
 * @param {*} token 
 */
export const getCsAnswer = (student_id, sentence_id, word_id, token, know) => (dispatch) => {

    console.log(`called with  ${word_id} ${token} ${know}`);
    dispatch(load_answer());

    const reqURL = know === false || know === true ? baseUrl + 'lang/' + word_id + '/' + know + '/' + student_id :
        baseUrl + 'lang/' + sentence_id + '/' + word_id + '/' + student_id;

    fetch(reqURL, {
        method: 'POST',
        headers: {
            'Authorization': token
        },
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(t('error'));
        })
        .then(result => { console.log(result); dispatch(add_answer(result)) })
        .catch(err => { console.log(err); dispatch(error_answer(err.message)) })

}

/**************************Working with shifts************************** */

const load_current_shift = () => ({
    type: Action_Types.LOADING_CURRENT_SHIFT
})

const error_current_shift = (err) => ({
    type: Action_Types.ERROR_CURRENT_SHIFT,
    payload: err
})

const add_current_shift = (shift) => ({
    type: Action_Types.ADD_CURRENT_SHIFT,
    payload: shift
});

const end_start_shift = () => ({
    type: Action_Types.LOADING_ADD_END_SHIFT
});

const error_add_end_shift = (err) => ({
    type: Action_Types.ERROR_ADD_END_SHIFT,
    payload: err
});

const start_shift = (shift) => ({
    type: Action_Types.ADD_NEW_SHIFT,
    payload: shift
});

const end_shift = (shift) => ({
    type: Action_Types.END_SHIFT,
    payload: shift
});

const reset_shift = () => ({
    type: Action_Types.RESET_CURRENT_SHIFT
});

const shift_note = (note) => ({
    type: Action_Types.SHIFT_NOTE,
    payload: note
});

const load_shifts = () => ({
    type: Action_Types.LOADING_SHIFTS
});

const error_shifts = (error) => ({
    type: Action_Types.ERROR_SHIFTS,
    payload: error
})

const add_shifts = (shifts) => ({
    type: Action_Types.ADD_SHIFTS,
    payload: shifts
});

const update_shift = (updShift) => ({
    type: Action_Types.UPDATE_SHIFT,
    payload: updShift
});

const load_teacher_year_hours = () => ({
    type: Action_Types.LOADING_TEACHERS_YEAR_HOURS
});

const error_teachers_year_hours = (error) => ({
    type: Action_Types.ERROR_TEACHERS_YEAR_HOURS,
    payload: error
});

const add_teachers_year_hours = (teachersYearHours) => ({
    type: Action_Types.ADD_TEACHERS_YEAR_HOURS,
    payload: teachersYearHours
});

const load_top5_teachers = () => ({
    type: Action_Types.LOADING_TOP5_TEACHERS
});

const error_top5_teachers = (error) => ({
    type: Action_Types.ERROR_TOP5_TEACEHRS,
    payload: error
});

const add_top5_teachers = (teachers) => ({
    type: Action_Types.ADD_TOP5_TEACEHRS,
    payload: teachers
});

const delete_shift = (teacher_id, start_shift) => ({
    type: Action_Types.DELETE_SHIFT,
    payload: {
        teacher_id,
        start_shift
    }
})

/**make api call to get shifts between two dates, for teachers onlt reports for that teachers will be returned */
export const getShifts = (start_date, end_date) => dispatch => {

    dispatch(load_shifts());

    axios.get(baseUrl + 'shift' + `/${start_date}/${end_date}`)
        .then(response => response.data)
        .then(shifts => dispatch(add_shifts(shifts)))
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error_state({ msg: msg }));
        })
}

/**make api call to get current shifts
 * for manager will return the currently logged teachers.
 * for teachers will return the last 10 shifts
 */
export const getCurrentShifts = () => dispacth => {

    dispacth(load_shifts());

    axios.get(baseUrl + `shift/lastShifts`)
        .then(response => response.data)
        .then(shifts => dispacth(add_shifts(shifts)))
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispacth(error_shifts(msg));
        })
}

export const deleteShift = (teacher_id, start_shift) => dispatch => {

    dispatch(loading())

    axios.delete(baseUrl + `shift/${teacher_id}/${start_shift}`)
    .then(response => {
        dispatch( delete_shift(teacher_id, start_shift) )
        dispatch( oprSuccessed(t('deleteShiftSuccess')) )
    })
    .catch(err => {
        let msg = ''
        if (err.response?.data.error)
            msg = err.response.data.error

        dispatch(error(msg))
    })


}

/**send api request to print shifts based on start\end date and teachersIds */
export const printShifts = (startDate, endDate, teacherIds) => dispacth => {

    const params = {
        startDate,
        endDate,
        teacherIds: teacherIds.join(',')
    }

    axios({
        method: 'GET',
        url: `${baseUrl}shift/printShifts`,
        responseType: 'blob',
        params: params
    })
        .then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data], { type: res.data.type }));
            const link = document.createElement('a');
            link.href = url;

            link.setAttribute('download', t('shifts'));
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch((err) => {
            console.log(err);
            dispacth(error_state({ msg: t('error') }));
        });

}

/**
 * MAKE API call to get current shift if exists for a teacher
 */
export const getCurrentShift = () => dispacth => {

    // dispacth(loading());
    dispacth(load_current_shift());

    axios(baseUrl + 'shift/current', {
        method: 'GET'
    })
        .then(response => response.data)
        .then(shift => {
            // dispacth(reset_state());
            console.log(shift);
            dispacth(add_current_shift( shift ))
        })
        .catch(error => {
            let err = error.message;
            if (error.response?.data.error)
                err = error.response.data.error;

            // dispacth(reset_state());
            dispacth(error_state({ msg: err }))
            dispacth(error_current_shift(err))
        });

}

/**make api call to get for teachers the hours worked for each month in the year */
export const getTeachersYearHours = () => dispacth => {

    dispacth(load_teacher_year_hours());

    axios.get(baseUrl + `shift/teachersYearHours`)
        .then(response => response.data)
        .then(teachersYearHours => dispacth(add_teachers_year_hours(teachersYearHours)))
        .catch(err => {
            let e = err.message;
            if (err.response?.data.error)
                e = err.response.data.error;

            dispacth(error_teachers_year_hours(e));
        })
}

/**make api call to get top 5 teachers for shifts hours for the current month */
export const getTop5Teachers = () => dispacth => {

    dispacth(load_top5_teachers());

    axios.get(baseUrl + `shift/top5teachers`)
        .then(response => response.data)
        .then(top5Teachers => dispacth(add_top5_teachers(top5Teachers)))
        .catch(err => {
            let e = err.message;
            if (err.response?.data.error)
                e = err.response.data.error;

            dispacth(error_top5_teachers(e));
        })
}


export const start_end_shift = (location, user_id, type, token, startShift) => dispacth => {

    dispacth(end_start_shift());
    // dispacth(loading())
    const reqURL = type === MESSAGES.START_SHIFT ? `${baseUrl}shift/start` : `${baseUrl}shift/end`;

    axios(reqURL, {
        method: type === MESSAGES.START_SHIFT ? 'POST' : 'PUT',
        data: JSON.stringify({
            location: location,
            teacher_id: user_id,
            start_shift: type === MESSAGES.END_SHIFT ? startShift : undefined
        }),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(newShift => {
            console.log(newShift);
            type === MESSAGES.START_SHIFT ? dispacth(start_shift(newShift)) :
                function () {
                    dispacth(end_shift(newShift));
                    dispacth(oprSuccessed(t('endShiftSuccess')))
                    dispacth(reset_shift())
                }();
        })
        .catch(err => {
            let msg = err.message;

            if (err.response)
                msg = err.response.data.error;

            dispacth(error_add_end_shift(msg));
            dispacth(error_state({ msg: msg }))
        })

    // fetch(reqURL, {
    //     method: type === MESSAGES.START_SHIFT ? 'POST' : 'PUT',
    //     body: JSON.stringify({
    //         location: location,
    //         teacher_id: user_id,
    //         start_shift: type === MESSAGES.END_SHIFT ? startShift : undefined
    //     }),
    //     headers: {
    //         'Authorization': token,
    //         'content-type': 'application/json'
    //     },
    //     credentials: 'same-origin'
    // })
    //     .then(response => {
    //         if (response.ok)
    //             return response.json();

    //         throw new Error(t('error'))
    //     })
    //     .then(newShift => {
    //         console.log(newShift);
    //         type === MESSAGES.START_SHIFT ? dispacth(start_shift(newShift)) : function () { dispacth(end_shift(newShift)); dispacth(reset_shift()) }();
    //     })
    //     .catch(err => {
    //         if (err.message === MESSAGES.fetch_failed)
    //             dispacth(error_add_end_shift(t('server_error')));
    //         else
    //             dispacth(error_add_end_shift(err.message));
    //     })
    //     .finally(() => dispacth(reset_state()));
}


/**make api call to the server to add||update the note for the current shift
 * @param note object contain as prop a shift_note, and start_shift
 */
export const shiftNote = (note) => dispatch => {

    dispatch(loading());

    axios.post(baseUrl + `shift/shift_note`, JSON.stringify(note), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(success => {
            dispatch(shift_note(note.shift_note));
            dispatch(oprSuccessed(t('shiftNoteSuccess')));
        })
        .catch(e => {
            console.log(e);
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error(msg));
        })
};

/**make api request to update an existing shift, 
 *if the new_start_shift is identical to an exists start_shift for that teacher, them the udpate will fail */
export const updateShift = (new_start_shift, old_start_shift, end_shift, teacher_id, setSubmitting) => dispatch => {

    dispatch(loading());

    const updShift = { new_start_shift, old_start_shift, end_shift, teacher_id };
    axios.put(baseUrl + `shift`, JSON.stringify(updShift), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(success => {
            dispatch(update_shift(updShift));
            dispatch(oprSuccessed(t('updateShiftSuccess')))
        })
        .catch(e => {
            console.log(e);
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false))
}


const publicVapidKey = "BJlA5Bvf6Wre-Y-MZbVGqoXibQFHGwaTnTr5WrHSMJ9lCPzUu6Cb90Dfck6cJM0O1r3wd8AyzR8Z8rulMcCzjyQ";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**function to subscribe for notification, for shifts */
export const subscribeUser = (teacher_id) => async(dispatch) => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    
    
    const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
            auth: subscription.toJSON().keys.auth,
            p256dh: subscription.toJSON().keys.p256dh,
        },
        teacher_id: teacher_id
    };


    axios.post(baseUrl + 'shift/subscribe',JSON.stringify(subscriptionData), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(success => {
        dispatch( oprSuccessed( t('subscribeSuccess') ) );
    })
    .catch(e => {
        console.log(e);
        let msg = e.message;
        if (e.response?.data.error)
            msg = e.response.data.error;

        dispatch( error('') )
        dispatch(error_state( {msg: msg} ));
    })
};


/********************************************Students Actions*************************************** */

const load_students = () => ({
    type: Action_Types.LOADING_STUDENTS
});

const error_students = (err) => ({
    type: Action_Types.ERROR_STUDENTS,
    payload: err
});

const add_students = (students) => ({
    type: Action_Types.ADD_STUDENTS,
    payload: students
});

const add_student = (student) => ({
    type: Action_Types.ADD_STUDENT,
    payload: student
});

const update_student = (student) => ({
    type: Action_Types.UPDATE_STUDENT,
    payload: student
});

/**
 * make api call to the sever to retrieve all the students in the db
 * @param {*} token 
 * @returns 
 */
export const getAllStudents = () => dispacth => {

    dispacth(load_students());

    axios.get(studentsURL)
        .then(response => response.data)
        .then(students => dispacth(add_students(students)))
        .catch(err => {
            console.log(err);
            dispacth(error_students(t('error')));
        });

}

/**make api call to print all students data */
export const printStudents = () => dispatch => {

    axios({
        method: 'GET',
        url: `${studentsURL}/print`,
        responseType: 'blob',
    })
        .then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data], { type: res.data.type }));
            const link = document.createElement('a');
            link.href = url;

            link.setAttribute('download', t('students'));
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch((err) => {
            console.log(err);
            dispatch(error_state({ msg: t('error') }));
        })

}


/**
 * make api call to add || update student, to the server
 * @param {*} student object contain all the relevant data about the student
 * @param {*} type should be one of the types Action_Types.ADD ||  Action_Types.UPDATE
 * @param {*} token 
 */
export const addUpdStudent = (student, type, token, setSubmitting) => dispatch => {

    dispatch(loading());
    // console.log(student);

    const method = type === Action_Types.ADD ? 'POST' : 'PUT';
    axios({
        method: method,
        url: studentsURL,
        data: JSON.stringify(student),
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            // console.log(response);
            if (response.status !== 201 && response.status !== 200) {
                if (response.status === 500) {
                    throw new Error(t('error'));
                } else if (response.status === 404) {
                    throw new Error(t('notFound'));
                }
                throw new Error(response.data.error);
            }
            return response.data
        })
        .then(student => {
            // dispatch(oprSuccessed(t('addStudentSucess')));
            if (type === Action_Types.ADD) {
                dispatch(add_student(student));
                dispatch(oprSuccessed(t('addStudentSucess')));
            }
            else {
                dispatch(update_student(student));
                dispatch(oprSuccessed(t('updateStudentSucess')));
            }
        })
        .catch(err => {
            // console.log(err);
            dispatch(error(err.response.data.error))
        })
        .finally(() => setSubmitting(false))
}

/*********************************************Actions for Subjects***************** */

const load_subjects = () => ({
    type: Action_Types.LOADING_SUBJECTS
});

const error_subjects = (err) => ({
    type: Action_Types.ERROR_SUBJECTS,
    payload: err
});

const add_subjects = (subjects) => ({
    type: Action_Types.ADD_SUBJECTS,
    payload: subjects
});

const add_subject = (subject) => ({
    type: Action_Types.ADD_SUBJECT,
    payload: subject
});

const update_subject = (updSubject) => ({
    type: Action_Types.UPDATE_SUBJECT,
    payload: updSubject
})


/**
 * make api call to get all the subjects from the server side
 * @param {*} token 
 */
export const getSubjects = (token) => dispacth => {

    dispacth(load_subjects());

    axios.get(subjectsURL)
        .then(response => response.data)
        .then(subjects => dispacth(add_subjects(subjects)))
        .catch(err => {
            if (err.status === 500) {
                dispacth(error_subjects(t('error')))
            }
            dispacth(error_subjects(err.message));
        })
}

/**
 * make api call to add new subject
 * if success then update the state,
 * else dispatch error message to the state
 * @param {*} subject 
 * @param setSubmitting function to triggered at the end to enable the submit button at the form to be clickable
 */
export const addSubject = (subject, setSubmitting) => dispacth => {

    dispacth(loading());

    axios.post(subjectsURL, JSON.stringify(subject), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(newSubject => {
            dispacth(oprSuccessed(t('subjectAddSuccess')));
            dispacth(add_subject(newSubject.data))
        })
        .catch(err => {
            console.log(err);
            dispacth(error(err.response.data.error))
        })
        .finally(() => setSubmitting(false))

}

/**
 * make api call to update the subject data
 * @param {*} subject 
 * @param {*} setSubmitting 
 */
export const updateSubject = (subject, setSubmitting) => dispacth => {

    dispacth(loading())

    axios.put(subjectsURL + '/' + subject.id, JSON.stringify(subject), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(updSubject => {
            dispacth(update_subject(updSubject))
            dispacth(oprSuccessed(t('updateSubjectSuccess')))
        })
        .catch(err => {
            console.log(err);
            dispacth(error(err.response.data.error))
        })
        .finally(() => setSubmitting(false));

}

/**************************Add || Edit Course Functions***************** */

const add_course_teachers = (teachers) => ({
    type: Action_Types.ADD_TEACHERS_COURSE,
    payload: teachers
});

/**
 * fired when error occured while get subjects or teachers to display in the autoComplete
 * @param {*} err error message to display to the user
 * @returns 
 */
const error_get_course_data = (err) => ({
    type: Action_Types.ERROR_ADD_COURSE,
    payload: err
})

/**Error state to the store with 3 parameters
 * @param msg String describe the error to show in snackBar
 * @param tryAgain boolean indicate if to include try button in error snack bar to enable the users to trigger the action again
 * @param tryAgainFunction function name to trigger when the try button clicked by the user
 */
export const error_state = ({ msg, tryAgain, tryAgainFunction }) => ({
    type: Action_Types.ERROR_STATE,
    payload: {
        errorMessage: msg,
        tryAgain: tryAgain,
        tryAgainFunction: tryAgainFunction
    }
});

/**reset the error state, will cause to hide the error snackbar */
export const reset_error_state = () => ({
    type: Action_Types.RESET_ERROR_STATE
})

/**Make api request to get all teachers id, firstname, lastname to display as auto complete list 
 * in add || edit course form
 */
export const getTeachersForAutoComplete = () => dispatch => {

    dispatch(reset_error_state())

    axios.get(teacherURL + 'courseTeachers')
        .then(teachers => { dispatch(add_course_teachers(teachers.data)) })
        .catch(error => {
            console.log(error);
            let errorMessage = error.message
            if (error.response.data) {
                //error from server
                errorMessage = error.response.data.error
            }
            dispatch(error_get_course_data(errorMessage));
            dispatch(error_state({
                errorMessage: errorMessage,
                tryAgain: true,
                tryAgainFunction: 'getTeachersForAutoComplete'
            }));
        })

}

/**make api call to add new course to the db, if error found then dispaly under the submit button
 * @param course object cotain all the data for course
 * @param setSubmitting after make api call and get result set submit to false to enable submit button again
 * @param resetForm reset form if add operation success
 */
export const addCourse = (course, setSubmitting, resetForm) => dispatch => {

    dispatch(loading());

    axios.post(coursesURL, JSON.stringify(course), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(newCourse => {
            dispatch(add_course(newCourse));
            dispatch(oprSuccessed(t('addCourseSuccess')));
            resetForm();
        })
        .catch(err => {
            console.log(err);
            let errorMsg = err.message;

            if (err.response?.data)
                errorMsg = err.response.data.error;

            dispatch(error(errorMsg))
        })
        .finally(() => setSubmitting(false))

}

export const updateCourse = (course, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.put(coursesURL, JSON.stringify(course), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(updCourse => {
            dispatch(oprSuccessed(t('updateCourseSuccess')));
        })
        .catch(e => {
            let message = e.message;
            if (e.response?.data.error) {
                message = e.response.data.error;
            }
            dispatch(error(message));
        })
        .finally(() => setSubmitting(false))

}

/**************************Lessons Api Calls**************** */

const add_lesson = (lesson) => ({
    type: Action_Types.ADD_LESSON,
    payload: lesson
});

const update_lesson = (lesson) => ({
    type: Action_Types.UPDATE_LESSON,
    payload: lesson
});

const delete_lesson = (lesson_id) => ({
    type: Action_Types.DELETE_LESSON,
    payload: lesson_id
})

const add_unit = (unit) => ({
    type: Action_Types.ADD_UNIT,
    payload: unit
});

const update_unit = (updUnit) => ({
    type: Action_Types.UPDATE_UNIT,
    payload: updUnit
});

const delete_unit = (unit_id) => ({
    type: Action_Types.DELETE_UNIT,
    payload: unit_id
})

const delete_studyUnitFile = (file_id) => ({
    type: Action_Types.DELETE_UNIT_FILE,
    payload: file_id
});

/**
 * make a api call to add new lesson to the course
 * @param {*} lesson 
 * @param {*} setSubmitting 
 */
export const addLesson = (lesson, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.post(courseDetailURL + `lesson`, JSON.stringify(lesson), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(newLesson => {
            dispatch(add_lesson(newLesson));
            dispatch(oprSuccessed(t('addLessonSuccess')));
        })
        .catch(err => {
            let msg = err.message;
            if (err.response?.data.error)
                msg = err.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false))
}

/**
 * make a api call to add update lesson
 * @param {*} lesson 
 * @param {*} setSubmitting 
 */
export const updateLesson = (lesson, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.put(courseDetailURL + `lesson`, JSON.stringify(lesson), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(newLesson => {
            dispatch(update_lesson(lesson));
            dispatch(oprSuccessed(t('updateLessonSuccess')));
        })
        .catch(err => {
            let msg = err.message;
            if (err.response?.data.error)
                msg = err.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false))
}

/**make api call to delete a lesson and it's data */
export const deleteLesson = (lesson_id, course_id) => dispatch => {

    dispatch(loading());

    axios.delete(courseDetailURL + `${course_id}/${lesson_id}`)
        .then(success => {
            dispatch(oprSuccessed(t('deleteLessonSuccess')));
            dispatch(delete_lesson(lesson_id));
        })
        .catch(err => {
            let msg = err.message;
            if (err.response?.data.error)
                msg = err.response.data.error;

            dispatch(error(msg));
        })
}


/**make a api call to add new unit || homework
 * @param unit object contain all relevant data for add new unit, like for which lesson,
 * note, files...
 * @param course_id id of course for which to add the unit
 */
export const addUnit = (unit, course_id, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.post(courseDetailURL + `unit/${course_id}`, unit)
        .then(response => response.data)
        .then(newUnit => { dispatch(add_unit(newUnit)); dispatch(oprSuccessed(t('addUnitSuccess'))) })
        .catch(err => {
            let msg = err.message;
            if (err.response?.data.error)
                msg = err.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false));
}

/**
 * make api call to update a current unit 
 * @param {*} unit the unit object with new values to update
 * @param {*} course_id for which course to update the unit
 * @param {*} setSubmitting 
 * @returns the server return the new unit with updated data to dispatch on the store
 */
export const updateUnit = (unit, course_id, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.put(courseDetailURL + `unit/${course_id}`, unit)
        .then(response => response.data)
        .then(updUnit => {
            dispatch(update_unit(updUnit));
            dispatch(oprSuccessed(t('updateUnitSuccess')));
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false));
}

/**make api call to delete a unit and it's content */
export const deleteUnit = (course_id, unit_id) => dispatch => {

    dispatch(loading());

    axios.delete(courseDetailURL + `unit/${course_id}/${unit_id}`)
        .then(success => {
            dispatch(oprSuccessed(t('deleteUnitSuccess')));
            dispatch(delete_unit(unit_id));
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error(msg));
        })
}

/**get api call to get file url, then make request to firebase storage to download the file */
export const getUnitFile = (course_id, lesson_id, unit_id, file_id) => async (dispatch) => {

    try {
        const res = await axios.get(courseDetailURL + `file/${course_id}/${lesson_id}/${unit_id}/${file_id}`);
        const fileURL = res.data;

        window.open(fileURL, '_top')

    } catch (e) {
        console.log(e);
        let msg = t('error');

        if (e.response?.data.error)
            msg = e.response.data.error;

        dispatch(error_state({
            msg: msg,
            tryAgain: false,
            tryAgainFunction: null
        }));
    }
};

/**
 * make a api call to delete studyUnitFile, if error occured then show a error snack bar,
 * if the operation successed the show success snack bar
 * @param {*} course_id 
 * @param {*} lesson_id 
 * @param {*} unit_id 
 * @param {*} file_id 
 */
export const deleteStudyUnitFile = (course_id, lesson_id, unit_id, file_id) => (dispatch) => {

    axios.delete(courseDetailURL + `file/${course_id}/${lesson_id}/${unit_id}/${file_id}`)
        .then(response => {
            dispatch(delete_studyUnitFile(file_id));
            dispatch(oprSuccessed('fileDeleteSuccess'));
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error_state({
                msg: msg,
                tryAgain: false,
                tryAgainFunction: null
            }));
        })

}

/************Student Courses action creators************ */
const loading_course_students = () => ({
    type: Action_Types.LOADING_COURSE_STUDENTS
});

const error_course_students = (error) => ({
    type: Action_Types.ERROR_COURSE_STUDENTS,
    payload: error
});

const add_course_students = (students) => ({
    type: Action_Types.ADD_COURSE_STUDENTS,
    payload: students
});

const register_students = (students) => ({
    type: Action_Types.REGISTER_STUDNET,
    payload: students
})

/**make a api call to get students for a specific course,
 * the call will return a object with 2 properities
 * 1 all students enrolled for the course
 * 2 all students not yet enrolled for the course, 
 */
export const getCourseStudents = (courseID) => dispatch => {

    dispatch(loading_course_students());

    axios.get(coursesURL + `/${courseID}/students`)
        .then(students => {
            dispatch(add_course_students(students.data));
        })
        .catch(error => {
            let msg = error.message;
            if (error.response?.data.error)
                msg = error.response.data.error;
            dispatch(error_course_students(msg));
        })
}

/**make api call to register new students to the course,
 * @param registerStudents object 1 prop contain the course_id, and other hold array with student's id's
 */
export const registerStudents = (registerStudents) => dispatch => {

    dispatch(loading());

    axios.post(coursesURL + '/registerStudents', JSON.stringify(registerStudents), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            dispatch(register_students(registerStudents.students));
            dispatch(oprSuccessed(t('registerStudentsSuccess')));
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;
            dispatch(error(msg));
        })
}

/***********************Messages Api Calls******************* */

const load_messages = () => ({
    type: Action_Types.LOADING_MESSAGES
});

const error_messages = (error) => ({
    type: Action_Types.ERROR_MESSAGES,
    payload: error
});

const add_messages = (messages) => ({
    type: Action_Types.ADD_MESSAGES,
    payload: messages
});

const add_new_message = (newMessage) => ({
    type: Action_Types.ADD_NEW_MESSAGE,
    payload: newMessage
});

const update_message = (updMessage) => ({
    type: Action_Types.UPDATE_MESSAGE,
    payload: updMessage
});

const delete_message = (msgID) => ({
    type: Action_Types.DELETE_MESSAGE,
    payload: msgID
});

const load_all_users = () => ({
    type: Action_Types.LOAD_ALL_USERS
});

const error_all_users = (error) => ({
    type: Action_Types.ERROR_ALL_USERS,
    payload: error
});

const add_all_users = (users) => ({
    type: Action_Types.ADD_ALL_USERS,
    payload: users
})

/**make api call to get all user message, based on user permission, if manager get the messages sent and the messages must recieve
 * @param limited boolean indicate if to return limited number of messages instead of all messages
 */
export const getMessages = (limited) => dispacth => {

    dispacth(load_messages());

    const url = limited ? messageURL + `/${limited}` : messageURL + '/false';
    axios.get(url)
        .then(response => response.data)
        .then(allMessages => { dispacth(add_messages(allMessages)) })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispacth(error_messages(msg));
        })
}

/**make api request to add new message
 * @param message object must contain message title, content and sent time
 */
export const addNewMessage = (message, resetForm, setSubmitting) => dispacth => {

    dispacth(loading());

    axios.post(messageURL, JSON.stringify(message), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.data)
        .then(newMessage => {
            dispacth(add_new_message(newMessage));
            resetForm();
            dispacth(oprSuccessed(t('addMessageSuccess')));
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispacth(error(msg));
        })
        .finally(() => setSubmitting(false))
}

/**make api call to update current message
 * @param message object contain message title and new content in addition to message id
 */
export const updateMessage = (message, setSubmitting) => dispatch => {

    dispatch(loading());

    axios.put(messageURL, JSON.stringify(message), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            dispatch(update_message(message));
            dispatch(oprSuccessed(t('updateMessageSucces')))
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispatch(error(msg));
        })
        .finally(() => setSubmitting(false))
}

/**make api call to delete a specific message by message id */
export const deleteMessage = (messageID) => dispacth => {

    axios.delete(messageURL + `/${messageID}`)
        .then(response => {
            dispacth(delete_message(messageID));
            dispacth(oprSuccessed(t('deleteMessageSuccess')))
        })
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispacth(error(msg));
        })
}

/**get all users data expect from the user who sent the request, for message sent */
export const getAllUsers = () => dispacth => {

    dispacth(add_all_users());

    axios.get(userURL)
        .then(response => response.data)
        .then(allUsers => dispacth(add_all_users(allUsers)))
        .catch(e => {
            let msg = e.message;
            if (e.response?.data.error)
                msg = e.response.data.error;

            dispacth(error_all_users(msg));
        })
}

/**for a certain message id, get all users must receive the message, when succes object of key(id): value(true) returned
 * , when error, error snack bar is displayed
 */
export const getMessageUsers = (message_id) => dispatch => (
    new Promise((resolve, reject) => {

        axios.get(messageURL + `/users/${message_id}`)
            .then(response => response.data)
            .then(users => {
                const usersId = {};
                users.forEach(id => usersId[id] = true);
                resolve(usersId);
            })
            .catch(e => {
                console.log(e);
                dispatch(error_state({ msg: t('error') }));
                reject()
            })
    })
)