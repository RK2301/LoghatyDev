import {combineReducers, configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {logger} from'redux-logger';
import {Login} from './logIn'
import { Teachers } from './teachers';
import { FilesReport } from './files';
import { Operation } from './operations';
import { Notes } from './notes';
import { Courses } from './courses';
import { CourseDetails } from './courseDetails';
import { SubmitionHw } from './submitionHw';
import { Language } from './language'
import { QuestionAnswer } from './questionAnswer';
import { CurrentShift } from './currentShift';
import { Students } from './students';
import { Subjects } from './subjects';
import { AddCourse } from './addCourse';
import { ErrorState } from './errorState';
import { CourseStudents } from './courseStudents';
import { Shifts } from './shifts';
import { TeachersYearHours } from './teachersYearHours';
import { Top5Teachers } from './top5Teachers';
import { UnSubmittedHomeworks } from './unSubmittedHomeworks';
import { Messages } from './Message';
import { AllUsers } from './allUsers';
import { ResetPassword } from './resetPassword';
import { connection } from './connection';

export const creteStore = () => {
    const store = configureStore({
        reducer: combineReducers({
            login: Login,
            teachers: Teachers,
            filesReport: FilesReport,
            operation: Operation,
            notes: Notes,
            courses: Courses,
            courseDetail: CourseDetails,
            submitionHw: SubmitionHw,
            language: Language,
            questionAnswer: QuestionAnswer,
            currentShift: CurrentShift,
            shifts: Shifts,
            students : Students,
            subjects: Subjects,
            addCourse: AddCourse,
            errorState: ErrorState,
            courseStudents: CourseStudents,
            teachersYearHours: TeachersYearHours,
            top5Teachers: Top5Teachers,
            unSubmittedHomeworks: UnSubmittedHomeworks,
            messages: Messages,
            allUsers: AllUsers,
            resetPassword: ResetPassword,
            connection: connection
        }),
       
    }, (getDefaultMiddleware) => {
        getDefaultMiddleware().concat(logger)
    });
    //console.log(store.getState());
    return store;
}