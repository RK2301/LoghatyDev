/**
 * This File to save required parameters such as host url
 */

export const baseUrl =  'http://localhost:80/api/';
export const authURl = 'http://localhost:80/auth/';
export const userURL = `${baseUrl}user/`;
export const teacherURL = `${baseUrl}teachers/`;
export const coursesURL = `${baseUrl}courses`;
export const courseDetailURL = `${baseUrl}courseDetails/`;
export const studentsURL = `${baseUrl}students`;
export const subjectsURL = `${baseUrl}subjects`;
export const messageURL =`${baseUrl}message`
//'http://localhost:80/api/'

/**paths in the app for different routes */

export const homePath = '/home';
export const shiftPath = '/shift';
export const shiftReportsPath = `${shiftPath}/reports`;
export const teachersPath = '/teachers';
export const studentsPath = '/students';
export const messagesPath = '/messages';
export const messagesAddUpdatePath = `${messagesPath}/au`;
export const messagesAddPath = `${messagesPath}/add`;
export const coursesPath = `/main_courses`;
export const courseDetailsPath = `/courseDetails`;
export const addCoursePath = '/addCourse';
export const subjectPath = `/subjects`;

