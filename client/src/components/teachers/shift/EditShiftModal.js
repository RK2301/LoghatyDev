import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import dayjs from 'dayjs';
import * as Validators from '../../validators';
import { GetTimeFromDateAsHoursAndMin, formatDateTimeWithSeconds, formatTheDate } from '../../services';
import { MobileDatePicker, TimePicker } from '@mui/x-date-pickers';
import { layout, mobilePaper } from '../../materialUiOverride';
import Feedback from '../../feedback/Feedback';
import { Typography } from '@mui/material';

const EditShiftModal = ({ isOpen, toggle, start_shift, end_shift, teacher_id, teacher_name,
    updateShift }) => {

    const { t } = useTranslation();
    const [startDateError, setStartDateError] = useState(null);
    const [startTimeError, setStartTimeError] = useState(null);
    const [endDateError, setEndDateError] = useState(null);
    const [endTimeError, setEndTimeError] = useState(null);

    const validate = (values) => {
        const errors = {};

        if (values.end_date || values.end_time) {
            Validators.required(values.end_date, 'end_date', errors);
            Validators.required(values.end_time, 'end_time', errors);
        }

        return errors;
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            backdropTransition={{ timeout: 700 }} modalTransition={{ timeout: 500 }}
            centered scrollable>
            <ModalHeader toggle={toggle} className='modal-header'>
                {t('updateShift')}
            </ModalHeader>

            <ModalBody>
                <Row className='mb-3'>
                    <Typography variant='body2'>
                        { teacher_name }
                    </Typography>
                </Row>

                <Formik
                    initialValues={{
                        start_date: dayjs(start_shift),
                        start_time: dayjs(start_shift),
                        end_date: end_shift ? dayjs(end_shift) : null,
                        end_time: end_shift ? dayjs(end_shift) : null
                    }}

                    validate={validate}
                    onSubmit={(values, { setSubmitting }) => {
                        setSubmitting(true);

                        updateShift(`${formatTheDate(values.start_date)} ${GetTimeFromDateAsHoursAndMin(new Date(values.start_time))}`,
                            formatDateTimeWithSeconds(start_shift), `${formatTheDate(values.end_date)} ${GetTimeFromDateAsHoursAndMin(new Date(values.end_time))}`,
                             teacher_id, setSubmitting);
                    }}
                >
                    {({ isSubmitting, errors, touched, setFieldValue }) => (
                        <Form>
                            <Container fluid>
                                <Row>
                                    <Col xs={8}>
                                        <Field
                                            as={MobileDatePicker}
                                            name='start_date'
                                            label={t('entryDate')}
                                            onChange={(value) => setFieldValue('start_date', value)}
                                            onError={(err) => setStartDateError(err)}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    margin: 'dense',
                                                    fullWidth: true,
                                                    helperText: <ErrorMessage name='start_date' />,
                                                    error: touched.start_date && errors.start_date,
                                                    onBlur: () => { touched.start_date = true },
                                                },
                                                mobilePaper: mobilePaper,
                                                layout: layout
                                            }}
                                        />
                                    </Col>

                                    <Col xs={4}>
                                        <Field
                                            as={TimePicker}
                                            name={'start_time'}
                                            onChange={(value) => setFieldValue('start_time', value)}
                                            onError={(err) => setStartTimeError(err)}
                                            format="HH:mm"
                                            ampm={false}
                                            label={t('entryTime')}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    margin: 'dense',
                                                    onBlur: () => touched.start_time = true,
                                                    error: (errors.start_time && touched.start_time),
                                                    helperText: <ErrorMessage name={`start_time`} />,
                                                },
                                                mobilePaper: mobilePaper,
                                                desktopPaper: mobilePaper
                                            }}
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs={8}>
                                        <Field
                                            as={MobileDatePicker}
                                            name='end_date'
                                            label={t('exitDate')}
                                            onChange={(value) => setFieldValue('end_date', value)}
                                            onError={(err) => setEndDateError(err)}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    margin: 'dense',
                                                    fullWidth: true,
                                                    helperText: <ErrorMessage name='end_date' />,
                                                    error: touched.end_date && errors.end_date,
                                                    onBlur: () => { touched.end_date = true },
                                                },
                                                mobilePaper: mobilePaper,
                                                layout: layout
                                            }}
                                        />
                                    </Col>

                                    <Col xs={4}>
                                        <Field
                                            as={TimePicker}
                                            name={'end_time'}
                                            onChange={(value) => setFieldValue('end_time', value)}
                                            onError={(err) => setEndTimeError(err)}
                                            format="HH:mm"
                                            ampm={false}
                                            label={t('exitTime')}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    margin: 'dense',
                                                    onBlur: () => touched.end_time = true,
                                                    error: (errors.end_time && touched.end_time),
                                                    helperText: <ErrorMessage name={`end_time`} />,
                                                },
                                                mobilePaper: mobilePaper,
                                                desktopPaper: mobilePaper
                                            }}
                                        />
                                    </Col>
                                </Row>

                                <Feedback btnText={t('updateShift')} disabled={isSubmitting} toggle={toggle} />
                            </Container>
                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    )
}

EditShiftModal.propTypes = {
    /**function make api call to update a shift start and end time */
    updateShift: PropTypes.func.isRequired
}

export default EditShiftModal;