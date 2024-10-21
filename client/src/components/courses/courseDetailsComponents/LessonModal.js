import dayjs from "dayjs";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { StyledTextField, layout, mobilePaper } from "../../materialUiOverride";
import { Button, ButtonGroup, FormControl } from "@mui/material";
import { FaCheck } from "react-icons/fa";
import { MobileDatePicker, TimePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import Feedback from "../../feedback/Feedback";
import * as Validators from '../../validators';
import { GetTimeFromDateAsHoursAndMin, formatTheDate, getErrorFromDate } from "../../services";
import PropTypes from 'prop-types';
import withDirection from 'react-with-direction';

/**Show lesson modal to add, edit lessons */
const LessonModal = ({ isOpen, toggle, reset_after_error, updateLesson = {}, addLesson, updateLessonFunction,
    courseID, direction }) => {

    const { t } = useTranslation();
    const [visible_date_error, setVisibleDateError] = useState(null);
    const [visible_time_error, setVisibleTimeError] = useState(null);

    const validate = (values) => {
        const errors = {};

        Validators.required(values.lesson_title, 'lesson_title', errors);
        if( !values.is_visible ){
            //if lesson not visible should then supply visible date & time
            Validators.required(values.visible_date, 'visible_date', errors);
            Validators.required(values.visible_time, 'visible_time', errors);

            if(values.visible_date && visible_date_error){
                const dateError = getErrorFromDate(visible_date_error);
                if(dateError) errors.visible_date = dateError;
            }
            if(values.visible_time && visible_time_error){
                const timeError = getErrorFromDate(visible_time_error);
                if(timeError) errors.visible_time = timeError;
            }
        }

        return errors;
    }

    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={() => { toggle(); reset_after_error() }}
            centered
            scrollable backdrop='static'
            size={'md'}
            onExit={() => { reset_after_error() }}
            unmountOnClose>
            <ModalHeader toggle={() => { toggle(); reset_after_error() }} >
                {Object.keys(updateLesson).length > 0 ? t('update') + ' ' + updateLesson.lesson_title : t('addLesson')}
            </ModalHeader>

            <ModalBody dir={direction}>
                <Formik
                    initialValues={{
                        lesson_title: updateLesson.lesson_title || '',
                        is_visible: updateLesson.is_visible || true,
                        visible_date: updateLesson.visible_time ? dayjs(updateLesson.visible_time) : null,
                        visible_time: updateLesson.visible_time ? dayjs(updateLesson.visible_time) : null
                    }}
                    validate={validate}
                    onSubmit={ (values, {setSubmitting, resetForm}) => {
                        const lesson = {
                            course_id: courseID,
                            lesson_title: values.lesson_title,
                            is_visible: values.is_visible,
                            visible_time: !values.is_visible ? `${formatTheDate(values.visible_date)} ${GetTimeFromDateAsHoursAndMin(new Date(values.visible_time))}` : null
                        }

                        setSubmitting(true);
                        Object.keys(updateLesson).length > 0 ? updateLessonFunction({...lesson, lesson_id: updateLesson.lesson_id}, setSubmitting) : addLesson(lesson, setSubmitting);
                    }}>
                    {({ isSubmitting, errors, touched, setFieldValue, values }) => (
                        <Form>
                            <Container fluid>
                                <Row>
                                    <Col xs={12}>
                                        <Field
                                            as={StyledTextField}
                                            name={'lesson_title'}
                                            label={t('lesson_title')}
                                            required
                                            error={touched.lesson_title && errors.lesson_title}
                                            helperText={<ErrorMessage name="lesson_title" />}
                                        />
                                    </Col>
                                </Row>

                                <Row className="mt-3">
                                    <Col xs={12}>
                                        <FormControl
                                            component="fieldset"
                                            margin='dense'
                                            fullWidth>
                                            <Field
                                                as={ButtonGroup}
                                                aria-label="lesson_visibilty"
                                                name="is_visible"
                                                variant="outlined"
                                                fullWidth
                                            >
                                                <Button
                                                    onClick={() => setFieldValue('is_visible', true)}
                                                    endIcon={values.is_visible ? <FaCheck size={15} /> : null}
                                                    color={values.is_visible ? 'secondary' : 'primary'}
                                                    variant={values.is_visible ? 'contained' : 'outlined'}
                                                >
                                                    {t('lesson_visible')}
                                                </Button>
                                                <Button
                                                    onClick={() => setFieldValue('is_visible', false)}
                                                    endIcon={!values.is_visible ? <FaCheck size={15} /> : null}
                                                    color={!values.is_visible ? 'secondary' : 'primary'}
                                                    variant={!values.is_visible ? 'contained' : 'outlined'}
                                                >
                                                    {t('lesson_invisible')}
                                                </Button>
                                            </Field>
                                        </FormControl>
                                    </Col>
                                </Row>
                                {!values.is_visible ? (
                                    <Row className="mt-3">
                                        <Col xs={7} md={8}>
                                            <Field
                                                as={MobileDatePicker}
                                                name='visible_date'
                                                label={t('visible_date')}
                                                onChange={(value) => setFieldValue('visible_date', value)}
                                                onError={(err) => { setVisibleDateError(err) }}
                                                disablePast
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        margin: 'dense',
                                                        fullWidth: true,
                                                        helperText: <ErrorMessage name='visible_date' />,
                                                        error: touched.visible_date && errors.visible_date,
                                                        onBlur: () => { touched.visible_date = true },
                                                    },
                                                    mobilePaper: mobilePaper,
                                                    layout: layout
                                                }}
                                            />
                                        </Col>

                                        <Col xs={5} md={4}>
                                            <Field
                                                as={TimePicker}
                                                name={'visible_time'}
                                                onChange={(value) => setFieldValue('visible_time', value)}
                                                onError={(err) => { setVisibleTimeError(err) }}
                                                format="HH:mm"
                                                ampm={false}
                                                label={t('visible_time')}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        margin: 'dense',
                                                        name: `visible_time`,
                                                        onBlur: () => touched.visible_time = true,
                                                        error: (errors.visible_time && touched.visible_time),
                                                        helperText: <ErrorMessage name={`visible_time`} />,
                                                    },
                                                    mobilePaper: mobilePaper,
                                                    desktopPaper: mobilePaper
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                ) : (<></>)}

                                <Row className="justify-content-center">
                                    <Feedback
                                     btnText={ Object.keys(updateLesson).length > 0 ? t('updateLesson') : t('addLesson') }
                                     disabled={isSubmitting}
                                     toggle={toggle}
                                    />
                                </Row>
                            </Container>
                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    );
}

LessonModal.propTypes = {
    /**Function to make add lesson api call */
    addLesson: PropTypes.func.isRequired,
    /**Function to make api call to update lesson */
    updateLessonFunction: PropTypes.func.isRequired,
    /**if want to update then have to pass the lesson object to be updated */
    updateLesson: PropTypes.object,
    /**variable indicate if the should be opened or closed */
    isOpen: PropTypes.bool.isRequired,
    /**indicate which course to add the new lesson or edit */
    courseID: PropTypes.number.isRequired
}

export default withDirection(LessonModal);