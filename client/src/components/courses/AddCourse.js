import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Col, Container, Row } from "reactstrap";
import { Autocomplete, Box, Button, ButtonGroup, Chip, Divider, FormControl, IconButton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { StyledTextField, StyledToolTip, layout, mobilePaper } from "../materialUiOverride";
import { useEffect } from "react";
import { connect } from "react-redux";
import { addCourse, getSubjects, getTeachersForAutoComplete, reset_after_error, updateCourse } from "../../redux/ActionCreators";
import * as Validators from '../validators';
import { MobileDatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { GetTimeFromDateAsHoursAndMin, formatTheDate, getErrorFromDate } from "../services";
import { FaCheck, FaInfo } from "react-icons/fa";
import { MdDelete, MdOutlineAdd } from "react-icons/md";
import Feedback from '../feedback/Feedback';
import { useParams } from "react-router-dom";

const mapStateToProps = (state) => ({
    subjects: state.subjects.subjects,
    addCourseData: state.addCourse,
    courses: state.courses.courses
});

const mapDispacthToProps = (dispatch) => ({
    getSubjects: () => dispatch(getSubjects()),
    getTeachersForAutoComplete: () => dispatch(getTeachersForAutoComplete()),
    addCourse: (course, setSubmitting, resetForm) => dispatch(addCourse(course, setSubmitting, resetForm)),
    updateCourse: (course, setSubmitting) => dispatch( updateCourse(course, setSubmitting) ),
    reset_after_error: () => dispatch( reset_after_error() )
})

/**
 * represent a add course form
 */
const AddCourse = ({ subjects, getSubjects, addMode = true,
    addCourseData, getTeachersForAutoComplete, addCourse, updateCourse, courses, reset_after_error }) => {


    const [course_subject, setCourse_subject] = useState({});
    const [courseTeacher, setCourseTeacher] = useState({});
    const [DateError, setDateError] = useState(null);
    const [meetTimeErrors, setMeetTimeErrors] = useState([]);

    /**Save which subject selected if == language then show another filed as auto complete to select the
     * language of the the course, as english || arabic || hebrew
     */
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    /**get subject id, check the and update the state, which show the choosen value*/
    const setCourseSubject = (newSubjectID) => {
        subjects.forEach(subject => {
            if (subject.id === newSubjectID) {
                setCourse_subject(subject);
            }
        })
    }

    /**Get teacher id and set the teacher selected in the state */
    const setCourse_Teacher = (teacherID) => {
        addCourseData.teachers.forEach(teacher => {
            if (teacher.id === teacherID)
                setCourseTeacher(teacher);
        });
    }

    /**Get for each meet time field if there an error and save it to array with corresponding index */
    const setMeetTimeError = (error, index) => {
        meetTimeErrors[index] = getErrorFromDate(error);
    }

    const days_of_week = [{ id: 1, day: 'sun' }, { id: 2, day: 'mon' }, { id: 3, day: 'tue'},
    {id: 4, day: 'wed'}, { id: 5, day: 'thu' }, { id: 6, day: 'fri' }, { id: 7, day: 'sat' }]

    //check if opend for addMode if not then get the course data from the store
    let updCourse = {};
    let course_id = useParams().id;
    const course_meetings = [];
    if (course_id) {
        addMode = false;
        course_id = parseInt(course_id);
        updCourse = courses.find(course => course.course_id === course_id);
        //loop over meetings and create array for meetings for formik
        updCourse.course_meetings.forEach(meeting => {
            const day = days_of_week.find( day => day.id === meeting.day_id );
            const now = dayjs('2023-08-12 ' + meeting.start_time);
            
            course_meetings.push( { day: day, time: now } );
        })
    }

    /**Get all data required for the form, subjects, teachers and days data
     * to display in the auto complete forms
     */
    useEffect( () => {
        //get all subjects
         getSubjects();
    
        //get teachers data
        getTeachersForAutoComplete();

        //reset the state if there an error
        reset_after_error();
        
    }, []);
    const { t, i18n } = useTranslation();

    if( !addMode && subjects.length > 0 && !selectedSubject){
         setCourseSubject(updCourse.subject_id);
        subjects.forEach(subject => {
            if(subject.id === updCourse.subject_id)
              setSelectedSubject(subject);
        })
    }

    /**For teacher if update mode and the teachers data arrives then set the value for auto complete field */
    if(!addMode, addCourseData.teachers.length > 0 && Object.keys(courseTeacher).length ==0){
        setCourse_Teacher(updCourse.id);
    }


    /**Values to display on language auto complete, if user select to create a language course */
    const languages = [{ id: 1, language: 'English' }, { id: 2, language: 'عربي' }, { id: 3, language: 'עברית' }]

    const validate = (values) => {
        const errors = {};

        Validators.required(values.course_name, 'course_name', errors);
        Validators.required(values.subject_id, 'subject_id', errors);
        Validators.required(values.teacher_id, 'teacher_id', errors);
        Validators.required(values.lesson_num, 'lesson_num', errors);
        Validators.required(values.start_date, 'start_date', errors);
        Validators.required(values.end_date, 'end_date', errors);
        if (DateError) {
            const res = getErrorFromDate(DateError);
            if (res) {
                errors['end_date'] = res;
                // setDateError(res);
            }
        } else if (values.end_date && values.start_date) {
            //check end date are greater than start date
            const course_start = new Date(values['start_date']);
            const course_end = new Date(values['end_date']);

            if (!(course_start < course_end)) {
                // setDateError(t('endDateAfterStartDate'));
                errors.end_date = t('endDateAfterStartDate');
            }
        }

        /**check for meet duration the input meet the instructions */
        Validators.required(values.meet_duration, 'meet_duration', errors);
        if (values.meet_duration) {
            //check if 1 - 6 with 0.5 jumps
            const duration = values.meet_duration;
            if (duration < 1 || duration > 6 || duration % 0.5 !== 0)
                errors['meet_duration'] = t('meetDurationError');
        }

        /**Loop and validate day & time** */
        values.course_meetings.forEach((meeting, i) => {
            if (!meeting.day) {
                //day required
                errors.course_meetings = errors.course_meetings || [];
                errors.course_meetings[i] = {
                    ...errors.course_meetings[i],
                    day: t('required')
                }
            }

            if (!meeting.time) {
                errors.course_meetings = errors.course_meetings || [];
                errors.course_meetings[i] = {
                    ...errors.course_meetings[i],
                    time: t('required')
                }
            } else if (meetTimeErrors[i]) {
                //check for error
                errors.course_meetings = errors.course_meetings || [];
                errors.course_meetings[i] = {
                    ...errors.course_meetings[i],
                    time: meetTimeErrors[i]
                }
            }
        });


        //the field for language subject is required
        if (selectedSubject && selectedSubject[i18n.language] === t('language')) {
            Validators.required(values.language_id, 'language_id', errors);
        }

        return errors;
    }


    return (
        <>
            <Container fluid className="h-100">
                <Row >
                    <Col xs={1} >{' '}</Col>

                    <Col xs={'auto'}>
                        <Typography variant="h4">
                            {addMode ? t('addCourse') : t('updateCourse')}
                        </Typography>
                    </Col>
                </Row>

                <Row className="h-75 mt-3 p-md-3">

                    <Formik
                        initialValues={{
                            course_name: updCourse.course_name || '',
                            subject_id: updCourse.subject_id || null,
                            teacher_id: updCourse.id || null,
                            lesson_num: updCourse.lesson_num || null,
                            start_date: updCourse.start_date ? dayjs(updCourse.start_date) : dayjs(new Date()),
                            end_date: updCourse.end_date ? dayjs(updCourse.end_date) : null,
                            meet_duration: updCourse.meet_duration || null,
                            course_type: updCourse.course_type || 'g',
                            course_meetings: !addMode ? course_meetings : [{ day: null, time: null }],
                            language_id: updCourse.language_id || null
                        }}
                        validate={validate}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            //format the object to meet the keys for add || edit object to update data
                            //for case if choose language course then change it so not sent the language id for server
                            const language_id = selectedSubject[i18n.language] === t('language') ? values.language_id : null;
                            //for meetings loop over and create new object contain day_id and time formated as HH:mm
                            const course_meetings_formated = values.course_meetings.map(meet => {
                                return { day_id: meet.day.id, time: GetTimeFromDateAsHoursAndMin(new Date(meet.time)) }
                            })

                            const add_edit_course = {
                                ...values, language_id: language_id, start_date: formatTheDate(new Date(values.start_date)), end_date: formatTheDate(new Date(values.end_date)),
                                course_meetings: course_meetings_formated
                            }

                            //make api call to add or update the course
                            if (addMode) {
                                addCourse(add_edit_course, setSubmitting, resetForm);
                            } else {
                                add_edit_course.course_id = updCourse.course_id;
                                updateCourse(add_edit_course, setSubmitting );
                            }
                        }}
                        initialTouched={{}}
                    >
                        {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                            <Form>

                                <Row >
                                    <Col xs={12} md={3} >
                                        <Field
                                            as={StyledTextField}
                                            name={'course_name'}
                                            label={t('course_name')}
                                            required
                                            error={touched.course_name && errors.course_name}
                                            helperText={<ErrorMessage name="course_name" />}
                                        />
                                    </Col>

                                    <Col xs={12} md={3} >
                                        <Field
                                            as={Autocomplete}
                                            value={course_subject}
                                            onChange={(event, newVal) => {
                                                setFieldValue('subject_id', newVal.id);
                                                setCourseSubject(newVal.id);
                                                setSelectedSubject(newVal)
                                            }}
                                            options={subjects}
                                            getOptionLabel={(option) => {
                                                const toShow = option[i18n.language];
                                                if (toShow)
                                                    return toShow;
                                                return '';
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            renderOption={(props, option) => (
                                                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                                    {option[i18n.language]}
                                                </Box>
                                            )}
                                            renderInput={(params) => (
                                                <StyledTextField
                                                    {...params}
                                                    name={'subject_id'}
                                                    label={t('subject')}
                                                    size='small'
                                                    required
                                                    error={touched.subject_id && errors.subject_id}
                                                    helperText={<ErrorMessage name="subject_id" />}
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        autoComplete: 'new-password', // disable autocomplete and autofill
                                                    }}
                                                />
                                            )}
                                        />
                                    </Col>

                                    <Col xs={12} md={3} >

                                        <Field
                                            as={Autocomplete}
                                            value={courseTeacher}
                                            onChange={(event, newVal) => {
                                                setFieldValue('teacher_id', newVal.id);
                                                setCourse_Teacher(newVal.id);
                                            }}
                                            options={addCourseData.teachers}
                                            getOptionLabel={(option) => {
                                                if (option.firstname)
                                                    return option.firstname + ' ' + option.lastname;
                                                return '';
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props}>
                                                    {option.firstname + ' ' + option.lastname}
                                                </Box>
                                            )}
                                            renderInput={(params) => (
                                                <StyledTextField
                                                    {...params}
                                                    name={'teacher_id'}
                                                    label={t('teacher')}
                                                    size='small'
                                                    required
                                                    error={touched.teacher_id && errors.teacher_id}
                                                    helperText={<ErrorMessage name="teacher_id" />}
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        autoComplete: 'new-password', // disable autocomplete and autofill
                                                    }}
                                                />
                                            )}
                                        />
                                    </Col>

                                    {/**Render auto complete for language select for course arabic || hebrew || english */}
                                    {selectedSubject ? selectedSubject[i18n.language] === t('language') ?
                                        (<Col xs={12} md={2} >
                                            <Field
                                                as={Autocomplete}
                                                value={selectedLanguage}
                                                onChange={(event, newVal) => {
                                                    setFieldValue('language_id', newVal.id);
                                                    setSelectedLanguage(newVal);
                                                }}
                                                options={languages}
                                                getOptionLabel={(option) => option['language']}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                // renderOption={(props, option) => (
                                                //     <Box component="li" {...props}>
                                                //         {option.firstname + ' ' + option.lastname}
                                                //     </Box>
                                                // )}
                                                renderInput={(params) => (
                                                    <StyledTextField
                                                        {...params}
                                                        name={'language_id'}
                                                        label={t('language')}
                                                        size='small'
                                                        error={touched.language_id && errors.language_id}
                                                        helperText={<ErrorMessage name="language_id" />}
                                                        inputProps={{
                                                            ...params.inputProps,
                                                            autoComplete: 'new-password', // disable autocomplete and autofill
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Col>)
                                        : (<></>) : (<></>)}

                                    <Col xs={12} md={selectedSubject ? selectedSubject[i18n.language] === t('language') ? 1 : 3 : 3} >
                                        <Field
                                            as={StyledTextField}
                                            name={'lesson_num'}
                                            label={t('lesson_num')}
                                            type="number"
                                            required
                                            error={touched.lesson_num && errors.lesson_num}
                                            helperText={<ErrorMessage name="lesson_num" />}
                                        />
                                    </Col>

                                </Row>

                                <Row className="mt-md-4">

                                    <Col xs={12} md={3}>
                                        <Field
                                            as={MobileDatePicker}
                                            name='start_date'
                                            value={values.start_date}
                                            label={t('start_date')}
                                            onChange={(value) => setFieldValue('start_date', value)}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    margin: 'dense',
                                                    fullWidth: true,
                                                    error: touched.start_date && errors.start_date,
                                                    helperText: <ErrorMessage name="start_date" component={<p />} />,
                                                },
                                                mobilePaper: mobilePaper,
                                                layout: layout
                                            }}
                                        />
                                    </Col>

                                    <Col xs={12} md={3}>
                                        <Field
                                            as={MobileDatePicker}
                                            name='end_date'
                                            label={t('end_date')}
                                            onChange={(value) => setFieldValue('end_date', value)}
                                            onError={(err) => { setDateError(err) }}
                                            disablePast
                                            disabled={Object.keys(updCourse).length > 0 ? new Date(formatTheDate(updCourse.end_date)) < new Date() ? true : false : false}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    margin: 'dense',
                                                    fullWidth: true,
                                                    required: true,
                                                    helperText: <ErrorMessage name='end_date' />,
                                                    error: touched.end_date && errors.end_date,
                                                    onBlur: () => { touched.end_date = true },
                                                },
                                                mobilePaper: mobilePaper,
                                                layout: layout
                                            }}
                                        />
                                    </Col>

                                    <Col xs={12} md={3}>
                                        <Row className="align-items-center g-0">
                                            <Col xs={10}>
                                                <Field
                                                    as={StyledTextField}
                                                    name={'meet_duration'}
                                                    label={t('meet_duration')}
                                                    type="number"
                                                    inputProps={{
                                                        step: 0.5, // 0.5-hour increments
                                                        min: 0.5, // Minimum duration allowed
                                                        max: 8, // Maximum duration allowed
                                                    }}
                                                    required
                                                    error={touched.meet_duration && errors.meet_duration}
                                                    helperText={<ErrorMessage name="meet_duration" />}
                                                />
                                            </Col>
                                            <Col xs={2}>
                                                <StyledToolTip
                                                    title={t('meetDurationInstruction')}
                                                >
                                                    <IconButton>
                                                        <FaInfo size={17} />
                                                    </IconButton>
                                                </StyledToolTip>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col xs={12} md={3}>
                                        <FormControl
                                            component="fieldset"
                                            margin='dense'
                                            fullWidth>
                                            <Field
                                                as={ButtonGroup}
                                                aria-label="course-selection"
                                                name="course_type"
                                                variant="outlined"
                                                fullWidth
                                            >
                                                <Button
                                                    onClick={() => setFieldValue('course_type', 'g')}
                                                    endIcon={values.course_type === 'g' ? <FaCheck size={15} /> : null}
                                                    color={values.course_type === 'g' ? 'secondary' : 'primary'}
                                                    variant={values.course_type === 'g' ? 'contained' : 'outlined'}
                                                >
                                                    {t('group')}
                                                </Button>
                                                <Button
                                                    onClick={() => setFieldValue('course_type', 'i')}
                                                    endIcon={values.course_type === 'i' ? <FaCheck size={15} /> : null}
                                                    color={values.course_type === 'i' ? 'secondary' : 'primary'}
                                                    variant={values.course_type === 'i' ? 'contained' : 'outlined'}
                                                >
                                                    {t('individual')}
                                                </Button>
                                            </Field>
                                        </FormControl>
                                    </Col>

                                </Row>

                                <Divider className="mt-3">
                                    <Chip label={t("meetings")} />
                                </Divider>
                                <Typography variant='subtitle2'> {t('meetingsNote')} </Typography>

                                <Row className="mt-md-2">

                                    <FieldArray name="course_meetings"  >
                                        {({ remove, push }) => (
                                            <>

                                                {values.course_meetings.map((meeting, i) => (
                                                    <Col key={i} xs={12} md={3}>
                                                        <Row className="g-1">
                                                            <Col xs={6}>

                                                                <Field
                                                                    as={Autocomplete}
                                                                    value={meeting.day}
                                                                    onChange={(event, newVal) => {
                                                                        values.course_meetings[i].day = newVal;
                                                                    }}
                                                                    options={days_of_week}
                                                                    getOptionLabel={(option) => t(option.day)}
                                                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                                                    renderOption={(props, option) => (
                                                                        <Box component="li" {...props}>
                                                                            {t(option.day)}
                                                                        </Box>
                                                                    )}
                                                                    renderInput={(params) => (
                                                                        <StyledTextField
                                                                            {...params}
                                                                            name={`course_meetings.${i}.day`}
                                                                            label={t('day')}
                                                                            size='small'
                                                                            required
                                                                            error={!!(errors.course_meetings && errors.course_meetings[i]?.day
                                                                                && touched.course_meetings && touched.course_meetings[i]?.day)}
                                                                            helperText={<ErrorMessage name={`course_meetings.${i}.day`} />}
                                                                            inputProps={{
                                                                                ...params.inputProps,
                                                                                autoComplete: 'new-password', // disable autocomplete and autofill
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </Col>

                                                            <Col xs={5}>
                                                                <Field
                                                                    as={TimePicker}
                                                                    value={meeting.time}
                                                                    name={`course_meetings.${i}.time`}
                                                                    onChange={(value) => values.course_meetings[i].time = value}
                                                                    onError={(err) => { setMeetTimeError(err, i) }}
                                                                    format="HH:mm"
                                                                    ampm={false}

                                                                    slotProps={{
                                                                        textField: {
                                                                            size: 'small',
                                                                            margin: 'dense',
                                                                            name: `course_meetings.${i}.time`,
                                                                            onBlur: () => {
                                                                                touched.course_meetings = touched.course_meetings || [];
                                                                                touched.course_meetings[i] = {
                                                                                    ...touched.course_meetings[i],
                                                                                    time: true
                                                                                }
                                                                            },
                                                                            error: (errors.course_meetings && errors.course_meetings[i]?.time
                                                                                && touched.course_meetings && touched.course_meetings[i]?.time),
                                                                            helperText: <ErrorMessage name={`course_meetings.${i}.time`} />
                                                                        },
                                                                        mobilePaper: mobilePaper,
                                                                        desktopPaper: mobilePaper
                                                                    }}
                                                                />

                                                            </Col>

                                                            <Col className="d-flex align-items-center" xs={1}>
                                                                {i === 0 ? (
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            //no more than 5 meetings a week
                                                                            if (values.course_meetings.length < 5)
                                                                                push({ day: null, time: null })
                                                                        }}
                                                                    >
                                                                        <MdOutlineAdd size={20} color="black" />
                                                                    </IconButton>
                                                                ) : (
                                                                    <IconButton
                                                                        onClick={() => remove(i)}
                                                                    >
                                                                        <MdDelete size={20} color="black" />
                                                                    </IconButton>
                                                                )}
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                ))}

                                            </>
                                        )}
                                    </FieldArray>
                                </Row>

                                <Row className="justify-content-center">
                                    <Feedback
                                        btnText={ addMode ? t('addCourse') : t('updateCourse')}
                                        disabled={isSubmitting}
                                    />
                                </Row>
                            </Form>
                        )}
                    </Formik>

                </Row>
            </Container>
        </>
    )

}

AddCourse.propTypes = {
    /**if update mode then the object must contain a course data */
    updCourse: PropTypes.object,
    /**Indicate if the form opened for add or update course */
    addMode: PropTypes.bool.isRequired
}

export default connect(mapStateToProps, mapDispacthToProps)(AddCourse);