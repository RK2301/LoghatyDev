import * as Permissions from './permissionTypes';

export const ManagerPermissions = [
    Permissions.ACCESS_STUDENTS,
    Permissions.ACCESS_TEACHERS,
    Permissions.TEACHER_SHIFT_MOBILE,
    Permissions.COURSE_DROPDOWN,
    Permissions.ADD_UPDATE_COURSE,
    Permissions.ADD_UPDATE_SUBJECT,
    Permissions.COURSE_MANAGMENT,
    Permissions.MANAGE_LESSON,
    Permissions.MANAGE_COURSE_STUDENTS,
    Permissions.MANAGE_HOMEWORK,
    Permissions.MANAGE_TEACHERS_SHIFTS,
    Permissions.VIEW_SHIFTS,
    Permissions.MANAGE_MESSAGES
];

export const TeacherPermissions = [
    Permissions.TEACHER_SHIFT,
    Permissions.VIEW_MESSAGES,
    Permissions.TEACHER_SHIFT_MOBILE,
    Permissions.COURSE_MANAGMENT,
    Permissions.MANAGE_LESSON,
    Permissions.MANAGE_HOMEWORK,
    Permissions.VIEW_SHIFT_END_TIME,
    Permissions.VIEW_SHIFTS
];

export const StudentPermissions = [
    Permissions.VIEW_MESSAGES,
    Permissions.PRACTICE_LANGUAGE,
    Permissions.HOMEWORK_SUBMIT_STATUS,
    Permissions.VIEW_UNSUBMITTED_HOMEWORKS
];