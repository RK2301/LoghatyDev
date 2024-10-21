const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const { APP_TIMEZONE } = require('../config');


/**take time as string from the client and convert it to the server timezone */
const convertToLocalTime = (time) => {
    if(!time)
      return null;
   const l = momentTimeZone.tz(time, 'YYYY-MM-DD HH:mm:ss' , APP_TIMEZONE).clone().local().format('YYYY-MM-DD HH:mm:ss');
   return l;
}

const formatTheDate = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD');
}

/**
 * return the current date and time in mysql format
 */
const getDateTime = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

const getFormatedDate = (date) => {
    if (!date) return null;
    // return new Date(date).toJSON().slice(0, 19).replace('T', ' ');
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

const formatDateAndTime = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm')
}

/**get date time as date object and return a hours and min as string from the date 
 * @param date Date object
*/
const getTimeFromDate = (date) => {
    if (!date) return null;

    return moment(date).format('HH:mm');
}

/**
 * get error message with duplicated error message and return the name of the column 
 * at which the error occured
 * @param {*} message 
 * @returns 
 */
const getDuplicatedMessage = (message) => {
    let errmsg = message.split(' ');
    errmsg = errmsg[errmsg.length - 1].split('.');
    const columnName = errmsg[errmsg.length - 1].replace("'", "");

    return columnName
}

/**
 * return error message for null column
 * @param {*} message 
 * @returns 
 */
const getNotNullErrorMessage = (message) => {
    let toReturn = message.replace(/'/g, "");
    toReturn = toReturn.split(' ');
    return toReturn[1];
}

/**
 * return error message for columns violate the constraint
 * @param {*} message 
 * @returns 
 */
const constraintError = (message) => {
    let toReturn = message.replace(/'/g, "");
    toReturn = toReturn.split(' ')[2]
    return toReturn[2].slice(0, toReturn.length);
}

/**
 * return upload url for stoarge, for unit files,
 * @param {*} course_id 
 * @param {*} lesson_id 
 * @param {*} unit_id 
 * @param {*} file_name 
 * @returns string in format -> courses/{course_id}/{lesson_id}/{unit_id}/{filename}
 */
const getUnitFileURL = (course_id, lesson_id, unit_id, file_name) => (
    `courses/${course_id}/${lesson_id}/${unit_id}/${file_name}`
);

/**
 * return upload url for homework file
 * @param {*} course_id 
 * @param {*} hw_id 
 * @param {*} username
 * @param {*} file_name 
 * @returns string in format  `courses/${course_id}/homework/${hw_id}/${username}/${file_name}`
 */
const getHomeworkFileURL = (course_id, hw_id, username, file_name) => (
    `courses/${course_id}/homework/${hw_id}/${username}/${file_name}`
);

/**return path to folder that hold all user submitted files, in most to be delete all files */
const getHomeworFolderURL = (course_id, hw_id, username) => (
    `courses/${course_id}/homework/${hw_id}/${username}`
);

/**get path for file, for user, return in format users/${username}/${file_name} */
const getUserFilePath = (username, file_name) => (
    `users/${username}/${file_name}`
);

/**for given start and end time get the difference between the two times as hours and mintus like 7.45 */
const getTotalTime = (startTime, endTime) => {

    if (!startTime || !endTime)
        return 0;

    const from = new Date(formatDateAndTime(startTime));
    const to = new Date(formatDateAndTime(endTime));

    const diffInMin = (to - from) / (1000 * 60);
    return diffInMin / 60;
}


/**get month number between 1 and 12 and return month name */
const getMonthName = (month, req) => {
    switch (month) {
        case 1:
            return req.t('jan');
        case 2:
            return req.t('feb');
        case 3:
            return req.t('mar');
        case 4:
            return req.t('apr');
        case 5:
            return req.t('may');
        case 6:
            return req.t('jun');
        case 7:
            return req.t('jul');
        case 8:
            return req.t('aug');
        case 9:
            return req.t('sep');
        case 10:
            return req.t('oct');
        case 11:
            return req.t('nov');
        case 12:
            return req.t('dec');

        default:
            return '';
    }
}

/***************Make pdf functions **************** */

/**this function take a array of elements, and language if the language isn't english then will reverse the array elements */
const toFlipArray = (arr, lan) => {

    if (!lan || !arr)
        return undefined;

    if (lan !== 'en')
        return arr.map(val => toFlipText(val)).reverse();

    return arr;
}

/**check the text, if contain english characters then return the text, if not then flip the text in the string and return it */
const toFlipText = (text) => {
    if (!text)
        return '';

    const isEnglish = /[a-z]/g.test(text);
    if (isEnglish)
        return text;

    return text.split(" ").reverse().join(" ");
}


/**get two date and return the difference between them by subtract end_time-start_time
 * , if end_time not greater than start_time then return 0, or end_time is null
 */
const getDifferenceInMinutes = (start_time, end_time) => {
    if( !end_time || end_time < start_time ) return 0;

    const from = new Date( formatDateAndTime(start_time) );
    const to = new Date( formatDateAndTime(end_time) );

    return (to - from) / (1000*60);
}


/**for a given start and end time for specific shift return the total shift hours, if the shift not yet end
     * then return empty string
     */
const getShiftHours = (start_time, end_time) => {
    if (!end_time) return '';

    const mintues = getDifferenceInMinutes(start_time, end_time);

    const hours = Math.floor(mintues / 60);
    let min = mintues % 60;

    if (min < 10)
        min = `0${min}`;
    return `${hours}:${min}`;
}

/**for a given shifts calculate the total hours for the shifts */
const getTotalShiftsHours = (shifts) => {
    let totalMintes = 0;
    shifts.forEach(shift => totalMintes += getDifferenceInMinutes(shift.start_shift, shift.end_shift));

    const hours = Math.floor(totalMintes / 60);
    let min = totalMintes % 60;

    if(min < 10)
      min = `0${min}`;

    return `${hours}:${min}`;
}

module.exports = {
    convertToLocalTime,
    getDateTime,
    getFormatedDate,
    getDuplicatedMessage,
    getNotNullErrorMessage,
    constraintError,
    getTimeFromDate,
    formatTheDate,
    getUnitFileURL,
    formatDateAndTime,
    getHomeworkFileURL,
    getHomeworFolderURL,
    getUserFilePath,
    getTotalTime,
    getMonthName,
    toFlipArray,
    toFlipText,
    getShiftHours,
    getTotalShiftsHours
}