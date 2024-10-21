import dayjs from 'dayjs';
import { t } from 'i18next';
import moment from 'moment'

export const formatTheDate = (date) => {
    if (!date) return null;

    const toFormat = new Date(date);
    const toReturn = moment(toFormat).format('YYYY-MM-DD');
    // console.log(toReturn);
    return toReturn;
}

export const formatToDateFiled = ( date ) => {
    if(!date)
     return null;

     const toFormat = new Date(date);
     const toReturn = moment(toFormat).format('MM/DD/YYYY');
    //  console.log(toReturn);
     return toReturn
}

export const formatTheTime = (time) => {
    if (!time) return null;

    const splitTime = time.split(':');
    return splitTime[0] + ':' + splitTime[1];
}

export const formatDateTime = (dateTime) => {
    if (!dateTime) return undefined;

    return moment(new Date(dateTime)).format('YYYY-MM-DD  HH:mm');
}

export const formatDateTimeWithoutYear = (dateTime) => {
    if(!dateTime)
      return undefined;

      return moment(new Date(dateTime)).format( 'DD-MM HH:mm' );
}

/**return the date as date time with accuracy to the seconds */
export const formatDateTimeWithSeconds = (dateTime) => {
    if (!dateTime) return undefined;

    return moment(new Date(dateTime)).format('YYYY-MM-DD  HH:mm:ss');
}

export const getTheTimeFromDate = (dateTime) => {
    if (!dateTime) return undefined;

    return moment(dateTime).format('HH:mm:ss');
}

export const GetTimeFromDateAsHoursAndMin = (dateTime) => {
    if (!dateTime) return undefined;

    return moment(dateTime).format('HH:mm');
} 

export const getErrorFromDate = ( error ) => {

    switch(error){
        case 'invalidDate':
            return t('invalidDate');
        case 'disableFuture':
            return t('disableFuture'); 
         
        default:
            return '';
    }
}

/**return in arry of lenght 2 values, first one the date of first day in the month, the second value date with last day in the month
 * for example ['2023-09-01', '2023-09-31']
  */
export const getFirstAndLastDayOfMonth = () => {
    const now = new Date();
    const firstLastArr = [];

    firstLastArr.push( formatTheDate(new Date(now.getFullYear(), now.getMonth(), 1)) );
    firstLastArr.push( formatTheDate( new Date(now.getFullYear(), now.getMonth(), dayjs().daysInMonth()) ));

    return firstLastArr;
}

/**get two date and return the difference between them by subtract end_time-start_time
 * , if end_time not greater than start_time then return 0, or end_time is null
 */
export const getDifferenceInMinutes = (start_time, end_time) => {
    if( !end_time || end_time < start_time ) return 0;

    const from = new Date( formatDateTime(start_time) );
    const to = new Date( formatDateTime(end_time) );

    return (to - from) / (1000*60);
}

/**for a sent time for a message, show a proper format
 * , if in the same day then only show hour,
 * if in the same year show day & month in addition to day of the week
 * else show full format for sent time
 */
export const formatMessageSentTime = (sent_time) => {
    if(!sent_time)
      return '';

    const sentDate = new Date( formatDateTime(sent_time) );
    const now = new Date();

    /**if the message sent at the same date then show only the time */
    if(sentDate.getDay() === now.getDay())
      return moment(sentDate).format('HH:mm');

      /**if at the same year, but not the same day sent, then show day-month and day of the week */
    if(sentDate.getFullYear() === now.getFullYear())
      return moment(sentDate).format('ddd DD-MM HH:mm');

      /**return full sent time */
      return( formatDateTime(sent_time) );
}

/***************Basci function to create table in material ui**************** */

/**
 * Sort in desc order between two elements
 * @param {*} a 
 * @param {*} b 
 * @param {*} orderBy 
 * @returns 
 */
export function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

/**
 * 
 * @param {*} order desc or asc
 * @param {*} orderBy the column name in which to be order by
 * @returns 
 */
export function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  /**get file name and return the extension
   * in example.pdf => pdf
   * example.docx => docx
   */
  export const getFileExtension = (file_name) => {
    if(!file_name) return '';

    const fileNameArr = file_name.split('.');
    return fileNameArr[fileNameArr.length-1];
}

 /**for a given start and end time for specific shift return the total shift hours, if the shift not yet end
     * then return empty string
     */
 export const getShiftHours = (start_time, end_time) => {
    if (!end_time) return '';

    const mintues = getDifferenceInMinutes(start_time, end_time);

    const hours = Math.floor(mintues / 60);
    let min = mintues % 60;

    if(min < 10) 
      min = `0${min}`;
    return `${hours}:${min}`;
}


/**based on the search value filter the students to be showen
     * the search is based on find class id or student name.
     */
export const filterStudents = (students, value) => {

    if (!value) {
        return students;
    } else {

        if (!isNaN(parseInt(value))) {
            //filter based on class_id
            const class_id = parseInt(value);
            const filteredArray = students.filter(student => {
                if (student.class_id === class_id)
                    return true;
                if (class_id < 4) {
                    //for 1 show classs and 11, same for 2, and for 3 show 3 and graduate
                    if (`${student.class_id}`.includes(`${class_id}`))
                        return true;
                }
                return false;
            })
                .sort((s1, s2) => s1.class_id - s2.class_id);
            return filteredArray;
        } else {
            //filter based of first name and last name
            const searchName = value.toLowerCase();
            const filteredArrayByName = students.filter(student => {
                const fullname = `${student.firstname} ${student.lastname}`.toLowerCase();
                return fullname.includes(searchName);
            })
                .sort((s1, s2) => s1.class_id - s2.class_id);
            return filteredArrayByName;
        }
    }

}