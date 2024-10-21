const conn = require('../db');
const messages = require('../messages');
const queries = require('../queries');
const generalServices = require('./generalServices');
const momentTimeZone = require('moment-timezone');
const CONFIG = require('../config');


/**
 * get shifts based on start\end date and teacher id, for teachers will only return teacher shifts
 * @param {*} start_date from when get the shift
 * @param {*} end_date to which date to get shifts
 * @param {*} req 
 */
const getShifts = (start_date, end_date, req) => (
    new Promise((resolve, reject) => {
        let getShiftsSQL = queries.getShifts(start_date, end_date);
        if (req.user.role === 't')
            getShiftsSQL = queries.getShifts(start_date, end_date, req.user.uId);

        conn.query(getShiftsSQL, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve(data);
            }
        })
    })
);

//return current shifts
// for manager get the current teachers in the shifts for teacher get the last 10 shifts data
const getCurrentShifts = (req) => (
    new Promise((resolve, reject) => {
        let getCurrentShiftsSQL = queries.getCurrentShifts();

        if (req.user.role === 't')
            getCurrentShiftsSQL = queries.getCurrentShifts(req.user.uId);

        conn.query(getCurrentShiftsSQL, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve(data)
            }
        })
    })
);

/**for teachers return array contain teacher data like id and fullname, in addition for hours as array hold for each index a object
 * with month name and total hours worked for that month, in other words, for each teacher, calculate for each month in the year how many 
 * hours the teacher work, if the client is teacher then only return the teacher hours for the current year.
 */
const getTeachersYearHours = (req) => (
    new Promise((resolve, reject) => {
        const teachersYearHours = queries.getTeacherYearHours(req.user.role === 't' ? req.user.uId : null);
        const values = [new Date().getFullYear()];
        if (req.user.role === 't')
            values.push(req.user.uId);

        conn.query(teachersYearHours, values, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                //now loop over the shifts and for each teacher calculate the total hours for each month
                const teachersHours = [];
                const teachers = [];

                /**save in the array the total teachers */
                data.forEach(shift => {
                    if (!teachers.includes(shift.teacher_id))
                        teachers.push(shift.teacher_id);
                });

                teachers.forEach(teacherId => {
                    /**get teacher shifts for the current year */
                    const teacherShifts = data.filter(shift => shift.teacher_id === teacherId);
                    const teacherHours = {
                        id: teacherId,
                        fullname: data.find(shift => shift.teacher_id === teacherId)?.fullname
                    }

                    /**for each teacher calculate the total hours worked for each month in the year */
                    const teacherMonthHours = [];

                    //for each month calculate the total hours worked in that month
                    for (let i = 1; i <= 12; i++) {
                        const monthHour = getMonthHours(i, teacherShifts.filter(shift => {
                            return new Date(generalServices.formatDateAndTime(shift.start_shift)).getMonth() + 1 === i
                        }), req);

                        teacherMonthHours.push(monthHour);
                    }

                    teacherHours.hours = teacherMonthHours;
                    /**insert to the teacher array hold teacher data and hours */
                    teachersHours.push(teacherHours);
                });

                resolve(teachersHours);
            }
        });
    })
);

/**get the top 5 teachers with high shifts hours for the current month */
const getTop5TeacherForMonth = (req) => (
    new Promise(async (resolve, reject) => {
        try {
            const top5teachers = [];
            const teachersShiftsForCurrentMonthSQL = queries.getTeachersShiftsCurrentMonth();

            const now = new Date();
            const [teachersCurrentMonthShifts] = await conn.promise().query(teachersShiftsForCurrentMonthSQL, [now.getFullYear(), now.getMonth() + 1]);

            const teachers = [];
            teachersCurrentMonthShifts.forEach(shift => {
                if (!teachers.includes(shift.teacher_id))
                    teachers.push(shift.teacher_id);
            });

            /**for each teacher loop, get all shifts, calculate the total hours for the month and push to the
             * top5teacehrs
             */
            teachers.forEach(teacherID => {

                const teacherShifts = teachersCurrentMonthShifts.filter(shift => shift.teacher_id === teacherID);

                let total = 0;
                teacherShifts.forEach(shift => total += generalServices.getTotalTime(shift.start_shift, shift.end_shift));
                total = parseFloat(total.toFixed(2));

                top5teachers.push({
                    id: teacherID,
                    fullname: teacherShifts[0]?.fullname,
                    total: total
                });
            });

            /**sort based on total hours and return top 5 teachers */
            top5teachers.sort((a, b) => b.total - a.total);
            resolve(top5teachers.slice(0, 5));
        } catch (e) {
            console.log(e);
            reject(req.t('error'))
        }
    })
)

/**for each given month calculate the total hours worked in that month by each end_shift - start_shift
 * @param number between 1 and 12 indicate the month
 * @param monthShifts array contain all the shifts for the given month
 * @returns object with 2 props, month: indicate month name, total: total time for that month
 */
const getMonthHours = (month, monthShifts, req) => {

    if (month < 1 || month > 12)
        return { month: '', total: 0 }

    let total = 0;
    monthShifts.forEach(shift => {
        total += generalServices.getTotalTime(shift.start_shift, shift.end_shift);
    });

    return {
        total: parseFloat(total.toFixed(2)),
        month: generalServices.getMonthName(month, req)
    }
}

const getTeacherCurrentShift = (teacher_id, req) => {

    return new Promise((resolve, reject) => {
        const sql = queries.getTeacherCurrentShift(teacher_id);
        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                // console.log( momentTimeZone().clone().tz('Europe/London').format('YYYY-MM-DD HH:mm:ss') );
                // data[0].start_shift = momentTimeZone.tz( generalServices.getFormatedDate(data[0].start_shift), 'Europe/London').clone().tz(CONFIG.APP_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                if (!data[0]) {
                    const getTeacherNotifySQL = queries.getTeacherNotify();
                    conn.query(getTeacherNotifySQL, [teacher_id], (err1, data1) => {
                        if (err1)
                            reject(req.t('error'));
                        else {
                            console.log(data1);
                            resolve(data1[0]);
                        }
                    })
                } else {
                    resolve(data[0])
                }
            }
        })
    })
}

/**to start a new shift first check that no shift already started for the teacher */
const startShift = (teacher_id, start_latitude, start_longitude) => {
    return new Promise(async (resolve, reject) => {
        let start_shift = generalServices.getDateTime();
        // let start_shift = momentTimeZone.tz('Europe/London').format('YYYY-MM-DD HH:mm:ss');
        try {
            const checkForCurrentShift = queries.getTeacherCurrentShift(teacher_id);
            const [teacherCurrentShift] = await conn.promise().query(checkForCurrentShift);

            if (teacherCurrentShift.length > 0) {
                reject(req.t('alreadyInShift'));
                return;
            }
        } catch (e) {
            reject(req.t('error'));
            return;
        }
        // const start_shift = generalServices.getDateTime();
        const sql = queries.start_shift(teacher_id, start_shift, start_latitude, start_longitude);
        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                if (data.affectedRows === 1) {
                    resolve(start_shift)
                } else {
                    reject(req.t('error'));
                }
            }
        })
    })
}

const endShift = (teacher_id, start_shift, end_latitude, end_longitude, req) => {
    return new Promise((resolve, reject) => {

        const end_shift = generalServices.getDateTime();
        start_shift = generalServices.getFormatedDate(start_shift);

        const sql = queries.end_shift(teacher_id, start_shift, end_shift, end_latitude, end_longitude);
        conn.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                if (data.changedRows === 1) {
                    resolve(true);
                } else {
                    reject(req.t('notFound'));
                }
            }
        })
    })
}

/**update the current note for a shift for the specific teacher started at specific time */
const shiftNote = (teacher_id, start_shift, shift_note, req) => (
    new Promise((resolve, reject) => {

        let ss = generalServices.convertToLocalTime(start_shift);
        const addShiftNote = queries.addShiftNote();
        conn.query(addShiftNote, [shift_note, teacher_id, ss], (err, data) => {
            if (err) {
                console.log(err);
                reject(req.t('error'));
            } else {
                resolve();
            }
        });

    })
);

/**update the shift for a specific teacher, by change start and end shift times. the update will fail if the 
 * new start_shift is already exists for teacher for another shift
 */
const updateShift = (new_start_shift, old_start_shift, end_shift, teacher_id, req) => (
    new Promise((resolve, reject) => {
        const updateShiftSQL = queries.updateShift();
        conn.query(updateShiftSQL, [new_start_shift, end_shift, teacher_id, old_start_shift], (err, data) => {
            if (err) {
                err.errno === 1062 ? reject(req.t('uniqueStartShiftTime')) : reject('error');
            } else {
                resolve();
            }
        });
    })
);

/**based on taechers id, get their shfits for the give range date, and for each teacher in a new page show in a table data for the shifts */
const printShifts = (start_date, end_date, teachersId, docDefinition, req) => (
    new Promise(async (resolve, reject) => {
        try {
            const getShiftSQL = queries.getShiftsBasedOnId();
            const [shifts] = await conn.promise().query(getShiftSQL, [teachersId, start_date, end_date]);

            /**group shifts, so for each teacher id hold a teacher shifts */
            const shiftsGrouped = shifts.reduce((acc, shift) => {
                if (acc[shift.id])
                    acc[shift.id].push(shift);
                else
                    acc[shift.id] = [shift];

                return acc;
            }, {});

            //now loop over the teachers for each one create table contain data for the shifts for the selected date
            Object.keys(shiftsGrouped).forEach(id => {
                createTableForTeacher(shiftsGrouped[id], start_date, end_date, req, docDefinition.content);
            });

            resolve();
        } catch (e) {
            console.log(e);
            reject(req.t('error'));
        }
    })
);

/**for each teacher, get teacher shifts show teacher data and then table contain all data for the shifts */
const createTableForTeacher = (shifts, start_date, end_date, req, content) => {
    content.push({
        columns: [
            {
                width: 'auto',
                text: `${generalServices.toFlipText(`${shifts[0].firstname} ${shifts[0].lastname}`)} - ${shifts[0].id}`,
                margin: 20
            },
            {
                width: '*',
                text: ''
            },
            {
                width: 'auto',
                text: `${start_date} - ${end_date}`,
                margin: 20
            }
        ]
    });

    content.push({
        columns: [
            { width: '*', text: '' },
            {
                width: 'auto',
                table: {
                    body: [
                        generalServices.toFlipArray([req.t('start_shift'), req.t('end_shift'), req.t('totalTime'), req.t('note')], req.language),
                        ...shifts.map((shift) => generalServices.toFlipArray([
                            generalServices.formatDateAndTime(shift.start_shift),
                            generalServices.formatDateAndTime(shift.end_shift),
                            generalServices.getShiftHours(shift.start_shift, shift.end_shift),
                            generalServices.toFlipText(shift.shift_note),
                        ], req.language)),
                    ],
                    alignment: "center"
                }
            },
            { width: '*', text: '' },
        ]
    });

    content.push({
        width: 'auto',
        text: generalServices.toFlipText(req.t('totalShiftsHour', { totalHours: generalServices.getTotalShiftsHours(shifts) })),
        margin: 20,
        pageBreak: 'after'
    })
};


/**delete a specific shift based on teacher_id and start_shift time */
const deleteShift = (teacher_id, start_shift, req) => new Promise((resolve, reject) => {

    const deletShiftSQL = queries.deleteShift()
    conn.query(deletShiftSQL, [teacher_id, start_shift], (err, data) => {
        if (err) {
            console.log(err);
            reject(req.t('error'));
        } else {
            resolve();
        }
    });

})

module.exports = {
    getTeacherCurrentShift,
    startShift,
    endShift,
    shiftNote,
    getShifts,
    updateShift,
    getCurrentShifts,
    getTeachersYearHours,
    getTop5TeacherForMonth,
    printShifts,
    deleteShift
}